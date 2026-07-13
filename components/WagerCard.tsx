"use client";

import { useState } from "react";

import { PREDICTION_OUTCOME_OPTIONS, PREDICTION_TYPE_LABELS } from "@/lib/prediction-outcomes";
import { useConquestActions } from "@/lib/use-conquest-actions";
import { Wager, WagerStatus } from "@/types";

export function WagerCard({
  wager,
  activeAddress,
  onChange,
}: {
  wager: Wager;
  activeAddress: string | null;
  onChange: () => void;
}) {
  const { acceptWager, resolveWager } = useConquestActions();
  const [accepting, setAccepting] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [predictedOutcome, setPredictedOutcome] = useState<number | null>(null);
  const [landStake, setLandStake] = useState(100);
  const [matchResult, setMatchResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const options = PREDICTION_OUTCOME_OPTIONS[wager.predictionType];
  const isOpponent = activeAddress === wager.opponent;
  const canAccept = wager.status === WagerStatus.Proposed && isOpponent;
  const canResolve = wager.status === WagerStatus.Locked;

  async function handleAccept() {
    if (predictedOutcome === null) {
      setError("Pick a predicted outcome.");
      return;
    }
    setAccepting(true);
    setError(null);
    try {
      await acceptWager({
        roomAddress: wager.room,
        wagerAddress: wager.address,
        predictedOutcome,
        landStake,
      });
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to accept wager");
    } finally {
      setAccepting(false);
    }
  }

  async function handleResolve() {
    if (matchResult === null) {
      setError("Pick the match result to simulate.");
      return;
    }
    setResolving(true);
    setError(null);
    try {
      await resolveWager({
        roomAddress: wager.room,
        wagerAddress: wager.address,
        matchResult,
      });
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to resolve wager");
    } finally {
      setResolving(false);
    }
  }

  return (
    <div className="rounded-md border p-4">
      <div className="text-sm font-medium">{PREDICTION_TYPE_LABELS[wager.predictionType]}</div>
      <div className="text-sm text-gray-500">
        {wager.proposer.slice(0, 6)}... vs {wager.opponent.slice(0, 6)}...
      </div>
      <div className="text-sm text-gray-500">
        Stakes: {wager.proposerStake} / {wager.opponentStake} land — status: {wager.status}
      </div>
      {wager.outcome && <div className="text-sm font-semibold">Outcome: {wager.outcome}</div>}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {canAccept && (
        <div className="mt-3 flex flex-col gap-2 border-t pt-3">
          <div className="text-xs text-gray-500">Your prediction:</div>
          <div className="flex gap-2">
            {options.map((opt) => (
              <button
                key={opt.code}
                onClick={() => setPredictedOutcome(opt.code)}
                className={`rounded px-2 py-1 text-sm ${predictedOutcome === opt.code ? "bg-black text-white" : "bg-gray-100"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={landStake}
            onChange={(e) => setLandStake(Number(e.target.value))}
            className="w-32 rounded border px-2 py-1 text-sm"
          />
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="rounded bg-green-600 px-3 py-1 text-sm text-white disabled:opacity-50"
          >
            {accepting ? "Accepting..." : "Accept Wager"}
          </button>
        </div>
      )}

      {canResolve && (
        <div className="mt-3 flex flex-col gap-2 border-t pt-3">
          <div className="text-xs text-gray-500">
            Dev-only: simulate the match result (real TxLINE verification lands later — see resolve_wager.rs)
          </div>
          <div className="flex gap-2">
            {options.map((opt) => (
              <button
                key={opt.code}
                onClick={() => setMatchResult(opt.code)}
                className={`rounded px-2 py-1 text-sm ${matchResult === opt.code ? "bg-black text-white" : "bg-gray-100"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleResolve}
            disabled={resolving}
            className="rounded bg-yellow-600 px-3 py-1 text-sm text-white disabled:opacity-50"
          >
            {resolving ? "Resolving..." : "Resolve Wager"}
          </button>
        </div>
      )}
    </div>
  );
}
