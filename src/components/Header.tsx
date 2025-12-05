import { Shield, Radio } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Shield className="w-12 h-12 text-primary" />
              <div className="absolute inset-0 blur-lg bg-primary/30 -z-10" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-foreground">
                <span className="text-primary text-glow">LSPD</span> LEITSTELLE
              </h1>
              <p className="text-sm text-muted-foreground font-mono">
                Los Santos Police Department • Strafkatalog System
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-success">
            <Radio className="w-4 h-4 animate-pulse-glow" />
            <span className="text-sm font-mono">SYSTEM ONLINE</span>
          </div>
        </div>
      </div>
    </header>
  );
}
