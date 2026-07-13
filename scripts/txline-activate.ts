/**
 * One-time (rerunnable) setup script: subscribes to TxLINE's devnet free
 * tier on-chain, activates an API token via TxLINE's REST API, tests it
 * against the fixtures endpoint, and writes the resulting credentials into
 * .env.local.
 *
 * Ported from TxLINE's own reference implementation
 * (github.com/txodds/tx-on-chain, examples/devnet/common/users.ts).
 *
 * Usage: npx tsx scripts/txline-activate.ts
 *
 * Rerun this whenever TXLINE_JWT expires (30 days) or credentials are lost —
 * it's idempotent: an existing Token-2022 account is reused, and a fresh
 * on-chain subscription just extends the existing one.
 */
import fs from "fs";
import os from "os";
import path from "path";

import * as anchor from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, VersionedTransaction } from "@solana/web3.js";
import axios from "axios";
import nacl from "tweetnacl";

import idlJson from "../idl/txoracle.json";

const DEVNET_RPC_URL = "https://api.devnet.solana.com";
const TXLINE_ORIGIN = "https://txline-dev.txodds.com";
const JWT_URL = `${TXLINE_ORIGIN}/auth/guest/start`;
const API_BASE_URL = `${TXLINE_ORIGIN}/api`;

const TXLINE_PROGRAM_ID = new PublicKey("6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J");
const TXL_MINT_DEVNET = new PublicKey("4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG");

const SERVICE_LEVEL_ID = 1; // free tier
const DURATION_WEEKS = 4; // minimum, must be a multiple of 4
const SELECTED_LEAGUES: number[] = []; // standard bundle

/** Minimal AnchorProvider-compatible wallet wrapping a raw Keypair. */
class KeypairWallet {
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

function loadDeployKeypair(): Keypair {
  const filePath = path.join(os.homedir(), ".config", "solana", "id.json");
  const secret: number[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

function upsertEnvLocal(values: Record<string, string>) {
  const envPath = path.join(process.cwd(), ".env.local");
  const examplePath = path.join(process.cwd(), ".env.local.example");

  let contents = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, "utf-8")
    : fs.existsSync(examplePath)
      ? fs.readFileSync(examplePath, "utf-8")
      : "";

  for (const [key, value] of Object.entries(values)) {
    const line = `${key}=${value}`;
    const pattern = new RegExp(`^${key}=.*$`, "m");
    if (pattern.test(contents)) {
      contents = contents.replace(pattern, line);
    } else {
      contents += (contents.endsWith("\n") || contents === "" ? "" : "\n") + line + "\n";
    }
  }

  fs.writeFileSync(envPath, contents);
  console.log(`\nWrote ${Object.keys(values).join(", ")} to ${envPath}`);
}

async function main() {
  const user = loadDeployKeypair();
  console.log("Using wallet:", user.publicKey.toBase58());

  const connection = new Connection(DEVNET_RPC_URL, "confirmed");
  const balance = await connection.getBalance(user.publicKey);
  console.log("Balance:", balance / 1_000_000_000, "SOL");

  const provider = new anchor.AnchorProvider(connection, new KeypairWallet(user), { commitment: "confirmed" });
  const program = new anchor.Program(idlJson as anchor.Idl, provider);

  if (!program.programId.equals(TXLINE_PROGRAM_ID)) {
    throw new Error(`Loaded IDL program ${program.programId.toBase58()} != expected devnet program ${TXLINE_PROGRAM_ID.toBase58()}`);
  }

  const [pricingMatrixPda] = PublicKey.findProgramAddressSync([Buffer.from("pricing_matrix")], program.programId);

  console.log("\n--- pricing matrix (sanity check before spending anything) ---");
  const matrix = await (program.account as any).pricingMatrix.fetch(pricingMatrixPda);
  console.log("Service level id   Tokens/week   Sampling (sec)  League bundle  Market bundle");
  for (const row of matrix.rows) {
    console.log(
      String(row.rowId).padStart(15, " ") +
        String(row.pricePerWeekToken).padStart(14, " ") +
        String(row.samplingIntervalSec).padStart(17, " ") +
        String(row.leagueBundleId).padStart(15, " ") +
        String(row.marketBundleId).padStart(15, " "),
    );
  }
  const targetRow = matrix.rows.find((r: any) => r.rowId === SERVICE_LEVEL_ID);
  if (!targetRow) throw new Error(`Service level ${SERVICE_LEVEL_ID} not found in devnet pricing matrix`);
  if (String(targetRow.pricePerWeekToken) !== "0") {
    throw new Error(`Service level ${SERVICE_LEVEL_ID} is not free on devnet (price=${targetRow.pricePerWeekToken}) — aborting before spending real tokens`);
  }
  console.log(`Service level ${SERVICE_LEVEL_ID} confirmed free (0 tokens/week). Proceeding.`);

  const userTokenAccount = getAssociatedTokenAddressSync(TXL_MINT_DEVNET, user.publicKey, false, TOKEN_2022_PROGRAM_ID);
  const accountInfo = await connection.getAccountInfo(userTokenAccount);
  if (!accountInfo) {
    console.log("\nCreating Token-2022 associated token account for TxL mint...");
    const tx = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        user.publicKey,
        userTokenAccount,
        user.publicKey,
        TXL_MINT_DEVNET,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      ),
    );
    const sig = await anchor.web3.sendAndConfirmTransaction(connection, tx, [user], { commitment: "confirmed" });
    console.log("ATA created:", sig);
  } else {
    console.log("\nToken-2022 associated token account already exists.");
  }

  const [tokenTreasuryPda] = PublicKey.findProgramAddressSync([Buffer.from("token_treasury_v2")], program.programId);
  const tokenTreasuryVault = getAssociatedTokenAddressSync(TXL_MINT_DEVNET, tokenTreasuryPda, true, TOKEN_2022_PROGRAM_ID);

  console.log(`\n--- subscribing on-chain: service level ${SERVICE_LEVEL_ID}, ${DURATION_WEEKS} weeks ---`);
  const subscribeTx = await (program.methods as any)
    .subscribe(SERVICE_LEVEL_ID, DURATION_WEEKS)
    .accounts({
      user: user.publicKey,
      pricingMatrix: pricingMatrixPda,
      tokenMint: TXL_MINT_DEVNET,
      userTokenAccount,
      tokenTreasuryVault,
      tokenTreasuryPda,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .transaction();

  const latestBlockhash = await connection.getLatestBlockhash("confirmed");
  subscribeTx.recentBlockhash = latestBlockhash.blockhash;
  subscribeTx.feePayer = user.publicKey;
  subscribeTx.sign(user);

  const txSig = await connection.sendRawTransaction(subscribeTx.serialize());
  await connection.confirmTransaction(
    { signature: txSig, blockhash: latestBlockhash.blockhash, lastValidBlockHeight: latestBlockhash.lastValidBlockHeight },
    "confirmed",
  );
  console.log("Subscribed. Tx:", txSig);

  console.log("\n--- acquiring guest JWT ---");
  const authResponse = await axios.post(JWT_URL);
  const jwt: string = authResponse.data.token;
  console.log("JWT acquired (expires in 30 days).");

  console.log("\n--- activating API token ---");
  const messageString = `${txSig}:${SELECTED_LEAGUES.join(",")}:${jwt}`;
  const message = new TextEncoder().encode(messageString);
  const signatureBytes = nacl.sign.detached(message, user.secretKey);
  const walletSignature = Buffer.from(signatureBytes).toString("base64");

  const activationResponse = await axios.post(
    `${API_BASE_URL}/token/activate`,
    { txSig, walletSignature, leagues: SELECTED_LEAGUES },
    { headers: { Authorization: `Bearer ${jwt}` } },
  );
  const apiToken: string = activationResponse.data.token || activationResponse.data;
  console.log("API token activated.");

  console.log("\n--- testing GET /api/fixtures/snapshot ---");
  const fixturesResponse = await axios.get(`${API_BASE_URL}/fixtures/snapshot`, {
    headers: { Authorization: `Bearer ${jwt}`, "X-Api-Token": apiToken },
  });
  const fixtures = fixturesResponse.data;
  console.log(`Got ${fixtures.length} fixtures. Sample:`);
  for (const f of fixtures.slice(0, 3)) {
    console.log(`  [${f.FixtureId}] ${f.Participant1} vs ${f.Participant2} — ${new Date(f.StartTime).toISOString()}`);
  }

  upsertEnvLocal({
    TXLINE_JWT: jwt,
    TXLINE_API_TOKEN: apiToken,
    TXLINE_BASE_URL: TXLINE_ORIGIN,
  });

  console.log("\nDone.");
}

main().catch((e) => {
  console.error("\nFAILED:", e instanceof Error ? e.message : e);
  if (axios.isAxiosError(e)) {
    console.error("Response:", e.response?.data);
  }
  process.exit(1);
});
