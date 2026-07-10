use anchor_lang::prelude::*;

use crate::constants::WAGER_SEED;
use crate::errors::ConquestBetError;
use crate::state::{PredictionType, Room, Wager, WagerStatus};

#[derive(Accounts)]
#[instruction(wager_id: u64)]
pub struct ProposeWager<'info> {
    #[account(mut)]
    pub room: Account<'info, Room>,

    #[account(
        init,
        payer = proposer,
        space = Wager::LEN,
        seeds = [WAGER_SEED, room.key().as_ref(), wager_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub wager: Account<'info, Wager>,

    #[account(mut)]
    pub proposer: Signer<'info>,

    /// CHECK: identity-only reference; the opponent does not need to sign
    /// until accept_wager.
    pub opponent: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

/// Creates the Wager PDA in Proposed status, storing the proposer's
/// prediction and stake. Marks the room as started (blocking further
/// join_room calls) on the first wager proposed in the room.
pub fn propose_wager_handler(
    ctx: Context<ProposeWager>,
    wager_id: u64,
    prediction_type: PredictionType,
    fixture_id: u64,
    proposer_predicted_outcome: u8,
    land_stake: u64,
) -> Result<()> {
    let proposer_key = ctx.accounts.proposer.key();
    let opponent_key = ctx.accounts.opponent.key();
    require!(proposer_key != opponent_key, ConquestBetError::InvalidPlayer);

    let room = &mut ctx.accounts.room;
    let proposer_idx = room
        .player_index(&proposer_key)
        .ok_or(ConquestBetError::InvalidPlayer)?;
    require!(
        room.player_index(&opponent_key).is_some(),
        ConquestBetError::InvalidPlayer
    );
    require!(
        room.land_balances[proposer_idx] >= land_stake,
        ConquestBetError::InsufficientLand
    );

    room.started = true;
    let room_key = room.key();

    ctx.accounts.wager.set_inner(Wager {
        room: room_key,
        wager_id,
        proposer: proposer_key,
        opponent: opponent_key,
        prediction_type,
        fixture_id,
        proposer_predicted_outcome,
        opponent_predicted_outcome: None,
        proposer_stake: land_stake,
        opponent_stake: 0,
        status: WagerStatus::Proposed,
        outcome: None,
        bump: ctx.bumps.wager,
    });

    Ok(())
}
