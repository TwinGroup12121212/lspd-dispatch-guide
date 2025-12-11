import { useState, useEffect } from "react";
import { Search, X, Trash2, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRole {
  id: string;
  email: string | null;
  display_name: string | null;
  role: AppRole;
  created_at: string;
}

export function UserManagement() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, display_name, created_at");

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Combine data
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.email,
          display_name: profile.display_name,
          role: userRole?.role || "user",
          created_at: profile.created_at,
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Fehler beim Laden der Benutzer");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const updateUserRole = async (userId: string, newRole: AppRole) => {
    try {
      // Check if user already has a role entry
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existingRole) {
        // Delete existing role
        await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId);
      }

      // Insert new role
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: newRole });

      if (error) throw error;

      setUsers(users.map((u) =>
        u.id === userId ? { ...u, role: newRole } : u
      ));
      toast.success(`Rolle auf "${newRole}" geändert`);
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Fehler beim Ändern der Rolle");
    }
  };

  const deleteUser = async (userId: string) => {
    // Note: This only removes the role, not the actual user from auth
    // Full user deletion requires admin API access
    try {
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      setUsers(users.filter((u) => u.id !== userId));
      toast.success("Benutzer entfernt");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Fehler beim Löschen des Benutzers");
    }
  };

  const filteredUsers = users.filter((u) =>
    searchQuery === "" ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="bg-card/50 border border-border rounded-lg p-8 text-center">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Zugriff verweigert</h3>
        <p className="text-muted-foreground">Nur Administratoren können Benutzer verwalten.</p>
      </div>
    );
  }

  return (
    <div className="bg-card/50 border border-border rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold tracking-wide text-foreground">BENUTZERVERWALTUNG</h2>
          <p className="text-xs text-muted-foreground">Zugänge und Berechtigungen verwalten</p>
        </div>
        <Badge className="bg-primary/20 text-primary border-primary/30 font-semibold">
          ADMIN
        </Badge>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Suche nach E-Mail oder Name ..."
          className="pl-10 pr-10 bg-secondary/50 border-border"
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
      <div className="grid grid-cols-[1.5fr_1fr_1fr_0.5fr] gap-2 px-2 mb-2">
        <span className="text-xs text-muted-foreground font-semibold">E-Mail / Name</span>
        <span className="text-xs text-muted-foreground font-semibold">Registriert</span>
        <span className="text-xs text-muted-foreground font-semibold">Rolle</span>
        <span className="text-xs text-muted-foreground font-semibold text-right">Aktion</span>
      </div>

      {/* Table */}
      <ScrollArea className="h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <span className="text-muted-foreground">Lade Benutzer...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <span className="text-muted-foreground">Keine Benutzer gefunden</span>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-[1.5fr_1fr_1fr_0.5fr] gap-2 items-center p-2 bg-secondary/30 hover:bg-secondary/50 rounded-md transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {user.role === "admin" ? (
                    <Shield className="h-4 w-4 text-primary flex-shrink-0" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">{user.email}</p>
                    {user.display_name && user.display_name !== user.email && (
                      <p className="text-xs text-muted-foreground truncate">{user.display_name}</p>
                    )}
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString("de-DE")}
                </span>
                <Select
                  value={user.role}
                  onValueChange={(value: AppRole) => updateUserRole(user.id, value)}
                >
                  <SelectTrigger className="h-8 text-sm bg-secondary/50 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex justify-end">
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="h-7 w-7 rounded-full bg-destructive/20 flex items-center justify-center hover:bg-destructive/30 transition-colors"
                    title="Benutzer löschen"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          {users.length} Benutzer registriert · {users.filter(u => u.role === "admin").length} Administratoren
        </p>
      </div>
    </div>
  );
}
