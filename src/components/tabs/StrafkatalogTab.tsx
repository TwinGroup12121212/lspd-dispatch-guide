import { useState, useCallback } from "react";
import { Plus, X, Clipboard, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { strafkatalog, Straftat, StraftatTyp } from "@/data/strafkatalog";

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
  const [ausgewaehlteStraftaten, setAusgewaehlteStraftaten] = useState<Straftat[]>([]);

  const addStraftat = useCallback((straftat: Straftat) => {
    setAusgewaehlteStraftaten((prev) => [...prev, { ...straftat, id: `${straftat.id}-${Date.now()}` }]);
  }, []);

  const removeStraftat = useCallback((id: string) => {
    setAusgewaehlteStraftaten((prev) => prev.filter((s) => s.id !== id));
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
                      key={straftat.id}
                      className="flex items-center justify-between p-2 bg-secondary/50 rounded group"
                    >
                      <span className="text-sm text-foreground">{straftat.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {straftat.haftzeit} Monate{straftat.geldstrafe > 0 ? ` - $${straftat.geldstrafe.toLocaleString("de-DE")}` : ""}
                        </span>
                        <button
                          onClick={() => removeStraftat(straftat.id)}
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
      {strafkatalog.map((kategorie) => (
        <div key={kategorie.id} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">{kategorie.name}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {kategorie.straftaten.map((straftat) => (
              <div
                key={straftat.id}
                onClick={() => addStraftat(straftat)}
                className={`${getTypColor(straftat.typ)} rounded-md p-3 cursor-pointer hover:opacity-90 transition-opacity`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-medium text-sm text-white leading-tight pr-2">{straftat.name}</span>
                  <span className="text-xs text-white/90 whitespace-nowrap">{straftat.typ}</span>
                </div>
                <div className="text-xs text-white/80">
                  {straftat.haftzeit > 0 && <span>{straftat.haftzeit} Monate</span>}
                  {straftat.haftzeit > 0 && straftat.geldstrafe > 0 && <span> - </span>}
                  {straftat.geldstrafe > 0 && <span>${straftat.geldstrafe.toLocaleString("de-DE")} Geldstrafe</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
