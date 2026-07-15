import { BracketMatch } from "@/lib/bracket-data";

const ROUND_LABELS: Record<BracketMatch["round"], string> = {
  R32: "Round of 32",
  R16: "Round of 16",
  QF: "Quarter-finals",
  SF: "Semi-finals",
  F: "Final",
};

const ROUNDS: BracketMatch["round"][] = ["R32", "R16", "QF", "SF", "F"];

function TeamRow({
  flag,
  name,
  score,
  isWinner,
  isPlayed,
}: {
  flag: string;
  name: string;
  score?: number;
  isWinner: boolean;
  isPlayed: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between text-sm ${
        isPlayed && !isWinner ? "text-neutral-500" : "text-neutral-100"
      } ${isWinner ? "font-semibold" : ""}`}
    >
      <span>
        {flag} {name}
      </span>
      {isPlayed && <span>{score}</span>}
    </div>
  );
}

function MatchCard({ match }: { match: BracketMatch }) {
  const isPlayed = match.status === "played";
  const badge = match.wentToPenalties ? "Pens" : match.wentToExtraTime ? "AET" : null;

  return (
    <div
      className={`w-48 shrink-0 rounded-lg border p-2 ${
        isPlayed ? "border-neutral-800 bg-neutral-900" : "border-dashed border-neutral-700 bg-neutral-900/50"
      }`}
    >
      <TeamRow flag={match.team1Flag} name={match.team1} score={match.score1} isWinner={match.winner === "team1"} isPlayed={isPlayed} />
      {!isPlayed && <div className="text-center text-xs text-neutral-500">vs</div>}
      <TeamRow flag={match.team2Flag} name={match.team2} score={match.score2} isWinner={match.winner === "team2"} isPlayed={isPlayed} />
      {badge && <div className="mt-1 text-center text-[10px] uppercase text-neutral-500">{badge}</div>}
      {match.status === "live" && <div className="mt-1 text-center text-[10px] uppercase text-red-400">Live</div>}
    </div>
  );
}

export function BracketPanel({ bracket }: { bracket: BracketMatch[] }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <div className="mb-3 text-sm font-medium text-neutral-200">World Cup Knockout Bracket</div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {ROUNDS.map((round) => {
          const matches = bracket.filter((m) => m.round === round);
          if (matches.length === 0) return null;
          return (
            <div key={round} className="flex shrink-0 flex-col gap-3">
              <div className="text-xs font-medium text-neutral-500">{ROUND_LABELS[round]}</div>
              {matches.map((match, i) => (
                <MatchCard key={`${round}-${i}`} match={match} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
