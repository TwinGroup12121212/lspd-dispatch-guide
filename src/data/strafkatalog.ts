export interface Straftat {
  id: string;
  name: string;
  geldstrafe: number;
  haftzeit: number; // in Minuten
  punkte?: number;
}

export interface Kategorie {
  id: string;
  name: string;
  icon: string;
  straftaten: Straftat[];
}

export const strafkatalog: Kategorie[] = [
  {
    id: "verkehr",
    name: "Verkehrsdelikte",
    icon: "🚗",
    straftaten: [
      { id: "v1", name: "Geschwindigkeitsüberschreitung (bis 20 km/h)", geldstrafe: 500, haftzeit: 0, punkte: 1 },
      { id: "v2", name: "Geschwindigkeitsüberschreitung (20-40 km/h)", geldstrafe: 1500, haftzeit: 0, punkte: 2 },
      { id: "v3", name: "Geschwindigkeitsüberschreitung (über 40 km/h)", geldstrafe: 3000, haftzeit: 5, punkte: 3 },
      { id: "v4", name: "Fahren ohne Führerschein", geldstrafe: 5000, haftzeit: 10, punkte: 3 },
      { id: "v5", name: "Unfallflucht", geldstrafe: 7500, haftzeit: 15, punkte: 4 },
      { id: "v6", name: "Fahren unter Alkoholeinfluss", geldstrafe: 10000, haftzeit: 20, punkte: 5 },
      { id: "v7", name: "Fahren unter Drogeneinfluss", geldstrafe: 15000, haftzeit: 25, punkte: 5 },
      { id: "v8", name: "Illegales Straßenrennen", geldstrafe: 20000, haftzeit: 30, punkte: 6 },
    ],
  },
  {
    id: "gewalt",
    name: "Gewaltdelikte",
    icon: "⚠️",
    straftaten: [
      { id: "g1", name: "Beleidigung", geldstrafe: 1000, haftzeit: 0 },
      { id: "g2", name: "Bedrohung", geldstrafe: 3000, haftzeit: 5 },
      { id: "g3", name: "Leichte Körperverletzung", geldstrafe: 5000, haftzeit: 10 },
      { id: "g4", name: "Schwere Körperverletzung", geldstrafe: 15000, haftzeit: 30 },
      { id: "g5", name: "Geiselnahme", geldstrafe: 50000, haftzeit: 60 },
      { id: "g6", name: "Versuchter Mord", geldstrafe: 75000, haftzeit: 90 },
      { id: "g7", name: "Mord", geldstrafe: 100000, haftzeit: 120 },
    ],
  },
  {
    id: "eigentum",
    name: "Eigentumsdelikte",
    icon: "💰",
    straftaten: [
      { id: "e1", name: "Diebstahl (geringwertig)", geldstrafe: 2000, haftzeit: 5 },
      { id: "e2", name: "Diebstahl", geldstrafe: 5000, haftzeit: 10 },
      { id: "e3", name: "Schwerer Diebstahl", geldstrafe: 10000, haftzeit: 20 },
      { id: "e4", name: "Einbruch", geldstrafe: 15000, haftzeit: 25 },
      { id: "e5", name: "Raub", geldstrafe: 25000, haftzeit: 40 },
      { id: "e6", name: "Schwerer Raub", geldstrafe: 40000, haftzeit: 50 },
      { id: "e7", name: "Bankraub", geldstrafe: 75000, haftzeit: 80 },
      { id: "e8", name: "Hehlerei", geldstrafe: 8000, haftzeit: 15 },
    ],
  },
  {
    id: "waffen",
    name: "Waffendelikte",
    icon: "🔫",
    straftaten: [
      { id: "w1", name: "Illegaler Waffenbesitz (Nahkampf)", geldstrafe: 3000, haftzeit: 5 },
      { id: "w2", name: "Illegaler Waffenbesitz (Schusswaffe)", geldstrafe: 10000, haftzeit: 20 },
      { id: "w3", name: "Illegaler Waffenbesitz (Automatik)", geldstrafe: 25000, haftzeit: 40 },
      { id: "w4", name: "Waffenhandel", geldstrafe: 50000, haftzeit: 60 },
      { id: "w5", name: "Schusswaffengebrauch", geldstrafe: 20000, haftzeit: 35 },
    ],
  },
  {
    id: "drogen",
    name: "Drogendelikte",
    icon: "💊",
    straftaten: [
      { id: "d1", name: "Drogenbesitz (geringe Menge)", geldstrafe: 5000, haftzeit: 10 },
      { id: "d2", name: "Drogenbesitz", geldstrafe: 15000, haftzeit: 25 },
      { id: "d3", name: "Drogenhandel (klein)", geldstrafe: 30000, haftzeit: 45 },
      { id: "d4", name: "Drogenhandel (groß)", geldstrafe: 60000, haftzeit: 70 },
      { id: "d5", name: "Drogenproduktion", geldstrafe: 80000, haftzeit: 90 },
    ],
  },
  {
    id: "staat",
    name: "Staatsdelikte",
    icon: "🏛️",
    straftaten: [
      { id: "s1", name: "Widerstand gegen Vollstreckungsbeamte", geldstrafe: 5000, haftzeit: 15 },
      { id: "s2", name: "Flucht vor der Polizei", geldstrafe: 8000, haftzeit: 20 },
      { id: "s3", name: "Behinderung der Justiz", geldstrafe: 10000, haftzeit: 25 },
      { id: "s4", name: "Bestechung", geldstrafe: 25000, haftzeit: 40 },
      { id: "s5", name: "Amtsanmaßung", geldstrafe: 15000, haftzeit: 30 },
      { id: "s6", name: "Gefängnisausbruch", geldstrafe: 30000, haftzeit: 50 },
      { id: "s7", name: "Terrorismus", geldstrafe: 150000, haftzeit: 150 },
    ],
  },
];
