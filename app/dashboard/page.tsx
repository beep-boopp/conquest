"use client";

import { useEffect, useState } from "react";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

import { getRoomsForWalletAction } from "@/app/actions";
import { RoomList } from "@/components/RoomList";
import { useConquestActions } from "@/lib/use-conquest-actions";
import { truncateAddress } from "@/lib/utils";
import { Room } from "@/types";

export default function DashboardPage() {
  const { ready, authenticated, logout } = usePrivy();
  const { walletAddress, createRoom } = useConquestActions();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joinAddress, setJoinAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) router.push("/");
  }, [ready, authenticated, router]);

  useEffect(() => {
    if (!walletAddress) return;
    setLoading(true);
    getRoomsForWalletAction(walletAddress)
      .then(setRooms)
      .finally(() => setLoading(false));
  }, [walletAddress]);

  async function handleCreateRoom() {
    setCreating(true);
    setError(null);
    try {
      const roomId = Date.now();
      const { roomAddress } = await createRoom(roomId);
      router.push(`/room/${roomAddress}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create room");
    } finally {
      setCreating(false);
    }
  }

  function handleGoToRoom() {
    if (joinAddress.trim()) router.push(`/room/${joinAddress.trim()}`);
  }

  if (!ready || !authenticated) {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <p className="text-sm text-gray-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-3 text-sm">
          {walletAddress && <span className="text-gray-500">{truncateAddress(walletAddress)}</span>}
          <button onClick={() => logout()} className="rounded border px-3 py-1">
            Log out
          </button>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <section className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          onClick={handleCreateRoom}
          disabled={creating || !walletAddress}
          className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create Room"}
        </button>
        <div className="flex gap-2">
          <input
            value={joinAddress}
            onChange={(e) => setJoinAddress(e.target.value)}
            placeholder="Paste a room address to join"
            className="rounded border px-3 py-2 text-sm"
          />
          <button onClick={handleGoToRoom} className="rounded border px-3 py-2 text-sm">
            Go to Room
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Your Rooms</h2>
        {loading ? <p className="text-sm text-gray-500">Loading...</p> : <RoomList rooms={rooms} />}
      </section>
    </main>
  );
}
