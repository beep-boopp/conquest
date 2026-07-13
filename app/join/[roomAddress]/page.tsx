"use client";

import { useEffect, useState } from "react";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

import { getRoomAction } from "@/app/actions";
import { LoginButton } from "@/components/LoginButton";
import { useConquestActions } from "@/lib/use-conquest-actions";

type Status = "checking" | "joining" | "error" | "not-found";

export default function JoinRoomPage({ params }: { params: { roomAddress: string } }) {
  const { ready, authenticated } = usePrivy();
  const { walletAddress, joinRoom } = useConquestActions();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !authenticated || !walletAddress) return;

    let cancelled = false;

    async function run() {
      setStatus("checking");
      const room = await getRoomAction(params.roomAddress);
      if (cancelled) return;

      if (!room) {
        setStatus("not-found");
        return;
      }

      const alreadyMember = room.players.some((p) => p.pubkey === walletAddress);
      if (alreadyMember) {
        router.push(`/room/${params.roomAddress}`);
        return;
      }

      setStatus("joining");
      try {
        await joinRoom(params.roomAddress);
        if (!cancelled) router.push(`/room/${params.roomAddress}`);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to join room");
          setStatus("error");
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [ready, authenticated, walletAddress, params.roomAddress, joinRoom, router]);

  if (!ready) {
    return (
      <main className="mx-auto max-w-md p-8 text-center">
        <p className="text-sm text-gray-500">Loading...</p>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="mx-auto flex max-w-md flex-col items-center gap-4 p-8 text-center">
        <h1 className="text-xl font-bold">Join ConquestBet Room</h1>
        <p className="text-sm text-gray-500">Log in to join this room.</p>
        <LoginButton />
      </main>
    );
  }

  if (status === "not-found") {
    return (
      <main className="mx-auto max-w-md p-8 text-center">
        <p className="text-sm text-red-600">Room not found.</p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="mx-auto flex max-w-md flex-col items-center gap-4 p-8 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={() => router.push(`/room/${params.roomAddress}`)}
          className="rounded border px-4 py-2 text-sm"
        >
          Go to room anyway
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md p-8 text-center">
      <p className="text-sm text-gray-500">{status === "joining" ? "Joining room..." : "Checking room..."}</p>
    </main>
  );
}
