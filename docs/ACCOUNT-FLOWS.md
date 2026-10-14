# Abläufe: Lehrkraft, Schüler und Eltern anlegen

**Stand:** Entwurf nach D-009, D-014 und D-015 (2026-10-14). Noch nicht umgesetzt.

Überblick: Der Admin legt die Lehrkraft an. Die Lehrkraft legt ihre Schüler an. Pro Schüler
entstehen zwei Zugangskarten, eine für das Kind und eine für die Eltern. Kind und Eltern lösen
ihre Karte einmal ein und melden sich danach mit Benutzername und eigenem Passwort an.

```
Admin ──legt an──▶ Lehrkraft ──legt an──▶ Schüler ─┬─ Karte Kind   → Aktivierung → max.mueller + Passwort
                                                    └─ Karte Eltern → Aktivierung → eltern.max.mueller + Passwort
```

## 1. Lehrkraft anlegen (durch den Admin)

1. Admin meldet sich im Adminbereich an (E-Mail, Passwort, zweiter Faktor).
2. Admin wählt „Neue Lehrkraft“ und gibt Vorname, Nachname und E-Mail ein; optional ordnet er
   eine oder mehrere Schulen zu.
3. Admin wählt den Lizenzplan (z. B. „Schule“, „Nachhilfe“, „Therapie“) und die Gültigkeit
   (von–bis). Der Plan legt fest: max. Anzahl Schüler und Klassen, erlaubte Spiele, maximale
   Dauer einer Freischaltung.
4. Das System prüft die Eingaben, legt Konto, Profil und Lehrkraftlizenz an und schreibt einen
   Eintrag ins Audit-Log.
5. Die Lehrkraft bekommt eine Einladungs-E-Mail mit einem Link (befristet gültig).
6. Über den Link setzt die Lehrkraft ihr Passwort selbst. Danach meldet sie sich mit E-Mail und
   Passwort an.

Es gibt keine öffentliche Registrierung. Läuft der Einladungslink ab, schickt der Admin einen neuen.

## 2. Schüler anlegen (durch die Lehrkraft)

1. Lehrkraft meldet sich an und legt optional eine Klasse oder Lerngruppe an (z. B. „2b“).
2. Sie wählt „Schüler hinzufügen“ und gibt Vorname und Nachname ein, einzeln oder als Liste.
3. Das System prüft serverseitig:
    - Lehrkraftlizenz gültig,
    - Schülerlimit des Plans noch nicht erreicht (auch bei gleichzeitigem Anlegen),
    - Eingaben gültig.
4. Das System legt in einem Schritt an:
    - das Schülerkonto (noch nicht aktiviert),
    - den Plattformzugang des Schülers (Gültigkeit nach Vorgabe der Lehrkraft),
    - den Elternzugang (noch nicht aktiviert),
    - je einen **Aktivierungscode** für Kind und Eltern, z. B. `K7QM-4TXR-9WPD`, gültig 30 Tage.
5. Die Lehrkraft druckt die beiden **Zugangskarten** (Code und QR-Code). Die Codes sind nur in
   diesem Moment sichtbar; gespeichert wird nur ein nicht umkehrbarer Prüfwert (Hash).
6. Die Lehrkraft gibt die Kinderkarte dem Kind und die Elternkarte verschlossen den Eltern mit.
7. In der Schülerliste sieht die Lehrkraft für jedes Kind: „Kind aktiviert ja/nein“ und
   „Eltern aktiviert ja/nein“.

Danach schaltet die Lehrkraft dem Kind einzelne Spiele frei (Spiel, Beginn, Ende).

## 3. Kind aktiviert seinen Zugang

1. Das Kind öffnet die Anmeldeseite und tippt auf „Ich habe eine Karte“, gibt den Code ein
   oder scannt den QR-Code.
2. Das System prüft: Code gültig, nicht abgelaufen, noch nicht benutzt.
3. Das Kind sieht seinen Benutzernamen groß angezeigt, z. B. **max.mueller**.
    - Umlaute werden umgeschrieben (`jürgen.öz` → `juergen.oez`).
    - Gibt es den Namen schon, wird eine Zahl angehängt (`max.mueller2`).
4. Das Kind wählt sein Passwort selbst und gibt es zur Kontrolle zweimal ein (kindgerechte
   Mindestregeln, z. B. mindestens 8 Zeichen).
5. Das Passwort wird gesetzt, der Code ist verbraucht. Das Kind ist angemeldet und sieht seine
   Spielebibliothek.

Ab jetzt meldet sich das Kind mit **Benutzername und Passwort** an.

## 4. Eltern aktivieren ihren Zugang

1. Die Eltern öffnen die Anmeldeseite, wählen „Elternzugang aktivieren“ und geben den Code
   der Elternkarte ein.
2. Das System prüft den Code wie beim Kind.
3. Die Eltern sehen ihren Benutzernamen, Vorschlag **eltern.max.mueller** (noch zu bestätigen, E-14).
4. Die Eltern wählen ihr Passwort selbst (strengere Mindestregeln als beim Kind, da sie Lerndaten sehen).
5. Danach sehen die Eltern nur lesend den Fortschritt ihres Kindes: welche Spiele freigeschaltet
   sind, wann geübt wurde und die Auswertungen der Spiele. Sie können keine Spiele starten und
   nichts ändern.

## 5. Wenn etwas schiefgeht

| Situation | Lösung |
| --- | --- |
| Karte verloren, noch nicht aktiviert | Lehrkraft erzeugt neuen Code; der alte wird ungültig |
| Code abgelaufen | Lehrkraft erzeugt neuen Code |
| Kind oder Eltern haben das Passwort vergessen | Lehrkraft erzeugt neuen Aktivierungscode; Benutzername bleibt, Passwort wird neu gewählt, alle offenen Sitzungen enden |
| Verdacht, dass jemand Fremdes den Elternzugang hat | Lehrkraft sperrt den Elternzugang und erzeugt einen neuen Code |
| Kind verlässt die Klasse | Lehrkraft deaktiviert das Kind; Daten werden nach den Fristen gelöscht |
| Lehrkraftlizenz läuft ab | Kinder können nicht mehr spielen; Lehrkraft und Eltern sehen die Daten 90 Tage lesend, dann Löschung |

Für Kinder und Eltern gibt es keine Passwort-Zurücksetzung per E-Mail, weil im System keine
E-Mail-Adressen von ihnen gespeichert werden.

## Offene Punkte

- E-14: Benutzername der Eltern.
- Gültigkeitsdauer der Codes (Vorschlag 30 Tage) und Passwortregeln für Kinder.
- Ob die Lehrkraft Schülerlisten per Datei (CSV) importieren können soll.
