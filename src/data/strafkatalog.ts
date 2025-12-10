export type StraftatTyp = "Verbrechen" | "Ordnungswidrigkeit" | "Verstoß";

export interface Straftat {
  id: string;
  name: string;
  typ: StraftatTyp;
  geldstrafe: number;
  haftzeit: number;
}

export interface Kategorie {
  id: string;
  name: string;
  straftaten: Straftat[];
}

export const strafkatalog: Kategorie[] = [
  {
    id: "betaeubungsmittel",
    name: "Betäubungsmittelgesetz",
    straftaten: [
      { id: "weiche-drogen", name: "Weiche Drogen", typ: "Verbrechen", geldstrafe: 1000, haftzeit: 10 },
      { id: "klein-handel", name: "Klein Handel", typ: "Verbrechen", geldstrafe: 0, haftzeit: 25 },
      { id: "mittlerer-handel", name: "Mittlerer Handel", typ: "Verbrechen", geldstrafe: 0, haftzeit: 35 },
      { id: "grosshandel", name: "Großhandel", typ: "Verbrechen", geldstrafe: 0, haftzeit: 45 },
      { id: "herstellung-drogenlabor", name: "Herstellung/Drogenlabor", typ: "Verbrechen", geldstrafe: 0, haftzeit: 40 },
    ],
  },
  {
    id: "gewalt-raub-eigentum",
    name: "Gewalt-, Raub- und Eigentumdelikte",
    straftaten: [
      { id: "einfache-koerperverletzung", name: "Einfache Körperverletzung", typ: "Verbrechen", geldstrafe: 1000, haftzeit: 15 },
      { id: "gefaehrliche-koerperverletzung", name: "Gefährliche Körperverletzung", typ: "Verbrechen", geldstrafe: 2000, haftzeit: 30 },
      { id: "schwere-koerperverletzung", name: "Schwere Körperverletzung", typ: "Verbrechen", geldstrafe: 3000, haftzeit: 40 },
      { id: "fahrlaessige-toetung", name: "Fahrlässige Tötung", typ: "Verbrechen", geldstrafe: 3000, haftzeit: 40 },
      { id: "totschlag", name: "Totschlag", typ: "Verbrechen", geldstrafe: 6000, haftzeit: 80 },
      { id: "mord-versuchter-mord", name: "Mord/ versuchter Mord", typ: "Verbrechen", geldstrafe: 0, haftzeit: 120 },
      { id: "einfacher-raub", name: "Einfacher Raub", typ: "Verbrechen", geldstrafe: 3000, haftzeit: 35 },
      { id: "hausraub", name: "Hausraub", typ: "Verbrechen", geldstrafe: 5000, haftzeit: 55 },
      { id: "ladenraub", name: "Ladenraub", typ: "Verbrechen", geldstrafe: 4000, haftzeit: 40 },
      { id: "bankraub", name: "Bankraub", typ: "Verbrechen", geldstrafe: 8000, haftzeit: 80 },
      { id: "geldautomatenraub", name: "Geldautomatenraub", typ: "Verbrechen", geldstrafe: 5000, haftzeit: 60 },
      { id: "fahrzeugraub", name: "Fahrzeugraub", typ: "Verbrechen", geldstrafe: 4500, haftzeit: 45 },
      { id: "einbruchdiebstahl-tresoraufbruch", name: "Einbruchdiebstahl/Tresoraufbruch", typ: "Verbrechen", geldstrafe: 5000, haftzeit: 50 },
    ],
  },
  {
    id: "korruption-amtsmissbrauch",
    name: "Korruption, Amtsmissbrauch und Amtsanmaßung",
    straftaten: [
      { id: "vorteilsannahme-bestechung", name: "Vorteilsannahme / Bestechung", typ: "Verbrechen", geldstrafe: 2500, haftzeit: 25 },
      { id: "amtsmissbrauch", name: "Amtsmissbrauch", typ: "Verbrechen", geldstrafe: 4000, haftzeit: 40 },
      { id: "geheimnisverrat-informationsverkauf", name: "Geheimnisverrat / Informationsverkauf", typ: "Verbrechen", geldstrafe: 5000, haftzeit: 50 },
      { id: "behinderung-fib-verfahren", name: "Behinderung eines FIB-Verfahrens", typ: "Verbrechen", geldstrafe: 4000, haftzeit: 45 },
    ],
  },
  {
    id: "prostitution-menschenhandel",
    name: "Prostitution und Menschenhandel",
    straftaten: [
      { id: "unerlaubte-prostitution", name: "Unerlaubte Prostitution/ Verstoß gegen Auflagen", typ: "Verbrechen", geldstrafe: 1000, haftzeit: 10 },
      { id: "zwangsprostitution-menschenhandel", name: "Zwangsprostitution/Menschenhandel", typ: "Verbrechen", geldstrafe: 6000, haftzeit: 70 },
      { id: "zuhaelterei-ausbeutung", name: "Zuhälterei/Ausbeutung", typ: "Verbrechen", geldstrafe: 3000, haftzeit: 40 },
    ],
  },
  {
    id: "verkehrsrecht",
    name: "Verkehrsrecht der Stadt Los Santos",
    straftaten: [
      { id: "fahren-ohne-papiere", name: "§ 103 Fahren ohne Fahrzeugpapiere", typ: "Ordnungswidrigkeit", geldstrafe: 300, haftzeit: 10 },
      { id: "falschparken", name: "§ 106 Falschparken", typ: "Ordnungswidrigkeit", geldstrafe: 150, haftzeit: 0 },
      { id: "gefaehrdung-strassenverkehr", name: "§ 108 Gefährdung des Straßenverkehrs", typ: "Ordnungswidrigkeit", geldstrafe: 300, haftzeit: 0 },
      { id: "unfallflucht", name: "§ 111 Unfallflucht", typ: "Ordnungswidrigkeit", geldstrafe: 1000, haftzeit: 10 },
      { id: "fahren-ohne-fuehrerschein", name: "§ 102 Fahren ohne gültigen Führerschein", typ: "Verstoß", geldstrafe: 1000, haftzeit: 10 },
      { id: "illegale-strassenrennen", name: "§ 109 Illegale Straßenrennen", typ: "Verbrechen", geldstrafe: 2000, haftzeit: 20 },
      { id: "fahren-unter-einfluss", name: "§ 110 Fahren unter Drogeneinfluss / Alkohol", typ: "Verbrechen", geldstrafe: 1500, haftzeit: 15 },
    ],
  },
  {
    id: "waffen-sprengstoff",
    name: "Waffen- und Sprengstoffrecht",
    straftaten: [
      { id: "unerlaubter-besitz-handfeuerwaffe", name: "Unerlaubter Besitz einer Handfeuerwaffe", typ: "Verbrechen", geldstrafe: 2000, haftzeit: 20 },
      { id: "unerlaubtes-fuehren-handfeuerwaffe", name: "Unerlaubtes Führen einer Handfeuerwaffe", typ: "Verbrechen", geldstrafe: 2500, haftzeit: 25 },
      { id: "besitz-langwaffe-zivil", name: "Besitz einer Langwaffe (zivil)", typ: "Verbrechen", geldstrafe: 3000, haftzeit: 35 },
      { id: "handel-langwaffen", name: "Handel mit Langwaffen", typ: "Verbrechen", geldstrafe: 4500, haftzeit: 45 },
      { id: "besitz-sprengstoff", name: "Besitz von Sprengstoff", typ: "Verbrechen", geldstrafe: 5000, haftzeit: 50 },
      { id: "vorbereitung-anschlag", name: "Vorbereitung eines Anschlags", typ: "Verbrechen", geldstrafe: 0, haftzeit: 70 },
    ],
  },
  {
    id: "geschwindigkeit",
    name: "§ 105 Geschwindigkeitsüberschreitungen Innerorts (max. 115 km/h) Landstraße: - 50 % niedriger",
    straftaten: [
      { id: "geschwindigkeit-1-20", name: "1-20 km/h 150-300 $", typ: "Verbrechen", geldstrafe: 150, haftzeit: 0 },
      { id: "geschwindigkeit-21-40", name: "21-40 km/h 300-600 $", typ: "Verbrechen", geldstrafe: 300, haftzeit: 0 },
      { id: "geschwindigkeit-41-60", name: "41-60 km/h 750-1 000 $", typ: "Verbrechen", geldstrafe: 750, haftzeit: 0 },
      { id: "geschwindigkeit-61-100", name: "61-100 km/h 1 250-1 750 $", typ: "Verbrechen", geldstrafe: 1250, haftzeit: 0 },
      { id: "geschwindigkeit-ueber-100", name: "über 100 km/h 1 500-2 000 $ (KEINE HE)", typ: "Verbrechen", geldstrafe: 1500, haftzeit: 0 },
    ],
  },
];
