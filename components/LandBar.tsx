import { Player } from "@/types";

export function LandBar({ player, totalLand }: { player: Player; totalLand: number }) {
  const widthPct = totalLand > 0 ? Math.round((player.land / totalLand) * 100) : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-neutral-200">
        <span>{player.displayName ?? player.pubkey.slice(0, 8)}</span>
        <span>{player.land} land</span>
      </div>
      <div className="h-2 w-full rounded bg-neutral-800">
        <div className="h-2 rounded bg-yellow-500" style={{ width: `${widthPct}%` }} />
      </div>
    </div>
  );
}
