import { describe, expect, it } from "vitest";
import { parsePublicEnv } from "@/lib/env";

describe("parsePublicEnv", () => {
  it("akzeptiert gültige Werte", () => {
    const env = parsePublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-anon-key",
    });
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe("http://127.0.0.1:54321");
  });

  it("lehnt fehlende Werte ab und nennt nur die Namen", () => {
    expect(() => parsePublicEnv({ NEXT_PUBLIC_SUPABASE_URL: "keine-url" })).toThrow(
      /NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY/,
    );
  });

  it("gibt keine Werte in der Fehlermeldung preis", () => {
    try {
      parsePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "geheim-falsch",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
      });
    } catch (error) {
      expect(String(error)).not.toContain("geheim-falsch");
    }
  });

  it("übernimmt keine zusätzlichen Variablen", () => {
    const env = parsePublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "darf-nicht-durchrutschen",
    });
    expect(Object.keys(env)).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });
});
