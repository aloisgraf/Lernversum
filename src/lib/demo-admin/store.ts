import { randomBytes } from "node:crypto";
import {
  MIN_LAENGE_KIND,
  blindPruefen,
  hashPasswort,
  pruefeHash,
  pruefePasswort,
} from "@/lib/demo-auth/password";

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

export const STUFEN = ["einfach", "mittel", "schwer"] as const;
export type Stufe = (typeof STUFEN)[number];

// Kind mit vom Admin frei gewähltem Benutzernamen und Erstpasswort (Plan „Admin-Aufbau“).
// Das Testkonto `testuser` meldet sich über den Demo-Login an und hat darum keinen Hash.
export type Child = {
  id: string;
  holderId: string;
  username: string;
  passwordHash: string | null;
  mustChangePassword: boolean;
  testkonto: boolean;
  createdAt: string;
};

export type Category = { id: string; name: string };

// Ein Spiel steht in einer Stufe einer Kategorie; dasselbe Spiel darf mehrfach vorkommen.
export type Placement = { id: string; categoryId: string; stufe: Stufe; gameSlug: string };

export type PackageItem =
  | { art: "stufe"; categoryId: string; stufe: Stufe }
  | { art: "spiel"; categoryId: string; gameSlug: string };

// Zusammenfassung von Spielrunden, die nach 12 Monaten gelöscht wurden (D-011).
export type Archiv = {
  runden: number;
  aufgaben: number;
  fehler: number;
  erste: string;
  letzte: string;
};

export type LearningPackage = {
  id: string;
  childId: string;
  name: string;
  createdAt: string;
  // letzter Spieltag (einschließlich); null = bis Lizenzende
  validUntil: string | null;
  endedAt: string | null;
  items: PackageItem[];
  archiv: Archiv | null;
};

export type GameRound = {
  id: string;
  childId: string;
  packageId: string;
  gameSlug: string;
  startedAt: string;
  durationSec: number;
  aufgaben: number;
  fehler: number;
};

export type PackageStatus = "läuft" | "abgelaufen" | "beendet";

export class DemoAdminError extends Error {}

const MAX_ITEMS = 500;
const AUFBEWAHRUNG_MONATE = 12;

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

function isoDay(now: Date): string {
  return now.toISOString().slice(0, 10);
}

// Admin wählt den Benutzernamen frei: klein, 3–30 Zeichen, Buchstaben a–z, Ziffern, Punkt,
// Bindestrich, Unterstrich; beginnt mit einem Buchstaben. Ein Pseudonym ist erwünscht.
export function pruefeBenutzername(roh: string): string {
  const name = roh.trim().toLowerCase();
  if (!/^[a-z][a-z0-9._-]{2,29}$/.test(name)) {
    throw new DemoAdminError(
      "Benutzername: 3 bis 30 Zeichen, nur a–z, Ziffern, Punkt, - und _, Beginn mit Buchstabe.",
    );
  }
  return name;
}

// Für das Kind: Sterne statt Zahlen, ohne Vergleich mit anderen (Plan, Punkt 10).
export function sterne(aufgaben: number, fehler: number): 1 | 2 | 3 {
  if (fehler === 0) return 3;
  return fehler <= aufgaben / 3 ? 2 : 1;
}

const RESERVIERT = new Set(["admin", "root", "system", "lernversum"]);

export class DemoAdminStore {
  readonly holders = new Map<string, Holder>();
  readonly children = new Map<string, Child>();
  readonly categories = new Map<string, Category>();
  readonly placements = new Map<string, Placement>();
  readonly packages = new Map<string, LearningPackage>();
  readonly rounds = new Map<string, GameRound>();

  constructor(private readonly knownGames: readonly string[]) {}

  private guardSize(map: Map<string, unknown>, max = MAX_ITEMS) {
    if (map.size >= max) throw new DemoAdminError("Zu viele Einträge für den Prototyp.");
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

  private pruefeNeuesKind(holderId: string, username: string, now: Date): string {
    this.guardSize(this.children);
    const holder = this.requireHolder(holderId);
    if (!licenseActive(holder.license, isoDay(now))) {
      throw new DemoAdminError("Keine gültige Lizenz: zuerst eine Lizenz zuweisen.");
    }
    const pkg = packageById(holder.license!.packageId)!;
    if (this.childrenOf(holderId).length >= pkg.maxChildren) {
      throw new DemoAdminError(`Kinderlimit erreicht (${pkg.maxChildren} laut Paket).`);
    }
    const name = pruefeBenutzername(username);
    if (RESERVIERT.has(name) || this.childByUsername(name)) {
      throw new DemoAdminError("Dieser Benutzername ist schon vergeben.");
    }
    return name;
  }

  addChild(holderId: string, username: string, erstpasswort: string, now: Date): Child {
    const name = this.pruefeNeuesKind(holderId, username, now);
    const pruefung = pruefePasswort(erstpasswort, {
      benutzername: name,
      minLaenge: MIN_LAENGE_KIND,
    });
    if (!pruefung.ok) throw new DemoAdminError(`Erstpasswort: ${pruefung.grund}`);
    const child: Child = {
      id: newId(),
      holderId,
      username: name,
      passwordHash: hashPasswort(erstpasswort),
      mustChangePassword: true,
      testkonto: false,
      createdAt: now.toISOString(),
    };
    this.children.set(child.id, child);
    return child;
  }

  // Verknüpft das Demo-Testkonto mit einem Lizenznehmer, damit der Admin ihm Lernpakete geben kann.
  addTestkonto(holderId: string, username: string, now: Date): Child {
    const name = this.pruefeNeuesKind(holderId, username, now);
    const child: Child = {
      id: newId(),
      holderId,
      username: name,
      passwordHash: null,
      mustChangePassword: false,
      testkonto: true,
      createdAt: now.toISOString(),
    };
    this.children.set(child.id, child);
    return child;
  }

  removeChild(childId: string): void {
    if (!this.children.delete(childId)) throw new DemoAdminError("Kind nicht gefunden.");
    for (const [id, pkg] of this.packages) if (pkg.childId === childId) this.packages.delete(id);
    for (const [id, round] of this.rounds) if (round.childId === childId) this.rounds.delete(id);
  }

  resetPassword(childId: string, erstpasswort: string): void {
    const child = this.requireChild(childId);
    if (child.testkonto) throw new DemoAdminError("Das Testkonto hat ein festes Passwort.");
    const pruefung = pruefePasswort(erstpasswort, {
      benutzername: child.username,
      minLaenge: MIN_LAENGE_KIND,
    });
    if (!pruefung.ok) throw new DemoAdminError(`Erstpasswort: ${pruefung.grund}`);
    child.passwordHash = hashPasswort(erstpasswort);
    child.mustChangePassword = true;
  }

  // Anmeldung eines Kindes. Unbekannte Namen kosten gleich viel Rechenzeit wie bekannte.
  verifyLogin(username: string, passwort: string): Child | null {
    const child = this.childByUsername(username);
    if (!child?.passwordHash) return blindPruefen(passwort) || null;
    return pruefeHash(passwort, child.passwordHash) ? child : null;
  }

  changePassword(childId: string, aktuell: string, neu: string): void {
    const child = this.requireChild(childId);
    if (!child.passwordHash) throw new DemoAdminError("Für dieses Konto nicht möglich.");
    if (!pruefeHash(aktuell, child.passwordHash)) {
      throw new DemoAdminError("Das bisherige Passwort stimmt nicht.");
    }
    if (aktuell === neu) throw new DemoAdminError("Bitte ein neues Passwort wählen.");
    const pruefung = pruefePasswort(neu, {
      benutzername: child.username,
      minLaenge: MIN_LAENGE_KIND,
    });
    if (!pruefung.ok) throw new DemoAdminError(pruefung.grund);
    child.passwordHash = hashPasswort(neu);
    child.mustChangePassword = false;
  }

  createCategory(name: string): Category {
    this.guardSize(this.categories);
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 80) throw new DemoAdminError("Name ungültig.");
    for (const category of this.categories.values()) {
      if (category.name.toLowerCase() === trimmed.toLowerCase()) {
        throw new DemoAdminError("Die Kategorie gibt es schon.");
      }
    }
    const category = { id: newId(), name: trimmed };
    this.categories.set(category.id, category);
    return category;
  }

  placeGame(categoryId: string, stufe: string, gameSlug: string): Placement {
    this.guardSize(this.placements);
    this.requireCategory(categoryId);
    if (!STUFEN.includes(stufe as Stufe)) throw new DemoAdminError("Unbekannte Stufe.");
    if (!this.knownGames.includes(gameSlug)) throw new DemoAdminError("Unbekanntes Spiel.");
    for (const p of this.placements.values()) {
      if (p.categoryId === categoryId && p.stufe === stufe && p.gameSlug === gameSlug) {
        throw new DemoAdminError("Das Spiel steht schon in dieser Stufe.");
      }
    }
    const placement: Placement = { id: newId(), categoryId, stufe: stufe as Stufe, gameSlug };
    this.placements.set(placement.id, placement);
    return placement;
  }

  removePlacement(placementId: string): void {
    if (!this.placements.delete(placementId)) throw new DemoAdminError("Eintrag nicht gefunden.");
  }

  placementsOf(categoryId: string, stufe?: Stufe): Placement[] {
    return [...this.placements.values()].filter(
      (p) => p.categoryId === categoryId && (stufe === undefined || p.stufe === stufe),
    );
  }

  createPackage(
    childId: string,
    input: { name: string; validUntil: string | null; items: PackageItem[] },
    now: Date,
  ): LearningPackage {
    this.guardSize(this.packages);
    const child = this.requireChild(childId);
    const license = this.requireHolder(child.holderId).license;
    const today = isoDay(now);
    if (!licenseActive(license, today)) throw new DemoAdminError("Keine gültige Lizenz.");
    const name = input.name.trim();
    if (name.length < 2 || name.length > 60)
      throw new DemoAdminError("Name des Lernpakets ungültig.");
    if (input.validUntil !== null) {
      if (!isIsoDate(input.validUntil) || input.validUntil < today) {
        throw new DemoAdminError("Das Ablaufdatum muss heute oder später sein.");
      }
      if (input.validUntil >= license!.validUntil) {
        throw new DemoAdminError("Das Ablaufdatum muss vor dem Lizenzende liegen.");
      }
    }
    if (input.items.length === 0)
      throw new DemoAdminError("Bitte mindestens eine Stufe oder ein Spiel wählen.");
    if (input.items.length > 50) throw new DemoAdminError("Zu viele Einträge.");
    const items = new Map<string, PackageItem>();
    for (const item of input.items) {
      this.requireCategory(item.categoryId);
      if (item.art === "stufe") {
        if (!STUFEN.includes(item.stufe)) throw new DemoAdminError("Unbekannte Stufe.");
        items.set(`s:${item.categoryId}:${item.stufe}`, item);
      } else {
        if (!this.knownGames.includes(item.gameSlug))
          throw new DemoAdminError("Unbekanntes Spiel.");
        items.set(`g:${item.categoryId}:${item.gameSlug}`, item);
      }
    }
    const pkg: LearningPackage = {
      id: newId(),
      childId,
      name,
      createdAt: now.toISOString(),
      validUntil: input.validUntil,
      endedAt: null,
      items: [...items.values()],
      archiv: null,
    };
    this.packages.set(pkg.id, pkg);
    return pkg;
  }

  endPackage(packageId: string, now: Date): void {
    const pkg = this.packages.get(packageId);
    if (!pkg) throw new DemoAdminError("Lernpaket nicht gefunden.");
    if (pkg.endedAt) throw new DemoAdminError("Das Lernpaket ist schon beendet.");
    pkg.endedAt = now.toISOString();
  }

  packageStatus(pkg: LearningPackage, today: string): PackageStatus {
    if (pkg.endedAt) return "beendet";
    const child = this.children.get(pkg.childId);
    const license = child ? (this.holders.get(child.holderId)?.license ?? null) : null;
    if (!licenseActive(license, today)) return "abgelaufen";
    if (pkg.validUntil !== null && today > pkg.validUntil) return "abgelaufen";
    return "läuft";
  }

  packagesOf(childId: string): LearningPackage[] {
    return [...this.packages.values()]
      .filter((p) => p.childId === childId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  // Stufen werden beim Abruf aufgelöst: Neue Spiele einer freigegebenen Stufe kommen
  // automatisch dazu (Entscheidung vom 2026-10-26, vorläufig).
  gamesOf(pkg: LearningPackage): { categoryId: string; gameSlug: string }[] {
    const result = new Map<string, { categoryId: string; gameSlug: string }>();
    for (const item of pkg.items) {
      const slugs =
        item.art === "spiel"
          ? [item.gameSlug]
          : this.placementsOf(item.categoryId, item.stufe).map((p) => p.gameSlug);
      for (const gameSlug of slugs) {
        if (this.categories.has(item.categoryId)) {
          result.set(`${item.categoryId}:${gameSlug}`, { categoryId: item.categoryId, gameSlug });
        }
      }
    }
    return [...result.values()];
  }

  // Was das Kind heute spielen darf, je Kategorie (vereinfachtes can_play).
  playable(
    childId: string,
    now: Date,
  ): { categoryId: string; gameSlug: string; packageId: string }[] {
    const today = isoDay(now);
    const result = new Map<string, { categoryId: string; gameSlug: string; packageId: string }>();
    for (const pkg of this.packagesOf(childId)) {
      if (this.packageStatus(pkg, today) !== "läuft") continue;
      for (const game of this.gamesOf(pkg)) {
        const key = `${game.categoryId}:${game.gameSlug}`;
        if (!result.has(key)) result.set(key, { ...game, packageId: pkg.id });
      }
    }
    return [...result.values()];
  }

  canPlay(childId: string, gameSlug: string, now: Date): string | null {
    return this.playable(childId, now).find((g) => g.gameSlug === gameSlug)?.packageId ?? null;
  }

  // Ergebnis einer Spielrunde. Nur für Spiele, die das Kind gerade spielen darf.
  recordRound(
    childId: string,
    gameSlug: string,
    ergebnis: { aufgaben: number; fehler: number; dauerSek: number },
    now: Date,
  ): GameRound {
    this.guardSize(this.rounds, MAX_ITEMS * 20);
    const packageId = this.canPlay(childId, gameSlug, now);
    if (!packageId) throw new DemoAdminError("Dieses Spiel ist nicht freigegeben.");
    const { aufgaben, fehler, dauerSek } = ergebnis;
    const ganz = (n: number, min: number, max: number) =>
      Number.isInteger(n) && n >= min && n <= max;
    if (!ganz(aufgaben, 1, 50) || !ganz(fehler, 0, 500) || !ganz(dauerSek, 0, 7200)) {
      throw new DemoAdminError("Ergebnis ungültig.");
    }
    const round: GameRound = {
      id: newId(),
      childId,
      packageId,
      gameSlug,
      startedAt: new Date(now.getTime() - dauerSek * 1000).toISOString(),
      durationSec: dauerSek,
      aufgaben,
      fehler,
    };
    this.rounds.set(round.id, round);
    return round;
  }

  roundsOf(packageId: string): GameRound[] {
    return [...this.rounds.values()]
      .filter((r) => r.packageId === packageId)
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  }

  // Einzelne Runden bleiben 12 Monate, danach nur die Zusammenfassung je Lernpaket (D-011).
  pruneRounds(now: Date): number {
    const grenze = addMonths(isoDay(now), -AUFBEWAHRUNG_MONATE);
    let geloescht = 0;
    for (const [id, round] of this.rounds) {
      if (round.startedAt.slice(0, 10) >= grenze) continue;
      const pkg = this.packages.get(round.packageId);
      if (pkg) pkg.archiv = this.mitRunde(pkg.archiv, round);
      this.rounds.delete(id);
      geloescht += 1;
    }
    return geloescht;
  }

  private mitRunde(archiv: Archiv | null, round: GameRound): Archiv {
    const tag = round.startedAt;
    if (!archiv)
      return { runden: 1, aufgaben: round.aufgaben, fehler: round.fehler, erste: tag, letzte: tag };
    return {
      runden: archiv.runden + 1,
      aufgaben: archiv.aufgaben + round.aufgaben,
      fehler: archiv.fehler + round.fehler,
      erste: tag < archiv.erste ? tag : archiv.erste,
      letzte: tag > archiv.letzte ? tag : archiv.letzte,
    };
  }

  summary(packageId: string): Archiv | null {
    const pkg = this.packages.get(packageId);
    let result = pkg?.archiv ?? null;
    for (const round of this.roundsOf(packageId)) result = this.mitRunde(result, round);
    return result;
  }

  childrenOf(holderId: string): Child[] {
    return [...this.children.values()].filter((c) => c.holderId === holderId);
  }

  childByUsername(username: string): Child | undefined {
    return [...this.children.values()].find((c) => c.username === username);
  }

  requireChild(childId: string): Child {
    const child = this.children.get(childId);
    if (!child) throw new DemoAdminError("Kind nicht gefunden.");
    return child;
  }

  requireCategory(categoryId: string): Category {
    const category = this.categories.get(categoryId);
    if (!category) throw new DemoAdminError("Kategorie nicht gefunden.");
    return category;
  }

  requireHolder(holderId: string): Holder {
    const holder = this.holders.get(holderId);
    if (!holder) throw new DemoAdminError("Lizenznehmer nicht gefunden.");
    return holder;
  }
}

// Beispieldaten, frei erfunden, damit der Prototyp nicht leer startet. Das Testkonto bekommt
// kein Lernpaket: Der Admin gibt ihm die Spiele selbst frei.
export function seedStore(store: DemoAdminStore, now: Date, gameSlug: string | undefined) {
  const rechtschreibung = store.createCategory("Rechtschreibung");
  store.createCategory("Lesen");
  store.createCategory("Mathe");
  if (gameSlug) store.placeGame(rechtschreibung.id, "mittel", gameSlug);
  const holder = store.createHolder({
    name: "Frau Beispiel (erfunden)",
    email: "lehrkraft@example.org",
    type: "lehrkraft",
  });
  store.assignLicense(holder.id, "schule-20", 12, isoDay(now));
  store.addTestkonto(holder.id, "testuser", now);
}
