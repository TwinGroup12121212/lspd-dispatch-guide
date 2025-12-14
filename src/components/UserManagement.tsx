import { useState, useEffect } from "react";
import { Search, X, Trash2, Shield, User, UserPlus, Copy, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

// Generate random password
const generatePassword = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export function UserManagement() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdUser, setCreatedUser] = useState<{ username: string; password: string } | null>(null);

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

  const openCreateDialog = () => {
    const password = generatePassword();
    setGeneratedPassword(password);
    setNewUsername("");
    setCreatedUser(null);
    setShowPassword(false);
    setShowCreateDialog(true);
  };

  const handleCreateUser = async () => {
    if (!newUsername.trim()) {
      toast.error("Bitte Benutzername eingeben");
      return;
    }

    setIsCreating(true);
    try {
      // Create user with email format based on username
      const email = `${newUsername.toLowerCase().replace(/\s+/g, '.')}@lspd.local`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password: generatedPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            display_name: newUsername,
          },
        },
      });

      if (error) throw error;

      // Update the profile to require password change
      if (data.user) {
        await supabase
          .from('profiles')
          .update({ must_change_password: true })
          .eq('id', data.user.id);
      }

      // Show success with password
      setCreatedUser({ username: newUsername, password: generatedPassword });
      toast.success(`Zugang "${newUsername}" wurde erstellt`);
      
      // Refresh user list
      setTimeout(() => fetchUsers(), 1000);
    } catch (error: any) {
      console.error("Error creating user:", error);
      if (error.message?.includes("already registered")) {
        toast.error("Benutzername bereits vergeben");
      } else {
        toast.error("Fehler beim Erstellen des Benutzers: " + error.message);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    toast.success("Passwort kopiert!");
  };

  const closeDialog = () => {
    setShowCreateDialog(false);
    setCreatedUser(null);
    setNewUsername("");
    setGeneratedPassword("");
  };

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
    // This removes the user's role and profile, effectively disabling their access
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
      toast.success("Zugang entfernt - Benutzer kann sich nicht mehr anmelden");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Fehler beim Löschen des Benutzers");
    }
  };

  const filteredUsers = users.filter((u) =>
    searchQuery === "" ||
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
        <div className="flex items-center gap-2">
          <Dialog open={showCreateDialog} onOpenChange={(open) => open ? openCreateDialog() : closeDialog()}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Neuen Zugang erstellen
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>
                  {createdUser ? "Zugang erstellt!" : "Neuen Zugang erstellen"}
                </DialogTitle>
              </DialogHeader>
              
              {createdUser ? (
                <div className="space-y-4 py-4">
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                    <p className="text-green-400 font-semibold mb-2">
                      Zugang erfolgreich erstellt!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Der Benutzer muss beim ersten Login das Passwort ändern.
                    </p>
                  </div>
                  
                  <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold">BENUTZERNAME</label>
                      <p className="font-mono text-lg">{createdUser.username}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold">PASSWORT</label>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-lg">
                          {showPassword ? createdUser.password : "••••••••••••"}
                        </p>
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={copyPassword}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={closeDialog} className="w-full">
                    Schließen
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium">Benutzername</label>
                    <Input
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="z.B. Max Mustermann"
                      className="bg-secondary/50"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Generiertes Passwort</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={showPassword ? generatedPassword : "••••••••••••"}
                        readOnly
                        className="bg-secondary/50 font-mono"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={copyPassword}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Der Benutzer muss das Passwort beim ersten Login ändern.
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleCreateUser} 
                    className="w-full"
                    disabled={isCreating || !newUsername.trim()}
                  >
                    {isCreating ? "Wird erstellt..." : "Zugang erstellen"}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
          <Badge className="bg-primary/20 text-primary border-primary/30 font-semibold">
            ADMIN
          </Badge>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Suche nach Name ..."
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
        <span className="text-xs text-muted-foreground font-semibold">Benutzername</span>
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
                  <span className="text-sm text-foreground truncate">
                    {user.display_name || "Unbekannt"}
                  </span>
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
                    title="Zugang löschen"
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
