import React, { useState } from 'react';
import { 
  ArrowRight, 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronUp, 
  ChevronDown, 
  AlertCircle, 
  CheckCircle2, 
  Package, 
  CheckSquare, 
  Factory, 
  Truck, 
  Archive, 
  ShieldCheck, 
  Layers
} from 'lucide-react';
import { ProcessStep, FmeaItem, ControlPlanItem, ProcessCategory } from '../types';
import { getRiskLevel } from '../utils/rpnCalculator';

interface ProcessFlowViewProps {
  steps: ProcessStep[];
  fmeaItems: FmeaItem[];
  controlPlanItems: ControlPlanItem[];
  onAddStep: (step: Omit<ProcessStep, 'id' | 'order'>) => void;
  onUpdateStep: (step: ProcessStep) => void;
  onDeleteStep: (id: string) => void;
  onMoveStep: (id: string, direction: 'up' | 'down') => void;
  onSelectStepFilter: (stepId: string, targetTab: 'fmea' | 'control_plan') => void;
}

const CATEGORY_CONFIG: Record<ProcessCategory, { label: string; icon: React.ReactNode; bg: string; border: string }> = {
  wareneingang: { label: 'Wareneingang', icon: <Truck className="w-4 h-4 text-sky-600" />, bg: 'bg-sky-50', border: 'border-sky-200' },
  pruefung: { label: 'QS-Prüfung', icon: <CheckSquare className="w-4 h-4 text-emerald-600" />, bg: 'bg-emerald-50', border: 'border-emerald-200' },
  lager: { label: 'Lagerung', icon: <Archive className="w-4 h-4 text-amber-600" />, bg: 'bg-amber-50', border: 'border-amber-200' },
  kommissionierung: { label: 'Kommissionierung', icon: <Layers className="w-4 h-4 text-indigo-600" />, bg: 'bg-indigo-50', border: 'border-indigo-200' },
  fertigung: { label: 'Fertigung/Montage', icon: <Factory className="w-4 h-4 text-violet-600" />, bg: 'bg-violet-50', border: 'border-violet-200' },
  endpruefung: { label: 'Endprüfung/EOL', icon: <ShieldCheck className="w-4 h-4 text-red-600" />, bg: 'bg-red-50', border: 'border-red-200' },
  verpackung: { label: 'Verpackung', icon: <Package className="w-4 h-4 text-orange-600" />, bg: 'bg-orange-50', border: 'border-orange-200' },
  versand: { label: 'Versand/Warenausgang', icon: <Truck className="w-4 h-4 text-cyan-600" />, bg: 'bg-cyan-50', border: 'border-cyan-200' },
};

export const ProcessFlowView: React.FC<ProcessFlowViewProps> = ({
  steps,
  fmeaItems,
  controlPlanItems,
  onAddStep,
  onUpdateStep,
  onDeleteStep,
  onMoveStep,
  onSelectStepFilter,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingStep, setEditingStep] = useState<ProcessStep | null>(null);

  // Form state for new step
  const [stepNumber, setStepNumber] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProcessCategory>('fertigung');
  const [description, setDescription] = useState('');
  const [responsibleArea, setResponsibleArea] = useState('');
  const [machineEquipment, setMachineEquipment] = useState('');

  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddStep({
      stepNumber: stepNumber.trim() || `${(sortedSteps.length + 1) * 10}`,
      name: name.trim(),
      category,
      description: description.trim(),
      responsibleArea: responsibleArea.trim() || 'Produktion',
      machineEquipment: machineEquipment.trim(),
    });

    // Reset
    setName('');
    setDescription('');
    setResponsibleArea('');
    setMachineEquipment('');
    setStepNumber('');
    setIsAdding(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStep) return;
    onUpdateStep(editingStep);
    setEditingStep(null);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>Prozesskette (Material- & Informationsfluss)</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-semibold border border-brand-200">
              {steps.length} Stationen
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Definiert den lückenlosen Ablauf vom Wareneingang der Rohmaterialien bis zum Warenausgang & Versand der Fertigprodukte.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm shadow-sm transition-all hover:shadow active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Prozessschritt hinzufügen</span>
        </button>
      </div>

      {/* Inline Form to Add New Step */}
      {isAdding && (
        <form onSubmit={handleSubmitNew} className="bg-brand-50/70 border border-brand-200 rounded-xl p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-brand-900">Neuen Prozessschritt anlegen</h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Abbrechen
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Schritt-Nr.</label>
              <input
                type="text"
                placeholder={`z.B. ${(sortedSteps.length + 1) * 10}`}
                value={stepNumber}
                onChange={(e) => setStepNumber(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bezeichnung *</label>
              <input
                type="text"
                required
                placeholder="z.B. CNC Fräsen Dichtflansch"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kategorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProcessCategory)}
                className="w-full px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Verantwortlicher Bereich</label>
              <input
                type="text"
                placeholder="z.B. Fertigung Linie 1"
                value={responsibleArea}
                onChange={(e) => setResponsibleArea(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Beschreibung des Vorgangs</label>
              <input
                type="text"
                placeholder="Was genau passiert in diesem Schritt?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Maschine / Werkzeug / Prüfmittel</label>
              <input
                type="text"
                placeholder="z.B. 5-Achs-Fräse, Messschieber"
                value={machineEquipment}
                onChange={(e) => setMachineEquipment(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium"
            >
              Schritt speichern
            </button>
          </div>
        </form>
      )}

      {/* Process Chain Grid / Flow */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedSteps.map((step, index) => {
          const cat = CATEGORY_CONFIG[step.category] || CATEGORY_CONFIG.fertigung;
          const stepFmeas = fmeaItems.filter((f) => f.stepId === step.id);
          const stepControlPlans = controlPlanItems.filter((cp) => cp.stepId === step.id);
          
          // Check for red risk in this step
          const hasRedRisk = stepFmeas.some((f) => {
            const risk = getRiskLevel(f.severity, f.rpn);
            return risk.level === 'high';
          });

          const maxRpn = stepFmeas.length > 0 
            ? Math.max(...stepFmeas.map(f => f.rpn))
            : 0;

          return (
            <div
              key={step.id}
              className={`relative bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                hasRedRisk ? 'border-red-300 ring-1 ring-red-400/30' : 'border-slate-200'
              }`}
            >
              {/* Header: Step Number, Badge & Actions */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shadow-sm">
                      {step.stepNumber}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cat.bg} ${cat.border} text-slate-700`}>
                      {cat.icon}
                      <span>{cat.label}</span>
                    </span>
                  </div>

                  {/* Ordering arrows */}
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => onMoveStep(step.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-opacity"
                      title="Nach vorne verschieben"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onMoveStep(step.id, 'down')}
                      disabled={index === sortedSteps.length - 1}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-opacity"
                      title="Nach hinten verschieben"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Step Name */}
                <h3 className="font-bold text-slate-800 text-sm mb-1 leading-snug">
                  {step.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                  {step.description || 'Keine nähere Beschreibung hinterlegt.'}
                </p>

                {/* Meta details */}
                <div className="space-y-1 text-[11px] text-slate-600 mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bereich:</span>
                    <span className="font-medium text-slate-700">{step.responsibleArea}</span>
                  </div>
                  {step.machineEquipment && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ausrüstung:</span>
                      <span className="font-medium text-slate-700 truncate max-w-[140px]" title={step.machineEquipment}>
                        {step.machineEquipment}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Badges & Navigation Buttons */}
              <div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs mb-3">
                  {/* FMEA Count Badge */}
                  <button
                    onClick={() => onSelectStepFilter(step.id, 'fmea')}
                    className={`flex items-center gap-1 font-medium hover:underline ${
                      hasRedRisk ? 'text-red-600' : 'text-slate-600 hover:text-brand-600'
                    }`}
                    title="Zur FMEA-Tabelle für diesen Schritt springen"
                  >
                    {hasRedRisk ? (
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{stepFmeas.length} Fehlerfälle</span>
                    {maxRpn > 0 && (
                      <span className={`text-[10px] font-mono px-1 rounded ${hasRedRisk ? 'bg-red-100 text-red-700 font-bold' : 'bg-slate-200 text-slate-700'}`}>
                        RPZ max: {maxRpn}
                      </span>
                    )}
                  </button>

                  {/* Kontrollplan Count Badge */}
                  <button
                    onClick={() => onSelectStepFilter(step.id, 'control_plan')}
                    className="flex items-center gap-1 text-slate-600 hover:text-brand-600 font-medium hover:underline text-[11px]"
                    title="Zum Kontrollplan für diesen Schritt springen"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-brand-600" />
                    <span>{stepControlPlans.length} Prüfpunkte</span>
                  </button>
                </div>

                {/* Edit & Delete Actions */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingStep(step)}
                      className="text-slate-400 hover:text-slate-700 p-1 transition-colors"
                      title="Schritt bearbeiten"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Prozessschritt "${step.name}" wirklich löschen?`)) {
                          onDeleteStep(step.id);
                        }
                      }}
                      className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                      title="Schritt entfernen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectStepFilter(step.id, 'fmea')}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 hover:text-brand-800"
                  >
                    <span>FMEA öffnen</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Step Modal */}
      {editingStep && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Prozessschritt bearbeiten
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Schritt-Nr.</label>
                  <input
                    type="text"
                    value={editingStep.stepNumber}
                    onChange={(e) => setEditingStep({ ...editingStep, stepNumber: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kategorie</label>
                  <select
                    value={editingStep.category}
                    onChange={(e) => setEditingStep({ ...editingStep, category: e.target.value as ProcessCategory })}
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bezeichnung</label>
                <input
                  type="text"
                  required
                  value={editingStep.name}
                  onChange={(e) => setEditingStep({ ...editingStep, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Beschreibung</label>
                <textarea
                  rows={2}
                  value={editingStep.description}
                  onChange={(e) => setEditingStep({ ...editingStep, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Verantwortlicher Bereich</label>
                  <input
                    type="text"
                    value={editingStep.responsibleArea}
                    onChange={(e) => setEditingStep({ ...editingStep, responsibleArea: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Maschine / Werkzeug</label>
                  <input
                    type="text"
                    value={editingStep.machineEquipment || ''}
                    onChange={(e) => setEditingStep({ ...editingStep, machineEquipment: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStep(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium rounded-lg bg-brand-600 hover:bg-brand-500 text-white shadow-sm"
                >
                  Änderungen speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
