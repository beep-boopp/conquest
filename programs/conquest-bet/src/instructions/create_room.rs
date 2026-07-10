use anchor_lang::prelude::*;

use crate::constants::{INITIAL_LAND, MAX_PLAYERS_PER_ROOM, ROOM_SEED};
use crate::state::{Room, RoomStatus};

#[derive(Accounts)]
#[instruction(room_id: u64)]
pub struct CreateRoom<'info> {
    #[account(
        init,
        payer = creator,
        space = Room::LEN,
        seeds = [ROOM_SEED, creator.key().as_ref(), room_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub room: Account<'info, Room>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// Initializes the Room PDA and auto-joins `creator` as player 0 with
/// INITIAL_LAND. Room starts Active and open for others via join_room.
pub fn create_room_handler(ctx: Context<CreateRoom>, room_id: u64) -> Result<()> {
    let creator_key = ctx.accounts.creator.key();

    let mut players = [Pubkey::default(); MAX_PLAYERS_PER_ROOM];
    players[0] = creator_key;

    let mut land_balances = [0u64; MAX_PLAYERS_PER_ROOM];
    land_balances[0] = INITIAL_LAND;

    ctx.accounts.room.set_inner(Room {
        creator: creator_key,
        room_id,
        players,
        land_balances,
        player_count: 1,
        started: false,
        status: RoomStatus::Active,
        bump: ctx.bumps.room,
    });

    Ok(())
}
