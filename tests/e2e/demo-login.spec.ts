import { expect, test, type Page } from "@playwright/test";
import { ADMIN, SPIEL_URL, USER, gibStufeFrei, login, oeffneKind } from "./hilfen";

// Anmeldung und Admin einmal testen (Desktop); die Spieltests laufen in allen Größen.
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Demo-Login nur im Desktop-Projekt testen");
});

test("ohne Anmeldung führen Admin- und Benutzerbereich zur Anmeldung", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/bereich");
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/bereich/welt/0000000000000000");
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

test("Admin legt Lizenznehmer und Lizenz an", async ({ page }) => {
  await login(page, ADMIN);
  await page.getByRole("link", { name: "Lizenznehmer und Kinder" }).click();
  const suffix = Date.now().toString(36);
  await page.getByRole("button", { name: "+ Neuen Lizenznehmer anlegen" }).click();
  await page.getByLabel("Name").fill(`Therapie Test ${suffix}`);
  await page.getByLabel("E-Mail").fill(`t-${suffix}@example.org`);
  await page.getByLabel("Art").selectOption("therapeut");
  await page.getByRole("button", { name: "Anlegen", exact: true }).click();
  await page.getByRole("link", { name: new RegExp(`Therapie Test ${suffix}`) }).click();
  await page.getByRole("button", { name: "Lizenz zuweisen" }).click();
  await expect(page.getByText(/Lizenz gültig bis/)).toBeVisible();
});

test("Admin legt Kategorie an und ordnet ein Spiel einer Stufe zu", async ({ page }) => {
  await login(page, ADMIN);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/spiele");
  const name = `Kategorie ${Date.now().toString(36)}`;
  await page.getByRole("button", { name: "+ Neue Kategorie anlegen" }).click();
  await page.getByLabel("Name").fill(name);
  await page.getByRole("button", { name: "Kategorie speichern" }).click();
  await expect(page.getByText(`Kategorie „${name}“ angelegt.`)).toBeVisible();
  const bereich = page.locator("section", { has: page.getByRole("heading", { name }) });
  await bereich.getByLabel("Stufe").selectOption("schwer");
  await bereich.getByRole("button", { name: "Spiel zuordnen" }).click();
  await expect(bereich.locator("li", { hasText: "Wald-Wesen füttern" })).toBeVisible();
});

// Neues Kind über den Admin: frei gewählter Name, Erstpasswort, Pflichtwechsel, Lernpaket.
async function neuesKind(page: Page): Promise<{ username: string; passwort: string }> {
  const username = `kind${Date.now().toString(36)}`;
  const passwort = "start-passwort-e2e";
  await login(page, ADMIN);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/lizenznehmer");
  await page.getByRole("link", { name: /Frau Beispiel/ }).click();
  await page.getByRole("button", { name: "+ Kind anlegen" }).click();
  await page.getByLabel("Benutzername").fill(username);
  await page.getByLabel("Erstpasswort").fill(passwort);
  await page.getByRole("button", { name: "Kind speichern" }).click();
  await expect(page.getByText(`${username} angelegt.`, { exact: false })).toBeVisible();
  return { username, passwort };
}

test("Loginzettel: nach dem Anlegen druckbar, QR nur mit Adresse, Passwort nicht gespeichert", async ({
  page,
}) => {
  const kind = await neuesKind(page);
  const zettel = page.locator(".lv-zettel");
  await expect(zettel.getByText(kind.username, { exact: true })).toBeVisible();
  await expect(zettel.getByText(kind.passwort, { exact: true })).toBeVisible();
  const qr = zettel.getByRole("img", { name: /QR-Code zur Anmeldeseite/ });
  await expect(qr).toHaveAttribute("aria-label", /\/login$/);
  await expect(qr).not.toHaveAttribute("aria-label", new RegExp(kind.passwort));
  await expect(page.getByRole("button", { name: "Loginzettel drucken" })).toBeVisible();
  await page.emulateMedia({ media: "print" });
  await expect(page.getByRole("button", { name: "Loginzettel drucken" })).toBeHidden();
  await page.emulateMedia({ media: "screen" });
  // Nach dem Neuladen ist das Passwort weg; im Admin steht es nirgends.
  await page.reload();
  await expect(page.getByText(kind.passwort)).toHaveCount(0);
  await page.getByRole("link", { name: kind.username, exact: true }).click();
  await expect(page.getByText(kind.passwort)).toHaveCount(0);
});

test("Admin lehnt schwaches Erstpasswort und ungültigen Benutzernamen ab", async ({ page }) => {
  await login(page, ADMIN);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/lizenznehmer");
  await page.getByRole("link", { name: /Frau Beispiel/ }).click();
  await page.getByRole("button", { name: "+ Kind anlegen" }).click();
  await page.getByLabel("Benutzername").fill(`kind${Date.now().toString(36)}`);
  await page.getByLabel("Erstpasswort").fill("12345678");
  await page.getByRole("button", { name: "Kind speichern" }).click();
  await expect(
    page.getByText("Erstpasswort: Dieses Passwort ist zu leicht zu erraten."),
  ).toBeVisible();
  await page.getByLabel("Benutzername").fill("Mia Muster");
  await page.getByLabel("Erstpasswort").fill("start-passwort-e2e");
  await page.getByRole("button", { name: "Kind speichern" }).click();
  await expect(page.getByText(/Benutzername: 3 bis 30 Zeichen/)).toBeVisible();
});

test("Kind muss beim ersten Login das Passwort ändern, vorher ist nichts erreichbar", async ({
  browser,
}) => {
  const admin = await browser.newPage();
  const kind = await neuesKind(admin);
  await admin.close();

  const page = await browser.newPage();
  await login(page, { username: kind.username, password: kind.passwort });
  await expect(page).toHaveURL(/\/passwort-aendern$/);
  for (const pfad of ["/bereich", "/bereich/profil", SPIEL_URL]) {
    await page.goto(pfad);
    await expect(page).toHaveURL(/\/passwort-aendern$/);
  }
  const admin404 = await page.goto("/admin");
  expect(admin404?.status()).toBe(404);

  await page.goto("/passwort-aendern");
  await page.getByLabel("Passwort von deinem Zettel").fill("falsches-passwort");
  await page.getByLabel("Dein neues Passwort").fill("mein eigenes pw");
  await page.getByLabel("Neues Passwort noch einmal").fill("mein eigenes pw");
  await page.getByRole("button", { name: "Passwort speichern" }).click();
  await expect(page.getByText("Das bisherige Passwort stimmt nicht.")).toBeVisible();

  await page.getByLabel("Passwort von deinem Zettel").fill(kind.passwort);
  await page.getByLabel("Dein neues Passwort").fill(kind.passwort);
  await page.getByLabel("Neues Passwort noch einmal").fill(kind.passwort);
  await page.getByRole("button", { name: "Passwort speichern" }).click();
  await expect(page.getByText("Bitte ein neues Passwort wählen.")).toBeVisible();

  await page.getByLabel("Passwort von deinem Zettel").fill(kind.passwort);
  await page.getByLabel("Dein neues Passwort").fill("mein eigenes pw");
  await page.getByLabel("Neues Passwort noch einmal").fill("mein eigenes pw");
  await page.getByRole("button", { name: "Passwort speichern" }).click();
  await expect(page).toHaveURL(/\/bereich$/);
  await expect(page.getByRole("heading", { name: `Hallo, ${kind.username}!` })).toBeVisible();

  // Ohne Lernpaket: kein Spiel, auch nicht über die Adresse; Lernwelten bleiben zu.
  const ohne = await page.goto(SPIEL_URL);
  expect(ohne?.status()).toBe(404);
  await page.goto("/bereich");
  await expect(page.getByRole("link", { name: /Feuerplanet/ })).toHaveCount(0);
  for (const pfad of ["/bereich/welt/kein-gueltiger-name", "/bereich/welt/0000000000000000"]) {
    const antwort = await page.goto(pfad);
    expect(antwort?.status()).toBe(404);
  }

  // Altes Erstpasswort gilt nicht mehr.
  await page.goto("/bereich");
  await page.getByRole("button", { name: "Abmelden" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await login(page, { username: kind.username, password: kind.passwort });
  await expect(page.getByText("Benutzername oder Passwort stimmt nicht.")).toBeVisible();
  await page.close();
});

test("Lernpaket: Kind sieht und spielt das Spiel, Admin sieht die Runde, nach Ende ist es weg", async ({
  browser,
}) => {
  const admin = await browser.newPage();
  const kind = await neuesKind(admin);
  const kindPage = await browser.newPage();
  await login(kindPage, { username: kind.username, password: kind.passwort });
  await kindPage.getByLabel("Passwort von deinem Zettel").fill(kind.passwort);
  await kindPage.getByLabel("Dein neues Passwort").fill("mein eigenes pw");
  await kindPage.getByLabel("Neues Passwort noch einmal").fill("mein eigenes pw");
  await kindPage.getByRole("button", { name: "Passwort speichern" }).click();
  await expect(kindPage).toHaveURL(/\/bereich$/);

  await oeffneKind(admin, kind.username);
  await gibStufeFrei(admin, "Paket E2E");
  await expect(admin.getByText(/Spiele darin: Wald-Wesen füttern/)).toBeVisible();

  // Kind sieht das Spiel auf dem Feuerplaneten, aber keine Stufe; Funki begrüßt es.
  await kindPage.goto("/bereich");
  await expect(kindPage.getByText(/mittel/i)).toHaveCount(0);
  await kindPage.getByRole("link", { name: /Feuerplanet/ }).click();
  await expect(kindPage).toHaveURL(/\/bereich\/welt\/[0-9a-f]{16}$/);
  const welt = kindPage.url();
  await expect(kindPage.getByText(/mittel/i)).toHaveCount(0);
  const funki = kindPage.getByRole("status", { name: "Funki sagt" });
  await expect(funki).toContainText(`Hallo ${kind.username}!`);
  await expect(funki).toContainText("Wähle das erste Spiel.");
  await kindPage.getByRole("link", { name: /Wald-Wesen füttern/ }).click();
  await kindPage.getByRole("button", { name: /Stufe 3/ }).click();
  for (let i = 0; i < 9; i++) {
    const wort = (await kindPage.getByTestId("bildkarte").innerText()).trim();
    const ende = wort.slice(-2);
    const ziel = ["el", "en", "er"].includes(ende) ? ende : "hoehle";
    await kindPage.locator(`[data-ziel="${ziel}"]`).click();
    await kindPage.getByRole("button", { name: i < 8 ? "Weiter" : "Fertig" }).click();
  }
  await expect(kindPage.getByRole("heading", { name: "Geschafft!" })).toBeVisible();

  // Zurück auf dem Planeten lobt Funki (sobald die Runde gespeichert ist).
  await expect
    .poll(async () => {
      await kindPage.goto(`${welt}?geschafft=1`);
      return kindPage.getByRole("status", { name: "Funki sagt" }).innerText();
    })
    .toContain(`Super gemacht, ${kind.username}!`);

  // Kind sieht Sterne, Admin sieht die Runde mit Ergebnis.
  await expect
    .poll(async () => {
      await kindPage.goto("/bereich");
      return kindPage.getByLabel("3 von 3 Sternen").count();
    })
    .toBe(1);
  await admin.reload();
  await expect(admin.getByText(/Ergebnisse: 1 Runden, 9 Aufgaben, 0 Fehlversuche/)).toBeVisible();

  // Admin beendet das Paket: Spiel weg, Ergebnisse bleiben.
  await admin.getByRole("button", { name: "Beenden" }).click();
  await expect(admin.locator(".lv-status", { hasText: "beendet" })).toBeVisible();
  const danach = await kindPage.goto(SPIEL_URL);
  expect(danach?.status()).toBe(404);
  // Auch die Lernwelt ist zu: zurück zur Weltkarte.
  await kindPage.goto(welt);
  await expect(kindPage).toHaveURL(/\/bereich$/);
  await kindPage.goto("/bereich");
  await expect(kindPage.getByText(/Paket E2E/)).toBeVisible();
  await expect(kindPage.getByText("· vorbei")).toBeVisible();
  await expect(kindPage.getByLabel("3 von 3 Sternen")).toBeVisible();

  // Kind gelöscht: Sitzung ist sofort beendet.
  await admin.getByRole("button", { name: "Kind entfernen" }).click();
  await kindPage.goto("/bereich");
  await expect(kindPage).toHaveURL(/\/login$/);
  await admin.close();
  await kindPage.close();
});

test("öffentliche Spieleseite ist entfernt, Spiele nur nach Anmeldung", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /Spiele ausprobieren/ })).toHaveCount(0);
  await page.goto("/spiele");
  await expect(page).toHaveURL(/\/login$/);
  await page.goto(SPIEL_URL);
  await expect(page).toHaveURL(/\/login$/);
  await login(page, ADMIN);
  await expect(page).toHaveURL(/\/admin$/);
  const response = await page.goto(SPIEL_URL);
  expect(response?.status()).toBe(404);
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
