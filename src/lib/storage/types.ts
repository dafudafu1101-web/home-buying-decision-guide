import { DemoAppState } from "@/lib/types";

/**
 * デモ状態の永続化インターフェース。
 * 現在は localStorage 実装のみだが、将来 API/Prisma 経由の実装に
 * 差し替えられるよう、呼び出し側はこのインターフェースだけに依存させる。
 */
export interface DemoRepository {
  load(): Promise<DemoAppState | null>;
  save(state: DemoAppState): Promise<void>;
  clear(): Promise<void>;
}
