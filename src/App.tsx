import React, { useState, useEffect } from 'react';
import { Header, TabType } from './components/Header';
import { Footer } from './components/Footer';
import { ProcessFlowView } from './components/ProcessFlowView';
import { FmeaTableView } from './components/FmeaTableView';
import { ControlPlanView } from './components/ControlPlanView';
import { RiskDashboardView } from './components/RiskDashboardView';
import { FmeaItemModal } from './components/FmeaItemModal';
import { ControlPlanItemModal } from './components/ControlPlanItemModal';
import { ProjectMetaModal } from './components/ProjectMetaModal';
import { SettingsModal } from './components/SettingsModal';

import { ProcessStep, FmeaItem, ControlPlanItem, ProjectMeta, RiskThresholds } from './types';
import { loadAppState, saveAppState, resetToDefaults, AppState } from './utils/storage';
import { exportToExcel } from './utils/excelExport';
import { exportPdfReport } from './utils/pdfExport';
import { getRiskLevel } from './utils/rpnCalculator';

export const App: React.FC = () => {
  // Load state on start
  const [appState, setAppState] = useState<AppState>(() => loadAppState());

  // Current View Tab
  const [currentTab, setCurrentTab] = useState<TabType>('process');

  // Filter state across tabs
  const [selectedStepIdFilter, setSelectedStepIdFilter] = useState<string | undefined>(undefined);

  // Modals state
  const [isFmeaModalOpen, setIsFmeaModalOpen] = useState(false);
  const [editingFmeaItem, setEditingFmeaItem] = useState<FmeaItem | null>(null);

  const [isCpModalOpen, setIsCpModalOpen] = useState(false);
  const [editingCpItem, setEditingCpItem] = useState<ControlPlanItem | null>(null);

  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Save to localStorage automatically on state change
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  // Derived counts
  const redRiskCount = appState.fmeaItems.filter((i) => {
    const risk = getRiskLevel(i.severity, i.rpn, appState.thresholds);
    return risk.level === 'high';
  }).length;

  // Handlers for Process Steps
  const handleAddStep = (newStepData: Omit<ProcessStep, 'id' | 'order'>) => {
    const newStep: ProcessStep = {
      ...newStepData,
      id: `step-${Date.now()}`,
      order: appState.steps.length + 1,
    };
    setAppState((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
  };

  const handleUpdateStep = (updatedStep: ProcessStep) => {
    setAppState((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => (s.id === updatedStep.id ? updatedStep : s)),
    }));
  };

  const handleDeleteStep = (stepId: string) => {
    setAppState((prev) => ({
      ...prev,
      steps: prev.steps.filter((s) => s.id !== stepId),
      fmeaItems: prev.fmeaItems.filter((f) => f.stepId !== stepId),
      controlPlanItems: prev.controlPlanItems.filter((cp) => cp.stepId !== stepId),
    }));
    if (selectedStepIdFilter === stepId) {
      setSelectedStepIdFilter(undefined);
    }
  };

  const handleMoveStep = (stepId: string, direction: 'up' | 'down') => {
    const sorted = [...appState.steps].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((s) => s.id === stepId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const prevStep = sorted[index - 1];
      const tempOrder = sorted[index].order;
      sorted[index].order = prevStep.order;
      prevStep.order = tempOrder;
    } else if (direction === 'down' && index < sorted.length - 1) {
      const nextStep = sorted[index + 1];
      const tempOrder = sorted[index].order;
      sorted[index].order = nextStep.order;
      nextStep.order = tempOrder;
    }

    setAppState((prev) => ({
      ...prev,
      steps: sorted,
    }));
  };

  // Step filter navigation from Flowchart
  const handleSelectStepFilter = (stepId: string, targetTab: 'fmea' | 'control_plan') => {
    setSelectedStepIdFilter(stepId);
    setCurrentTab(targetTab);
  };

  // Handlers for FMEA
  const handleSaveFmeaItem = (item: FmeaItem) => {
    setAppState((prev) => {
      const exists = prev.fmeaItems.some((f) => f.id === item.id);
      return {
        ...prev,
        fmeaItems: exists
          ? prev.fmeaItems.map((f) => (f.id === item.id ? item : f))
          : [item, ...prev.fmeaItems],
      };
    });
  };

  const handleDeleteFmeaItem = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      fmeaItems: prev.fmeaItems.filter((f) => f.id !== id),
    }));
  };

  const handleOpenNewFmeaModal = () => {
    setEditingFmeaItem(null);
    setIsFmeaModalOpen(true);
  };

  const handleEditFmeaItem = (item: FmeaItem) => {
    setEditingFmeaItem(item);
    setIsFmeaModalOpen(true);
  };

  // Auto-sync from FMEA to Control Plan
  const handleSyncFmeaToControlPlan = (fmeaItem: FmeaItem) => {
    const step = appState.steps.find((s) => s.id === fmeaItem.stepId);
    const newCpItem: ControlPlanItem = {
      id: `cp-${Date.now()}`,
      stepId: fmeaItem.stepId,
      characteristicName: `Prüfung auf: ${fmeaItem.failureMode}`,
      characteristicType: 'product',
      isSpecial: fmeaItem.specialCharacteristic !== 'none',
      specialType: fmeaItem.specialCharacteristic !== 'none' ? fmeaItem.specialCharacteristic : undefined,
      specification: fmeaItem.processFunction || 'Gemäß Zeichnungsvorgabe',
      evaluationMeasurementTechnique: fmeaItem.currentControlDetection || 'Optische Prüfung / Messmittel',
      sampleSize: '5 Teile',
      sampleFrequency: 'pro Charge / Schicht',
      controlMethod: fmeaItem.currentControlPrevention || 'Prüfprotokoll',
      reactionPlan: 'Charge sperren, QS informieren, Nacharbeit veranlassen',
      linkedFmeaItemId: fmeaItem.id,
    };

    setAppState((prev) => ({
      ...prev,
      controlPlanItems: [newCpItem, ...prev.controlPlanItems],
    }));

    alert(`Prüfpunkt "${newCpItem.characteristicName}" wurde erfolgreich in den Kontrollplan übernommen!`);
  };

  // Handlers for Control Plan
  const handleSaveControlPlanItem = (item: ControlPlanItem) => {
    setAppState((prev) => {
      const exists = prev.controlPlanItems.some((cp) => cp.id === item.id);
      return {
        ...prev,
        controlPlanItems: exists
          ? prev.controlPlanItems.map((cp) => (cp.id === item.id ? item : cp))
          : [item, ...prev.controlPlanItems],
      };
    });
  };

  const handleDeleteControlPlanItem = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      controlPlanItems: prev.controlPlanItems.filter((cp) => cp.id !== id),
    }));
  };

  const handleOpenNewCpModal = () => {
    setEditingCpItem(null);
    setIsCpModalOpen(true);
  };

  const handleEditCpItem = (item: ControlPlanItem) => {
    setEditingCpItem(item);
    setIsCpModalOpen(true);
  };

  // Handlers for Metadata & Settings
  const handleSaveMeta = (meta: ProjectMeta) => {
    setAppState((prev) => ({
      ...prev,
      projectMeta: meta,
    }));
  };

  const handleSaveThresholds = (thresholds: RiskThresholds) => {
    setAppState((prev) => ({
      ...prev,
      thresholds,
    }));
  };

  const handleRestoreState = (state: AppState) => {
    setAppState(state);
  };

  const handleResetDefaults = () => {
    const defaults = resetToDefaults();
    setAppState(defaults);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* App Header */}
      <Header
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          // If switching to dashboard or process, reset step filter
          if (tab === 'dashboard' || tab === 'process') {
            setSelectedStepIdFilter(undefined);
          }
        }}
        projectMeta={appState.projectMeta}
        onOpenMetaModal={() => setIsMetaModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onExportExcel={() => exportToExcel(appState)}
        onExportPdf={() => exportPdfReport(appState, 'both')}
        redRiskCount={redRiskCount}
        totalFmeaCount={appState.fmeaItems.length}
        totalControlPlanCount={appState.controlPlanItems.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        
        {/* Tab 1: Prozessablauf (Fließbild) */}
        {currentTab === 'process' && (
          <ProcessFlowView
            steps={appState.steps}
            fmeaItems={appState.fmeaItems}
            controlPlanItems={appState.controlPlanItems}
            onAddStep={handleAddStep}
            onUpdateStep={handleUpdateStep}
            onDeleteStep={handleDeleteStep}
            onMoveStep={handleMoveStep}
            onSelectStepFilter={handleSelectStepFilter}
          />
        )}

        {/* Tab 2: FMEA Arbeitsblatt */}
        {currentTab === 'fmea' && (
          <FmeaTableView
            fmeaItems={appState.fmeaItems}
            steps={appState.steps}
            thresholds={appState.thresholds}
            selectedStepIdFilter={selectedStepIdFilter}
            onSelectStepIdFilter={setSelectedStepIdFilter}
            onEditItem={handleEditFmeaItem}
            onDeleteItem={handleDeleteFmeaItem}
            onAddNewItem={handleOpenNewFmeaModal}
            onSyncToControlPlan={handleSyncFmeaToControlPlan}
          />
        )}

        {/* Tab 3: Kontrollplan (Produktionslenkungsplan) */}
        {currentTab === 'control_plan' && (
          <ControlPlanView
            controlPlanItems={appState.controlPlanItems}
            steps={appState.steps}
            fmeaItems={appState.fmeaItems}
            selectedStepIdFilter={selectedStepIdFilter}
            onSelectStepIdFilter={setSelectedStepIdFilter}
            onEditItem={handleEditCpItem}
            onDeleteItem={handleDeleteControlPlanItem}
            onAddNewItem={handleOpenNewCpModal}
          />
        )}

        {/* Tab 4: Risiko-Matrix & Dashboard */}
        {currentTab === 'dashboard' && (
          <RiskDashboardView
            fmeaItems={appState.fmeaItems}
            steps={appState.steps}
            thresholds={appState.thresholds}
            onSelectFmeaItem={(item) => {
              setEditingFmeaItem(item);
              setIsFmeaModalOpen(true);
            }}
            onNavigateToTab={(tab) => setCurrentTab(tab)}
          />
        )}

      </main>

      {/* App Footer */}
      <Footer />

      {/* Modals */}
      <FmeaItemModal
        isOpen={isFmeaModalOpen}
        onClose={() => setIsFmeaModalOpen(false)}
        item={editingFmeaItem}
        steps={appState.steps}
        thresholds={appState.thresholds}
        onSave={handleSaveFmeaItem}
        onCreateControlPlanItem={(stepId, char, spec, method, fmeaId) => {
          const newCp: ControlPlanItem = {
            id: `cp-${Date.now()}`,
            stepId,
            characteristicName: char,
            characteristicType: 'product',
            isSpecial: true,
            specialType: 'SC',
            specification: spec,
            evaluationMeasurementTechnique: method,
            sampleSize: '5 Teile',
            sampleFrequency: 'pro Charge',
            controlMethod: 'Prüfprotokoll',
            reactionPlan: 'Sperren & QS informieren',
            linkedFmeaItemId: fmeaId,
          };
          setAppState((prev) => ({
            ...prev,
            controlPlanItems: [newCp, ...prev.controlPlanItems],
          }));
        }}
      />

      <ControlPlanItemModal
        isOpen={isCpModalOpen}
        onClose={() => setIsCpModalOpen(false)}
        item={editingCpItem}
        steps={appState.steps}
        onSave={handleSaveControlPlanItem}
      />

      <ProjectMetaModal
        isOpen={isMetaModalOpen}
        onClose={() => setIsMetaModalOpen(false)}
        projectMeta={appState.projectMeta}
        onSave={handleSaveMeta}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        thresholds={appState.thresholds}
        onSaveThresholds={handleSaveThresholds}
        appState={appState}
        onRestoreState={handleRestoreState}
        onResetDefaults={handleResetDefaults}
      />

    </div>
  );
};

export default App;
