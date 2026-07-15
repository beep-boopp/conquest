"use client";

import { useState } from "react";

import { PREDICTION_OUTCOME_OPTIONS, PREDICTION_TYPE_LABELS } from "@/lib/prediction-outcomes";
import { useConquestActions } from "@/lib/use-conquest-actions";
import { Player, PredictionType } from "@/types";

/**
 * Hardcoded to the 2 matches relevant right now, instead of fetching TxLINE's
 * full fixture list — that list was mostly unrelated friendlies burying the
 * one match this whole app is built around. "Final" has no real fixtureId
 * yet (winner of the live match isn't decided), so it's shown but disabled
 * until that's known — matches the bracket's "TBD" placeholder.
 */
const MATCH_OPTIONS = [
  { fixtureId: "18241006", label: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 England vs 🇦🇷 Argentina — Semi-final", disabled: false },
  { fixtureId: "", label: "🏆 Final — TBD", disabled: true },
];

export function WagerFlowModal({
  open,
  onClose,
  onCreated,
  roomAddress,
  players,
  selfAddress,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  roomAddress: string;
  players: Player[];
  selfAddress: string | null;
}) {
  const { proposeWager } = useConquestActions();
  const [fixtureId, setFixtureId] = useState<string>(MATCH_OPTIONS[0].fixtureId);
  const [predictionType, setPredictionType] = useState<PredictionType>(PredictionType.MatchWinner);
  const [predictedOutcome, setPredictedOutcome] = useState<number>(0);
  const [opponent, setOpponent] = useState<string>("");
  const [landStake, setLandStake] = useState(100);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const opponentOptions = players.filter((p) => p.pubkey !== selfAddress);
  const options = PREDICTION_OUTCOME_OPTIONS[predictionType];
  // Only offer types scripts/resolve-live-match.ts actually knows how to
  // settle — OverUnderGoals/BothTeamsScore/CustomProp hit its default case
  // and would sit Locked forever, unresolved, if bet on tonight.
  const selectableTypes = [PredictionType.MatchWinner, PredictionType.ExtraTime, PredictionType.Penalties];

  async function handleSubmit() {
    if (!fixtureId) {
      setError("Pick a match.");
      return;
    }
    if (!opponent) {
      setError("Pick an opponent.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await proposeWager({
        roomAddress,
        wagerId: Date.now(),
        opponent,
        predictionType,
        fixtureId: Number(fixtureId),
        proposerPredictedOutcome: predictedOutcome,
        landStake,
      });
      onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to propose wager");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-lg border border-neutral-800 bg-neutral-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-neutral-100">Propose a Wager</h2>

        <div className="mb-3">
          <label className="mb-1 block text-xs text-neutral-500">Match</label>
          <select
            value={fixtureId}
            onChange={(e) => setFixtureId(e.target.value)}
            className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-neutral-100"
          >
            {MATCH_OPTIONS.map((m) => (
              <option key={m.fixtureId || "tbd"} value={m.fixtureId} disabled={m.disabled}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="mb-1 block text-xs text-neutral-500">Prediction type</label>
          <select
            value={predictionType}
            onChange={(e) => {
              setPredictionType(e.target.value as PredictionType);
              setPredictedOutcome(0);
            }}
            className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-neutral-100"
          >
            {selectableTypes.map((pt) => (
              <option key={pt} value={pt}>
                {PREDICTION_TYPE_LABELS[pt]}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="mb-1 block text-xs text-neutral-500">Your prediction</label>
          <div className="flex gap-2">
            {options.map((opt) => (
              <button
                key={opt.code}
                onClick={() => setPredictedOutcome(opt.code)}
                className={`rounded px-2 py-1 text-sm ${
                  predictedOutcome === opt.code ? "bg-yellow-500 text-black" : "bg-neutral-800 text-neutral-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <label className="mb-1 block text-xs text-neutral-500">Opponent</label>
          <select
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
            className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-neutral-100"
          >
            <option value="">Select a player...</option>
            {opponentOptions.map((p) => (
              <option key={p.pubkey} value={p.pubkey}>
                {p.pubkey.slice(0, 8)}... ({p.land} land)
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-xs text-neutral-500">Land stake</label>
          <input
            type="number"
            value={landStake}
            onChange={(e) => setLandStake(Number(e.target.value))}
            className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-neutral-100"
          />
        </div>

        {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded bg-neutral-800 px-3 py-1 text-sm text-neutral-200 hover:bg-neutral-700">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded bg-yellow-500 px-3 py-1 text-sm font-medium text-black hover:bg-yellow-400 disabled:opacity-50"
          >
            {submitting ? "Sending..." : "Send Wager"}
          </button>
        </div>
      </div>
    </div>
  );
}
