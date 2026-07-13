import { NextResponse } from "next/server";

import { getFixtures } from "@/lib/txline";

export async function GET() {
  try {
    const fixtures = await getFixtures();
    return NextResponse.json({ data: fixtures });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to fetch fixtures" }, { status: 502 });
  }
}
