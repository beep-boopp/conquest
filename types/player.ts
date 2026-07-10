/**
 * A player's presence and land holding within a single room.
 *
 * `land` is a display-layer placeholder (number). On-chain the value is a
 * u64 (Room.land_balances[i]) — once wired to real account data this should
 * become a BN/bigint to avoid precision loss.
 */
export interface Player {
  pubkey: string;
  land: number;
  displayName?: string;
}
