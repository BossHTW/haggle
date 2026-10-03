import type { Adapters } from "..";
import type { DealEvent, DealScenario } from "../../types";
import deal7f3a from "../../fixtures/deal-7f3a";

const scenarios: Record<string, DealScenario> = { "7F3A": deal7f3a };

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new Error("aborted"));
    const id = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(id);
      reject(new Error("aborted"));
    });
  });

async function* replayStream(scenarioId: string, opts?: { speed?: number; signal?: AbortSignal }): AsyncIterable<DealEvent> {
  const s = scenarios[scenarioId];
  if (!s) throw new Error(`unknown scenario ${scenarioId}`);
  const speed = opts?.speed ?? 1;
  let last = 0;
  for (const ev of s.events) {
    const wait = Math.max(0, (ev.t - last) / speed);
    if (wait) await sleep(wait, opts?.signal);
    last = ev.t;
    yield { ...ev, bandRef: `replay:${ev.id}` };
  }
}

export function createReplayAdapters(): Adapters {
  const s = deal7f3a;
  return {
    mode: "replay",
    events: {
      stream: replayStream,
      scenario: async (id) => {
        const sc = scenarios[id];
        if (!sc) throw new Error(`unknown scenario ${id}`);
        return sc;
      },
    },
    scout: {
      priceCheck: async () => ({ price: 229, inStock: false, source: "northbeach-outfitters.example" }),
    },
    catalog: {
      complements: async () => [
        { sku: "MP-SC-LIN-NAT", name: "Natural Linen Scarf", list: 48, cost: 14, score: 0.91 },
        { sku: "MP-TT-CANV", name: "Canvas Market Tote", list: 38, cost: 11, score: 0.84 },
        { sku: "MP-BT-HORN", name: "Horn Button Set", list: 22, cost: 6, score: 0.71 },
      ],
    },
    inventory: {
      lookup: async () => ({ onHand: s.product.onHand, daysOnShelf: s.product.daysOnShelf, weeklyVelocity: 0.4, cost: s.product.costUSD, list: s.product.listUSD }),
    },
    occupancy: {
      current: async () => ({ occupancyPct: 23, trend: "falling" }),
    },
    gate: {
      request: async () => "approved",
    },
  };
}
