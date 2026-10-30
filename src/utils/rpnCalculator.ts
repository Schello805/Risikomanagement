import { RatingCriterion, RiskThresholds } from '../types';

export const SEVERITY_CRITERIA: RatingCriterion[] = [
  { score: 10, shortLabel: 'Gefahr ohne Warnung', description: 'Extrem gefährlich; Ausfall gefährdet Bedienpersonal/Kunden ohne Vorwarnung; Nichteinhaltung gesetzlicher Vorschriften.' },
  { score: 9, shortLabel: 'Gefahr mit Warnung', description: 'Sehr gefährlich; Ausfall beeinträchtigt Sicherheit/Gesetze, jedoch kündigt sich der Fehler vorher an.' },
  { score: 8, shortLabel: 'Sehr hoch / Ausfall', description: 'Primärfunktion des Produkts/Prozesses vollständig ausgefallen; Kunde stark verärgert; 100% Nacharbeit oder Stillstand.' },
  { score: 7, shortLabel: 'Hoch / Einschränkung', description: 'Primärfunktion stark eingeschränkt; Produkt betriebsbereit, aber Leistungsverlust spürbar.' },
  { score: 6, shortLabel: 'Mäßig / Komfort', description: 'Sekundärfunktion fällt aus (z.B. Komfortverlust); Nacharbeit oder Ausschuss in der Fertigung.' },
  { score: 5, shortLabel: 'Gering', description: 'Mäßige Auswirkungen; Komfort- oder Funktionsminderung spürbar für den Kunden; Teilnacharbeit intern.' },
  { score: 4, shortLabel: 'Sehr gering', description: 'Geringfügige Auswirkung; Fehler wird von den meisten Kunden bemerkt (z.B. Optik/Passung leicht abweichend).' },
  { score: 3, shortLabel: 'Leicht', description: 'Sehr geringe Beeinträchtigung; Fehler wird nur von anspruchsvollen Kunden bemerkt.' },
  { score: 2, shortLabel: 'Sehr leicht', description: 'Kaum wahrnehmbarer Mangel; leichte Nachjustierung im Werk möglich.' },
  { score: 1, shortLabel: 'Keine Auswirkung', description: 'Keine spürbare Auswirkung auf Produkt, Prozess oder Anwender.' },
];

export const OCCURRENCE_CRITERIA: RatingCriterion[] = [
  { score: 10, shortLabel: 'Sehr hoch / unvermeidbar', description: 'Fehler tritt fast sicher auf (Fehlerquote ≥ 1:10 bzw. ≥ 100.000 ppm).' },
  { score: 9, shortLabel: 'Sehr hoch', description: 'Häufige Ausfälle in ähnlichen Prozessen (Fehlerquote ca. 1:20 bzw. 50.000 ppm).' },
  { score: 8, shortLabel: 'Hoch', description: 'Wiederholte Prozessfehler (Fehlerquote ca. 1:50 bzw. 20.000 ppm).' },
  { score: 7, shortLabel: 'Mäßig hoch', description: 'Gelegentliche Fehler im Prozessablauf (Fehlerquote ca. 1:100 bzw. 10.000 ppm).' },
  { score: 6, shortLabel: 'Mäßig', description: 'Gelegentliches Auftreten bekannt (Fehlerquote ca. 1:500 bzw. 2.000 ppm).' },
  { score: 5, shortLabel: 'Gering bis mäßig', description: 'Geringe Fehlerhäufigkeit (Fehlerquote ca. 1:2.000 bzw. 500 ppm).' },
  { score: 4, shortLabel: 'Gering', description: 'Seltene Fehler im Betrieb (Fehlerquote ca. 1:10.000 bzw. 100 ppm).' },
  { score: 3, shortLabel: 'Sehr gering', description: 'Sehr seltene Fehler bei ähnlichen Prozessen (Fehlerquote ca. 1:100.000 bzw. 10 ppm).' },
  { score: 2, shortLabel: 'Extrem gering', description: 'Fehler ist nahezu unwahrscheinlich (Fehlerquote ca. 1:1.000.000 bzw. 1 ppm).' },
  { score: 1, shortLabel: 'Ausgeschlossen', description: 'Fehler durch Prozessdesign/Poka-Yoke physikalisch unmöglich.' },
];

export const DETECTION_CRITERIA: RatingCriterion[] = [
  { score: 10, shortLabel: 'Absolut unsicher', description: 'Keine Prüfung vorhanden oder Fehler kann durch bekannte Methoden nicht entdeckt werden.' },
  { score: 9, shortLabel: 'Sehr unwahrscheinlich', description: 'Sehr schlechte Entdeckungswahrscheinlichkeit; nur stichprobenartige manuelle Sichtkontrolle am Ende.' },
  { score: 8, shortLabel: 'Unwahrscheinlich', description: 'Späte Entdeckung nach Prozessende bei Stichprobenprüfung.' },
  { score: 7, shortLabel: 'Sehr gering', description: 'Manuelle Prüfung mit Doppelprüfung oder nachfolgenden Bearbeitungsschritten.' },
  { score: 6, shortLabel: 'Gering', description: 'Stichprobenprüfung direkt an der Station mit Messmitteln.' },
  { score: 5, shortLabel: 'Mäßig', description: '100% manuelle Prüfung oder statistische Prozesskontrolle (SPC).' },
  { score: 4, shortLabel: 'Mäßig hoch', description: '100% automatische Prüfung mit anschließender Fehlerkennzeichnung.' },
  { score: 3, shortLabel: 'Hoch', description: 'Automatische In-Prozess-Messung mit Ausschleusung fehlerhafter Teile.' },
  { score: 2, shortLabel: 'Sehr hoch', description: 'Automatische Fehlererkennung an der Station mit sofortigem Prozess-Stopp.' },
  { score: 1, shortLabel: 'Fast sicher', description: 'Fehler wird durch Poka-Yoke Konstruktion sicher verhindert bzw. 100% sofort erkannt.' },
];

export type RiskLevel = 'high' | 'medium' | 'low';

export function calculateRpn(b: number, a: number, e: number): number {
  const safeB = Math.max(1, Math.min(10, Number(b) || 1));
  const safeA = Math.max(1, Math.min(10, Number(a) || 1));
  const safeE = Math.max(1, Math.min(10, Number(e) || 1));
  return safeB * safeA * safeE;
}

export function getRiskLevel(
  severity: number,
  rpn: number,
  thresholds: RiskThresholds = { redThreshold: 100, yellowThreshold: 50, autoRedOnSeverityHigh: true }
): { level: RiskLevel; label: string; colorClass: string; badgeClass: string } {
  // Sonderregel: B >= 9 ist immer ROT (Sicherheits- & Gesetzesrisiko)
  if (thresholds.autoRedOnSeverityHigh && severity >= 9) {
    return {
      level: 'high',
      label: 'Kritisch (B ≥ 9)',
      colorClass: 'text-red-700 bg-red-50 border-red-200',
      badgeClass: 'bg-red-600 text-white font-bold',
    };
  }

  if (rpn >= thresholds.redThreshold) {
    return {
      level: 'high',
      label: 'Hohes Risiko',
      colorClass: 'text-red-700 bg-red-50 border-red-200',
      badgeClass: 'bg-red-500 text-white font-bold',
    };
  }

  if (rpn >= thresholds.yellowThreshold) {
    return {
      level: 'medium',
      label: 'Mittleres Risiko',
      colorClass: 'text-amber-800 bg-amber-50 border-amber-200',
      badgeClass: 'bg-amber-500 text-white font-semibold',
    };
  }

  return {
    level: 'low',
    label: 'Akzeptabel',
    colorClass: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    badgeClass: 'bg-emerald-600 text-white font-medium',
  };
}

export function getRpnDelta(rpn1: number, rpn2?: number): { delta: number; percent: number; improved: boolean } {
  if (!rpn2 || rpn2 <= 0) return { delta: 0, percent: 0, improved: false };
  const delta = rpn1 - rpn2;
  const percent = Math.round((delta / rpn1) * 100);
  return {
    delta,
    percent,
    improved: delta > 0,
  };
}
