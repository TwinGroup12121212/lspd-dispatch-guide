import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Shield, UserPlus, LogIn, KeyRound, ArrowLeft } from "lucide-react";

type AuthMode = "login" | "register" | "reset";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Bitte E-Mail eingeben");
      return;
    }

    if (mode !== "reset" && !password) {
      toast.error("Bitte Passwort eingeben");
      return;
    }

    if (mode !== "reset" && password.length < 6) {
      toast.error("Passwort muss mindestens 6 Zeichen lang sein");
      return;
    }

    setIsSubmitting(true);

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Ungültige Anmeldedaten");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Erfolgreich angemeldet!");
        navigate("/");
      }
    } else if (mode === "register") {
      const { error } = await signUp(email, password, displayName);
      if (error) {
        if (error.message.includes("User already registered")) {
          toast.error("Diese E-Mail ist bereits registriert");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Account erstellt! Du bist jetzt eingeloggt.");
        navigate("/");
      }
    } else if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("E-Mail zum Zurücksetzen wurde gesendet!");
        setMode("login");
      }
    }

    setIsSubmitting(false);
  };

  const getTitle = () => {
    switch (mode) {
      case "login": return "Melde dich an, um fortzufahren";
      case "register": return "Erstelle einen neuen Account";
      case "reset": return "Passwort zurücksetzen";
    }
  };

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
              {getTitle()}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="displayName">Anzeigename</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Dein Name"
                  className="bg-secondary/50 border-border"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.de"
                className="bg-secondary/50 border-border"
                required
              />
            </div>

            {mode !== "reset" && (
              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-secondary/50 border-border"
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isSubmitting}
            >
              {mode === "login" && (
                <>
                  <LogIn className="h-4 w-4" />
                  Anmelden
                </>
              )}
              {mode === "register" && (
                <>
                  <UserPlus className="h-4 w-4" />
                  Registrieren
                </>
              )}
              {mode === "reset" && (
                <>
                  <KeyRound className="h-4 w-4" />
                  Link senden
                </>
              )}
            </Button>
          </form>

          {/* Password Reset Link */}
          {mode === "login" && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setMode("reset")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Passwort vergessen?
              </button>
            </div>
          )}

          {/* Back to Login from Reset */}
          {mode === "reset" && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="h-3 w-3" />
                Zurück zur Anmeldung
              </button>
            </div>
          )}

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {mode === "login" || mode === "reset"
                ? "Noch kein Account? Registrieren"
                : "Bereits ein Account? Anmelden"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}