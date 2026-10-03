# Before you hand anything to Antigravity

*Do these in order. Budget ~45 minutes. Everything Antigravity will need is an env var in `.env.local`; collect them all first so it never stalls on "missing key." Items marked ⚠ came from docs I could fetch but not test — if the UI differs, follow the UI.*

## 0. Decisions to make first (5 min)

These change what Antigravity builds. Decide now, write the answer at the top of the brief.

1. **Shopper agent: Band platform agent or our own code?** *Recommended: Band platform agent* (configured in Band's dashboard with a system prompt: "You shop for Mia, budget $200, claim $219 elsewhere, counter twice, accept pickup ≤ $199"). Zero code, and it's visibly "someone else's agent." Our five store agents are ZooWork agents connected to Band via the SDK.
2. **Owner gate channel: WhatsApp (Twilio sandbox) or Band Desktop / the demo UI?** *Recommended for today: the demo UI's Approve button posts to Band as @bo, with Band Desktop as the second screen.* Twilio's WhatsApp sandbox is doable but is an extra account, an extra webhook, and a join-code dance on stage. Pitch it as "WhatsApp in production, here it's the owner's screen."
3. **TinyFish target: a page we host or a real retailer?** *Recommended: host a fake "North Beach Outfitters" product page on the same Vercel app (`/competitor/linen-jacket`) showing $229, size M sold out.* Real and reliable. Keep a recorded result as fallback.
4. **Payments: Stripe test mode or a simulated checkout event?** *Recommended: simulated `checkout.pay` tool that returns a fake authorization, labelled test mode.* Stripe test mode is a nice-to-have if time remains; it adds an account and a key.
5. **Build location: everything in the one Next.js repo.** API routes host the Band↔ZooWork bridge and the tool executors. One deploy, one URL. Fine for a demo; say "we'd split the bridge into a worker in production."

## 1. Accounts and keys (collect into `.env.local`)

| # | Platform | Where | What to grab | Env var(s) | Notes |
|---|---|---|---|---|---|
| 1 | **Band** | https://app.band.ai → Agents → New Agent → *Remote/External Agent* | Create **five** remote agents named `concierge`, `pricing-critic`, `inventory`, `scout`, `bundler` (slugs become `@<you>/concierge` etc.). Copy each **API key immediately** (shown once) and the **Agent ID** from settings. | `BAND_CONCIERGE_ID/KEY`, `BAND_CRITIC_ID/KEY`, `BAND_INVENTORY_ID/KEY`, `BAND_SCOUT_ID/KEY`, `BAND_BUNDLER_ID/KEY` | Also create one **platform agent** `muse-shopper` (dashboard: model + system prompt) for the shopper. Redeem Pro code `BANDSEP26`. Free tier allows 10 agents. Install Band Desktop (docs.band.ai/band-desktop) so you can watch the room on a second screen. |
| 2 | **ZooWork** | https://platform.zoowork.ai → sign in → API keys → Create | One project API key (`zwp_live_…`, shown once). Then Add funds → Other → 200 → promo code `PFDQ5YJ3` → checkout. | `ZOOWORK_API_KEY` | Agents start **stopped**; the code must call `startAgent`. Run `npx skills add SerendipityOneInc/zoowork-sdk-skills` in the repo so Antigravity has the SDK skill. Needs Node ≥ 22.20 (you have 22.23). |
| 3 | **ZooData** ⚠ | https://zoodata.ai → sign up | API key (`hms_live_…`), 1,000 free credits | `ZOODATA_API_KEY` | Optional. Used only for a "market benchmark" tool call. Skip if short on time; Inventory reads the merchant JSON regardless. |
| 4 | **TinyFish** | https://agent.tinyfish.ai/sign-up → API keys | API key ($8 free credit) | `TINYFISH_API_KEY` | One run ≈ 10–30 steps ≈ $0.16–$0.50. Plenty for the day. |
| 5 | **Moss** | https://portal.usemoss.dev | Project ID + Project key | `MOSS_PROJECT_ID`, `MOSS_PROJECT_KEY` | Free developer tier. Index gets created once by a seed script, then loaded in memory. |
| 6 | **Vercel** | https://vercel.com | Account linked to your GitHub; `npm i -g vercel`; `vercel login` | — | Deploy with `vercel --prod` from the repo. Add all env vars in the Vercel project settings too (not just `.env.local`). |
| 7 | **GitHub** | New repo `haggle` | Push the unzipped front end | — | Needed by Vercel and Entire. |
| 8 | **Entire** | https://entire.io → connect GitHub → mirror the `haggle` repo → New Trail | Trail titled "Haggle: live Band + ZooWork negotiation"; paste the Antigravity brief as the Trail description | — | **Create the Trail before Antigravity writes code**, then start Antigravity *from* the Trail (or paste the Trail URL into the first prompt: "Work on this trail: <URL>"). That's what makes Best-Use-of-Entire real. |
| 9 | **Novita** ⚠ | — | Nothing to sign up for if models come through ZooWork. | — | In ZooWork, `listModels()` → pick an open-weight model for the shopper sim if you want to say "runs on Novita"; otherwise drop the claim. |
| 10 | **Twilio WhatsApp sandbox** (optional) | https://console.twilio.com → Messaging → Try it out → WhatsApp | Account SID, Auth token, sandbox number; join from your phone | `TWILIO_SID`, `TWILIO_TOKEN`, `TWILIO_WA_FROM`, `OWNER_WA_TO` | Only if you chose WhatsApp in decision #2. |
| 11 | **Stripe** (optional) | https://dashboard.stripe.com → test mode → API keys | Secret test key | `STRIPE_SECRET_KEY` | Only if you chose Stripe in decision #4. Use `tok_visa`. |

`.env.local` template:

```
HAGGLE_MODE=live            # replay | live
NEXT_PUBLIC_SITE_URL=https://<your-vercel-url>

BAND_REST_URL=https://app.band.ai
BAND_WS_URL=wss://app.band.ai/api/v1/socket/websocket
BAND_OWNER_HANDLE=@<your-band-username>
BAND_CONCIERGE_ID=  BAND_CONCIERGE_KEY=
BAND_CRITIC_ID=     BAND_CRITIC_KEY=
BAND_INVENTORY_ID=  BAND_INVENTORY_KEY=
BAND_SCOUT_ID=      BAND_SCOUT_KEY=
BAND_BUNDLER_ID=    BAND_BUNDLER_KEY=
BAND_SHOPPER_HANDLE=@<your-band-username>/muse-shopper

ZOOWORK_API_KEY=
ZOODATA_API_KEY=           # optional
TINYFISH_API_KEY=
MOSS_PROJECT_ID=  MOSS_PROJECT_KEY=
COMPETITOR_URL=https://<your-vercel-url>/competitor/linen-jacket
```

## 2. Smoke-test each key before building (10 min)

Run these from your Mac terminal so you know every credential works *before* Antigravity touches them. (Replace values; these are assembled from docs — if one 404s, check the docs page named in `research/`.)

```bash
# Band — should return your agent's profile
curl -s -H "X-API-Key: $BAND_CONCIERGE_KEY" https://app.band.ai/api/v1/agent/me | head -c 300

# ZooWork — should list models
npx -y tsx -e "import {createZooworkClient} from '@zoowork-ai/sdk'; const zc=createZooworkClient({apiKey:process.env.ZOOWORK_API_KEY}); console.log((await zc.listModels()).map(m=>m.model))"

# TinyFish — wallet status
npx -y @tiny-fish/cli wallet status

# Moss — portal shows project; nothing to curl. Seed script will verify.
```

## 3. Things to prepare that aren't keys (10 min)

- **Merchant data file.** `data/marigold-inventory.json` with 6–8 SKUs (jacket, scarf, tote, buttons, two ceramics, a candle): sku, name, list, cost, onHand, daysOnShelf, weeklyVelocity, tags. Antigravity will seed Moss from this and Inventory will read it. I can generate this file for you — say the word.
- **Store policy text.** Three sentences: target margin 45%, aging discount after 40 days, pickup incentive when occupancy < 35%, below-floor needs owner approval. This becomes the Pricing Critic's instructions and a RAG-able policy doc.
- **Occupancy fixture.** `data/occupancy.json` → `{ "sales-floor": { "occupancyPct": 23, "trend": "falling" } }`. On stage you can edit this live to show the floor moving (nice beat: raise it to 80% and watch the pickup discount vanish).
- **Band room naming.** Decide the room title pattern: `Deal Room #<4 hex>` — the UI already assumes `#7F3A` for the fixture; live rooms get a fresh ID.
- **Second screen.** Band Desktop open to the room, so judges can see the "real" Band view next to our UI.
- **Phone.** If WhatsApp is in, join the Twilio sandbox from your phone *before* 4 pm.

## 4. What to tell Antigravity about the existing code (so it doesn't rewrite it)

- The UI is done and must not change visually. The seam is `src/lib/adapters/index.ts`. Implement `src/lib/adapters/live/` to satisfy those interfaces; `getAdapters()` already falls back to replay when env is missing.
- The event model is `src/lib/types.ts` (`DealEvent`). Live Band messages must be mapped into it — see the mapping table that will be in the brief.
- The fixture `src/lib/fixtures/deal-7f3a.ts` is the *target negotiation*. The live system should produce the same beats (knock → verify → floor → offer → bundle → pickup → gate → close). Prompts should steer toward it; the shopper platform agent's prompt should make it counter twice and accept pickup ≤ $199.
- `research/*.md` contains the sponsor API notes with UNCONFIRMED flags; Antigravity should read those before touching an SDK and verify against the live docs.

## 5. Timeline reality check

It's a 5 pm deadline. Rough order for Antigravity, each independently demo-able:

1. Band bridge for one agent (Concierge) posting to a room + mapping to `DealEvent` → UI shows a real `LIVE · Band` badge. *(biggest unlock; do first)*
2. ZooWork agents behind Concierge + Critic with the floor logic as a custom tool.
3. TinyFish Scout against the hosted competitor page.
4. Moss seed + Bundler.
5. Owner gate via UI button → Band message as @bo.
6. Inventory/Occupancy from JSON; ZooData benchmark call if time.
7. Deploy, `HAGGLE_MODE=live` on Vercel, record a backup video of a successful live run.

If only step 1 lands, you still have a live Band room on stage with a replayed negotiation inside it — that's a credible Band submission.
