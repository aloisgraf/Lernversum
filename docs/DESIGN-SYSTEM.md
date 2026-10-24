# Designsystem

**Stand:** 2026-10-24. Designpaket von Alois übernommen, Schritt 1 und 2 umgesetzt (D-022):
Farben, Schrift, Wortmarke, Startseite, Login, Test-Admin, Kinderbereich als Weltkarte.
Schritt 3 (Illustrationen) und 4 (gemeinsame Komponenten für Spiele) offen.

## Drei Erscheinungsbilder, eine Basis

| Bereich | Charakter | Umsetzung |
| --- | --- | --- |
| Admin | ruhig, dicht, tabellenlastig | helle Fläche, Navy-Seitenleiste, weiße Karten |
| Lehrkraft | klar und freundlich, Übersichten, Diagramme, Formulare | wie Admin (noch nicht gebaut) |
| Schüler | groß, bildhaft, wenig Text, kindgerecht | Weltraum-Hintergrund, Themen als Planeten |
| Spiele | eigenes Erscheinungsbild je Spiel, auf gemeinsamer Basis | eigene Tokens je Spiel (z. B. Lexend) |

Start- und Login-Seite nutzen den Weltraum-Hintergrund mit einer hellen Karte für Formulare.

## Farben (`src/app/globals.css`, `:root`)

| Token | Wert | Verwendung |
| --- | --- | --- |
| `--lv-space` | `#081A43` | Hintergrund Kinderbereich, Start, Login |
| `--lv-navy` | `#173D83` | Überschriften auf hell, Admin-Seitenleiste, Text auf Gelb |
| `--lv-violet` | `#8050E8` | Akzent, Planeten |
| `--lv-blue` | `#2799F5` | nur Deko und Flächen, **nie** mit weißer Schrift (Kontrast 3,0) |
| `--lv-action` | `#1C6FC9` | Hauptknöpfe, Links, aktiver Menüpunkt (weiß darauf 5,0) |
| `--lv-turquoise` | `#38C9CE` | Akzent, Planeten |
| `--lv-yellow` | `#FFD84D` | Belohnung, Spiel-Start-Knöpfe, immer mit Navy-Schrift |
| `--lv-coral` | `#FF777E` | Akzent; nicht für Fehlertext |
| `--lv-white` | `#F7FAFF` | helle Seitenfläche |
| `--lv-text` | `#17305C` | Fließtext auf hell |
| `--lv-muted` | `#60708C` | Nebentext auf hell |
| `--lv-border` | `#D8E5F7` | Rahmen |
| `--lv-hint` | `#9A3412` | Hinweis- und Fehlertext auf hell (6,98) |
| `--lv-on-dark-muted` | `#B9C6E0` | Nebentext auf Weltraum (9,86) |

Gemessene Kontraste (WCAG 2.2): Navy auf Gelb, Text auf Weiß, Weiß auf Navy und Weiß auf
Weltraum liegen deutlich über 4,5. `--lv-action` wurde ergänzt, weil Weiß auf dem Paket-Blau
`#2799F5` nur 3,0 erreicht. Die alten Namen `--color-*` zeigen auf die neuen Tokens.

Weitere Tokens: `--lv-radius-card` 18 px, `--lv-radius-control` 12 px, `--lv-shadow-card`.

## Schrift

- **Nunito** (SIL Open Font License) für die ganze Plattform, Gewichte 400/600/700/800, über
  `next/font/google`: wird beim Build geladen und von der eigenen Domain ausgeliefert, kein Abruf
  bei Google zur Laufzeit (Datenschutz).
- Spiele behalten ihre eigene Schrift (Wald-Wesen: Lexend).
- Die handgezeichnete Logo-Schrift aus dem Paket wird erst verwendet, wenn Herkunft und Lizenz
  geklärt sind.

## Wortmarke (`src/ui/Wortmarke.tsx`)

Inline-SVG nach `Lernversum_Wortmarke.svg` aus dem Paket, ohne Hintergrundfläche, mit
`aria-label="Lernversum"`. Schrift Nunito 800 statt Trebuchet MS (nicht frei mitlieferbar);
Stern und Planeten deshalb näher an den Schriftzug gerückt. Varianten: hell/dunkel
(`onDark`), mit oder ohne Claim „Entdecken. Lernen. Wachsen.“ (`showClaim`).

## Komponenten (CSS-Klassen in `globals.css`)

- `.lv-card`: weiße Karte mit Rundung und Schatten.
- `.lv-btn` (mindestens 44 px hoch, Pillenform) mit `.lv-btn-primary` (Aktionsblau),
  `.lv-btn-reward` (Gelb, Navy-Schrift), `.lv-btn-quiet` (weiß mit Rahmen).
- `.lv-input`, `.lv-link`, sichtbarer Fokusrahmen für Tastaturbedienung.
- `.lv-space`: Weltraum-Hintergrund aus CSS-Verläufen, ohne Bilddateien.
- `src/ui/Planet.tsx`: Platzhalter-Planet als SVG, gesperrt mit Schloss; wird ersetzt, sobald
  Illustrationen mit geklärter Lizenz vorliegen.

## Regeln

- Kontrast nach WCAG 2.2 AA; Schülerbereich Schrift ≥ 20 px, Tippflächen ≥ 48 px.
- Schrift selbst ausgeliefert, keine Google-Fonts-Abrufe zur Laufzeit (Datenschutz).
- Bewegung respektiert `prefers-reduced-motion`.
- Keine manipulativen Belohnungen (keine Lootboxen, Streak-Druck, Countdown-Druck, Werbung).
- Responsiv für Smartphone, Tablet und Desktop; Tablet quer ist der Hauptfall für Spiele.
- Grafiken (auch KI-generiert) als Projektdateien mit Herkunfts- und Lizenzvermerk in
  `assets/LICENSES.md`; Designänderungen berühren nie Logik oder Lizenzprüfungen.
- Gesperrte Planeten sind nur Anzeige und keine Sicherheitsgrenze. Im Prototyp sind die Spiele
  ohnehin offen; ab Phase 3 prüft der Server, ob ein Kind ein Spiel spielen darf.
