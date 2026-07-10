import { NextResponse } from "next/server";

// TODO: replace with a real proxy to TxLINE's GET /scores/:fixtureId endpoint
// using lib/txline.ts's getScores(), which reads TXLINE_API_TOKEN/TXLINE_JWT
// from process.env (server-only — never exposed to the client).
export async function GET(_request: Request, { params }: { params: { fixtureId: string } }) {
  return NextResponse.json(
    {
      status: "not_implemented",
      fixtureId: params.fixtureId,
      todo: "proxy TxLINE GET /scores/:fixtureId",
      data: null,
    },
    { status: 501 },
  );
}
