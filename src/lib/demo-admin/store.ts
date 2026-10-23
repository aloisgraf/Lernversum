import { createHash, randomBytes, randomInt } from "node:crypto";

// Test-Admin als Prototyp (D-021, vorläufig): Daten nur im Speicher des Servers, nach jedem
// Neustart weg. Bildet die Abläufe aus ACCOUNT-FLOWS.md und D-018 nach, damit Alois sie
// ausprobieren kann. Die echte Umsetzung kommt mit Phase 2b/3 in Supabase mit RLS.

export type HolderType = "lehrkraft" | "therapeut" | "eltern";

export const PACKAGES = [
  { id: "eltern-1", name: "Elternlizenz", maxChildren: 1, holderType: "eltern" },
  { id: "therapie-6", name: "Lerntherapie 6", maxChildren: 6, holderType: "therapeut" },
  { id: "therapie-12", name: "Lerntherapie 12", maxChildren: 12, holderType: "therapeut" },
  { id: "therapie-20", name: "Lerntherapie 20", maxChildren: 20, holderType: "therapeut" },
  { id: "schule-20", name: "Schule / Lehrperson", maxChildren: 20, holderType: "lehrkraft" },
] as const satisfies readonly {
  id: string;
  name: string;
  maxChildren: number;
  holderType: HolderType;
}[];

export type PackageId = (typeof PACKAGES)[number]["id"];
export const DURATIONS_MONTHS = [3, 6, 12] as const;
export type DurationMonths = (typeof DURATIONS_MONTHS)[number];

export type License = {
  packageId: PackageId;
  months: DurationMonths;
  validFrom: string;
  validUntil: string;
};

export type Holder = {
  id: string;
  name: string;
  email: string;
  type: HolderType;
  license: License | null;
};

export type Child = {
  id: string;
  holderId: string;
  firstName: string;
  lastName: string;
  username: string;
  codeHash: string;
  activated: boolean;
};

export type ParentAccess = { id: string; childId: string; username: string; codeHash: string };

export type Grant = { id: string; childId: string; gameSlug: string; from: string; until: string };

export type Topic = { id: string; name: string };

export class DemoAdminError extends Error {}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MAX_ITEMS = 500;

// Einmal-Code wie in ARCHITECTURE.md §4: ohne verwechselbare Zeichen, z. B. K7QM-4TXR-9WPD.
export function generateCode(): string {
  const chars = Array.from({ length: 12 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]);
  return [chars.slice(0, 4), chars.slice(4, 8), chars.slice(8)].map((g) => g.join("")).join("-");
}

export function hashCode(code: string): string {
  return createHash("sha256").update(code, "utf8").digest("hex");
}

// Benutzername nach D-015: klein, Umlaute umgeschrieben, nur a–z.
export function usernamePart(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z]/g, "");
}

export function addMonths(isoDate: string, months: number): string {
  const [year, month, day] = isoDate.split("-").map(Number) as [number, number, number];
  const date = new Date(Date.UTC(year, month - 1 + months, day));
  return date.toISOString().slice(0, 10);
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function newId(): string {
  return randomBytes(8).toString("hex");
}

export function packageById(id: string) {
  return PACKAGES.find((p) => p.id === id);
}

export function licenseActive(license: License | null, today: string): boolean {
  return license !== null && license.validFrom <= today && today < license.validUntil;
}

export class DemoAdminStore {
  readonly holders = new Map<string, Holder>();
  readonly children = new Map<string, Child>();
  readonly parents = new Map<string, ParentAccess>();
  readonly grants = new Map<string, Grant>();
  readonly topics = new Map<string, Topic>();
  readonly gameTopics = new Map<string, string[]>();

  constructor(private readonly knownGames: readonly string[]) {}

  private guardSize(map: Map<string, unknown>) {
    if (map.size >= MAX_ITEMS) throw new DemoAdminError("Zu viele Einträge für den Prototyp.");
  }

  private usernameTaken(username: string): boolean {
    for (const child of this.children.values()) if (child.username === username) return true;
    for (const parent of this.parents.values()) if (parent.username === username) return true;
    return false;
  }

  private uniqueUsername(base: string): string {
    if (!this.usernameTaken(base)) return base;
    for (let n = 2; ; n += 1) {
      if (!this.usernameTaken(`${base}${n}`)) return `${base}${n}`;
    }
  }

  createHolder(input: { name: string; email: string; type: HolderType }): Holder {
    this.guardSize(this.holders);
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    if (name.length < 2 || name.length > 100) throw new DemoAdminError("Name ungültig.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new DemoAdminError("E-Mail ungültig.");
    for (const holder of this.holders.values()) {
      if (holder.email === email) throw new DemoAdminError("E-Mail ist schon vergeben.");
    }
    const holder: Holder = { id: newId(), name, email, type: input.type, license: null };
    this.holders.set(holder.id, holder);
    return holder;
  }

  assignLicense(holderId: string, packageId: string, months: number, validFrom: string): License {
    const holder = this.requireHolder(holderId);
    const pkg = packageById(packageId);
    if (!pkg) throw new DemoAdminError("Unbekanntes Paket.");
    if (pkg.holderType !== holder.type) {
      throw new DemoAdminError("Das Paket passt nicht zur Art des Lizenznehmers.");
    }
    if (!DURATIONS_MONTHS.includes(months as DurationMonths)) {
      throw new DemoAdminError("Laufzeit muss 3, 6 oder 12 Monate sein.");
    }
    if (!isIsoDate(validFrom)) throw new DemoAdminError("Startdatum ungültig.");
    const count = this.childrenOf(holderId).length;
    if (count > pkg.maxChildren) {
      throw new DemoAdminError(
        `Es gibt schon ${count} Kinder, das Paket erlaubt ${pkg.maxChildren}.`,
      );
    }
    const license: License = {
      packageId: pkg.id,
      months: months as DurationMonths,
      validFrom,
      validUntil: addMonths(validFrom, months),
    };
    holder.license = license;
    return license;
  }

  addChild(
    holderId: string,
    firstName: string,
    lastName: string,
    today: string,
  ): { child: Child; childCode: string; parent: ParentAccess | null; parentCode: string | null } {
    this.guardSize(this.children);
    const holder = this.requireHolder(holderId);
    if (!licenseActive(holder.license, today)) {
      throw new DemoAdminError("Keine gültige Lizenz: zuerst eine Lizenz zuweisen.");
    }
    const pkg = packageById(holder.license!.packageId)!;
    if (this.childrenOf(holderId).length >= pkg.maxChildren) {
      throw new DemoAdminError(`Kinderlimit erreicht (${pkg.maxChildren} laut Paket).`);
    }
    const first = usernamePart(firstName);
    const last = usernamePart(lastName);
    if (!first || !last || firstName.trim().length > 50 || lastName.trim().length > 50) {
      throw new DemoAdminError("Vor- und Nachname ungültig.");
    }
    const childCode = generateCode();
    const child: Child = {
      id: newId(),
      holderId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: this.uniqueUsername(`${first}.${last}`),
      codeHash: hashCode(childCode),
      activated: false,
    };
    this.children.set(child.id, child);

    // Bei der Elternlizenz ist der Lizenznehmer selbst der Elternteil (ACCOUNT-FLOWS 2a).
    if (holder.type === "eltern") return { child, childCode, parent: null, parentCode: null };

    const parentCode = generateCode();
    const parent: ParentAccess = {
      id: newId(),
      childId: child.id,
      username: this.uniqueUsername(`eltern.${first}.${last}`),
      codeHash: hashCode(parentCode),
    };
    this.parents.set(parent.id, parent);
    return { child, childCode, parent, parentCode };
  }

  removeChild(childId: string): void {
    if (!this.children.delete(childId)) throw new DemoAdminError("Kind nicht gefunden.");
    for (const [id, parent] of this.parents)
      if (parent.childId === childId) this.parents.delete(id);
    for (const [id, grant] of this.grants) if (grant.childId === childId) this.grants.delete(id);
  }

  grantGame(childId: string, gameSlug: string, from: string, until: string): Grant {
    this.guardSize(this.grants);
    const child = this.children.get(childId);
    if (!child) throw new DemoAdminError("Kind nicht gefunden.");
    if (!this.knownGames.includes(gameSlug)) throw new DemoAdminError("Unbekanntes Spiel.");
    if (!isIsoDate(from) || !isIsoDate(until) || until <= from) {
      throw new DemoAdminError("Zeitraum ungültig: Ende muss nach dem Beginn liegen.");
    }
    const license = this.requireHolder(child.holderId).license;
    if (!license) throw new DemoAdminError("Der Lizenznehmer hat keine Lizenz.");
    if (from < license.validFrom || until > license.validUntil) {
      throw new DemoAdminError("Die Freischaltung muss innerhalb der Lizenzlaufzeit liegen.");
    }
    for (const grant of this.grants.values()) {
      if (grant.childId === childId && grant.gameSlug === gameSlug) {
        throw new DemoAdminError("Das Spiel ist für dieses Kind schon freigeschaltet.");
      }
    }
    const grant: Grant = { id: newId(), childId, gameSlug, from, until };
    this.grants.set(grant.id, grant);
    return grant;
  }

  revokeGrant(grantId: string): void {
    if (!this.grants.delete(grantId)) throw new DemoAdminError("Freischaltung nicht gefunden.");
  }

  createTopic(name: string): Topic {
    this.guardSize(this.topics);
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 80) throw new DemoAdminError("Thema ungültig.");
    for (const topic of this.topics.values()) {
      if (topic.name.toLowerCase() === trimmed.toLowerCase()) {
        throw new DemoAdminError("Das Thema gibt es schon.");
      }
    }
    const topic = { id: newId(), name: trimmed };
    this.topics.set(topic.id, topic);
    return topic;
  }

  setGameTopics(gameSlug: string, topicIds: string[]): void {
    if (!this.knownGames.includes(gameSlug)) throw new DemoAdminError("Unbekanntes Spiel.");
    for (const id of topicIds) {
      if (!this.topics.has(id)) throw new DemoAdminError("Unbekanntes Thema.");
    }
    this.gameTopics.set(gameSlug, [...new Set(topicIds)]);
  }

  // Ansicht eines Kindes: welche Spiele es heute spielen darf (vereinfachtes can_play).
  playableGames(childId: string, today: string): string[] {
    const child = this.children.get(childId);
    if (!child) return [];
    if (!licenseActive(this.requireHolder(child.holderId).license, today)) return [];
    return [...this.grants.values()]
      .filter((g) => g.childId === childId && g.from <= today && today < g.until)
      .map((g) => g.gameSlug);
  }

  childrenOf(holderId: string): Child[] {
    return [...this.children.values()].filter((c) => c.holderId === holderId);
  }

  parentOf(childId: string): ParentAccess | undefined {
    return [...this.parents.values()].find((p) => p.childId === childId);
  }

  grantsOf(childId: string): Grant[] {
    return [...this.grants.values()].filter((g) => g.childId === childId);
  }

  requireHolder(holderId: string): Holder {
    const holder = this.holders.get(holderId);
    if (!holder) throw new DemoAdminError("Lizenznehmer nicht gefunden.");
    return holder;
  }
}

// Beispieldaten, frei erfunden, damit der Prototyp nicht leer startet.
export function seedStore(store: DemoAdminStore, today: string, gameSlug: string | undefined) {
  const endungen = store.createTopic("Rechtschreibung: Endungen -el, -en, -er");
  store.createTopic("Groß- und Kleinschreibung");
  store.createTopic("Silben");
  if (gameSlug) store.setGameTopics(gameSlug, [endungen.id]);
  const holder = store.createHolder({
    name: "Frau Beispiel (erfunden)",
    email: "lehrkraft@example.org",
    type: "lehrkraft",
  });
  store.assignLicense(holder.id, "schule-20", 12, today);
  const { child } = store.addChild(holder.id, "Mia", "Muster", today);
  if (gameSlug) store.grantGame(child.id, gameSlug, today, addMonths(today, 3));
}
