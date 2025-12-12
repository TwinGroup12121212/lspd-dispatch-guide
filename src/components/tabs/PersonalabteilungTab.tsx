import { useState, useEffect } from "react";
import { Search, X, Pencil, Trash2, Save, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Mitarbeiter {
  id: string;
  name: string;
  dienstnummer: string;
  rang: string;
  abteilung: string;
  status: string;
  geraete: string | null;
  qualifikationen: string | null;
  notizen: string | null;
}

const rangOptionen = [
  "Chief of Police",
  "Assistant Chief",
  "Captain",
  "Lieutenant",
  "Sergeant",
  "Senior Lead Officer",
  "Officer III",
  "Officer II",
  "Officer I",
  "Cadet",
];

const abteilungOptionen = [
  "Command Staff",
  "Internal Affairs",
  "Patrol",
  "Detective",
  "SWAT",
  "Air Support",
  "Traffic",
  "K-9 Unit",
];

const statusOptionen = ["Aktiv", "Inaktiv", "Suspendiert", "Urlaub"];

export function PersonalabteilungTab() {
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [mitarbeiter, setMitarbeiter] = useState<Mitarbeiter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Mitarbeiter>>({
    name: "",
    dienstnummer: "",
    rang: "",
    abteilung: "",
    status: "Aktiv",
    geraete: "",
    qualifikationen: "",
    notizen: "",
  });

  // Fetch employees from database
  useEffect(() => {
    const fetchMitarbeiter = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("mitarbeiter")
        .select("*")
        .order("rang", { ascending: true });

      if (error) {
        console.error("Error fetching mitarbeiter:", error);
        toast.error("Fehler beim Laden der Mitarbeiter");
      } else {
        setMitarbeiter(data || []);
      }
      setIsLoading(false);
    };

    fetchMitarbeiter();
  }, []);

  const clearForm = () => {
    setFormData({
      name: "",
      dienstnummer: "",
      rang: "",
      abteilung: "",
      status: "Aktiv",
      geraete: "",
      qualifikationen: "",
      notizen: "",
    });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.dienstnummer) {
      toast.error("Name und Dienstnummer sind erforderlich!");
      return;
    }

    if (!formData.rang || !formData.abteilung) {
      toast.error("Rang und Abteilung sind erforderlich!");
      return;
    }

    if (editingId) {
      // Update existing
      const { error } = await supabase
        .from("mitarbeiter")
        .update({
          name: formData.name,
          dienstnummer: formData.dienstnummer,
          rang: formData.rang,
          abteilung: formData.abteilung,
          status: formData.status || "Aktiv",
          geraete: formData.geraete || null,
          qualifikationen: formData.qualifikationen || null,
          notizen: formData.notizen || null,
        })
        .eq("id", editingId);

      if (error) {
        toast.error("Fehler beim Aktualisieren: " + error.message);
        return;
      }

      setMitarbeiter(mitarbeiter.map(m => 
        m.id === editingId ? { ...m, ...formData } as Mitarbeiter : m
      ));
      toast.success("Mitarbeiter aktualisiert!");
    } else {
      // Create new
      const { data, error } = await supabase
        .from("mitarbeiter")
        .insert({
          name: formData.name,
          dienstnummer: formData.dienstnummer,
          rang: formData.rang,
          abteilung: formData.abteilung,
          status: formData.status || "Aktiv",
          geraete: formData.geraete || null,
          qualifikationen: formData.qualifikationen || null,
          notizen: formData.notizen || null,
        })
        .select()
        .single();

      if (error) {
        toast.error("Fehler beim Hinzufügen: " + error.message);
        return;
      }

      if (data) {
        setMitarbeiter([...mitarbeiter, data]);
        toast.success("Mitarbeiter hinzugefügt!");
      }
    }
    clearForm();
  };

  const handleEdit = (m: Mitarbeiter) => {
    setEditingId(m.id);
    setFormData(m);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("mitarbeiter")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Fehler beim Löschen: " + error.message);
      return;
    }

    setMitarbeiter(mitarbeiter.filter(m => m.id !== id));
    toast.success("Mitarbeiter gelöscht!");
  };

  const filteredMitarbeiter = mitarbeiter.filter(m =>
    searchQuery === "" ||
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.dienstnummer.includes(searchQuery) ||
    m.rang.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.abteilung.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Lade Mitarbeiter...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel - Form */}
      <div className="bg-card/50 border border-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold tracking-wide text-foreground">PERSONALABTEILUNG</h2>
            <p className="text-xs text-muted-foreground">LSPD-Mitarbeiter verwalten</p>
          </div>
          <Badge variant="outline" className="font-semibold">
            PERSONNEL
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-muted-foreground font-semibold tracking-wide mb-1.5 block">
              NAME
            </label>
            <Input
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Vor- und Nachname"
              className="bg-secondary/50 border-border"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-semibold tracking-wide mb-1.5 block">
              DIENSTNUMMER
            </label>
            <Input
              value={formData.dienstnummer || ""}
              onChange={(e) => setFormData({ ...formData, dienstnummer: e.target.value })}
              placeholder="z. B. 2031"
              className="bg-secondary/50 border-border"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-muted-foreground font-semibold tracking-wide mb-1.5 block">
              RANG
            </label>
            <Select value={formData.rang || ""} onValueChange={(v) => setFormData({ ...formData, rang: v })}>
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue placeholder="Bitte wählen ..." />
              </SelectTrigger>
              <SelectContent>
                {rangOptionen.map((rang) => (
                  <SelectItem key={rang} value={rang}>{rang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-semibold tracking-wide mb-1.5 block">
              ABTEILUNG
            </label>
            <Select value={formData.abteilung || ""} onValueChange={(v) => setFormData({ ...formData, abteilung: v })}>
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue placeholder="Bitte wählen ..." />
              </SelectTrigger>
              <SelectContent>
                {abteilungOptionen.map((abt) => (
                  <SelectItem key={abt} value={abt}>{abt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-muted-foreground font-semibold tracking-wide mb-1.5 block">
              STATUS
            </label>
            <Select value={formData.status || "Aktiv"} onValueChange={(v) => setFormData({ ...formData, status: v })}>
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptionen.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-semibold tracking-wide mb-1.5 block">
              GERÄTE / ZUWEISUNG
            </label>
            <Input
              value={formData.geraete || ""}
              onChange={(e) => setFormData({ ...formData, geraete: e.target.value })}
              placeholder="Bodycam 12, Car 23, Funk 5"
              className="bg-secondary/50 border-border"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs text-muted-foreground font-semibold tracking-wide mb-1.5 block">
              QUALIFIKATIONEN
            </label>
            <Input
              value={formData.qualifikationen || ""}
              onChange={(e) => setFormData({ ...formData, qualifikationen: e.target.value })}
              placeholder="FTO, Air Support, SWAT ..."
              className="bg-secondary/50 border-border"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-semibold tracking-wide mb-1.5 block">
              NOTIZEN
            </label>
            <Input
              value={formData.notizen || ""}
              onChange={(e) => setFormData({ ...formData, notizen: e.target.value })}
              placeholder="Interne Hinweise ..."
              className="bg-secondary/50 border-border"
            />
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Speichern / Aktualisieren
          </Button>
          <Button variant="outline" onClick={clearForm} className="gap-2">
            <span className="text-base">↻</span>
            Formular leeren
          </Button>
        </div>
      </div>

      {/* Right Panel - Liste */}
      <div className="bg-card/50 border border-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold tracking-wide text-foreground">MITARBEITER-LISTE</h2>
            <p className="text-xs text-muted-foreground">Such- und Filterfunktion</p>
          </div>
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 font-semibold">
            ROSTER
          </Badge>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Suche nach Name, Dienstnr., Rang, Abteilung ..."
            className="pr-10 bg-secondary/50 border-border"
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

        {/* Table Header */}
        <div className="grid grid-cols-[1fr_0.7fr_1fr_1fr_0.7fr_0.7fr] gap-2 px-2 mb-2">
          <span className="text-xs text-muted-foreground font-semibold">Name</span>
          <span className="text-xs text-muted-foreground font-semibold">Dienstnr.</span>
          <span className="text-xs text-muted-foreground font-semibold">Rang</span>
          <span className="text-xs text-muted-foreground font-semibold">Abteilung</span>
          <span className="text-xs text-muted-foreground font-semibold">Status</span>
          <span className="text-xs text-muted-foreground font-semibold text-right">Aktion</span>
        </div>

        {/* Table */}
        <ScrollArea className="h-[350px]">
          <div className="space-y-1">
            {filteredMitarbeiter.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <span className="text-muted-foreground">Keine Mitarbeiter gefunden</span>
              </div>
            ) : (
              filteredMitarbeiter.map((m) => (
                <div
                  key={m.id}
                  className="grid grid-cols-[1fr_0.7fr_1fr_1fr_0.7fr_0.7fr] gap-2 items-center p-2 bg-secondary/30 hover:bg-secondary/50 rounded-md transition-colors"
                >
                  <span className="text-sm text-foreground truncate">{m.name}</span>
                  <span className="text-sm text-muted-foreground">{m.dienstnummer}</span>
                  <span className="text-sm text-muted-foreground truncate">{m.rang}</span>
                  <span className="text-sm text-muted-foreground truncate">{m.abteilung}</span>
                  <span className="text-sm text-foreground">{m.status}</span>
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => handleEdit(m)}
                      className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5 text-primary" />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="h-7 w-7 rounded-full bg-destructive/20 flex items-center justify-center hover:bg-destructive/30 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {mitarbeiter.length} Mitarbeiter registriert
          </p>
        </div>
      </div>
    </div>
  );
}
