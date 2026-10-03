"use client";
import { useState } from "react";
import { Logo } from "@/components/Nav";
import DealRoom from "@/components/demo/DealRoom";
import ShopperPhone from "@/components/demo/ShopperPhone";
import MerchantPanel from "@/components/demo/MerchantPanel";
import { useDealStream } from "@/lib/useDealStream";

const SPEEDS = [0.75, 1, 1.5, 2.5];

export default function DemoPage() {
  const [speed, setSpeed] = useState(1);
  const [showLegend, setShowLegend] = useState(true);
  const { scenario, mode, events, pnl, done, error, elapsedMs, connecting, restart } = useDealStream("7F3A", speed);

  return (
    <div className="flex h-dvh flex-col bg-cream">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-line bg-paper/80 px-4 backdrop-blur">
        <Logo />
        <div className="hidden text-sm text-ink-2 md:block">
          {scenario ? (
            <>
              <span className="font-medium text-ink">{scenario.title}</span> <span className="text-ink-3">· {scenario.merchant.neighborhood}</span>
            </>
          ) : (
            "Connecting…"
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ModeBadge mode={mode} />
          <span className="rounded-full bg-cream-2 px-2.5 py-1 font-mono text-xs text-ink-2">+{(elapsedMs / 1000).toFixed(1)}s</span>
          <div className="hidden items-center rounded-full border border-line bg-paper p-0.5 sm:flex">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`rounded-full px-2.5 py-1 text-xs ${speed === s ? "bg-ink text-cream" : "text-ink-2 hover:bg-cream-2"}`}
              >
                {s}×
              </button>
            ))}
          </div>
          <button onClick={restart} className="rounded-full bg-marigold px-3.5 py-1.5 text-sm font-semibold text-ink shadow-sm hover:brightness-95">
            {done ? "Replay deal" : "Restart"}
          </button>
        </div>
      </header>

      {error && <div className="bg-danger/10 px-4 py-2 text-center text-sm text-danger">{error}</div>}

      {showLegend ? (
        <div className="grid shrink-0 gap-3 border-b border-line bg-paper px-4 py-3 text-xs text-ink-2 lg:grid-cols-[300px_minmax(0,1fr)_340px]">
          <div>
            <span className="font-semibold text-indigo">◀ Mia&apos;s phone.</span> What the shopper sees: only messages that cross the boundary between her agent and the store. None of the store&apos;s internal chatter.
          </div>
          <div>
            <span className="font-semibold text-ink">▼ The Band Deal Room.</span> Every agent, every @mention, every tool call, in order. Agents act only when named; everyone sees everything. This log is the audit trail.
          </div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="font-semibold text-terracotta">▶ The merchant&apos;s view.</span> Stock and aging, the price floor (with live floor occupancy), the owner&apos;s approval, and the P&amp;L for this one visit.
            </div>
            <button onClick={() => setShowLegend(false)} className="shrink-0 rounded-full border border-line px-2.5 py-1 text-[11px] text-ink-2 hover:bg-cream-2">
              Hide
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowLegend(true)} className="fixed bottom-4 left-4 z-40 rounded-full border border-line bg-paper px-3 py-1.5 text-xs text-ink-2 shadow-[var(--shadow-card)] hover:bg-cream-2">
          ? How to read this screen
        </button>
      )}

      <main className="grid min-h-0 flex-1 gap-4 p-4 lg:grid-cols-[300px_minmax(0,1fr)_340px]">
        <div className="min-h-0 hidden lg:block">{scenario && <ShopperPhone events={events} scenario={scenario} done={done} />}</div>
        <div className="min-h-0">{scenario ? <DealRoom events={events} agents={scenario.agents} done={done} /> : <Skeleton />}</div>
        <div className="min-h-0 hidden lg:block">{scenario && <MerchantPanel events={events} scenario={scenario} pnl={pnl} done={done} />}</div>
      </main>

      {done && pnl.status === "closed" && (
        <div className="pop-in pointer-events-none fixed inset-x-0 top-16 z-50 flex justify-center px-4">
          <div className="pointer-events-auto flex items-center gap-4 rounded-full border border-line bg-ink px-5 py-3 text-cream shadow-[var(--shadow-card)]">
            <span className="text-2xl">🎉</span>
            <div className="text-sm">
              <div className="font-semibold">
                Closed at ${pnl.agreedPriceUSD} · {pnl.marginPct}% margin · pickup today
              </div>
              <div className="text-cream/70">Without Haggle this shopper agent walks. Room log is the audit trail.</div>
            </div>
            <button onClick={restart} className="ml-2 rounded-full bg-marigold px-3 py-1.5 text-sm font-semibold text-ink">
              Run it again
            </button>
          </div>
        </div>
      )}
      {connecting && !scenario && <div className="sr-only">connecting</div>}
    </div>
  );
}

function ModeBadge({ mode }: { mode: "live" | "replay" | null }) {
  if (!mode) return null;
  const live = mode === "live";
  return (
    <span
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
        live ? "bg-success/15 text-success" : "bg-sky/10 text-sky"
      }`}
      title={live ? "Events are coming from a real Band room" : "Replaying a recorded Band room (fallback mode)"}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-success pulse-ring" : "bg-sky"}`} />
      {live ? "Live · Band" : "Replay"}
    </span>
  );
}

function Skeleton() {
  return <div className="h-full animate-pulse rounded-[1.25rem] border border-line bg-cream-2/60" />;
}
