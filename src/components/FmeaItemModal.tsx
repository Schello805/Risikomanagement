import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  User, 
  Calendar, 
  Share2
} from 'lucide-react';
import { FmeaItem, ProcessStep, SpecialCharacteristicType, ActionStatus, RiskThresholds } from '../types';
import { SEVERITY_CRITERIA, OCCURRENCE_CRITERIA, DETECTION_CRITERIA, calculateRpn, getRiskLevel, getRpnDelta } from '../utils/rpnCalculator';

interface FmeaItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FmeaItem | null;
  steps: ProcessStep[];
  thresholds: RiskThresholds;
  onSave: (item: FmeaItem) => void;
  onCreateControlPlanItem?: (stepId: string, characteristic: string, spec: string, method: string, fmeaId: string) => void;
}

export const FmeaItemModal: React.FC<FmeaItemModalProps> = ({
  isOpen,
  onClose,
  item,
  steps,
  thresholds,
  onSave,
  onCreateControlPlanItem,
}) => {
  if (!isOpen) return null;

  const isNew = !item;

  const defaultStepId = steps.length > 0 ? steps[0].id : '';

  // Form State
  const [stepId, setStepId] = useState(item?.stepId || defaultStepId);
  const [processFunction, setProcessFunction] = useState(item?.processFunction || '');
  const [failureMode, setFailureMode] = useState(item?.failureMode || '');
  const [failureEffect, setFailureEffect] = useState(item?.failureEffect || '');
  const [severity, setSeverity] = useState(item?.severity || 7);
  const [specialCharacteristic, setSpecialCharacteristic] = useState<SpecialCharacteristicType>(item?.specialCharacteristic || 'none');
  const [failureCause, setFailureCause] = useState(item?.failureCause || '');
  const [occurrence, setOccurrence] = useState(item?.occurrence || 4);
  const [currentControlPrevention, setCurrentControlPrevention] = useState(item?.currentControlPrevention || '');
  const [currentControlDetection, setCurrentControlDetection] = useState(item?.currentControlDetection || '');
  const [detection, setDetection] = useState(item?.detection || 4);

  // Action / Optimization
  const [recommendedAction, setRecommendedAction] = useState(item?.recommendedAction || '');
  const [responsiblePerson, setResponsiblePerson] = useState(item?.responsiblePerson || '');
  const [targetDate, setTargetDate] = useState(item?.targetDate || '');
  const [status, setStatus] = useState<ActionStatus>(item?.status || 'offen');
  
  // Re-evaluation
  const [newSeverity, setNewSeverity] = useState<number | undefined>(item?.newSeverity);
  const [newOccurrence, setNewOccurrence] = useState<number | undefined>(item?.newOccurrence);
  const [newDetection, setNewDetection] = useState<number | undefined>(item?.newDetection);
  const [notes, setNotes] = useState(item?.notes || '');

  // Calculated Live RPZ 1
  const liveRpn = calculateRpn(severity, occurrence, detection);
  const riskInfo = getRiskLevel(severity, liveRpn, thresholds);

  // Calculated Live RPZ 2
  const liveNewRpn = (newSeverity && newOccurrence && newDetection) 
    ? calculateRpn(newSeverity, newOccurrence, newDetection)
    : undefined;
  const newRiskInfo = liveNewRpn ? getRiskLevel(newSeverity || severity, liveNewRpn, thresholds) : null;
  const rpnDelta = liveNewRpn ? getRpnDelta(liveRpn, liveNewRpn) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!failureMode.trim() || !stepId) return;

    const savedItem: FmeaItem = {
      id: item?.id || `fmea-${Date.now()}`,
      stepId,
      processFunction: processFunction.trim(),
      failureMode: failureMode.trim(),
      failureEffect: failureEffect.trim(),
      severity,
      specialCharacteristic,
      failureCause: failureCause.trim(),
      occurrence,
      currentControlPrevention: currentControlPrevention.trim(),
      currentControlDetection: currentControlDetection.trim(),
      detection,
      rpn: liveRpn,
      recommendedAction: recommendedAction.trim(),
      responsiblePerson: responsiblePerson.trim(),
      targetDate,
      status,
      newSeverity,
      newOccurrence,
      newDetection,
      newRpn: liveNewRpn,
      notes: notes.trim(),
    };

    onSave(savedItem);
    onClose();
  };

  const handleSyncToControlPlan = () => {
    if (!onCreateControlPlanItem) return;
    const currentStep = steps.find(s => s.id === stepId);
    onCreateControlPlanItem(
      stepId,
      `Prüfung auf: ${failureMode}`,
      currentControlPrevention || 'Gemäß Prüfplan',
      currentControlDetection || 'Sicht- / Messprüfung',
      item?.id || `fmea-${Date.now()}`
    );
    alert('Prüfpunkt erfolgreich für den Kontrollplan (PLP) vorgemerkt!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-sm">
              FMEA
            </span>
            <div>
              <h3 className="font-bold text-base text-white">
                {isNew ? 'Neuen potenziellen Fehlerfall analysieren' : 'FMEA-Eintrag bearbeiten'}
              </h3>
              <p className="text-xs text-slate-400">
                Risikoanalyse nach VDA / AIAG (Bedeutung B × Auftreten A × Entdeckung E)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Prozessschritt & Funktion */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>1. Prozessschritt & Funktion</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Zugeordneter Prozessschritt *</label>
                <select
                  value={stepId}
                  onChange={(e) => setStepId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                >
                  {steps.map((step) => (
                    <option key={step.id} value={step.id}>
                      {step.stepNumber} - {step.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Soll-Funktion des Schrittes</label>
                <input
                  type="text"
                  placeholder="z.B. Maßhaltiges Fräsen der Dichtflächen ohne Riefen"
                  value={processFunction}
                  onChange={(e) => setProcessFunction(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Fehleranalyse & Bewertung (B, A, E) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Fehleranalyse & Risikobewertung (RPZ = B × A × E)
              </h4>

              {/* Live RPZ Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Aktuelle RPZ:</span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold shadow-sm ${riskInfo.badgeClass}`}>
                  RPZ {liveRpn} ({riskInfo.label})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Potenzieller Fehler (Fehlerart) *</label>
                <input
                  type="text"
                  required
                  placeholder="Was kann schiefgehen? (z.B. Grat an Dichtfläche)"
                  value={failureMode}
                  onChange={(e) => setFailureMode(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Besonderes Merkmal (Klassifizierung)</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSpecialCharacteristic('none')}
                    className={`px-3 py-2 text-xs rounded-lg font-medium border text-center transition-all ${
                      specialCharacteristic === 'none' 
                        ? 'bg-slate-800 text-white border-slate-900 shadow-sm' 
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Keine (Std)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpecialCharacteristic('SC')}
                    className={`px-3 py-2 text-xs rounded-lg font-medium border text-center transition-all ${
                      specialCharacteristic === 'SC' 
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm font-bold' 
                        : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-50'
                    }`}
                    title="Significant Characteristic (Wichtig für Funktion / Passung)"
                  >
                    SC (Funktion)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpecialCharacteristic('CC')}
                    className={`px-3 py-2 text-xs rounded-lg font-medium border text-center transition-all ${
                      specialCharacteristic === 'CC' 
                        ? 'bg-red-600 text-white border-red-700 shadow-sm font-bold' 
                        : 'bg-white text-red-700 border-red-300 hover:bg-red-50'
                    }`}
                    title="Critical Characteristic (Sicherheits- oder gesetzesrelevant)"
                  >
                    CC (Sicherheit)
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Potenzielle Fehlerfolge (Auswirkung beim Kunden)</label>
                <textarea
                  rows={2}
                  placeholder="Auswirkung auf nachgelagerte Prozesse oder Endkunden (z.B. Leckage, Rückruf)"
                  value={failureEffect}
                  onChange={(e) => setFailureEffect(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Potenzielle Fehlerursache</label>
                <textarea
                  rows={2}
                  placeholder="Warum tritt der Fehler auf? (z.B. Fräswerkzeug verschlissen, Span im Halter)"
                  value={failureCause}
                  onChange={(e) => setFailureCause(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* 3 Rating Sliders: B, A, E with rich descriptors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              
              {/* B - Bedeutung */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800">Bedeutung (B)</span>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    severity >= 9 ? 'bg-red-600 text-white' : severity >= 7 ? 'bg-amber-500 text-white' : 'bg-slate-800 text-white'
                  }`}>
                    {severity}
                  </span>
                </div>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 mb-1"
                >
                  {SEVERITY_CRITERIA.map((c) => (
                    <option key={c.score} value={c.score}>
                      {c.score} - {c.shortLabel}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {SEVERITY_CRITERIA.find(c => c.score === severity)?.description}
                </p>
              </div>

              {/* A - Auftreten */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800">Auftreten (A)</span>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    occurrence >= 8 ? 'bg-red-600 text-white' : occurrence >= 5 ? 'bg-amber-500 text-white' : 'bg-slate-800 text-white'
                  }`}>
                    {occurrence}
                  </span>
                </div>
                <select
                  value={occurrence}
                  onChange={(e) => setOccurrence(Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 mb-1"
                >
                  {OCCURRENCE_CRITERIA.map((c) => (
                    <option key={c.score} value={c.score}>
                      {c.score} - {c.shortLabel}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {OCCURRENCE_CRITERIA.find(c => c.score === occurrence)?.description}
                </p>
              </div>

              {/* E - Entdeckung */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800">Entdeckung (E)</span>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    detection >= 8 ? 'bg-red-600 text-white' : detection >= 5 ? 'bg-amber-500 text-white' : 'bg-slate-800 text-white'
                  }`}>
                    {detection}
                  </span>
                </div>
                <select
                  value={detection}
                  onChange={(e) => setDetection(Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 mb-1"
                >
                  {DETECTION_CRITERIA.map((c) => (
                    <option key={c.score} value={c.score}>
                      {c.score} - {c.shortLabel}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {DETECTION_CRITERIA.find(c => c.score === detection)?.description}
                </p>
              </div>

            </div>

            {/* Current Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bestehende Vermeidungsmaßnahme (Prävention)</label>
                <input
                  type="text"
                  placeholder="z.B. Standzeitüberwachung Fräskopf in CNC"
                  value={currentControlPrevention}
                  onChange={(e) => setCurrentControlPrevention(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bestehende Entdeckungsmaßnahme (Prüfung)</label>
                <input
                  type="text"
                  placeholder="z.B. Stichprobenprüfung mit Tastschnittgerät alle 50 Teile"
                  value={currentControlDetection}
                  onChange={(e) => setCurrentControlDetection(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Optimierung & Maßnahmenverfolgung (Vorher/Nachher) */}
          <div className="bg-brand-50/60 p-5 rounded-xl border border-brand-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>3. Maßnahmenverfolgung & Neubewertung (Optimierung)</span>
              </h4>

              {onCreateControlPlanItem && (
                <button
                  type="button"
                  onClick={handleSyncToControlPlan}
                  className="inline-flex items-center gap-1 text-xs text-brand-700 hover:text-brand-900 font-semibold bg-white px-2.5 py-1 rounded-lg border border-brand-300 shadow-xs hover:shadow"
                >
                  <Share2 className="w-3.5 h-3.5 text-brand-600" />
                  <span>In Kontrollplan übernehmen</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Empfohlene Abstellmaßnahme</label>
                <input
                  type="text"
                  placeholder="z.B. Installation eines automatischen Tool-Monitorings mit Notabschaltung"
                  value={recommendedAction}
                  onChange={(e) => setRecommendedAction(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status der Maßnahme</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ActionStatus)}
                  className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                >
                  <option value="offen">Offen</option>
                  <option value="in_bearbeitung">In Bearbeitung</option>
                  <option value="abgeschlossen">Abgeschlossen</option>
                  <option value="verworfen">Verworfen</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Verantwortliche Person</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                  <input
                    type="text"
                    placeholder="z.B. T. Weber"
                    value={responsiblePerson}
                    onChange={(e) => setResponsiblePerson(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Zieldatum / Fälligkeit</label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Neubewertung B2, A2, E2 */}
              <div className="sm:col-span-2 bg-white p-3 rounded-lg border border-brand-200">
                <span className="block text-xs font-bold text-brand-900 mb-2">Neubewertung nach Umsetzung:</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] text-slate-500">B (Neu)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      placeholder="B2"
                      value={newSeverity || ''}
                      onChange={(e) => setNewSeverity(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-2 py-1 text-xs rounded border border-slate-300 text-center font-bold"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] text-slate-500">A (Neu)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      placeholder="A2"
                      value={newOccurrence || ''}
                      onChange={(e) => setNewOccurrence(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-2 py-1 text-xs rounded border border-slate-300 text-center font-bold"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] text-slate-500">E (Neu)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      placeholder="E2"
                      value={newDetection || ''}
                      onChange={(e) => setNewDetection(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-2 py-1 text-xs rounded border border-slate-300 text-center font-bold"
                    />
                  </div>

                  {/* Calculated new RPZ */}
                  <div className="text-right pl-2 border-l border-slate-200">
                    <span className="block text-[10px] text-slate-500 font-semibold">RPZ Neu</span>
                    <span className={`inline-block font-mono text-xs font-bold px-2 py-0.5 rounded ${
                      liveNewRpn ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {liveNewRpn || '-'}
                    </span>
                  </div>
                </div>

                {rpnDelta && rpnDelta.improved && (
                  <div className="mt-2 text-right text-[11px] font-semibold text-emerald-600 flex items-center justify-end gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Risikoreduktion um {rpnDelta.percent}% (-{rpnDelta.delta} RPZ-Punkte)</span>
                  </div>
                )}
              </div>

            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Interne Notizen / Wirksamkeitsnachweis</label>
              <input
                type="text"
                placeholder="z.B. Wirksamkeitsprüfung nach 500 produzierten Teilen bestanden."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              Abbrechen
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs shadow-md transition-all hover:shadow-lg active:scale-95"
            >
              {isNew ? 'Fehlerfall zur FMEA hinzufügen' : 'FMEA-Eintrag speichern'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
