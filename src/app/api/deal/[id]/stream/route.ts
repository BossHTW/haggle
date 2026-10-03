import { getAdapters } from "@/lib/adapters";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Server-Sent Events stream of DealEvents for a scenario.
 *   GET /api/deal/7F3A/stream?speed=1.5
 * First frame is {type:"meta", mode, scenario}; then one {type:"event", event}
 * per DealEvent; finally {type:"done"}.
 */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const speed = Math.min(8, Math.max(0.25, Number(url.searchParams.get("speed") ?? "1") || 1));
  const adapters = await getAdapters();
  const scenario = await adapters.events.scenario(id);
  const encoder = new TextEncoder();
  const abort = new AbortController();
  req.signal.addEventListener("abort", () => abort.abort());

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      send({ type: "meta", mode: adapters.mode, scenario });
      try {
        for await (const event of adapters.events.stream(id, { speed, signal: abort.signal })) {
          send({ type: "event", event });
        }
        send({ type: "done" });
      } catch (e) {
        if (!abort.signal.aborted) send({ type: "error", message: (e as Error).message });
      } finally {
        controller.close();
      }
    },
    cancel() {
      abort.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Haggle-Mode": adapters.mode,
    },
  });
}
