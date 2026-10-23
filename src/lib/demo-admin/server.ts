import "server-only";
import { spiele } from "@/games/registry";
import { DemoAdminStore, seedStore } from "./store";

// Ein Speicher pro Serverprozess. Ein Neustart oder neues Deployment setzt alles zurück.
const globalStore = globalThis as typeof globalThis & { __lvDemoAdmin?: DemoAdminStore };

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function adminStore(): DemoAdminStore {
  if (!globalStore.__lvDemoAdmin) {
    const store = new DemoAdminStore(spiele.map((s) => s.slug));
    seedStore(store, today(), spiele[0]?.slug);
    globalStore.__lvDemoAdmin = store;
  }
  return globalStore.__lvDemoAdmin;
}
