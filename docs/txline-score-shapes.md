# TxLINE Score Data Shapes (soccer-focused)

Source: TxLINE OpenAPI spec (`https://txline.txodds.com/docs/docs.yaml`) + `documentation/scores/soccer-feed` page. See `docs/txline-api-reference.md` for endpoint method/headers/params.

Endpoints:
- **Snapshot**: `GET /api/scores/snapshot/{fixtureId}` — latest state per action type, optionally `asOf` a historical timestamp.
- **Full sequence**: `GET /api/scores/historical/{fixtureId}` — every score update for a fixture, only valid for fixtures started 6h–2wk ago. (There's also `GET /api/scores/updates/{fixtureId}` for the *current 5-min window only* — not the full sequence.)

Both return `Scores[]` — same shape either way, just different slices of the update stream.

⚠️ **Not documented anywhere in TxLINE's docs** (OpenAPI spec nor doc pages): no example JSON payloads exist, and `action` / `Type` / `Outcome` fields are typed as plain `string` in the spec — **not** closed enums. The actual string values a live feed emits (e.g. `"Goal"` vs `"GOAL"` vs `"goal"`) are unconfirmed. Treat anything below labeled "field exists" as structurally real; treat exact string casing as unverified until you see a live payload.

---

## Top-level `Scores` object

Required on every update:
```ts
interface Scores {
  fixtureId: number;        // int32
  gameState: string;        // lifecycle string, values not enumerated in spec
  startTime: number;        // int64, epoch ms
  isTeam: boolean;
  fixtureGroupId: number;   // int32
  competitionId: number;    // int32
  countryId: number;        // int32
  sportId: number;          // int32
  participant1IsHome: boolean;
  participant2Id: number;   // int32
  participant1Id: number;   // int32
  action: string;           // the event-type discriminator for this update — open string, values not enumerated
  id: number;                // int32, update id
  ts: number;                 // int64 epoch ms — every update is timestamped
  connectionId: number;      // int64
  seq: number;                // int32 — sequence number within the fixture; use to order/reconstruct history
  ...optional fields below
}
```

Optional, sport-discriminated by `type: "Soccer" | "Basketball" | "UsFootball"`:
```ts
{
  type?: "Soccer" | "Basketball" | "UsFootball";
  confirmed?: boolean;             // whether this update is confirmed (vs provisional)
  coverageSecondaryData?: boolean;
  coverageType?: string;

  statusSoccerId?: SoccerFixtureStatus;   // see status codes below
  scoreSoccer?: SoccerFixtureScore;       // running score breakdown, see below
  dataSoccer?: SoccerData;                // per-event soccer fields, see below
  clock?: SoccerFixtureClock;             // { running: boolean, seconds: number } — NOTE: field name is generic
                                           //   `clock`, not `clockSoccer`, despite sport-specific siblings being
                                           //   suffixed — this is how the spec is written, unconfirmed if intentional
  kickoff?: KickoffDetails;               // { Team?: Participant } — soccer kickoff-only, US-football's KickoffInfo is separate
  stats?: Record<string, number>;         // Map_ScoreStatKey — see stat-key encoding below
  participant?: number;                    // int32 — which side (1 or 2) this event belongs to
  lineups?: LineupData[];                  // team rosters, see Player identity below
  possession?: number;                     // int32
  possessionType?: "AttackPossession" | "DangerPossession" | "HighDangerPossession" | "SafePossession";
  parti1StateSoccer?: SoccerPartiState;    // { PossibleEvent: { Goal, Penalty, Corner: boolean } }
  parti2StateSoccer?: SoccerPartiState;
  possibleEventSoccer?: { RedCard: boolean; YellowCard: boolean; VAR: boolean };  // SoccerPossibleNeutralEvent
  playerStatsSoccer?: { Participant1: Record<string, SoccerPlayerStats>; Participant2: Record<string, SoccerPlayerStats> };
  // basketball/us-football equivalents also exist (statusBasketballId, statusId, score, data, down, inPlayInfo, kickoffInfo, etc.) — omitted here, out of scope
}
```

---

## Event data: `SoccerData` (the actual "what happened" object)

This is where individual event details live — attached to an update via `dataSoccer` when `action`/`type` indicates a soccer event.

```ts
interface SoccerData {
  Action?: string;              // free string, sub-classifies the event — exact values undocumented
  Type?: string;                // free string — exact values undocumented
  Color?: string;
  Conditions?: string[];        // weather/pitch condition union (SoccerCondition), values undocumented
  Corner?: boolean;              // this event is a corner
  FreeKickType?: "Attack" | "Danger" | "HighDanger" | "Offside" | "Safe";
  Goal?: boolean;                 // this event is a goal
  GoalType?: "Head" | "Other" | "OwnGoal" | "Shot";
  Minutes?: number;                // int32 — match minute of the event ✅ minute data exists
  Outcome?: string;                // union of ShotOutcome/SoccerPenaltyOutcome/InjuryOutcome, values undocumented
  Participant?: number;            // int32 — 1 or 2, which side
  Penalty?: boolean;               // this event is a penalty (kick)
  PlayerId?: number;               // int32 — scorer/carded/subbed player's numeric ID ✅ player ID exists
  PlayerInId?: number;             // int32 — substitution: player coming on
  PlayerOutId?: number;            // int32 — substitution: player going off
  RedCard?: boolean;
  YellowCard?: boolean;
  VAR?: boolean;                    // VAR involved in this event
  ThrowInType?: "Attack" | "Danger" | "Safe";
  StatusId?: number;                // int32
  VenueType?: "Away" | "Home" | "Neutral";
  New?: SoccerUpdateReference;      // state-after-change diff (same shape as SoccerData core fields)
  Previous?: SoccerUpdateReference; // state-before-change diff
}
```

**No `PlayerName` or `ScorerName` field exists anywhere in event data.** Goal/card/sub events carry only numeric `PlayerId`. To get a name, cross-reference against `lineups` (see Player identity below).

**No explicit "event type enum"** — `action`/`Action`/`Type` are all open strings. The presence of specific boolean flags (`Goal`, `Corner`, `Penalty`, `RedCard`, `YellowCard`, `VAR`) is the actual structural signal for what kind of event occurred, rather than a single canonical event-type string.

---

## Fixture status codes — extra time & penalties ARE explicit

`statusSoccerId` (`SoccerFixtureStatus`) is a closed set of short codes, confirmed via the soccer-feed doc page:

| Code | Meaning |
|---|---|
| `NS` | Not started |
| `H1` | First half in play |
| `HT` | Half-time |
| `H2` | Second half in play |
| `F` (schema title on `F2`) | Ended / finished (regular time) |
| `WET` | Waiting for extra time |
| `ET1` | Extra time, first half |
| `ET2` | Extra time, second half |
| `HTET` | Extra-time half-time break |
| `FET` | Ended after extra time |
| `WPE` | Waiting for penalty shootout |
| `PE` | Penalty shootout in progress |
| `FPE` | Ended after penalty shootout |
| `I` | Interrupted |
| `A` | Abandoned |
| `C` | Cancelled |
| `P` | Postponed |
| `TXCC` | TX coverage cancelled |
| `TXCS` | TX coverage suspended |

So: **"went to extra time"** = fixture ever reaches `ET1`/`ET2`/`HTET`/`FET`. **"went to penalties"** = fixture ever reaches `WPE`/`PE`/`FPE`. These are unambiguous, directly queryable status values — resolve_wager can check the final/latest `statusSoccerId` (or scan the update sequence for these codes) rather than inferring from score deltas.

---

## Score breakdown by period

```ts
interface SoccerFixtureScore { Participant1: SoccerTotalScore; Participant2: SoccerTotalScore; }

interface SoccerTotalScore {
  H1?: SoccerScore;       // first half
  HT?: SoccerScore;       // at half-time
  H2?: SoccerScore;       // second half
  ET1?: SoccerScore;      // extra time first half
  ET2?: SoccerScore;      // extra time second half
  PE?: SoccerScore;       // penalty shootout
  ETTotal?: SoccerScore;  // extra time combined
  Total?: SoccerScore;    // full match total (this is the one for MatchWinner/OverUnder resolution)
}

interface SoccerScore {
  Goals: number;        // int32
  YellowCards: number;  // int32
  RedCards: number;     // int32
  Corners: number;      // int32
}
```
Note: `PE` (penalty shootout) score is tracked separately from `Total` — a penalty-shootout winner is not the same as "more goals," relevant if `resolve_wager` ever needs to distinguish regulation/ET result from shootout result.

---

## Clock (minute/timestamp data)

Two independent sources of "when":
- **`ts`** (top-level, every `Scores` update) — int64 epoch-ms wall-clock timestamp of the update itself.
- **`clock`** (`SoccerFixtureClock`) — `{ running: boolean, seconds: number }`, the in-match clock (elapsed seconds, whether currently ticking).
- **`SoccerData.Minutes`** — int32 match-minute attached to a specific event (e.g. "goal in the 87th minute").

So yes — both event-level minute and fixture-level running clock/timestamp data exist.

---

## Player identity — ID in events, name via lineups

Event objects (`SoccerData`) only carry numeric `PlayerId` / `PlayerInId` / `PlayerOutId`. Names live in the `lineups` field on `Scores`:

```ts
interface LineupData {
  id: string;
  normativeId: number;         // int32 — this is what PlayerId in event data refers to
  preferredName: string;
  gender: string;
  updateDateMillis: number;    // int64
  lineups?: PlayerLineupData[];
}

interface PlayerLineupData {
  fixturePlayerId: number;  // int32
  statusId: number;         // int32
  positionId: number;       // int32
  unitId: number;           // int32
  rosterNumber: string;
  starter: boolean;
  starred: boolean;
  player: PlayerData;
}

interface PlayerData {
  id: string;
  normativeId: number;   // int32 — match against SoccerData.PlayerId
  country: string;
  team: string;
  dateOfBirth: string;
  gender: string;
  preferredName: string; // ✅ the actual scorer's name
  updateDateMillis: number; // int64
}
```
To resolve "who scored," join `SoccerData.PlayerId` against `lineups[].lineups[].player.normativeId` and read `preferredName`.

---

## Stat-key encoding (for Merkle stat-validation / resolve_wager)

`Scores.stats` is `Record<string, number>` (`Map_ScoreStatKey`) — a flat map of numeric stat keys to int32 values, additionally exposed structurally via `ScoreStat { key: number, value: number, period: number }` (used by `/api/scores/stat-validation`, see `docs/txline-api-reference.md` #7).

Per the soccer-feed doc page, keys are period-encoded:
```
stat_key = (period * 1000) + base_key
```
Period multipliers: First Half = 1000, Second Half = 2000, Extra Time 1 = 3000, Extra Time 2 = 4000, Penalty Shootout = 5000.

`base_key` values themselves (e.g. which base key means "goals" vs "corners") are **not documented** in what's fetchable — only the period-offset formula is given. This will need either a live API sample or direct confirmation from TxLINE before `resolve_wager`'s Merkle validation logic can target a specific stat.

---

## Open questions for resolve_wager (unresolved by docs)

1. Exact string values for `action`, `Type`, `Outcome` fields — undocumented, need a live payload sample.
2. `base_key` numeric meanings for the stat-key formula above — undocumented.
3. Whether `gameState` (top-level) and `statusSoccerId` ever disagree, and which is authoritative for "match is over."
4. No confirmed example of a `stat-validation` response's `statToProve.value` in practice — worth a live call against a real fixture before wiring resolution logic.
