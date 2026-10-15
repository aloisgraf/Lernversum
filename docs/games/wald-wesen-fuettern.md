# Wald-Wesen füttern

**Stand:** Testversion 0.1.0 (2026-10-15), ohne Anmeldung, ohne Speicherung. Grundlage ist das
Spielkonzept „Lernversum Zauberwald: Spiele zu den Endungen -el, -en, -er“ (dort als erster
Prototyp empfohlen).

## Lernziel und Mechanik

Oberfläche nach Alois' Entwurf „Wald-Wesen füttern“ (Design-Canvas, Zauberwald-Szene mit
gezeichneten Wesen, Schrift Lexend). Das Kind ordnet Bilder (Stufe 3: geschriebene Wörter) den
Wald-Wesen mit der passenden Endung zu:
Igel = -el (blau), Eule = -en (grün), Fuchs = -er (rot). Die Schlafhöhle nimmt Wörter ohne diese
Endungen auf. Zuordnen durch Ziehen oder durch Antippen des Wald-Wesens (barrierearme Alternative,
auch per Tastatur). Nach der richtigen Wahl wird das Wort mit farbiger Endung gezeigt, dazu ein
Lob („Mmh, lecker! Der Igel mag die Gabel.“); das Kind geht selbst mit „Weiter“ zum nächsten Wort.

Spielprinzipien aus dem Konzept, umgesetzt:

- Es erscheinen nur richtig geschriebene Wörter; Endungen werden nie falsch zusammengesetzt.
- Kein Fehlerdruck: falsche Wahl lässt das Bild sanft zurückwackeln, kein Ton, kein Abzug, keine Zeit.
- Kurze Runden (8 bis 9 Aufgaben), Sterne nur für Geschafftes, am Ende alle Wörter noch einmal.

## Stufen (Standardkonfiguration)

| Stufe | Wald-Wesen | Schlafhöhle | Anzeige | Aufgaben |
| --- | --- | --- | --- | --- |
| 1 | Igel, Fuchs | nein | Bild | 8 |
| 2 | Igel, Eule, Fuchs | ja | Bild | 9 |
| 3 | Igel, Eule, Fuchs | ja | Wort | 9 |

## Aufbau

| Teil | Ort |
| --- | --- |
| Manifest | `src/games/wald-wesen-fuettern/manifest.ts` |
| Konfiguration (Zod, Schemaversion 1) | `config/schema.ts`, Standardwerte `config/default.ts` |
| Logik (rein, ohne UI) | `logic/runde.ts` |
| Oberfläche | `player/WaldWesenSpiel.tsx`, `player/szene.tsx` (Szene, Wesen), `player/spiel.module.css`, `player/vorlesen.ts` |
| Medien | `media/bilder.tsx` (Zeichnungen Gabel, Eimer, Besen, Ball aus dem Entwurf) |
| Tests | `tests/*.test.ts` (Vitest), `tests/e2e/wald-wesen-fuettern.spec.ts` (Playwright) |
| Seiten | `src/app/spiele/page.tsx`, `src/app/spiele/wald-wesen-fuettern/page.tsx` |

Die Konfiguration wird auf dem Server geprüft und als Snapshot an das Spiel übergeben. Das Schema
prüft u. a.: Wort endet wirklich auf die angegebene Endung, Gegenbeispiele enden nicht auf
-el/-en/-er, nur Buchstaben im Wort, keine Dubletten, genug Wörter je Wald-Wesen und Stufe.

Noch nicht vorhanden (kommt mit der Plattform): Adminmaske (`admin/`), Statistik und Ereignisse
(`stats/`), Tonaufnahmen, Datenbankschema `game_wald_wesen_fuettern`.

## Datenschutz und Sicherheit in der Testversion

- Keine Anmeldung, keine Benutzerdaten, keine Ergebnisse gespeichert (weder Server noch Browser-
  Speicher, durch E2E-Test geprüft), keine Netzwerkaufrufe des Spiels.
- Schrift Lexend über `next/font/google`: wird beim Build geladen und von der eigenen Domain
  ausgeliefert; der Browser ruft zur Laufzeit nichts bei Google ab. Der Build braucht dafür
  Zugriff auf Google Fonts.
- Vorlesen (Übergang bis zu den Aufnahmen): Browser-Sprachausgabe, ausschließlich mit Stimmen, die
  auf dem Gerät laufen (`localService`). Online-Stimmen würden den Text an Dritte senden und sind
  ausgeschlossen. Ohne lokale deutsche Stimme erscheint kein Lautsprecher-Knopf.
- Die Seiten `/spiele` und `/spiele/wald-wesen-fuettern` sind bewusst öffentlich. Sobald es Konten
  gibt, muss der Zugang über die Plattform (`can_play`) laufen; die öffentliche Route ist dann zu
  entfernen oder als ausdrückliche Demo zu entscheiden.

## Offene Punkte

- Wortliste aus den Basisgraphemen (die jetzigen Wörter sind Platzhalter).
- Bilder: Nur Gabel, Eimer, Besen und Ball sind gezeichnet; die übrigen Wörter zeigen vorerst
  Emojis, deren Aussehen vom Gerät abhängt.
- Sprecherstimme: Das Konzept sieht aufgenommene Wörter vor; bis dahin nur lokale Gerätestimme.
- Adaptive Wiederholung unsicherer Wörter braucht gespeicherte Ergebnisse und kommt mit der Statistik.
