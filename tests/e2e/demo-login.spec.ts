import { expect, test, type Page } from "@playwright/test";

// Passwörter aus playwright.config.ts (nur Testserver).
const ADMIN = { username: "admin", password: "e2e-nur-test-admin" };
const USER = { username: "testuser", password: "e2e-nur-test-benutzer" };

// Alle Projekte teilen sich einen Server; Anmeldungen würden sich gegenseitig abmelden.
// Darum stehen alle Tests mit Anmeldung in dieser einen Datei (läuft der Reihe nach).
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Demo-Login nur im Desktop-Projekt testen");
});

async function login(page: Page, user: { username: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel("Benutzername").fill(user.username);
  await page.getByLabel("Passwort").fill(user.password);
  await page.getByRole("button", { name: "Anmelden" }).click();
}

test("ohne Anmeldung führen Admin- und Benutzerbereich zur Anmeldung", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/bereich");
  await expect(page).toHaveURL(/\/login$/);
});

test("falsches Passwort wird abgelehnt", async ({ page }) => {
  await login(page, { username: "testuser", password: "falsches-passwort" });
  await expect(page.getByText("Benutzername oder Passwort stimmt nicht.")).toBeVisible();
  await page.goto("/bereich");
  await expect(page).toHaveURL(/\/login$/);
});

test("Benutzer sieht seinen Bereich, aber nicht den Adminbereich", async ({ page }) => {
  await login(page, USER);
  await expect(page).toHaveURL(/\/bereich$/);
  await expect(page.getByRole("heading", { name: "Hallo, testuser!" })).toBeVisible();
  const response = await page.goto("/admin");
  expect(response?.status()).toBe(404);
});

test("Admin sieht den Adminbereich, aber nicht den Benutzerbereich", async ({ page }) => {
  await login(page, ADMIN);
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Adminbereich" })).toBeVisible();
  const response = await page.goto("/bereich");
  expect(response?.status()).toBe(404);
});

test("gefälschtes Sitzungs-Cookie hilft nicht", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "lv_demo_session", value: "erfunden", url: baseURL! }]);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login$/);
});

test("zweite Anmeldung beendet die erste Sitzung", async ({ browser }) => {
  const first = await browser.newPage();
  await login(first, USER);
  await expect(first).toHaveURL(/\/bereich$/);

  const second = await browser.newPage();
  await login(second, USER);
  await expect(second).toHaveURL(/\/bereich$/);

  await first.goto("/bereich");
  await expect(first).toHaveURL(/\/login$/);
  await first.close();
  await second.close();
});

test("Abmelden beendet die Sitzung", async ({ page }) => {
  await login(page, USER);
  await page.getByRole("button", { name: "Abmelden" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/bereich");
  await expect(page).toHaveURL(/\/login$/);
});

// Test-Admin (Prototyp, D-021)

test("ohne Anmeldung sind die Admin-Unterseiten gesperrt", async ({ page }) => {
  for (const path of ["/admin/lizenznehmer", "/admin/spiele"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login$/);
  }
});

test("Benutzer kommt nicht in die Admin-Unterseiten", async ({ page }) => {
  await login(page, USER);
  await expect(page).toHaveURL(/\/bereich$/);
  for (const path of ["/admin/lizenznehmer", "/admin/spiele"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
  }
});

test("Admin legt Lizenznehmer, Lizenz, Kind und Freischaltung an", async ({ page }) => {
  await login(page, ADMIN);
  await page.getByRole("link", { name: "Lizenznehmer und Kinder" }).click();

  const suffix = Date.now().toString(36);
  await page.getByLabel("Name").fill(`Therapie Test ${suffix}`);
  await page.getByLabel("E-Mail").fill(`t-${suffix}@example.org`);
  await page.getByLabel("Art").selectOption("therapeut");
  await page.getByRole("button", { name: "Anlegen" }).click();
  await page.getByRole("link", { name: new RegExp(`Therapie Test ${suffix}`) }).click();

  await page.getByRole("button", { name: "Lizenz zuweisen" }).click();
  await expect(page.getByText(/Lizenz gültig bis/)).toBeVisible();

  await page.getByLabel("Vorname").fill("Lena");
  await page.getByLabel("Nachname").fill("Tester");
  await page.getByRole("button", { name: "Kind anlegen" }).click();
  await expect(page.getByText(/Kinderkarte: Benutzername/)).toBeVisible();
  await expect(page.getByText(/Elternkarte: Benutzername eltern\.lena\.tester/)).toBeVisible();

  await page.getByRole("button", { name: "Spiel freischalten" }).click();
  await expect(page.getByText(/Darf heute spielen: Wald-Wesen füttern/)).toBeVisible();
});

test("Admin legt ein Thema an", async ({ page }) => {
  await login(page, ADMIN);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/spiele");
  const name = `Thema ${Date.now().toString(36)}`;
  await page.getByLabel("Neues Thema").fill(name);
  await page.getByRole("button", { name: "Thema anlegen" }).click();
  await expect(page.getByText(`Thema „${name}“ angelegt.`)).toBeVisible();
});

test("ohne Anmeldung ist das Profil gesperrt, Admin bekommt es nicht", async ({ page }) => {
  await page.goto("/bereich/profil");
  await expect(page).toHaveURL(/\/login$/);
  await login(page, ADMIN);
  await expect(page).toHaveURL(/\/admin$/);
  const response = await page.goto("/bereich/profil");
  expect(response?.status()).toBe(404);
});

test("Kind wählt Spitzname und Avatar; ungültiger Spitzname wird abgelehnt", async ({ page }) => {
  await login(page, USER);
  await expect(page).toHaveURL(/\/bereich$/);
  await page.getByRole("link", { name: "Mein Profil" }).click();
  await expect(page.getByRole("heading", { name: "Mein Profil" })).toBeVisible();
  await expect(page.getByText("testuser", { exact: true })).toBeVisible();

  await page.getByLabel("Mein Spitzname").fill("Mia123");
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByText("Im Spitznamen sind nur Buchstaben")).toBeVisible();

  await page.getByLabel("Mein Spitzname").fill("Sternchen");
  // Wie ein Kind: auf das Bild tippen (das Auswahlfeld selbst ist unsichtbar).
  await page
    .locator("label", { has: page.getByRole("radio", { name: "Freundliches Alien" }) })
    .click();
  await expect(page.getByRole("radio", { name: "Freundliches Alien" })).toBeChecked();
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByText("Gespeichert!")).toBeVisible();

  await page.getByRole("link", { name: "Zurück zur Weltkarte" }).click();
  await expect(page.getByRole("heading", { name: "Hallo, Sternchen!" })).toBeVisible();

  // Zurücksetzen, damit andere Tests den Benutzernamen sehen.
  await page.goto("/bereich/profil");
  await page.getByLabel("Mein Spitzname").fill("");
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByText("Gespeichert!")).toBeVisible();
});
