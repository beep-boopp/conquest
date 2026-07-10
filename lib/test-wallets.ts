// Server-only. Hardcoded devnet test identities used until Privy's embedded
// wallet replaces them — see CLAUDE.md. Never import this from a "use
// client" component; only from Server Actions / API routes.
import fs from "fs";
import path from "path";

import { Keypair } from "@solana/web3.js";

import { TestWalletName } from "@/types";

import { getConnection } from "./anchor-client";

const WALLET_DIR = path.join(process.cwd(), ".dev-wallets");

function loadOrCreateKeypair(name: TestWalletName): Keypair {
  const filePath = path.join(WALLET_DIR, `${name}.json`);

  if (fs.existsSync(filePath)) {
    const secret: number[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return Keypair.fromSecretKey(Uint8Array.from(secret));
  }

  fs.mkdirSync(WALLET_DIR, { recursive: true });
  const keypair = Keypair.generate();
  fs.writeFileSync(filePath, JSON.stringify(Array.from(keypair.secretKey)));
  return keypair;
}

export function getTestWallet(name: TestWalletName): Keypair {
  return loadOrCreateKeypair(name);
}

/**
 * Airdrops devnet SOL to `keypair` if its balance is below `minSol`. Fails
 * soft: the devnet faucet is aggressively rate-limited (429s are routine),
 * and a funding hiccup shouldn't crash an unrelated request. If the wallet
 * genuinely can't afford the transaction that follows, that transaction
 * will fail on its own with a clear "insufficient funds" style error —
 * better than this helper throwing during what's often just a read.
 */
export async function ensureFunded(keypair: Keypair, minSol = 1): Promise<void> {
  try {
    const connection = getConnection();
    const balance = await connection.getBalance(keypair.publicKey);
    if (balance >= minSol * 1_000_000_000) return;

    const signature = await connection.requestAirdrop(keypair.publicKey, 2_000_000_000);
    await connection.confirmTransaction(signature, "confirmed");
  } catch (e) {
    console.warn(`ensureFunded: airdrop failed for ${keypair.publicKey.toBase58()}, continuing anyway`, e);
  }
}
