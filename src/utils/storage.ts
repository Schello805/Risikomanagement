import { ProcessStep, FmeaItem, ControlPlanItem, ProjectMeta, RiskThresholds } from '../types';
import { DEFAULT_PROCESS_STEPS, DEFAULT_FMEA_ITEMS, DEFAULT_CONTROL_PLAN_ITEMS, DEFAULT_PROJECT_META, DEFAULT_THRESHOLDS } from '../data/defaultData';

const STORAGE_KEYS = {
  STEPS: 'fmea_process_steps_v4',
  FMEA: 'fmea_items_v4',
  CONTROL_PLAN: 'fmea_control_plan_items_v4',
  PROJECT_META: 'fmea_project_meta_v4',
  THRESHOLDS: 'fmea_risk_thresholds_v4',
};

export interface AppState {
  steps: ProcessStep[];
  fmeaItems: FmeaItem[];
  controlPlanItems: ControlPlanItem[];
  projectMeta: ProjectMeta;
  thresholds: RiskThresholds;
}

export function loadAppState(): AppState {
  try {
    const rawSteps = localStorage.getItem(STORAGE_KEYS.STEPS);
    const rawFmea = localStorage.getItem(STORAGE_KEYS.FMEA);
    const rawCp = localStorage.getItem(STORAGE_KEYS.CONTROL_PLAN);
    const rawMeta = localStorage.getItem(STORAGE_KEYS.PROJECT_META);
    const rawThresholds = localStorage.getItem(STORAGE_KEYS.THRESHOLDS);

    return {
      steps: rawSteps ? JSON.parse(rawSteps) : DEFAULT_PROCESS_STEPS,
      fmeaItems: rawFmea ? JSON.parse(rawFmea) : DEFAULT_FMEA_ITEMS,
      controlPlanItems: rawCp ? JSON.parse(rawCp) : DEFAULT_CONTROL_PLAN_ITEMS,
      projectMeta: rawMeta ? JSON.parse(rawMeta) : DEFAULT_PROJECT_META,
      thresholds: rawThresholds ? JSON.parse(rawThresholds) : DEFAULT_THRESHOLDS,
    };
  } catch (err) {
    console.error('Fehler beim Laden aus localStorage', err);
    return {
      steps: DEFAULT_PROCESS_STEPS,
      fmeaItems: DEFAULT_FMEA_ITEMS,
      controlPlanItems: DEFAULT_CONTROL_PLAN_ITEMS,
      projectMeta: DEFAULT_PROJECT_META,
      thresholds: DEFAULT_THRESHOLDS,
    };
  }
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STEPS, JSON.stringify(state.steps));
    localStorage.setItem(STORAGE_KEYS.FMEA, JSON.stringify(state.fmeaItems));
    localStorage.setItem(STORAGE_KEYS.CONTROL_PLAN, JSON.stringify(state.controlPlanItems));
    localStorage.setItem(STORAGE_KEYS.PROJECT_META, JSON.stringify(state.projectMeta));
    localStorage.setItem(STORAGE_KEYS.THRESHOLDS, JSON.stringify(state.thresholds));
  } catch (err) {
    console.error('Fehler beim Speichern in localStorage', err);
  }
}

export function resetToDefaults(): AppState {
  const defaults: AppState = {
    steps: [],
    fmeaItems: [],
    controlPlanItems: [],
    projectMeta: DEFAULT_PROJECT_META,
    thresholds: DEFAULT_THRESHOLDS,
  };
  saveAppState(defaults);
  return defaults;
}

export function exportProjectToJson(state: AppState): void {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  const safeFilename = (state.projectMeta.projectName || 'FMEA-Projekt')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `${safeFilename}_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
