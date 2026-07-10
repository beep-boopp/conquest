import { TxLineFixture } from "@/types";

// Server-only module — only ever imported from app/api/txline/* route
// handlers. TXLINE_API_TOKEN / TXLINE_JWT must only ever be read here, via
// process.env — never expose them to the client (no NEXT_PUBLIC_ prefix,
// never included in a response body).

export function getAuthHeaders(): Record<string, string> {
  const token = process.env.TXLINE_API_TOKEN;
  const jwt = process.env.TXLINE_JWT;
  // TODO: throw/validate once real TxLINE credentials are provisioned.
  return {
    ...(token ? { "x-api-token": token } : {}),
    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
  };
}

export async function getFixtures(): Promise<TxLineFixture[]> {
  // TODO: fetch(`${process.env.TXLINE_BASE_URL}/fixtures`, { headers: getAuthHeaders() })
  throw new Error("getFixtures: not implemented");
}

export async function getScores(fixtureId: string): Promise<unknown> {
  // TODO: fetch(`${process.env.TXLINE_BASE_URL}/scores/${fixtureId}`, { headers: getAuthHeaders() })
  throw new Error(`getScores: not implemented (fixtureId=${fixtureId})`);
}

export async function getOdds(fixtureId: string): Promise<unknown> {
  // TODO: fetch(`${process.env.TXLINE_BASE_URL}/odds/${fixtureId}`, { headers: getAuthHeaders() })
  throw new Error(`getOdds: not implemented (fixtureId=${fixtureId})`);
}
