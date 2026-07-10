import { PredictionType } from "./prediction";

/** Mirrors the Rust `WagerStatus` enum. */
export enum WagerStatus {
  Proposed = "proposed",
  Locked = "locked",
  Resolved = "resolved",
  Cancelled = "cancelled",
}

/** Mirrors the Rust `WagerOutcome` enum. */
export enum WagerOutcome {
  ProposerWon = "proposer_won",
  OpponentWon = "opponent_won",
  Push = "push",
}

/**
 * Client-side view of the on-chain Wager account.
 *
 * `proposerPredictedOutcome` / `opponentPredictedOutcome` are opaque numeric
 * codes whose meaning depends on `predictionType` — see the Rust `Wager`
 * doc comment in programs/conquest-bet/src/state.rs.
 */
export interface Wager {
  address: string;
  room: string;
  proposer: string;
  opponent: string;
  predictionType: PredictionType;
  fixtureId: string;
  proposerPredictedOutcome: number;
  opponentPredictedOutcome?: number;
  proposerStake: number;
  opponentStake: number;
  status: WagerStatus;
  outcome?: WagerOutcome;
}
