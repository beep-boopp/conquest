import { openScoresStream } from "@/lib/txline";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fixtureId = searchParams.get("fixtureId") ?? undefined;
  const lastEventId = request.headers.get("Last-Event-ID") ?? undefined;

  let upstream: Response;
  try {
    upstream = await openScoresStream(fixtureId, lastEventId);
  } catch (e) {
    return new Response(e instanceof Error ? e.message : "Failed to open TxLINE scores stream", { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
