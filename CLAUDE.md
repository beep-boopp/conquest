# ConquestBet

## What This Is
A gamified World Cup prediction platform built for the TxLINE hackathon on Superteam Earn. Deadline: July 19, 2026 23:59 UTC.

## The Concept
Friends create private rooms (2-5 players). Everyone starts with equal "land." Players challenge each other on match predictions — standard bets (match winner, over/under goals) or custom props (goal in first 10 min, penalties, etc). Both players agree on the prediction and wager land. When TxLINE confirms the match result on-chain via Merkle proof, the winner conquers the loser's wagered land. By tournament end, whoever has the most land dominates.

This is NOT a global prediction market. It's a private social game between friends with a conquest/territory visual mechanic.

## Why This Wins
- Most submissions will be dashboards or AMM interfaces. This is a social game — different genre entirely.
- Real users (4-5 friends) will be on the platform for the demo video.
- Uses TxLINE's on-chain verification (validate_stat CPI) for trustless wager resolution — hits their bonus judging criteria.
- The UX has personality: trash talk the loser, crown the winner, animated land conquest.

## Tech Stack
- Solana program: Anchor (Rust), deployed to devnet
- Frontend + API: Next.js 14 (App Router, TypeScript)
- Auth: Privy (Google login → embedded Solana wallet)
- Data: TxLINE World Cup free tier (devnet)
- Deploy: Vercel + Solana devnet

## Architecture Principles
- Land is a u64 per player per room, NOT a token. Simple ledger math.
- State lives on Solana PDAs. The Next.js server is stateless middleware.
- Next.js API routes proxy TxLINE data — clients never see TxLINE credentials.
- Keep the Anchor program minimal and deterministic. Room PDA, Wager PDA, that's it.
- No scope creep. No global leaderboards, no token launches, no liquidity pools.

## Judging Criteria We Must Hit
1. Core Functionality: Smoothly ingest and operate on TxLINE live data feeds
2. UX & Use Case: Compelling for soccer fans (social game between friends > analytics dashboard)
3. Code Quality: Clean, documented, deterministic resolution logic
4. Demo Video: Evaluated HEAVILY — record real friends using it during a live match

## What To Avoid
- Overengineering. This is a 20-hour hackathon build.
- Global/public betting pools. Rooms are private and local.
- P2P asset transfers with TxLINE token (explicitly banned by hackathon rules).
- Gold-plating UI before core wager flow works end to end.

## Deployment Status
- **Deployed and live on devnet.** Program ID: `79iywL79mqxWLaPiyu5NFztVdmUQ3A5L8iHNSCE9RHTp` (matches `programs/conquest-bet/src/lib.rs`'s `declare_id!`, `Anchor.toml`'s `[programs.devnet]`, and `lib/constants.ts`'s `PROGRAM_ID`).
- Deploy signature: `SD5ijQAzZDunvjAw3wMyQw5bd8BjGbuJfn6Wf1gZjk6wNbjopW2WHM9psuh6LyEDwgzi3fk5jtptPTgFLmMXDhN`
- Upgrade authority / deploy keypair: `26Mm1U5z82i8GfWcMufbVw6WSMcQc4oSPhrLEprYrYPD` (~3.27 SOL remaining after deploy).
- Toolchain actually used: `anchor-cli`/`anchor-lang` 0.31.1, Solana CLI 4.1.1 (platform-tools v1.54, needed for its newer bundled rustc to support a transitive dependency's `edition2024` requirement). Both are pinned explicitly in `Anchor.toml`'s `[toolchain]` (`anchor_version`, `solana_version`) so `anchor build`/`avm` don't silently downgrade back to an older, incompatible pairing.
- To rebuild/redeploy: `anchor build` then `anchor deploy --provider.cluster devnet`.
