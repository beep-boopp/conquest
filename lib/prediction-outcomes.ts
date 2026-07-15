import { PredictionType } from "@/types";

/**
 * Human-readable labels for the opaque u8 outcome codes stored on-chain.
 * Mirrors the encoding documented on Wager in programs/conquest-bet/src/state.rs.
 *
 * MatchWinner is hardcoded to the one real match live right now (England v
 * Argentina, TxLINE fixture 18241006) — England is TxLINE's home team for
 * this fixture, Argentina is away (confirmed via getFixtures()), so code 0
 * / code 2 line up exactly with what resolve-live-match.ts will compute
 * from the real result. No draw option: this is a knockout match, always
 * decided via extra time/penalties, so match-result.ts's winnerOutcome can
 * never actually land on code 1 here. Revisit this hardcoding if/when more
 * than one match is ever live at once.
 */
export const PREDICTION_OUTCOME_OPTIONS: Record<PredictionType, { code: number; label: string }[]> = {
  [PredictionType.MatchWinner]: [
    { code: 0, label: "England" },
    { code: 2, label: "Argentina" },
  ],
  [PredictionType.OverUnderGoals]: [
    { code: 0, label: "Under 2.5 Goals" },
    { code: 1, label: "Over 2.5 Goals" },
  ],
  [PredictionType.BothTeamsScore]: [
    { code: 0, label: "No" },
    { code: 1, label: "Yes" },
  ],
  [PredictionType.CustomProp]: [
    { code: 0, label: "No" },
    { code: 1, label: "Yes" },
  ],
  [PredictionType.ExtraTime]: [
    { code: 0, label: "No" },
    { code: 1, label: "Yes" },
  ],
  [PredictionType.Penalties]: [
    { code: 0, label: "No" },
    { code: 1, label: "Yes" },
  ],
};

export const PREDICTION_TYPE_LABELS: Record<PredictionType, string> = {
  [PredictionType.MatchWinner]: "Match Winner",
  [PredictionType.OverUnderGoals]: "Over/Under Goals",
  [PredictionType.BothTeamsScore]: "Both Teams to Score",
  [PredictionType.CustomProp]: "Custom Prop",
  [PredictionType.ExtraTime]: "Will it go to Extra Time?",
  [PredictionType.Penalties]: "Will it go to Penalties?",
};
