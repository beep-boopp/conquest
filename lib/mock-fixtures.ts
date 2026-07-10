import { TxLineFixture } from "@/types";

// TODO: replace with a real fetch from /api/txline/fixtures once that route
// proxies live TxLINE data (see docs/txline-api-reference.md #3).
export const MOCK_FIXTURES: TxLineFixture[] = [
  { fixtureId: "1001", homeTeam: "Brazil", awayTeam: "Argentina", kickoffTime: "2026-07-15T18:00:00Z", status: "not_started" },
  { fixtureId: "1002", homeTeam: "France", awayTeam: "Germany", kickoffTime: "2026-07-16T18:00:00Z", status: "not_started" },
  { fixtureId: "1003", homeTeam: "USA", awayTeam: "Mexico", kickoffTime: "2026-07-17T18:00:00Z", status: "not_started" },
  { fixtureId: "1004", homeTeam: "Spain", awayTeam: "England", kickoffTime: "2026-07-18T18:00:00Z", status: "not_started" },
];
