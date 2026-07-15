/// Maximum number of players allowed in a single room.
pub const MAX_PLAYERS_PER_ROOM: usize = 5;

/// Starting land balance assigned to every player when they join a room.
// TODO: confirm the real starting land value for tournament balance.
pub const INITIAL_LAND: u64 = 1000;

pub const ROOM_SEED: &[u8] = b"room";
pub const WAGER_SEED: &[u8] = b"wager";

/// Seed for the global Miku Cup singleton pool PDA (no per-user/per-room key).
pub const MIKU_POOL_SEED: &[u8] = b"miku_pool";
/// Max concurrent Miku Cup bettors — fixed-size array, no realloc logic.
/// Kept small deliberately: the BPF program's 4KB stack frame overflows
/// during account deserialization well before 100 slots' worth of
/// (Pubkey, u8) pairs fits, and this demo only ever has a handful of players.
pub const MAX_MIKU_BETTORS: usize = 25;
/// Fixed symbolic stake per Miku Cup bet.
pub const MIKU_BET_AMOUNT: u64 = 10;
