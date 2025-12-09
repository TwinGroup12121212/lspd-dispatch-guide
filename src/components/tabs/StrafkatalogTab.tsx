import { useState, useCallback } from "react";
import { Plus, X, Clipboard, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { strafkatalog, Straftat, Kategorie } from "@/data/strafkatalog";

export function StrafkatalogTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(strafkatalog[0]?.id || "");
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
GESAMT-HAFTZEIT: ${gesamtHaftzeit} Min.

DELIKTLISTE:
${ausgewaehlteStraftaten.map((s) => `- ${s.name}: ${s.geldstrafe.toLocaleString("de-DE")} $ / ${s.haftzeit} Min.`).join("\n")}
`;
    navigator.clipboard.writeText(text);
    toast.success("Zusammenfassung kopiert!");
  };

  const currentCategory = strafkatalog.find((k) => k.id === selectedCategory);
  
  const filteredStraftaten = currentCategory?.straftaten.filter((s) =>
    searchQuery === "" || s.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const categoryIcons: Record<string, string> = {
    verkehr: "🚗",
    gewalt: "👊",
    eigentum: "🏠",
    waffen: "🔫",
    drogen: "💊",
    staat: "⚖️",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel - Strafkatalog */}
      <div className="bg-card/50 border border-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold tracking-wide text-foreground">STRAFKATALOG</h2>
            <p className="text-xs text-muted-foreground">Delikte auswählen · Beträge & Haftzeit</p>
          </div>
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 font-semibold">
            LOCK MODE B2
          </Badge>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Delikt suchen ... z. B. "Mord", "Flucht", "Drogen"'
            className="pl-10 pr-10 bg-secondary/50 border-border"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground font-semibold tracking-wide mb-2 block">
            KATEGORIEN
          </label>
          <div className="flex flex-wrap gap-2">
            {strafkatalog.map((kategorie) => (
              <button
                key={kategorie.id}
                onClick={() => setSelectedCategory(kategorie.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === kategorie.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <span>{categoryIcons[kategorie.id] || "⚖️"}</span>
                {kategorie.name}
              </button>
            ))}
          </div>
        </div>

        {/* Delikte List */}
        <div>
          <label className="text-xs text-muted-foreground font-semibold tracking-wide mb-2 block">
            DELIKTE
          </label>
          <ScrollArea className="h-[350px] pr-2">
            <div className="space-y-1">
              {filteredStraftaten.map((straftat) => (
                <div
                  key={straftat.id}
                  className="flex items-center justify-between p-3 bg-secondary/30 hover:bg-secondary/50 rounded-md transition-colors group"
                >
                  <span className="font-medium text-sm text-foreground">{straftat.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {straftat.geldstrafe.toLocaleString("de-DE")} $ {straftat.haftzeit} Min.
                    </span>
                    <button
                      onClick={() => addStraftat(straftat)}
                      className="h-7 w-7 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors"
                    >
                      <Plus className="h-4 w-4 text-primary-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Right Panel - Zusammenfassung */}
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
            <div className="text-2xl font-bold text-primary">{gesamtHaftzeit} Min.</div>
          </div>
        </div>

        {/* Deliktliste */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground font-semibold tracking-wide mb-2 block">
            DELIKTLISTE
          </label>
          <div className="bg-secondary/30 rounded-md p-3 min-h-[200px]">
            {ausgewaehlteStraftaten.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Noch keine Delikte hinzugefügt. Wähle links eine Kategorie und füge Straftaten hinzu.
              </p>
            ) : (
              <ScrollArea className="h-[180px]">
                <div className="space-y-1">
                  {ausgewaehlteStraftaten.map((straftat) => (
                    <div
                      key={straftat.id}
                      className="flex items-center justify-between p-2 bg-secondary/50 rounded group"
                    >
                      <span className="text-sm text-foreground">{straftat.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {straftat.geldstrafe.toLocaleString("de-DE")} $ / {straftat.haftzeit} Min.
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
            )}
          </div>
        </div>

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
    </div>
  );
}
