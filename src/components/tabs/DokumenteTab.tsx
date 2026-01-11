import { useState, useEffect } from "react";
import { FileText, Plus, ExternalLink, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { logAudit } from "@/lib/auditLog";

interface Dokument {
  id: string;
  title: string;
  url: string;
  created_at: string;
  created_by: string;
  created_by_name: string;
}

export function DokumenteTab() {
  const { user, isAdmin } = useAuth();
  const [dokumente, setDokumente] = useState<Dokument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchDokumente();
  }, []);

  const fetchDokumente = async () => {
    try {
      const { data, error } = await supabase
        .from("dokumente")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDokumente(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Fehler beim Laden der Dokumente");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDokument = async () => {
    if (!title.trim() || !url.trim()) {
      toast.error("Bitte Titel und URL eingeben");
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      toast.error("Bitte eine gültige URL eingeben");
      return;
    }

    setIsSaving(true);

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, email")
        .eq("id", user?.id)
        .single();

      const createdByName = profile?.display_name || profile?.email || user?.email || "Unbekannt";

      const { data, error } = await supabase
        .from("dokumente")
        .insert({
          title: title.trim(),
          url: url.trim(),
          created_by: user?.id,
          created_by_name: createdByName,
        })
        .select()
        .single();

      if (error) throw error;

      setDokumente([data, ...dokumente]);
      toast.success("Dokument hinzugefügt");

      // Log audit
      await logAudit({
        action: "INSERT",
        tableName: "dokumente",
        recordId: data.id,
        newData: data,
        description: `Dokument "${title.trim()}" hinzugefügt`,
      });

      setTitle("");
      setUrl("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding document:", error);
      toast.error("Fehler beim Hinzufügen des Dokuments");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (dokument: Dokument) => {
    try {
      const { error } = await supabase
        .from("dokumente")
        .delete()
        .eq("id", dokument.id);

      if (error) throw error;

      setDokumente(dokumente.filter((d) => d.id !== dokument.id));
      toast.success("Dokument gelöscht");

      // Log audit
      await logAudit({
        action: "DELETE",
        tableName: "dokumente",
        recordId: dokument.id,
        oldData: dokument,
        description: `Dokument "${dokument.title}" gelöscht`,
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Fehler beim Löschen des Dokuments");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Dokumente</h2>
        </div>

        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Hinzufügen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neues Dokument hinzufügen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titel / Überschrift</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="z.B. Dienstvorschriften"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">Link (URL)</Label>
                  <Input
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    type="url"
                  />
                </div>
                <Button
                  onClick={handleAddDokument}
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Speichern...
                    </>
                  ) : (
                    "Hinzufügen"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {dokumente.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Noch keine Dokumente vorhanden</p>
            {isAdmin && (
              <p className="text-sm text-muted-foreground mt-2">
                Klicke auf "Hinzufügen" um ein neues Dokument anzulegen.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dokumente.map((dokument) => (
            <Card
              key={dokument.id}
              className="group hover:border-primary/50 transition-colors cursor-pointer"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base font-semibold line-clamp-2">
                    {dokument.title}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => window.open(dokument.url, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    {isAdmin && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Dokument löschen?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Möchten Sie das Dokument "{dokument.title}" wirklich löschen?
                              Diese Aktion kann nicht rückgängig gemacht werden.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(dokument)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Löschen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
                <CardDescription className="text-xs">
                  von {dokument.created_by_name} · {formatDate(dokument.created_at)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href={dokument.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline truncate block"
                >
                  {dokument.url}
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
