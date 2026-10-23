import { expect, test, type Page } from "@playwright/test";

// Passwörter aus playwright.config.ts (nur Testserver).
const ADMIN = { username: "admin", password: "e2e-nur-test-admin" };
const USER = { username: "testuser", password: "e2e-nur-test-benutzer" };

// Alle Projekte teilen sich einen Server; Anmeldungen würden sich gegenseitig abmelden.
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
  await expect(page.getByRole("heading", { name: "Hallo testuser!" })).toBeVisible();
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
