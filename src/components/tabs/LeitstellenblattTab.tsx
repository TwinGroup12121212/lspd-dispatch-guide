import { useState, useEffect, useRef, useCallback } from "react";
import { Clipboard, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Mitarbeiter {
  id: string;
  name: string;
  dienstnummer: string;
  rang: string;
}

interface Einheit {
  id: string;
  name: string;
  typ: string;
  sort_order: number;
}

interface EinheitRow {
  id: string;
  einheit_id: string;
  mitarbeiter_id: string;
  funker_id: string;
}

export function LeitstellenblattTab() {
  const { isAdmin, user } = useAuth();
  const [mitarbeiter, setMitarbeiter] = useState<Mitarbeiter[]>([]);
  const [einheiten, setEinheiten] = useState<Einheit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [leitstellenblattId, setLeitstellenblattId] = useState<string | null>(null);
  const [supervisorId, setSupervisorId] = useState("");
  const [leitstelleId, setLeitstelleId] = useState("");
  const [hinweise, setHinweise] = useState("");
  const [einheitRows, setEinheitRows] = useState<EinheitRow[]>([]);
  
  // New unit state
  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitTyp, setNewUnitTyp] = useState("Adam");
  const [showNewUnit, setShowNewUnit] = useState(false);
  
  // Save timeout for debouncing
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // While we persist changes (delete+insert), ignore realtime echo to prevent UI flicker/reset
  const isSavingRef = useRef(false);

  // While user is editing (before autosave flush), ignore realtime echo to prevent selections snapping back
  const hasUnsavedChangesRef = useRef(false);

  // Track if initial load is complete to prevent auto-save during init
  const isInitializedRef = useRef(false);
  const leitstellenblattIdRef = useRef<string | null>(null);

  // Keep refs in sync
  useEffect(() => {
    leitstellenblattIdRef.current = leitstellenblattId;
  }, [leitstellenblattId]);

  // Mark as initialized after loading completes
  useEffect(() => {
    if (!isLoading && leitstellenblattId) {
      // Small delay to ensure all state is settled
      const timer = setTimeout(() => {
        isInitializedRef.current = true;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, leitstellenblattId]);

  const collapseDbEinheitenAssignments = useCallback((rows: any[]): EinheitRow[] => {
    const map = new Map<string, EinheitRow>();

    for (const r of rows ?? []) {
      const einheitId = r?.einheit_id ?? "";
      if (!einheitId) continue;

      const next: EinheitRow = {
        id: r.id,
        einheit_id: einheitId,
        mitarbeiter_id: r.mitarbeiter_id ?? "",
        funker_id: r.funker_id ?? "",
      };

      const hasValues = Boolean(next.mitarbeiter_id || next.funker_id);
      if (!map.has(einheitId) || hasValues) {
        // Only overwrite if we actually have data (prevents null-rows from clearing selections)
        map.set(einheitId, next);
      }
    }

    return Array.from(map.values());
  }, []);

  const fetchEinheitenAssignments = useCallback(async () => {
    const currentId = leitstellenblattIdRef.current;
    if (!currentId) return;

    const { data: einheitenData } = await supabase
      .from('leitstellenblatt_einheiten')
      .select('*')
      .eq('leitstellenblatt_id', currentId)
      .order('sort_order');

    if (einheitenData) {
      setEinheitRows(collapseDbEinheitenAssignments(einheitenData));
    }
  }, [collapseDbEinheitenAssignments]);

  useEffect(() => {
    fetchData();
    
    // Set up realtime subscriptions
    const mitarbeiterChannel = supabase
      .channel('mitarbeiter-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mitarbeiter' }, () => {
        fetchMitarbeiter();
      })
      .subscribe();

    const einheitenChannel = supabase
      .channel('einheiten-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'einheiten' }, () => {
        fetchEinheiten();
      })
      .subscribe();

    // Realtime subscription for leitstellenblatt changes from OTHER users only
    const leitstellenblattChannel = supabase
      .channel('leitstellenblatt-realtime')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'leitstellenblatt' 
      }, (payload) => {
        const newData = payload.new as any;
        if (!newData) return;
        
        // Only apply updates from OTHER users
        if (newData.updated_by !== user?.id) {
          setSupervisorId(newData.supervisor_id || "");
          setLeitstelleId(newData.leitstelle_id || "");
          setHinweise(newData.hinweise || "");
        }
      })
      .subscribe();

    // Realtime subscription for einheiten assignments from OTHER users
    const einheitenAssignmentsChannel = supabase
      .channel('leitstellenblatt-einheiten-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'leitstellenblatt_einheiten' 
       }, () => {
         // Don't refetch while we're saving OR while we have local unsaved edits, otherwise selections can snap back
         if (leitstellenblattIdRef.current && !isSavingRef.current && !hasUnsavedChangesRef.current) {
           fetchEinheitenAssignments();
         }
       })
      .subscribe();

    return () => {
      supabase.removeChannel(mitarbeiterChannel);
      supabase.removeChannel(einheitenChannel);
      supabase.removeChannel(leitstellenblattChannel);
      supabase.removeChannel(einheitenAssignmentsChannel);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [fetchEinheitenAssignments, user?.id]);

  // Auto-save when form data changes - only after initialization
  useEffect(() => {
    if (!leitstellenblattId || isLoading || !isInitializedRef.current) return;
    
    // Clear previous timeout
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    // Set new timeout to save after 800ms of no changes
    saveTimeoutRef.current = setTimeout(() => {
      void saveLeitstellenblatt().finally(() => {
        saveTimeoutRef.current = null;
      });
    }, 800);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [supervisorId, leitstelleId, hinweise, einheitRows]);

  const fetchMitarbeiter = async () => {
    const { data, error } = await supabase
      .from('mitarbeiter')
      .select('id, name, dienstnummer, rang')
      .eq('status', 'Aktiv')
      .order('rang');
    
    if (error) {
      toast.error("Fehler beim Laden der Mitarbeiter");
      return;
    }
    setMitarbeiter(data || []);
  };

  const fetchEinheiten = async () => {
    const { data, error } = await supabase
      .from('einheiten')
      .select('*')
      .order('sort_order');
    
    if (error) {
      toast.error("Fehler beim Laden der Einheiten");
      return;
    }
    setEinheiten(data || []);
  };

  const fetchData = async () => {
    await Promise.all([fetchMitarbeiter(), fetchEinheiten(), fetchLeitstellenblatt()]);
    setIsLoading(false);
  };

  const fetchLeitstellenblatt = async () => {
    // Try to get the single leitstellenblatt record (there should only be one)
    const { data: leitstellenblattData, error: leitstellenblattError } = await supabase
      .from('leitstellenblatt')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    if (leitstellenblattError) {
      console.error("Error fetching leitstellenblatt:", leitstellenblattError);
      return;
    }
    
    if (leitstellenblattData) {
      setLeitstellenblattId(leitstellenblattData.id);
      setSupervisorId(leitstellenblattData.supervisor_id || "");
      setLeitstelleId(leitstellenblattData.leitstelle_id || "");
      setHinweise(leitstellenblattData.hinweise || "");
      
      // Fetch the einheit assignments
      const { data: einheitenData } = await supabase
        .from('leitstellenblatt_einheiten')
        .select('*')
        .eq('leitstellenblatt_id', leitstellenblattData.id)
        .order('sort_order');

      if (einheitenData) {
        setEinheitRows(collapseDbEinheitenAssignments(einheitenData));
      }
    } else {
      // Create a new leitstellenblatt record
      const { data: newData, error: createError } = await supabase
        .from('leitstellenblatt')
        .insert({
          supervisor_id: null,
          leitstelle_id: null,
          hinweise: null,
          updated_by: user?.id || null,
        })
        .select()
        .single();
      
      if (createError) {
        console.error("Error creating leitstellenblatt:", createError);
        return;
      }
      
      if (newData) {
        setLeitstellenblattId(newData.id);
      }
    }
  };

  const saveLeitstellenblatt = async () => {
    if (!leitstellenblattId) return;

    isSavingRef.current = true;
    try {
      // Save main leitstellenblatt data
      const { error: mainError } = await supabase
        .from('leitstellenblatt')
        .update({
          supervisor_id: supervisorId || null,
          leitstelle_id: leitstelleId || null,
          hinweise: hinweise || null,
          updated_by: user?.id || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', leitstellenblattId);

      if (mainError) {
        console.error(mainError);
        toast.error("Speichern fehlgeschlagen (Leitstellenblatt)");
        return;
      }

      // Delete old einheit assignments and insert new ones
      const { error: deleteError } = await supabase
        .from('leitstellenblatt_einheiten')
        .delete()
        .eq('leitstellenblatt_id', leitstellenblattId);

      if (deleteError) {
        console.error(deleteError);
        toast.error("Speichern fehlgeschlagen (Einheiten löschen)");
        return;
      }

      // Insert current einheit assignments (deduped + in stable unit order)
      const uniqueByEinheit = new Map<string, EinheitRow>();
      for (let i = einheitRows.length - 1; i >= 0; i--) {
        const r = einheitRows[i];
        if (!r?.einheit_id) continue;

        const hasValues = Boolean(r.mitarbeiter_id || r.funker_id);
        if (!uniqueByEinheit.has(r.einheit_id) || hasValues) {
          uniqueByEinheit.set(r.einheit_id, r);
        }
      }

      const einheitenToInsert = einheiten
        .map((e, index) => {
          const r = uniqueByEinheit.get(e.id);
          if (!r) return null;
          if (!r.mitarbeiter_id && !r.funker_id) return null;
          return {
            leitstellenblatt_id: leitstellenblattId,
            einheit_id: e.id,
            mitarbeiter_id: r.mitarbeiter_id || null,
            funker_id: r.funker_id || null,
            sort_order: index,
          };
        })
        .filter(Boolean) as Array<{
          leitstellenblatt_id: string;
          einheit_id: string;
          mitarbeiter_id: string | null;
          funker_id: string | null;
          sort_order: number;
        }>;

      if (einheitenToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('leitstellenblatt_einheiten')
          .insert(einheitenToInsert);

        if (insertError) {
          console.error(insertError);
          toast.error("Speichern fehlgeschlagen (Einheiten speichern)");
          return;
        }
      }

      // Only mark clean if everything succeeded
      hasUnsavedChangesRef.current = false;
    } finally {
      isSavingRef.current = false;
    }
  };

  // Initialize rows when einheiten are loaded (only if no saved data exists)
  useEffect(() => {
    if (einheiten.length > 0 && einheitRows.length === 0 && !isLoading) {
      setEinheitRows(
        einheiten.map((e) => ({
          id: e.id,
          einheit_id: e.id,
          mitarbeiter_id: "",
          funker_id: "",
        }))
      );
    }
  }, [einheiten, einheitRows.length, isLoading]);

  const handleAddEinheit = async () => {
    if (!newUnitName.trim()) {
      toast.error("Bitte Namen eingeben");
      return;
    }

    const maxOrder = einheiten.reduce((max, e) => Math.max(max, e.sort_order), 0);

    const { data, error } = await supabase
      .from('einheiten')
      .insert({
        name: newUnitName.trim(),
        typ: newUnitTyp,
        sort_order: maxOrder + 1,
      })
      .select()
      .single();

    if (error) {
      toast.error("Fehler beim Erstellen: " + error.message);
      return;
    }

    // Add new row for the unit
    setEinheitRows([...einheitRows, {
      id: data.id,
      einheit_id: data.id,
      mitarbeiter_id: "",
      funker_id: "",
    }]);

    toast.success("Einheit erstellt");
    setNewUnitName("");
    setShowNewUnit(false);
  };

  const handleDeleteEinheit = async (id: string) => {
    const { error } = await supabase
      .from('einheiten')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Fehler beim Löschen: " + error.message);
      return;
    }

    // Remove row for the deleted unit
    setEinheitRows(einheitRows.filter(r => r.einheit_id !== id));

    toast.success("Einheit gelöscht");
  };

  const updateEinheitRow = (einheitId: string, field: keyof EinheitRow, value: string) => {
    hasUnsavedChangesRef.current = true;

    setEinheitRows(prev => {
      // Check if row exists for this einheit
      const existingIndex = prev.findIndex(r => r.einheit_id === einheitId);
      if (existingIndex >= 0) {
        // Update existing row
        return prev.map(r => 
          r.einheit_id === einheitId ? { ...r, [field]: value } : r
        );
      } else {
        // Create new row for this einheit
        return [...prev, {
          id: einheitId,
          einheit_id: einheitId,
          mitarbeiter_id: field === 'mitarbeiter_id' ? value : "",
          funker_id: field === 'funker_id' ? value : "",
        }];
      }
    });
  };

  const getRowForEinheit = (einheitId: string): EinheitRow | undefined => {
    return einheitRows.find(r => r.einheit_id === einheitId);
  };

  const getMitarbeiterDisplay = (id: string): string => {
    const m = mitarbeiter.find(m => m.id === id);
    if (!m) return "";
    return `${m.dienstnummer} ${m.name}`;
  };

  const getEinheitName = (id: string): string => {
    const e = einheiten.find(e => e.id === id);
    return e?.name || "";
  };

  const resetForm = () => {
    setSupervisorId("");
    setLeitstelleId("");
    setHinweise("");
    setEinheitRows(einheiten.map(e => ({
      id: e.id,
      einheit_id: e.id,
      mitarbeiter_id: "",
      funker_id: "",
    })));
  };

  const copyLeitstellenblatt = () => {
    const supervisorDisplay = getMitarbeiterDisplay(supervisorId);
    const leitstelleDisplay = getMitarbeiterDisplay(leitstelleId);
    
    const text = `=== LSPD LEITSTELLENBLATT ===
SUPERVISOR: ${supervisorDisplay || "-"}
LEITSTELLE: ${leitstelleDisplay || "-"}

LAGE / HINWEISE:
${hinweise || "-"}

EINGETEILTE EINHEITEN:
${einheiten
  .map(e => {
    const row = getRowForEinheit(e.id);
    if (!row?.mitarbeiter_id && !row?.funker_id) return null;
    return `${e.name} | ${getMitarbeiterDisplay(row?.mitarbeiter_id || "") || "-"} | ${getMitarbeiterDisplay(row?.funker_id || "") || "-"}`;
  })
  .filter(Boolean)
  .join("\n")}
`;
    navigator.clipboard.writeText(text);
    toast.success("Leitstellenblatt kopiert!");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Lade...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel - Leitstellenblatt */}
      <div className="bg-card/50 border border-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold tracking-wide text-foreground">LEITSTELLENBLATT</h2>
            <p className="text-xs text-muted-foreground">Einsatzübersicht · Funkdisposition</p>
          </div>
          <Badge className="bg-primary/20 text-primary border-primary/30 font-semibold">
            SHIFT ACTIVE
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-muted-foreground font-semibold tracking-wide mb-1.5 block">
              SUPERVISOR
            </label>
            <Select value={supervisorId || "none"} onValueChange={(v) => setSupervisorId(v === "none" ? "" : v)}>
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue placeholder="Mitarbeiter wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-</SelectItem>
                {mitarbeiter.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.dienstnummer} {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-semibold tracking-wide mb-1.5 block">
              LEITSTELLE
            </label>
            <Select value={leitstelleId || "none"} onValueChange={(v) => setLeitstelleId(v === "none" ? "" : v)}>
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue placeholder="Mitarbeiter wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-</SelectItem>
                {mitarbeiter.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.dienstnummer} {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground font-semibold tracking-wide mb-1.5 block">
            LAGE / HINWEISE
          </label>
          <Textarea
            value={hinweise}
            onChange={(e) => setHinweise(e.target.value)}
            placeholder="Kurzlage, Fahndungen, Sonderlagen ..."
            className="bg-secondary/50 border-border min-h-[120px] resize-y"
          />
        </div>
      </div>

      {/* Right Panel - Eingeteilte Einheiten */}
      <div className="bg-card/50 border border-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold tracking-wide text-foreground">EINGETEILTE EINHEITEN</h2>
            <p className="text-xs text-muted-foreground">Rufnamen · Funk · Status</p>
          </div>
          <Badge variant="outline" className="font-semibold">
            UNIT GRID
          </Badge>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 mb-2 px-2">
          <span className="col-span-3 text-xs text-muted-foreground font-semibold tracking-wide">EINHEIT</span>
          <span className="col-span-4 text-xs text-muted-foreground font-semibold tracking-wide">DN + Name</span>
          <span className="col-span-4 text-xs text-muted-foreground font-semibold tracking-wide">Funker</span>
          {isAdmin && <span className="col-span-1"></span>}
        </div>

        {/* Table Rows */}
        <div className="space-y-1.5 mb-4 max-h-[300px] overflow-y-auto">
          {einheiten.map((einheit) => {
            const row = getRowForEinheit(einheit.id);
            return (
              <div key={einheit.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3">
                  <Badge variant="outline" className="font-mono text-xs">
                    {einheit.name}
                  </Badge>
                </div>
                <div className="col-span-4">
                  <Select 
                    value={row?.mitarbeiter_id || "none"} 
                    onValueChange={(v) => updateEinheitRow(einheit.id, "mitarbeiter_id", v === "none" ? "" : v)}
                  >
                    <SelectTrigger className="h-9 text-sm bg-secondary/50 border-border">
                      <SelectValue placeholder="Wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-</SelectItem>
                      {mitarbeiter.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.dienstnummer} {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-4">
                  <Select 
                    value={row?.funker_id || "none"} 
                    onValueChange={(v) => updateEinheitRow(einheit.id, "funker_id", v === "none" ? "" : v)}
                  >
                    <SelectTrigger className="h-9 text-sm bg-secondary/50 border-border">
                      <SelectValue placeholder="Wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-</SelectItem>
                      {mitarbeiter.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.dienstnummer} {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {isAdmin && (
                  <div className="col-span-1 flex justify-end">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Einheit löschen?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Möchtest du "{einheit.name}" wirklich löschen?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteEinheit(einheit.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Löschen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add New Unit */}
        {isAdmin && (
          <div className="mb-4">
            {showNewUnit ? (
              <div className="flex gap-2 items-center p-3 bg-secondary/30 rounded-lg border border-border">
                <Select value={newUnitTyp} onValueChange={setNewUnitTyp}>
                  <SelectTrigger className="w-24 bg-secondary/50 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Adam">Adam</SelectItem>
                    <SelectItem value="Lincoln">Lincoln</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  placeholder="z.B. Adam 4"
                  className="flex-1 bg-secondary/50 border-border"
                />
                <Button onClick={handleAddEinheit} size="sm">
                  Erstellen
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowNewUnit(false)}>
                  Abbrechen
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowNewUnit(true)} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Einheit hinzufügen
              </Button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={resetForm} className="gap-1.5">
            <span className="text-base">🧹</span>
            Tabelle leeren
          </Button>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="lg:col-span-2 flex justify-center gap-3">
        <Button onClick={copyLeitstellenblatt} className="gap-2 px-6">
          <Clipboard className="h-4 w-4" />
          Leitstellenblatt kopieren
        </Button>
        <Button variant="outline" onClick={resetForm} className="gap-2 px-6">
          <span className="text-base">↻</span>
          Formular zurücksetzen
        </Button>
      </div>
    </div>
  );
}
