import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Search, User, Clock, FileText, Trash2, Edit, Plus } from "lucide-react";

interface AuditLog {
  id: string;
  created_at: string;
  user_id: string;
  user_name: string;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  description: string | null;
}

type AuditLogRow = {
  id: string;
  created_at: string;
  user_id: string;
  user_name: string;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: unknown;
  new_data: unknown;
  description: string | null;
};

const TABLE_LABELS: Record<string, string> = {
  mitarbeiter: "Mitarbeiter",
  straftaten: "Straftaten",
  kategorien: "Kategorien",
  einheiten: "Einheiten",
  profiles: "Profile",
  user_roles: "Benutzerrollen",
};

const ACTION_CONFIG: Record<string, { label: string; icon: typeof Plus; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  INSERT: { label: "Erstellt", icon: Plus, variant: "default" },
  UPDATE: { label: "Bearbeitet", icon: Edit, variant: "secondary" },
  DELETE: { label: "Gelöscht", icon: Trash2, variant: "destructive" },
};

export function AuditLogTab() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTable, setFilterTable] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error("Error fetching audit logs:", error);
    } else {
      const mappedLogs: AuditLog[] = (data as AuditLogRow[] || []).map((row) => ({
        ...row,
        old_data: row.old_data as Record<string, unknown> | null,
        new_data: row.new_data as Record<string, unknown> | null,
      }));
      setLogs(mappedLogs);
    }
    setIsLoading(false);
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getChangeSummary = (log: AuditLog): string => {
    if (log.description) return log.description;

    if (log.action === "DELETE" && log.old_data) {
      const name = log.old_data.name || log.old_data.display_name || log.old_data.email;
      return name ? `"${name}" gelöscht` : "Eintrag gelöscht";
    }

    if (log.action === "INSERT" && log.new_data) {
      const name = log.new_data.name || log.new_data.display_name || log.new_data.email;
      return name ? `"${name}" erstellt` : "Neuer Eintrag";
    }

    if (log.action === "UPDATE" && log.old_data && log.new_data) {
      const changes: string[] = [];
      for (const key of Object.keys(log.new_data)) {
        if (key === "updated_at" || key === "created_at") continue;
        const oldVal = log.old_data[key];
        const newVal = log.new_data[key];
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          changes.push(key);
        }
      }
      if (changes.length > 0) {
        return `Geändert: ${changes.slice(0, 3).join(", ")}${changes.length > 3 ? ` (+${changes.length - 3})` : ""}`;
      }
    }

    return "Änderung durchgeführt";
  };

  const filteredLogs = logs.filter((log) => {
    if (filterTable !== "all" && log.table_name !== filterTable) return false;
    if (filterAction !== "all" && log.action !== filterAction) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesUser = log.user_name.toLowerCase().includes(search);
      const matchesDescription = getChangeSummary(log).toLowerCase().includes(search);
      if (!matchesUser && !matchesDescription) return false;
    }
    return true;
  });

  const uniqueTables = [...new Set(logs.map((l) => l.table_name))];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Änderungsprotokoll
          </CardTitle>
          <Badge variant="outline">{filteredLogs.length} Einträge</Badge>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterTable} onValueChange={setFilterTable}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Alle Tabellen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Tabellen</SelectItem>
              {uniqueTables.map((table) => (
                <SelectItem key={table} value={table}>
                  {TABLE_LABELS[table] || table}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Alle Aktionen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Aktionen</SelectItem>
              <SelectItem value="INSERT">Erstellt</SelectItem>
              <SelectItem value="UPDATE">Bearbeitet</SelectItem>
              <SelectItem value="DELETE">Gelöscht</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Lade Protokoll...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Keine Einträge gefunden</div>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {filteredLogs.map((log) => {
                const actionConfig = ACTION_CONFIG[log.action] || ACTION_CONFIG.UPDATE;
                const ActionIcon = actionConfig.icon;

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <Badge variant={actionConfig.variant} className="flex items-center gap-1">
                        <ActionIcon className="h-3 w-3" />
                        {actionConfig.label}
                      </Badge>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="text-xs">
                          {TABLE_LABELS[log.table_name] || log.table_name}
                        </Badge>
                        <span className="text-muted-foreground truncate">
                          {getChangeSummary(log)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.user_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(log.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
