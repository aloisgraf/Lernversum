# Designsystem

**Stand:** Konzept Phase 1, noch keine Komponenten.

## Drei Erscheinungsbilder, eine Basis

| Bereich | Charakter |
| --- | --- |
| Admin | ruhig, dicht, tabellenlastig |
| Lehrkraft | klar und freundlich, Übersichten, Diagramme, Formulare |
| Schüler | groß, bildhaft, wenig Text, kindgerecht |
| Spiele | eigenes Erscheinungsbild je Spiel, auf gemeinsamer Basis |

## Basis (`src/ui/`)

- **Design-Tokens** als CSS-Variablen: Farben, Abstände, Radien, Schatten, Schriftgrößen,
  Bewegung. Tailwind liest die Tokens. Spiele überschreiben nur ihre Theme-Tokens.
- **Komponenten:** Button, Eingabefelder, Auswahl, Dialog, Tabelle, Karte, Hinweis, Tabs,
  Diagramm-Rahmen, Leerzustände; auf Radix-Primitives für Tastatur- und Screenreader-Support.
- **Schüler-Komponenten:** große Kacheln, Spielkarte mit Status (frei, gesperrt, abgelaufen),
  Zurück-Taste, Ton-Schalter, freundliche Hinweise.
- **Gemeinsame Spielelemente:** Rahmen mit Zurück zur Bibliothek, Pause, Ton; Rückmeldung
  richtig/falsch als wiederverwendbares Muster (sanft, ohne Strafgeräusch).

## Regeln

- Kontrast nach WCAG 2.2 AA; Schülerbereich Schrift ≥ 20 px, Tippflächen ≥ 48 px.
- Schrift mit gut unterscheidbaren Buchstaben (z. B. Andika oder Atkinson Hyperlegible),
  selbst gehostet, keine Google-Fonts-Abrufe zur Laufzeit (Datenschutz).
- Bewegung respektiert `prefers-reduced-motion`.
- Keine manipulativen Belohnungen (keine Lootboxen, Streak-Druck, Countdown-Druck, Werbung).
- Responsiv für Smartphone, Tablet und Desktop; Tablet quer ist der Hauptfall für Spiele.
- Grafiken (auch KI-generiert) als Projektdateien mit Herkunfts- und Lizenzvermerk in
  `assets/LICENSES.md`; Designänderungen berühren nie Logik oder Lizenzprüfungen.
