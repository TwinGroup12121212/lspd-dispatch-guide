import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { fahrzeugOptionen, statusOptionen } from "@/data/leitstellenData";

interface StreifeKarteProps {
  name: string;
  fahrzeug: string;
  fahrzeugStatus: string;
  fahrer: string;
  funker: string;
  beifahrer?: string;
  onUpdate: (field: string, value: string) => void;
  isSupervisor?: boolean;
}

export function StreifeKarte({ 
  name, 
  fahrzeug, 
  fahrzeugStatus,
  fahrer, 
  funker, 
  beifahrer, 
  onUpdate,
  isSupervisor = false 
}: StreifeKarteProps) {
  return (
    <div className="border border-border rounded overflow-hidden">
      <div className={`${isSupervisor ? "bg-cyan-700" : "bg-cyan-600"} px-3 py-1.5 text-center`}>
        <span className="font-bold text-sm text-primary-foreground">{name}</span>
      </div>
      <div className="p-2 bg-card space-y-1">
        <div className="grid grid-cols-3 gap-1">
          <Select value={fahrzeug} onValueChange={(v) => onUpdate("fahrzeug", v)}>
            <SelectTrigger className="h-7 text-xs bg-cyan-700/80 text-primary-foreground border-0">
              <SelectValue placeholder="Fahrzeug" />
            </SelectTrigger>
            <SelectContent>
              {fahrzeugOptionen.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={fahrzeugStatus} onValueChange={(v) => onUpdate("fahrzeugStatus", v)}>
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptionen.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={fahrzeugStatus} onValueChange={(v) => onUpdate("fahrzeugStatus2", v)}>
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptionen.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-1">
          <Input
            value={fahrer}
            onChange={(e) => onUpdate("fahrer", e.target.value)}
            className="h-7 text-xs bg-secondary/50"
            placeholder=""
          />
          <div className="bg-secondary/80 px-2 h-7 flex items-center rounded text-xs">
            {isSupervisor ? <span className="text-red-500 font-bold">SV</span> : "Fahrer"}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-1">
          <Input
            value={funker}
            onChange={(e) => onUpdate("funker", e.target.value)}
            className="h-7 text-xs bg-secondary/50"
            placeholder=""
          />
          <div className="bg-secondary/80 px-2 h-7 flex items-center rounded text-xs">
            {isSupervisor ? <span className="text-red-500 font-bold">SV</span> : "Funker"}
          </div>
        </div>

        {(beifahrer !== undefined || !isSupervisor) && (
          <div className="grid grid-cols-2 gap-1">
            <Input
              value={beifahrer || ""}
              onChange={(e) => onUpdate("beifahrer", e.target.value)}
              className="h-7 text-xs bg-secondary/50"
              placeholder=""
            />
            <div className="bg-secondary/80 px-2 h-7 flex items-center rounded text-xs">
              {isSupervisor ? <span className="text-red-500 font-bold">SV</span> : "Beifahrer"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
