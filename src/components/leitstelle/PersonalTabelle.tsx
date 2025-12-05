import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { statusOptionen } from "@/data/leitstellenData";

interface PersonalZeile {
  id: string;
  rangDnName: string;
  hinweis: string;
  status: string;
}

interface PersonalTabelleProps {
  titel: string;
  titelFarbe?: string;
  zeilen: PersonalZeile[];
  onUpdate: (id: string, field: keyof PersonalZeile, value: string) => void;
  showHinweis?: boolean;
}

export function PersonalTabelle({ titel, titelFarbe = "bg-primary", zeilen, onUpdate, showHinweis = true }: PersonalTabelleProps) {
  return (
    <div className="border border-border rounded overflow-hidden">
      <div className={`${titelFarbe} px-3 py-1.5 text-center`}>
        <span className="font-bold text-sm text-primary-foreground">{titel}</span>
      </div>
      <div className="bg-secondary/30 px-2 py-1 grid grid-cols-12 gap-1 text-xs text-muted-foreground border-b border-border">
        <span className="col-span-5">Rang | DN | Name</span>
        {showHinweis && <span className="col-span-4">Hinweis</span>}
        <span className={showHinweis ? "col-span-3" : "col-span-7"}>Status</span>
      </div>
      <div className="divide-y divide-border/50">
        {zeilen.map((zeile) => (
          <div key={zeile.id} className="grid grid-cols-12 gap-1 p-1 bg-card hover:bg-secondary/20">
            <Input
              value={zeile.rangDnName}
              onChange={(e) => onUpdate(zeile.id, "rangDnName", e.target.value)}
              className="col-span-5 h-7 text-xs bg-secondary/50 border-border"
              placeholder="z.B. CoP | 01 | Name"
            />
            {showHinweis && (
              <Input
                value={zeile.hinweis}
                onChange={(e) => onUpdate(zeile.id, "hinweis", e.target.value)}
                className="col-span-4 h-7 text-xs bg-secondary/50 border-border"
              />
            )}
            <Select value={zeile.status} onValueChange={(v) => onUpdate(zeile.id, "status", v)}>
              <SelectTrigger className={`${showHinweis ? "col-span-3" : "col-span-7"} h-7 text-xs`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptionen.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
}
