"use client";

import { useState } from "react";

import { ENGLAND_MIKU_IMAGE, MIKU_QUOTES, MIKU_TEAM_FLAGS, MIKU_TEAM_LABELS } from "@/lib/miku-content";
import { useConquestActions } from "@/lib/use-conquest-actions";
import { MikuPool, MikuTeam } from "@/types";

function teamTotal(pool: MikuPool, team: MikuTeam): number {
  if (team === MikuTeam.England) return pool.totalEngland;
  if (team === MikuTeam.Argentina) return pool.totalArgentina;
  return pool.totalSpain;
}

export function MikuCupCard({
  pool,
  activeAddress,
  onChange,
}: {
  pool: MikuPool | null;
  activeAddress: string | null;
  onChange: () => void;
}) {
  const { placeMikuBet } = useConquestActions();
  const [betting, setBetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const myBet = pool?.bettors.find((b) => b.address === activeAddress) ?? null;
  const alreadyBet = myBet !== null;

  async function handleBet(team: MikuTeam) {
    setBetting(true);
    setError(null);
    try {
      await placeMikuBet(team);
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to place bet");
    } finally {
      setBetting(false);
    }
  }

  const isResolved = pool?.isResolved ?? false;
  const currentHolder = pool?.currentHolder ?? null;
  const winningBettors = isResolved && pool ? pool.bettors.filter((b) => b.team === pool.currentHolder) : [];
  const iWon = isResolved && myBet !== null && myBet.team === currentHolder;
  const myShare = iWon && pool && winningBettors.length > 0 ? Math.floor(pool.totalPool / winningBettors.length) : 0;

  return (
    <div className="overflow-hidden rounded-xl border-4 border-yellow-500 bg-neutral-900 shadow-[0_0_40px_rgba(234,179,8,0.4)]">
      {currentHolder === MikuTeam.England ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ENGLAND_MIKU_IMAGE} alt="Miku Cup" className="h-56 w-full object-cover object-top" />
      ) : (
        <div className="flex h-56 w-full items-center justify-center bg-gradient-to-b from-yellow-500/20 to-neutral-900 text-8xl">
          {currentHolder !== null ? MIKU_TEAM_FLAGS[currentHolder] : "🏆"}
        </div>
      )}
      <div className="p-6">
        <div className="mb-1 flex items-center justify-between">
          <div className="text-lg font-bold text-yellow-500">🏆 Miku Cup</div>
          {currentHolder !== null && (
            <div className="text-sm text-neutral-300">
              {isResolved ? "Winner: " : "Leading: "}
              {MIKU_TEAM_FLAGS[currentHolder]} {MIKU_TEAM_LABELS[currentHolder]}
            </div>
          )}
        </div>
        {currentHolder !== null && (
          <p className="mb-3 text-sm italic text-neutral-400">Miku says: &ldquo;{MIKU_QUOTES[currentHolder]}&rdquo;</p>
        )}

        {isResolved ? (
          <p className="text-sm font-semibold text-neutral-100">
            {MIKU_TEAM_FLAGS[currentHolder as MikuTeam]} {MIKU_TEAM_LABELS[currentHolder as MikuTeam]} wins the Miku Cup!
            {iWon && ` You bet on the winner — you'd have won ~${myShare} land.`}
          </p>
        ) : (
          <>
            <div className="flex gap-2">
              {([MikuTeam.England, MikuTeam.Argentina, MikuTeam.Spain] as const).map((team) => (
                <button
                  key={team}
                  onClick={() => handleBet(team)}
                  disabled={betting || alreadyBet || !activeAddress}
                  className={`flex-1 rounded-lg px-2 py-3 text-sm font-medium transition-colors disabled:opacity-50 ${
                    myBet?.team === team ? "bg-yellow-500 text-black" : "bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
                  }`}
                >
                  {MIKU_TEAM_FLAGS[team]} {MIKU_TEAM_LABELS[team]}
                  <div className="text-xs opacity-75">{pool ? teamTotal(pool, team) : 0} land</div>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-neutral-500">
              {alreadyBet ? "You've already placed your bet." : "Place Bet — entry: 10 LAND"}
            </p>
          </>
        )}

        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}
