import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PersonalTabelle } from "@/components/leitstelle/PersonalTabelle";
import { StreifeKarte } from "@/components/leitstelle/StreifeKarte";
import { CodesTabelle } from "@/components/leitstelle/CodesTabelle";
import { DienstStatusInfo } from "@/components/leitstelle/DienstStatusInfo";
import { dienstStatusOptionen, tenCodes, codes } from "@/data/leitstellenData";
import { Checkbox } from "@/components/ui/checkbox";

// Helper to create empty rows
const createEmptyRows = (count: number, prefix: string) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i}`,
    rangDnName: "",
    hinweis: "",
    status: "-",
  }));

const createEmptyStreife = (id: string) => ({
  fahrzeug: "Charger",
  fahrzeugStatus: "-",
  fahrer: "",
  funker: "",
  beifahrer: "",
});

export default function Leitstellenblatt() {
  const [dienstStatus, setDienstStatus] = useState("normal");
  const [leitstelleLeiter, setLeitstelleLeiter] = useState("");
  const [leitstelleStellvertreter, setLeitstelleStellvertreter] = useState("");
  const [supervisorLeiter, setSupervisorLeiter] = useState("");
  const [supervisorStellvertreter, setSupervisorStellvertreter] = useState("");
  const [hinweise, setHinweise] = useState("");

  // Personal Tabellen State
  const [leitung, setLeitung] = useState(createEmptyRows(4, "leitung"));
  const [detectives, setDetectives] = useState(createEmptyRows(10, "det"));
  const [seniorOfficer, setSeniorOfficer] = useState(createEmptyRows(10, "so"));
  const [officer, setOfficer] = useState(createEmptyRows(10, "off"));
  const [rookies, setRookies] = useState(createEmptyRows(10, "rook"));

  // Streifen State
  const [streifen, setStreifen] = useState({
    adam1: createEmptyStreife("adam1"),
    adam2: createEmptyStreife("adam2"),
    adam3: createEmptyStreife("adam3"),
    adam4: createEmptyStreife("adam4"),
    adam5: createEmptyStreife("adam5"),
    lincoln1: createEmptyStreife("lincoln1"),
    lincoln2: createEmptyStreife("lincoln2"),
    phoenix: createEmptyStreife("phoenix"),
    henry1: createEmptyStreife("henry1"),
    adam1000: createEmptyStreife("adam1000"),
  });

  const updatePersonal = (
    setter: React.Dispatch<React.SetStateAction<any[]>>,
    id: string,
    field: string,
    value: string
  ) => {
    setter((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const updateStreife = (streifeId: string, field: string, value: string) => {
    setStreifen((prev) => ({
      ...prev,
      [streifeId]: { ...prev[streifeId as keyof typeof prev], [field]: value },
    }));
  };

  return (
    <div className="p-4 space-y-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-4 px-6 rounded-lg text-center">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wider">
          LOS SANTOS POLICE DEPARTMENT - To Protect and to Serve
        </h1>
      </div>

      {/* Leitstelle & Dienst Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Leitstelle */}
        <div className="space-y-2">
          <div className="bg-cyan-600 text-primary-foreground px-3 py-2 rounded-t font-bold text-center">
            LEITSTELLE - ADAM 100
          </div>
          <div className="bg-card border border-border rounded-b p-2 space-y-2">
            <div className="grid grid-cols-3 gap-2 items-center">
              <span className="text-sm">Leiter</span>
              <Input
                value={leitstelleLeiter}
                onChange={(e) => setLeitstelleLeiter(e.target.value)}
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 items-center">
              <span className="text-sm">Stellvertreter</span>
              <Input
                value={leitstelleStellvertreter}
                onChange={(e) => setLeitstelleStellvertreter(e.target.value)}
                className="col-span-2 h-8"
              />
            </div>
          </div>

          <div className="bg-orange-600 text-primary-foreground px-3 py-2 font-bold text-center text-sm">
            Supervisor / Führungsebene - ADAM 1000
          </div>
          <div className="bg-card border border-border rounded-b p-2 space-y-2">
            <div className="grid grid-cols-3 gap-2 items-center">
              <span className="text-sm">Leiter</span>
              <Input
                value={supervisorLeiter}
                onChange={(e) => setSupervisorLeiter(e.target.value)}
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 items-center">
              <span className="text-sm">Stellvertreter</span>
              <Input
                value={supervisorStellvertreter}
                onChange={(e) => setSupervisorStellvertreter(e.target.value)}
                className="col-span-2 h-8"
              />
            </div>
          </div>
        </div>

        {/* Dienst Status */}
        <div className="space-y-2">
          <div className="bg-cyan-700 text-primary-foreground px-3 py-2 rounded-t font-bold text-center">
            DIENST STATUS
          </div>
          <div className="bg-card border border-border rounded-b p-2 space-y-1">
            {dienstStatusOptionen.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer transition-colors ${
                  dienstStatus === opt.value
                    ? "bg-primary/20 border border-primary"
                    : "hover:bg-secondary/50"
                }`}
              >
                <Checkbox
                  checked={dienstStatus === opt.value}
                  onCheckedChange={() => setDienstStatus(opt.value)}
                />
                <span className="text-sm font-medium">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Hinweise */}
        <div className="space-y-2">
          <div className="bg-destructive text-destructive-foreground px-3 py-2 rounded-t font-bold text-center">
            Hinweise
          </div>
          <Textarea
            value={hinweise}
            onChange={(e) => setHinweise(e.target.value)}
            className="min-h-[200px] bg-card border-border"
            placeholder="Wichtige Hinweise für die Schicht..."
          />
        </div>
      </div>

      {/* Personal Tabellen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <PersonalTabelle
          titel="Leitung des LSPD"
          titelFarbe="bg-orange-600"
          zeilen={leitung}
          onUpdate={(id, field, value) => updatePersonal(setLeitung, id, field, value)}
        />
        <PersonalTabelle
          titel="Detectives"
          titelFarbe="bg-cyan-600"
          zeilen={detectives}
          onUpdate={(id, field, value) => updatePersonal(setDetectives, id, field, value)}
        />
        <PersonalTabelle
          titel="Senior Officer"
          titelFarbe="bg-cyan-600"
          zeilen={seniorOfficer}
          onUpdate={(id, field, value) => updatePersonal(setSeniorOfficer, id, field, value)}
        />
        <PersonalTabelle
          titel="Officer"
          titelFarbe="bg-cyan-600"
          zeilen={officer}
          onUpdate={(id, field, value) => updatePersonal(setOfficer, id, field, value)}
        />
        <PersonalTabelle
          titel="Rookies"
          titelFarbe="bg-cyan-600"
          zeilen={rookies}
          onUpdate={(id, field, value) => updatePersonal(setRookies, id, field, value)}
        />
      </div>

      {/* Streifendienst */}
      <div className="space-y-4">
        <div className="text-center py-2">
          <span className="text-2xl font-bold tracking-widest text-muted-foreground">
            - - - Streifendienst - - -
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StreifeKarte
            name="ADAM 1"
            {...streifen.adam1}
            onUpdate={(field, value) => updateStreife("adam1", field, value)}
          />
          <StreifeKarte
            name="ADAM 2"
            {...streifen.adam2}
            onUpdate={(field, value) => updateStreife("adam2", field, value)}
          />
          <StreifeKarte
            name="ADAM 3"
            {...streifen.adam3}
            onUpdate={(field, value) => updateStreife("adam3", field, value)}
          />
          <StreifeKarte
            name="ADAM 4"
            {...streifen.adam4}
            onUpdate={(field, value) => updateStreife("adam4", field, value)}
          />
          <StreifeKarte
            name="ADAM 5"
            {...streifen.adam5}
            onUpdate={(field, value) => updateStreife("adam5", field, value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StreifeKarte
            name="LINCOLN 1"
            {...streifen.lincoln1}
            onUpdate={(field, value) => updateStreife("lincoln1", field, value)}
          />
          <StreifeKarte
            name="LINCOLN 2"
            {...streifen.lincoln2}
            onUpdate={(field, value) => updateStreife("lincoln2", field, value)}
          />
          <StreifeKarte
            name="PHÖNIX (Overwatch)"
            {...streifen.phoenix}
            onUpdate={(field, value) => updateStreife("phoenix", field, value)}
          />
          <StreifeKarte
            name="HENRY 1"
            {...streifen.henry1}
            onUpdate={(field, value) => updateStreife("henry1", field, value)}
          />
          <StreifeKarte
            name="ADAM 1000 - SUPERVISOR"
            {...streifen.adam1000}
            onUpdate={(field, value) => updateStreife("adam1000", field, value)}
            isSupervisor
          />
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <span>Lincoln (1er besetzt) - Adam (2er besetzt) - Phönix (Overwatch) - David (Swat Unit) - Henry (Detective Unit)</span>
        </div>
      </div>

      {/* Codes & Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CodesTabelle titel=">Ten - Codes<" codes={tenCodes.map(c => ({ code: c.code, bedeutung: c.bedeutung }))} />
        <CodesTabelle titel="> Codes <" codes={codes} />
        <div className="lg:col-span-2">
          <DienstStatusInfo />
        </div>
      </div>
    </div>
  );
}
