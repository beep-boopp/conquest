/// Maximum number of players allowed in a single room.
pub const MAX_PLAYERS_PER_ROOM: usize = 5;

/// Starting land balance assigned to every player when they join a room.
// TODO: confirm the real starting land value for tournament balance.
pub const INITIAL_LAND: u64 = 1000;

pub const ROOM_SEED: &[u8] = b"room";
pub const WAGER_SEED: &[u8] = b"wager";
