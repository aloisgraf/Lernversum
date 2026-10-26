import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// Passwörter für Konten, die im Test-Admin angelegt werden (Plan „Admin-Aufbau“, Punkt 2):
// Regeln nach NIST SP 800-63B und BSI. Mindestlänge statt Zeichenklassen-Zwang, Abgleich mit
// häufigen Passwörtern, kein regelmäßiger Zwangswechsel. Gespeichert wird nur ein scrypt-Hash.

export const MIN_LAENGE_KIND = 8;
export const MIN_LAENGE_ERWACHSEN = 12;
export const MAX_LAENGE = 128;

const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 } as const;

// Kleine Auswahl häufiger Passwörter (international und deutschsprachig). Ab Phase 2b prüft
// Supabase zusätzlich gegen bekannte Datenlecks.
const HAEUFIG = new Set([
  "12345678",
  "123456789",
  "1234567890",
  "87654321",
  "11111111",
  "00000000",
  "12341234",
  "password",
  "password1",
  "passwort",
  "passwort1",
  "qwertzui",
  "qwertyui",
  "qwertz123",
  "qwerty123",
  "asdfghjk",
  "iloveyou",
  "sunshine",
  "princess",
  "football",
  "fussball",
  "baseball",
  "dragon12",
  "monkey12",
  "letmein1",
  "welcome1",
  "willkommen",
  "hallo123",
  "hallohallo",
  "schatz123",
  "sommer2024",
  "sommer2025",
  "sommer2026",
  "winter2025",
  "lernversum",
  "lernversum1",
  "schule123",
  "geheim123",
  "abc12345",
  "abcdefgh",
  "aaaaaaaa",
]);

export type PasswortPruefung = { ok: true } | { ok: false; grund: string };

export function pruefePasswort(
  passwort: string,
  opts: { benutzername: string; minLaenge: number },
): PasswortPruefung {
  const laenge = [...passwort].length;
  if (laenge < opts.minLaenge) {
    return { ok: false, grund: `Das Passwort braucht mindestens ${opts.minLaenge} Zeichen.` };
  }
  if (laenge > MAX_LAENGE) {
    return { ok: false, grund: `Das Passwort darf höchstens ${MAX_LAENGE} Zeichen haben.` };
  }
  const klein = passwort.toLowerCase();
  if (HAEUFIG.has(klein) || /^(.)\1+$/.test(passwort)) {
    return { ok: false, grund: "Dieses Passwort ist zu leicht zu erraten." };
  }
  if (klein.includes(opts.benutzername.toLowerCase())) {
    return { ok: false, grund: "Das Passwort darf den Benutzernamen nicht enthalten." };
  }
  return { ok: true };
}

export function hashPasswort(passwort: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(passwort.normalize("NFC"), salt, SCRYPT.keylen, SCRYPT);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export function pruefeHash(passwort: string, gespeichert: string): boolean {
  const [art, saltB64, hashB64] = gespeichert.split("$");
  if (art !== "scrypt" || !saltB64 || !hashB64) return false;
  const erwartet = Buffer.from(hashB64, "base64");
  if (erwartet.length !== SCRYPT.keylen) return false;
  const hash = scryptSync(
    passwort.normalize("NFC"),
    Buffer.from(saltB64, "base64"),
    erwartet.length,
    SCRYPT,
  );
  return timingSafeEqual(hash, erwartet);
}

// Für unbekannte Benutzernamen: gleich viel Rechenzeit, damit die Antwortzeit nichts verrät.
const BLIND_HASH = hashPasswort(randomBytes(16).toString("hex"));
export function blindPruefen(passwort: string): false {
  pruefeHash(passwort, BLIND_HASH);
  return false;
}
