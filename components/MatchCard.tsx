import { TxLineFixture } from "@/types";

export function MatchCard({ match }: { match: TxLineFixture }) {
  return (
    <div className="rounded-md border p-4">
      <div className="font-semibold">
        {match.homeTeam} vs {match.awayTeam}
      </div>
      <div className="text-sm text-gray-500">{match.kickoffTime}</div>
      {/* TODO: live score from /api/txline/scores/stream */}
    </div>
  );
}
