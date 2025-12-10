import { useState, useCallback, useEffect } from "react";
import { Plus, X, Clipboard, Trash2, Edit2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables, Enums } from "@/integrations/supabase/types";

type Kategorie = Tables<"kategorien">;
type Straftat = Tables<"straftaten">;
type StraftatTyp = Enums<"straftat_typ">;

interface SelectedStraftat extends Straftat {
  uniqueId: string;
}

const getTypColor = (typ: StraftatTyp) => {
  switch (typ) {
    case "Verbrechen":
      return "bg-red-500";
    case "Ordnungswidrigkeit":
      return "bg-green-500";
    case "Verstoß":
      return "bg-yellow-500";
    default:
      return "bg-red-500";
  }
};

export function StrafkatalogTab() {
  const { isAdmin } = useAuth();
  const [kategorien, setKategorien] = useState<Kategorie[]>([]);
  const [straftaten, setStraftaten] = useState<Straftat[]>([]);
  const [ausgewaehlteStraftaten, setAusgewaehlteStraftaten] = useState<SelectedStraftat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Edit state
  const [editingStraftat, setEditingStraftat] = useState<Straftat | null>(null);
  const [newStraftatKategorie, setNewStraftatKategorie] = useState<string>("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newStraftat, setNewStraftat] = useState({
    name: "",
    typ: "Verbrechen" as StraftatTyp,
    geldstrafe: 0,
    haftzeit: 0,
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      const [kategorienRes, straftatenRes] = await Promise.all([
        supabase.from("kategorien").select("*").order("sort_order"),
        supabase.from("straftaten").select("*").order("sort_order"),
      ]);

      if (kategorienRes.data) setKategorien(kategorienRes.data);
      if (straftatenRes.data) setStraftaten(straftatenRes.data);
      
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const addStraftat = useCallback((straftat: Straftat) => {
    setAusgewaehlteStraftaten((prev) => [
      ...prev,
      { ...straftat, uniqueId: `${straftat.id}-${Date.now()}` },
    ]);
  }, []);

  const removeStraftat = useCallback((uniqueId: string) => {
    setAusgewaehlteStraftaten((prev) => prev.filter((s) => s.uniqueId !== uniqueId));
  }, []);

  const clearAll = useCallback(() => {
    setAusgewaehlteStraftaten([]);
  }, []);

  const gesamtStrafe = ausgewaehlteStraftaten.reduce((sum, s) => sum + s.geldstrafe, 0);
  const gesamtHaftzeit = ausgewaehlteStraftaten.reduce((sum, s) => sum + s.haftzeit, 0);

  const copyZusammenfassung = () => {
    if (ausgewaehlteStraftaten.length === 0) {
      toast.error("Keine Delikte ausgewählt!");
      return;
    }
    const text = `=== STRAFZETTEL ===
ANZAHL DELIKTE: ${ausgewaehlteStraftaten.length}
GESAMTSTRAFE: ${gesamtStrafe.toLocaleString("de-DE")} $
GESAMT-HAFTZEIT: ${gesamtHaftzeit} Monate

DELIKTLISTE:
${ausgewaehlteStraftaten.map((s) => `- ${s.name}: ${s.haftzeit} Monate${s.geldstrafe > 0 ? ` - $${s.geldstrafe.toLocaleString("de-DE")} Geldstrafe` : ""}`).join("\n")}
`;
    navigator.clipboard.writeText(text);
    toast.success("Zusammenfassung kopiert!");
  };

  // Admin functions
  const handleAddStraftat = async () => {
    if (!newStraftatKategorie || !newStraftat.name) {
      toast.error("Bitte alle Felder ausfüllen");
      return;
    }

    const { data, error } = await supabase
      .from("straftaten")
      .insert({
        kategorie_id: newStraftatKategorie,
        name: newStraftat.name,
        typ: newStraftat.typ,
        geldstrafe: newStraftat.geldstrafe,
        haftzeit: newStraftat.haftzeit,
        sort_order: straftaten.filter(s => s.kategorie_id === newStraftatKategorie).length + 1,
      })
      .select()
      .single();

    if (error) {
      toast.error("Fehler beim Hinzufügen: " + error.message);
      return;
    }

    if (data) {
      setStraftaten([...straftaten, data]);
      setNewStraftat({ name: "", typ: "Verbrechen", geldstrafe: 0, haftzeit: 0 });
      setNewStraftatKategorie("");
      setShowAddDialog(false);
      toast.success("Vergehen hinzugefügt!");
    }
  };

  const handleUpdateStraftat = async () => {
    if (!editingStraftat) return;

    const { error } = await supabase
      .from("straftaten")
      .update({
        name: editingStraftat.name,
        typ: editingStraftat.typ,
        geldstrafe: editingStraftat.geldstrafe,
        haftzeit: editingStraftat.haftzeit,
      })
      .eq("id", editingStraftat.id);

    if (error) {
      toast.error("Fehler beim Aktualisieren: " + error.message);
      return;
    }

    setStraftaten(straftaten.map(s => s.id === editingStraftat.id ? editingStraftat : s));
    setEditingStraftat(null);
    toast.success("Vergehen aktualisiert!");
  };

  const handleDeleteStraftat = async (id: string) => {
    const { error } = await supabase.from("straftaten").delete().eq("id", id);

    if (error) {
      toast.error("Fehler beim Löschen: " + error.message);
      return;
    }

    setStraftaten(straftaten.filter(s => s.id !== id));
    toast.success("Vergehen gelöscht!");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Lade Strafkatalog...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Zusammenfassung oben */}
      <div className="bg-card/50 border border-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold tracking-wide text-foreground">ZUSAMMENFASSUNG</h2>
            <p className="text-xs text-muted-foreground">Ausgewählte Straftaten</p>
          </div>
          <Badge className="bg-destructive/20 text-destructive border-destructive/30 font-semibold">
            TICKET SUMMARY
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-secondary/30 rounded-md p-3">
            <div className="text-xs text-muted-foreground font-semibold tracking-wide mb-1">
              ANZAHL DELIKTE
            </div>
            <div className="text-2xl font-bold text-primary">{ausgewaehlteStraftaten.length}</div>
          </div>
          <div className="bg-secondary/30 rounded-md p-3">
            <div className="text-xs text-muted-foreground font-semibold tracking-wide mb-1">
              GESAMTSTRAFE
            </div>
            <div className="text-2xl font-bold text-foreground">{gesamtStrafe.toLocaleString("de-DE")} $</div>
          </div>
          <div className="bg-secondary/30 rounded-md p-3">
            <div className="text-xs text-muted-foreground font-semibold tracking-wide mb-1">
              GESAMT-HAFTZEIT
            </div>
            <div className="text-2xl font-bold text-primary">{gesamtHaftzeit} Monate</div>
          </div>
        </div>

        {/* Deliktliste */}
        {ausgewaehlteStraftaten.length > 0 && (
          <div className="mb-4">
            <div className="bg-secondary/30 rounded-md p-3">
              <ScrollArea className="max-h-[150px]">
                <div className="space-y-1">
                  {ausgewaehlteStraftaten.map((straftat) => (
                    <div
                      key={straftat.uniqueId}
                      className="flex items-center justify-between p-2 bg-secondary/50 rounded group"
                    >
                      <span className="text-sm text-foreground">{straftat.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {straftat.haftzeit} Monate{straftat.geldstrafe > 0 ? ` - $${straftat.geldstrafe.toLocaleString("de-DE")}` : ""}
                        </span>
                        <button
                          onClick={() => removeStraftat(straftat.uniqueId)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-3">
          <Button onClick={copyZusammenfassung} className="gap-2">
            <Clipboard className="h-4 w-4" />
            Zusammenfassung kopieren
          </Button>
          <Button variant="destructive" onClick={clearAll} className="gap-2">
            <Trash2 className="h-4 w-4" />
            Auswahl löschen
          </Button>
        </div>
      </div>

      {/* Kategorien mit Straftaten */}
      {kategorien.map((kategorie) => {
        const kategorieStraftaten = straftaten.filter(s => s.kategorie_id === kategorie.id);
        
        return (
          <div key={kategorie.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">{kategorie.name}</h3>
              
              {isAdmin && (
                <Dialog open={showAddDialog && newStraftatKategorie === kategorie.id} onOpenChange={(open) => {
                  setShowAddDialog(open);
                  if (open) setNewStraftatKategorie(kategorie.id);
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1.5 bg-red-500 hover:bg-red-600">
                      <Plus className="h-3.5 w-3.5" />
                      Vergehen hinzufügen
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle>Neues Vergehen hinzufügen</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="text-sm font-medium">Name</label>
                        <Input
                          value={newStraftat.name}
                          onChange={(e) => setNewStraftat({ ...newStraftat, name: e.target.value })}
                          placeholder="Name des Vergehens"
                          className="bg-secondary/50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Typ</label>
                        <Select
                          value={newStraftat.typ}
                          onValueChange={(v) => setNewStraftat({ ...newStraftat, typ: v as StraftatTyp })}
                        >
                          <SelectTrigger className="bg-secondary/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Verbrechen">Verbrechen</SelectItem>
                            <SelectItem value="Ordnungswidrigkeit">Ordnungswidrigkeit</SelectItem>
                            <SelectItem value="Verstoß">Verstoß</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Haftzeit (Monate)</label>
                          <Input
                            type="number"
                            value={newStraftat.haftzeit}
                            onChange={(e) => setNewStraftat({ ...newStraftat, haftzeit: parseInt(e.target.value) || 0 })}
                            className="bg-secondary/50"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Geldstrafe ($)</label>
                          <Input
                            type="number"
                            value={newStraftat.geldstrafe}
                            onChange={(e) => setNewStraftat({ ...newStraftat, geldstrafe: parseInt(e.target.value) || 0 })}
                            className="bg-secondary/50"
                          />
                        </div>
                      </div>
                      <Button onClick={handleAddStraftat} className="w-full">
                        Hinzufügen
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {kategorieStraftaten.map((straftat) => (
                <div
                  key={straftat.id}
                  className={`${getTypColor(straftat.typ)} rounded-md p-3 cursor-pointer hover:opacity-90 transition-opacity relative group`}
                  onClick={() => !editingStraftat && addStraftat(straftat)}
                >
                  {editingStraftat?.id === straftat.id ? (
                    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={editingStraftat.name}
                        onChange={(e) => setEditingStraftat({ ...editingStraftat, name: e.target.value })}
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/50 h-8"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          value={editingStraftat.haftzeit}
                          onChange={(e) => setEditingStraftat({ ...editingStraftat, haftzeit: parseInt(e.target.value) || 0 })}
                          placeholder="Monate"
                          className="bg-white/20 border-white/30 text-white placeholder:text-white/50 h-8"
                        />
                        <Input
                          type="number"
                          value={editingStraftat.geldstrafe}
                          onChange={(e) => setEditingStraftat({ ...editingStraftat, geldstrafe: parseInt(e.target.value) || 0 })}
                          placeholder="Geldstrafe"
                          className="bg-white/20 border-white/30 text-white placeholder:text-white/50 h-8"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleUpdateStraftat} className="bg-white/20 hover:bg-white/30 h-7">
                          <Save className="h-3 w-3 mr-1" /> Speichern
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingStraftat(null)} className="text-white hover:bg-white/20 h-7">
                          Abbrechen
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium text-sm text-white leading-tight pr-2">{straftat.name}</span>
                        <span className="text-xs text-white/90 whitespace-nowrap">{straftat.typ}</span>
                      </div>
                      <div className="text-xs text-white/80">
                        {straftat.haftzeit > 0 && <span>{straftat.haftzeit} Monate</span>}
                        {straftat.haftzeit > 0 && straftat.geldstrafe > 0 && <span> - </span>}
                        {straftat.geldstrafe > 0 && <span>${straftat.geldstrafe.toLocaleString("de-DE")} Geldstrafe</span>}
                      </div>
                      
                      {isAdmin && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setEditingStraftat(straftat)}
                            className="p-1 bg-white/20 rounded hover:bg-white/30"
                          >
                            <Edit2 className="h-3 w-3 text-white" />
                          </button>
                          <button
                            onClick={() => handleDeleteStraftat(straftat.id)}
                            className="p-1 bg-white/20 rounded hover:bg-red-600"
                          >
                            <Trash2 className="h-3 w-3 text-white" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
