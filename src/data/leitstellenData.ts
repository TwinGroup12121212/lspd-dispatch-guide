export interface Beamter {
  id: string;
  rang: string;
  dienstnummer: string;
  name: string;
  hinweis: string;
  status: string;
}

export interface Streife {
  id: string;
  name: string;
  fahrzeug: string;
  fahrer: string;
  funker: string;
  beifahrer?: string;
}

export const dienstStatusOptionen = [
  { value: "besprechung", label: "BESPRECHUNG", color: "bg-cyan-600" },
  { value: "normal", label: "NORMALER STREIFENDIENST", color: "bg-cyan-700" },
  { value: "gefuehrt", label: "GEFÜHRTER STREIFENDIENST", color: "bg-cyan-800" },
  { value: "einsatzbereit", label: "EINSATZBEREITSCHAFT IM PD", color: "bg-cyan-900" },
  { value: "code_red", label: "CODE RED", color: "bg-red-600" },
];

export const statusOptionen = [
  { value: "-", label: "-" },
  { value: "frei", label: "Frei", color: "bg-green-500" },
  { value: "abruf", label: "Abruf", color: "bg-yellow-500" },
  { value: "code6", label: "Code 6", color: "bg-orange-500" },
  { value: "defekt", label: "Defekt", color: "bg-red-500" },
  { value: "md", label: "MD", color: "bg-pink-500" },
];

export const fahrzeugOptionen = [
  "Charger",
  "Mustang Speedunit",
  "Unmarked",
  "OVERWATCH",
  "Crown Vic",
  "Interceptor",
];

export const tenCodes = [
  { code: "10-01", bedeutung: "Dienstbeitritt" },
  { code: "10-02", bedeutung: "Dienstaustritt" },
  { code: "10-04", bedeutung: "Verstanden" },
  { code: "10-05", bedeutung: "Letzten Funkspruch wiederholen" },
  { code: "10-10", bedeutung: "Statusupdate" },
  { code: "10-20", bedeutung: "Aktuelle Position" },
  { code: "10-30", bedeutung: "Verkehrskontrolle (RTS)" },
  { code: "10-35", bedeutung: "Abholung benötigt" },
  { code: "10-40", bedeutung: "Raub im Gange" },
  { code: "10-50", bedeutung: "Verkehrsunfall" },
  { code: "10-60", bedeutung: "Ambulance benötigt" },
  { code: "10-70", bedeutung: "Overwatch benötigt" },
  { code: "10-75", bedeutung: "Verstärkung benötigt" },
  { code: "10-80", bedeutung: "Aktive Verfolgungsjagd" },
  { code: "11-90", bedeutung: "Beamter in Bedrängnis" },
];

export const codes = [
  { code: "Code 1", bedeutung: "Auf Streife" },
  { code: "Code 2", bedeutung: "Anfahrt ohne Sonderrechte" },
  { code: "Code 3", bedeutung: "Anfahrt mit Sonderrechte" },
  { code: "Code 4", bedeutung: "Situation unter Kontrolle" },
  { code: "Code 5", bedeutung: "Einsatz beendet" },
  { code: "Code 6", bedeutung: "Pause / Nicht verfügbar" },
  { code: "Code 12", bedeutung: "Verstärkung" },
  { code: "Code 99", bedeutung: "Möglicher Hinterhalt", highlight: true },
  { code: "Code RED", bedeutung: "Ausnahmezustand", highlight: true },
];

export const dienstStatusBeschreibungen = [
  {
    titel: "BESPRECHUNG",
    beschreibung: "Alle Beamten sind angewiesen sich vor Beginn der Besprechung am Besprechungsort einzufinden",
  },
  {
    titel: "NORMALER STREIFENDIENST", 
    beschreibung: "Streifendienst gemäß eigener Lagebeurteilung",
  },
  {
    titel: "GEFÜHRTER STREIFENDIENST",
    beschreibung: "Streifeneinteilung und Streifen-Bereiche gemäß Weisung des Supervisor bzw. Führungsebene",
  },
  {
    titel: "EINSATZBEREITSCHAFT IM PD",
    beschreibung: "Alle Beamten sind angewiesen sich Einsatzbereit in der Garage des LAPD aufzustellen",
  },
];

export const rechteVorlesen = `Sie haben das Recht zu Schweigen.
Alles was Sie sagen kann und wird vor Gericht gegen Sie verwendet werden.
Sie haben das Recht auf einen Anwalt, sollte sich kein Anwalt im Staate befinden, wird Ihnen auch keiner gestellt.
Sollte die Judikative nicht im Staat befindlich sein, so übernimmt das LS PD diese Aufgabe.

Haben Sie Ihre Rechte verstanden?"`;
