import { TxLineFixture } from "@/types";

import { MatchCard } from "./MatchCard";

export function MatchList({ matches }: { matches: TxLineFixture[] }) {
  if (matches.length === 0) {
    return <p className="text-sm text-gray-500">No live matches. {/* TODO: fetch from /api/txline/fixtures */}</p>;
  }

  return (
    <div className="grid gap-3">
      {matches.map((match) => (
        <MatchCard key={match.fixtureId} match={match} />
      ))}
    </div>
  );
}
