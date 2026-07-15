"use client";

import { useMemo } from "react";

import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import type { ConnectedStandardSolanaWallet } from "@privy-io/react-auth/solana";
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";

import * as client from "@/lib/anchor-client";
import { AnchorWallet } from "@/lib/anchor-client";
import { PredictionType } from "@/types";

/**
 * Adapts a Privy embedded Solana wallet to the AnchorWallet interface
 * (lib/anchor-client.ts) so the exact same instruction functions used by
 * server-side scripts (Keypair-based) also work here, signed by the real
 * logged-in user instead.
 */
class PrivyAnchorWallet implements AnchorWallet {
  constructor(private readonly wallet: ConnectedStandardSolanaWallet) {}

  get publicKey(): PublicKey {
    return new PublicKey(this.wallet.address);
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T> {
    // Explicit chain required — Privy defaults an unspecified `chain` to
    // 'solana:mainnet', which throws "No RPC configuration found" since
    // this app only ever configures a devnet RPC (see PrivyProviders.tsx).
    if (tx instanceof VersionedTransaction) {
      const { signedTransaction } = await this.wallet.signTransaction({
        transaction: tx.serialize(),
        chain: "solana:devnet",
      });
      return VersionedTransaction.deserialize(signedTransaction) as T;
    }
    const { signedTransaction } = await this.wallet.signTransaction({
      transaction: tx.serialize({ requireAllSignatures: false, verifySignatures: false }),
      chain: "solana:devnet",
    });
    return Transaction.from(signedTransaction) as T;
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> {
    return Promise.all(txs.map((tx) => this.signTransaction(tx)));
  }
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

export interface AcceptWagerActionParams {
  roomAddress: string;
  wagerAddress: string;
  predictedOutcome: number;
  landStake: number;
}

export interface ResolveWagerActionParams {
  roomAddress: string;
  wagerAddress: string;
  matchResult: number;
}

export interface ClaimVictoryActionParams {
  roomAddress: string;
  tournamentComplete: boolean;
}

/**
 * Client-side wager-loop mutations, signed by the logged-in user's Privy
 * embedded Solana wallet. Replaces the old test-wallet Server Actions —
 * every call here happens in the browser, since only the user's own wallet
 * (never the server) can produce a valid signature for their account.
 */
export function useConquestActions() {
  const { ready: privyReady, authenticated } = usePrivy();
  const { ready: walletsReady, wallets } = useWallets();
  const solanaWallet = wallets[0];

  const anchorWallet = useMemo(() => (solanaWallet ? new PrivyAnchorWallet(solanaWallet) : null), [solanaWallet]);

  function requireWallet(): AnchorWallet {
    if (!anchorWallet) throw new Error("No wallet connected — log in first.");
    return anchorWallet;
  }

  return {
    ready: privyReady && walletsReady,
    authenticated,
    walletAddress: solanaWallet?.address ?? null,

    async createRoom(roomId: number): Promise<{ signature: string; roomAddress: string }> {
      const { signature, roomAddress } = await client.createRoom(requireWallet(), roomId);
      return { signature, roomAddress: roomAddress.toBase58() };
    },

    async joinRoom(roomAddress: string): Promise<string> {
      return client.joinRoom(requireWallet(), new PublicKey(roomAddress));
    },

    async proposeWager(params: ProposeWagerActionParams): Promise<{ signature: string; wagerAddress: string }> {
      const { signature, wagerAddress } = await client.proposeWager(requireWallet(), {
        roomAddress: new PublicKey(params.roomAddress),
        wagerId: params.wagerId,
        opponent: new PublicKey(params.opponent),
        predictionType: params.predictionType,
        fixtureId: params.fixtureId,
        proposerPredictedOutcome: params.proposerPredictedOutcome,
        landStake: params.landStake,
      });
      return { signature, wagerAddress: wagerAddress.toBase58() };
    },

    async acceptWager(params: AcceptWagerActionParams): Promise<string> {
      return client.acceptWager(requireWallet(), {
        roomAddress: new PublicKey(params.roomAddress),
        wagerAddress: new PublicKey(params.wagerAddress),
        predictedOutcome: params.predictedOutcome,
        landStake: params.landStake,
      });
    },

    async resolveWager(params: ResolveWagerActionParams): Promise<string> {
      return client.resolveWager(requireWallet(), {
        roomAddress: new PublicKey(params.roomAddress),
        wagerAddress: new PublicKey(params.wagerAddress),
        matchResult: params.matchResult,
      });
    },

    async claimVictory(params: ClaimVictoryActionParams): Promise<string> {
      return client.claimVictory(requireWallet(), {
        roomAddress: new PublicKey(params.roomAddress),
        tournamentComplete: params.tournamentComplete,
      });
    },
  };
}
