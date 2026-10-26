import { redirect } from "next/navigation";

// Die öffentliche Spieleseite ist entfernt (Entscheidung vom 2026-10-26): Spiele gibt es nur
// noch nach Anmeldung und Freigabe im Kinderbereich.
export default function SpielePage() {
  redirect("/bereich");
}
