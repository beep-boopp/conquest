import { MIKU_TEAM_LABELS } from "@/lib/miku-content";
import { MikuPool, MikuTeam } from "@/types";

import { Flag } from "./MikuCupCard";

const TEAM_COLORS: Record<MikuTeam, string> = {
  [MikuTeam.England]: "#818cf8", // indigo-400
  [MikuTeam.Argentina]: "#38bdf8", // sky-400
  [MikuTeam.Spain]: "#fbbf24", // amber-400
};

function teamTotal(pool: MikuPool, team: MikuTeam): number {
  if (team === MikuTeam.England) return pool.totalEngland;
  if (team === MikuTeam.Argentina) return pool.totalArgentina;
  return pool.totalSpain;
}

export function MikuPoolStats({ pool }: { pool: MikuPool }) {
  const teams = [MikuTeam.England, MikuTeam.Argentina, MikuTeam.Spain];
  const hasBets = pool.totalPool > 0;

  let cumulative = 0;
  const slices = teams.map((team) => {
    const total = teamTotal(pool, team);
    const pct = hasBets ? (total / pool.totalPool) * 100 : 0;
    const start = cumulative;
    cumulative += pct;
    return { team, total, pct, start, end: cumulative };
  });

  const gradient = hasBets
    ? `conic-gradient(${slices.map((s) => `${TEAM_COLORS[s.team]} ${s.start}% ${s.end}%`).join(", ")})`
    : undefined;

  return (
    <div className="mt-3 flex items-center gap-4 border-t border-neutral-800 pt-3">
      <div
        className="h-20 w-20 shrink-0 rounded-full border border-neutral-700"
        style={{ background: gradient ?? "#262626" }}
      />
      <div className="flex-1 space-y-1">
        {slices.map(({ team, total, pct }) => (
          <div key={team} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-neutral-300">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: TEAM_COLORS[team] }} />
              <Flag team={team} /> {MIKU_TEAM_LABELS[team]}
            </span>
            <span className="text-neutral-400">
              {total} land ({pct.toFixed(0)}%) — {pool.bettors.filter((b) => b.team === team).length} bettor
              {pool.bettors.filter((b) => b.team === team).length === 1 ? "" : "s"}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-neutral-800 pt-1 text-xs font-medium text-neutral-200">
          <span>Total pot</span>
          <span>
            {pool.totalPool} land — {pool.bettors.length} bettor{pool.bettors.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </div>
  );
}
