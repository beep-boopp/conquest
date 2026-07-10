import { PredictionType } from "@/types";

/**
 * Human-readable labels for the opaque u8 outcome codes stored on-chain.
 * Mirrors the encoding documented on Wager in programs/conquest-bet/src/state.rs.
 */
export const PREDICTION_OUTCOME_OPTIONS: Record<PredictionType, { code: number; label: string }[]> = {
  [PredictionType.MatchWinner]: [
    { code: 0, label: "Home win" },
    { code: 1, label: "Draw" },
    { code: 2, label: "Away win" },
  ],
  [PredictionType.OverUnderGoals]: [
    { code: 0, label: "Under" },
    { code: 1, label: "Over" },
  ],
  [PredictionType.BothTeamsScore]: [
    { code: 0, label: "No" },
    { code: 1, label: "Yes" },
  ],
  [PredictionType.CustomProp]: [
    { code: 0, label: "No" },
    { code: 1, label: "Yes" },
  ],
};

export const PREDICTION_TYPE_LABELS: Record<PredictionType, string> = {
  [PredictionType.MatchWinner]: "Match Winner",
  [PredictionType.OverUnderGoals]: "Over/Under Goals",
  [PredictionType.BothTeamsScore]: "Both Teams to Score",
  [PredictionType.CustomProp]: "Custom Prop",
};
