import { ProcessStep, FmeaItem, ControlPlanItem, ProjectMeta, RiskThresholds, ProcessCategoryItem } from '../types';

export const DEFAULT_THRESHOLDS: RiskThresholds = {
  redThreshold: 100,
  yellowThreshold: 50,
  autoRedOnSeverityHigh: true,
};

export const DEFAULT_CATEGORIES: ProcessCategoryItem[] = [
  { id: 'wareneingang', name: 'Wareneingang', color: 'sky', description: 'Materialannahme, Entladung & Prüfung' },
  { id: 'pruefung', name: 'QS-Prüfung', color: 'emerald', description: 'Qualitätskontrolle & Messungen' },
  { id: 'lager', name: 'Lagerung', color: 'amber', description: 'Hochregallager, Puffer & FiFo' },
  { id: 'kommissionierung', name: 'Kommissionierung', color: 'indigo', description: 'Materialbereitstellung & Bereitstellung' },
  { id: 'fertigung', name: 'Fertigung/Montage', color: 'violet', description: 'Mechanische Bearbeitung & Zusammenbau' },
  { id: 'endpruefung', name: 'Endprüfung/EOL', color: 'red', description: '100% Funktions- und Dichtheitstest' },
  { id: 'verpackung', name: 'Verpackung', color: 'orange', description: 'Konservierung & Kundengebinde' },
  { id: 'versand', name: 'Versand/Warenausgang', color: 'cyan', description: 'Verladung & Speditionsübergabe' },
];

export const DEFAULT_PROJECT_META: ProjectMeta = {
  projectName: "Neues FMEA & Kontrollplan Projekt",
  documentNumber: "",
  partNumber: "",
  partDescription: "",
  plantLocation: "",
  customer: "",
  responsibleLead: "Michael Schellenberger",
  coreTeam: "",
  fmeaDate: new Date().toISOString().split('T')[0],
  revisionDate: new Date().toISOString().split('T')[0],
  revisionNumber: "Rev. 1.0",
};

// Startzustand: Vollständig leer für die eigene Datenerfassung
export const DEFAULT_PROCESS_STEPS: ProcessStep[] = [];
export const DEFAULT_FMEA_ITEMS: FmeaItem[] = [];
export const DEFAULT_CONTROL_PLAN_ITEMS: ControlPlanItem[] = [];
