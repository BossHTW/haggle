"use client";
import { useEffect, useRef } from "react";
import type { DealEvent, DealScenario } from "@/lib/types";
import { usd } from "./shared";

/**
 * What Mia sees on her phone: her Muse agent reporting back. Only events that
 * cross the boundary (shopper ↔ concierge) show here — the merchant's internal
 * room chatter does not. That asymmetry is the point.
 */
export default function ShopperPhone({ events, scenario, done }: { events: DealEvent[]; scenario: DealScenario; done: boolean }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [events.length]);

  const visible = events.filter(
    (e) =>
      (e.from === "@bo0/muse-shopper" && (e.kind === "message" || e.kind === "counter" || e.kind === "contact.request")) ||
      (e.from === "@bosshtw/concierge" && e.mentions?.includes("@bo0/muse-shopper") && (e.kind === "offer" || e.kind === "message")) ||
      e.kind === "order.created",
  );

  return (
    <div className="mx-auto flex h-full w-full max-w-[340px] flex-col">
      <div className="mb-2 text-center text-[11px] text-ink-3">Mia&apos;s phone · {scenario.shopper.agent}</div>
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-[2.2rem] border-[6px] border-ink bg-white shadow-[var(--shadow-card)]">
        <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-ink" />
        <div className="border-b border-indigo-2 bg-indigo-2/60 px-4 pb-3 pt-9">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-indigo text-white">🛍️</span>
            <div>
              <div className="text-sm font-semibold leading-none text-ink">Muse</div>
              <div className="mt-0.5 text-[10px] text-ink-3">shopping for {scenario.shopper.name} · budget {usd(scenario.shopper.budgetUSD)}</div>
            </div>
          </div>
        </div>
        <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto px-3 py-3">
          <div className="rounded-2xl rounded-tr-sm bg-indigo px-3 py-2 text-sm text-white ml-8">
            Find me the {scenario.product.name} in {scenario.product.size}, under {usd(scenario.shopper.budgetUSD)}.
          </div>
          {visible.map((e) => {
            const mine = e.from === "@bo0/muse-shopper";
            if (e.kind === "contact.request")
              return (
                <div key={e.id} className="pop-in text-center text-[10.5px] text-ink-3">
                  Knocking on Marigold &amp; Pine… consent shared
                </div>
              );
            if (e.kind === "order.created")
              return (
                <div key={e.id} className="pop-in rounded-2xl border border-success/40 bg-success/10 px-3 py-2 text-sm">
                  <div className="font-semibold text-success">Order confirmed 🎉</div>
                  <div className="text-xs text-ink-2">{e.text}</div>
                </div>
              );
            const text = (e.text ?? "").replace(/@marigold\/concierge\s?/g, "").replace(/@mia\/muse-shopper\s?/g, "");
            return (
              <div key={e.id} className={`pop-in max-w-[88%] rounded-2xl px-3 py-2 text-sm ${mine ? "mr-auto rounded-tl-sm bg-cream-2 text-ink" : "ml-auto rounded-tr-sm bg-marigold-2 text-ink"}`}>
                {!mine && <div className="mb-0.5 text-[10px] font-medium text-terracotta">Marigold &amp; Pine</div>}
                {mine && <div className="mb-0.5 text-[10px] font-medium text-indigo">Muse → store</div>}
                {text}
                {e.offer && (
                  <div className="mt-1 font-display text-lg font-semibold">
                    {usd(e.offer.priceUSD)} <span className="font-sans text-[10px] font-normal text-ink-3">{e.offer.fulfillment}</span>
                  </div>
                )}
              </div>
            );
          })}
          {!done && (
            <div className="flex items-center gap-1 pl-2 pt-1 text-ink-3">
              <span className="dot h-1.5 w-1.5 rounded-full bg-ink-3" />
              <span className="dot h-1.5 w-1.5 rounded-full bg-ink-3" />
              <span className="dot h-1.5 w-1.5 rounded-full bg-ink-3" />
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>
    </div>
  );
}
