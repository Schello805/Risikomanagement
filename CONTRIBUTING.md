# Mitwirken am FMEA & Kontrollplan Manager

Vielen Dank für dein Interesse, zu diesem Open-Source-Projekt beizutragen! 
Das Ziel dieser Software ist es, Qualitäts- und Fertigungsingenieuren ein intuitives, schnelles und modernes Werkzeug für Risikomanagement und Produktionslenkung an die Hand zu geben.

## Lizenz & Nutzungsbedingungen
Dieses Projekt steht unter der **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** Lizenz.
- Freie Nutzung für private, akademische und nicht-kommerzielle Zwecke.
- Bei Beiträgen erklärst du dich damit einverstanden, dass dein Code unter dieser Lizenz veröffentlicht wird.
- Urheber & Projektleiter: **Michael Schellenberger**.

## Entwicklungsumgebung einrichten

1. Repository klonen:
   ```bash
   git clone <REPO-URL>
   cd Risikomanagement
   ```

2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```

3. Lokalen Entwicklungsserver starten:
   ```bash
   npm run dev
   ```
   Die Webapplikation öffnet sich unter `http://localhost:5180`.

4. Type-Check und Build testen:
   ```bash
   npm run build
   ```

## Qualitätsstandards für Beiträge
- **TypeScript:** Keine `any`-Typen; alle neuen Datenstrukturen in `src/types/index.ts` sauber definieren.
- **Usability first:** Die Oberfläche richtet sich an Praktiker in der Produktion. Klare deutsche Fachbegriffe (VDA/AIAG), verständliche Hilfetexte und schnelle Bedienbarkeit sind essenziell.
- **Local-First & Datenschutz:** Keine ungefragten externen Netzwerk-Tracking-Dienste einbinden; die Daten gehören dem Anwender lokal im Browser.

## Pull Requests
1. Erstelle einen Feature-Branch (`git checkout -b feature/mein-neues-feature`).
2. Teste den Build (`npm run build`).
3. Committe deine Änderungen mit einer aussagekräftigen Nachricht.
4. Eröffne einen Pull Request auf GitHub.
