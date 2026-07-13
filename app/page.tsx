"use client";

import { useEffect } from "react";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

import { LoginButton } from "@/components/LoginButton";

export default function Home() {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) router.push("/dashboard");
  }, [ready, authenticated, router]);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold">ConquestBet</h1>
      <p className="text-gray-500">
        Create a private room with your friends, wager land on World Cup match predictions, and conquer their
        territory when TxLINE confirms the result on-chain.
      </p>
      <LoginButton />
    </main>
  );
}
