# ConquestBet

See [CLAUDE.md](./CLAUDE.md) for the full product spec, architecture principles, and judging criteria.

## Layout

- `programs/conquest-bet/` — Anchor (Rust) program: Room/Wager PDAs, instruction stubs.
- `app/` — Next.js 14 App Router frontend + `/api/txline/*` proxy routes.
- `components/`, `lib/`, `types/` — shared frontend building blocks.
- `tests/`, `migrations/` — Anchor test/deploy skeleton.

## Prerequisites

- Node 18+, npm — already used to scaffold this repo.
- Rust + cargo — needed to compile the Anchor program.
- `anchor` and `solana` CLIs — **not yet installed**. Required before `anchor build` / `anchor test` / `anchor deploy` will work. Install via `avm` (Anchor Version Manager) and the Solana CLI installer.

## Getting started

```bash
npm install
npm run dev        # Next.js dev server
npm run typecheck   # tsc --noEmit across the repo
npm run build       # next build

cargo check --manifest-path programs/conquest-bet/Cargo.toml   # structural check only, no anchor CLI needed
```

Once the `anchor` CLI is installed:

```bash
anchor build
anchor keys sync    # replaces the placeholder program id with a real one
anchor test
```
