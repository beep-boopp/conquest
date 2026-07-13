import { NextResponse } from "next/server";

import { getOddsSnapshot } from "@/lib/txline";

export async function GET(_request: Request, { params }: { params: { fixtureId: string } }) {
  try {
    const data = await getOddsSnapshot(params.fixtureId);
    return NextResponse.json({ data });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to fetch odds" }, { status: 502 });
  }
}
