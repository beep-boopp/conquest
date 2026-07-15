"use client";

import { useEffect, useRef, useState } from "react";

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
  // joinRoom (and everything else useConquestActions returns) is a new
  // function reference every render, and setStatus below triggers a
  // re-render — without this guard the effect re-fires on its own state
  // changes and calls joinRoom again mid-flight, reprompting Privy
  // repeatedly. This ensures the join flow only ever runs once per mount.
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!ready || !authenticated || !walletAddress) return;
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

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
    // joinRoom/router intentionally omitted — see hasStartedRef comment above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, authenticated, walletAddress, params.roomAddress]);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-100">
        <div className="mx-auto max-w-md p-8 text-center">
          <p className="text-sm text-neutral-500">Loading...</p>
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-100">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 p-8 text-center">
          <h1 className="text-xl font-bold">Join ConquestBet Room</h1>
          <p className="text-sm text-neutral-400">Log in to join this room.</p>
          <LoginButton />
        </div>
      </main>
    );
  }

  if (status === "not-found") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-100">
        <div className="mx-auto max-w-md p-8 text-center">
          <p className="text-sm text-red-400">Room not found.</p>
        </div>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-100">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 p-8 text-center">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={() => router.push(`/room/${params.roomAddress}`)}
            className="rounded border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
          >
            Go to room anyway
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-md p-8 text-center">
        <p className="text-sm text-neutral-500">{status === "joining" ? "Joining room..." : "Checking room..."}</p>
      </div>
    </main>
  );
}
