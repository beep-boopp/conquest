"use client";

import { useState } from "react";

import { useConquestActions } from "@/lib/use-conquest-actions";
import { Room, RoomStatus, Wager } from "@/types";

import { InviteLink } from "./InviteLink";
import { PlayerList } from "./PlayerList";
import { WagerCard } from "./WagerCard";
import { WagerFlowModal } from "./WagerFlowModal";

export function RoomView({
  room,
  wagers,
  activeAddress,
  onChange,
}: {
  room: Room;
  wagers: Wager[];
  activeAddress: string | null;
  onChange: () => void;
}) {
  const { joinRoom, claimVictory } = useConquestActions();
  const [modalOpen, setModalOpen] = useState(false);
  const [joining, setJoining] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMember = room.players.some((p) => p.pubkey === activeAddress);
  const isActive = room.status === RoomStatus.Active;

  async function handleJoin() {
    setJoining(true);
    setError(null);
    try {
      await joinRoom(room.address);
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to join room");
    } finally {
      setJoining(false);
    }
  }

  async function handleClaimVictory() {
    setClaiming(true);
    setError(null);
    try {
      await claimVictory({ roomAddress: room.address, tournamentComplete: true });
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to claim victory");
    } finally {
      setClaiming(false);
    }
  }

  return (
    <div className="grid gap-6">
      {error && <p className="text-sm text-red-400">{error}</p>}

      {isActive && <InviteLink roomAddress={room.address} />}

      <section className="flex flex-wrap items-center gap-3">
        {!isMember && !room.started && isActive && (
          <button
            onClick={handleJoin}
            disabled={joining}
            className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-400 disabled:opacity-50"
          >
            {joining ? "Joining..." : "Join Room"}
          </button>
        )}
        {isMember && isActive && (
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-400"
          >
            Propose Wager
          </button>
        )}
        {isMember && isActive && (
          <button
            onClick={handleClaimVictory}
            disabled={claiming}
            className="rounded border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800 disabled:opacity-50"
          >
            {claiming ? "Claiming..." : "Claim Victory"}
          </button>
        )}
        {!isActive && <span className="text-sm font-semibold text-yellow-500">Room completed</span>}
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Players</h2>
        <PlayerList players={room.players} />
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Wagers</h2>
        <div className="grid gap-3">
          {wagers.length === 0 ? (
            <p className="text-sm text-neutral-500">No wagers yet.</p>
          ) : (
            wagers.map((wager) => (
              <WagerCard key={wager.address} wager={wager} players={room.players} activeAddress={activeAddress} onChange={onChange} />
            ))
          )}
        </div>
      </section>

      <WagerFlowModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={onChange}
        roomAddress={room.address}
        players={room.players}
        selfAddress={activeAddress}
      />
    </div>
  );
}
