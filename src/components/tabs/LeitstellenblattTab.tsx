import { useState, useEffect } from "react";
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
  const { isAdmin } = useAuth();
  const [mitarbeiter, setMitarbeiter] = useState<Mitarbeiter[]>([]);
  const [einheiten, setEinheiten] = useState<Einheit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [supervisorId, setSupervisorId] = useState("");
  const [leitstelleId, setLeitstelleId] = useState("");
  const [hinweise, setHinweise] = useState("");
  const [einheitRows, setEinheitRows] = useState<EinheitRow[]>([]);
  
  // New unit state
  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitTyp, setNewUnitTyp] = useState("Adam");
  const [showNewUnit, setShowNewUnit] = useState(false);

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

    return () => {
      supabase.removeChannel(mitarbeiterChannel);
      supabase.removeChannel(einheitenChannel);
    };
  }, []);

  // Initialize rows when einheiten are loaded
  useEffect(() => {
    if (einheiten.length > 0 && einheitRows.length === 0) {
      setEinheitRows(
        einheiten.map((e) => ({
          id: e.id,
          einheit_id: e.id,
          mitarbeiter_id: "",
          funker_id: "",
        }))
      );
    }
  }, [einheiten]);

  const fetchData = async () => {
    await Promise.all([fetchMitarbeiter(), fetchEinheiten()]);
    setIsLoading(false);
  };

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
    setEinheitRows(einheitRows.map(r => 
      r.einheit_id === einheitId ? { ...r, [field]: value } : r
    ));
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
${einheitRows
  .filter(r => r.mitarbeiter_id || r.funker_id)
  .map(r => `${getEinheitName(r.einheit_id)} | ${getMitarbeiterDisplay(r.mitarbeiter_id) || "-"} | ${getMitarbeiterDisplay(r.funker_id) || "-"}`)
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
            <Select value={supervisorId} onValueChange={setSupervisorId}>
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue placeholder="Mitarbeiter wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">-</SelectItem>
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
            <Select value={leitstelleId} onValueChange={setLeitstelleId}>
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue placeholder="Mitarbeiter wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">-</SelectItem>
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
            const row = einheitRows.find(r => r.einheit_id === einheit.id);
            return (
              <div key={einheit.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3">
                  <Badge variant="outline" className="font-mono text-xs">
                    {einheit.name}
                  </Badge>
                </div>
                <div className="col-span-4">
                  <Select 
                    value={row?.mitarbeiter_id || ""} 
                    onValueChange={(v) => updateEinheitRow(einheit.id, "mitarbeiter_id", v)}
                  >
                    <SelectTrigger className="h-9 text-sm bg-secondary/50 border-border">
                      <SelectValue placeholder="Wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">-</SelectItem>
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
                    value={row?.funker_id || ""} 
                    onValueChange={(v) => updateEinheitRow(einheit.id, "funker_id", v)}
                  >
                    <SelectTrigger className="h-9 text-sm bg-secondary/50 border-border">
                      <SelectValue placeholder="Wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">-</SelectItem>
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
