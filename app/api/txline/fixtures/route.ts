import { NextResponse } from "next/server";

// TODO: replace with a real proxy to TxLINE's GET /fixtures endpoint using
// lib/txline.ts's getFixtures(), which reads TXLINE_API_TOKEN/TXLINE_JWT
// from process.env (server-only — never exposed to the client).
export async function GET() {
  return NextResponse.json(
    {
      status: "not_implemented",
      todo: "proxy TxLINE GET /fixtures using TXLINE_API_TOKEN/TXLINE_JWT from process.env (server-only)",
      data: [],
    },
    { status: 501 },
  );
}
