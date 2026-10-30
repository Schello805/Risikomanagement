import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  Clock, 
  Layers, 
  ShieldAlert, 
  Flame,
  ArrowRight
} from 'lucide-react';
import { FmeaItem, ProcessStep, RiskThresholds } from '../types';
import { getRiskLevel, getRpnDelta } from '../utils/rpnCalculator';

interface RiskDashboardViewProps {
  fmeaItems: FmeaItem[];
  steps: ProcessStep[];
  thresholds: RiskThresholds;
  onSelectFmeaItem: (item: FmeaItem) => void;
  onNavigateToTab: (tab: 'fmea' | 'control_plan' | 'process') => void;
}

export const RiskDashboardView: React.FC<RiskDashboardViewProps> = ({
  fmeaItems,
  steps,
  thresholds,
  onSelectFmeaItem,
  onNavigateToTab,
}) => {
  // Statistics Calculations
  const totalRisks = fmeaItems.length;
  
  const highRisks = fmeaItems.filter(i => getRiskLevel(i.severity, i.rpn, thresholds).level === 'high');
  const mediumRisks = fmeaItems.filter(i => getRiskLevel(i.severity, i.rpn, thresholds).level === 'medium');
  const lowRisks = fmeaItems.filter(i => getRiskLevel(i.severity, i.rpn, thresholds).level === 'low');

  const openActions = fmeaItems.filter(i => i.status === 'offen');
  const inProgressActions = fmeaItems.filter(i => i.status === 'in_bearbeitung');
  const completedActions = fmeaItems.filter(i => i.status === 'abgeschlossen');

  // Average RPN initial vs completed
  const avgInitialRpn = totalRisks > 0 
    ? Math.round(fmeaItems.reduce((acc, curr) => acc + curr.rpn, 0) / totalRisks)
    : 0;

  const reevaluatedItems = fmeaItems.filter(i => typeof i.newRpn === 'number' && i.newRpn > 0);
  const avgNewRpn = reevaluatedItems.length > 0
    ? Math.round(reevaluatedItems.reduce((acc, curr) => acc + (curr.newRpn || 0), 0) / reevaluatedItems.length)
    : avgInitialRpn;

  const overallDelta = avgInitialRpn > 0 ? Math.round(((avgInitialRpn - avgNewRpn) / avgInitialRpn) * 100) : 0;

  // Top 5 Highest Initial RPZ
  const topRisks = [...fmeaItems]
    .sort((a, b) => b.rpn - a.rpn)
    .slice(0, 5);

  // 10x10 Matrix: B (Severity 10 down to 1) vs A (Occurrence 1 to 10)
  const matrix: Record<string, FmeaItem[]> = {};
  for (let b = 1; b <= 10; b++) {
    for (let a = 1; a <= 10; a++) {
      matrix[`${b}-${a}`] = [];
    }
  }

  fmeaItems.forEach((item) => {
    const key = `${item.severity}-${item.occurrence}`;
    if (matrix[key]) {
      matrix[key].push(item);
    }
  });

  return (
    <div className="space-y-6">
      
      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Critical High Risks */}
        <div className="bg-white rounded-xl p-5 border border-red-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kritische Risiken</span>
              <div className="text-3xl font-extrabold text-red-600 mt-1">{highRisks.length}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span>RPZ ≥ {thresholds.redThreshold} oder Bedeutung B ≥ 9</span>
          </p>
        </div>

        {/* Card 2: Open Actions */}
        <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Laufende Maßnahmen</span>
              <div className="text-3xl font-extrabold text-amber-600 mt-1">
                {openActions.length + inProgressActions.length}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 flex items-center gap-2">
            <span className="text-amber-800 font-semibold">{openActions.length} offen</span>
            <span className="text-slate-300">•</span>
            <span className="text-sky-700 font-semibold">{inProgressActions.length} in Arbeit</span>
          </p>
        </div>

        {/* Card 3: Completed Actions */}
        <div className="bg-white rounded-xl p-5 border border-emerald-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Abgeschlossene Maßnahmen</span>
              <div className="text-3xl font-extrabold text-emerald-600 mt-1">{completedActions.length}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            {totalRisks > 0 ? Math.round((completedActions.length / totalRisks) * 100) : 0}% der Fehlerfälle abgesichert
          </p>
        </div>

        {/* Card 4: Average Risk Reduction */}
        <div className="bg-white rounded-xl p-5 border border-brand-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Risikosenkung (Delta)</span>
              <div className="text-3xl font-extrabold text-brand-600 mt-1">
                {overallDelta > 0 ? `-${overallDelta}%` : '0%'}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Durchschnitts-RPZ: <strong>{avgInitialRpn}</strong> ➔ <strong className="text-emerald-700">{avgNewRpn}</strong>
          </p>
        </div>

      </div>

      {/* Main Grid: 10x10 Heatmap & Top Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: 10x10 Heatmap Matrix (B vs A) */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Risikomatrix: Bedeutung (B) vs. Auftreten (A)</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">10 x 10</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Konzentration der Fehlerfälle. Rote Zone oben rechts & B ≥ 9 kennzeichnet akute Gefahrenbereiche.
              </p>
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-2 text-[11px]">
              <span className="flex items-center gap-1 text-red-700"><span className="w-3 h-3 rounded bg-red-500 inline-block"></span> Kritisch</span>
              <span className="flex items-center gap-1 text-amber-700"><span className="w-3 h-3 rounded bg-amber-400 inline-block"></span> Mäßig</span>
              <span className="flex items-center gap-1 text-emerald-700"><span className="w-3 h-3 rounded bg-emerald-400 inline-block"></span> Gering</span>
            </div>
          </div>

          {/* Matrix Container */}
          <div className="overflow-x-auto">
            <div className="min-w-[500px]">
              {/* Y-Axis Label */}
              <div className="text-center font-bold text-xs text-slate-600 mb-1">
                ▲ Bedeutung der Fehlerfolge (B) 10 (Extrem) bis 1 (Minimal)
              </div>

              {/* Grid Rows from B=10 down to B=1 */}
              <div className="space-y-1">
                {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((bVal) => (
                  <div key={bVal} className="flex items-center gap-1">
                    {/* Y Header */}
                    <span className={`w-6 text-right font-mono font-bold text-xs ${bVal >= 9 ? 'text-red-600' : 'text-slate-600'}`}>
                      {bVal}
                    </span>

                    {/* Cells for A=1 to A=10 */}
                    <div className="grid grid-cols-10 gap-1 flex-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((aVal) => {
                        const items = matrix[`${bVal}-${aVal}`] || [];
                        const count = items.length;

                        // Calculate cell risk tint
                        const cellScore = bVal * aVal;
                        let cellBg = 'bg-slate-50 hover:bg-slate-100 text-slate-400';
                        if (bVal >= 9 || cellScore >= 50) {
                          cellBg = count > 0 
                            ? 'bg-red-500 text-white font-bold ring-2 ring-red-600 shadow-sm' 
                            : 'bg-red-50/60 hover:bg-red-100/60 text-red-300';
                        } else if (cellScore >= 25) {
                          cellBg = count > 0 
                            ? 'bg-amber-400 text-slate-900 font-bold shadow-sm' 
                            : 'bg-amber-50/60 hover:bg-amber-100/60 text-amber-300';
                        } else {
                          cellBg = count > 0 
                            ? 'bg-emerald-500 text-white font-bold shadow-sm' 
                            : 'bg-emerald-50/40 hover:bg-emerald-100/40 text-emerald-300';
                        }

                        return (
                          <div
                            key={aVal}
                            className={`h-7 rounded flex items-center justify-center text-xs font-mono transition-all cursor-pointer ${cellBg}`}
                            title={`Bedeutung B=${bVal}, Auftreten A=${aVal}: ${count} Fehlerfälle`}
                            onClick={() => {
                              if (items.length > 0) {
                                onSelectFmeaItem(items[0]);
                              }
                            }}
                          >
                            {count > 0 ? count : ''}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* X-Axis Numbers & Label */}
              <div className="flex items-center gap-1 mt-1">
                <span className="w-6"></span>
                <div className="grid grid-cols-10 gap-1 flex-1 text-center font-mono font-bold text-xs text-slate-600">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((aVal) => (
                    <span key={aVal}>{aVal}</span>
                  ))}
                </div>
              </div>

              <div className="text-center font-bold text-xs text-slate-600 mt-1">
                ► Auftretenswahrscheinlichkeit (A) 1 (Unwahrscheinlich) bis 10 (Sicher)
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Top 5 Critical Risks */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-red-600" />
                <span>Top 5 Risiken (Priorität)</span>
              </h3>
              <button
                onClick={() => onNavigateToTab('fmea')}
                className="text-xs text-brand-600 hover:text-brand-800 font-medium flex items-center gap-0.5"
              >
                <span>Alle</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {topRisks.map((item, index) => {
                const step = steps.find(s => s.id === item.stepId);
                const risk = getRiskLevel(item.severity, item.rpn, thresholds);

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectFmeaItem(item)}
                    className="p-3 rounded-lg border border-slate-200 hover:border-brand-400 hover:bg-brand-50/20 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                          {item.failureMode}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${risk.badgeClass}`}>
                        RPZ {item.rpn}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
                      <span>Station: {step?.stepNumber} {step?.name}</span>
                      <span className="font-mono">B:{item.severity} A:{item.occurrence} E:{item.detection}</span>
                    </div>

                    {item.recommendedAction && (
                      <div className="text-[11px] text-slate-700 font-medium mt-1 bg-slate-50 p-1.5 rounded border border-slate-100 line-clamp-1">
                        Maßnahme: {item.recommendedAction}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => onNavigateToTab('fmea')}
              className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium text-center transition-colors shadow-sm"
            >
              Maßnahmenplan im FMEA-Arbeitsblatt bearbeiten
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
