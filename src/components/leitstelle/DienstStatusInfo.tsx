import { dienstStatusBeschreibungen, rechteVorlesen } from "@/data/leitstellenData";

export function DienstStatusInfo() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="border border-border rounded overflow-hidden">
        <div className="bg-secondary px-3 py-2 text-center border-b border-border">
          <span className="font-bold text-sm">DIENST STATUS</span>
        </div>
        <div className="p-3 bg-card space-y-3">
          {dienstStatusBeschreibungen.map((status) => (
            <div key={status.titel}>
              <h4 className="font-bold text-sm text-primary">{status.titel}</h4>
              <p className="text-xs text-muted-foreground">{status.beschreibung}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-border rounded overflow-hidden">
        <div className="bg-destructive px-3 py-2 text-center border-b border-border">
          <span className="font-bold text-sm text-destructive-foreground">Rechte vorlesen</span>
        </div>
        <div className="p-3 bg-card">
          <p className="text-sm whitespace-pre-line italic text-muted-foreground">
            "{rechteVorlesen}
          </p>
        </div>
      </div>
    </div>
  );
}
