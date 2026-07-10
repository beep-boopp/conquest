"use client";

import { useCallback, useEffect, useState } from "react";

import { getRoomAction, getTestWalletAddresses, getWagersForRoomAction } from "@/app/actions";
import { RoomView } from "@/components/RoomView";
import { WalletSelector } from "@/components/WalletSelector";
import { useActiveWallet } from "@/lib/use-active-wallet";
import { Room, TestWalletName, Wager } from "@/types";

export default function RoomPage({ params }: { params: { roomAddress: string } }) {
  const [activeWallet] = useActiveWallet();
  const [room, setRoom] = useState<Room | null>(null);
  const [wagers, setWagers] = useState<Wager[]>([]);
  const [addresses, setAddresses] = useState<Record<TestWalletName, string> | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [roomResult, wagersResult, addressesResult] = await Promise.all([
      getRoomAction(params.roomAddress),
      getWagersForRoomAction(params.roomAddress),
      getTestWalletAddresses(),
    ]);
    setRoom(roomResult);
    setWagers(wagersResult);
    setAddresses(addressesResult);
    setLoading(false);
  }, [params.roomAddress]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <main className="mx-auto max-w-4xl p-8">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Room</h1>
        <WalletSelector />
      </div>
      <p className="mb-6 break-all text-xs text-gray-400">{params.roomAddress}</p>

      {loading ? (
        <p className="text-sm text-gray-500">Loading room...</p>
      ) : !room || !addresses ? (
        <p className="text-sm text-red-600">Room not found.</p>
      ) : (
        <RoomView
          room={room}
          wagers={wagers}
          activeWallet={activeWallet}
          activeAddress={addresses[activeWallet]}
          onChange={refresh}
        />
      )}
    </main>
  );
}
