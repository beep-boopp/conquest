use anchor_lang::prelude::*;

use crate::constants::{MAX_MIKU_BETTORS, MAX_PLAYERS_PER_ROOM};

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
    // Appended, not inserted — Borsh encodes enums by declaration order, so
    // new variants must go at the end to stay compatible with any Wager
    // accounts already created on-chain.
    ExtraTime,
    Penalties,
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

/// Global singleton pool for the "Miku Cup" side-bet: any player can lock a
/// fixed MIKU_BET_AMOUNT into one of three teams, independent of any Room.
/// This is a symbolic stake, not a deduction from a Room's land_balances —
/// there is no global per-wallet land balance anywhere else in this program,
/// so Miku Cup intentionally doesn't touch real Room land. `bettors` /
/// `bettor_teams` are parallel fixed-size arrays (same pattern as
/// Room::players / Room::land_balances) indexed together and sliced to
/// `bettor_count`.
#[account]
pub struct MikuPool {
    pub total_england: u64,
    pub total_argentina: u64,
    pub total_spain: u64,
    /// 0 = England, 1 = Argentina, 2 = Spain. Leading team by total stake
    /// pre-resolution; locked to the winner once is_resolved is true.
    pub current_holder: u8,
    pub is_resolved: bool,
    pub total_pool: u64,
    pub bettors: [Pubkey; MAX_MIKU_BETTORS],
    pub bettor_teams: [u8; MAX_MIKU_BETTORS],
    pub bettor_count: u8,
    pub bump: u8,
}

impl MikuPool {
    pub const LEN: usize = 8 // discriminator
        + 8 // total_england
        + 8 // total_argentina
        + 8 // total_spain
        + 1 // current_holder
        + 1 // is_resolved
        + 8 // total_pool
        + (32 * MAX_MIKU_BETTORS) // bettors
        + MAX_MIKU_BETTORS // bettor_teams
        + 1 // bettor_count
        + 1; // bump

    pub fn has_bet(&self, bettor: &Pubkey) -> bool {
        self.bettors[..self.bettor_count as usize].contains(bettor)
    }
}
