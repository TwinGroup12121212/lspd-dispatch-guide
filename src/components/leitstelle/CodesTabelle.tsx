interface Code {
  code: string;
  bedeutung: string;
  highlight?: boolean;
}

interface CodesTabelleProps {
  titel: string;
  codes: Code[];
}

export function CodesTabelle({ titel, codes }: CodesTabelleProps) {
  return (
    <div className="border border-border rounded overflow-hidden">
      <div className="bg-secondary px-3 py-2 text-center border-b border-border">
        <span className="font-bold text-sm">{titel}</span>
      </div>
      <div className="divide-y divide-border/50">
        {codes.map((c) => (
          <div
            key={c.code}
            className={`grid grid-cols-2 gap-2 px-3 py-1.5 text-sm ${
              c.highlight ? "bg-destructive/20" : "bg-card"
            }`}
          >
            <span className="font-medium">{c.bedeutung}</span>
            <span className={`font-mono text-right ${
              c.highlight ? "text-destructive font-bold" : "text-primary"
            }`}>
              {c.code}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
