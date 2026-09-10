import { DemoAppState, emptyDemoAppState } from "@/lib/types";
import { DemoRepository } from "./types";

const STORAGE_KEY = "hbdg:demo:v1";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export class LocalStorageDemoRepository implements DemoRepository {
  async load(): Promise<DemoAppState | null> {
    if (!isBrowser()) return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as DemoAppState;
      if (parsed.schemaVersion !== emptyDemoAppState.schemaVersion) {
        // スキーマが変わっている場合は古いデータを引き継がず、安全に初期化し直す。
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  async save(state: DemoAppState): Promise<void> {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // 保存に失敗しても画面操作は継続できるようにする（容量超過など）。
    }
  }

  async clear(): Promise<void> {
    if (!isBrowser()) return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // no-op
    }
  }
}

export const demoRepository: DemoRepository = new LocalStorageDemoRepository();
