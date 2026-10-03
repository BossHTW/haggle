# Haggle — Build Brief for Google Antigravity

*You are implementing the LIVE backend for Haggle, a hackathon project due today at 5:00 PM PT. The front end, the replay fixture, the brand, and the adapter seam are done. Your job is to make the same negotiation happen for real across Band, ZooWork, TinyFish and Moss, without changing how the UI looks. Read this whole file before writing code. Then read `research/*.md` (sponsor API notes — anything marked UNCONFIRMED there you must verify against the live docs before relying on it).*

---

## 0. Decisions already made (do not relitigate)

| Topic | Decision |
|---|---|
| Owners | Store agents live on Band account **@bosshtw** (5 remote agents). Shopper agent **@bo0/muse-shopper** lives on a *second* Band account so the contact request is a real cross-owner handshake. All six are *remote* Band agents; **our bridge process runs all six brains** (the shopper's on an open-weight model so it is visibly a different AI). |
| Where things run | **Live demo runs on the laptop**: `npm run dev` (Next UI) + `npm run bridge` (Node worker). Vercel hosts the public replay demo and the fake competitor page. Don't try to run Band WebSockets inside Vercel serverless. |
| Brains | Each store agent's reasoning is a **ZooWork managed agent** (one Agent definition each, one Session per Deal Room). Tools the agents need (TinyFish, Moss, inventory JSON, occupancy JSON, Band send) are **ZooWork custom tools executed by our bridge**. |
| Owner gate | The demo UI's **Approve/Decline** buttons post as `@bo` into the Band room (REST, Human API if available, else the Concierge posts "owner approved" with a `gate.approved` event). Band Desktop is the second screen. WhatsApp is **out of scope** today; mention it as production path only. |
| Payments | Simulated `checkout.pay` custom tool returning a fake authorization, labelled `Stripe(test)`. No Stripe account. |
| Competitor page | We host it: `/competitor/linen-jacket` in this Next app, showing "Linen Field Jacket — $229 — Size M: Sold out". TinyFish scrapes **our** page. |
| Fallback | Every live call has a recorded fallback; `HAGGLE_MODE=replay` must keep working untouched. The UI badge must truthfully show `Live · Band` or `Replay`. |
| Don't touch | `src/app/**`, `src/components/**`, `src/lib/types.ts`, `src/lib/fixtures/**`, `brand/**`. If you truly need a UI change, make it the smallest possible and say so in the commit. |

## 1. What already exists (read these files first)

- `src/lib/types.ts` — the **DealEvent** model. Live must emit exactly these shapes.
- `src/lib/fixtures/deal-7f3a.ts` — the **target negotiation**, beat by beat. Live should reproduce these beats (knock → verify → floor → offer → bundle → pickup → gate → close). Prompts must steer toward it.
- `src/lib/adapters/index.ts` — the seam: `DealEventSource`, `WebScout`, `CatalogSearch`, `InventorySource`, `OccupancySource`, `OwnerGate`, and `getAdapters()` which already falls back to replay if `./live` throws.
- `src/lib/adapters/live/index.ts` — stub; you fill this in.
- `src/app/api/deal/[id]/stream/route.ts` — SSE route the UI consumes. Works for replay; for live it must proxy the bridge.
- `data/marigold-inventory.json` — merchant SKUs + pricing policy text. `data/occupancy.json` — Butlr fixture. `data/competitor.json`. `data/shopper-mia.json`.
- `research/band.md`, `research/zoowork.md`, `research/tinyfish.md`, `research/moss.md`.
- `.env.local` — all credentials (see §6). Never commit it; never print it.

## 2. Target architecture

```
                 Band (app.band.ai)
  @bo0/muse-shopper  ──contact request──▶  @bosshtw/concierge
         │                                     │  @mentions
         │            Deal Room #XXXX           ├─▶ @bosshtw/scout
         └──────────── messages ───────────────┼─▶ @bosshtw/inventory
                                               ├─▶ @bosshtw/pricing-critic
                                               └─▶ @bosshtw/bundler
                              ▲ WebSocket per agent (Band TS SDK, GenericAdapter)
                              │
   bridge/ (Node, tsx) ───────┘
   ├─ 6 Band agent runtimes (one per API key)
   ├─ per-agent "brain": ZooWork session (createSession / streamEvents)
   ├─ tool executors: tinyfish.priceCheck, moss.complements, inventory.lookup,
   │                  occupancy.current, checkout.pay, band.sendMessage
   ├─ DealEvent mapper: Band message/event ─▶ DealEvent
   └─ local SSE: GET http://localhost:4100/rooms/:id/events   (+ GET /rooms, POST /rooms/:id/gate)
                              ▲
   Next.js (localhost:3000) ──┘  live adapter proxies the bridge SSE to the UI
```

Why this shape: Band only delivers inbound messages over WebSocket (no webhooks), so something long-running must hold six sockets — that is the bridge. ZooWork is request/stream over HTTPS, so each Band mention becomes one ZooWork turn. The UI never talks to Band or ZooWork directly.

## 3. Band → DealEvent mapping (implement in `bridge/src/mapper.ts`)

| Band inbound | DealEvent.kind | Notes |
|---|---|---|
| `ContactRequestReceivedEvent` on concierge | `contact.request` | `from` = shopper handle. Auto-approve under policy (CALLBACK strategy) → emit `contact.approved` from concierge. |
| Room created / concierge joins participants | `room.created` | Include participant list in `text`. Carry `pnl: {status:"open", listPriceUSD, costUSD}`. |
| `text` message | `message` | Parse `@handles` into `mentions[]`. If the text contains a JSON block `{"offer":{…}}` (we instruct agents to append one), set kind `offer` (from store) or `counter` (from shopper) and fill `offer`. |
| `thought` event | `thought` | Store agents emit thoughts via `band_send_event`; forward verbatim (short). |
| `tool_call` event | `tool_call` | `toolCall.tool` and `sponsor` from our executor registry (see §4.3). |
| `tool_result` event | `tool_result` | `toolResult` = executor output (truncate large payloads). |
| Critic message containing `FLOOR:` JSON | `floor.update` | Critic posts `FLOOR {"shipUSD":…,"pickupUSD":…,"rationale":[…],"inputs":{…}}`. |
| Critic message containing `GATE:` | `gate.request` | Also POST to local `/rooms/:id/gate` queue so the UI shows the WhatsApp-style card. |
| `@bo` message "approve"/"decline" | `gate.approved` / `gate.rejected` | Comes from UI button → bridge → Band. |
| `checkout.pay` tool result | `order.created` | `pnl: {agreedPriceUSD, marginPct, fulfillment, daysOnShelfCleared, status:"closed"}` |
| Concierge final message after order | `deal.closed` | Compute elapsed seconds; include the "without Haggle" line. |

`t` = ms since `room.created`. `id` = Band message id or `${roomId}:${seq}`. `bandRef` = Band message id.

## 4. Build tasks, in order (each is independently demo-able — stop at 4:30 PM wherever you are)

### Task 1 — Bridge skeleton + Concierge on Band + LIVE badge (do this first; biggest unlock)
- `bridge/` with `package.json` (`tsx`, `@band-ai/sdk`, `@zoowork-ai/sdk`, `express` or `hono`), `npm run bridge` at repo root runs it.
- Connect **only Concierge** with `Agent.create({ adapter: new GenericAdapter(...), config: { agentId: BAND_CONCIERGE_ID, apiKey: BAND_CONCIERGE_KEY } })` (the exact TS config shape is UNCONFIRMED in research — read `node_modules/@band-ai/sdk` README/types first). On any inbound message: log it, map to DealEvent, publish on the in-memory bus, echo a reply with `tools.sendMessage`.
- Local SSE server on `:4100`: `GET /rooms` (active rooms), `GET /rooms/:id/events` (replays buffered events then streams), `POST /rooms/:id/gate {decision}`.
- Implement `src/lib/adapters/live/index.ts` `events.stream(id)` = fetch bridge SSE and yield DealEvents; `scenario(id)` = build a `DealScenario` from `data/*.json` + the agent roster (copy `agents` from the fixture, it already has the right handles). `getAdapters()` must return mode `"live"` when `HAGGLE_MODE=live` and the bridge is reachable; otherwise fall back to replay **and log why**.
- **Acceptance:** with `HAGGLE_MODE=live`, `/demo` shows the `Live · Band` badge and a message typed by a human in the Band room (Band web UI) appears in the Deal Room pane within ~1 s.

### Task 2 — ZooWork brains for Concierge + Pricing Critic, floor as a tool
- Create two ZooWork agents (idempotently: look up by name before creating; persist IDs in `bridge/.zoowork-agents.json`, git-ignored). Persona/instructions in `bridge/prompts/concierge.md` and `pricing-critic.md` (write them; see §5). Pick model via `listModels()`; a Claude model for store agents is fine.
- Custom tools registered on the agents and executed in the bridge: `compute_floor(sku)` (pure function over `data/marigold-inventory.json` + `data/occupancy.json`: base = cost/(1−targetMargin) rounded; pickup = base − pickupIncentive if occupancy < threshold and daysOnShelf > agingDiscountAfterDays), `band_send(text)` (optional if the adapter already returns text to the room), `emit_thought(text)`.
- Concierge flow: on shopper message → ZooWork turn → reply to room, @mentioning the specialists it needs. Critic: when @mentioned, call `compute_floor`, post `FLOOR {...}` JSON + one-line rationale; on every subsequent `offer` below floor, post `GATE:` and block.
- **Acceptance:** shopper message in Band → Concierge replies and @mentions critic → critic posts floor → UI floor card fills in (`$200 / $192`, occupancy 23%).

### Task 3 — Scout (TinyFish) + hosted competitor page
- Add `src/app/competitor/linen-jacket/page.tsx`: a plain static product page for "North Beach Outfitters", price **$229**, size selector with **M — Sold out**, S/L available. Server-render the price in the HTML (no client fetch) so scrapers see it.
- `scout.priceCheck(url, size)` → `POST https://agent.tinyfish.ai/v1/automation/run` with `X-API-Key`, body `{url, goal:"Return the product price in USD and whether size M is in stock", output_schema:{type:"object",properties:{price:{type:"number"},inStockM:{type:"boolean"}},required:["price","inStockM"]}, max_steps: 25}`. Timeout 45 s → fall back to `data/competitor.json` and mark `toolResult.fetchedAt = "fallback"`.
- Scout ZooWork agent with custom tool `price_check(url,size)`; it reports "Competitor is $229, not $219 — out of stock in M."
- **Acceptance:** tool_call card with `TinyFish` chip appears, then the result; merchant panel "competitor" cell shows `$229 · OOS`.

### Task 4 — Inventory + Bundler (Moss)
- `bridge/scripts/seed-moss.ts`: `MossClient(MOSS_PROJECT_ID, MOSS_PROJECT_KEY).createIndex("marigold-catalog", docs, {modelId:"moss-minilm"})` from `data/marigold-inventory.json` (one doc per SKU: `${name}. ${description}. tags: …`, metadata = sku/list/cost). Run once; idempotent (skip if index exists).
- `catalog.complements(sku, k)` → `loadIndex` once at bridge start, then `query("marigold-catalog", "<name> complement natural tones", {topK: k+1, alpha: 0.8})`, drop the SKU itself, report `latencyMs`.
- `inventory.lookup(sku)` from JSON. `occupancy.current()` from `data/occupancy.json` (re-read every call so you can edit it live on stage).
- Inventory agent: tools `inventory_lookup`, `catalog_complements`. Bundler agent: tool `catalog_complements`; proposes "jacket + scarf $236" keeping margin ≥ 45%.
- **Acceptance:** Moss chip with `latencyMs` single digits; bundle offer appears in both the room and Mia's phone.

### Task 5 — Shopper brain (@bo0/muse-shopper) + full run
- Sixth Band runtime with `BAND_SHOPPER_ID/KEY`. Brain = ZooWork agent on an **open-weight** model from `listModels()` (DeepSeek/Kimi/GLM/Llama — whatever is selectable; record which, we'll name it on stage). Prompt in `bridge/prompts/muse-shopper.md` from `data/shopper-mia.json`: budget $200, claims $219, counters at most twice, accepts ≤ $205 shipped or ≤ $199 pickup, appends `{"offer":{"priceUSD":…,"fulfillment":…}}` JSON to each counter, calls `checkout_pay` after a deal.
- `bridge/scripts/start-deal.ts`: the shopper runtime sends the contact request to `@bosshtw/concierge` (via Band contact tools / REST — verify endpoint), concierge auto-approves (CALLBACK strategy), creates the room with `band_create_chatroom` + `band_add_participant` for all six, posts `room.created`, and the shopper opens with the fixture's first line.
- `checkout_pay` tool: returns `{authorized:true, orderId:"MP-"+random, amount, mode:"test"}` → `order.created` + `deal.closed`.
- **Acceptance:** `npm run deal` runs the whole negotiation end-to-end in < 90 s with no human input except the owner gate.

### Task 6 — Owner gate wiring
- UI's Approve/Decline buttons already exist but are disabled in replay. In live mode they `POST /api/gate {roomId, decision}` → Next route → bridge `POST /rooms/:id/gate` → bridge posts into Band as `@bo` (Human API `POST /me/chats/{id}/messages` with the user's key **if** available; else Concierge posts "Owner @bo approved" and emits `gate.approved`). Smallest UI change allowed: enable the buttons when `mode === "live"`.
- Timeout 60 s → auto-decline, concierge offers the floor price instead.

### Task 7 — Hardening + deploy
- `npm run build` passes; `HAGGLE_MODE=replay` still perfect; `vercel --prod` deploys UI + competitor page (replay mode there).
- Record a successful live run to `src/lib/fixtures/deal-live-<id>.ts` via `bridge/scripts/export-fixture.ts` so the replay becomes a recording of reality.
- Update `README.md` run instructions. Commit small and often — every commit is an Entire checkpoint.

## 5. Prompt principles for the ZooWork agents (write the actual files)

- Each store prompt starts with the merchant policy text from `data/marigold-inventory.json.policy.text`, the agent's single job, who it may @mention, and the rule "never quote above list, never below floor without @bo".
- Every message ≤ 2 sentences. Address the shopper as "Mia's agent". Warm, candid, no exclamation marks (brand voice: `brand/BRAND.md` §8).
- Structured outputs are appended as a single JSON object on the last line (`{"offer":…}`, `FLOOR {…}`, `GATE {…}`) so the mapper never guesses.
- Concierge's playbook, in order: price-match the *verified* competitor price with a sweetener → bundle → pickup incentive → escalate. It must wait for Scout and Critic before the first offer.

## 6. Environment (`.env.local`, already filled; copy to `bridge/.env` or load from root)

`HAGGLE_MODE`, `BAND_REST_URL`, `BAND_WS_URL`, `BAND_OWNER_HANDLE=@bosshtw`, `BAND_{CONCIERGE,CRITIC,INVENTORY,SCOUT,BUNDLER,SHOPPER}_{ID,KEY}`, `BAND_SHOPPER_HANDLE=@bo0/muse-shopper`, `ZOOWORK_API_KEY`, `TINYFISH_API_KEY`, `MOSS_PROJECT_ID`, `MOSS_PROJECT_KEY`, `COMPETITOR_URL`, `NEXT_PUBLIC_SITE_URL`, `ZOODATA_API_KEY` (empty; optional), `BRIDGE_URL=http://localhost:4100` (add).

Smoke tests before coding: `curl -H "X-API-Key: $BAND_CONCIERGE_KEY" https://app.band.ai/api/v1/agent/me`; ZooWork `listModels()`; `npx -y @tiny-fish/cli wallet status`.

## 7. Demo run-sheet (what the human will do on stage)

1. Terminal A: `npm run bridge` (6 agents online; log shows each `@handle connected`). Terminal B: `HAGGLE_MODE=live npm run dev`. Browser: `localhost:3000/demo` → badge `Live · Band`. Band Desktop / app.band.ai open on second screen.
2. Terminal C: `npm run deal` → contact request → room opens → beats play out. Presenter narrates; at `GATE` clicks **Approve** in the UI.
3. Optional flourish: edit `data/occupancy.json` to `80` mid-negotiation and show the pickup floor disappear on the next critic update.
4. If anything stalls > 15 s: click **Replay deal** (UI switches to the recorded run; badge says `Replay`). Say so out loud.

## 8. Definition of done

`npm run deal` closes a deal live at least twice in a row; `/demo` shows it with the `Live · Band` badge; the Band room on app.band.ai shows the same messages; replay still works with the bridge off; Vercel deploy is green; commits are on Entire.
