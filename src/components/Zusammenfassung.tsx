import { Straftat } from "@/data/strafkatalog";
import { X, FileText, Clock, DollarSign, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ZusammenfassungProps {
  straftaten: Straftat[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function Zusammenfassung({ straftaten, onRemove, onClear }: ZusammenfassungProps) {
  const gesamtGeldstrafe = straftaten.reduce((sum, s) => sum + s.geldstrafe, 0);
  const gesamtHaftzeit = straftaten.reduce((sum, s) => sum + s.haftzeit, 0);
  const gesamtPunkte = straftaten.reduce((sum, s) => sum + (s.punkte || 0), 0);

  const copyToClipboard = () => {
    const text = `=== LSPD STRAFZETTEL ===
    
Delikte:
${straftaten.map(s => `- ${s.name} ($${s.geldstrafe.toLocaleString()}${s.haftzeit > 0 ? `, ${s.haftzeit} Min Haft` : ''})`).join('\n')}

---
Gesamtstrafe: $${gesamtGeldstrafe.toLocaleString()}
Haftzeit: ${gesamtHaftzeit} Minuten
${gesamtPunkte > 0 ? `Punkte: ${gesamtPunkte}` : ''}
===`;
    
    navigator.clipboard.writeText(text);
    toast.success("Strafzettel kopiert!");
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden sticky top-24">
      <div className="bg-primary/10 px-4 py-3 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2 text-primary">
          <FileText className="w-5 h-5" />
          Strafzettel
        </h2>
        {straftaten.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="p-4">
        {straftaten.length === 0 ? (
          <p className="text-muted-foreground text-center py-8 text-sm">
            Keine Delikte ausgewählt
          </p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {straftaten.map((straftat, index) => (
              <div
                key={`${straftat.id}-${index}`}
                className="flex items-center justify-between bg-secondary/30 rounded px-3 py-2 animate-slide-in"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{straftat.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    ${straftat.geldstrafe.toLocaleString()}
                    {straftat.haftzeit > 0 && ` • ${straftat.haftzeit}m`}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(straftat.id)}
                  className="p-1 hover:bg-destructive/20 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}

        {straftaten.length > 0 && (
          <>
            <div className="border-t border-border mt-4 pt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  Geldstrafe
                </span>
                <span className="font-mono font-bold text-warning">
                  ${gesamtGeldstrafe.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Haftzeit
                </span>
                <span className="font-mono font-bold text-destructive">
                  {gesamtHaftzeit} Minuten
                </span>
              </div>
              {gesamtPunkte > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Punkte</span>
                  <span className="font-mono font-bold">{gesamtPunkte}</span>
                </div>
              )}
            </div>

            <Button
              onClick={copyToClipboard}
              className="w-full mt-4 glow-primary"
            >
              <Copy className="w-4 h-4 mr-2" />
              Strafzettel kopieren
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
