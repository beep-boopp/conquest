import { BracketMatch } from "@/lib/bracket-data";

const ROUND_LABELS: Record<BracketMatch["round"], string> = {
  R32: "Round of 32",
  R16: "Round of 16",
  QF: "Quarter-finals",
  SF: "Semi-finals",
  F: "Final",
};

const ROUNDS: BracketMatch["round"][] = ["R32", "R16", "QF", "SF", "F"];

// Every match card is pinned to this exact height (content is centered
// inside it via flex), so every round's column can share one fixed total
// height below and let `justify-around` auto-space each halved round —
// the standard CSS-only trick for a bracket that funnels toward the Final
// without measuring/positioning anything in JS.
// Tall enough for 2 team rows + a badge line (AET/Pens/Live) without overflow.
const CARD_HEIGHT = 76;
const CARD_GAP = 12;
const MAX_MATCHES_IN_A_ROUND = 16; // Round of 32
const COLUMN_HEIGHT = MAX_MATCHES_IN_A_ROUND * CARD_HEIGHT + (MAX_MATCHES_IN_A_ROUND - 1) * CARD_GAP;

function Flag({ code }: { code: string }) {
  if (!code) return <span className="text-sm">🏳️</span>;
  return <span className={`fi fi-${code} rounded-[2px]`} />;
}

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
      className={`flex items-center justify-between gap-1 text-sm ${
        isPlayed && !isWinner ? "text-neutral-500" : "text-neutral-100"
      } ${isWinner ? "font-semibold" : ""}`}
    >
      <span className="flex items-center gap-1.5 truncate">
        <Flag code={flag} /> <span className="truncate">{name}</span>
      </span>
      {isPlayed && <span className="shrink-0">{score}</span>}
    </div>
  );
}

function MatchCard({ match }: { match: BracketMatch }) {
  const isPlayed = match.status === "played";
  const badge = match.wentToPenalties ? "Pens" : match.wentToExtraTime ? "AET" : null;

  return (
    <div
      style={{ height: CARD_HEIGHT }}
      className={`flex w-48 shrink-0 flex-col justify-center rounded-lg border p-2 ${
        isPlayed ? "border-neutral-800 bg-neutral-900" : "border-dashed border-neutral-700 bg-neutral-900/50"
      }`}
    >
      <TeamRow flag={match.team1Flag} name={match.team1} score={match.score1} isWinner={match.winner === "team1"} isPlayed={isPlayed} />
      {!isPlayed && <div className="text-center text-xs text-neutral-500">vs</div>}
      <TeamRow flag={match.team2Flag} name={match.team2} score={match.score2} isWinner={match.winner === "team2"} isPlayed={isPlayed} />
      {badge && <div className="text-center text-[10px] uppercase text-neutral-400">{badge}</div>}
      {match.status === "live" && <div className="text-center text-[10px] font-semibold uppercase text-red-400">Live</div>}
    </div>
  );
}

export function BracketPanel({ bracket }: { bracket: BracketMatch[] }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <div className="mb-3 text-sm font-medium text-neutral-200">World Cup Knockout Bracket</div>
      <div className="flex gap-6 overflow-x-auto pb-2">
        {ROUNDS.map((round) => {
          const matches = bracket.filter((m) => m.round === round);
          if (matches.length === 0) return null;
          return (
            <div key={round} className="flex shrink-0 flex-col items-center">
              <div className="mb-2 text-xs font-medium text-neutral-500">{ROUND_LABELS[round]}</div>
              <div className="flex flex-col justify-around" style={{ height: COLUMN_HEIGHT }}>
                {matches.map((match, i) => (
                  <MatchCard key={`${round}-${i}`} match={match} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
