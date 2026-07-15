"use client";

import { useCallback, useEffect, useState } from "react";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

import { getRoomAction, getWagersForRoomAction } from "@/app/actions";
import { RoomView } from "@/components/RoomView";
import { useConquestActions } from "@/lib/use-conquest-actions";
import { truncateAddress } from "@/lib/utils";
import { Room, Wager } from "@/types";

export default function RoomPage({ params }: { params: { roomAddress: string } }) {
  const { ready, authenticated, logout } = usePrivy();
  const { walletAddress } = useConquestActions();
  const [room, setRoom] = useState<Room | null>(null);
  const [wagers, setWagers] = useState<Wager[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) router.push("/");
  }, [ready, authenticated, router]);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [roomResult, wagersResult] = await Promise.all([
      getRoomAction(params.roomAddress),
      getWagersForRoomAction(params.roomAddress),
    ]);
    setRoom(roomResult);
    setWagers(wagersResult);
    setLoading(false);
  }, [params.roomAddress]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!ready || !authenticated) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100">
        <div className="mx-auto max-w-4xl p-8">
          <p className="text-sm text-neutral-500">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-4xl p-8">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Room</h1>
          <div className="flex items-center gap-3 text-sm">
            {walletAddress && <span className="text-neutral-400">{truncateAddress(walletAddress)}</span>}
            <button onClick={() => logout()} className="rounded border border-neutral-700 px-3 py-1 text-neutral-200 hover:bg-neutral-800">
              Log out
            </button>
          </div>
        </div>
        <p className="mb-6 break-all text-xs text-neutral-600">{params.roomAddress}</p>

        {loading ? (
          <p className="text-sm text-neutral-500">Loading room...</p>
        ) : !room ? (
          <p className="text-sm text-red-400">Room not found.</p>
        ) : (
          <RoomView room={room} wagers={wagers} activeAddress={walletAddress} onChange={refresh} />
        )}
      </div>
    </main>
  );
}
