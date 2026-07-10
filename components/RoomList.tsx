import Link from "next/link";

import { Room } from "@/types";

export function RoomList({ rooms }: { rooms: Room[] }) {
  if (rooms.length === 0) {
    return <p className="text-sm text-gray-500">No rooms yet.</p>;
  }

  return (
    <ul className="grid gap-2">
      {rooms.map((room) => (
        <li key={room.address}>
          <Link href={`/room/${room.address}`} className="underline">
            Room {room.address.slice(0, 8)} — {room.players.length} players
          </Link>
        </li>
      ))}
    </ul>
  );
}
