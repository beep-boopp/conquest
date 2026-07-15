import { MatchResult, parseMatchResult } from "@/lib/match-result";
import { TxLineFixture } from "@/types";

// Server-only module — only ever imported from app/api/txline/* route
// handlers. TXLINE_API_TOKEN / TXLINE_JWT must only ever be read here, via
// process.env — never expose them to the client (no NEXT_PUBLIC_ prefix,
// never included in a response body).

/** Raw shape TxLINE returns from /api/fixtures/snapshot — see docs/txline-api-reference.md #3. */
interface RawFixture {
  Ts: number;
  StartTime: number;
  Competition: string;
  CompetitionId: number;
  FixtureGroupId: number;
  Participant1Id: number;
  Participant1: string;
  Participant2Id: number;
  Participant2: string;
  FixtureId: number;
  Participant1IsHome: boolean;
}

function getAuthHeaders(): Record<string, string> {
  const token = process.env.TXLINE_API_TOKEN;
  const jwt = process.env.TXLINE_JWT;
  return {
    ...(token ? { "X-Api-Token": token } : {}),
    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
  };
}

function getBaseUrl(): string {
  const base = process.env.TXLINE_BASE_URL;
  if (!base) throw new Error("TXLINE_BASE_URL is not set — run scripts/txline-activate.ts, see CLAUDE.md");
  return base;
}

function toTxLineFixture(raw: RawFixture): TxLineFixture {
  return {
    fixtureId: String(raw.FixtureId),
    homeTeam: raw.Participant1,
    awayTeam: raw.Participant2,
    kickoffTime: new Date(raw.StartTime).toISOString(),
    competition: raw.Competition,
  };
}

export async function getFixtures(): Promise<TxLineFixture[]> {
  const res = await fetch(`${getBaseUrl()}/api/fixtures/snapshot`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`TxLINE fixtures fetch failed: ${res.status} ${await res.text()}`);
  const raw: RawFixture[] = await res.json();
  return raw.map(toTxLineFixture);
}

/** GET /api/scores/snapshot/{fixtureId} — latest state per action type. See docs/txline-api-reference.md #4. */
export async function getScoresSnapshot(fixtureId: string): Promise<unknown> {
  const res = await fetch(`${getBaseUrl()}/api/scores/snapshot/${fixtureId}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`TxLINE scores snapshot fetch failed: ${res.status} ${await res.text()}`);
  return res.json();
}

/**
 * GET /api/scores/historical/{fixtureId} — full score-update sequence for a
 * fixture. Only valid for fixtures that started 6h-2wk ago. See
 * docs/txline-api-reference.md #5.
 */
export async function getScoresHistorical(fixtureId: string): Promise<unknown> {
  const res = await fetch(`${getBaseUrl()}/api/scores/historical/${fixtureId}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`TxLINE scores historical fetch failed: ${res.status} ${await res.text()}`);
  return res.json();
}

/**
 * Fetches and parses a fixture's real result for display (bracket/timeline
 * enrichment) — returns null if the match hasn't started or has no score
 * data yet, so callers can fall back to "upcoming"/"live" placeholders.
 */
export async function enrichFixture(fixtureId: number): Promise<MatchResult | null> {
  try {
    const raw = await getScoresSnapshot(String(fixtureId));
    return parseMatchResult(raw as never);
  } catch {
    return null;
  }
}

/** GET /api/odds/snapshot/{fixtureId}. See docs/txline-api-reference.md #8. */
export async function getOddsSnapshot(fixtureId: string): Promise<unknown> {
  const res = await fetch(`${getBaseUrl()}/api/odds/snapshot/${fixtureId}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`TxLINE odds snapshot fetch failed: ${res.status} ${await res.text()}`);
  return res.json();
}

/**
 * Opens the upstream TxLINE scores SSE stream. Caller pipes the body
 * through to the client. See docs/txline-api-reference.md #6.
 */
export async function openScoresStream(fixtureId?: string, lastEventId?: string): Promise<Response> {
  const url = new URL(`${getBaseUrl()}/api/scores/stream`);
  if (fixtureId) url.searchParams.set("fixtureId", fixtureId);

  const res = await fetch(url, {
    headers: {
      ...getAuthHeaders(),
      ...(lastEventId ? { "Last-Event-ID": lastEventId } : {}),
    },
    cache: "no-store",
  });
  if (!res.ok || !res.body) throw new Error(`TxLINE scores stream failed: ${res.status} ${await res.text()}`);
  return res;
}
