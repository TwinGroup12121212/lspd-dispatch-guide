import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Trash2, User, Car, MapPin, FileText, Clock } from "lucide-react";
import { toast } from "sonner";

interface Formular {
  einsatznummer: string;
  datum: string;
  uhrzeit: string;
  beamter: string;
  dienstnummer: string;
  verdaechtiger: string;
  geburtsdatum: string;
  telefon: string;
  fahrzeug: string;
  kennzeichen: string;
  tatort: string;
  tatzeit: string;
  sachverhalt: string;
  massnahmen: string;
  status: string;
}

const initialFormular: Formular = {
  einsatznummer: "",
  datum: new Date().toISOString().split("T")[0],
  uhrzeit: new Date().toTimeString().slice(0, 5),
  beamter: "",
  dienstnummer: "",
  verdaechtiger: "",
  geburtsdatum: "",
  telefon: "",
  fahrzeug: "",
  kennzeichen: "",
  tatort: "",
  tatzeit: "",
  sachverhalt: "",
  massnahmen: "",
  status: "offen",
};

export default function Leitstellenblatt() {
  const [formular, setFormular] = useState<Formular>(initialFormular);

  const handleChange = (field: keyof Formular, value: string) => {
    setFormular((prev) => ({ ...prev, [field]: value }));
  };

  const handleClear = () => {
    setFormular({
      ...initialFormular,
      datum: new Date().toISOString().split("T")[0],
      uhrzeit: new Date().toTimeString().slice(0, 5),
    });
    toast.success("Formular zurückgesetzt");
  };

  const handleCopy = () => {
    const text = `=== LSPD LEITSTELLENBLATT ===

EINSATZ-INFORMATIONEN
Einsatznummer: ${formular.einsatznummer}
Datum: ${formular.datum}
Uhrzeit: ${formular.uhrzeit}
Status: ${formular.status.toUpperCase()}

BEAMTER
Name: ${formular.beamter}
Dienstnummer: ${formular.dienstnummer}

VERDÄCHTIGER/BETEILIGTER
Name: ${formular.verdaechtiger}
Geburtsdatum: ${formular.geburtsdatum}
Telefon: ${formular.telefon}

FAHRZEUG
Fahrzeug: ${formular.fahrzeug}
Kennzeichen: ${formular.kennzeichen}

TATORT & TATZEIT
Ort: ${formular.tatort}
Zeit: ${formular.tatzeit}

SACHVERHALT
${formular.sachverhalt}

MASSNAHMEN
${formular.massnahmen}

===========================`;

    navigator.clipboard.writeText(text);
    toast.success("Leitstellenblatt kopiert!");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leitstellenblatt</h1>
          <p className="text-sm text-muted-foreground">Einsatz-Dokumentation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClear}>
            <Trash2 className="w-4 h-4 mr-2" />
            Zurücksetzen
          </Button>
          <Button onClick={handleCopy} className="glow-primary">
            <Copy className="w-4 h-4 mr-2" />
            Kopieren
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Einsatz-Informationen */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Einsatz-Informationen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="einsatznummer">Einsatznummer</Label>
                <Input
                  id="einsatznummer"
                  value={formular.einsatznummer}
                  onChange={(e) => handleChange("einsatznummer", e.target.value)}
                  placeholder="E-2024-001"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formular.status} onValueChange={(v) => handleChange("status", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offen">Offen</SelectItem>
                    <SelectItem value="aktiv">Aktiv</SelectItem>
                    <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
                    <SelectItem value="archiviert">Archiviert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="datum">Datum</Label>
                <Input
                  id="datum"
                  type="date"
                  value={formular.datum}
                  onChange={(e) => handleChange("datum", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uhrzeit">Uhrzeit</Label>
                <Input
                  id="uhrzeit"
                  type="time"
                  value={formular.uhrzeit}
                  onChange={(e) => handleChange("uhrzeit", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="beamter">Beamter</Label>
                <Input
                  id="beamter"
                  value={formular.beamter}
                  onChange={(e) => handleChange("beamter", e.target.value)}
                  placeholder="Max Mustermann"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dienstnummer">Dienstnummer</Label>
                <Input
                  id="dienstnummer"
                  value={formular.dienstnummer}
                  onChange={(e) => handleChange("dienstnummer", e.target.value)}
                  placeholder="LSPD-001"
                  className="font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verdächtiger/Beteiligter */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Verdächtiger / Beteiligter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verdaechtiger">Name</Label>
              <Input
                id="verdaechtiger"
                value={formular.verdaechtiger}
                onChange={(e) => handleChange("verdaechtiger", e.target.value)}
                placeholder="Vor- und Nachname"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="geburtsdatum">Geburtsdatum</Label>
                <Input
                  id="geburtsdatum"
                  type="date"
                  value={formular.geburtsdatum}
                  onChange={(e) => handleChange("geburtsdatum", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefon">Telefon</Label>
                <Input
                  id="telefon"
                  value={formular.telefon}
                  onChange={(e) => handleChange("telefon", e.target.value)}
                  placeholder="555-1234"
                  className="font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fahrzeug */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Car className="w-4 h-4 text-primary" />
              Fahrzeug
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fahrzeug">Fahrzeug</Label>
              <Input
                id="fahrzeug"
                value={formular.fahrzeug}
                onChange={(e) => handleChange("fahrzeug", e.target.value)}
                placeholder="z.B. Bravado Buffalo, schwarz"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kennzeichen">Kennzeichen</Label>
              <Input
                id="kennzeichen"
                value={formular.kennzeichen}
                onChange={(e) => handleChange("kennzeichen", e.target.value)}
                placeholder="LS-AB-123"
                className="font-mono uppercase"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tatort */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Tatort & Tatzeit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tatort">Tatort</Label>
              <Input
                id="tatort"
                value={formular.tatort}
                onChange={(e) => handleChange("tatort", e.target.value)}
                placeholder="z.B. Vinewood Boulevard / Alta Street"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tatzeit">Tatzeit</Label>
              <Input
                id="tatzeit"
                value={formular.tatzeit}
                onChange={(e) => handleChange("tatzeit", e.target.value)}
                placeholder="z.B. ca. 14:30 Uhr"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sachverhalt */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Sachverhalt & Maßnahmen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sachverhalt">Sachverhalt</Label>
              <Textarea
                id="sachverhalt"
                value={formular.sachverhalt}
                onChange={(e) => handleChange("sachverhalt", e.target.value)}
                placeholder="Beschreibung des Vorfalls..."
                className="min-h-[120px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="massnahmen">Getroffene Maßnahmen</Label>
              <Textarea
                id="massnahmen"
                value={formular.massnahmen}
                onChange={(e) => handleChange("massnahmen", e.target.value)}
                placeholder="z.B. Festnahme, Durchsuchung, Verwarnung..."
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
