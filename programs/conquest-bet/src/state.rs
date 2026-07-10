use anchor_lang::prelude::*;

use crate::constants::MAX_PLAYERS_PER_ROOM;

/// A private room where 2-5 friends compete for land over the tournament.
///
/// `players` and `land_balances` are parallel fixed-size arrays indexed
/// together (players[i] owns land_balances[i]). Unused slots hold
/// Pubkey::default() / 0. Fixed size avoids needing account realloc logic.
#[account]
pub struct Room {
    pub creator: Pubkey,
    pub room_id: u64,
    pub players: [Pubkey; MAX_PLAYERS_PER_ROOM],
    pub land_balances: [u64; MAX_PLAYERS_PER_ROOM],
    pub player_count: u8,
    /// Flips to true when the first wager is proposed in this room, after
    /// which join_room is rejected — keeps the roster fixed once play begins.
    pub started: bool,
    pub status: RoomStatus,
    pub bump: u8,
}

impl Room {
    pub const LEN: usize = 8 // discriminator
        + 32 // creator
        + 8 // room_id
        + (32 * MAX_PLAYERS_PER_ROOM) // players
        + (8 * MAX_PLAYERS_PER_ROOM) // land_balances
        + 1 // player_count
        + 1 // started
        + 1 // status
        + 1; // bump

    /// Index of `player` within the active `players[..player_count]` slice, if present.
    pub fn player_index(&self, player: &Pubkey) -> Option<usize> {
        self.players[..self.player_count as usize]
            .iter()
            .position(|p| p == player)
    }
}

/// A single agreed-upon prediction wager between two players in a room.
///
/// `proposer_predicted_outcome` / `opponent_predicted_outcome` are opaque u8
/// codes whose meaning depends on `prediction_type` (e.g. for MatchWinner:
/// 0 = Participant1, 1 = Draw, 2 = Participant2; for OverUnderGoals:
/// 0 = Under, 1 = Over). Interpreted off-chain and by resolve_wager.
#[account]
pub struct Wager {
    pub room: Pubkey,
    pub wager_id: u64,
    pub proposer: Pubkey,
    pub opponent: Pubkey,
    pub prediction_type: PredictionType,
    // TODO: confirm TxLINE fixture id format (numeric vs string) once TxLINE devnet IDL is available
    pub fixture_id: u64,
    pub proposer_predicted_outcome: u8,
    pub opponent_predicted_outcome: Option<u8>,
    pub proposer_stake: u64,
    pub opponent_stake: u64,
    pub status: WagerStatus,
    pub outcome: Option<WagerOutcome>,
    pub bump: u8,
}

impl Wager {
    pub const LEN: usize = 8 // discriminator
        + 32 // room
        + 8 // wager_id
        + 32 // proposer
        + 32 // opponent
        + 1 // prediction_type
        + 8 // fixture_id
        + 1 // proposer_predicted_outcome
        + (1 + 1) // opponent_predicted_outcome (Option<u8>)
        + 8 // proposer_stake
        + 8 // opponent_stake
        + 1 // status
        + (1 + 1) // outcome (Option<WagerOutcome>)
        + 1; // bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum RoomStatus {
    Active,
    Completed,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum WagerStatus {
    Proposed,
    Locked,
    Resolved,
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum PredictionType {
    MatchWinner,
    OverUnderGoals,
    BothTeamsScore,
    CustomProp,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum WagerOutcome {
    ProposerWon,
    OpponentWon,
    Push,
}

/// Emitted by claim_victory. Winner is surfaced via event rather than
/// persisted on Room, since it's derivable read-only from land_balances.
#[event]
pub struct RoomCompleted {
    pub room: Pubkey,
    pub winner: Pubkey,
    pub winner_land: u64,
}
