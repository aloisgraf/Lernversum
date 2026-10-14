# Implementierungsplan

**Stand:** Plan nach Master-Prompt, wartet auf Freigabe. Jede Phase endet mit Tests,
Doku-Update und Freigabe durch Alois.

| Phase | Inhalt | Fertig, wenn |
| --- | --- | --- |
| 1 Architektur | diese Planung, Entscheidungen E-1 bis E-12 | Alois gibt frei |
| 2a Grundgerüst | Next.js, pnpm, Supabase lokal, Tests, CI | **umgesetzt** |
| 2b Grundplattform | Login, `profiles`, Rollen, Admin-Ersteinrichtung, Lehrkraft anlegen, Schüler anlegen, Gruppen | Admin legt Lehrkraft an, Lehrkraft legt Schüler an; pgTAP-Tests für fremde Schüler/Gruppen negativ; CI grün unter Linux/macOS/Windows |
| 3 Lizenzen | Lizenzpläne, Lehrkraftlizenzen, Schülerzugang, Spiellizenzen, `can_play`, Ablaufregeln | alle Lizenztests aus Abschnitt 14 grün, auch per direktem API-Aufruf |
| 4 Spiele-Framework | Registry, Manifest, `games`-Katalog, Aktivierung, `game_configs`, Schülerbibliothek, neutraler Platzhalter-Spiel | Platzhalter startet nur mit allen sechs Bedingungen; deaktiviert = gesperrt |
| 5 Statistik-Basis | `game_sessions`, `game_events`, Schnittstelle `reportEvent`, Lehrkraft-Filter | Platzhalter schreibt Ereignisse; nur eigene Lehrkraft sieht sie |
| 6 Sicherheit und Datenschutz | Rate-Limits, CSP, Audit-Log, Admin-2FA, Export/Löschung, Löschjobs, Medien-Upload | Sicherheitsreview durch separaten Agenten; Restrisiken dokumentiert |
| 7 Designsystem | Tokens, Komponenten, drei Bereiche gestaltet | Kontrast- und Bedienbarkeitsprüfung auf Phone/Tablet/Desktop |
| 8 Erstes Spiel | nach Spielbeschreibung von Alois | Abnahme durch Alois |
| 9 Erweiterung | weitere Spiele nach `GAME-MODULES.md` | |

Hosting-Prüfung (`DEPLOYMENT.md`) läuft parallel ab Phase 2 und muss vor dem ersten
Produktivbetrieb abgeschlossen sein.
