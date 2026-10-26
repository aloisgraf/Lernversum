import "server-only";
import { headers } from "next/headers";

// Adresse der Anmeldeseite für den Loginzettel. Bevorzugt die feste Einstellung
// `LOGIN_URL`; sonst aus der Anfrage des Admins abgeleitet und streng geprüft.
const HOST = /^[a-z0-9.-]+(:\d{1,5})?$/i;

export async function anmeldeAdresse(): Promise<string> {
  const fest = process.env.LOGIN_URL?.trim();
  if (fest && /^https?:\/\/[^\s]+$/.test(fest)) return fest;
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").split(",")[0]!.trim();
  const proto = (h.get("x-forwarded-proto") ?? "https").split(",")[0]!.trim();
  if (!HOST.test(host) || !["http", "https"].includes(proto)) return "/login";
  return `${proto}://${host}/login`;
}
