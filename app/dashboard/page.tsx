"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createRoomAction, getRoomsForWalletAction } from "@/app/actions";
import { RoomList } from "@/components/RoomList";
import { WalletSelector } from "@/components/WalletSelector";
import { useActiveWallet } from "@/lib/use-active-wallet";
import { Room } from "@/types";

export default function DashboardPage() {
  const [activeWallet] = useActiveWallet();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joinAddress, setJoinAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    getRoomsForWalletAction(activeWallet)
      .then(setRooms)
      .finally(() => setLoading(false));
  }, [activeWallet]);

  async function handleCreateRoom() {
    setCreating(true);
    setError(null);
    try {
      const roomId = Date.now();
      const { roomAddress } = await createRoomAction(activeWallet, roomId);
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

  return (
    <main className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <WalletSelector />
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <section className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          onClick={handleCreateRoom}
          disabled={creating}
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
