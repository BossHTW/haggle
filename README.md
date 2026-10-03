# Haggle — the merchant's counter-agent

Built at The AI Commerce Gallery (AI Valley × ZooWork), Oct 3 2026.

## Run it
```bash
npm install
npm run dev        # http://localhost:3000  (landing)  ·  /demo  (Deal Room)
```
Runs in **replay** mode by default (fixture: `src/lib/fixtures/deal-7f3a.ts`).
Set `HAGGLE_MODE=live` once `src/lib/adapters/live/` is implemented.

## Where things are
- `src/app/page.tsx` — landing page
- `src/app/demo/page.tsx` — three-pane live demo (phone · Band room · merchant panel)
- `src/app/api/deal/[id]/stream/route.ts` — SSE stream of DealEvents
- `src/lib/types.ts` — the event model shared by replay and live
- `src/lib/adapters/` — the LIVE/REPLAY seam (`index.ts` interfaces, `replay/`, `live/` stub)
- `research/` — sponsor SDK notes (Band, ZooWork, TinyFish, Moss)

## Deploy
`vercel` from this directory. No env vars needed for replay mode.
