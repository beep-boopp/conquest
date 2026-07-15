"use client";

import { useEffect, useState } from "react";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { getRoomsForWalletAction } from "@/app/actions";
import { RoomList } from "@/components/RoomList";
import { WalletAddressBadge } from "@/components/WalletAddressBadge";
import { useConquestActions } from "@/lib/use-conquest-actions";
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
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <nav className="flex gap-3 text-sm">
              <Link href="/dashboard" className="font-medium text-yellow-500">
                Bet
              </Link>
              <Link href="/global" className="text-neutral-400 hover:text-neutral-200">
                Global
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {walletAddress && <WalletAddressBadge address={walletAddress} />}
            <button onClick={() => logout()} className="rounded border border-neutral-700 px-3 py-1 text-neutral-200 hover:bg-neutral-800">
              Log out
            </button>
          </div>
        </div>

        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        <section className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={handleCreateRoom}
            disabled={creating || !walletAddress}
            className="rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-400 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Room"}
          </button>
          <div className="flex gap-2">
            <input
              value={joinAddress}
              onChange={(e) => setJoinAddress(e.target.value)}
              placeholder="Paste a room address to join"
              className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500"
            />
            <button
              onClick={handleGoToRoom}
              className="rounded border border-neutral-700 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
            >
              Go to Room
            </button>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Your Rooms</h2>
          {loading ? <p className="text-sm text-neutral-500">Loading...</p> : <RoomList rooms={rooms} />}
        </section>
      </div>
    </main>
  );
}
