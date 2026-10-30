import { ProcessStep, FmeaItem, ControlPlanItem, ProjectMeta, RiskThresholds } from '../types';

export const DEFAULT_THRESHOLDS: RiskThresholds = {
  redThreshold: 100,
  yellowThreshold: 50,
  autoRedOnSeverityHigh: true,
};

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
