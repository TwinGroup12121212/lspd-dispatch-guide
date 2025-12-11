import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clipboard, FileText, Scale, Users, LogOut, Plus, Shield, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { StrafkatalogTab } from "@/components/tabs/StrafkatalogTab";
import { PersonalabteilungTab } from "@/components/tabs/PersonalabteilungTab";
import { UserManagement } from "@/components/UserManagement";
import { useAuth } from "@/hooks/useAuth";

type TabType = "leitstellenblatt" | "strafkatalog" | "personalabteilung" | "verwaltung";

interface Einheit {
  id: string;
  rufname: string;
  dnName: string;
  funker: string;
}

export default function Index() {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("leitstellenblatt");
  const [dispatchStatus, setDispatchStatus] = useState("normal");
  
  // Leitstellenblatt state
  const [supervisor, setSupervisor] = useState("");
  const [leitstelle, setLeitstelle] = useState("");
  const [hinweise, setHinweise] = useState("");
  const [einheiten, setEinheiten] = useState<Einheit[]>([
    { id: "1", rufname: "", dnName: "", funker: "" },
    { id: "2", rufname: "", dnName: "", funker: "" },
    { id: "3", rufname: "", dnName: "", funker: "" },
    { id: "4", rufname: "", dnName: "", funker: "" },
    { id: "5", rufname: "", dnName: "", funker: "" },
    { id: "6", rufname: "", dnName: "", funker: "" },
  ]);

  const addEinheit = () => {
    setEinheiten([...einheiten, { id: Date.now().toString(), rufname: "", dnName: "", funker: "" }]);
  };

  const clearEinheiten = () => {
    setEinheiten(einheiten.map(e => ({ ...e, rufname: "", dnName: "", funker: "" })));
  };

  const updateEinheit = (id: string, field: keyof Einheit, value: string) => {
    setEinheiten(einheiten.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const resetForm = () => {
    setSupervisor("");
    setLeitstelle("");
    setHinweise("");
    clearEinheiten();
  };

  const copyLeitstellenblatt = () => {
    const text = `=== LSPD LEITSTELLENBLATT ===
SUPERVISOR: ${supervisor}
LEITSTELLE: ${leitstelle}

LAGE / HINWEISE:
${hinweise}

EINGETEILTE EINHEITEN:
${einheiten.filter(e => e.rufname || e.dnName || e.funker).map(e => 
  `${e.rufname} | ${e.dnName} | ${e.funker}`
).join("\n")}
`;
    navigator.clipboard.writeText(text);
    toast.success("Leitstellenblatt kopiert!");
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Erfolgreich abgemeldet");
  };

  const tabs = [
    { id: "leitstellenblatt" as TabType, label: "LEITSTELLENBLATT", icon: FileText },
    { id: "strafkatalog" as TabType, label: "STRAFKATALOG", icon: Scale },
    { id: "personalabteilung" as TabType, label: "PERSONALABTEILUNG", icon: Users, emoji: "👮🔧" },
    ...(isAdmin ? [{ id: "verwaltung" as TabType, label: "VERWALTUNG", icon: Settings }] : []),
  ];

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Lade...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-wider text-foreground">
              LSPD · TACTICAL OPERATIONS CENTER
            </h1>
            <p className="text-sm text-muted-foreground">Leitstelle · Strafkatalog · Personal</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-success font-semibold tracking-wide">DISPATCH ONLINE</span>
              </span>
              <Select value={dispatchStatus} onValueChange={setDispatchStatus}>
                <SelectTrigger className="w-28 h-8 text-xs bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                {isAdmin && <Shield className="h-4 w-4 text-primary" />}
                <span className="text-primary font-semibold">{user.email}</span>
                {isAdmin && <Badge variant="outline" className="text-xs">Admin</Badge>}
              </span>
              <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={handleLogout}>
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-border bg-card/30 px-6">
        <div className="flex gap-2 py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-semibold tracking-wide transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {tab.emoji ? (
                <span>{tab.emoji}</span>
              ) : (
                <tab.icon className="h-4 w-4" />
              )}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === "leitstellenblatt" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Leitstellenblatt */}
            <div className="bg-card/50 border border-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold tracking-wide text-foreground">LEITSTELLENBLATT</h2>
                  <p className="text-xs text-muted-foreground">Einsatzübersicht · Funkdisposition</p>
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/30 font-semibold">
                  SHIFT ACTIVE
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-muted-foreground font-semibold tracking-wide mb-1.5 block">
                    SUPERVISOR
                  </label>
                  <Input
                    value={supervisor}
                    onChange={(e) => setSupervisor(e.target.value)}
                    placeholder="DN + Name"
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-semibold tracking-wide mb-1.5 block">
                    LEITSTELLE
                  </label>
                  <Input
                    value={leitstelle}
                    onChange={(e) => setLeitstelle(e.target.value)}
                    placeholder="DN + Name"
                    className="bg-secondary/50 border-border"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-semibold tracking-wide mb-1.5 block">
                  LAGE / HINWEISE
                </label>
                <Textarea
                  value={hinweise}
                  onChange={(e) => setHinweise(e.target.value)}
                  placeholder="Kurzlage, Fahndungen, Sonderlagen ..."
                  className="bg-secondary/50 border-border min-h-[120px] resize-y"
                />
              </div>
            </div>

            {/* Right Panel - Eingeteilte Einheiten */}
            <div className="bg-card/50 border border-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold tracking-wide text-foreground">EINGETEILTE EINHEITEN</h2>
                  <p className="text-xs text-muted-foreground">Rufnamen · Funk · Status</p>
                </div>
                <Badge variant="outline" className="font-semibold">
                  UNIT GRID
                </Badge>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-3 gap-2 mb-2 px-2">
                <span className="text-xs text-muted-foreground font-semibold tracking-wide">ADAM/LINCOLN</span>
                <span className="text-xs text-muted-foreground font-semibold tracking-wide">DN + Name</span>
                <span className="text-xs text-muted-foreground font-semibold tracking-wide">Funker</span>
              </div>

              {/* Table Rows */}
              <div className="space-y-1.5 mb-4 max-h-[300px] overflow-y-auto">
                {einheiten.map((einheit) => (
                  <div key={einheit.id} className="grid grid-cols-3 gap-2">
                    <Input
                      value={einheit.rufname}
                      onChange={(e) => updateEinheit(einheit.id, "rufname", e.target.value)}
                      placeholder="Rufname"
                      className="h-9 text-sm bg-secondary/50 border-border"
                    />
                    <Input
                      value={einheit.dnName}
                      onChange={(e) => updateEinheit(einheit.id, "dnName", e.target.value)}
                      placeholder="DN + Name"
                      className="h-9 text-sm bg-secondary/50 border-border"
                    />
                    <Input
                      value={einheit.funker}
                      onChange={(e) => updateEinheit(einheit.id, "funker", e.target.value)}
                      placeholder="DN + Name"
                      className="h-9 text-sm bg-secondary/50 border-border"
                    />
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={addEinheit} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Zeile
                </Button>
                <Button variant="outline" size="sm" onClick={clearEinheiten} className="gap-1.5">
                  <span className="text-base">🧹</span>
                  Tabelle leeren
                </Button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="lg:col-span-2 flex justify-center gap-3">
              <Button onClick={copyLeitstellenblatt} className="gap-2 px-6">
                <Clipboard className="h-4 w-4" />
                Leitstellenblatt kopieren
              </Button>
              <Button variant="outline" onClick={resetForm} className="gap-2 px-6">
                <span className="text-base">↻</span>
                Formular zurücksetzen
              </Button>
            </div>
          </div>
        )}

        {activeTab === "strafkatalog" && <StrafkatalogTab />}
        {activeTab === "personalabteilung" && <PersonalabteilungTab />}
        {activeTab === "verwaltung" && isAdmin && <UserManagement />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-3 px-6 text-center">
        <p className="text-xs text-muted-foreground">
          LSPD Tactical PD-System · Powered by Lovable Cloud
        </p>
      </footer>
    </div>
  );
}
