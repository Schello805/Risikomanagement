import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronRight, 
  ChevronDown, 
  AlertCircle, 
  CheckCircle2, 
  Package, 
  CheckSquare, 
  Factory, 
  Truck, 
  Archive, 
  ShieldCheck, 
  Layers,
  CornerDownRight,
  FolderPlus,
  ArrowRight,
  Filter
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

const CATEGORY_CONFIG: Record<ProcessCategory, { label: string; icon: React.ReactNode; bg: string; text: string; border: string }> = {
  wareneingang: { label: 'Wareneingang', icon: <Truck className="w-3.5 h-3.5" />, bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  pruefung: { label: 'QS-Prüfung', icon: <CheckSquare className="w-3.5 h-3.5" />, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  lager: { label: 'Lagerung', icon: <Archive className="w-3.5 h-3.5" />, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  kommissionierung: { label: 'Kommissionierung', icon: <Layers className="w-3.5 h-3.5" />, bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  fertigung: { label: 'Fertigung/Montage', icon: <Factory className="w-3.5 h-3.5" />, bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  endpruefung: { label: 'Endprüfung/EOL', icon: <ShieldCheck className="w-3.5 h-3.5" />, bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  verpackung: { label: 'Verpackung', icon: <Package className="w-3.5 h-3.5" />, bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  versand: { label: 'Versand/Warenausgang', icon: <Truck className="w-3.5 h-3.5" />, bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
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
  // Modal / Form state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<ProcessStep | null>(null);

  // Form Fields
  const [stepLevel, setStepLevel] = useState<1 | 2>(1);
  const [parentId, setParentId] = useState<string>('');
  const [stepNumber, setStepNumber] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProcessCategory>('wareneingang');
  const [description, setDescription] = useState('');
  const [responsibleArea, setResponsibleArea] = useState('');
  const [machineEquipment, setMachineEquipment] = useState('');

  // Collapsed main processes
  const [collapsedParentIds, setCollapsedParentIds] = useState<Set<string>>(new Set());

  // Parent processes (Level 1)
  const parentSteps = useMemo(() => {
    return steps.filter((s) => s.level === 1 || !s.parentId).sort((a, b) => a.order - b.order);
  }, [steps]);

  // Hierarchical list of steps
  const hierarchicalSteps = useMemo(() => {
    const list: { step: ProcessStep; isSub: boolean; parentStep?: ProcessStep }[] = [];

    parentSteps.forEach((parent) => {
      list.push({ step: parent, isSub: false });

      if (!collapsedParentIds.has(parent.id)) {
        const subSteps = steps
          .filter((s) => s.parentId === parent.id && s.level === 2)
          .sort((a, b) => a.order - b.order);

        subSteps.forEach((sub) => {
          list.push({ step: sub, isSub: true, parentStep: parent });
        });
      }
    });

    return list;
  }, [parentSteps, steps, collapsedParentIds]);

  const toggleCollapse = (parentIdToToggle: string) => {
    setCollapsedParentIds((prev) => {
      const next = new Set(prev);
      if (next.has(parentIdToToggle)) {
        next.delete(parentIdToToggle);
      } else {
        next.add(parentIdToToggle);
      }
      return next;
    });
  };

  const handleOpenAddModal = (level: 1 | 2 = 1, defaultParentId?: string) => {
    setStepLevel(level);
    setParentId(defaultParentId || (parentSteps.length > 0 ? parentSteps[0].id : ''));
    
    // Auto-generate suggested step number
    if (level === 1) {
      setStepNumber(`${(parentSteps.length + 1) * 10}`);
    } else if (defaultParentId) {
      const parent = steps.find(s => s.id === defaultParentId);
      const existingSubs = steps.filter(s => s.parentId === defaultParentId);
      setStepNumber(`${parent?.stepNumber || '10'}.${existingSubs.length + 1}`);
    } else {
      setStepNumber('10.1');
    }

    setName('');
    setDescription('');
    setResponsibleArea('');
    setMachineEquipment('');
    setIsAddModalOpen(true);
  };

  const handleSubmitNewStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddStep({
      stepNumber: stepNumber.trim(),
      name: name.trim(),
      category,
      description: description.trim(),
      responsibleArea: responsibleArea.trim() || 'Produktion',
      machineEquipment: machineEquipment.trim(),
      level: stepLevel,
      parentId: stepLevel === 2 ? parentId : undefined,
    });

    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStep) return;
    onUpdateStep(editingStep);
    setEditingStep(null);
  };

  // Helper to get FMEA count including sub-steps for a parent
  const getStepStats = (step: ProcessStep) => {
    let relevantStepIds = [step.id];
    if (step.level === 1) {
      const subIds = steps.filter(s => s.parentId === step.id).map(s => s.id);
      relevantStepIds = [step.id, ...subIds];
    }

    const relevantFmeas = fmeaItems.filter(f => relevantStepIds.includes(f.stepId));
    const relevantControlPlans = controlPlanItems.filter(cp => relevantStepIds.includes(cp.stepId));

    const maxRpn = relevantFmeas.length > 0 ? Math.max(...relevantFmeas.map(f => f.rpn)) : 0;
    const hasRedRisk = relevantFmeas.some(f => getRiskLevel(f.severity, f.rpn).level === 'high');

    return {
      fmeaCount: relevantFmeas.length,
      cpCount: relevantControlPlans.length,
      maxRpn,
      hasRedRisk,
    };
  };

  const totalMainSteps = parentSteps.length;
  const totalSubSteps = steps.filter(s => s.level === 2).length;

  return (
    <div className="space-y-5">
      
      {/* Top Banner & Actions */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-slate-800">
              Prozessablauf & Hierarchie
            </h2>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white font-semibold">
                {totalMainSteps} Hauptprozesse
              </span>
              <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-semibold border border-brand-200">
                {totalSubSteps} Teilschritte
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Hierarchische Gliederung der Produktion von der Materialanlieferung bis zum Versand. Strukturiert für sauberen Excel-Export.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleOpenAddModal(1)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <FolderPlus className="w-4 h-4 text-brand-300" />
            <span>Neuer Hauptprozess</span>
          </button>

          <button
            onClick={() => handleOpenAddModal(2)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Neuer Teilschritt (Unterprozess)</span>
          </button>
        </div>
      </div>

      {/* Main Hierarchical Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold divide-x divide-slate-800">
                <th className="py-3 px-3 w-20 text-center">Nr.</th>
                <th className="py-3 px-4 min-w-[280px]">Prozessbezeichnung / Hierarchie</th>
                <th className="py-3 px-3 min-w-[140px]">Kategorie</th>
                <th className="py-3 px-3 min-w-[150px]">Verantwortlicher Bereich</th>
                <th className="py-3 px-3 min-w-[180px]">Maschine / Werkzeug / Prüfmittel</th>
                <th className="py-3 px-3 w-32 text-center" title="FMEA Fehlerfälle">FMEA Risiken</th>
                <th className="py-3 px-3 w-28 text-center" title="Kontrollplan Prüfpunkte">Kontrollplan</th>
                <th className="py-3 px-3 w-36 text-center">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {hierarchicalSteps.map(({ step, isSub, parentStep }) => {
                const cat = CATEGORY_CONFIG[step.category] || CATEGORY_CONFIG.fertigung;
                const stats = getStepStats(step);
                const isCollapsed = collapsedParentIds.has(step.id);
                const hasChildren = steps.some(s => s.parentId === step.id);

                return (
                  <tr
                    key={step.id}
                    className={`transition-colors divide-x divide-slate-100 group ${
                      !isSub 
                        ? 'bg-slate-50/90 font-semibold text-slate-900 hover:bg-slate-100/90' 
                        : 'bg-white text-slate-700 hover:bg-brand-50/20'
                    }`}
                  >
                    {/* Step Number */}
                    <td className="py-2.5 px-3 text-center align-middle">
                      <span className={`inline-block font-mono text-xs px-2 py-0.5 rounded ${
                        !isSub 
                          ? 'bg-slate-900 text-white font-bold shadow-xs' 
                          : 'bg-slate-100 text-slate-800 font-medium border border-slate-200'
                      }`}>
                        {step.stepNumber}
                      </span>
                    </td>

                    {/* Hierarchy Name (Indented for Level 2) */}
                    <td className="py-2.5 px-4 align-middle">
                      <div className="flex items-center gap-2">
                        {/* Parent Toggle / Sub Indent */}
                        {!isSub ? (
                          <button
                            onClick={() => toggleCollapse(step.id)}
                            className="p-1 rounded hover:bg-slate-200 text-slate-500 transition-colors"
                            title={isCollapsed ? 'Unterprozesse aufklappen' : 'Unterprozesse zuklappen'}
                          >
                            {isCollapsed ? (
                              <ChevronRight className="w-4 h-4 text-brand-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-700" />
                            )}
                          </button>
                        ) : (
                          <div className="pl-6 flex items-center text-slate-300">
                            <CornerDownRight className="w-4 h-4 text-brand-500 mr-1" />
                          </div>
                        )}

                        {/* Title and Badge */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={!isSub ? 'text-sm font-bold text-slate-950 tracking-tight' : 'text-xs font-semibold text-slate-800'}>
                              {step.name}
                            </span>
                            {!isSub && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                                Hauptprozess
                              </span>
                            )}
                          </div>
                          {step.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-normal">
                              {step.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category Badge */}
                    <td className="py-2.5 px-3 align-middle">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border ${cat.bg} ${cat.border} ${cat.text}`}>
                        {cat.icon}
                        <span>{cat.label}</span>
                      </span>
                    </td>

                    {/* Responsible Area */}
                    <td className="py-2.5 px-3 align-middle text-slate-600">
                      {step.responsibleArea || '-'}
                    </td>

                    {/* Machine / Equipment */}
                    <td className="py-2.5 px-3 align-middle text-slate-600">
                      {step.machineEquipment ? (
                        <span className="line-clamp-1" title={step.machineEquipment}>
                          {step.machineEquipment}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* FMEA Linkage & Risk */}
                    <td className="py-2.5 px-3 align-middle text-center">
                      <button
                        onClick={() => onSelectStepFilter(step.id, 'fmea')}
                        className={`inline-flex items-center gap-1.5 font-medium px-2 py-1 rounded-md transition-colors ${
                          stats.hasRedRisk 
                            ? 'bg-red-50 text-red-700 border border-red-200 font-bold' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                        title="Zur FMEA-Tabelle für diesen Schritt springen"
                      >
                        {stats.hasRedRisk ? (
                          <AlertCircle className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span>{stats.fmeaCount}</span>
                        {stats.maxRpn > 0 && (
                          <span className={`text-[10px] font-mono px-1 rounded ${
                            stats.hasRedRisk ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            RPZ {stats.maxRpn}
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Control Plan Linkage */}
                    <td className="py-2.5 px-3 align-middle text-center">
                      <button
                        onClick={() => onSelectStepFilter(step.id, 'control_plan')}
                        className="inline-flex items-center gap-1 text-slate-700 hover:text-brand-600 bg-slate-100 hover:bg-brand-50 px-2 py-1 rounded-md text-xs font-medium border border-slate-200 transition-colors"
                        title="Zum Kontrollplan für diesen Schritt springen"
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-brand-600" />
                        <span>{stats.cpCount} Punkte</span>
                      </button>
                    </td>

                    {/* Row Actions */}
                    <td className="py-2.5 px-3 align-middle text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* If main process, allow adding sub-step directly */}
                        {!isSub && (
                          <button
                            onClick={() => handleOpenAddModal(2, step.id)}
                            className="p-1 text-brand-600 hover:bg-brand-50 rounded transition-colors"
                            title="Unterprozess hinzufügen"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => setEditingStep(step)}
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                          title="Schritt bearbeiten"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Prozessschritt "${step.name}" und zugehörige Verknüpfungen wirklich entfernen?`)) {
                              onDeleteStep(step.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded transition-colors"
                          title="Schritt löschen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-4">
            <span>Gesamt Prozesskette: <strong>{parentSteps.length}</strong> Hauptprozesse mit <strong>{totalSubSteps}</strong> Teilschritten</span>
          </div>

          <div className="text-slate-500">
            Exportierbar als strukturierte Excel-Tabelle mit Einrückung und Verknüpfungen
          </div>
        </div>
      </div>

      {/* Modal: Neuen Schritt hinzufügen (Haupt- oder Unterprozess) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand-600" />
              <span>{stepLevel === 1 ? 'Neuen Hauptprozess anlegen' : 'Neuen Unterprozess (Teilschritt) anlegen'}</span>
            </h3>

            <form onSubmit={handleSubmitNewStep} className="space-y-4">
              {/* Level Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hierarchie-Ebene</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStepLevel(1);
                      setStepNumber(`${(parentSteps.length + 1) * 10}`);
                    }}
                    className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                      stepLevel === 1 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    1. Hauptprozess (z.B. WE)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStepLevel(2);
                      if (parentSteps.length > 0 && !parentId) {
                        setParentId(parentSteps[0].id);
                      }
                    }}
                    className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                      stepLevel === 2 
                        ? 'bg-brand-600 text-white border-brand-600 shadow-sm' 
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    2. Unterprozess (Eingerückt)
                  </button>
                </div>
              </div>

              {/* If Level 2: Parent Process Picker */}
              {stepLevel === 2 && (
                <div>
                  <label className="block text-xs font-semibold text-brand-900 mb-1">Übergeordneter Hauptprozess *</label>
                  <select
                    value={parentId}
                    onChange={(e) => {
                      setParentId(e.target.value);
                      const p = steps.find(s => s.id === e.target.value);
                      const existing = steps.filter(s => s.parentId === e.target.value);
                      setStepNumber(`${p?.stepNumber || '10'}.${existing.length + 1}`);
                    }}
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  >
                    {parentSteps.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.stepNumber} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Schritt-Nr. *</label>
                  <input
                    type="text"
                    required
                    placeholder="z.B. 10.1"
                    value={stepNumber}
                    onChange={(e) => setStepNumber(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kategorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProcessCategory)}
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Prozessbezeichnung *</label>
                <input
                  type="text"
                  required
                  placeholder={stepLevel === 1 ? 'z.B. Wareneingang (WE)' : 'z.B. WE Buchung & ERP-Erfassung'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Beschreibung des Ablaufs</label>
                <textarea
                  rows={2}
                  placeholder="Welche Tätigkeiten und Prüfungen finden statt?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Verantwortlicher Bereich</label>
                  <input
                    type="text"
                    placeholder="z.B. Wareneingang, QS"
                    value={responsibleArea}
                    onChange={(e) => setResponsibleArea(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Maschine / Ausrüstung</label>
                  <input
                    type="text"
                    placeholder="z.B. 2D-Scanner, Messschieber"
                    value={machineEquipment}
                    onChange={(e) => setMachineEquipment(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium rounded-lg bg-brand-600 hover:bg-brand-500 text-white shadow-sm"
                >
                  Prozessschritt anlegen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Schritt bearbeiten */}
      {editingStep && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
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
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Maschine / Ausrüstung</label>
                  <input
                    type="text"
                    value={editingStep.machineEquipment || ''}
                    onChange={(e) => setEditingStep({ ...editingStep, machineEquipment: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
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
