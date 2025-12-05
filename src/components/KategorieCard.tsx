import { Kategorie, Straftat } from "@/data/strafkatalog";
import { cn } from "@/lib/utils";
import { Check, Plus } from "lucide-react";

interface KategorieCardProps {
  kategorie: Kategorie;
  ausgewaehlteStraftaten: string[];
  onToggleStraftat: (straftat: Straftat) => void;
}

export function KategorieCard({ kategorie, ausgewaehlteStraftaten, onToggleStraftat }: KategorieCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="bg-secondary/50 px-4 py-3 border-b border-border">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span>{kategorie.icon}</span>
          <span>{kategorie.name}</span>
        </h2>
      </div>
      <div className="p-2">
        {kategorie.straftaten.map((straftat) => {
          const isSelected = ausgewaehlteStraftaten.includes(straftat.id);
          return (
            <button
              key={straftat.id}
              onClick={() => onToggleStraftat(straftat)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md transition-all duration-200 flex items-center justify-between group",
                isSelected
                  ? "bg-primary/20 border border-primary/50"
                  : "hover:bg-secondary/50 border border-transparent"
              )}
            >
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium truncate",
                  isSelected && "text-primary"
                )}>
                  {straftat.name}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono mt-0.5">
                  <span className="text-warning">${straftat.geldstrafe.toLocaleString()}</span>
                  {straftat.haftzeit > 0 && (
                    <span className="text-destructive">{straftat.haftzeit} Min Haft</span>
                  )}
                  {straftat.punkte && (
                    <span className="text-muted-foreground">{straftat.punkte} Pkt</span>
                  )}
                </div>
              </div>
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary group-hover:bg-primary/20"
              )}>
                {isSelected ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
