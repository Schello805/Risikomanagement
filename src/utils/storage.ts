import { ProcessStep, FmeaItem, ControlPlanItem, ProjectMeta, RiskThresholds, ProcessCategoryItem } from '../types';
import { DEFAULT_PROCESS_STEPS, DEFAULT_FMEA_ITEMS, DEFAULT_CONTROL_PLAN_ITEMS, DEFAULT_PROJECT_META, DEFAULT_THRESHOLDS, DEFAULT_CATEGORIES } from '../data/defaultData';

const STORAGE_KEYS = {
  STEPS: 'fmea_process_steps_v5',
  FMEA: 'fmea_items_v5',
  CONTROL_PLAN: 'fmea_control_plan_items_v5',
  PROJECT_META: 'fmea_project_meta_v5',
  THRESHOLDS: 'fmea_risk_thresholds_v5',
  CATEGORIES: 'fmea_categories_v5',
};

export interface AppState {
  steps: ProcessStep[];
  fmeaItems: FmeaItem[];
  controlPlanItems: ControlPlanItem[];
  projectMeta: ProjectMeta;
  thresholds: RiskThresholds;
  categories: ProcessCategoryItem[];
}

export function containsDemoData(state: Partial<AppState>): boolean {
  if (state.projectMeta?.projectName?.includes('Precision-X') || state.projectMeta?.partNumber?.includes('PX-8820')) {
    return true;
  }
  if (state.steps?.some(s => s.name?.includes('Precision') || s.id === 'step-101')) {
    return true;
  }
  if (state.fmeaItems?.some(f => f.id === 'fmea-101' || f.failureMode?.includes('Legierung') || f.failureEffect?.includes('Festigkeitsprobleme'))) {
    return true;
  }
  return false;
}

export function purgeAllDemoStorage(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('fmea_') || key.includes('process') || key.includes('control_plan'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (e) {
    console.error('Fehler beim Bereinigen des localStorage:', e);
  }
}

export function loadAppState(): AppState {
  try {
    let hasDemoInStorage = false;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('fmea_')) {
        const val = localStorage.getItem(key) || '';
        if (val.includes('Precision-X') || val.includes('PX-8820') || val.includes('fmea-101') || val.includes('AlSi9Cu3')) {
          hasDemoInStorage = true;
          break;
        }
      }
    }

    if (hasDemoInStorage) {
      purgeAllDemoStorage();
      return resetToDefaults();
    }

    const rawSteps = localStorage.getItem(STORAGE_KEYS.STEPS);
    const rawFmea = localStorage.getItem(STORAGE_KEYS.FMEA);
    const rawCp = localStorage.getItem(STORAGE_KEYS.CONTROL_PLAN);
    const rawMeta = localStorage.getItem(STORAGE_KEYS.PROJECT_META);
    const rawThresholds = localStorage.getItem(STORAGE_KEYS.THRESHOLDS);
    const rawCats = localStorage.getItem(STORAGE_KEYS.CATEGORIES);

    const parsed: AppState = {
      steps: rawSteps ? JSON.parse(rawSteps) : [],
      fmeaItems: rawFmea ? JSON.parse(rawFmea) : [],
      controlPlanItems: rawCp ? JSON.parse(rawCp) : [],
      projectMeta: rawMeta ? JSON.parse(rawMeta) : DEFAULT_PROJECT_META,
      thresholds: rawThresholds ? JSON.parse(rawThresholds) : DEFAULT_THRESHOLDS,
      categories: rawCats ? JSON.parse(rawCats) : DEFAULT_CATEGORIES,
    };

    if (containsDemoData(parsed)) {
      purgeAllDemoStorage();
      return resetToDefaults();
    }

    return parsed;
  } catch (err) {
    console.error('Fehler beim Laden aus localStorage', err);
    return resetToDefaults();
  }
}

export function saveAppState(state: AppState): void {
  try {
    if (containsDemoData(state)) {
      purgeAllDemoStorage();
      return;
    }

    localStorage.setItem(STORAGE_KEYS.STEPS, JSON.stringify(state.steps));
    localStorage.setItem(STORAGE_KEYS.FMEA, JSON.stringify(state.fmeaItems));
    localStorage.setItem(STORAGE_KEYS.CONTROL_PLAN, JSON.stringify(state.controlPlanItems));
    localStorage.setItem(STORAGE_KEYS.PROJECT_META, JSON.stringify(state.projectMeta));
    localStorage.setItem(STORAGE_KEYS.THRESHOLDS, JSON.stringify(state.thresholds));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(state.categories));
  } catch (err) {
    console.error('Fehler beim Speichern in localStorage', err);
  }
}

export function resetToDefaults(): AppState {
  purgeAllDemoStorage();
  const defaults: AppState = {
    steps: [],
    fmeaItems: [],
    controlPlanItems: [],
    projectMeta: {
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
    },
    thresholds: DEFAULT_THRESHOLDS,
    categories: DEFAULT_CATEGORIES,
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
