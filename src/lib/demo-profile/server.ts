import "server-only";
import { ProfilSpeicher } from "./core";

// Ein Speicher pro Serverprozess. Ein Neustart oder neues Deployment setzt alles zurück.
const globalStore = globalThis as typeof globalThis & { __lvDemoProfil?: ProfilSpeicher };

export function profilSpeicher(): ProfilSpeicher {
  return (globalStore.__lvDemoProfil ??= new ProfilSpeicher());
}
