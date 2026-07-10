import { WagerOutcome } from "@/types";

// TODO: real trash-talk copy generation and win/loss animation.
export function WinnerLoserBanner({ outcome }: { outcome: WagerOutcome }) {
  const label =
    outcome === WagerOutcome.Push
      ? "Push — no land changed hands."
      : outcome === WagerOutcome.ProposerWon
        ? "Proposer conquers the opponent's land!"
        : "Opponent conquers the proposer's land!";

  return <div className="rounded-md bg-yellow-100 p-4 text-center font-bold">{label}</div>;
}
