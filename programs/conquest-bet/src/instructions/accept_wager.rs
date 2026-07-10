use anchor_lang::prelude::*;

use crate::errors::ConquestBetError;
use crate::state::{Room, Wager, WagerStatus};

#[derive(Accounts)]
pub struct AcceptWager<'info> {
    #[account(mut)]
    pub room: Account<'info, Room>,

    pub opponent: Signer<'info>,

    #[account(
        mut,
        constraint = wager.room == room.key() @ ConquestBetError::WagerRoomMismatch,
        constraint = wager.opponent == opponent.key() @ ConquestBetError::InvalidPlayer,
        constraint = wager.status == WagerStatus::Proposed @ ConquestBetError::InvalidWagerStatus,
    )]
    pub wager: Account<'info, Wager>,
}

/// Locks in the opponent's predicted outcome (must differ from the
/// proposer's) and land_stake, deducting both players' stakes from their
/// available room land_balances now that the wager is Locked.
pub fn accept_wager_handler(ctx: Context<AcceptWager>, predicted_outcome: u8, land_stake: u64) -> Result<()> {
    require!(
        predicted_outcome != ctx.accounts.wager.proposer_predicted_outcome,
        ConquestBetError::SamePredictedOutcome
    );

    let room = &mut ctx.accounts.room;
    let wager = &mut ctx.accounts.wager;

    let proposer_idx = room
        .player_index(&wager.proposer)
        .ok_or(ConquestBetError::InvalidPlayer)?;
    let opponent_idx = room
        .player_index(&wager.opponent)
        .ok_or(ConquestBetError::InvalidPlayer)?;

    room.land_balances[proposer_idx] = room.land_balances[proposer_idx]
        .checked_sub(wager.proposer_stake)
        .ok_or(ConquestBetError::InsufficientLand)?;
    room.land_balances[opponent_idx] = room.land_balances[opponent_idx]
        .checked_sub(land_stake)
        .ok_or(ConquestBetError::InsufficientLand)?;

    wager.opponent_predicted_outcome = Some(predicted_outcome);
    wager.opponent_stake = land_stake;
    wager.status = WagerStatus::Locked;

    Ok(())
}
