<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Haggle — agent instructions (read before any work)

1. **Start with `docs/ANTIGRAVITY_BRIEF.md`.** It has the decisions, architecture, task order and acceptance criteria. Then read `research/*.md` for sponsor API notes (verify anything marked UNCONFIRMED against live docs).
2. **Do not change the UI** (`src/app/**`, `src/components/**`, `src/lib/types.ts`, `src/lib/fixtures/**`, `brand/**`) unless the brief explicitly allows it. The adapter seam is `src/lib/adapters/index.ts`; live code goes in `src/lib/adapters/live/` and `bridge/`.
3. **Secrets** live in `.env.local` (git-ignored). Never print, log or commit them.
4. **Replay must keep working.** `HAGGLE_MODE=replay npm run dev` → `/demo` plays the fixture. Run `npm run build` before each commit.
5. **Commit small and often** with descriptive messages — every commit is an Entire checkpoint with your session attached.
6. Brand voice for any copy the agents produce: `brand/BRAND.md` §8 (warm, candid, ≤ 2 sentences, no exclamation marks).
