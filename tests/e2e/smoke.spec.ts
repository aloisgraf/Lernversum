import { expect, test } from "@playwright/test";

test("Startseite lädt", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Lernversum" })).toBeVisible();
});

test("Sicherheits-Header sind gesetzt", async ({ request }) => {
  const response = await request.get("/");
  const headers = response.headers();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["strict-transport-security"]).toContain("max-age=");
  expect(headers["x-powered-by"]).toBeUndefined();
});

test("Seite ist nicht für Suchmaschinen freigegeben", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});
