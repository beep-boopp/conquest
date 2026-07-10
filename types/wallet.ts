/**
 * Hardcoded devnet test identities used until Privy's embedded wallet
 * replaces them. Declared here (not in lib/test-wallets.ts, which is
 * server-only and touches fs) so client components can reference the type
 * without pulling server-only code into the browser bundle.
 */
export type TestWalletName = "player-a" | "player-b" | "player-c";

export const TEST_WALLET_NAMES: TestWalletName[] = ["player-a", "player-b", "player-c"];
