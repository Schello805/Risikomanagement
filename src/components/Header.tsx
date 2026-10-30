import React from 'react';
import { 
  ShieldAlert, 
  Layers, 
  Table, 
  ClipboardList, 
  BarChart3, 
  FileSpreadsheet, 
  FileText, 
  Settings, 
  SlidersHorizontal,
  FolderOpen,
  AlertTriangle
} from 'lucide-react';
import { ProjectMeta, RiskThresholds } from '../types';

export type TabType = 'process' | 'fmea' | 'control_plan' | 'dashboard';

interface HeaderProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  projectMeta: ProjectMeta;
  onOpenMetaModal: () => void;
  onOpenSettingsModal: () => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  redRiskCount: number;
  totalFmeaCount: number;
  totalControlPlanCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  projectMeta,
  onOpenMetaModal,
  onOpenSettingsModal,
  onExportExcel,
  onExportPdf,
  redRiskCount,
  totalFmeaCount,
  totalControlPlanCount,
}) => {
  return (
    <header className="no-print bg-slate-900 text-white shadow-md sticky top-0 z-40 border-b border-slate-800">
      {/* Top Banner: Project Title and Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        
        {/* Brand & Project Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white font-bold text-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white tracking-tight">FMEA & Kontrollplan Manager</h1>
              <span className="text-[11px] px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-mono border border-brand-400/30">
                AIAG / VDA 4
              </span>
            </div>
            <button
              onClick={onOpenMetaModal}
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors group mt-0.5"
              title="Projektstammdaten bearbeiten"
            >
              <span className="font-semibold text-slate-100 group-hover:underline">{projectMeta.projectName}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">Teil: {projectMeta.partNumber}</span>
              <span className="text-slate-500">|</span>
              <span className="text-brand-400 font-mono text-[11px]">{projectMeta.revisionNumber}</span>
              <SlidersHorizontal className="w-3 h-3 text-slate-400 group-hover:text-white ml-1 opacity-70" />
            </button>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
          {/* Quick Alert Badge */}
          {redRiskCount > 0 && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-medium animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>{redRiskCount} Hohe Risiken</span>
            </div>
          )}

          {/* Export Buttons */}
          <button
            onClick={onExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-sm transition-all hover:shadow active:scale-95"
            title="FMEA & Kontrollplan als Excel (.xlsx) exportieren"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel Export</span>
          </button>

          <button
            onClick={onExportPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-slate-700 transition-all hover:shadow active:scale-95"
            title="Druckbericht / PDF generieren"
          >
            <FileText className="w-3.5 h-3.5 text-brand-400" />
            <span>PDF Bericht</span>
          </button>

          {/* Project Settings Modal Trigger */}
          <button
            onClick={onOpenSettingsModal}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition-all"
            title="Einstellungen & Daten-Backup"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex space-x-1 sm:space-x-2 border-t border-slate-800/80 pt-1" aria-label="Tabs">
          
          {/* Tab: Prozessablauf */}
          <button
            onClick={() => onTabChange('process')}
            className={`flex items-center gap-2 py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-medium border-b-2 transition-all ${
              currentTab === 'process'
                ? 'border-brand-400 text-brand-300 bg-slate-800/40 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Prozessablauf (Fließbild)</span>
          </button>

          {/* Tab: FMEA Arbeitsblatt */}
          <button
            onClick={() => onTabChange('fmea')}
            className={`flex items-center gap-2 py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-medium border-b-2 transition-all ${
              currentTab === 'fmea'
                ? 'border-brand-400 text-brand-300 bg-slate-800/40 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>2. FMEA Arbeitsblatt</span>
            <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              {totalFmeaCount}
            </span>
          </button>

          {/* Tab: Kontrollplan (PLP) */}
          <button
            onClick={() => onTabChange('control_plan')}
            className={`flex items-center gap-2 py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-medium border-b-2 transition-all ${
              currentTab === 'control_plan'
                ? 'border-brand-400 text-brand-300 bg-slate-800/40 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>3. Kontrollplan (PLP)</span>
            <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              {totalControlPlanCount}
            </span>
          </button>

          {/* Tab: Risiko Dashboard */}
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center gap-2 py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-medium border-b-2 transition-all ${
              currentTab === 'dashboard'
                ? 'border-brand-400 text-brand-300 bg-slate-800/40 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>4. Risiko-Matrix & Dashboard</span>
          </button>

        </nav>
      </div>
    </header>
  );
};
