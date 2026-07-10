# TxLINE API Reference (condensed)

Base URLs: `https://txline.txodds.com` (prod) · `http://txline-dev.txodds.com` (devnet)

Common headers: `Authorization: Bearer <JWT>` (session JWT from `/auth/guest/start`), `X-Api-Token: <token>` (from `/api/token/activate`). Noted per-endpoint below.

---

## 1. POST /auth/guest/start
Headers: none
Body: none
Response `200`:
```ts
{ token: string }  // JWT, expires 30 days
```
Response `500`: `text/plain` string

---

## 2. POST /api/token/activate
Headers: `Authorization: Bearer <JWT>` (required)
Body (`application/json`):
```ts
{
  txSig: string;            // required
  walletSignature: string;  // required, base64
  leagues?: number[];       // int32[], empty for legacy/standard subscriptions
}
```
Response `200`: `text/plain` — the API token string (e.g. `txoracle_api_123abc456def`)
Response `400 | 401 | 403 | 500`: `text/plain` string

---

## 3. GET /api/fixtures/snapshot
Headers: `Authorization`, `X-Api-Token` (both required)
Query:
```ts
{ startEpochDay?: number; competitionId?: number /* int32 */ }
```
Response `200`:
```ts
Fixture[]

interface Fixture {
  Ts: number;               // int64
  StartTime: number;        // int64
  Competition: string;
  CompetitionId: number;    // int32
  FixtureGroupId: number;   // int32
  Participant1Id: number;   // int32
  Participant1: string;
  Participant2Id: number;   // int32
  Participant2: string;
  FixtureId: number;        // int64
  Participant1IsHome: boolean;
}
```

---

## 4. GET /api/scores/snapshot/{fixtureId}
Headers: `Authorization`, `X-Api-Token` (both required)
Path: `fixtureId: number` (int64)
Query: `{ asOf?: number /* int64 ms, historical if set, else live */ }`
Response `200`:
```ts
Scores[]

interface Scores {
  // required
  fixtureId: number;        // int32
  gameState: string;
  startTime: number;        // int64
  isTeam: boolean;
  fixtureGroupId: number;   // int32
  competitionId: number;    // int32
  countryId: number;        // int32
  sportId: number;          // int32
  participant1IsHome: boolean;
  participant2Id: number;   // int32
  participant1Id: number;   // int32
  action: string;
  id: number;                // int32
  ts: number;                 // int64
  connectionId: number;      // int64
  seq: number;                // int32

  // optional, sport-discriminated (type: Basketball | Soccer | UsFootball)
  type?: "Basketball" | "Soccer" | "UsFootball";
  confirmed?: boolean;
  coverageSecondaryData?: boolean;
  coverageType?: string;
  statusId?: UsFootballFixtureStatus;
  statusBasketballId?: BasketballFixtureStatus;
  statusSoccerId?: SoccerFixtureStatus;
  clock?: UsFootballFixtureClock;
  down?: UsFootballFixtureDown;
  inPlayInfo?: InPlayInfo;
  kickoffInfo?: KickoffInfo;
  kickoff?: KickoffDetails;
  score?: UsFootballFixtureScore;
  data?: UsFootballData;
  scoreBasketball?: BasketballFixtureScore;
  dataBasketball?: BasketballData;
  scoreSoccer?: SoccerFixtureScore;
  dataSoccer?: SoccerData;
  stats?: Record<string, number>;   // Map_ScoreStatKey, int32 values
  participant?: number;              // int32
  lineups?: LineupData[];
  possession?: number;               // int32
  possessionType?: SoccerPossessionType;
  parti1StateSoccer?: SoccerPartiState;
  parti1StateUsFootball?: UsFootballPartiState;
  parti1StateBasketball?: BasketballPartiState;
  parti2StateSoccer?: SoccerPartiState;
  parti2StateUsFootball?: UsFootballPartiState;
  parti2StateBasketball?: BasketballPartiState;
  possibleEventSoccer?: SoccerPossibleNeutralEvent;
  possibleEventUsFootball?: UsFootballPossibleEvent;
  playerStatsSoccer?: SoccerFixturePlayerStats;
  playerStatsUsFootball?: UsFootballFixturePlayerStats;
}
```

---

## 5. GET /api/scores/historical/{fixtureId}
(full sequence of score updates for a fixture; fixture start must be between 2 weeks and 6 hours in the past)
Headers: `Authorization`, `X-Api-Token` (both required)
Path: `fixtureId: number` (int64)
Response `200`: `Scores[]` (same `Scores` shape as #4)

---

## 6. GET /api/scores/stream
Headers: `Authorization`, `X-Api-Token` (both required), `Last-Event-ID?: string` (optional, resume)
Query: `{ fixtureId?: number /* int64, filter */ }`
Response `200` (`text/event-stream`):
```ts
// Data message
{ id: string /* "timestamp:index" */, event?: string, data: Scores }
// Heartbeat
{ event: "heartbeat", data: { Ts: number } }
```

---

## 7. GET /api/scores/stat-validation
Headers: `Authorization`, `X-Api-Token` (both required)
Query:
```ts
{
  fixtureId: number;   // int32, required
  seq: number;         // int32, required — sequence number of the scores event
  // Legacy mode:
  statKey?: number;    // int32
  statKey2?: number;   // int32
  // V2 mode (mutually exclusive with legacy):
  statKeys?: string;   // comma-separated int list
}
```
Response `200`: `ScoresStatValidation | ScoresStatValidationV2`
```ts
interface ScoreStat { key: number; value: number; period: number; }  // all int32

interface ScoresBatchSummary {
  fixtureId: number;              // int32
  updateStats: { updateCount: number; minTimestamp: number; maxTimestamp: number }; // int32,int64,int64
  eventStatsSubTreeRoot: string;  // binary
}

interface ProofNode { hash: string /* binary */; isRightSibling: boolean; }
type ProofList = ProofNode[] | null;

interface ScoresStatValidation {
  ts: number;                     // int64
  statToProve: ScoreStat;
  eventStatRoot: string;          // binary
  summary: ScoresBatchSummary;
  statProof: ProofList;
  subTreeProof: ProofList;
  mainTreeProof: ProofList;
  statToProve2?: ScoreStat;
  statProof2?: ProofList;
}

interface ScoresStatValidationV2 {
  ts: number;                     // int64
  statsToProve?: ScoreStat[];
  eventStatRoot: string;          // binary
  summary: ScoresBatchSummary;
  statProofs?: ProofList[];
  subTreeProof: ProofList;
  mainTreeProof: ProofList;
}
```

---

## 8. GET /api/odds/snapshot/{fixtureId}
Headers: `Authorization`, `X-Api-Token` (both required)
Path: `fixtureId: number` (int64)
Query: `{ asOf?: number /* int64 ms, historical if set, else live within current 5-min interval */ }`
Response `200`:
```ts
OddsPayload[]

interface OddsPayload {
  // required
  FixtureId: number;      // int64
  MessageId: string;
  Ts: number;              // int64
  Bookmaker: string;
  BookmakerId: number;     // int32
  SuperOddsType: string;
  InRunning: boolean;
  // optional
  GameState?: string;
  MarketParameters?: string;
  MarketPeriod?: string;
  PriceNames?: string[];
  Prices?: number[];       // int32[]
  Pct?: string[];          // pattern ^(NA|\d+\.\d{3})$
}
```

---

## Common error responses (all endpoints)
`400` invalid params · `401` invalid/expired JWT · `403` invalid API token/insufficient permissions · `500` internal error — all `text/plain` string bodies.
