import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  CheckSquare, 
  Edit3, 
  Trash2, 
  Link2, 
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { ControlPlanItem, ProcessStep, FmeaItem } from '../types';

interface ControlPlanViewProps {
  controlPlanItems: ControlPlanItem[];
  steps: ProcessStep[];
  fmeaItems: FmeaItem[];
  selectedStepIdFilter?: string;
  onSelectStepIdFilter: (stepId: string | undefined) => void;
  onEditItem: (item: ControlPlanItem) => void;
  onDeleteItem: (id: string) => void;
  onAddNewItem: () => void;
  onNavigateToFmeaItem?: (fmeaItemId: string) => void;
}

export const ControlPlanView: React.FC<ControlPlanViewProps> = ({
  controlPlanItems,
  steps,
  fmeaItems,
  selectedStepIdFilter,
  onSelectStepIdFilter,
  onEditItem,
  onDeleteItem,
  onAddNewItem,
  onNavigateToFmeaItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'special_only' | 'product_only' | 'process_only'>('all');

  const filteredItems = useMemo(() => {
    return controlPlanItems.filter((item) => {
      if (selectedStepIdFilter) {
        const selectedStep = steps.find(s => s.id === selectedStepIdFilter);
        if (selectedStep?.level === 1) {
          const childIds = steps.filter(s => s.parentId === selectedStepIdFilter).map(s => s.id);
          const validIds = [selectedStepIdFilter, ...childIds];
          if (!validIds.includes(item.stepId)) return false;
        } else {
          if (item.stepId !== selectedStepIdFilter) return false;
        }
      }

      if (typeFilter === 'special_only' && !item.isSpecial) return false;
      if (typeFilter === 'product_only' && item.characteristicType !== 'product') return false;
      if (typeFilter === 'process_only' && item.characteristicType !== 'process') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const step = steps.find(s => s.id === item.stepId);
        const matchText = [
          step?.stepNumber,
          step?.name,
          item.characteristicName,
          item.specification,
          item.evaluationMeasurementTechnique,
          item.controlMethod,
          item.reactionPlan,
        ].join(' ').toLowerCase();

        if (!matchText.includes(q)) return false;
      }

      return true;
    });
  }, [controlPlanItems, steps, selectedStepIdFilter, typeFilter, searchQuery]);

  return (
    <div className="space-y-4">
      
      {/* Controls Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Left: Search & Filter */}
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Kontrollplan durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStepIdFilter || ''}
              onChange={(e) => onSelectStepIdFilter(e.target.value || undefined)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-700 max-w-[260px]"
            >
              <option value="">Alle Stationen ({steps.length})</option>
              {steps.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.level === 2 ? `   ↳ ${s.stepNumber} - ${s.name}` : `[${s.stepNumber}] ${s.name}`}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                typeFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Alle ({controlPlanItems.length})
            </button>
            <button
              onClick={() => setTypeFilter('special_only')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                typeFilter === 'special_only'
                  ? 'bg-amber-600 text-white shadow-xs font-bold'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              Besondere Merkmale (CC/SC)
            </button>
            <button
              onClick={() => setTypeFilter('product_only')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                typeFilter === 'product_only'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-brand-50 text-brand-800 hover:bg-brand-100 border border-brand-200'
              }`}
            >
              Produktmerkmale
            </button>
            <button
              onClick={() => setTypeFilter('process_only')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                typeFilter === 'process_only'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Prozessmerkmale
            </button>
          </div>
        </div>

        {/* Right Action Button */}
        <button
          onClick={onAddNewItem}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs shadow-sm transition-all hover:shadow active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Prüfpunkt hinzufügen</span>
        </button>

      </div>

      {/* Main Control Plan Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold divide-x divide-slate-800">
                <th className="py-2.5 px-3 w-16 text-center">Schritt</th>
                <th className="py-2.5 px-3 min-w-[140px]">Prozessschritt & Ausrüstung</th>
                <th className="py-2.5 px-3 min-w-[170px]">Prüfmerkmal (Produkt/Prozess)</th>
                <th className="py-2.5 px-2 w-14 text-center">Klasse</th>
                <th className="py-2.5 px-3 min-w-[160px]">Spezifikation / Toleranz</th>
                <th className="py-2.5 px-3 min-w-[150px]">Prüfmittel / Methode</th>
                <th className="py-2.5 px-3 min-w-[120px]">Stichprobe / Häufigkeit</th>
                <th className="py-2.5 px-3 min-w-[150px]">Lenkungsmethode</th>
                <th className="py-2.5 px-3 min-w-[170px] bg-red-950/40 text-red-100">Reaktionsplan bei Abweichung</th>
                <th className="py-2.5 px-3 min-w-[140px] text-center bg-slate-950 text-brand-300">Aktionen (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">Keine Kontrollplan-Prüfpunkte für diese Filterkriterien gefunden.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const step = steps.find((s) => s.id === item.stepId);
                  const linkedFmea = fmeaItems.find(f => f.id === item.linkedFmeaItemId);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors divide-x divide-slate-100 group text-slate-700"
                    >
                      {/* Step Number */}
                      <td className="py-2.5 px-2 text-center align-top">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono font-bold text-[11px] border border-slate-200">
                          {step?.stepNumber || '??'}
                        </span>
                      </td>

                      {/* Process Step Name & Equipment */}
                      <td className="py-2.5 px-3 align-top">
                        <div className="font-semibold text-slate-900">{step?.name || '-'}</div>
                        {step?.machineEquipment && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {step.machineEquipment}
                          </div>
                        )}
                      </td>

                      {/* Characteristic */}
                      <td className="py-2.5 px-3 align-top">
                        <div className="font-semibold text-slate-800">{item.characteristicName}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.2 rounded font-medium ${
                            item.characteristicType === 'product' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {item.characteristicType === 'product' ? 'Produktmerkmal' : 'Prozessmerkmal'}
                          </span>

                          {linkedFmea && (
                            <span className="inline-flex items-center gap-0.5 text-brand-600 font-mono text-[10px]" title={`Verknüpft mit FMEA: ${linkedFmea.failureMode}`}>
                              <Link2 className="w-3 h-3" />
                              <span>FMEA</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Special Type (CC/SC) */}
                      <td className="py-2.5 px-2 align-top text-center">
                        {item.isSpecial ? (
                          <span className={`inline-block px-1.5 py-0.5 rounded font-mono font-bold text-[10px] border ${
                            item.specialType === 'CC' 
                              ? 'bg-red-100 text-red-700 border-red-300' 
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`} title={item.specialType === 'CC' ? 'Critical (Sicherheitsrelevant)' : 'Significant (Funktionsrelevant)'}>
                            {item.specialType || 'SC'}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Specification / Tolerance */}
                      <td className="py-2.5 px-3 align-top font-mono text-slate-800 font-medium">
                        {item.specification}
                      </td>

                      {/* Measurement Technique */}
                      <td className="py-2.5 px-3 align-top text-slate-700">
                        {item.evaluationMeasurementTechnique || '-'}
                      </td>

                      {/* Sample Size & Frequency */}
                      <td className="py-2.5 px-3 align-top text-slate-700">
                        <div className="font-medium">{item.sampleSize}</div>
                        <div className="text-[11px] text-slate-500">{item.sampleFrequency}</div>
                      </td>

                      {/* Control Method */}
                      <td className="py-2.5 px-3 align-top text-slate-700">
                        {item.controlMethod}
                      </td>

                      {/* Reaction Plan */}
                      <td className="py-2.5 px-3 align-top text-red-900 bg-red-50/30 font-medium text-[11px]">
                        {item.reactionPlan}
                      </td>

                      {/* Actions (CRUD) */}
                      <td className="py-2.5 px-3 align-top text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => onEditItem(item)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors"
                            title="Prüfpunkt bearbeiten (UPDATE)"
                          >
                            <Edit3 className="w-3 h-3 text-slate-600" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Prüfpunkt "${item.characteristicName}" wirklich löschen?`)) {
                                onDeleteItem(item.id);
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[11px] font-medium transition-colors"
                            title="Prüfpunkt löschen (DELETE)"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Löschen</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
          <span>Gesamt Prüfpunkte: <strong>{filteredItems.length}</strong></span>
          <span className="text-slate-500">Konform mit IATF 16949 / QS-9000 Produktionslenkungsplan</span>
        </div>
      </div>

    </div>
  );
};
