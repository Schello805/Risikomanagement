import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AppState } from './storage';

export function exportPdfReport(state: AppState, reportType: 'fmea' | 'control_plan' | 'both' = 'both'): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header Helper
  const printHeader = (title: string) => {
    // Top banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 22, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 11);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Projekt: ${state.projectMeta.projectName} | Teil: ${state.projectMeta.partNumber}`, 14, 17);

    doc.setFontSize(8);
    doc.text(`Rev: ${state.projectMeta.revisionNumber} | Stand: ${state.projectMeta.revisionDate}`, pageWidth - 14, 17, { align: 'right' });
  };

  // Footer Helper
  const printFooter = (pageNum: number, totalPages?: number) => {
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Open Source Projekt von Michael Schellenberger | CC BY-NC 4.0 | Seite ${pageNum}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  };

  if (reportType === 'fmea' || reportType === 'both') {
    printHeader('PROZESS-FMEA (AIAG/VDA) - WARENEINGANG BIS VERSAND');

    // FMEA Table Data
    const tableHeaders = [
      ['Nr.', 'Prozessschritt', 'Potenzieller Fehler', 'B', 'Ursache', 'A', 'Vermeidung / Entdeckung', 'E', 'RPZ', 'Maßnahme', 'Status', 'RPZ neu']
    ];

    const tableBody = state.fmeaItems.map((item) => {
      const step = state.steps.find((s) => s.id === item.stepId);
      return [
        step ? step.stepNumber : '',
        step ? step.name : '',
        item.failureMode,
        String(item.severity),
        item.failureCause,
        String(item.occurrence),
        `${item.currentControlPrevention}\n[Det: ${item.currentControlDetection}]`,
        String(item.detection),
        String(item.rpn),
        `${item.recommendedAction || '-'}\n(${item.responsiblePerson || '-'})`,
        item.status.toUpperCase(),
        item.newRpn ? String(item.newRpn) : '-',
      ];
    });

    autoTable(doc, {
      head: tableHeaders,
      body: tableBody,
      startY: 26,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 26 },
        2: { cellWidth: 38 },
        3: { cellWidth: 8, halign: 'center' },
        4: { cellWidth: 35 },
        5: { cellWidth: 8, halign: 'center' },
        6: { cellWidth: 42 },
        7: { cellWidth: 8, halign: 'center' },
        8: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
        9: { cellWidth: 42 },
        10: { cellWidth: 20 },
        11: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
      },
      didDrawPage: (data) => {
        printFooter(data.pageNumber);
      },
    });
  }

  if (reportType === 'control_plan' || reportType === 'both') {
    if (reportType === 'both') {
      doc.addPage();
    }

    printHeader('KONTROLLPLAN / PRODUKTIONSLENKUNGSPLAN (PLP)');

    const cpHeaders = [
      ['Nr.', 'Prozessschritt', 'Maschine / Werkzeug', 'Prüfmerkmal', 'Typ', 'Spezifikation / Toleranz', 'Prüfmittel / Methode', 'Stichprobe / Frequenz', 'Lenkungsmethode', 'Reaktionsplan']
    ];

    const cpBody = state.controlPlanItems.map((item) => {
      const step = state.steps.find((s) => s.id === item.stepId);
      return [
        step ? step.stepNumber : '',
        step ? step.name : '',
        step ? (step.machineEquipment || '-') : '-',
        item.characteristicName,
        item.isSpecial ? `[${item.specialType || 'SC'}]` : 'Std',
        item.specification,
        item.evaluationMeasurementTechnique,
        `${item.sampleSize} / ${item.sampleFrequency}`,
        item.controlMethod,
        item.reactionPlan,
      ];
    });

    autoTable(doc, {
      head: cpHeaders,
      body: cpBody,
      startY: 26,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 28 },
        2: { cellWidth: 26 },
        3: { cellWidth: 36 },
        4: { cellWidth: 14, halign: 'center' },
        5: { cellWidth: 38 },
        6: { cellWidth: 32 },
        7: { cellWidth: 28 },
        8: { cellWidth: 32 },
        9: { cellWidth: 32 },
      },
      didDrawPage: (data) => {
        printFooter(data.pageNumber);
      },
    });
  }

  const safeTitle = (state.projectMeta.projectName || 'FMEA-Bericht')
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${safeTitle}_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`);
}
