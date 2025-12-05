import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { KategorieCard } from "@/components/KategorieCard";
import { Zusammenfassung } from "@/components/Zusammenfassung";
import { strafkatalog, Straftat } from "@/data/strafkatalog";

const Index = () => {
  const [ausgewaehlteStraftaten, setAusgewaehlteStraftaten] = useState<Straftat[]>([]);
  const [ausgewaehlteIds, setAusgewaehlteIds] = useState<string[]>([]);

  const handleToggleStraftat = useCallback((straftat: Straftat) => {
    setAusgewaehlteIds((prev) => {
      if (prev.includes(straftat.id)) {
        setAusgewaehlteStraftaten((s) => s.filter((item) => item.id !== straftat.id));
        return prev.filter((id) => id !== straftat.id);
      } else {
        setAusgewaehlteStraftaten((s) => [...s, straftat]);
        return [...prev, straftat.id];
      }
    });
  }, []);

  const handleRemoveStraftat = useCallback((id: string) => {
    setAusgewaehlteIds((prev) => prev.filter((i) => i !== id));
    setAusgewaehlteStraftaten((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleClear = useCallback(() => {
    setAusgewaehlteIds([]);
    setAusgewaehlteStraftaten([]);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {strafkatalog.map((kategorie) => (
                <KategorieCard
                  key={kategorie.id}
                  kategorie={kategorie}
                  ausgewaehlteStraftaten={ausgewaehlteIds}
                  onToggleStraftat={handleToggleStraftat}
                />
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Zusammenfassung
              straftaten={ausgewaehlteStraftaten}
              onRemove={handleRemoveStraftat}
              onClear={handleClear}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-8 py-4">
        <p className="text-center text-sm text-muted-foreground font-mono">
          LSPD LEITSTELLE v1.0 • Alle Angaben ohne Gewähr
        </p>
      </footer>
    </div>
  );
};

export default Index;
