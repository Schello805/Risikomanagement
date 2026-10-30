export type ProcessCategory = 
  | 'wareneingang'
  | 'pruefung'
  | 'lager'
  | 'kommissionierung'
  | 'fertigung'
  | 'endpruefung'
  | 'verpackung'
  | 'versand';

export interface ProcessStep {
  id: string;
  stepNumber: string; // e.g., "10", "20", "30"
  name: string; // e.g. "Wareneingang"
  category: ProcessCategory;
  description: string;
  responsibleArea: string; // e.g., "Logistik", "Fertigung", "Qualitätssicherung"
  machineEquipment?: string; // e.g., "Stapler, Barcodescanner, Messschieber"
  order: number;
}

export type SpecialCharacteristicType = 'none' | 'CC' | 'SC'; // Critical (Sicherheit/Zulassung) or Significant (Funktion/Passform)

export type ActionStatus = 'offen' | 'in_bearbeitung' | 'abgeschlossen' | 'verworfen';

export interface FmeaItem {
  id: string;
  stepId: string; // References ProcessStep.id
  processFunction: string; // Soll-Zustand / Funktion des Prozessschrittes
  failureMode: string; // Potenzieller Fehler (z.B. "Falsches Material angeliefert")
  failureEffect: string; // Potenzielle Fehlerfolge (z.B. "Ausschuss in Fertigung, Bandstillstand")
  severity: number; // Bedeutung B (1-10)
  specialCharacteristic: SpecialCharacteristicType;
  failureCause: string; // Potenzielle Fehlerursache (z.B. "Lieferanten-Verwechslung, fehlende Kennzeichnung")
  occurrence: number; // Auftretenswahrscheinlichkeit A (1-10)
  currentControlPrevention: string; // Aktuelle Vermeidungsmaßnahme (z.B. "Lieferantenvereinbarung, Barcode-Validierung")
  currentControlDetection: string; // Aktuelle Entdeckungsmaßnahme (z.B. "Sichtprüfung Wareneingang, Lieferscheinabgleich")
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
  characteristicName: string; // Produkt- oder Prozessmerkmal (z.B. "Maßhaltigkeit Länge", "Etikett-Vollständigkeit")
  characteristicType: 'product' | 'process';
  isSpecial: boolean;
  specialType?: SpecialCharacteristicType;
  specification: string; // Vorgabe / Toleranz (z.B. "50.0 ± 0.2 mm", "100% frei von Kratzern")
  evaluationMeasurementTechnique: string; // Prüfmittel / Messmethode (z.B. "Messschieber digital", "Optische Prüfung")
  sampleSize: string; // Stichprobenumfang (z.B. "5 Teile", "100%", "3 Muster")
  sampleFrequency: string; // Prüfhäufigkeit (z.B. "pro Charge", "stündlich", "bei jedem Rüstvorgang")
  controlMethod: string; // Lenkungsmethode (z.B. "Regelkarte SPC", "Prüfprotokoll WE", "Poka-Yoke Sperre")
  reactionPlan: string; // Reaktionsplan bei Abweichung (z.B. "Teile sperren, QS benachrichtigen, Fertigung stoppen")
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
