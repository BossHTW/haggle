import { getAdapters } from "@/lib/adapters";

export const dynamic = "force-dynamic";

/** GET /api/deal/7F3A → { mode, scenario } (no events streamed) */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const adapters = await getAdapters();
  try {
    const scenario = await adapters.events.scenario(id);
    return Response.json({ mode: adapters.mode, scenario });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 404 });
  }
}
