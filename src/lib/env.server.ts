import "server-only";
import { z } from "zod";

// Geheime Server-Variablen. Der Import von "server-only" bricht den Build ab, falls diese
// Datei versehentlich in Browser-Code eingebunden wird.
const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

export type ServerEnv = z.infer<typeof serverSchema>;

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const result = serverSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: source.SUPABASE_SERVICE_ROLE_KEY,
  });
  if (!result.success) {
    const names = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Ungültige oder fehlende Server-Umgebungsvariablen: ${names}`);
  }
  return result.data;
}
