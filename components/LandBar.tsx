"use client";

import { useEffect, useRef, useState } from "react";

import { Player } from "@/types";

export function LandBar({ player, totalLand }: { player: Player; totalLand: number }) {
  const widthPct = totalLand > 0 ? Math.round((player.land / totalLand) * 100) : 0;
  const prevLand = useRef(player.land);
  const [conquered, setConquered] = useState(false);

  useEffect(() => {
    if (player.land > prevLand.current) {
      setConquered(true);
      const timeout = setTimeout(() => setConquered(false), 1000);
      prevLand.current = player.land;
      return () => clearTimeout(timeout);
    }
    prevLand.current = player.land;
  }, [player.land]);

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-neutral-200">
        <span>{player.displayName ?? player.pubkey.slice(0, 8)}</span>
        <span>{player.land} land</span>
      </div>
      <div className={`h-2 w-full rounded bg-neutral-800 transition-shadow duration-300 ${conquered ? "ring-2 ring-yellow-400" : ""}`}>
        <div className="h-2 rounded bg-yellow-500 transition-all duration-700 ease-out" style={{ width: `${widthPct}%` }} />
      </div>
    </div>
  );
}
