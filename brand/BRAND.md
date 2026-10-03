# Haggle — Brand House

*For any agent or human building Haggle surfaces (web app, deck, print, chat replies). The front end in `haggle-frontend.zip` already implements this; `tokens.json` and `haggle.css` are the machine-readable versions. When in doubt: warm, plain-spoken, confident, never slick.*

## 1. What Haggle is, in brand terms

Haggle is a **shopkeeper, not a trading desk.** It negotiates on behalf of a small merchant, so it should feel like a good store manager: friendly, quick, knows the stock, protects the business, and happily calls the owner over when it matters. The product's drama is two AIs bargaining in public — the brand's job is to make that feel *warm and legible*, not cold and algorithmic.

**Personality in five words:** warm · quick · candid · playful · grounded.
**Never:** corporate, "fintech dark," crypto-neon, cute-startup-pastel, or jargon-heavy.

**One-line positioning:** *The shopper has an agent. Now your store does too.*
**Descriptor (always this phrasing):** *the merchant's counter-agent.*

## 2. Name, mark, wordmark

- Product name is **Haggle**, capital H, never "HAGGLE" or "haggle" in prose. Verb use is welcome in copy ("go haggle with it").
- Mark: a rounded square in Marigold containing either the chat-bubble glyph (web) or a bold "H" (print/deck). Corner radius ≈ 30% of the square. Glyph is Ink, never white, on the Marigold square.
- Wordmark sits to the right of the mark, in the display serif at semibold, baseline-aligned, gap = 0.25× mark height.
- Clear space around the lockup = the mark's height on all sides. Minimum mark size 20 px / 6 mm.
- On dark backgrounds, mark stays Marigold with Ink glyph; wordmark becomes Cream.

## 3. Color

Philosophy: **cream paper, ink text, one marigold accent, one terracotta highlight.** Marigold carries the brand (CTAs, the Concierge, "core" labels). Terracotta is the emphasis color (the second line of the headline, the Pricing Critic, floors, warnings-that-aren't-errors). Everything else is supporting cast, mapped one-to-one onto agents so a viewer learns "blue = shopper, orange = store" in ten seconds.

### Core palette

| Token | Hex | Role |
|---|---|---|
| `cream` | `#FBF6EE` | Page background (light surfaces). Yes, cream — this is the brand, not a default. |
| `cream-2` | `#F3EBDD` | Secondary fills, chips, bubbles on cream |
| `paper` | `#FFFDF8` | Cards on cream |
| `ink` | `#1F1B16` | Primary text; dark backgrounds (cover, closing, the Band room section) |
| `ink-2` | `#4A433B` | Body text on cream, secondary text |
| `ink-3` | `#8A8178` | Muted labels, timestamps, captions |
| `line` | `#E6DCCB` | Hairlines, card borders |
| `marigold` | `#F2A33A` | Brand accent, primary CTA fill (with Ink text), Concierge |
| `marigold-2` | `#FFD58A` | Marigold tint: highlights, owner-gate card, store bubbles on the phone |
| `terracotta` | `#D96B4A` | Emphasis, Pricing Critic, floors, aging stock |

### Agent / sponsor colors (categorical)

| Token | Hex | Owner |
|---|---|---|
| `indigo` | `#5B6CF0` | Shopper side: Mia's Muse, Stripe(test). Tint `indigo-2` `#E4E7FF` |
| `marigold` | `#F2A33A` | Concierge |
| `terracotta` | `#D96B4A` | Pricing Critic, Butlr |
| `sage` | `#6E8B6B` | Inventory, ZooWork, ZooData. Tint `sage-2` `#DBE6D8` |
| `sky` | `#3F7D9C` | Scout, TinyFish |
| `plum` | `#9B6BB5` | Bundler, Moss |
| `ink` | `#1F1B16` | The human owner, Band itself |

### Semantic

| Token | Hex | Role |
|---|---|---|
| `success` | `#2F8F5B` | Approved, deal closed, LIVE badge |
| `danger` | `#C2402E` | Errors, rejected (rare; Haggle isn't a scary product) |
| `replay` | `#3F7D9C` (sky) | REPLAY badge |

### Dark surfaces

Dark surface = `ink` background. On it: text `cream`; muted text `cream` at 60–70% alpha; cards `#2B2620` with border `#3A342C`; a "why Band" callout uses `#3A2E14` fill with a marigold border. Never place `ink-2` text on `ink`.

### Rules

- Marigold is a *fill*, not a text color on cream (contrast fails). Marigold text is fine on Ink.
- Terracotta can be text on cream at ≥ 14 px.
- Don't gradient. Don't neon. Don't add a sixth accent; reuse an agent color.
- An element gets an agent color only if it *belongs* to that agent. Random decorative color is off-brand.

## 4. Typography

- **Display:** Fraunces (variable; `opsz` 144, `SOFT` 60, weights 400–800). Headlines, big numbers, stat callouts, the wordmark. Fallback stack: "Iowan Old Style", "Palatino Linotype", Georgia, serif. In PowerPoint/print where web fonts aren't available: **Cambria**.
- **Body/UI:** Inter 400/500/600/700. Fallback: system-ui. In PowerPoint: **Calibri**.
- **Mono:** JetBrains Mono. Used for @handles, tool names, SKUs, timestamps, badges. Fallback: ui-monospace / Courier New.

Scale (web): hero 56–72 px / 1.02; h2 30–36 px; h3 18–20 px; body 15–16 px / 1.6; small 12–13 px; mono labels 10–11 px. Tracking: display headlines −1%. Never letterspace body text. Headlines are sentence case, no trailing period, and may use a two-line "statement + consequence" with the second line in Terracotta.

## 5. Shape, space, elevation

- Radius: cards 20–24 px (`1.25–1.5rem`); chips/buttons pill (999 px); small chips 6–8 px; phone frame 2.2 rem with 6 px Ink bezel.
- Spacing grid: 4 px base; section padding 80 px desktop / 48 px mobile; card padding 20–24 px; 16 px gutters on phones.
- Elevation: one shadow only — `0 1px 0 rgba(31,27,22,.04), 0 8px 24px -12px rgba(31,27,22,.18)`. Hairline border `line` on every card. No glows.
- Texture: optional "grain" (6 px radial dot pattern at 6% ink, masked to fade) on hero sections only.

## 6. Signature elements (the motif)

The brand motif is **the chat bubble with an avatar dot.** It appears in the logo glyph, the hero preview, the Deal Room, the phone, and the deck's cover. Rules:
- Avatar: filled circle in the agent's color, emoji glyph inside (🛍️ 🌼 🧮 📦 🔭 🎁 👤). Size 24–32 px.
- Bubble: `paper` fill on cream, `#2B2620` on ink; top-left corner radius reduced (speech tail). Sender name in agent color, semibold; handle in mono `ink-3`.
- @mentions inside text are rendered as mono chips tinted with the mentioned agent's color at ~13% alpha.
- Tool calls are dashed-border cards with a sponsor chip (`TinyFish`, `Moss`, `ZooData`, `Butlr`, `Stripe(test)`) and the function name in mono.
- Structured offers are inset cards: big Fraunces price, `ship`/`pickup` chip (sky / terracotta), `offer`/`counter` chip (marigold / indigo).
- The owner gate is a WhatsApp-style notification card in `marigold-2` with a pulsing ring while pending, turning `success` once approved.
- Status badges: `LIVE · Band` (success, pulsing dot) and `REPLAY` (sky). Always visible in the demo header. Never hide which mode is running.

## 7. Motion

Subtle and quick. `pop-in` 320 ms cubic-bezier(.2,.8,.2,1) for new bubbles; typing dots between events; `count-up` 420 ms on numbers that change; `pulse-ring` 1.4 s on anything waiting for a human. Respect `prefers-reduced-motion`. No parallax, no confetti beyond a single 🎉 in the closing toast.

## 8. Voice and copy

- Plain English, short sentences, concrete numbers. "$212 shipped — or $199 if Mia picks it up before 6pm" beats "dynamic fulfillment-aware pricing."
- Warm toward the shopper, candid about the business. The Concierge never calls out a bluff rudely; it "anchors at the real price with a sweetener."
- Say what's real. Fictional merchant, test-mode payments, synthetic shopper: stated in footers, never hidden.
- Explain jargon in-line the first time it appears on a page ("a Band *Deal Room* — a shared chat where each agent only acts when @mentioned").
- Headline formula: *statement. consequence.* ("The shopper has an agent. Now your store does too." / "Pick a real merchant. Pick one line. Move it.")
- Avoid: "revolutionary," "seamless," "leverage," "AI-powered," exclamation marks, emoji in body copy (emoji live only in avatars and the 🎉 toast).

## 9. Accessibility

Body text contrast ≥ 4.5:1 (ink-2 on cream = 7.9:1; cream on ink = 15:1). Marigold is never a text color on cream. Every colored meaning has a text label too (chips say "pickup," badges say "REPLAY"). Focus rings: 2 px `sky`. Phone-width layouts: 16 px gutters, no horizontal scroll.

## 10. Do / Don't

**Do** keep cream as the page; use Ink sections for drama (cover, "meet the room," closing). **Don't** go dark everywhere.
**Do** color by agent. **Don't** color by whim.
**Do** show the LIVE/REPLAY badge. **Don't** pretend replay is live.
**Do** use Fraunces for numbers that matter ($195, 43.6%). **Don't** set body text in the serif.
**Do** one accent per surface. **Don't** stack marigold + terracotta + indigo in one component unless each is an agent.
