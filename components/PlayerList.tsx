import { Player } from "@/types";

import { LandBar } from "./LandBar";

export function PlayerList({ players }: { players: Player[] }) {
  const totalLand = players.reduce((sum, p) => sum + p.land, 0);

  return (
    <div className="grid gap-3">
      {players.map((player) => (
        <LandBar key={player.pubkey} player={player} totalLand={totalLand} />
      ))}
    </div>
  );
}
