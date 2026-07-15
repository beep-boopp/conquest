use anchor_lang::prelude::*;

use crate::constants::MIKU_POOL_SEED;
use crate::errors::ConquestBetError;
use crate::state::MikuPool;

#[derive(Accounts)]
pub struct ResolveMikuCup<'info> {
    // Boxed — see place_miku_bet.rs's comment on why MikuPool must be heap-allocated.
    #[account(
        mut,
        seeds = [MIKU_POOL_SEED],
        bump = miku_pool.bump,
    )]
    pub miku_pool: Box<Account<'info, MikuPool>>,

    // Any signer, same Layer-1 trust model as resolve_wager — no on-chain
    // TxLINE verification yet, result is a caller-supplied argument.
    pub resolver: Signer<'info>,
}

/// Crowns `winning_team` (0=England, 1=Argentina, 2=Spain). No land moves —
/// see place_miku_bet's doc comment for why Miku Cup stakes are symbolic.
pub fn resolve_miku_cup_handler(ctx: Context<ResolveMikuCup>, winning_team: u8) -> Result<()> {
    require!(winning_team <= 2, ConquestBetError::InvalidTeam);

    let pool = &mut ctx.accounts.miku_pool;
    require!(!pool.is_resolved, ConquestBetError::MikuCupAlreadyResolved);

    pool.is_resolved = true;
    pool.current_holder = winning_team;

    Ok(())
}
