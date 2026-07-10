export const dynamic = "force-dynamic";

// TODO: replace with a real SSE proxy to TxLINE's live scores stream. On the
// upstream TxLINE connection, pipe each event through controller.enqueue()
// as it arrives. Auth (TXLINE_API_TOKEN/TXLINE_JWT) is read server-side only
// via lib/txline.ts — never exposed to the client.
export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(": connected\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
