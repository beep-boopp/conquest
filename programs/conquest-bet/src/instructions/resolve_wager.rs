use anchor_lang::prelude::*;

use crate::errors::ConquestBetError;
use crate::state::{Room, Wager, WagerOutcome, WagerStatus};

#[derive(Accounts)]
pub struct ResolveWager<'info> {
    #[account(mut)]
    pub room: Account<'info, Room>,

    #[account(
        mut,
        constraint = wager.room == room.key() @ ConquestBetError::WagerRoomMismatch,
        constraint = wager.status == WagerStatus::Locked @ ConquestBetError::InvalidWagerStatus,
    )]
    pub wager: Account<'info, Wager>,

    pub resolver: Signer<'info>,

    // ---- Layer 2 (stub): TxLINE on-chain verification ----
    // TODO: Once we have a live API response showing the exact Merkle proof
    // structure and base_key encoding (see docs/txline-score-shapes.md — the
    // base_key values behind the (period*1000)+base_key stat-key formula are
    // still undocumented), this will CPI into TxLINE's `validate_stat`
    // instruction here, passing `merkle_proof_account`'s proof data and
    // `wager.fixture_id` / the derived stat key(s), to trustlessly confirm
    // `match_result` on-chain before the settlement below runs. Until that
    // CPI exists, `match_result` below is a caller-supplied argument with NO
    // on-chain verification — resolve_wager is NOT trustless yet.
    /// CHECK: TxLINE program address, CPI target for `validate_stat`. Unused
    /// until the CPI described above is wired up.
    pub txline_program: UncheckedAccount<'info>,

    /// CHECK: TxLINE Merkle-proof account covering wager.fixture_id's
    /// stat(s). Unused until the CPI described above is wired up.
    pub merkle_proof_account: UncheckedAccount<'info>,
}

/// Settles a Locked wager using `match_result` (same u8 outcome-code
/// convention as proposer_predicted_outcome / opponent_predicted_outcome —
/// see Wager's doc comment in state.rs). Compares match_result against both
/// predictions:
/// - matches proposer's prediction -> ProposerWon, they take the full pot
/// - matches opponent's prediction -> OpponentWon, they take the full pot
/// - matches neither                -> Push, both stakes refunded as-is
///
/// LAYER 1 ONLY — see the txline_program / merkle_proof_account TODO on the
/// Context above for the planned CPI verification that replaces this.
pub fn resolve_wager_handler(ctx: Context<ResolveWager>, match_result: u8) -> Result<()> {
    let room = &mut ctx.accounts.room;
    let wager = &mut ctx.accounts.wager;

    let proposer_idx = room
        .player_index(&wager.proposer)
        .ok_or(ConquestBetError::InvalidPlayer)?;
    let opponent_idx = room
        .player_index(&wager.opponent)
        .ok_or(ConquestBetError::InvalidPlayer)?;
    // Guaranteed present: accept_wager only reaches WagerStatus::Locked
    // after setting opponent_predicted_outcome.
    let opponent_predicted_outcome = wager
        .opponent_predicted_outcome
        .ok_or(ConquestBetError::InvalidWagerStatus)?;

    let outcome = if match_result == wager.proposer_predicted_outcome {
        WagerOutcome::ProposerWon
    } else if match_result == opponent_predicted_outcome {
        WagerOutcome::OpponentWon
    } else {
        WagerOutcome::Push
    };

    match outcome {
        WagerOutcome::ProposerWon => {
            let pot = wager
                .proposer_stake
                .checked_add(wager.opponent_stake)
                .ok_or(ConquestBetError::MathOverflow)?;
            room.land_balances[proposer_idx] = room.land_balances[proposer_idx]
                .checked_add(pot)
                .ok_or(ConquestBetError::MathOverflow)?;
        }
        WagerOutcome::OpponentWon => {
            let pot = wager
                .proposer_stake
                .checked_add(wager.opponent_stake)
                .ok_or(ConquestBetError::MathOverflow)?;
            room.land_balances[opponent_idx] = room.land_balances[opponent_idx]
                .checked_add(pot)
                .ok_or(ConquestBetError::MathOverflow)?;
        }
        WagerOutcome::Push => {
            room.land_balances[proposer_idx] = room.land_balances[proposer_idx]
                .checked_add(wager.proposer_stake)
                .ok_or(ConquestBetError::MathOverflow)?;
            room.land_balances[opponent_idx] = room.land_balances[opponent_idx]
                .checked_add(wager.opponent_stake)
                .ok_or(ConquestBetError::MathOverflow)?;
        }
    }

    wager.status = WagerStatus::Resolved;
    wager.outcome = Some(outcome);

    Ok(())
}
