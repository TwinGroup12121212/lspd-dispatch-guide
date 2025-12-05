import { useState, useCallback } from "react";
import { KategorieCard } from "@/components/KategorieCard";
import { Zusammenfassung } from "@/components/Zusammenfassung";
import { strafkatalog, Straftat } from "@/data/strafkatalog";

export default function Strafkatalog() {
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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Strafkatalog</h1>
        <p className="text-sm text-muted-foreground">Wähle Delikte aus um einen Strafzettel zu erstellen</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
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

        <div className="xl:col-span-1">
          <Zusammenfassung
            straftaten={ausgewaehlteStraftaten}
            onRemove={handleRemoveStraftat}
            onClear={handleClear}
          />
        </div>
      </div>
    </div>
  );
}
