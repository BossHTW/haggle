import type { AgentHandle, AgentProfile } from "@/lib/types";

export const sponsorColor: Record<string, string> = {
  Band: "#1F1B16",
  ZooWork: "#6E8B6B",
  ZooData: "#6E8B6B",
  TinyFish: "#3F7D9C",
  Moss: "#9B6BB5",
  Butlr: "#D96B4A",
  "Stripe(test)": "#5B6CF0",
};

export function agentFor(agents: AgentProfile[], h: AgentHandle): AgentProfile {
  return (
    agents.find((a) => a.handle === h) ?? {
      handle: h,
      name: h === "system" ? "Band" : h,
      role: "",
      owner: "system",
      color: "#8A8178",
      emoji: "⚙️",
      runtime: "",
    }
  );
}

/** Render text with @handles highlighted. */
export function Mentions({ text, agents }: { text: string; agents: AgentProfile[] }) {
  const parts = text.split(/(@[a-z0-9-]+(?:\/[a-z0-9-]+)?)/gi);
  return (
    <>
      {parts.map((p, i) => {
        if (/^@/.test(p)) {
          const a = agents.find((x) => x.handle === p);
          return (
            <span
              key={i}
              className="rounded-md px-1 py-0.5 font-mono text-[0.8em] font-medium"
              style={{ background: (a?.color ?? "#8A8178") + "22", color: a?.color ?? "#4A433B" }}
            >
              {p}
            </span>
          );
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

export function Avatar({ a, size = 32 }: { a: AgentProfile; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full"
      style={{ background: a.color, width: size, height: size, fontSize: size * 0.5 }}
      title={a.handle}
    >
      {a.emoji}
    </span>
  );
}

export function Chip({ children, color = "#8A8178" }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-medium" style={{ borderColor: color + "55", color, background: color + "11" }}>
      {children}
    </span>
  );
}

export const usd = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
