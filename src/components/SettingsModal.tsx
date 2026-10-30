import React, { useState, useRef } from 'react';
import { 
  X, 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldCheck, 
  AlertTriangle,
  FileJson
} from 'lucide-react';
import { RiskThresholds } from '../types';
import { AppState, exportProjectToJson } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  thresholds: RiskThresholds;
  onSaveThresholds: (thresholds: RiskThresholds) => void;
  appState: AppState;
  onRestoreState: (state: AppState) => void;
  onResetDefaults: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  thresholds,
  onSaveThresholds,
  appState,
  onRestoreState,
  onResetDefaults,
}) => {
  if (!isOpen) return null;

  const [formThresholds, setFormThresholds] = useState<RiskThresholds>({ ...thresholds });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveThresholds(formThresholds);
    onClose();
  };

  const handleExportJson = () => {
    exportProjectToJson(appState);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content) as AppState;
        
        // Basic validation
        if (Array.isArray(parsed.steps) && Array.isArray(parsed.fmeaItems) && Array.isArray(parsed.controlPlanItems)) {
          onRestoreState(parsed);
          alert('Projekt-Backup erfolgreich wiederhergestellt!');
          onClose();
        } else {
          alert('Ungültiges Dateiformat. Bitte ein gültiges FMEA-Projekt-JSON auswählen.');
        }
      } catch (err) {
        alert('Fehler beim Lesen der JSON-Datei: ' + String(err));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Einstellungen & Risikoschwellen
              </h3>
              <p className="text-xs text-slate-500">
                Konfiguration der Ampellogik und Projekt-Datensicherung
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5 pt-4">
          
          {/* Section 1: Risk Thresholds */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Risiko-Ampel Schwellenwerte (RPZ)
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-red-700 mb-1">
                  Rote Schwelle (Hohes Risiko)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={formThresholds.redThreshold}
                    onChange={(e) => setFormThresholds({ ...formThresholds, redThreshold: Number(e.target.value) || 100 })}
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono font-bold"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">RPZ ≥</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-700 mb-1">
                  Gelbe Schwelle (Mäßig)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={formThresholds.yellowThreshold}
                    onChange={(e) => setFormThresholds({ ...formThresholds, yellowThreshold: Number(e.target.value) || 50 })}
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">RPZ ≥</span>
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-3 rounded-xl border border-red-200">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formThresholds.autoRedOnSeverityHigh}
                  onChange={(e) => setFormThresholds({ ...formThresholds, autoRedOnSeverityHigh: e.target.checked })}
                  className="rounded text-red-600 focus:ring-red-500 w-4 h-4 mt-0.5"
                />
                <div>
                  <span className="block text-xs font-bold text-red-900">
                    Sonderregel: Hohe Bedeutung (B ≥ 9) immer ROT
                  </span>
                  <span className="text-[11px] text-red-700 block mt-0.5">
                    Fehler mit Sicherheits- oder Gesetzesauswirkungen erfordern stets Handlungsbedarf, unabhängig von A und E (Standard gem. AIAG/VDA).
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 2: Backup & Restore */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Projekt Datensicherung (JSON)
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportJson}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium border border-slate-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Backup herunterladen</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium border border-slate-200 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>Backup einspielen</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Section 3: Reset Data */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (confirm('Möchtest du wirklich alle Daten löschen und das Projekt vollständig leeren?')) {
                  onResetDefaults();
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium p-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Alle Projektdaten leeren</span>
            </button>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium rounded-lg bg-brand-600 hover:bg-brand-500 text-white shadow-sm"
            >
              Einstellungen speichern
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
