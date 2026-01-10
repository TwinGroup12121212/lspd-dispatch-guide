import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, Users, LogOut, Shield, Settings, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { StrafkatalogTab } from "@/components/tabs/StrafkatalogTab";
import { PersonalabteilungTab } from "@/components/tabs/PersonalabteilungTab";
import { VerwaltungTab } from "@/components/VerwaltungTab";
import { useAuth } from "@/hooks/useAuth";

type TabType = "strafkatalog" | "personalabteilung" | "verwaltung";

export default function Index() {
  const { user, isAdmin, isLoading, displayName, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("strafkatalog");
  const [dispatchStatus, setDispatchStatus] = useState("normal");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    return date.toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Erfolgreich abgemeldet");
  };

  const tabs = [
    { id: "strafkatalog" as TabType, label: "STRAFKATALOG", icon: Scale },
    { id: "personalabteilung" as TabType, label: "MITARBEITER-LISTE", icon: Users },
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
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground font-semibold tracking-wide font-mono">{formatDateTime(currentDateTime)}</span>
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
                <span className="text-primary font-semibold">{displayName || user.email}</span>
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
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === "strafkatalog" && <StrafkatalogTab />}
        {activeTab === "personalabteilung" && <PersonalabteilungTab />}
        {activeTab === "verwaltung" && isAdmin && <VerwaltungTab />}
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
