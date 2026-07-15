/**
 * One-off devnet funding helper: sends a small amount of devnet SOL from the
 * deploy wallet (~/.config/solana/id.json) to each address passed on the
 * command line. Use this to fund friends' Privy embedded wallets after they
 * log in and share their address, instead of relying on the flaky public
 * devnet faucet.
 *
 * Usage: npx tsx scripts/fund-players.ts <amountSol> <address1> [address2] ...
 * Example: npx tsx scripts/fund-players.ts 0.05 8x...abc 3y...def
 */
import fs from "fs";
import os from "os";
import path from "path";

import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";

async function main() {
  const [amountArg, ...addressArgs] = process.argv.slice(2);
  if (!amountArg || addressArgs.length === 0) {
    console.error("Usage: npx tsx scripts/fund-players.ts <amountSol> <address1> [address2] ...");
    process.exit(1);
  }
  const amountSol = Number(amountArg);
  const lamports = Math.round(amountSol * LAMPORTS_PER_SOL);

  const keypairPath = path.join(os.homedir(), ".config", "solana", "id.json");
  const deploy = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(keypairPath, "utf-8"))));

  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const before = await connection.getBalance(deploy.publicKey);
  console.log(`Funding from ${deploy.publicKey.toBase58()} (${before / LAMPORTS_PER_SOL} SOL)`);
  console.log(`Sending ${amountSol} SOL to ${addressArgs.length} address(es)...\n`);

  const recipients = addressArgs.map((a) => new PublicKey(a));

  const tx = new Transaction();
  for (const recipient of recipients) {
    tx.add(SystemProgram.transfer({ fromPubkey: deploy.publicKey, toPubkey: recipient, lamports }));
  }

  const signature = await sendAndConfirmTransaction(connection, tx, [deploy]);
  console.log("Signature:", signature);

  for (const recipient of recipients) {
    const bal = await connection.getBalance(recipient);
    console.log(`${recipient.toBase58()}: ${bal / LAMPORTS_PER_SOL} SOL`);
  }

  const after = await connection.getBalance(deploy.publicKey);
  console.log(`\nDeploy wallet remaining: ${after / LAMPORTS_PER_SOL} SOL`);
}

main().catch((e) => {
  console.error("FAILED:", e instanceof Error ? e.message : e);
  process.exit(1);
});
