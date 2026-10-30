import * as XLSX from 'xlsx';
import { AppState } from './storage';
import { getRiskLevel } from './rpnCalculator';

export function exportToExcel(state: AppState): void {
  const wb = XLSX.utils.book_new();

  // 1. Deckblatt Sheet
  const coverData = [
    ['PROZESS-FMEA & KONTROLLPLAN (PRODUKTIONSLENKUNGSPLAN)'],
    ['Erstellt mit dem Open-Source FMEA Manager von Michael Schellenberger'],
    [],
    ['STAMMDATEN & PROJEKT-INFORMATIONEN'],
    ['Projektname:', state.projectMeta.projectName],
    ['Dokumentennummer:', state.projectMeta.documentNumber],
    ['Teilenummer / Sachnummer:', state.projectMeta.partNumber],
    ['Teilebezeichnung:', state.projectMeta.partDescription],
    ['Produktionswerk / Linie:', state.projectMeta.plantLocation],
    ['Kunde:', state.projectMeta.customer],
    ['Verantwortlicher Projektleiter:', state.projectMeta.responsibleLead],
    ['Kernteam:', state.projectMeta.coreTeam],
    ['FMEA Erstellungsdatum:', state.projectMeta.fmeaDate],
    ['Letzte Revision:', state.projectMeta.revisionDate],
    ['Revisionsstand:', state.projectMeta.revisionNumber],
    [],
    ['RISIKO-SCHWELLENWERTE'],
    ['Hohes Risiko (ROT):', `RPZ >= ${state.thresholds.redThreshold} oder B >= 9`],
    ['Mittleres Risiko (GELB):', `RPZ ${state.thresholds.yellowThreshold} bis ${state.thresholds.redThreshold - 1}`],
    ['Akzeptables Risiko (GRÜN):', `RPZ < ${state.thresholds.yellowThreshold}`],
  ];
  const wsCover = XLSX.utils.aoa_to_sheet(coverData);
  XLSX.utils.book_append_sheet(wb, wsCover, 'Deckblatt');

  // 2. Hierarchischer Prozessablauf Sheet
  const processHeaders = [
    'Hierarchie-Ebene',
    'Schritt-Nr.',
    'Prozessbezeichnung (Hierarchie)',
    'Übergeordneter Prozess',
    'Kategorie',
    'Verantwortlicher Bereich',
    'Maschine / Ausrüstung',
    'Anzahl FMEA-Risiken',
    'Max. RPZ',
    'Kontrollplan Prüfpunkte',
    'Beschreibung',
  ];

  // Organize steps hierarchically
  const parentSteps = state.steps.filter((s) => s.level === 1 || !s.parentId).sort((a, b) => a.order - b.order);
  const processRows: any[][] = [];

  parentSteps.forEach((parent) => {
    // Parent Row stats
    const subSteps = state.steps.filter((s) => s.parentId === parent.id && s.level === 2).sort((a, b) => a.order - b.order);
    const allRelevantIds = [parent.id, ...subSteps.map(s => s.id)];
    const parentFmeas = state.fmeaItems.filter(f => allRelevantIds.includes(f.stepId));
    const parentCps = state.controlPlanItems.filter(cp => allRelevantIds.includes(cp.stepId));
    const maxRpn = parentFmeas.length > 0 ? Math.max(...parentFmeas.map(f => f.rpn)) : 0;

    processRows.push([
      '1. Hauptprozess',
      parent.stepNumber,
      `[${parent.stepNumber}] ${parent.name.toUpperCase()}`,
      '- (Hauptstufe)',
      parent.category.toUpperCase(),
      parent.responsibleArea,
      parent.machineEquipment || '-',
      parentFmeas.length,
      maxRpn || '-',
      parentCps.length,
      parent.description || '',
    ]);

    // Sub-process Rows (Indented with arrow)
    subSteps.forEach((sub) => {
      const subFmeas = state.fmeaItems.filter(f => f.stepId === sub.id);
      const subCps = state.controlPlanItems.filter(cp => cp.stepId === sub.id);
      const subMaxRpn = subFmeas.length > 0 ? Math.max(...subFmeas.map(f => f.rpn)) : 0;

      processRows.push([
        '   2. Teilschritt',
        sub.stepNumber,
        `      ↳ [${sub.stepNumber}] ${sub.name}`,
        `[${parent.stepNumber}] ${parent.name}`,
        sub.category,
        sub.responsibleArea,
        sub.machineEquipment || '-',
        subFmeas.length,
        subMaxRpn || '-',
        subCps.length,
        sub.description || '',
      ]);
    });
  });

  const wsProcess = XLSX.utils.aoa_to_sheet([processHeaders, ...processRows]);
  XLSX.utils.book_append_sheet(wb, wsProcess, 'Prozesshierarchie');

  // 3. FMEA Arbeitsblatt Sheet
  const fmeaHeaders = [
    'Schritt-Nr.',
    'Prozessschritt (Hierarchie)',
    'Hauptprozess',
    'Prozessfunktion (Soll)',
    'Potenzieller Fehler',
    'Potenzielle Fehlerfolge',
    'B (Bedeutung)',
    'Bes. Merkmal (CC/SC)',
    'Potenzielle Fehlerursache',
    'A (Auftreten)',
    'Vermeidungsmaßnahme',
    'Entdeckungsmaßnahme',
    'E (Entdeckung)',
    'RPZ (Initial)',
    'Risiko-Bewertung',
    'Empfohlene Maßnahme',
    'Verantwortlich',
    'Zieldatum',
    'Status',
    'B (Neu)',
    'A (Neu)',
    'E (Neu)',
    'RPZ (Neu)',
    'Notizen',
  ];

  const fmeaRows = state.fmeaItems.map((item) => {
    const step = state.steps.find((s) => s.id === item.stepId);
    let parentStepName = '-';
    if (step?.parentId) {
      const parent = state.steps.find(s => s.id === step.parentId);
      if (parent) parentStepName = `[${parent.stepNumber}] ${parent.name}`;
    } else if (step) {
      parentStepName = `[${step.stepNumber}] ${step.name}`;
    }

    const risk = getRiskLevel(item.severity, item.rpn, state.thresholds);

    return [
      step ? step.stepNumber : '',
      step ? (step.level === 2 ? `↳ ${step.name}` : step.name) : '',
      parentStepName,
      item.processFunction,
      item.failureMode,
      item.failureEffect,
      item.severity,
      item.specialCharacteristic === 'none' ? '-' : item.specialCharacteristic,
      item.failureCause,
      item.occurrence,
      item.currentControlPrevention,
      item.currentControlDetection,
      item.detection,
      item.rpn,
      risk.label,
      item.recommendedAction,
      item.responsiblePerson,
      item.targetDate,
      item.status.toUpperCase(),
      item.newSeverity || '',
      item.newOccurrence || '',
      item.newDetection || '',
      item.newRpn || '',
      item.notes || '',
    ];
  });

  const wsFmea = XLSX.utils.aoa_to_sheet([fmeaHeaders, ...fmeaRows]);
  XLSX.utils.book_append_sheet(wb, wsFmea, 'Prozess-FMEA');

  // 4. Kontrollplan Sheet
  const cpHeaders = [
    'Schritt-Nr.',
    'Prozessschritt (Hierarchie)',
    'Hauptprozess',
    'Maschine / Vorrichtung',
    'Prüfmerkmal',
    'Merkmalstyp',
    'Klassifizierung (CC/SC)',
    'Spezifikation / Toleranz',
    'Prüfmittel / Methode',
    'Stichprobenumfang',
    'Prüfhäufigkeit',
    'Lenkungsmethode',
    'Reaktionsplan bei Abweichung',
  ];

  const cpRows = state.controlPlanItems.map((item) => {
    const step = state.steps.find((s) => s.id === item.stepId);
    let parentStepName = '-';
    if (step?.parentId) {
      const parent = state.steps.find(s => s.id === step.parentId);
      if (parent) parentStepName = `[${parent.stepNumber}] ${parent.name}`;
    } else if (step) {
      parentStepName = `[${step.stepNumber}] ${step.name}`;
    }

    return [
      step ? step.stepNumber : '',
      step ? (step.level === 2 ? `↳ ${step.name}` : step.name) : '',
      parentStepName,
      step ? step.machineEquipment || '-' : '-',
      item.characteristicName,
      item.characteristicType === 'product' ? 'Produkt' : 'Prozess',
      item.isSpecial ? item.specialType || 'Ja' : 'Standard',
      item.specification,
      item.evaluationMeasurementTechnique,
      item.sampleSize,
      item.sampleFrequency,
      item.controlMethod,
      item.reactionPlan,
    ];
  });

  const wsCp = XLSX.utils.aoa_to_sheet([cpHeaders, ...cpRows]);
  XLSX.utils.book_append_sheet(wb, wsCp, 'Kontrollplan (PLP)');

  // Dateiname generieren & herunterladen
  const safeTitle = (state.projectMeta.projectName || 'FMEA-Kontrollplan')
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  XLSX.writeFile(wb, `${safeTitle}_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
}
