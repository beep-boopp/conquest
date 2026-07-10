import { NextResponse } from "next/server";

// TODO: replace with a real proxy to TxLINE's GET /odds/:fixtureId endpoint
// using lib/txline.ts's getOdds(), which reads TXLINE_API_TOKEN/TXLINE_JWT
// from process.env (server-only — never exposed to the client).
export async function GET(_request: Request, { params }: { params: { fixtureId: string } }) {
  return NextResponse.json(
    {
      status: "not_implemented",
      fixtureId: params.fixtureId,
      todo: "proxy TxLINE GET /odds/:fixtureId",
      data: null,
    },
    { status: 501 },
  );
}
