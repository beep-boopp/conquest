import Link from "next/link";

import { MAX_PLAYERS_PER_ROOM } from "@/lib/constants";
import { Room, RoomStatus } from "@/types";

/**
 * Every room on the program that a wallet isn't already in — there's no
 * invite/allowlist check in join_room (any signer can join an open room),
 * so this is a real browse-and-join list, not just a UI convenience. See
 * lib/anchor-client.ts's fetchAllRooms doc comment for the full context.
 */
export function BrowseRoomsList({ rooms, myAddress }: { rooms: Room[]; myAddress: string | null }) {
  const joinable = rooms.filter(
    (room) =>
      room.status === RoomStatus.Active &&
      !room.started &&
      room.players.length < MAX_PLAYERS_PER_ROOM &&
      !room.players.some((p) => p.pubkey === myAddress),
  );

  if (joinable.length === 0) {
    return <p className="text-sm text-neutral-500">No open rooms right now — create one instead.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {joinable.map((room) => (
        <Link
          key={room.address}
          href={`/join/${room.address}`}
          className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 transition-colors hover:border-yellow-500"
        >
          <div className="text-sm font-medium">Room {room.address.slice(0, 8)}...</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300">
              {room.players.length}/{MAX_PLAYERS_PER_ROOM} players
            </span>
            <span className="text-xs text-yellow-500">Join →</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
