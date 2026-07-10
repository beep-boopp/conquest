use anchor_lang::prelude::*;

use crate::errors::ConquestBetError;
use crate::state::{Room, RoomCompleted, RoomStatus};

#[derive(Accounts)]
pub struct ClaimVictory<'info> {
    #[account(mut)]
    pub room: Account<'info, Room>,

    pub claimant: Signer<'info>,
}

/// Ends the room once either any player has been reduced to 0 land, or the
/// caller attests the tournament itself has concluded (`tournament_complete`
/// — an unverified off-chain attestation for now, same Layer-1-stub pattern
/// as resolve_wager's match_result, pending TxLINE fixtures data being wired
/// in to confirm the World Cup has actually ended). Any room member may
/// call this. Sets room.status = Completed and emits a RoomCompleted event
/// naming the player with the highest land_balances entry as the winner
/// (read-only; no extra state needed beyond status).
pub fn claim_victory_handler(ctx: Context<ClaimVictory>, tournament_complete: bool) -> Result<()> {
    let room = &mut ctx.accounts.room;
    let claimant_key = ctx.accounts.claimant.key();
    let player_count = room.player_count as usize;

    require!(
        room.player_index(&claimant_key).is_some(),
        ConquestBetError::InvalidPlayer
    );
    require!(
        room.status != RoomStatus::Completed,
        ConquestBetError::RoomAlreadyCompleted
    );

    let any_player_eliminated = room.land_balances[..player_count].iter().any(|&land| land == 0);
    require!(
        any_player_eliminated || tournament_complete,
        ConquestBetError::RoomNotComplete
    );

    // Ties resolve to the last-encountered max index (max_by_key semantics).
    let (winner_idx, winner_land) = room.land_balances[..player_count]
        .iter()
        .enumerate()
        .max_by_key(|&(_, &land)| land)
        .map(|(idx, &land)| (idx, land))
        .ok_or(ConquestBetError::InvalidPlayer)?;
    let winner_key = room.players[winner_idx];
    let room_key = room.key();

    room.status = RoomStatus::Completed;

    emit!(RoomCompleted {
        room: room_key,
        winner: winner_key,
        winner_land,
    });

    Ok(())
}
