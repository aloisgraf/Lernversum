import { z } from "zod";

// Öffentliche Variablen dürfen im Browser landen. Geheime Schlüssel gehören nie hierher,
// sondern in src/lib/env.server.ts.
const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

export type PublicEnv = z.infer<typeof publicSchema>;

export function parsePublicEnv(source: Record<string, string | undefined>): PublicEnv {
  const result = publicSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: source.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: source.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  if (!result.success) {
    // Nur die Namen der fehlerhaften Variablen nennen, nie ihre Werte.
    const names = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Ungültige oder fehlende Umgebungsvariablen: ${names}`);
  }
  return result.data;
}
