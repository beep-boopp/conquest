"use client";

import { useEffect, useState } from "react";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { getGlobalPageDataAction, getMikuPoolAction } from "@/app/actions";
import { BracketPanel } from "@/components/BracketPanel";
import { MikuCupCard } from "@/components/MikuCupCard";
import { MikuTimelinePanel } from "@/components/MikuTimelinePanel";
import { BracketMatch } from "@/lib/bracket-data";
import { MikuCustodyStep } from "@/lib/miku-content";
import { useConquestActions } from "@/lib/use-conquest-actions";
import { truncateAddress } from "@/lib/utils";
import { MikuPool } from "@/types";

export default function GlobalPage() {
  const { ready, authenticated, logout } = usePrivy();
  const { walletAddress } = useConquestActions();
  const [bracket, setBracket] = useState<BracketMatch[]>([]);
  const [todayStep, setTodayStep] = useState<MikuCustodyStep | null>(null);
  const [mikuPool, setMikuPool] = useState<MikuPool | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) router.push("/");
  }, [ready, authenticated, router]);

  useEffect(() => {
    setLoading(true);
    getGlobalPageDataAction()
      .then((data) => {
        setBracket(data.bracket);
        setTodayStep(data.todayStep);
      })
      .finally(() => setLoading(false));
  }, []);

  function refetchMikuPool() {
    getMikuPoolAction().then(setMikuPool);
  }

  useEffect(() => {
    refetchMikuPool();
  }, []);

  if (!ready || !authenticated) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100">
        <div className="mx-auto max-w-5xl p-8">
          <p className="text-sm text-neutral-500">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-5xl p-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">World Cup</h1>
            <nav className="flex gap-3 text-sm">
              <Link href="/dashboard" className="text-neutral-400 hover:text-neutral-200">
                Bet
              </Link>
              <Link href="/global" className="font-medium text-yellow-500">
                Global
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {walletAddress && <span className="text-neutral-400">{truncateAddress(walletAddress)}</span>}
            <button onClick={() => logout()} className="rounded border border-neutral-700 px-3 py-1 text-neutral-200 hover:bg-neutral-800">
              Log out
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-neutral-500">Loading...</p>
        ) : (
          <div className="flex flex-col gap-8">
            <MikuCupCard pool={mikuPool} activeAddress={walletAddress} onChange={refetchMikuPool} />
            <MikuTimelinePanel todayStep={todayStep} />
            <BracketPanel bracket={bracket} />
          </div>
        )}
      </div>
    </main>
  );
}
