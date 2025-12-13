import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Shield, LogIn, KeyRound, Eye, EyeOff } from "lucide-react";

export default function Auth() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Password change state
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const { user, signIn } = useAuth();
  const navigate = useNavigate();

  // Check if user must change password after login
  useEffect(() => {
    const checkMustChangePassword = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('must_change_password')
          .eq('id', user.id)
          .maybeSingle();
        
        if (data?.must_change_password) {
          setMustChangePassword(true);
        } else {
          navigate("/");
        }
      }
    };
    
    checkMustChangePassword();
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username) {
      toast.error("Bitte Benutzername eingeben");
      return;
    }

    if (!password) {
      toast.error("Bitte Passwort eingeben");
      return;
    }

    setIsSubmitting(true);

    // Convert username to email format
    const email = `${username.toLowerCase()}@lspd.local`;
    
    const { error } = await signIn(email, password);
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Ungültige Anmeldedaten");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Erfolgreich angemeldet!");
    }

    setIsSubmitting(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error("Bitte alle Felder ausfüllen");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Passwort muss mindestens 6 Zeichen lang sein");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwörter stimmen nicht überein");
      return;
    }

    setIsSubmitting(true);

    try {
      // Update password
      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (passwordError) {
        toast.error(passwordError.message);
        setIsSubmitting(false);
        return;
      }

      // Update must_change_password flag
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ must_change_password: false })
        .eq('id', user!.id);

      if (profileError) {
        toast.error(profileError.message);
        setIsSubmitting(false);
        return;
      }

      toast.success("Passwort erfolgreich geändert!");
      setMustChangePassword(false);
      navigate("/");
    } catch (error: any) {
      toast.error(error.message);
    }

    setIsSubmitting(false);
  };

  // Password change form
  if (mustChangePassword && user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card/50 border border-border rounded-lg p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <KeyRound className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h1 className="text-2xl font-bold tracking-wider text-foreground">
                PASSWORT ÄNDERN
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Du musst dein Passwort ändern, bevor du fortfahren kannst
              </p>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Neues Passwort</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-secondary/50 border-border pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-secondary/50 border-border"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={isSubmitting}
              >
                <KeyRound className="h-4 w-4" />
                Passwort ändern
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card/50 border border-border rounded-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-wider text-foreground">
              LSPD SYSTEM
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Melde dich mit deinem Benutzernamen an
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Benutzername</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Benutzername"
                className="bg-secondary/50 border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-secondary/50 border-border pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isSubmitting}
            >
              <LogIn className="h-4 w-4" />
              Anmelden
            </Button>
          </form>

          <div className="mt-6 text-center border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              Zugänge werden nur von Admins erstellt
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
