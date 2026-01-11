import { useState, useEffect } from "react";
import { FileText, Plus, ExternalLink, Trash2, Loader2, FolderPlus, Pencil, ChevronDown, ChevronRight } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { logAudit } from "@/lib/auditLog";

interface Kategorie {
  id: string;
  name: string;
  sort_order: number;
}

interface Dokument {
  id: string;
  title: string;
  url: string;
  created_at: string;
  created_by: string;
  created_by_name: string;
  kategorie_id: string | null;
}

export function DokumenteTab() {
  const { user, isAdmin } = useAuth();
  const [kategorien, setKategorien] = useState<Kategorie[]>([]);
  const [dokumente, setDokumente] = useState<Dokument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDocDialogOpen, setIsDocDialogOpen] = useState(false);
  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [selectedKategorie, setSelectedKategorie] = useState<string>("");
  const [newKategorieName, setNewKategorieName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingKategorie, setEditingKategorie] = useState<Kategorie | null>(null);
  const [editKategorieName, setEditKategorieName] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Expand all categories by default
    if (kategorien.length > 0) {
      setExpandedCategories(new Set(kategorien.map(k => k.id)));
    }
  }, [kategorien]);

  const fetchData = async () => {
    try {
      const [kategorienRes, dokumenteRes] = await Promise.all([
        supabase
          .from("dokument_kategorien")
          .select("*")
          .order("sort_order", { ascending: true }),
        supabase
          .from("dokumente")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (kategorienRes.error) throw kategorienRes.error;
      if (dokumenteRes.error) throw dokumenteRes.error;

      setKategorien(kategorienRes.data || []);
      setDokumente(dokumenteRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Fehler beim Laden der Daten");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDokument = async () => {
    if (!title.trim() || !url.trim()) {
      toast.error("Bitte Titel und URL eingeben");
      return;
    }

    if (!selectedKategorie) {
      toast.error("Bitte eine Kategorie auswählen");
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
      const kategorie = kategorien.find(k => k.id === selectedKategorie);

      const { data, error } = await supabase
        .from("dokumente")
        .insert({
          title: title.trim(),
          url: url.trim(),
          created_by: user?.id,
          created_by_name: createdByName,
          kategorie_id: selectedKategorie,
        })
        .select()
        .single();

      if (error) throw error;

      setDokumente([data, ...dokumente]);
      toast.success("Dokument hinzugefügt");

      await logAudit({
        action: "INSERT",
        tableName: "dokumente",
        recordId: data.id,
        newData: data,
        description: `Dokument "${title.trim()}" in Kategorie "${kategorie?.name}" hinzugefügt`,
      });

      setTitle("");
      setUrl("");
      setSelectedKategorie("");
      setIsDocDialogOpen(false);
    } catch (error) {
      console.error("Error adding document:", error);
      toast.error("Fehler beim Hinzufügen des Dokuments");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddKategorie = async () => {
    if (!newKategorieName.trim()) {
      toast.error("Bitte einen Namen eingeben");
      return;
    }

    setIsSaving(true);

    try {
      const maxOrder = Math.max(...kategorien.map(k => k.sort_order), 0);

      const { data, error } = await supabase
        .from("dokument_kategorien")
        .insert({
          name: newKategorieName.trim(),
          sort_order: maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;

      setKategorien([...kategorien, data].sort((a, b) => a.sort_order - b.sort_order));
      toast.success("Kategorie erstellt");

      await logAudit({
        action: "INSERT",
        tableName: "dokument_kategorien",
        recordId: data.id,
        newData: data,
        description: `Dokumentenkategorie "${newKategorieName.trim()}" erstellt`,
      });

      setNewKategorieName("");
      setIsCatDialogOpen(false);
    } catch (error: any) {
      console.error("Error adding category:", error);
      if (error.code === "23505") {
        toast.error("Diese Kategorie existiert bereits");
      } else {
        toast.error("Fehler beim Erstellen der Kategorie");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateKategorie = async () => {
    if (!editingKategorie || !editKategorieName.trim()) {
      toast.error("Bitte einen Namen eingeben");
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("dokument_kategorien")
        .update({ name: editKategorieName.trim() })
        .eq("id", editingKategorie.id);

      if (error) throw error;

      setKategorien(kategorien.map(k => 
        k.id === editingKategorie.id ? { ...k, name: editKategorieName.trim() } : k
      ));
      toast.success("Kategorie aktualisiert");

      await logAudit({
        action: "UPDATE",
        tableName: "dokument_kategorien",
        recordId: editingKategorie.id,
        oldData: { name: editingKategorie.name },
        newData: { name: editKategorieName.trim() },
        description: `Dokumentenkategorie "${editingKategorie.name}" in "${editKategorieName.trim()}" umbenannt`,
      });

      setEditingKategorie(null);
      setEditKategorieName("");
    } catch (error: any) {
      console.error("Error updating category:", error);
      if (error.code === "23505") {
        toast.error("Diese Kategorie existiert bereits");
      } else {
        toast.error("Fehler beim Aktualisieren der Kategorie");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteKategorie = async (kategorie: Kategorie) => {
    try {
      const { error } = await supabase
        .from("dokument_kategorien")
        .delete()
        .eq("id", kategorie.id);

      if (error) throw error;

      setKategorien(kategorien.filter(k => k.id !== kategorie.id));
      toast.success("Kategorie gelöscht");

      await logAudit({
        action: "DELETE",
        tableName: "dokument_kategorien",
        recordId: kategorie.id,
        oldData: kategorie,
        description: `Dokumentenkategorie "${kategorie.name}" gelöscht`,
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Fehler beim Löschen der Kategorie");
    }
  };

  const handleDeleteDokument = async (dokument: Dokument) => {
    try {
      const { error } = await supabase
        .from("dokumente")
        .delete()
        .eq("id", dokument.id);

      if (error) throw error;

      setDokumente(dokumente.filter((d) => d.id !== dokument.id));
      toast.success("Dokument gelöscht");

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

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
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

  const getDokumenteByKategorie = (kategorieId: string) => {
    return dokumente.filter(d => d.kategorie_id === kategorieId);
  };

  const getUncategorizedDokumente = () => {
    return dokumente.filter(d => !d.kategorie_id);
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
          <div className="flex gap-2">
            <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <FolderPlus className="h-4 w-4" />
                  Kategorie
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Neue Kategorie erstellen</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="catName">Kategoriename</Label>
                    <Input
                      id="catName"
                      value={newKategorieName}
                      onChange={(e) => setNewKategorieName(e.target.value)}
                      placeholder="z.B. Einsatzberichte"
                    />
                  </div>
                  <Button
                    onClick={handleAddKategorie}
                    disabled={isSaving}
                    className="w-full"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Speichern...
                      </>
                    ) : (
                      "Erstellen"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isDocDialogOpen} onOpenChange={setIsDocDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Dokument
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Neues Dokument hinzufügen</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="kategorie">Kategorie</Label>
                    <Select value={selectedKategorie} onValueChange={setSelectedKategorie}>
                      <SelectTrigger>
                        <SelectValue placeholder="Kategorie wählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        {kategorien.map((kat) => (
                          <SelectItem key={kat.id} value={kat.id}>
                            {kat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Titel / Überschrift</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="z.B. Protokoll vom 15.01.2026"
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
          </div>
        )}
      </div>

      {/* Edit Kategorie Dialog */}
      <Dialog open={!!editingKategorie} onOpenChange={(open) => !open && setEditingKategorie(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kategorie bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="editCatName">Kategoriename</Label>
              <Input
                id="editCatName"
                value={editKategorieName}
                onChange={(e) => setEditKategorieName(e.target.value)}
              />
            </div>
            <Button
              onClick={handleUpdateKategorie}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Speichern...
                </>
              ) : (
                "Speichern"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {kategorien.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Noch keine Kategorien vorhanden</p>
            {isAdmin && (
              <p className="text-sm text-muted-foreground mt-2">
                Erstelle zuerst eine Kategorie, um Dokumente hinzuzufügen.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {kategorien.map((kategorie) => {
            const docs = getDokumenteByKategorie(kategorie.id);
            const isExpanded = expandedCategories.has(kategorie.id);

            return (
              <Collapsible
                key={kategorie.id}
                open={isExpanded}
                onOpenChange={() => toggleCategory(kategorie.id)}
              >
                <Card>
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CollapsibleTrigger asChild>
                        <button className="flex items-center gap-2 hover:text-primary transition-colors">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                          <CardTitle className="text-lg">{kategorie.name}</CardTitle>
                          <span className="text-sm text-muted-foreground">
                            ({docs.length} {docs.length === 1 ? "Dokument" : "Dokumente"})
                          </span>
                        </button>
                      </CollapsibleTrigger>
                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingKategorie(kategorie);
                              setEditKategorieName(kategorie.name);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
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
                                <AlertDialogTitle>Kategorie löschen?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Möchten Sie die Kategorie "{kategorie.name}" wirklich löschen?
                                  Dokumente in dieser Kategorie werden nicht gelöscht.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteKategorie(kategorie)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Löschen
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      {docs.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                          Keine Dokumente in dieser Kategorie
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {docs.map((dokument) => (
                            <div
                              key={dokument.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                            >
                              <div className="flex-1 min-w-0">
                                <a
                                  href={dokument.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2"
                                >
                                  {dokument.title}
                                  <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  von {dokument.created_by_name} · {formatDate(dokument.created_at)}
                                </p>
                              </div>
                              {isAdmin && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Dokument löschen?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Möchten Sie das Dokument "{dokument.title}" wirklich löschen?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteDokument(dokument)}
                                        className="bg-destructive hover:bg-destructive/90"
                                      >
                                        Löschen
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}

          {/* Uncategorized documents */}
          {getUncategorizedDokumente().length > 0 && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-lg text-muted-foreground">Ohne Kategorie</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {getUncategorizedDokumente().map((dokument) => (
                    <div
                      key={dokument.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <a
                          href={dokument.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2"
                        >
                          {dokument.title}
                          <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          von {dokument.created_by_name} · {formatDate(dokument.created_at)}
                        </p>
                      </div>
                      {isAdmin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Dokument löschen?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Möchten Sie das Dokument "{dokument.title}" wirklich löschen?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteDokument(dokument)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Löschen
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
