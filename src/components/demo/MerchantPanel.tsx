"use client";
import type { DealEvent, DealScenario, Floor, PnLSnapshot } from "@/lib/types";
import { Chip, usd } from "./shared";

function Card({ title, children, accent }: { title: string; children: React.ReactNode; accent?: string }) {
  return (
    <section className="rounded-[1.25rem] border border-line bg-paper p-4 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
        {accent && <span className="h-2 w-2 rounded-full" style={{ background: accent }} />}
        {title}
      </div>
      {children}
    </section>
  );
}

function OccupancyGauge({ pct }: { pct: number | null }) {
  const v = pct ?? 0;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-ink-2">Sales floor occupancy</span>
        <span className="font-display text-2xl font-semibold">{pct == null ? "—" : `${pct}%`}</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-cream-2">
        <div className="h-full rounded-full bg-terracotta transition-all duration-700" style={{ width: `${v}%` }} />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-ink-3">
        <span>quiet</span>
        <span>Butlr · live</span>
        <span>packed</span>
      </div>
    </div>
  );
}

function PriceLadder({ events, list, floor }: { events: DealEvent[]; list: number; floor: Floor | null }) {
  const offers = events.filter((e) => (e.kind === "offer" || e.kind === "counter") && e.offer);
  const max = list;
  const min = Math.min(floor?.pickupUSD ?? list * 0.75, ...offers.map((o) => o.offer!.priceUSD)) - 10;
  const y = (p: number) => 100 - ((p - min) / (max - min)) * 100;
  return (
    <div className="relative h-36">
      {floor && (
        <>
          <div className="absolute left-0 right-0 border-t border-dashed border-terracotta/70" style={{ top: `${y(floor.shipUSD)}%` }}>
            <span className="absolute left-0 -top-4 font-mono text-[10px] text-terracotta">floor ship {usd(floor.shipUSD)}</span>
          </div>
          <div className="absolute left-0 right-0 border-t border-dashed border-terracotta/40" style={{ top: `${y(floor.pickupUSD)}%` }}>
            <span className="absolute left-0 top-0.5 font-mono text-[10px] text-terracotta/80">floor pickup {usd(floor.pickupUSD)}</span>
          </div>
        </>
      )}
      <div className="absolute left-0 right-0 border-t border-line" style={{ top: `${y(list)}%` }}>
        <span className="absolute right-0 -top-4 font-mono text-[10px] text-ink-3">list {usd(list)}</span>
      </div>
      <div className="absolute inset-y-0 left-24 right-2">
        {offers.map((o, i) => {
          const p = o.offer!.priceUSD;
          const shopper = o.from === "@bo0/muse-shopper";
          const x = ((i + 0.5) / offers.length) * 100;
          return (
            <div
              key={o.id}
              className="count-up absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left: `${x}%`, top: `${Math.min(92, Math.max(4, y(p)))}%` }}
            >
              <span className="h-3 w-3 rounded-full ring-2 ring-paper" style={{ background: shopper ? "#5B6CF0" : "#F2A33A" }} title={`${o.from} ${usd(p)}`} />
              <span className="mt-0.5 font-mono text-[10px] text-ink-2">{usd(p)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MerchantPanel({ events, scenario, pnl, done }: { events: DealEvent[]; scenario: DealScenario; pnl: PnLSnapshot; done: boolean }) {
  const floorEv = [...events].reverse().find((e) => e.kind === "floor.update");
  const floor = floorEv?.floor ?? null;
  const occ = [...events].reverse().find((e) => e.kind === "tool_result" && e.toolCall == null && e.toolResult && "occupancyPct" in e.toolResult)?.toolResult as { occupancyPct: number } | undefined;
  const inv = events.find((e) => e.kind === "tool_result" && e.toolResult && "onHand" in e.toolResult)?.toolResult as { onHand: number; daysOnShelf: number; weeklyVelocity: number } | undefined;
  const scout = events.find((e) => e.kind === "tool_result" && e.toolResult && "inStockM" in e.toolResult)?.toolResult as { price: number; inStockM: boolean } | undefined;
  const gateReq = events.find((e) => e.kind === "gate.request");
  const gateRes = events.find((e) => e.kind === "gate.approved" || e.kind === "gate.rejected");

  const exportLog = () => {
    const blob = new Blob([JSON.stringify({ room: "7F3A", exportedAt: new Date().toISOString(), events }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "haggle-room-7F3A-audit.json";
    a.click();
  };

  return (
    <div className="scrollbar-thin flex h-full flex-col gap-3 overflow-y-auto pr-1">
      <Card title="Merchant · Marigold & Pine" accent="#F2A33A">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-display text-lg font-semibold leading-tight">{scenario.product.name}</div>
            <div className="text-xs text-ink-3">
              {scenario.product.sku} · size {scenario.product.size}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-ink-3">list</div>
            <div className="font-display text-xl font-semibold">{usd(scenario.product.listUSD)}</div>
          </div>
        </div>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-cream-2 p-2">
            <dt className="text-ink-3">on hand</dt>
            <dd className="font-semibold">{inv ? inv.onHand : "—"}</dd>
          </div>
          <div className="rounded-lg bg-cream-2 p-2">
            <dt className="text-ink-3">days on shelf</dt>
            <dd className={`font-semibold ${inv && inv.daysOnShelf > 40 ? "text-terracotta" : ""}`}>{inv ? inv.daysOnShelf : "—"}</dd>
          </div>
          <div className="rounded-lg bg-cream-2 p-2">
            <dt className="text-ink-3">competitor</dt>
            <dd className="font-semibold">{scout ? `${usd(scout.price)}${scout.inStockM ? "" : " · OOS"}` : "—"}</dd>
          </div>
        </dl>
      </Card>

      <Card title="Pricing Critic · floor" accent="#D96B4A">
        <OccupancyGauge pct={occ?.occupancyPct ?? null} />
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-line p-2.5">
            <div className="text-[10px] text-ink-3">floor · shipped</div>
            <div className="font-display text-2xl font-semibold">{floor ? usd(floor.shipUSD) : "—"}</div>
          </div>
          <div className="rounded-xl border border-terracotta/40 bg-terracotta/5 p-2.5">
            <div className="text-[10px] text-ink-3">floor · pickup today</div>
            <div className="font-display text-2xl font-semibold text-terracotta">{floor ? usd(floor.pickupUSD) : "—"}</div>
          </div>
        </div>
        <div className="mt-4">
          <PriceLadder events={events} list={scenario.product.listUSD} floor={floor} />
        </div>
      </Card>

      <Card title="Owner gate · WhatsApp" accent="#1F1B16">
        {!gateReq ? (
          <div className="text-xs text-ink-3">Nothing needs you yet. Concierge is negotiating above the floor on its own.</div>
        ) : (
          <div className={`rounded-2xl border p-3 ${gateRes ? "border-success/40 bg-success/5" : "border-marigold bg-marigold-2/50 pulse-ring"}`}>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-success text-white">💬</span>
              Haggle · Marigold &amp; Pine
              <span className="ml-auto font-normal text-ink-3">now</span>
            </div>
            <p className="mt-2 text-sm text-ink">{gateReq.text?.replace(/^WhatsApp → Bo: /, "").replace(/\[Approve\] \[Decline\]/, "")}</p>
            <div className="mt-3 flex gap-2">
              <button className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold ${gateRes?.kind === "gate.approved" ? "bg-success text-white" : "bg-ink text-cream"}`} disabled>
                {gateRes?.kind === "gate.approved" ? "Approved ✓" : "Approve"}
              </button>
              <button className="flex-1 rounded-lg border border-line px-3 py-1.5 text-sm text-ink-2" disabled>
                Decline
              </button>
            </div>
            {gateRes && <div className="mt-2 text-xs text-ink-2">{gateRes.text}</div>}
          </div>
        )}
      </Card>

      <Card title="P&L · this visit" accent="#6E8B6B">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-cream-2 p-3">
            <div className="text-[10px] text-ink-3">without Haggle</div>
            <div className="font-display text-2xl font-semibold text-ink-3">$0</div>
            <div className="text-[10px] text-ink-3">agent walks at list</div>
          </div>
          <div className={`rounded-xl p-3 ${pnl.status === "closed" ? "bg-success/15" : "bg-cream-2"}`}>
            <div className="text-[10px] text-ink-3">with Haggle</div>
            <div className={`font-display text-2xl font-semibold ${pnl.status === "closed" ? "count-up text-success" : ""}`}>{pnl.agreedPriceUSD ? usd(pnl.agreedPriceUSD) : "…"}</div>
            <div className="text-[10px] text-ink-3">{pnl.marginPct ? `${pnl.marginPct}% margin · ${pnl.fulfillment}` : "negotiating"}</div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-1.5">
            <Chip color={pnl.status === "closed" ? "#2F8F5B" : "#8A8178"}>{pnl.status}</Chip>
            {pnl.daysOnShelfCleared ? <Chip color="#D96B4A">{pnl.daysOnShelfCleared}d stock cleared</Chip> : null}
          </div>
          <button onClick={exportLog} disabled={!done} className="rounded-lg border border-line px-2.5 py-1 text-[11px] font-medium text-ink-2 hover:bg-cream-2 disabled:opacity-40">
            Export audit log
          </button>
        </div>
      </Card>
    </div>
  );
}
