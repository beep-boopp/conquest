/**
 * Keeper script: resolves every Locked wager on a given TxLINE fixture
 * using that fixture's real final score.
 *
 * Usage: npx tsx scripts/resolve-live-match.ts <fixtureId>
 *
 * Layer 1 only — this script (not the on-chain program) fetches and
 * interprets TxLINE data, then calls resolve_wager with the computed
 * result. A Solana program cannot make HTTP calls, so this off-chain
 * computation + on-chain settlement split is the only possible shape for
 * this instruction until a real validate_stat CPI replaces it (Layer 2).
 */
import fs from "fs";
import os from "os";
import path from "path";

import { Keypair, PublicKey } from "@solana/web3.js";

// Manually load .env.local — this runs standalone via tsx, not through
// Next.js, so process.env isn't populated automatically.
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
  const fixtureIdArg = process.argv[2];
  if (!fixtureIdArg) {
    console.error("Usage: npx tsx scripts/resolve-live-match.ts <fixtureId>");
    process.exit(1);
  }
  const fixtureId = Number(fixtureIdArg);

  // Imported after loadEnvLocal() runs, since lib/txline.ts reads
  // TXLINE_* from process.env at call time, and lib/anchor-client.ts's
  // idl import doesn't care about env either way.
  const { getScoresSnapshot } = await import("../lib/txline");
  const { parseMatchResult } = await import("../lib/match-result");
  const client = await import("../lib/anchor-client");
  const { PredictionType, WagerStatus } = await import("../types");

  const resolverKeypairPath = path.join(os.homedir(), ".config", "solana", "id.json");
  const resolver = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(resolverKeypairPath, "utf-8"))));
  console.log("Resolving as:", resolver.publicKey.toBase58());

  console.log(`\nFetching TxLINE scores for fixture ${fixtureId}...`);
  const rawScores = (await getScoresSnapshot(String(fixtureId))) as never;
  const result = parseMatchResult(rawScores);
  console.log("Match result:", result);

  console.log(`\nFinding Locked wagers on fixture ${fixtureId}...`);
  const allWagers = await client.fetchWagersForFixture(fixtureId);
  const wagers = allWagers.filter((w) => w.status === WagerStatus.Locked);
  console.log(`Found ${wagers.length} Locked wager(s) (${allWagers.length} total for this fixture).`);

  for (const wager of wagers) {
    let matchResult: number | null = null;
    switch (wager.predictionType) {
      case PredictionType.MatchWinner:
        matchResult = result.winnerOutcome;
        break;
      case PredictionType.ExtraTime:
        matchResult = result.wentToExtraTime ? 1 : 0;
        break;
      case PredictionType.Penalties:
        matchResult = result.wentToPenalties ? 1 : 0;
        break;
      default:
        console.log(`Skipping wager ${wager.address} — unsupported prediction type ${wager.predictionType}`);
        continue;
    }

    console.log(`\nResolving wager ${wager.address} (${wager.predictionType}) with result ${matchResult}...`);
    try {
      const signature = await client.resolveWager(resolver, {
        roomAddress: new PublicKey(wager.room),
        wagerAddress: new PublicKey(wager.address),
        matchResult,
      });
      const resolved = await client.fetchWager(new PublicKey(wager.address));
      if (resolved?.outcome === "push") {
        console.log(`Wager resolved: Push — both players refunded their stake. Tx: ${signature}`);
      } else {
        const winnerIsProposer = resolved?.outcome === "proposer_won";
        const winner = winnerIsProposer ? wager.proposer : wager.opponent;
        const pot = wager.proposerStake + wager.opponentStake;
        console.log(`Wager resolved: Player ${winner} won ${pot} land. Tx: ${signature}`);
      }
    } catch (e) {
      console.error(`Failed to resolve wager ${wager.address}:`, e instanceof Error ? e.message : e);
    }
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error("\nFAILED:", e instanceof Error ? e.message : e);
  process.exit(1);
});
