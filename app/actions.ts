"use server";

import { PublicKey } from "@solana/web3.js";

import * as client from "@/lib/anchor-client";
import { MikuPool, Room, Wager } from "@/types";

function tryParsePublicKey(address: string): PublicKey | null {
  try {
    return new PublicKey(address);
  } catch {
    return null;
  }
}

/** Read-only — no signer needed, safe to run server-side regardless of who's logged in. */
export async function getRoomsForWalletAction(walletAddress: string): Promise<Room[]> {
  const key = tryParsePublicKey(walletAddress);
  if (!key) return [];
  return client.fetchRoomsForPlayer(key);
}

export async function getRoomAction(roomAddress: string): Promise<Room | null> {
  const key = tryParsePublicKey(roomAddress);
  if (!key) return null;
  return client.fetchRoom(key);
}

export async function getWagersForRoomAction(roomAddress: string): Promise<Wager[]> {
  const key = tryParsePublicKey(roomAddress);
  if (!key) return [];
  return client.fetchWagersForRoom(key);
}

export async function getMikuPoolAction(): Promise<MikuPool | null> {
  return client.fetchMikuPool();
}
