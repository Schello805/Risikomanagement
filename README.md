# 🛡️ Prozess-FMEA & Kontrollplan Manager

> **Moderne, integrierte Webapplikation für Prozess-FMEA und Produktionslenkungsplan (PLP) – von der Anlieferung im Wareneingang bis zum Warenausgang & Versand.**

[![Lizenz: CC BY-NC 4.0](https://img.shields.io/badge/Lizenz-CC_BY--NC_4.0-blue.svg)](https://creativecommons.org/licenses/by-nc/4.0/deed.de)
[![Version](https://img.shields.io/badge/Version-1.0.0-emerald.svg)](package.json)
[![Tech Stack](https://img.shields.io/badge/Stack-React_18_•_TypeScript_•_Tailwind_CSS_•_Vite-sky.svg)](package.json)
[![Open Source](https://img.shields.io/badge/Open_Source-Michael_Schellenberger-purple.svg)](#autor--open-source)

---

## 📖 Übersicht & Zielsetzung

In produzierenden Industriezweigen (Automotive, Maschinenbau, Medizintechnik, Elektronik) sind die **Prozess-FMEA** (Fehlermöglichkeits- und Einflussanalyse) und der **Kontrollplan** (Produktionslenkungsplan / Control Plan) die zentralen Säulen des Qualitäts- und Risikomanagements.

Bestehende Softwarelösungen sind häufig schwerfällig, überteuert oder unübersichtlich in Excel-Tabellen gefangen. Diese Webapplikation bietet ein **modernes, browserbasiertes, voll integriertes Werkzeug**, das den gesamten Fertigungsdurchlauf lückenlos abbildet:

```
[10] Wareneingang ➔ [20] Wareneingangsprüfung ➔ [30] Einlagerung ➔ [40] Kommissionierung
       ➔ [50] Fertigung / Montage ➔ [60] Endprüfung (EOL) ➔ [70] Verpackung ➔ [80] Versand
```

---

## ✨ Hauptfunktionen

### 1. 🔄 Interaktive Prozesskette (Fließbild)
- Visuelle Darstellung aller Stationen vom Wareneingang bis zum Versand.
- Beliebig erweiterbar, verschiebbar (Reihenfolge anpassen) und editierbar.
- Direkte Anzeige verknüpfter Risikozahlen und Prüfpunkte je Station mit Farbampel.
- 1-Klick-Sprung in das FMEA-Arbeitsblatt oder den Kontrollplan für den jeweiligen Schritt.

### 2. 📋 FMEA-Arbeitsblatt (Klassischer VDA / AIAG Standard)
- **Risikobewertung:** Automatische Berechnung der Risikoprioritätszahl $\text{RPZ} = B \times A \times E$ (Skala 1 bis 10).
  - **Bedeutung (B):** Schwere der Fehlerfolge beim Kunden / im Prozess.
  - **Auftretenswahrscheinlichkeit (A):** Erwartete Fehlerhäufigkeit.
  - **Entdeckungswahrscheinlichkeit (E):** Wahrscheinlichkeit der Fehlerentdeckung vor Auslieferung.
- **Integrierte Kriterienkataloge:** Auswahllisten mit offiziellen Erläuterungen für jeden Punktwert (1–10).
- **Dynamische 3-Stufen-Ampel:**
  - 🔴 **ROT (Hohes Risiko):** $\text{RPZ} \ge 100$ **ODER** $B \ge 9$ (Sicherheits- / Gesetzesrisiko hat immer Vorrang).
  - 🟡 **GELB (Mittleres Risiko):** $\text{RPZ} \ge 50$.
  - 🟢 **GRÜN (Akzeptabel):** $\text{RPZ} < 50$.
- **Besondere Merkmale:** Kennzeichnung von **CC** (*Critical Characteristic* / Sicherheit) und **SC** (*Significant Characteristic* / Passung & Funktion).

### 3. 🎯 Maßnahmenverfolgung (Vorher / Nachher Optimierung)
- Zuweisung von Abstellmaßnahmen mit **Verantwortlichem**, **Zieldatum** und **Bearbeitungsstatus** (*Offen*, *In Bearbeitung*, *Abgeschlossen*, *Verworfen*).
- **Neubewertung nach Wirksamkeitsprüfung:** Erfassung von $B_2, A_2, E_2$ und Live-Berechnung der neuen $\text{RPZ}_{\text{neu}}$ inklusive prozentualer Risikoreduktion (z. B. *-85% Risiko*).
- **1-Klick-Übernahme:** Maßnahmen und Prüfungen lassen sich mit einem Klick direkt in den Kontrollplan übertragen.

### 4. 📝 Schlanker Kontrollplan (Produktionslenkungsplan / PLP)
- Ausgerichtet an **IATF 16949 / QS-9000**:
  - Prozessschritt & Maschine / Werkzeug
  - Prüfmerkmal (Produkt- oder Prozessmerkmal, inkl. CC/SC-Klassifizierung)
  - Spezifikation / Toleranz / Sollwert
  - Prüfmittel / Messmethode
  - Stichprobenumfang & Prüfhäufigkeit
  - Lenkungsmethode & **Reaktionsplan bei Abweichung**

### 5. 📊 Visuelle 10×10 Risikomatrix & Dashboard
- **Heatmap (B vs. A):** 10×10 Matrix zeigt Risikocluster auf einen Blick.
- **Top 5 Prioritätsrisiken:** Sofortiger Überblick über die dringlichsten Handlungsfelder.
- **Maßnahmen-Fortschritt:** Live-Statistiken über erledigte, offene und in Prüfung befindliche Punkte.

### 6. 📤 Export & Datensicherheit
- **Excel (.xlsx) Export:** Formatierte Arbeitsblätter für *Deckblatt*, *FMEA-Tabelle* und *Kontrollplan*.
- **PDF-Export:** Druckoptimierter Bericht im Querformat mit vollständigem Projekt-Kopf.
- **JSON Projekt-Backup:** Schnelles Sichern und Wiederherstellen von Projekten für die Weitergabe im Team ohne Datenbank-Setup.
- **100% Local-First:** Alle Daten verbleiben sicher im lokalen Speicher des Browsers (*LocalStorage*).

---

## 🛠️ Technische Architektur

Das Projekt ist modular, schlank und skalierbar aufgebaut:

| Komponente | Technologie | Zweck |
| :--- | :--- | :--- |
| **Frontend Framework** | [React 18](https://react.dev/) | Komponentenbasierte Benutzeroberfläche |
| **Typisierung** | [TypeScript 5](https://www.typescriptlang.org/) | Typsicherheit und Wartbarkeit |
| **Build-Tool** | [Vite 6](https://vitejs.dev/) | Extrem schnelle Build- und Entwicklungszeiten |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) | Responsives, modernes Industrie-Design |
| **Icons** | [Lucide React](https://lucide.dev/) | Konsistente Qualitätsmanagement-Piktogramme |
| **Excel Export** | [SheetJS (xlsx)](https://docs.sheetjs.com/) | Clientseitige Tabellenerstellung |
| **PDF Export** | [jsPDF & AutoTable](https://artskydj.github.io/jsPDF/) | Druckfertige Vektor-PDFs |

---

## 🚀 Schnellstart & Installation

Da du als Anwender keine Vorkenntnisse in der Programmierung benötigst, sind zur lokalen Ausführung lediglich zwei Befehle im Terminal erforderlich:

### Voraussetzungen
- [Node.js](https://nodejs.org/) (Version 18 oder höher empfohlen)

### 1. Abhängigkeiten installieren
```bash
npm install
```

### 2. Applikation starten
```bash
npm run dev
```
Öffne anschließend die im Terminal angezeigte Adresse im Browser (üblicherweise [http://localhost:5180](http://localhost:5180)).

### 3. Produktions-Build erstellen
```bash
npm run build
```
Der fertige, statische Build befindet sich im Ordner `dist/` und kann direkt auf jedem statischen Webhoster (z. B. GitHub Pages) bereitgestellt werden.

---

## 📄 Revisionsstand & Versionierung

Im Footer der Webapplikation wird die Revisionsnummer automatisch mit jedem Build und Release aktualisiert:
- **Build-Tag Format:** `v<Version>+build.<Datum>` (z. B. `v1.0.0+build.2026.10.30`)
- Gesteuert über `package.json` und die Build-Pipeline in `vite.config.ts`.

---

## 👤 Autor & Open Source

- **Projektleiter & Urheber:** **Michael Schellenberger**
- **GitHub Repository:** [https://github.com/Schello805/Risikomanagement](https://github.com/Schello805/Risikomanagement)
- **Lizenz:** **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**
  - *Freie Nutzung, Vervielfältigung und Anpassung für alle nicht-kommerziellen Zwecke unter Namensnennung.*
  - Kommerzielle Nutzung bedarf der vorherigen schriftlichen Zustimmung des Urhebers.

---

*Made with precision for industrial quality management.*
