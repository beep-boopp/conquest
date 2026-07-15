use anchor_lang::prelude::*;

use crate::constants::MIKU_POOL_SEED;
use crate::state::MikuPool;

#[derive(Accounts)]
pub struct ResetMikuCup<'info> {
    // Boxed — see place_miku_bet.rs's comment on why MikuPool must be heap-allocated.
    #[account(
        mut,
        seeds = [MIKU_POOL_SEED],
        bump = miku_pool.bump,
    )]
    pub miku_pool: Box<Account<'info, MikuPool>>,

    // Any signer — same trust model as resolve_miku_cup/resolve_wager. Wipes
    // the pool back to a fresh, unbet state (e.g. before a live demo, or
    // between tournament stages). Does not close the account, just zeroes
    // its bookkeeping fields; bettors/bettor_teams are left as stale bytes
    // but are harmless since every reader slices them to bettor_count.
    pub resolver: Signer<'info>,
}

pub fn reset_miku_cup_handler(ctx: Context<ResetMikuCup>) -> Result<()> {
    let pool = &mut ctx.accounts.miku_pool;
    pool.total_england = 0;
    pool.total_argentina = 0;
    pool.total_spain = 0;
    pool.current_holder = 0;
    pool.is_resolved = false;
    pool.total_pool = 0;
    pool.bettor_count = 0;
    Ok(())
}
