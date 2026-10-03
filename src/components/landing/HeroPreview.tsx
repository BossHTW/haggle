"use client";
import { useEffect, useState } from "react";

const lines = [
  { who: "Mia's Muse", color: "#5B6CF0", text: "Budget is $200. I’ve seen it for $219 elsewhere." },
  { who: "Scout", color: "#3F7D9C", text: "Competitor is $229 — and out of stock in M.", tool: "TinyFish" },
  { who: "Pricing Critic", color: "#D96B4A", text: "Floor: $200 shipped · $192 pickup (store 23% busy).", tool: "Butlr" },
  { who: "Concierge", color: "#F2A33A", text: "$212 shipped — or $199 if Mia picks up before 6pm." },
  { who: "Mia's Muse", color: "#5B6CF0", text: "$195 pickup and we have a deal." },
  { who: "Bo (owner)", color: "#1F1B16", text: "Approved ✅", gate: true },
  { who: "Concierge", color: "#F2A33A", text: "Deal. Steamed and ready under Mia’s name." },
];

export default function HeroPreview() {
  const [n, setN] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setN((v) => (v >= lines.length ? 0 : v + 1)), 1500);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="relative rounded-[1.5rem] border border-line bg-paper p-4 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center justify-between text-xs text-ink-3">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success" /> Band Deal Room #7F3A
        </span>
        <span className="rounded-full bg-cream-2 px-2 py-0.5 font-mono">7 seats</span>
      </div>
      <div className="flex min-h-[290px] flex-col gap-2">
        {lines.slice(0, n).map((l, i) => (
          <div key={i} className="pop-in flex items-start gap-2">
            <span className="mt-1 h-6 w-6 shrink-0 rounded-full" style={{ background: l.color }} />
            <div className={`rounded-2xl px-3 py-2 text-sm ${l.gate ? "bg-marigold-2" : "bg-cream-2"}`}>
              <span className="mr-2 font-medium" style={{ color: l.color === "#1F1B16" ? "#1F1B16" : l.color }}>
                {l.who}
              </span>
              <span className="text-ink-2">{l.text}</span>
              {l.tool && (
                <span className="ml-2 rounded-md border border-line bg-paper px-1.5 py-0.5 font-mono text-[10px] text-ink-3">
                  {l.tool}
                </span>
              )}
            </div>
          </div>
        ))}
        {n < lines.length && (
          <div className="flex items-center gap-1 pl-9 text-ink-3">
            <span className="dot h-1.5 w-1.5 rounded-full bg-ink-3" />
            <span className="dot h-1.5 w-1.5 rounded-full bg-ink-3" />
            <span className="dot h-1.5 w-1.5 rounded-full bg-ink-3" />
          </div>
        )}
      </div>
    </div>
  );
}
