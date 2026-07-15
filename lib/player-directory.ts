/**
 * Off-chain wallet -> display name directory. The on-chain Room only ever
 * stores raw pubkeys (no name field, no redeploy budget to add one right
 * now), so this is what makes "who is JE4G...RjJE" resolve to an actual
 * name anywhere in the UI. In-memory only — reliable as long as everyone's
 * hitting the same server process (local dev, or a single low-traffic
 * Vercel instance), not guaranteed to survive cold starts / multiple
 * concurrent instances. Good enough for a same-night demo, not a real store.
 */
const directory = new Map<string, string>();

export function registerPlayerName(wallet: string, name: string): void {
  if (!wallet || !name) return;
  directory.set(wallet, name.slice(0, 40));
}

export function getPlayerName(wallet: string): string | null {
  return directory.get(wallet) ?? null;
}

export function getPlayerNames(wallets: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const wallet of wallets) {
    const name = directory.get(wallet);
    if (name) result[wallet] = name;
  }
  return result;
}
