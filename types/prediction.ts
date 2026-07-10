/**
 * Mirrors the Rust `PredictionType` enum (programs/conquest-bet/src/state.rs).
 * String-keyed for JSON/API friendliness.
 */
export enum PredictionType {
  MatchWinner = "match_winner",
  OverUnderGoals = "over_under_goals",
  BothTeamsScore = "both_teams_score",
  CustomProp = "custom_prop",
}
