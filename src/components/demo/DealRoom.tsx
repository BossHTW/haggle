"use client";
import { useEffect, useRef } from "react";
import type { AgentProfile, DealEvent } from "@/lib/types";
import { Avatar, Chip, Mentions, agentFor, sponsorColor, usd } from "./shared";

function ToolCard({ ev, agents }: { ev: DealEvent; agents: AgentProfile[] }) {
  const a = agentFor(agents, ev.from);
  if (ev.kind === "tool_call" && ev.toolCall) {
    const c = sponsorColor[ev.toolCall.sponsor] ?? "#8A8178";
    return (
      <div className="pop-in ml-10 rounded-xl border border-dashed border-line bg-paper/70 px-3 py-2 text-xs">
        <div className="flex items-center gap-2">
          <Chip color={c}>{ev.toolCall.sponsor}</Chip>
          <span className="font-mono text-ink-2">{ev.toolCall.tool}()</span>
          <span className="ml-auto text-ink-3">{a.name}</span>
        </div>
        <pre className="mt-1 overflow-x-auto whitespace-pre-wrap font-mono text-[10.5px] text-ink-3">{JSON.stringify(ev.toolCall.args)}</pre>
      </div>
    );
  }
  return null;
}

export default function DealRoom({ events, agents, done }: { events: DealEvent[]; agents: AgentProfile[]; done: boolean }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [events.length]);

  return (
    <div className="flex h-full flex-col rounded-[1.25rem] border border-line bg-cream-2/60 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink text-cream">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="3" y="4" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
              <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <div className="text-sm font-semibold leading-none">Band · Deal Room #7F3A</div>
            <div className="mt-1 text-[11px] text-ink-3">Every message and tool call is a timestamped, replayable event</div>
          </div>
        </div>
        <div className="flex -space-x-2">
          {agents.map((a) => (
            <span key={a.handle} className="rounded-full ring-2 ring-cream-2">
              <Avatar a={a} size={24} />
            </span>
          ))}
        </div>
      </div>

      <div className="scrollbar-thin flex-1 space-y-2.5 overflow-y-auto px-4 py-4">
        {events.map((ev) => {
          const a = agentFor(agents, ev.from);
          if (ev.kind === "tool_call") return <ToolCard key={ev.id} ev={ev} agents={agents} />;
          if (ev.kind === "room.created" || ev.kind === "contact.request" || ev.kind === "contact.approved" || ev.kind === "order.created") {
            return (
              <div key={ev.id} className="pop-in flex items-center gap-3 py-1 text-[11px] text-ink-3">
                <span className="h-px flex-1 bg-line" />
                <span className="max-w-[80%] text-center">
                  <Chip color={ev.kind === "order.created" ? "#2F8F5B" : "#1F1B16"}>{ev.kind}</Chip> <span className="ml-1">{ev.text}</span>
                </span>
                <span className="h-px flex-1 bg-line" />
              </div>
            );
          }
          if (ev.kind === "gate.request") {
            return (
              <div key={ev.id} className="pop-in mx-6 rounded-xl border border-marigold bg-marigold-2/60 px-3 py-2 text-xs text-ink">
                <div className="flex items-center gap-2 font-semibold">
                  <span>🔔 Human gate</span>
                  <Chip color="#1F1B16">WhatsApp → @bo</Chip>
                </div>
                <div className="mt-1 text-ink-2">{ev.text}</div>
              </div>
            );
          }
          if (ev.kind === "thought") {
            return (
              <div key={ev.id} className="pop-in ml-10 flex items-start gap-2 text-xs italic text-ink-3">
                <span>💭</span>
                <span>
                  <span className="not-italic font-medium" style={{ color: a.color }}>
                    {a.name}
                  </span>{" "}
                  {ev.text}
                </span>
              </div>
            );
          }
          const isOffer = ev.kind === "offer" || ev.kind === "counter";
          const isGateResult = ev.kind === "gate.approved" || ev.kind === "gate.rejected";
          const isClose = ev.kind === "deal.closed" || ev.kind === "deal.walked";
          return (
            <div key={ev.id} className="pop-in flex items-start gap-2.5">
              <Avatar a={a} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold" style={{ color: a.color === "#1F1B16" ? "#1F1B16" : a.color }}>
                    {a.name}
                  </span>
                  <span className="font-mono text-[10px] text-ink-3">{a.handle}</span>
                  <span className="ml-auto font-mono text-[10px] text-ink-3">+{(ev.t / 1000).toFixed(1)}s</span>
                </div>
                <div
                  className={`mt-1 rounded-2xl rounded-tl-sm px-3 py-2 text-sm leading-relaxed ${
                    isGateResult ? "bg-success/15 text-ink" : isClose ? "bg-ink text-cream" : "bg-paper text-ink-2"
                  }`}
                >
                  {ev.text && <Mentions text={ev.text} agents={agents} />}
                  {isOffer && ev.offer && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-cream-2 px-2.5 py-1.5">
                      <span className="font-display text-xl font-semibold text-ink">{usd(ev.offer.priceUSD)}</span>
                      <Chip color={ev.offer.fulfillment === "pickup" ? "#D96B4A" : "#3F7D9C"}>{ev.offer.fulfillment}</Chip>
                      <span className="text-[11px] text-ink-3">{ev.offer.items.length} item{ev.offer.items.length > 1 ? "s" : ""}</span>
                      {ev.offer.note && <span className="text-[11px] text-ink-2">· {ev.offer.note}</span>}
                      <Chip color={ev.kind === "offer" ? "#F2A33A" : "#5B6CF0"}>{ev.kind}</Chip>
                    </div>
                  )}
                  {ev.kind === "floor.update" && ev.floor && (
                    <ul className="mt-2 space-y-0.5 text-[11.5px] text-ink-3">
                      {ev.floor.rationale.map((r) => (
                        <li key={r}>• {r}</li>
                      ))}
                    </ul>
                  )}
                  {ev.kind === "tool_result" && ev.toolResult && (
                    <details className="mt-1.5">
                      <summary className="cursor-pointer font-mono text-[10.5px] text-ink-3">tool_result</summary>
                      <pre className="mt-1 overflow-x-auto whitespace-pre-wrap font-mono text-[10.5px] text-ink-3">{JSON.stringify(ev.toolResult, null, 1)}</pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {!done && events.length > 0 && (
          <div className="flex items-center gap-1 pl-11 pt-1 text-ink-3">
            <span className="dot h-1.5 w-1.5 rounded-full bg-ink-3" />
            <span className="dot h-1.5 w-1.5 rounded-full bg-ink-3" />
            <span className="dot h-1.5 w-1.5 rounded-full bg-ink-3" />
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
