export interface ProcessCategoryItem {
  id: string; // e.g. "wareneingang", "cat-12345"
  name: string; // e.g. "Wareneingang", "Lackierung", "Spritzguss"
  color: string; // e.g. "sky", "emerald", "amber", "indigo", "violet", "red", "orange", "cyan", "rose", "slate"
  description?: string;
}

export interface ProcessStep {
  id: string;
  stepNumber: string; // e.g. "10", "10.1", "10.2", "20"
  name: string; // e.g. "Wareneingang" oder "WE Buchung"
  category: string; // References ProcessCategoryItem.id
  description: string;
  responsibleArea: string; // e.g., "Logistik", "Fertigung", "Qualitätssicherung"
  machineEquipment?: string; // e.g., "Flurförderzeuge, Barcodescanner"
  order: number;
  level: 1 | 2; // 1 = Hauptprozess, 2 = Unterprozess / Teilschritt
  parentId?: string; // ID des übergeordneten Hauptprozesses bei level === 2
}

export type SpecialCharacteristicType = 'none' | 'CC' | 'SC'; // Critical (Sicherheit/Zulassung) or Significant (Funktion/Passform)

export type ActionStatus = 'offen' | 'in_bearbeitung' | 'abgeschlossen' | 'verworfen';

export interface FmeaItem {
  id: string;
  stepId: string; // References ProcessStep.id
  processFunction: string; // Soll-Zustand / Funktion des Prozessschrittes
  failureMode: string; // Potenzieller Fehler
  failureEffect: string; // Potenzielle Fehlerfolge
  severity: number; // Bedeutung B (1-10)
  specialCharacteristic: SpecialCharacteristicType;
  failureCause: string; // Potenzielle Fehlerursache
  occurrence: number; // Auftretenswahrscheinlichkeit A (1-10)
  currentControlPrevention: string; // Aktuelle Vermeidungsmaßnahme
  currentControlDetection: string; // Aktuelle Entdeckungsmaßnahme
  detection: number; // Entdeckungswahrscheinlichkeit E (1-10)
  rpn: number; // Risikoprioritätszahl (B * A * E)
  
  // Maßnahmen zur Risikominimierung (Optimierung)
  recommendedAction: string; // Empfohlene Abstellmaßnahme
  responsiblePerson: string; // Verantwortlich
  targetDate: string; // Zieldatum (YYYY-MM-DD)
  status: ActionStatus;
  completionDate?: string;
  
  // Neubewertung nach Umsetzung
  newSeverity?: number; // B2
  newOccurrence?: number; // A2
  newDetection?: number; // E2
  newRpn?: number; // RPZ2
  
  notes?: string;
}

export interface ControlPlanItem {
  id: string;
  stepId: string; // References ProcessStep.id
  characteristicName: string; // Produkt- oder Prozessmerkmal
  characteristicType: 'product' | 'process';
  isSpecial: boolean;
  specialType?: SpecialCharacteristicType;
  specification: string; // Vorgabe / Toleranz
  evaluationMeasurementTechnique: string; // Prüfmittel / Messmethode
  sampleSize: string; // Stichprobenumfang
  sampleFrequency: string; // Prüfhäufigkeit
  controlMethod: string; // Lenkungsmethode
  reactionPlan: string; // Reaktionsplan bei Abweichung
  linkedFmeaItemId?: string;
}

export interface ProjectMeta {
  projectName: string;
  documentNumber: string;
  partNumber: string;
  partDescription: string;
  plantLocation: string;
  customer: string;
  responsibleLead: string;
  coreTeam: string;
  fmeaDate: string;
  revisionDate: string;
  revisionNumber: string;
}

export interface RiskThresholds {
  redThreshold: number; // default: 100
  yellowThreshold: number; // default: 50
  autoRedOnSeverityHigh: boolean; // default: true (B >= 9 is always red)
}

export interface RatingCriterion {
  score: number;
  shortLabel: string;
  description: string;
}
