// ---------------------------------------------------------------------------
// LIVE adapters — TO BE IMPLEMENTED BY CODEX. See docs/CODEX_BRIEF.md.
//
// Contract: export createLiveAdapters(): Adapters. If a required env var is
// missing, throw — getAdapters() will fall back to replay and log a warning.
//
//   Band      → events.stream(): subscribe to the Deal Room over the Band
//               WebSocket / SDK, map Band messages to DealEvent (see
//               docs/CODEX_BRIEF.md §3 for the mapping table).
//   ZooWork   → each @bosshtw/* agent is a ZooWork managed agent; the Band
//               adapter for each agent forwards @mentions into a ZooWork
//               session and posts the reply back to the room.
//   TinyFish  → scout.priceCheck() via POST https://agent.tinyfish.ai/v1/automation/run
//   Moss      → catalog.complements() via MossClient.query("marigold-catalog", …)
//   ZooData   → inventory.lookup() (or merchant JSON for the demo)
//   Butlr     → occupancy.current() (demo: fixture JSON updated by a tiny script)
//   Gate      → WhatsApp (Twilio sandbox) or Band Desktop task → resolves promise
// ---------------------------------------------------------------------------
import type { Adapters } from "..";

export function createLiveAdapters(): Adapters {
  const required = ["BAND_API_KEY", "BAND_AGENT_ID", "ZOOWORK_API_KEY"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`live adapters: missing env ${missing.join(", ")}`);
  throw new Error("live adapters not implemented yet — see docs/CODEX_BRIEF.md");
}
