import Link from "next/link";
import Nav, { Logo } from "@/components/Nav";
import HeroPreview from "@/components/landing/HeroPreview";
import { agents } from "@/lib/fixtures/deal-7f3a";

const timeline = [
  { d: "Sep 8", t: "Meta launches Muse — a personal agent that browses, compares and checks out for you." },
  { d: "Sep 18", t: "Muse is the #1 free app in the US, ahead of ChatGPT." },
  { d: "Sep 22", t: "Amazon blocks it. The fight over who owns the shopper begins." },
  { d: "Sep 29", t: "OpenAI launches Dots: always-on agents with their own computers and 4,000+ apps." },
];

const primer = [
  { term: "Shopper agent", color: "#5B6CF0", def: "An AI that shops for a person — Meta Muse, OpenAI Dots. It has a budget, compares stores in milliseconds, and filters out anything over budget without talking to anyone." },
  { term: "Merchant agent", color: "#F2A33A", def: "An AI that works for the store. Haggle is a small team of them: one talks to the shopper, the others check facts, stock and price. Together they're the store's counter-agent." },
  { term: "Deal Room", color: "#1F1B16", def: "A shared chat on Band, opened for one negotiation. Each agent has a handle like @bosshtw/scout and acts only when @mentioned — but everyone in the room sees everything." },
  { term: "Floor", color: "#D96B4A", def: "The lowest price the store will accept without asking a human. Computed from cost, target margin, how long the item has sat, and how busy the shop floor is right now." },
  { term: "Human gate", color: "#6E8B6B", def: "The one moment a person is pulled in: an offer below the floor. The owner gets a ping, taps approve or decline, and the room carries on." },
  { term: "Audit log", color: "#3F7D9C", def: "Every message and tool call in the room is a timestamped event. Export it and you have the record a merchant would ask for." },
];

const steps = [
  {
    n: "01",
    title: "A shopper agent knocks",
    body: "Muse, Dots, or any agent sends a Band contact request to your store. Haggle checks signed intent and a tokenized payment method, then opens a Deal Room.",
    tag: "Band · contact request",
  },
  {
    n: "02",
    title: "Your room gets to work",
    body: "Concierge @mentions specialists: Scout verifies the competitor claim on the live web, Inventory pulls stock and aging, Pricing Critic sets a floor from margin, aging and how busy your floor is right now.",
    tag: "ZooWork · TinyFish · Moss · Butlr",
  },
  {
    n: "03",
    title: "Deal, bundle, or walk — your call",
    body: "Concierge negotiates above the floor on its own. Anything below pings you on WhatsApp. One tap. The whole room log is your audit trail.",
    tag: "Human gate · audit log",
  },
];

const stackItems = [
  { name: "Band", role: "The room: @mentions, cross-boundary consent, replayable audit log", essential: true },
  { name: "ZooWork", role: "Every store agent runs as a managed agent in its own sandbox" },
  { name: "TinyFish", role: "Scout verifies competitor prices on the live web" },
  { name: "Moss", role: "Sub-10 ms bundle retrieval over the catalog" },
  { name: "ZooData", role: "Inventory, velocity and market data" },
  { name: "Butlr", role: "Live floor occupancy as a pricing signal" },
  { name: "Novita", role: "Open models for the simulated shopper agent" },
  { name: "Entire", role: "Trails: every agent session attached to every commit" },
];

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        {/* HERO */}
        <section className="grain relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-16 md:grid-cols-[1.1fr_1fr] md:pt-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1 text-xs font-medium text-ink-2">
                <span className="h-1.5 w-1.5 rounded-full bg-marigold" /> Built at The AI Commerce Gallery · Oct 3, 2026
              </span>
              <h1 className="font-display mt-6 text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
                The shopper has an agent.
                <br />
                <span className="text-terracotta">Now your store does too.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
                Shoppers increasingly send an AI agent to buy for them — and it filters out anything over budget before a
                human ever sees it. Haggle is the store&apos;s answer: a small team of agents that meets the shopper&apos;s
                agent in a shared room, checks the facts, protects your margin, and closes the sale in seconds.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/demo"
                  className="rounded-full bg-marigold px-6 py-3 text-base font-semibold text-ink shadow-sm transition hover:brightness-95"
                >
                  Watch a live deal →
                </Link>
                <a href="#how" className="rounded-full border border-line bg-paper px-6 py-3 text-base font-medium text-ink-2 hover:text-ink">
                  How it works
                </a>
              </div>
              <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 text-sm">
                <div>
                  <dt className="text-ink-3">Closed in</dt>
                  <dd className="font-display text-2xl font-semibold">34 s</dd>
                </div>
                <div>
                  <dt className="text-ink-3">Margin held</dt>
                  <dd className="font-display text-2xl font-semibold">43.6%</dd>
                </div>
                <div>
                  <dt className="text-ink-3">Without Haggle</dt>
                  <dd className="font-display text-2xl font-semibold">$0</dd>
                </div>
              </dl>
            </div>
            <HeroPreview />
          </div>
        </section>

        {/* PROBLEM */}
        <section className="border-y border-line bg-paper">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <p className="text-sm font-medium uppercase tracking-wider text-terracotta">Three weeks that moved the front door</p>
            <h2 className="font-display mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
              Shoppers now arrive as agents, around the clock. Most merchants have nothing to answer with.
            </h2>
            <ol className="mt-10 grid gap-6 md:grid-cols-4">
              {timeline.map((x) => (
                <li key={x.d} className="rounded-2xl border border-line bg-cream p-5">
                  <span className="font-mono text-xs text-ink-3">{x.d}</span>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">{x.t}</p>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-xs text-ink-3">Sources: Meta Newsroom, GeekWire, CBS News, OpenAI, SiliconANGLE (Sept 2026).</p>
          </div>
        </section>

        {/* PRIMER */}
        <section id="primer" className="mx-auto max-w-6xl px-5 py-20">
          <p className="text-sm font-medium uppercase tracking-wider text-sky">New to this? Six words</p>
          <h2 className="font-display mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
            Everything in the demo is one of these.
          </h2>
          <dl className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {primer.map((p) => (
              <div key={p.term} className="rounded-2xl border border-line bg-paper p-5">
                <dt className="flex items-center gap-2 text-base font-semibold">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                  {p.term}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink-2">{p.def}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* HOW */}
        <section id="how" className="mx-auto max-w-6xl px-5 pb-20">
          <p className="text-sm font-medium uppercase tracking-wider text-sage">How it works</p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight md:text-4xl">One room. Seven seats. One tap from you.</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="flex flex-col rounded-[1.5rem] border border-line bg-paper p-6 shadow-[var(--shadow-card)]">
                <span className="font-display text-4xl font-semibold text-marigold">{s.n}</span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-2">{s.body}</p>
                <span className="mt-5 inline-block w-fit rounded-md bg-cream-2 px-2 py-1 font-mono text-[11px] text-ink-3">{s.tag}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ROOM */}
        <section id="room" className="border-y border-line bg-ink text-cream">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <p className="text-sm font-medium uppercase tracking-wider text-marigold">Meet the room</p>
            <h2 className="font-display mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
              Each seat is a real agent with a stable @handle. Work moves by @mention.
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {agents.map((a) => (
                <div key={a.handle} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full text-lg" style={{ background: a.color }}>
                      {a.emoji}
                    </span>
                    <div>
                      <div className="font-semibold">{a.name}</div>
                      <div className="font-mono text-[11px] text-cream/60">{a.handle}</div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-cream/80">{a.role}</p>
                  <p className="mt-2 text-[11px] text-cream/50">{a.runtime}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 rounded-2xl border border-marigold/40 bg-marigold/10 p-6">
              <p className="font-display text-xl font-semibold text-marigold">Why Band is load-bearing</p>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-cream/85">
                The shopper&apos;s agent and the store&apos;s agents belong to different owners. Band&apos;s contact request is the
                consent boundary; the room is the shared channel; @mentions mean the Pricing Critic only acts when
                addressed but still sees everything — which is exactly how a critic should work. Remove Band and the
                shopper agent has no door to knock on, the specialists have no way to coordinate, and the merchant has no
                audit trail. It isn&apos;t a transport. It&apos;s the negotiation table.
              </p>
            </div>
          </div>
        </section>

        {/* PNL */}
        <section id="pnl" className="mx-auto max-w-6xl px-5 py-20">
          <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-terracotta">The P&amp;L line we move</p>
              <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Revenue, with margin intact.</h2>
              <p className="mt-4 text-ink-2 leading-relaxed">
                An agent shopping on a $200 budget doesn&apos;t browse — it bounces. Haggle converts that bounce into a
                floor-protected sale, turns discounts into bundles when it can, and uses a quiet sales floor to pull
                shoppers into the store. Every deal is logged, so you learn what your inventory is actually worth.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["$0 → $195", "Revenue on one agent visit that would have walked"],
                ["43.6%", "Margin held above the critic’s floor"],
                ["48 days", "Of aging stock cleared"],
                ["1 tap", "Of the owner’s time, on WhatsApp"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl border border-line bg-paper p-5 shadow-[var(--shadow-card)]">
                  <div className="font-display text-3xl font-semibold text-ink">{k}</div>
                  <div className="mt-1 text-sm text-ink-2">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STACK */}
        <section id="stack" className="border-t border-line bg-paper">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <p className="text-sm font-medium uppercase tracking-wider text-sky">Built on</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {stackItems.map((s) => (
                <div key={s.name} className={`rounded-2xl border p-4 ${s.essential ? "border-marigold bg-marigold-2/40" : "border-line bg-cream"}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{s.name}</span>
                    {s.essential && <span className="rounded-full bg-marigold px-2 py-0.5 text-[10px] font-semibold uppercase text-ink">core</span>}
                  </div>
                  <p className="mt-1 text-sm text-ink-2">{s.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-5 py-20 text-center">
          <h2 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Pick a real merchant. Pick one line. Move it.</h2>
          <p className="mx-auto mt-4 max-w-xl text-ink-2">
            Haggle moves revenue for Marigold &amp; Pine in Hayes Valley. Watch the room close a deal live.
          </p>
          <Link href="/demo" className="mt-8 inline-block rounded-full bg-ink px-8 py-4 text-lg font-semibold text-cream shadow-sm hover:bg-ink-2">
            Open the Deal Room →
          </Link>
        </section>
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-ink-3">
          <Logo />
          <span>Marigold &amp; Pine is a fictional merchant. Payments run in test mode. Shopper data is synthetic.</span>
        </div>
      </footer>
    </>
  );
}
