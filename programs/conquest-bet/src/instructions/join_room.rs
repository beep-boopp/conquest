use anchor_lang::prelude::*;

use crate::constants::{INITIAL_LAND, MAX_PLAYERS_PER_ROOM};
use crate::errors::ConquestBetError;
use crate::state::Room;

#[derive(Accounts)]
pub struct JoinRoom<'info> {
    #[account(mut)]
    pub room: Account<'info, Room>,

    pub player: Signer<'info>,
}

/// Appends `player` to the room's roster with INITIAL_LAND. Fails once the
/// room is full or has already started (first wager proposed).
pub fn join_room_handler(ctx: Context<JoinRoom>) -> Result<()> {
    let player_key = ctx.accounts.player.key();
    let room = &mut ctx.accounts.room;

    require!(!room.started, ConquestBetError::RoomAlreadyStarted);
    require!(
        (room.player_count as usize) < MAX_PLAYERS_PER_ROOM,
        ConquestBetError::RoomFull
    );
    require!(
        room.player_index(&player_key).is_none(),
        ConquestBetError::PlayerAlreadyInRoom
    );

    let idx = room.player_count as usize;
    room.players[idx] = player_key;
    room.land_balances[idx] = INITIAL_LAND;
    room.player_count += 1;

    Ok(())
}
