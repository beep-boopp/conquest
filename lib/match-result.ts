/**
 * Parses TxLINE's raw /api/scores/snapshot/{fixtureId} (or /historical/)
 * response into the 3 outcomes ConquestBet resolves: match winner, extra
 * time, and penalties.
 *
 * Field shapes here are PascalCase (FixtureId, Score, ET1, PE, ...) —
 * confirmed against a real live/finished fixture. TxLINE's own OpenAPI docs
 * claim camelCase field names (see docs/txline-api-reference.md), which do
 * NOT match what the API actually returns. Trust this file over the docs.
 */

interface RawPeriodScore {
  Goals?: number;
  YellowCards?: number;
  RedCards?: number;
  Corners?: number;
}

interface RawParticipantScore {
  H1?: RawPeriodScore;
  HT?: RawPeriodScore;
  H2?: RawPeriodScore;
  ET1?: RawPeriodScore;
  ET2?: RawPeriodScore;
  ETTotal?: RawPeriodScore;
  PE?: RawPeriodScore;
  Total?: RawPeriodScore;
}

interface RawScoresEntry {
  FixtureId: number;
  Participant1IsHome?: boolean;
  Seq?: number;
  Score?: {
    Participant1?: RawParticipantScore;
    Participant2?: RawParticipantScore;
  };
}

export interface MatchResult {
  /** 0 = home win, 1 = draw, 2 = away win — matches PREDICTION_OUTCOME_OPTIONS[MatchWinner]. */
  winnerOutcome: 0 | 1 | 2;
  wentToExtraTime: boolean;
  wentToPenalties: boolean;
  /** Final goals for display (e.g. bracket score) — penalty-shootout goals when wentToPenalties. */
  homeGoals: number;
  awayGoals: number;
}

/**
 * `entries` is the full array returned by the scores endpoint — TxLINE
 * returns "latest state per action type", so no single entry is guaranteed
 * to hold the complete picture. We union ET/PE signals across every entry
 * (once a period happens, some entry reflects it) and take the Score from
 * the highest-Seq entry that actually has Total goals populated, for the
 * final tally.
 */
export function parseMatchResult(entries: RawScoresEntry[]): MatchResult {
  if (entries.length === 0) throw new Error("No score data for this fixture yet");

  let wentToExtraTime = false;
  let wentToPenalties = false;
  let bestEntry: RawScoresEntry | null = null;

  for (const entry of entries) {
    const p1 = entry.Score?.Participant1;
    const p2 = entry.Score?.Participant2;
    if (p1?.ET1 || p1?.ET2 || p1?.ETTotal || p2?.ET1 || p2?.ET2 || p2?.ETTotal) wentToExtraTime = true;
    if (p1?.PE || p2?.PE) wentToPenalties = true;

    const hasTotal = p1?.Total?.Goals !== undefined && p2?.Total?.Goals !== undefined;
    if (hasTotal && (!bestEntry || (entry.Seq ?? 0) >= (bestEntry.Seq ?? 0))) {
      bestEntry = entry;
    }
  }

  if (!bestEntry) throw new Error("No final score (Total.Goals) found in TxLINE data for this fixture yet");

  const p1 = bestEntry.Score!.Participant1!;
  const p2 = bestEntry.Score!.Participant2!;
  const isP1Home = bestEntry.Participant1IsHome !== false;

  let homeGoals: number;
  let awayGoals: number;

  if (wentToPenalties && p1.PE?.Goals !== undefined && p2.PE?.Goals !== undefined) {
    // Penalty shootout score is the decisive tiebreaker, not match goals —
    // regulation + extra time already ended level or PE wouldn't have happened.
    homeGoals = isP1Home ? p1.PE.Goals : p2.PE.Goals;
    awayGoals = isP1Home ? p2.PE.Goals : p1.PE.Goals;
  } else {
    homeGoals = isP1Home ? (p1.Total?.Goals ?? 0) : (p2.Total?.Goals ?? 0);
    awayGoals = isP1Home ? (p2.Total?.Goals ?? 0) : (p1.Total?.Goals ?? 0);
  }

  const winnerOutcome: 0 | 1 | 2 = homeGoals > awayGoals ? 0 : homeGoals < awayGoals ? 2 : 1;

  return { winnerOutcome, wentToExtraTime, wentToPenalties, homeGoals, awayGoals };
}
