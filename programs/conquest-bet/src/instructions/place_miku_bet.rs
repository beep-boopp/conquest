use anchor_lang::prelude::*;

use crate::constants::{MAX_MIKU_BETTORS, MIKU_BET_AMOUNT, MIKU_POOL_SEED};
use crate::errors::ConquestBetError;
use crate::state::MikuPool;

#[derive(Accounts)]
pub struct PlaceMikuBet<'info> {
    // Boxed: MikuPool (~3.3KB, holds 100 fixed-size bettor slots) overflows
    // the BPF program's 4KB stack frame if deserialized inline — boxing
    // moves it to the heap, same fix Anchor recommends for any large account.
    #[account(
        init_if_needed,
        payer = bettor,
        space = MikuPool::LEN,
        seeds = [MIKU_POOL_SEED],
        bump,
    )]
    pub miku_pool: Box<Account<'info, MikuPool>>,

    #[account(mut)]
    pub bettor: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// Locks a fixed MIKU_BET_AMOUNT into the global Miku Cup pool for `team`
/// (0=England, 1=Argentina, 2=Spain). Symbolic stake only — does not touch
/// any Room's land_balances, since there is no global per-wallet land
/// balance in this program. `init_if_needed` zero-initializes every field on
/// the pool's first-ever bet, so this handler needs no separate init path.
pub fn place_miku_bet_handler(ctx: Context<PlaceMikuBet>, team: u8) -> Result<()> {
    require!(team <= 2, ConquestBetError::InvalidTeam);

    let bump = ctx.bumps.miku_pool;
    let pool = &mut ctx.accounts.miku_pool;
    pool.bump = bump; // deterministic — safe to (re)set on every call, not just first init
    require!(!pool.is_resolved, ConquestBetError::MikuCupAlreadyResolved);
    require!(
        (pool.bettor_count as usize) < MAX_MIKU_BETTORS,
        ConquestBetError::MikuCupFull
    );

    let bettor_key = ctx.accounts.bettor.key();
    require!(!pool.has_bet(&bettor_key), ConquestBetError::AlreadyBetOnMikuCup);

    match team {
        0 => {
            pool.total_england = pool
                .total_england
                .checked_add(MIKU_BET_AMOUNT)
                .ok_or(ConquestBetError::MathOverflow)?
        }
        1 => {
            pool.total_argentina = pool
                .total_argentina
                .checked_add(MIKU_BET_AMOUNT)
                .ok_or(ConquestBetError::MathOverflow)?
        }
        _ => {
            pool.total_spain = pool
                .total_spain
                .checked_add(MIKU_BET_AMOUNT)
                .ok_or(ConquestBetError::MathOverflow)?
        }
    }
    pool.total_pool = pool
        .total_pool
        .checked_add(MIKU_BET_AMOUNT)
        .ok_or(ConquestBetError::MathOverflow)?;

    let idx = pool.bettor_count as usize;
    pool.bettors[idx] = bettor_key;
    pool.bettor_teams[idx] = team;
    pool.bettor_count += 1;

    pool.current_holder = if pool.total_england >= pool.total_argentina && pool.total_england >= pool.total_spain {
        0
    } else if pool.total_argentina >= pool.total_spain {
        1
    } else {
        2
    };

    Ok(())
}
