/**
 * Manual resolution for the Miku Cup — you decide the winning team (this is
 * a symbolic meme side-bet, not tied to real match data) and run this once.
 *
 * Usage: npx tsx scripts/resolve-miku-cup.ts <0|1|2>
 *   0 = England, 1 = Argentina, 2 = Spain
 */
import fs from "fs";
import os from "os";
import path from "path";

import { Keypair } from "@solana/web3.js";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}
loadEnvLocal();

async function main() {
  const teamArg = process.argv[2];
  if (!teamArg || !["0", "1", "2"].includes(teamArg)) {
    console.error("Usage: npx tsx scripts/resolve-miku-cup.ts <0|1|2>  (0=England, 1=Argentina, 2=Spain)");
    process.exit(1);
  }
  const winningTeam = Number(teamArg);

  const client = await import("../lib/anchor-client");
  const TEAM_LABELS = ["England", "Argentina", "Spain"];

  const resolverKeypairPath = path.join(os.homedir(), ".config", "solana", "id.json");
  const resolver = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(resolverKeypairPath, "utf-8"))));
  console.log("Resolving as:", resolver.publicKey.toBase58());

  const pool = await client.fetchMikuPool();
  if (!pool) {
    console.error("Miku Cup pool doesn't exist yet — nobody has bet.");
    process.exit(1);
  }
  if (pool.isResolved) {
    console.error("Miku Cup is already resolved.");
    process.exit(1);
  }

  console.log(`\nCrowning ${TEAM_LABELS[winningTeam]} as Miku Cup winner...`);
  const signature = await client.resolveMikuCup(resolver, winningTeam);
  console.log("Tx:", signature);

  const winners = pool.bettors.filter((b) => b.team === winningTeam);
  console.log(`\n${winners.length} winner(s) out of ${pool.bettors.length} total bettor(s).`);
  console.log(`Total pool: ${pool.totalPool} land — ~${winners.length > 0 ? Math.floor(pool.totalPool / winners.length) : 0} land each (symbolic, display-only).`);
}

main().catch((e) => {
  console.error("\nFAILED:", e instanceof Error ? e.message : e);
  process.exit(1);
});
