// ---------------------------------------------------------------------------
// Adapter seam. Everything external goes through these interfaces so the UI
// and the orchestration never care whether we're LIVE (Band + ZooWork +
// TinyFish + Moss + Butlr) or REPLAY (fixture). Codex implements the live
// side in src/lib/adapters/live/*; replay lives in src/lib/adapters/replay/*.
// ---------------------------------------------------------------------------
import type { DealEvent, DealScenario, Mode } from "../types";

/** A source of room events — Band room (live) or fixture (replay). */
export interface DealEventSource {
  /** Async iterator of events in chronological order. Must terminate on deal.closed / deal.walked. */
  stream(scenarioId: string, opts?: { speed?: number; signal?: AbortSignal }): AsyncIterable<DealEvent>;
  scenario(scenarioId: string): Promise<DealScenario>;
}

/** Live web verification (TinyFish). */
export interface WebScout {
  priceCheck(url: string, size: string): Promise<{ price: number; inStock: boolean; source: string }>;
}

/** Catalog retrieval (Moss). */
export interface CatalogSearch {
  complements(sku: string, k: number): Promise<Array<{ sku: string; name: string; list: number; cost: number; score: number }>>;
}

/** Inventory & commerce data (ZooData / merchant DB). */
export interface InventorySource {
  lookup(sku: string): Promise<{ onHand: number; daysOnShelf: number; weeklyVelocity: number; cost: number; list: number }>;
}

/** Physical-world signal (Butlr occupancy). */
export interface OccupancySource {
  current(space: string): Promise<{ occupancyPct: number; trend: "rising" | "flat" | "falling" }>;
}

/** Human gate (WhatsApp / Slack / Band Desktop). */
export interface OwnerGate {
  request(summary: string, opts: { timeoutMs: number }): Promise<"approved" | "rejected" | "timeout">;
}

export interface Adapters {
  mode: Mode;
  events: DealEventSource;
  scout: WebScout;
  catalog: CatalogSearch;
  inventory: InventorySource;
  occupancy: OccupancySource;
  gate: OwnerGate;
}

export async function getAdapters(): Promise<Adapters> {
  const mode: Mode = process.env.HAGGLE_MODE === "live" ? "live" : "replay";
  if (mode === "live") {
    // Codex: implement ./live and remove this guard. Keep replay as the fallback
    // when any required env var (BAND_API_KEY, ZOOWORK_API_KEY, …) is missing.
    const live = await import("./live").catch(() => null);
    if (live?.createLiveAdapters) return live.createLiveAdapters();
    console.warn("[haggle] HAGGLE_MODE=live but live adapters unavailable — falling back to replay");
  }
  const { createReplayAdapters } = await import("./replay");
  return createReplayAdapters();
}
