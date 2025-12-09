export interface Straftat {
  id: string;
  name: string;
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
    id: "staat",
    name: "Allgemeine Delikte",
    straftaten: [
      { id: "bestechung", name: "Bestechung", geldstrafe: 2500, haftzeit: 25 },
      { id: "amtsmissbrauch", name: "Amtsmissbrauch", geldstrafe: 4000, haftzeit: 40 },
      { id: "informationsverkauf", name: "Informationsverkauf", geldstrafe: 5000, haftzeit: 50 },
      { id: "behinderung-fib", name: "Behinderung FIB", geldstrafe: 4000, haftzeit: 45 },
      { id: "prostitution", name: "Prostitution", geldstrafe: 1000, haftzeit: 10 },
      { id: "zwangs-prostitution", name: "Zwangs Prostitution", geldstrafe: 6000, haftzeit: 70 },
      { id: "beamtenbeleidigung", name: "Beamtenbeleidigung", geldstrafe: 800, haftzeit: 10 },
      { id: "widerstand", name: "Widerstand gegen Vollstreckungsbeamte", geldstrafe: 1500, haftzeit: 15 },
      { id: "flucht", name: "Flucht vor der Polizei", geldstrafe: 2000, haftzeit: 20 },
      { id: "falschaussage", name: "Falschaussage", geldstrafe: 1200, haftzeit: 15 },
    ],
  },
  {
    id: "eigentum",
    name: "Eigentumsdelikte",
    straftaten: [
      { id: "diebstahl", name: "Diebstahl", geldstrafe: 1000, haftzeit: 10 },
      { id: "schwerer-diebstahl", name: "Schwerer Diebstahl", geldstrafe: 2500, haftzeit: 25 },
      { id: "raub", name: "Raub", geldstrafe: 3500, haftzeit: 35 },
      { id: "schwerer-raub", name: "Schwerer Raub", geldstrafe: 5000, haftzeit: 50 },
      { id: "einbruch", name: "Einbruch", geldstrafe: 2000, haftzeit: 20 },
      { id: "hehlerei", name: "Hehlerei", geldstrafe: 1500, haftzeit: 15 },
      { id: "sachbeschaedigung", name: "Sachbeschädigung", geldstrafe: 800, haftzeit: 8 },
      { id: "brandstiftung", name: "Brandstiftung", geldstrafe: 4000, haftzeit: 40 },
      { id: "fahrzeugdiebstahl", name: "Fahrzeugdiebstahl", geldstrafe: 3000, haftzeit: 30 },
    ],
  },
  {
    id: "verkehr",
    name: "Verkehrsdelikte",
    straftaten: [
      { id: "geschwindigkeit", name: "Geschwindigkeitsüberschreitung", geldstrafe: 500, haftzeit: 0 },
      { id: "rotlicht", name: "Überfahren einer roten Ampel", geldstrafe: 350, haftzeit: 0 },
      { id: "falschparken", name: "Falschparken", geldstrafe: 200, haftzeit: 0 },
      { id: "gefaehrdung", name: "Gefährdung des Straßenverkehrs", geldstrafe: 1500, haftzeit: 15 },
      { id: "fahrerflucht", name: "Fahrerflucht", geldstrafe: 2000, haftzeit: 20 },
      { id: "illegales-rennen", name: "Illegales Straßenrennen", geldstrafe: 3000, haftzeit: 30 },
      { id: "fahren-ohne-fuehrerschein", name: "Fahren ohne Führerschein", geldstrafe: 1000, haftzeit: 10 },
      { id: "trunkenheit", name: "Trunkenheit am Steuer", geldstrafe: 2000, haftzeit: 20 },
    ],
  },
  {
    id: "drogen",
    name: "Drogendelikte",
    straftaten: [
      { id: "besitz-marihuana", name: "Besitz von Marihuana", geldstrafe: 500, haftzeit: 5 },
      { id: "besitz-kokain", name: "Besitz von Kokain", geldstrafe: 1500, haftzeit: 15 },
      { id: "besitz-meth", name: "Besitz von Methamphetamin", geldstrafe: 2000, haftzeit: 20 },
      { id: "handel-drogen", name: "Drogenhandel", geldstrafe: 5000, haftzeit: 50 },
      { id: "herstellung-drogen", name: "Drogenherstellung", geldstrafe: 8000, haftzeit: 80 },
      { id: "schmuggel", name: "Drogenschmuggel", geldstrafe: 6000, haftzeit: 60 },
    ],
  },
  {
    id: "waffen",
    name: "Waffen",
    straftaten: [
      { id: "illegaler-waffenbesitz", name: "Illegaler Waffenbesitz", geldstrafe: 2000, haftzeit: 20 },
      { id: "waffenhandel", name: "Illegaler Waffenhandel", geldstrafe: 6000, haftzeit: 60 },
      { id: "bedrohung-waffe", name: "Bedrohung mit Schusswaffe", geldstrafe: 2500, haftzeit: 25 },
      { id: "schiessen-stadt", name: "Schießen in der Öffentlichkeit", geldstrafe: 3000, haftzeit: 30 },
      { id: "verbotene-waffen", name: "Besitz verbotener Waffen", geldstrafe: 4000, haftzeit: 40 },
    ],
  },
];
