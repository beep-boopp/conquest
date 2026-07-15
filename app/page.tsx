"use client";

import { useEffect } from "react";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

import { LoginButton } from "@/components/LoginButton";

export default function Home() {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) router.push("/global");
  }, [ready, authenticated, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 p-8 text-center text-neutral-100">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6">
        <h1 className="text-5xl font-bold">
          Conquest<span className="text-yellow-500">Bet</span>
        </h1>
        <p className="text-neutral-400">
          Create a private room with your friends, wager land on World Cup match predictions, and conquer their
          territory when TxLINE confirms the result on-chain.
        </p>
        <LoginButton />
      </div>
    </main>
  );
}
