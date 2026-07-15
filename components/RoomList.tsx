import Link from "next/link";

import { Room } from "@/types";

export function RoomList({ rooms }: { rooms: Room[] }) {
  if (rooms.length === 0) {
    return <p className="text-sm text-neutral-500">No rooms yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {rooms.map((room) => (
        <Link
          key={room.address}
          href={`/room/${room.address}`}
          className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 transition-colors hover:border-neutral-700"
        >
          <div className="text-sm font-medium">Room {room.address.slice(0, 8)}...</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300">
              {room.players.length} player{room.players.length === 1 ? "" : "s"}
            </span>
            <span className="text-xs text-neutral-500">{room.status}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
