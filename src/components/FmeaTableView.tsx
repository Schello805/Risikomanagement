import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ChevronRight,
  SlidersHorizontal,
  Share2,
  Info
} from 'lucide-react';
import { FmeaItem, ProcessStep, RiskThresholds } from '../types';
import { getRiskLevel, getRpnDelta } from '../utils/rpnCalculator';

interface FmeaTableViewProps {
  fmeaItems: FmeaItem[];
  steps: ProcessStep[];
  thresholds: RiskThresholds;
  selectedStepIdFilter?: string;
  onSelectStepIdFilter: (stepId: string | undefined) => void;
  onEditItem: (item: FmeaItem) => void;
  onDeleteItem: (id: string) => void;
  onAddNewItem: () => void;
  onSyncToControlPlan: (item: FmeaItem) => void;
}

export const FmeaTableView: React.FC<FmeaTableViewProps> = ({
  fmeaItems,
  steps,
  thresholds,
  selectedStepIdFilter,
  onSelectStepIdFilter,
  onEditItem,
  onDeleteItem,
  onAddNewItem,
  onSyncToControlPlan,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'high_risk' | 'open_actions' | 'special_char'>('all');

  // Filtered Items
  const filteredItems = useMemo(() => {
    return fmeaItems.filter((item) => {
      // Step filter (supports parent filter showing children)
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

      // Quick filter type
      if (filterType === 'high_risk') {
        const risk = getRiskLevel(item.severity, item.rpn, thresholds);
        if (risk.level !== 'high') return false;
      } else if (filterType === 'open_actions') {
        if (item.status === 'abgeschlossen' || item.status === 'verworfen') return false;
      } else if (filterType === 'special_char') {
        if (item.specialCharacteristic === 'none') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const step = steps.find(s => s.id === item.stepId);
        const matchText = [
          step?.stepNumber,
          step?.name,
          item.processFunction,
          item.failureMode,
          item.failureEffect,
          item.failureCause,
          item.recommendedAction,
          item.responsiblePerson,
        ].join(' ').toLowerCase();

        if (!matchText.includes(q)) return false;
      }

      return true;
    });
  }, [fmeaItems, steps, thresholds, selectedStepIdFilter, filterType, searchQuery]);

  // Quick stats
  const totalRisks = fmeaItems.length;
  const highRisks = fmeaItems.filter(i => getRiskLevel(i.severity, i.rpn, thresholds).level === 'high').length;
  const openActions = fmeaItems.filter(i => i.status === 'offen' || i.status === 'in_bearbeitung').length;

  return (
    <div className="space-y-4">
      
      {/* Top Controls Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Left: Search & Step Filter */}
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          {/* Search Box */}
          <div className="relative min-w-[220px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="FMEA durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
            />
          </div>

          {/* Process Step Selector */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStepIdFilter || ''}
              onChange={(e) => onSelectStepIdFilter(e.target.value || undefined)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-700 max-w-[260px]"
            >
              <option value="">Alle Prozessschritte ({steps.length})</option>
              {steps.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.level === 2 ? `   ↳ ${s.stepNumber} - ${s.name}` : `[${s.stepNumber}] ${s.name}`}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Alle ({totalRisks})
            </button>
            <button
              onClick={() => setFilterType('high_risk')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                filterType === 'high_risk'
                  ? 'bg-red-600 text-white shadow-xs font-bold'
                  : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Hohe Risiken ({highRisks})</span>
            </button>
            <button
              onClick={() => setFilterType('open_actions')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                filterType === 'open_actions'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Offene Maßnahmen ({openActions})</span>
            </button>
            <button
              onClick={() => setFilterType('special_char')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                filterType === 'special_char'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200'
              }`}
            >
              Merkmale (CC/SC)
            </button>
          </div>
        </div>

        {/* Right: New FMEA Item Button */}
        <button
          onClick={onAddNewItem}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs shadow-sm transition-all hover:shadow active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Fehlerfall analysieren</span>
        </button>

      </div>

      {/* Main FMEA Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold divide-x divide-slate-800">
                <th className="py-2.5 px-3 w-16 text-center">Schritt</th>
                <th className="py-2.5 px-3 min-w-[130px]">Prozessfunktion</th>
                <th className="py-2.5 px-3 min-w-[150px]">Potenzieller Fehler</th>
                <th className="py-2.5 px-3 min-w-[140px]">Fehlerfolge</th>
                <th className="py-2.5 px-2 w-10 text-center" title="Bedeutung der Fehlerfolge (1-10)">B</th>
                <th className="py-2.5 px-2 w-12 text-center" title="Besonderes Merkmal">BM</th>
                <th className="py-2.5 px-3 min-w-[140px]">Fehlerursache</th>
                <th className="py-2.5 px-2 w-10 text-center" title="Auftretenswahrscheinlichkeit (1-10)">A</th>
                <th className="py-2.5 px-3 min-w-[150px]">Bestehende Maßnahmen (Prävention / Entdeckung)</th>
                <th className="py-2.5 px-2 w-10 text-center" title="Entdeckungswahrscheinlichkeit (1-10)">E</th>
                <th className="py-2.5 px-3 w-16 text-center bg-slate-950 font-bold" title="Risikoprioritätszahl = B × A × E">RPZ</th>
                <th className="py-2.5 px-3 min-w-[160px] bg-brand-950/60 text-brand-200">Abstellmaßnahme</th>
                <th className="py-2.5 px-2 w-12 text-center bg-brand-950/60 text-brand-200" title="Neue RPZ nach Umsetzung">RPZ neu</th>
                <th className="py-2.5 px-3 w-28 text-center bg-brand-950/60 text-brand-200">Status</th>
                <th className="py-2.5 px-2 w-20 text-center">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-12 text-center text-slate-400">
                    <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">Keine FMEA-Einträge für diese Filterkriterien gefunden.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const step = steps.find((s) => s.id === item.stepId);
                  const risk = getRiskLevel(item.severity, item.rpn, thresholds);
                  const newRisk = item.newRpn ? getRiskLevel(item.newSeverity || item.severity, item.newRpn, thresholds) : null;
                  const delta = item.newRpn ? getRpnDelta(item.rpn, item.newRpn) : null;

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
                        <span className="block text-[10px] text-slate-400 truncate max-w-[60px] mt-0.5" title={step?.name}>
                          {step?.name}
                        </span>
                      </td>

                      {/* Process Function */}
                      <td className="py-2.5 px-3 align-top text-slate-600">
                        {item.processFunction || '-'}
                      </td>

                      {/* Failure Mode */}
                      <td className="py-2.5 px-3 align-top font-semibold text-slate-900">
                        {item.failureMode}
                      </td>

                      {/* Failure Effect */}
                      <td className="py-2.5 px-3 align-top text-slate-600">
                        {item.failureEffect || '-'}
                      </td>

                      {/* B - Severity */}
                      <td className="py-2.5 px-2 align-top text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-bold font-mono text-xs ${
                          item.severity >= 9 ? 'bg-red-600 text-white' : item.severity >= 7 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {item.severity}
                        </span>
                      </td>

                      {/* BM - Special Characteristic */}
                      <td className="py-2.5 px-2 align-top text-center">
                        {item.specialCharacteristic === 'CC' && (
                          <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold font-mono text-[10px] border border-red-300" title="Critical Characteristic (Sicherheit)">
                            CC
                          </span>
                        )}
                        {item.specialCharacteristic === 'SC' && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold font-mono text-[10px] border border-amber-300" title="Significant Characteristic (Funktion)">
                            SC
                          </span>
                        )}
                        {item.specialCharacteristic === 'none' && (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Failure Cause */}
                      <td className="py-2.5 px-3 align-top text-slate-600">
                        {item.failureCause || '-'}
                      </td>

                      {/* A - Occurrence */}
                      <td className="py-2.5 px-2 align-top text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-mono font-bold text-xs">
                          {item.occurrence}
                        </span>
                      </td>

                      {/* Controls (Prevention & Detection) */}
                      <td className="py-2.5 px-3 align-top space-y-1">
                        {item.currentControlPrevention && (
                          <div className="text-[11px]">
                            <span className="font-semibold text-slate-500">Verm:</span> {item.currentControlPrevention}
                          </div>
                        )}
                        {item.currentControlDetection && (
                          <div className="text-[11px] text-slate-500">
                            <span className="font-semibold text-slate-400">Entd:</span> {item.currentControlDetection}
                          </div>
                        )}
                        {!item.currentControlPrevention && !item.currentControlDetection && (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* E - Detection */}
                      <td className="py-2.5 px-2 align-top text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-mono font-bold text-xs">
                          {item.detection}
                        </span>
                      </td>

                      {/* RPZ 1 Badge */}
                      <td className="py-2.5 px-3 align-top text-center bg-slate-50/50">
                        <span className={`inline-block px-2 py-1 rounded-md font-mono font-bold text-xs shadow-xs ${risk.badgeClass}`}>
                          {item.rpn}
                        </span>
                      </td>

                      {/* Action & Responsible */}
                      <td className="py-2.5 px-3 align-top bg-brand-50/20">
                        <div className="font-medium text-slate-800">
                          {item.recommendedAction || <span className="text-slate-400 italic">Keine Maßnahme hinterlegt</span>}
                        </div>
                        {(item.responsiblePerson || item.targetDate) && (
                          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                            {item.responsiblePerson && <span>{item.responsiblePerson}</span>}
                            {item.targetDate && (
                              <span className="font-mono text-slate-400">({item.targetDate})</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* RPZ 2 (New) */}
                      <td className="py-2.5 px-2 align-top text-center bg-brand-50/20">
                        {item.newRpn ? (
                          <div>
                            <span className={`inline-block px-1.5 py-0.5 rounded font-mono font-bold text-xs ${newRisk?.badgeClass}`}>
                              {item.newRpn}
                            </span>
                            {delta && delta.improved && (
                              <span className="block text-[10px] text-emerald-600 font-semibold mt-0.5">
                                -{delta.percent}%
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 align-top text-center bg-brand-50/20">
                        {item.status === 'abgeschlossen' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Erledigt</span>
                          </span>
                        )}
                        {item.status === 'in_bearbeitung' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold text-[11px]">
                            <Clock className="w-3 h-3 text-sky-600" />
                            <span>In Arbeit</span>
                          </span>
                        )}
                        {item.status === 'offen' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium text-[11px]">
                            <span>Offen</span>
                          </span>
                        )}
                        {item.status === 'verworfen' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px]">
                            <span>Verworfen</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-2 align-top text-center">
                        <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={() => onEditItem(item)}
                            className="p-1 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded transition-colors"
                            title="Fehlerfall bearbeiten"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onSyncToControlPlan(item)}
                            className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded transition-colors"
                            title="In Kontrollplan übernehmen"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Fehlerfall "${item.failureMode}" wirklich löschen?`)) {
                                onDeleteItem(item.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded transition-colors"
                            title="Eintrag löschen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* Table Footer Summary Bar */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-4">
            <span>Angezeigt: <strong>{filteredItems.length}</strong> von {fmeaItems.length} Einträgen</span>
            <span className="text-slate-300">|</span>
            <span className="text-red-700 font-medium">{highRisks} mit Handlungsbedarf</span>
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <span>Bewertungsskala: 1 (Minimal) bis 10 (Maximal) gem. VDA/AIAG</span>
          </div>
        </div>

      </div>

    </div>
  );
};
