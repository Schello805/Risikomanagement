import * as XLSX from 'xlsx';
import { AppState } from './storage';

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

  // 2. FMEA Arbeitsblatt Sheet
  const fmeaHeaders = [
    'Schritt-Nr.',
    'Prozessschritt',
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
    return [
      step ? step.stepNumber : '',
      step ? step.name : '',
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

  // 3. Kontrollplan Sheet
  const cpHeaders = [
    'Schritt-Nr.',
    'Prozessschritt',
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
    return [
      step ? step.stepNumber : '',
      step ? step.name : '',
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
