import { expect, test, type Page } from "@playwright/test";
import { USER, login, testuserDarfSpielen } from "./hilfen";

// Stufe 3 zeigt Wörter statt Bilder, daher kann der Test die richtige Endung ablesen.
async function richtigesZiel(page: Page): Promise<string> {
  const wort = (await page.getByTestId("bildkarte").innerText()).trim();
  const ende = wort.slice(-2);
  return ["el", "en", "er"].includes(ende) ? ende : "hoehle";
}

test.beforeAll(async ({ browser }) => {
  await testuserDarfSpielen(browser);
});

async function starteStufe3(page: Page) {
  await login(page, USER);
  await expect(page).toHaveURL(/\/bereich$/);
  await page.getByRole("link", { name: /Feuerplanet/ }).click();
  await page.getByRole("link", { name: /Wald-Wesen füttern/ }).click();
  await expect(page.getByRole("heading", { name: "Wald-Wesen füttern" })).toBeVisible();
  await page.getByRole("button", { name: /Stufe 3/ }).click();
}

test("freigegebenes Spiel ist aus dem Kinderbereich erreichbar und spielbar", async ({ page }) => {
  await starteStufe3(page);
  for (let i = 0; i < 9; i++) {
    const ziel = await richtigesZiel(page);
    await page.locator(`[data-ziel="${ziel}"]`).click();
    await expect(page.getByLabel(`${i + 1} von 9 geschafft`)).toBeVisible();
    await expect(page.getByText(/Mmh, lecker!|Die Höhle behält es/)).toBeVisible();
    await page.getByRole("button", { name: i < 8 ? "Weiter" : "Fertig" }).click();
  }
  await expect(page.getByRole("heading", { name: "Geschafft!" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Deine Wörter" }).getByRole("listitem")).toHaveCount(
    9,
  );
});

test("falsche Zuordnung zählt nicht und lässt die Aufgabe stehen", async ({ page }) => {
  await starteStufe3(page);
  const wortVorher = await page.getByTestId("bildkarte").innerText();
  const richtig = await richtigesZiel(page);
  const falsch = ["el", "en", "er", "hoehle"].find((z) => z !== richtig)!;
  await page.locator(`[data-ziel="${falsch}"]`).click();
  await expect(page.getByText("Noch nicht ganz")).toBeVisible();
  await expect(page.getByLabel("0 von 9 geschafft")).toBeVisible();
  await expect(page.getByTestId("bildkarte")).toHaveText(wortVorher);
});

test("Bild lässt sich zum Wald-Wesen ziehen", async ({ page }) => {
  await starteStufe3(page);
  const ziel = await richtigesZiel(page);
  await page.getByTestId("bildkarte").dragTo(page.locator(`[data-ziel="${ziel}"]`));
  await expect(page.getByLabel("1 von 9 geschafft")).toBeVisible();
  await expect(page.getByTestId("loesungswort")).toBeVisible();
});

test("Spielseite speichert nichts im Browser außer der Sitzung", async ({ page }) => {
  await starteStufe3(page);
  await page.locator(`[data-ziel="${await richtigesZiel(page)}"]`).click();
  const gespeichert = await page.evaluate(() => ({
    local: localStorage.length,
    session: sessionStorage.length,
    // Das Sitzungs-Cookie ist httpOnly und darum für Skripte unsichtbar.
    cookies: document.cookie,
  }));
  expect(gespeichert).toEqual({ local: 0, session: 0, cookies: "" });
});

test("Zurück führt vom Spiel in die Lernwelt und von dort auf die Weltkarte", async ({ page }) => {
  await login(page, USER);
  await expect(page).toHaveURL(/\/bereich$/);
  await page.getByRole("link", { name: /Feuerplanet/ }).click();
  await expect(page).toHaveURL(/\/bereich\/welt\/[0-9a-f]{16}$/);
  const welt = page.url();
  await page.getByRole("link", { name: /Wald-Wesen füttern/ }).click();
  await expect(page.getByRole("heading", { name: "Wald-Wesen füttern" })).toBeVisible();
  // Während der Runde führt Zurück erst zur Stufenwahl des Spiels, dann in die Lernwelt.
  await page.getByRole("button", { name: /Stufe 3/ }).click();
  await page.getByRole("button", { name: /Zurück/ }).click();
  await expect(page.getByRole("heading", { name: "Wald-Wesen füttern" })).toBeVisible();
  await page.getByRole("link", { name: "Zurück" }).click();
  await expect(page).toHaveURL(welt);
  await page.getByRole("link", { name: "← Zur Weltkarte" }).click();
  await expect(page).toHaveURL(/\/bereich$/);
  // Auch die Zurück-Taste des Browsers folgt diesem Weg.
  await page.goBack();
  await expect(page).toHaveURL(welt);
});
