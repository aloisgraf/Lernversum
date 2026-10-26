import { expect, type Browser, type Page } from "@playwright/test";

// Passwörter aus playwright.config.ts (nur Testserver).
export const ADMIN = { username: "admin", password: "e2e-nur-test-admin" };
export const USER = { username: "testuser", password: "e2e-nur-test-benutzer" };
export const SPIEL_URL = "/spiele/wald-wesen-fuettern";

export async function login(page: Page, user: { username: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel("Benutzername").fill(user.username);
  await page.getByLabel("Passwort").fill(user.password);
  await page.getByRole("button", { name: "Anmelden" }).click();
}

// Öffnet im Admin die Seite eines Kindes des Beispiel-Lizenznehmers.
export async function oeffneKind(page: Page, username: string) {
  await page.goto("/admin/lizenznehmer");
  await page.getByRole("link", { name: /Frau Beispiel/ }).click();
  await page.getByRole("link", { name: username, exact: true }).click();
  await expect(page.getByRole("heading", { name: username })).toBeVisible();
}

// Gibt einem Kind die ganze Stufe „Mittel“ der Kategorie Rechtschreibung frei.
export async function gibStufeFrei(page: Page, paketName: string, ablauf = "") {
  await page.getByRole("button", { name: "+ Lernpaket freigeben" }).click();
  await page.getByLabel("Name des Lernpakets").fill(paketName);
  if (ablauf) await page.getByLabel(/Ablaufdatum/).fill(ablauf);
  await page
    .getByRole("group", { name: "Rechtschreibung" })
    .getByLabel(/Ganze Stufe Mittel/)
    .check();
  await page.getByRole("button", { name: "Freigeben", exact: true }).click();
  await expect(page.getByText(`Lernpaket „${paketName}“ freigegeben.`)).toBeVisible();
}

// Sorgt dafür, dass `testuser` das Spiel spielen darf (Server-Speicher ist für alle Tests gleich).
export async function testuserDarfSpielen(browser: Browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await login(page, USER);
  await expect(page).toHaveURL(/\/bereich$/);
  const response = await page.goto(SPIEL_URL);
  if (response?.status() === 404) {
    const admin = await browser.newContext();
    const adminPage = await admin.newPage();
    await login(adminPage, ADMIN);
    await expect(adminPage).toHaveURL(/\/admin$/);
    await oeffneKind(adminPage, "testuser");
    await gibStufeFrei(adminPage, "Rechtschreibung mittel");
    await admin.close();
  }
  await context.close();
}
