import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";

import idlJson from "@/idl/conquest_bet.json";
import type { ConquestBet } from "@/idl/conquest_bet";
import { MikuBettor, MikuPool, MikuTeam, Player, PredictionType, Room, RoomStatus, Wager, WagerOutcome, WagerStatus } from "@/types";
import { DEVNET_RPC_URL, PROGRAM_ID } from "./constants";

const idl = idlJson as ConquestBet;
const programId = new PublicKey(PROGRAM_ID);

export function getConnection(): Connection {
  return new Connection(DEVNET_RPC_URL, "confirmed");
}

/**
 * Anything AnchorProvider can sign with — a raw Keypair (server-side
 * scripts, lib/test-wallets.ts) or an already Wallet-shaped object (e.g. a
 * Privy embedded wallet adapter — see lib/use-conquest-actions.ts). Every
 * instruction function below accepts either, so swapping the signing
 * backend never touches this file.
 */
export interface AnchorWallet {
  publicKey: PublicKey;
  signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]>;
}

/**
 * Minimal AnchorProvider-compatible wallet wrapping a raw Keypair. Avoids
 * depending on @coral-xyz/anchor's own `Wallet` export, whose browser/node
 * build resolution is ambiguous under Next.js's bundler.
 */
class KeypairWallet implements AnchorWallet {
  constructor(readonly payer: Keypair) {}

  get publicKey(): PublicKey {
    return this.payer.publicKey;
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T> {
    if (tx instanceof VersionedTransaction) {
      tx.sign([this.payer]);
    } else {
      tx.partialSign(this.payer);
    }
    return tx;
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> {
    return Promise.all(txs.map((tx) => this.signTransaction(tx)));
  }
}

function isKeypair(signer: Keypair | AnchorWallet): signer is Keypair {
  return signer instanceof Keypair;
}

/** Builds a Program client signing as `signer` — a raw Keypair or any AnchorWallet-shaped object. */
export function getProgram(signer: Keypair | AnchorWallet): Program<ConquestBet> {
  const wallet = isKeypair(signer) ? new KeypairWallet(signer) : signer;
  const provider = new AnchorProvider(getConnection(), wallet, { commitment: "confirmed" });
  return new Program<ConquestBet>(idl, provider);
}

/** Read-only Program client for fetching account data — no real signer needed. */
function getReadOnlyProgram(): Program<ConquestBet> {
  return getProgram(Keypair.generate());
}

// ---- PDA derivation: mirrors the seeds in programs/conquest-bet/src/instructions/*.rs ----

export function deriveRoomAddress(creator: PublicKey, roomId: number): PublicKey {
  const [address] = PublicKey.findProgramAddressSync(
    [Buffer.from("room"), creator.toBuffer(), new BN(roomId).toArrayLike(Buffer, "le", 8)],
    programId,
  );
  return address;
}

export function deriveWagerAddress(room: PublicKey, wagerId: number): PublicKey {
  const [address] = PublicKey.findProgramAddressSync(
    [Buffer.from("wager"), room.toBuffer(), new BN(wagerId).toArrayLike(Buffer, "le", 8)],
    programId,
  );
  return address;
}

/** Global singleton — no per-user/per-room key, unlike Room/Wager PDAs. */
export function deriveMikuPoolAddress(): PublicKey {
  const [address] = PublicKey.findProgramAddressSync([Buffer.from("miku_pool")], programId);
  return address;
}

// ---- Enum conversion: our snake_case string enums <-> Anchor's camelCase-keyed objects ----
// e.g. PredictionType.MatchWinner ("match_winner") <-> { matchWinner: {} }

function snakeToCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

function camelToSnake(s: string): string {
  return s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

function toAnchorEnum(value: string): Record<string, Record<string, never>> {
  return { [snakeToCamel(value)]: {} };
}

function fromAnchorEnum(value: object): string {
  return camelToSnake(Object.keys(value)[0]);
}

// ---- View mappers: on-chain account shape -> client-facing types/ shape ----

interface OnChainRoom {
  creator: PublicKey;
  roomId: BN;
  players: PublicKey[];
  landBalances: BN[];
  playerCount: number;
  started: boolean;
  status: object;
}

interface OnChainWager {
  room: PublicKey;
  wagerId: BN;
  proposer: PublicKey;
  opponent: PublicKey;
  predictionType: object;
  fixtureId: BN;
  proposerPredictedOutcome: number;
  opponentPredictedOutcome: number | null;
  proposerStake: BN;
  opponentStake: BN;
  status: object;
  outcome: object | null;
}

function toRoomView(address: PublicKey, account: OnChainRoom): Room {
  const players: Player[] = account.players.slice(0, account.playerCount).map((pubkey, i) => ({
    pubkey: pubkey.toBase58(),
    land: account.landBalances[i].toNumber(),
  }));

  return {
    address: address.toBase58(),
    creator: account.creator.toBase58(),
    players,
    started: account.started,
    status: fromAnchorEnum(account.status) as RoomStatus,
  };
}

interface OnChainMikuPool {
  totalEngland: BN;
  totalArgentina: BN;
  totalSpain: BN;
  currentHolder: number;
  isResolved: boolean;
  totalPool: BN;
  bettors: PublicKey[];
  bettorTeams: number[];
  bettorCount: number;
}

function toMikuPoolView(address: PublicKey, account: OnChainMikuPool): MikuPool {
  const bettors: MikuBettor[] = account.bettors.slice(0, account.bettorCount).map((pubkey, i) => ({
    address: pubkey.toBase58(),
    team: account.bettorTeams[i] as MikuTeam,
  }));

  return {
    address: address.toBase58(),
    totalEngland: account.totalEngland.toNumber(),
    totalArgentina: account.totalArgentina.toNumber(),
    totalSpain: account.totalSpain.toNumber(),
    currentHolder: account.currentHolder as MikuTeam,
    isResolved: account.isResolved,
    totalPool: account.totalPool.toNumber(),
    bettors,
  };
}

function toWagerView(address: PublicKey, account: OnChainWager): Wager {
  return {
    address: address.toBase58(),
    room: account.room.toBase58(),
    proposer: account.proposer.toBase58(),
    opponent: account.opponent.toBase58(),
    predictionType: fromAnchorEnum(account.predictionType) as PredictionType,
    fixtureId: account.fixtureId.toString(),
    proposerPredictedOutcome: account.proposerPredictedOutcome,
    opponentPredictedOutcome: account.opponentPredictedOutcome ?? undefined,
    proposerStake: account.proposerStake.toNumber(),
    opponentStake: account.opponentStake.toNumber(),
    status: fromAnchorEnum(account.status) as WagerStatus,
    outcome: account.outcome ? (fromAnchorEnum(account.outcome) as WagerOutcome) : undefined,
  };
}

// ---- Reads ----

export async function fetchRoom(address: PublicKey): Promise<Room | null> {
  const program = getReadOnlyProgram();
  try {
    const account = await program.account.room.fetch(address);
    return toRoomView(address, account as unknown as OnChainRoom);
  } catch {
    return null;
  }
}

export async function fetchWager(address: PublicKey): Promise<Wager | null> {
  const program = getReadOnlyProgram();
  try {
    const account = await program.account.wager.fetch(address);
    return toWagerView(address, account as unknown as OnChainWager);
  } catch {
    return null;
  }
}

/** All wagers referencing a given room, resolved/proposed/locked/cancelled alike. */
export async function fetchWagersForRoom(room: PublicKey): Promise<Wager[]> {
  const program = getReadOnlyProgram();
  const entries = await program.account.wager.all([
    { memcmp: { offset: 8, bytes: room.toBase58() } }, // `room` is the first field after the 8-byte discriminator
  ]);
  return entries.map((e) => toWagerView(e.publicKey, e.account as unknown as OnChainWager));
}

/**
 * All wagers for a given TxLINE fixture, across every room, regardless of
 * status. Fetches all Wager accounts and filters client-side — fine at
 * hackathon scale, avoids getting the memcmp byte offset for a u64 field
 * wrong under time pressure.
 */
export async function fetchWagersForFixture(fixtureId: number): Promise<Wager[]> {
  const program = getReadOnlyProgram();
  const entries = await program.account.wager.all();
  return entries
    .map((e) => toWagerView(e.publicKey, e.account as unknown as OnChainWager))
    .filter((wager) => wager.fixtureId === String(fixtureId));
}

/** The global Miku Cup pool, or null if nobody has bet yet (account doesn't exist). */
export async function fetchMikuPool(): Promise<MikuPool | null> {
  const program = getReadOnlyProgram();
  const address = deriveMikuPoolAddress();
  try {
    const account = await program.account.mikuPool.fetch(address);
    return toMikuPoolView(address, account as unknown as OnChainMikuPool);
  } catch {
    return null;
  }
}

/** All rooms a given player belongs to. Scans every Room account — fine at hackathon scale. */
export async function fetchRoomsForPlayer(player: PublicKey): Promise<Room[]> {
  const program = getReadOnlyProgram();
  const entries = await program.account.room.all();
  return entries
    .map((e) => toRoomView(e.publicKey, e.account as unknown as OnChainRoom))
    .filter((room) => room.players.some((p) => p.pubkey === player.toBase58()));
}

// ---- Instructions: mirror programs/conquest-bet/src/instructions/*.rs ----

/** Mirrors create_room. Returns the tx signature and the new room's address. */
export async function createRoom(
  creator: Keypair | AnchorWallet,
  roomId: number,
): Promise<{ signature: string; roomAddress: PublicKey }> {
  const program = getProgram(creator);
  const roomAddress = deriveRoomAddress(creator.publicKey, roomId);

  const signature = await program.methods
    .createRoom(new BN(roomId))
    .accounts({
      // `room` is a PDA (seeds: room, creator, roomId) and `systemProgram`
      // has a fixed well-known address — Anchor's client auto-resolves both
      // from the IDL, they must be omitted here.
      creator: creator.publicKey,
    })
    .rpc();

  return { signature, roomAddress };
}

/** Mirrors join_room. */
export async function joinRoom(player: Keypair | AnchorWallet, roomAddress: PublicKey): Promise<string> {
  const program = getProgram(player);
  return program.methods
    .joinRoom()
    .accounts({ room: roomAddress, player: player.publicKey })
    .rpc();
}

export interface ProposeWagerParams {
  roomAddress: PublicKey;
  wagerId: number;
  opponent: PublicKey;
  predictionType: PredictionType;
  fixtureId: number;
  proposerPredictedOutcome: number;
  landStake: number;
}

/** Mirrors propose_wager. Returns the tx signature and the new wager's address. */
export async function proposeWager(
  proposer: Keypair | AnchorWallet,
  params: ProposeWagerParams,
): Promise<{ signature: string; wagerAddress: PublicKey }> {
  const program = getProgram(proposer);
  const wagerAddress = deriveWagerAddress(params.roomAddress, params.wagerId);

  const signature = await program.methods
    .proposeWager(
      new BN(params.wagerId),
      toAnchorEnum(params.predictionType) as never,
      new BN(params.fixtureId),
      params.proposerPredictedOutcome,
      new BN(params.landStake),
    )
    .accounts({
      room: params.roomAddress,
      // `wager` is a PDA (seeds: wager, room, wagerId) and `systemProgram`
      // has a fixed well-known address — Anchor's client auto-resolves both
      // from the IDL, they must be omitted here.
      proposer: proposer.publicKey,
      opponent: params.opponent,
    })
    .rpc();

  return { signature, wagerAddress };
}

export interface AcceptWagerParams {
  roomAddress: PublicKey;
  wagerAddress: PublicKey;
  predictedOutcome: number;
  landStake: number;
}

/** Mirrors accept_wager. */
export async function acceptWager(opponent: Keypair | AnchorWallet, params: AcceptWagerParams): Promise<string> {
  const program = getProgram(opponent);
  return program.methods
    .acceptWager(params.predictedOutcome, new BN(params.landStake))
    .accounts({
      room: params.roomAddress,
      wager: params.wagerAddress,
      opponent: opponent.publicKey,
    })
    .rpc();
}

export interface ResolveWagerParams {
  roomAddress: PublicKey;
  wagerAddress: PublicKey;
  matchResult: number;
}

/**
 * Mirrors resolve_wager. LAYER 1 ONLY — matchResult is not yet verified via
 * TxLINE CPI (see resolve_wager.rs). txlineProgram/merkleProofAccount are
 * unused placeholder accounts on-chain right now, so any valid pubkey works;
 * we pass our own programId as an inert filler until the real CPI accounts
 * are wired up.
 */
export async function resolveWager(resolver: Keypair | AnchorWallet, params: ResolveWagerParams): Promise<string> {
  const program = getProgram(resolver);
  return program.methods
    .resolveWager(params.matchResult)
    .accounts({
      room: params.roomAddress,
      wager: params.wagerAddress,
      resolver: resolver.publicKey,
      txlineProgram: programId,
      merkleProofAccount: programId,
    })
    .rpc();
}

export interface ClaimVictoryParams {
  roomAddress: PublicKey;
  tournamentComplete: boolean;
}

/** Mirrors claim_victory. */
export async function claimVictory(claimant: Keypair | AnchorWallet, params: ClaimVictoryParams): Promise<string> {
  const program = getProgram(claimant);
  return program.methods
    .claimVictory(params.tournamentComplete)
    .accounts({ room: params.roomAddress, claimant: claimant.publicKey })
    .rpc();
}

/**
 * Mirrors place_miku_bet. `miku_pool` is a global singleton PDA (seeds:
 * miku_pool, no per-user key) — Anchor's client auto-resolves it from the
 * IDL, along with systemProgram, so both are omitted here.
 */
export async function placeMikuBet(bettor: Keypair | AnchorWallet, team: MikuTeam): Promise<string> {
  const program = getProgram(bettor);
  return program.methods.placeMikuBet(team).accounts({ bettor: bettor.publicKey }).rpc();
}

/**
 * Mirrors resolve_miku_cup. Any signer, same Layer-1 trust model as
 * resolveWager — no on-chain result verification yet.
 */
export async function resolveMikuCup(resolver: Keypair | AnchorWallet, winningTeam: MikuTeam): Promise<string> {
  const program = getProgram(resolver);
  return program.methods.resolveMikuCup(winningTeam).accounts({ resolver: resolver.publicKey }).rpc();
}

/** Mirrors reset_miku_cup — wipes the pool back to a fresh, unbet state. Admin/script use only, not exposed in the UI. */
export async function resetMikuCup(resolver: Keypair | AnchorWallet): Promise<string> {
  const program = getProgram(resolver);
  return program.methods.resetMikuCup().accounts({ resolver: resolver.publicKey }).rpc();
}

// Re-exported for call sites that need to build PublicKeys/BNs directly.
export { anchor, PublicKey, BN };
