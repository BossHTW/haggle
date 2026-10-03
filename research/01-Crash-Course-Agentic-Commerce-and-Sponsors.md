# Crash course: agentic commerce, and every platform Haggle touches

*Internal. Written for a builder with zero e-commerce background who needs to speak confidently to judges in a few hours. Read top to bottom once (~20 min), then use the "If a judge asks…" boxes as a cheat sheet.*

---

## Part 1 — How a sale actually works today (the 5-minute version)

A retail sale, online or in a store, is a chain of five decisions. Each one is a place money leaks out.

1. **Discovery** — the shopper finds the product. Historically: search, ads, a marketplace like Amazon, walking past the window. Merchants pay a lot for this (ads, marketplace fees of 8–15%+).
2. **Evaluation** — the shopper compares price, availability, shipping time, reviews, and alternatives. This is where "I saw it cheaper elsewhere" lives.
3. **Offer** — the merchant's price and terms. Most merchants have one list price and maybe a coupon. Almost none negotiate per-shopper, because a human can't do it at scale.
4. **Decision / checkout** — payment is authorized (the card is reserved, not yet charged), an order is created, inventory is reserved.
5. **Fulfillment** — ship, or pick up in store. Pickup is quietly valuable to merchants: no shipping cost, and a body in the store who might buy something else.

Three numbers every merchant watches, and the vocabulary you'll hear:

- **List price vs. cost vs. margin.** Our jacket is list $248, cost $110. Margin is `(price − cost) / price`. At $248 that's 55.6%; at $195 it's 43.6%. A boutique's blended margin is often 40–55%; below ~35% a sale usually isn't worth it after overhead.
- **Inventory aging / velocity.** "48 days on shelf, 0.4 units per week" means this SKU is slow. Cash is tied up in it. Every merchant would rather sell aging stock at a smaller margin than hold it another month and eventually clear it at 50% off. This is why Haggle's floor *drops* for old stock — it's not a gimmick, it's exactly how a good store manager thinks.
- **Conversion.** Of the people (or agents) who evaluate, how many buy. Raising conversion without cutting price is the whole game.

**P&L vocabulary from the keynote.** The organizers framed every merchant agent as moving one of three lines: *Revenue* (sell more), *Efficiency* (same work, fewer hours), *Risk* (lose less to fraud, returns, bots). Haggle is a **Revenue** play with a margin guardrail. When you say "we target the revenue line," you mean: more completed sales from traffic the merchant already has, at a protected margin.

### What changed in September 2026 (why this hackathon exists)

Until now, the shopper was a human on a website. Now the shopper is increasingly an **agent**: Meta Muse (launched Sep 8, #1 app by Sep 18), OpenAI Dots (Sep 29). These agents browse, compare and check out on the shopper's behalf, 24/7. Two consequences:

- **Discovery and evaluation collapse into a filter.** A human with a $200 budget might still click into a $248 jacket. An agent with a $200 budget *filters it out in milliseconds* and never talks to anyone. The merchant never gets the chance to say "pick it up today and it's $199."
- **Merchants need something on their side of the conversation.** The keynote's line: "shoppers now arrive as agents, around the clock, and most merchants have nothing to answer with." A merchant agent needs to recognize a shopper agent, decide whether to trust it, talk to it in a structured way, and know when to pull in a human.

That's the gap Haggle fills: it's the **merchant's counter-agent**. Amazon's response to Muse was to block it. Our thesis is that an independent merchant can't afford to block the shopper — they need to *negotiate* with it.

> **If a judge asks "why would a shopper's agent even talk to you?"**
> Because its principal wants the jacket and the agent's job is to get the best deal. A Muse-style agent that refuses to negotiate is worse at its job than one that does. Band gives both sides a safe, consented way to do that: the shopper agent sends a contact request, the store accepts under policy, and both owners can see and revoke everything.

---

## Part 2 — The Haggle flow, step by step, in commerce terms

Keep this mental model; every platform below plugs into one step.

| Step | What happens in commerce terms | Who does it | Platform |
|---|---|---|---|
| **Knock** | A shopper agent shows intent to buy and asks for a price. | `@mia/muse-shopper` → `@marigold/concierge` | Band contact request |
| **Admit** | Store checks this is a real buyer's agent (signed intent + tokenized payment method) and opens a private deal room. | Concierge | Band room; store policy |
| **Verify** | "I saw it for $219 elsewhere" — is that true? Check the competitor's live page. | `@marigold/scout` | TinyFish |
| **Look up** | How many do we have, how old is the stock, what pairs with it? | `@marigold/inventory` | ZooData / merchant DB + Moss |
| **Set the floor** | Lowest acceptable price, from cost, target margin, aging, and how busy the store is *right now*. | `@marigold/pricing-critic` | Business logic + Butlr occupancy |
| **Negotiate** | Price-match, bundle, pickup incentive. Stay above the floor. | Concierge, `@marigold/bundler` | Band @mentions |
| **Escalate** | Offer is $3 below the floor. Ask the human. | Critic → `@bo` | WhatsApp / Band Desktop gate |
| **Close** | Payment authorized in test mode, order created, room log exported. | Shopper agent + system | Stripe test mode; Band log |

Two patterns in there that Band's own slides named, and that you should name back to them:

- **Critic overlay.** The Pricing Critic sees every message (it's in the room) but only *acts* when @mentioned or when a rule trips. That's how a good critic works: watches everything, speaks rarely, has veto power.
- **Human gate.** The owner is never in the loop for routine deals and *always* in the loop for below-floor ones. One tap, on the phone they already have.

---

## Part 3 — The platforms, one at a time

For each: what it is in one sentence, how it works mechanically, what we use it for, and what to say if asked. Items marked ⚠ are things I could not confirm from the docs; treat them as "verify before claiming."

### 3.1 Band (band.ai) — the negotiation table

**One sentence.** Band is a chat platform where the participants are AI agents (and humans), with rules for who can talk to whom.

**Mental model.** Think Slack, but every "user" might be an agent running on someone else's computer, and the platform enforces etiquette:

- **Rooms.** A conversation with participants. Humans see everything. Agents only *receive* messages where they are **@mentioned**. So in our room, Concierge can say "@marigold/scout verify this" and only Scout wakes up — everyone else still sees it in the log.
- **Handles.** Every agent has a stable handle like `@marigold/concierge` (owner/agent-slug). Not a UUID. You can address it the way you'd address a colleague.
- **Contact requests (cross-boundary consent).** Agents owned by the *same* person or org can talk freely. Agents owned by *different* orgs need a contact request that both sides approve (PENDING → APPROVED/REJECTED/EXPIRED). Either side can revoke instantly. This is the mechanism that makes "a stranger's shopping agent talks to my store" safe. **In Haggle this is the knock.**
- **The room is the record.** Every message, tool call, and "thought" lands in the room as a typed, timestamped event (`text`, `tool_call`, `tool_result`, `thought`, `error`, `task`). Band's own slide: "the room log doubles as the audit trail a merchant would ask for." ⚠ I found no dedicated *replay API*; the durable room history is what we export. Say "auditable room log," not "replay API."

**How an agent connects.** Two ways:
1. **Remote agent via SDK.** You register a "Remote Agent" at app.band.ai/agents, get an agent ID + API key (shown once), and run your own process that connects over WebSocket and posts over REST. Python: `pip install "band-sdk[anthropic]"`, TypeScript: `npm install @band-ai/sdk`. The SDK calls your "adapter" whenever your agent is @mentioned; your adapter can call an LLM and then use Band tools like `band_send_message`, `band_add_participant`, `band_create_chatroom`, `band_lookup_peers`.
2. **Platform agent.** Configured in Band's dashboard (model + system prompt + tools), hosted by Band. Faster to set up, less control. Fine for the simulated shopper agent if we're short on time.

**What we use it for.** Everything coordination-shaped: the contact request, the room, @mention routing between our five store agents, the critic's veto, the owner's approval, and the exported log.

> **If a judge asks "couldn't you do this with plain API calls between your own services?"**
> For five agents I own, yes. For a *shopper's* agent I don't own, no — I need discovery, consent, a shared channel both sides trust, and a log both sides can see. Band gives all four. Remove Band and the shopper agent has no door to knock on. (That's their own judging line: "make Band essential; remove it and coordination breaks.")

**Hackathon details.** Hacker guide: band.ai/hacker-guide. Free tier: up to 10 registered agents. Promo code for 3 months Pro: `BANDSEP26`. Band's DevRel (Ofer Mendelevitch) was presenting — he's your mentor target.

### 3.2 ZooWork (zoowork.ai) — where our agents live

**One sentence.** ZooWork hosts AI agents for you: you define an agent (model, instructions, tools), and ZooWork runs it in an always-on, isolated sandbox you never have to babysit.

**Mental model.** Three nouns, straight from their deck:
- **Agent** = the configuration (model, instructions/persona docs, allowed tools, MCP servers, custom tools). Define once, reuse.
- **Session** = one conversation with that agent (one per shopper, one per room).
- **Events** = what streams back: assistant messages, tool activity, `run.finished`. You render these or forward them.

**How it works mechanically (TypeScript).** `npm install @zoowork-ai/sdk`. Create a client with your API key → `listModels()` → `createAgent({resource:{name, model:{primary}}})` → `startAgent()` (agents start *stopped*) → `createSession(agentId, {initial_events:[{type:'user.message', content}]})` → `for await (ev of streamEvents(agentId, sessionId))`, break on `isRunFinished(ev)`. Every call is a normal HTTPS request, so the SDK works from any Node backend (including a Next.js API route or a small worker).

**Tools an agent can reach.**
- Nine built-in tools (read/write/edit files, exec, web_fetch, web_search, …), controllable with a `tool_policy` allow/deny list.
- **Custom tools** (up to 32): you describe a tool with a JSON schema; when the agent calls it, the session *pauses* and your backend executes it and posts the result back. This is how TinyFish, Moss, ZooData and Butlr get wired in — **our backend is the hands; ZooWork is the brain.**
- **MCP servers** (up to 16, public + unauthenticated only). Band has an MCP server (`band-mcp`); ⚠ whether it's usable unauthenticated from ZooWork is unconfirmed, so plan on the custom-tool route for Band too.

**Why each store agent is a ZooWork agent.** It's the organizers' stated bar: "would a merchant pay for it, and could they run it Monday?" Hosting on ZooWork is the "run it Monday" half. It also makes the architecture slide honest: five agent definitions, five sandboxes, one Band room.

**Money.** Prepaid credits; redeem $200 with code `PFDQ5YJ3` (Add funds → Other → 200 → Add promotion code). Open-source models are "sponsored by Novita" per the deck. ⚠ I couldn't confirm which models in `listModels()` are Novita-served; just call `listModels()` and pick an open-weight one for the shopper agent.

**ZooData (zoodata.ai).** A *separate* commerce data product from the same company: Amazon and TikTok Shop product/market/competitor/review data over a REST API (`POST https://api.zoodata.ai/openapi/v2/...`, Bearer key, 1,000 free credits). For Haggle it's the honest answer to "where does market data come from," and a good source for the competitor benchmark. Our own store's inventory (7 on hand, 48 days) is the merchant's data, not ZooData's — in the demo that's a JSON file standing in for a POS export. Don't claim ZooData knows Marigold & Pine's shelf.

> **If a judge asks "what does ZooWork give you that a cron job and an OpenAI key don't?"**
> Isolation per agent, always-on sessions with state, event streaming I can render, a tool-policy layer, and a hosting story a non-technical merchant can actually buy. Plus: it's where the organizers want to see agents run.

### 3.3 TinyFish (tinyfish.ai) — eyes and hands on the open web

**One sentence.** TinyFish runs a browser for your agent: you give it a URL and a plain-English goal, it drives the page and returns JSON.

**How it works.** `POST https://agent.tinyfish.ai/v1/automation/run` with `{url, goal, output_schema}` and header `X-API-Key`. It returns a run with a `result` shaped like your schema. There are async (`/run-async` + poll) and streaming (`/run-sse`) variants. SDKs: `pip install tinyfish`, `npm i @tiny-fish/sdk`. Pricing is per step (~$0.016); $8 free credit on signup.

**What we use it for.** Scout's one job: *is the shopper's "$219 elsewhere" claim true?* TinyFish opens the competitor page and returns `{price: 229, inStockM: false}`. That single fact changes the negotiation (we price-match reality, not a bluff) and it is visibly "real" on stage.

**Demo risk.** Live scraping can be slow (10–40 s) or blocked. We run it against a page we control (a fake "North Beach Outfitters" product page we host on Vercel) so it's reliable, and we keep a recorded result as fallback. Say so if asked — judges respect it.

### 3.4 Moss (moss.dev) — instant catalog memory

**One sentence.** Moss is a search engine that runs *inside your process* (Node, browser, or on-device) and answers semantic + keyword queries in a few milliseconds instead of a few hundred.

**How it works.** You build an index in Moss's cloud (`createIndex(name, docs, {modelId:'moss-minilm'})`), then `loadIndex(name)` pulls it into memory locally, and `query(name, text, {topK, alpha})` runs with no network round-trip. `alpha` blends semantic (1.0) and keyword/BM25 (0.0); default 0.8; lower it when matching SKUs or exact names. Packages: `npm install @moss-js/moss` (Node), `@moss-dev/moss-web` (browser WASM), `pip install moss`. Credentials: project ID + project key from portal.usemoss.dev.

**Why latency matters to us.** The Bundler has to propose a complement *inside* a live negotiation. "Jacket + linen scarf" has to appear in the same breath as the counter-offer, not three seconds later. Moss turns "search the catalog for things that go with a linen jacket" into a 4 ms call. On the architecture slide it's "sub-10 ms bundle retrieval."

### 3.5 Butlr — the physical-world signal (your home turf)

**One sentence.** Butlr's thermal sensors count people in a space anonymously, in real time, without cameras.

**Why it's in the room.** It gives the Pricing Critic one input no pure-software competitor has: *how busy is the sales floor right now?* At 23% occupancy on a Saturday afternoon, a $7 pickup incentive that puts a shopper in the store is worth more than $7. At 90% occupancy, hold the price. This is the "surprise and delight" X-factor and the thing you can speak to with real authority. In the demo it's a fixture (a JSON value we can change live to show the floor moving); in production it would be the Butlr API.

### 3.6 Novita AI — the shopper's brain

**One sentence.** Novita provides inference for open-source models (and GPU compute). At this event they sponsor the open-source models available inside ZooWork.

**What we use it for.** The simulated shopper agent (`@mia/muse-shopper`) runs on an open-weight model so the two sides are visibly *different* AIs. It's a small detail that makes the "two agents bargaining" story feel real. ⚠ Verify which model in ZooWork's `listModels()` is Novita-served before saying "runs on Novita."

### 3.7 Entire (entire.io) — provenance for the build

**One sentence.** Entire is a Git forge that attaches the *entire agent session* — prompts, tool calls, reasoning — to every commit, grouped into "Trails."

**How it works.** Your repo stays on GitHub; Entire mirrors it. You create a **Trail** (title + intent = the spec), point your coding agent at it, and every commit the agent makes attaches to the Trail with the full session. Runners and Gates can run checks on each commit. `entire trail resume <id>` picks the work back up with context intact.

**What we use it for.** Two things: a near-free shot at "Best Use of Entire" (the whole Antigravity build happens on a Trail), and a genuine story for judges — "you can read exactly why every line of the pricing floor exists." Create the Trail *before* Antigravity starts writing code.

---

## Part 4 — How the money and trust pieces work (so you're not caught out)

- **Payment authorization vs. capture.** When the shopper agent "pays," the card is *authorized* (funds reserved) and the merchant *captures* later (at pickup, or on shipment). In the demo we use Stripe **test mode** with the `tok_visa` test token — real API shape, no real money. Say "test-mode payment, real flow."
- **Tokenized payment method.** The shopper agent never shows a card number; it shows a token that proves a payment method exists. That's one of the two things Concierge checks before admitting an agent (the other is a signed statement of intent from the shopper). This is how "is this a real buyer or a scraper bot?" gets answered cheaply.
- **Consent / privacy.** The shopper's agent shares only what the negotiation needs (budget, size, a competitor claim). The merchant's internal chatter — margin, cost, floor — stays on the merchant's side of the room. In the UI, Mia's phone only ever shows messages that crossed the boundary. That asymmetry is deliberate; point at it.
- **Price discrimination worry.** A judge may ask "isn't per-shopper pricing unfair?" Answer: Haggle never goes *above* list; it only decides how far *below* list to go, using the merchant's own inventory and traffic — the same logic a store manager applies when they say "I can do $199 if you take it today." The floor is the merchant's rule, not the agent's whim.

---

## Part 5 — Glossary you can say out loud

- **Shopper agent** — an AI acting for a consumer (Muse, Dots). *Principal* = the human it works for.
- **Merchant agent / counter-agent** — an AI acting for the store. Haggle is a *team* of these in one room.
- **Deal Room** — a Band room opened for one negotiation. Trip-wire: it's created when a contact request arrives.
- **@mention routing** — only the agent you name does work; everyone in the room can read it.
- **Contact request / cross-boundary** — consent handshake between agents with different owners.
- **Floor** — the lowest price the Critic will allow without a human. Two floors here: shipped ($200) and pickup-today ($192).
- **Human gate** — the owner's one-tap approve/decline, only for below-floor deals.
- **Aging stock / days on shelf** — how long inventory has sat. Older → lower floor.
- **Occupancy** — percent of the sales floor's capacity currently occupied (Butlr). Quieter → pickup incentives unlock.
- **Bundle** — adding a high-margin item instead of cutting price. Protects margin, raises basket size.
- **Audit log / room log** — the exported record of every message and tool call in the room.
- **LIVE / REPLAY** — our demo switch: real Band/ZooWork/TinyFish calls, or a recorded run with the same timing.

---

## Part 6 — Ten-second answers for the gallery walk

- *"What is it?"* — The merchant's counter-agent. A shopper's AI walks in; our room of agents negotiates back, protects the margin, and closes the sale in under a minute.
- *"Why Band?"* — Two different owners' agents need a consented door, a shared table, and a shared log. Band is all three.
- *"Why ZooWork?"* — Each store agent runs there, in its own sandbox, always on. A merchant could run this Monday.
- *"What's real?"* — The negotiation logic, the Band room, the ZooWork agents, the TinyFish price check, Moss retrieval. Payments are test-mode and the merchant is fictional — by design.
- *"What's the P&L?"* — Revenue. $0 → $195 on a visit that would have bounced, 43.6% margin held, 48-day stock cleared, and a shopper walked into a quiet store.
- *"What's the Butlr thing?"* — Live floor occupancy as a pricing input. Quiet store → better pickup deal. Nobody else in the room has a physical signal.
