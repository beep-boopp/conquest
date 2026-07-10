"use server";

import { PublicKey } from "@solana/web3.js";

import * as client from "@/lib/anchor-client";
import { ensureFunded, getTestWallet } from "@/lib/test-wallets";
import { PredictionType, Room, TestWalletName, Wager } from "@/types";

async function walletFor(name: TestWalletName) {
  const keypair = getTestWallet(name);
  await ensureFunded(keypair);
  return keypair;
}

// Reads never need funding — only instructions that actually send a
// transaction do (via walletFor below). Keeping these decoupled means a
// rate-limited faucet can't break page loads, only new mutations.

export async function getTestWalletAddresses(): Promise<Record<TestWalletName, string>> {
  const names: TestWalletName[] = ["player-a", "player-b", "player-c"];
  const entries = names.map((name) => [name, getTestWallet(name).publicKey.toBase58()] as const);
  return Object.fromEntries(entries) as Record<TestWalletName, string>;
}

export async function getRoomsForWalletAction(walletName: TestWalletName): Promise<Room[]> {
  const keypair = getTestWallet(walletName);
  return client.fetchRoomsForPlayer(keypair.publicKey);
}

function tryParsePublicKey(address: string): PublicKey | null {
  try {
    return new PublicKey(address);
  } catch {
    return null;
  }
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

export async function createRoomAction(
  walletName: TestWalletName,
  roomId: number,
): Promise<{ signature: string; roomAddress: string }> {
  const keypair = await walletFor(walletName);
  const { signature, roomAddress } = await client.createRoom(keypair, roomId);
  return { signature, roomAddress: roomAddress.toBase58() };
}

export async function joinRoomAction(walletName: TestWalletName, roomAddress: string): Promise<string> {
  const keypair = await walletFor(walletName);
  return client.joinRoom(keypair, new PublicKey(roomAddress));
}

export interface ProposeWagerActionParams {
  roomAddress: string;
  wagerId: number;
  opponent: string;
  predictionType: PredictionType;
  fixtureId: number;
  proposerPredictedOutcome: number;
  landStake: number;
}

export async function proposeWagerAction(
  walletName: TestWalletName,
  params: ProposeWagerActionParams,
): Promise<{ signature: string; wagerAddress: string }> {
  const keypair = await walletFor(walletName);
  const { signature, wagerAddress } = await client.proposeWager(keypair, {
    roomAddress: new PublicKey(params.roomAddress),
    wagerId: params.wagerId,
    opponent: new PublicKey(params.opponent),
    predictionType: params.predictionType,
    fixtureId: params.fixtureId,
    proposerPredictedOutcome: params.proposerPredictedOutcome,
    landStake: params.landStake,
  });
  return { signature, wagerAddress: wagerAddress.toBase58() };
}

export interface AcceptWagerActionParams {
  roomAddress: string;
  wagerAddress: string;
  predictedOutcome: number;
  landStake: number;
}

export async function acceptWagerAction(walletName: TestWalletName, params: AcceptWagerActionParams): Promise<string> {
  const keypair = await walletFor(walletName);
  return client.acceptWager(keypair, {
    roomAddress: new PublicKey(params.roomAddress),
    wagerAddress: new PublicKey(params.wagerAddress),
    predictedOutcome: params.predictedOutcome,
    landStake: params.landStake,
  });
}

export interface ResolveWagerActionParams {
  roomAddress: string;
  wagerAddress: string;
  matchResult: number;
}

export async function resolveWagerAction(walletName: TestWalletName, params: ResolveWagerActionParams): Promise<string> {
  const keypair = await walletFor(walletName);
  return client.resolveWager(keypair, {
    roomAddress: new PublicKey(params.roomAddress),
    wagerAddress: new PublicKey(params.wagerAddress),
    matchResult: params.matchResult,
  });
}

export interface ClaimVictoryActionParams {
  roomAddress: string;
  tournamentComplete: boolean;
}

export async function claimVictoryAction(walletName: TestWalletName, params: ClaimVictoryActionParams): Promise<string> {
  const keypair = await walletFor(walletName);
  return client.claimVictory(keypair, {
    roomAddress: new PublicKey(params.roomAddress),
    tournamentComplete: params.tournamentComplete,
  });
}
