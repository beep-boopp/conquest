import { Player } from "./player";

export enum RoomStatus {
  Active = "active",
  Completed = "completed",
}

/**
 * Client-side view of the on-chain Room account.
 *
 * `players` is a client-side zip of the Room PDA's parallel
 * `players`/`land_balances` arrays.
 */
export interface Room {
  address: string;
  creator: string;
  players: Player[];
  /** True once the first wager has been proposed — blocks further joins. */
  started: boolean;
  status: RoomStatus;
  createdAt?: string;
}
