// Kinderprofil im Prototyp: Spitzname und Avatar. Nur im Speicher, je Benutzername (D-023).
// Avatare kommen aus einer festen Auswahl gezeichneter Figuren; Hochladen gibt es nicht.

export const AVATAR_IDS = [
  "kind-1",
  "kind-2",
  "kind-3",
  "kind-4",
  "kind-5",
  "kind-6",
  "alien",
  "roboter",
] as const;

export type AvatarId = (typeof AVATAR_IDS)[number];

export const STANDARD_AVATAR: AvatarId = "kind-1";
export const SPITZNAME_MAX = 20;
const MAX_PROFILES = 500;

export type Profil = { spitzname: string | null; avatar: AvatarId };

export class ProfilFehler extends Error {}

export function istAvatarId(value: string): value is AvatarId {
  return (AVATAR_IDS as readonly string[]).includes(value);
}

// Spitzname: leer heißt „kein Spitzname“. Sonst 2 bis 20 Zeichen, nur Buchstaben, Leerzeichen,
// Bindestrich und Apostroph, damit keine Links, Zahlen (Telefon, Alter) oder Zeichen für
// Schadcode hineinpassen.
export function pruefeSpitzname(roh: string): string | null {
  const wert = roh.normalize("NFC").trim().replace(/\s+/g, " ");
  if (wert === "") return null;
  if (wert.length < 2 || wert.length > SPITZNAME_MAX) {
    throw new ProfilFehler(`Der Spitzname braucht 2 bis ${SPITZNAME_MAX} Zeichen.`);
  }
  if (!/^\p{L}[\p{L}\p{M} '’-]*$/u.test(wert)) {
    throw new ProfilFehler("Im Spitznamen sind nur Buchstaben, Leerzeichen und - erlaubt.");
  }
  return wert;
}

export class ProfilSpeicher {
  private readonly profile = new Map<string, Profil>();

  get(username: string): Profil {
    return this.profile.get(username) ?? { spitzname: null, avatar: STANDARD_AVATAR };
  }

  set(username: string, eingabe: { spitzname: string; avatar: string }): Profil {
    if (!istAvatarId(eingabe.avatar)) throw new ProfilFehler("Diesen Avatar gibt es nicht.");
    const spitzname = pruefeSpitzname(eingabe.spitzname);
    if (!this.profile.has(username) && this.profile.size >= MAX_PROFILES) {
      throw new ProfilFehler("Der Speicher des Prototyps ist voll.");
    }
    const profil: Profil = { spitzname, avatar: eingabe.avatar };
    this.profile.set(username, profil);
    return profil;
  }
}
