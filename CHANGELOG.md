# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.
Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/), und dieses Projekt hält sich an [Semantic Versioning](https://semver.org/lang/de/).

## [1.0.0] - 2026-10-30

### Initiales Release
- **Vollständiger Fertigungsablauf:** Vordefinierte und flexibel anpassbare Prozesskette vom Wareneingang bis zum Versand (Wareneingang, Wareneingangsprüfung, Einlagerung, Kommissionierung, Fertigung/Montage, Endprüfung/EOL, Verpackung, Versand).
- **Integrierte Prozess-FMEA (AIAG/VDA 4. Ausgabe):**
  - Risikobewertung über Risikoprioritätszahl RPZ = Bedeutung (B) × Auftreten (A) × Entdeckung (E) auf einer 1–10 Skala mit integrierten Kriterienkatalogen.
  - Dynamisches 3-Stufen-Ampelsystem (Rot: RPZ ≥ 100 oder B ≥ 9; Gelb: RPZ 50–99; Grün: RPZ < 50).
  - Kennzeichnung Besonderer Merkmale (CC = Critical Characteristic für Sicherheit, SC = Significant Characteristic für Funktion).
- **Vollständige Maßnahmenverfolgung:**
  - Erfassung von Abstellmaßnahmen mit Verantwortlichen, Fälligkeitsterminen und Bearbeitungsstatus (Offen, In Arbeit, Abgeschlossen, Verworfen).
  - Neubewertung nach Umsetzung (B2, A2, E2 ➔ RPZ Neu) mit automatischer Prozentberechnung der Risikoreduktion.
- **Integrierter Kontrollplan (Produktionslenkungsplan / PLP):**
  - Schlanke und übersichtliche Erfassung von Prüfmerkmalen, Spezifikationen, Prüfmitteln, Stichproben und Reaktionsplänen.
  - Direkte 1-Klick-Übernahme von FMEA-Vermeidungs- und Entdeckungsmaßnahmen in den Kontrollplan.
- **Interaktives Risiko-Dashboard:**
  - 10×10 Heatmap-Matrix (Bedeutung vs. Auftreten) zur visuellen Risiko-Identifikation.
  - Top 5 Prioritätsrisiken mit Sofort-Aktionsaufruf.
  - Fortschrittsanzeige für Maßnahmen.
- **Export & Datensicherung:**
  - Excel-Export (.xlsx) mit formatierten Reitern für Deckblatt, FMEA und Kontrollplan.
  - PDF-Export / druckoptimierte Ansicht im Querformat.
  - Vollständiges JSON Projekt-Backup (Export und Import) für teamübergreifenden Austausch ohne Serverzwang.
- **Open-Source Footer:**
  - Namensnennung Michael Schellenberger mit GitHub-Link & Icon.
  - Automatisch generierte Revisionsnummer (`Rev: v1.0.0+build.<Datum>`).
