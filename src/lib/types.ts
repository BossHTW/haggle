// ---------------------------------------------------------------------------
// Haggle — shared event model
// Every message in a Band room (text, tool_call, tool_result, thought, task)
// and every merchant-side state change is modeled as a DealEvent so the same
// stream can come from the replay fixture OR from live Band/ZooWork adapters.
// ---------------------------------------------------------------------------

export type AgentHandle =
  | "@mia/muse-shopper"
  | "@bosshtw/concierge"
  | "@bosshtw/pricing-critic"
  | "@bosshtw/inventory"
  | "@bosshtw/bundler"
  | "@bosshtw/scout"
  | "@bo" // human owner
  | "system";

export interface AgentProfile {
  handle: AgentHandle;
  name: string;
  role: string;
  owner: "mia" | "marigold" | "human" | "system";
  color: string; // tailwind-free hex so fixtures can carry it
  emoji: string;
  runtime: string; // where it runs: ZooWork sandbox, Meta Muse (simulated), Band Desktop…
}

export type EventKind =
  | "contact.request"
  | "contact.approved"
  | "room.created"
  | "message" // plain text in the room; mentions[] carries @handles addressed
  | "thought" // private reasoning surfaced as a Band 'thought' event
  | "tool_call"
  | "tool_result"
  | "offer" // structured price proposal
  | "counter" // structured counter-proposal
  | "floor.update" // pricing critic publishes a new floor
  | "gate.request" // owner approval requested (human gate)
  | "gate.approved"
  | "gate.rejected"
  | "deal.closed"
  | "deal.walked"
  | "order.created";

export interface Offer {
  priceUSD: number;
  fulfillment: "ship" | "pickup";
  items: string[]; // SKU ids
  note?: string;
  expiresInMin?: number;
}

export interface Floor {
  shipUSD: number;
  pickupUSD: number;
  rationale: string[];
  inputs: {
    costUSD: number;
    targetMargin: number; // 0..1
    daysOnShelf: number;
    weeklyVelocity: number;
    occupancyPct: number; // Butlr live floor occupancy 0..100
  };
}

export interface ToolCall {
  tool: string; // e.g. "tinyfish.run", "zoodata.inventory", "moss.query", "butlr.occupancy"
  sponsor: "Band" | "ZooWork" | "ZooData" | "TinyFish" | "Moss" | "Butlr" | "Stripe(test)";
  args: Record<string, unknown>;
}

export interface DealEvent {
  id: string;
  /** ms offset from room open — replay uses this for pacing */
  t: number;
  kind: EventKind;
  from: AgentHandle;
  mentions?: AgentHandle[];
  text?: string;
  offer?: Offer;
  floor?: Floor;
  toolCall?: ToolCall;
  toolResult?: Record<string, unknown>;
  /** present when the event affects the merchant P&L panel */
  pnl?: Partial<PnLSnapshot>;
  /** Band message id when live; fixture id when replay */
  bandRef?: string;
}

export interface PnLSnapshot {
  listPriceUSD: number;
  costUSD: number;
  agreedPriceUSD: number | null;
  marginPct: number | null;
  daysOnShelfCleared: number;
  fulfillment: "ship" | "pickup" | null;
  status: "open" | "closed" | "walked";
}

export interface DealScenario {
  id: string;
  title: string;
  merchant: { name: string; neighborhood: string; tagline: string };
  shopper: { name: string; agent: string; budgetUSD: number };
  product: {
    sku: string;
    name: string;
    listUSD: number;
    costUSD: number;
    size: string;
    daysOnShelf: number;
    onHand: number;
  };
  agents: AgentProfile[];
  events: DealEvent[];
}

export type Mode = "replay" | "live";
