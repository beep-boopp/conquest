"use client";

import { useState } from "react";

import { proposeWagerAction } from "@/app/actions";
import { MOCK_FIXTURES } from "@/lib/mock-fixtures";
import { PREDICTION_OUTCOME_OPTIONS, PREDICTION_TYPE_LABELS } from "@/lib/prediction-outcomes";
import { Player, PredictionType, TestWalletName } from "@/types";

export function WagerFlowModal({
  open,
  onClose,
  onCreated,
  roomAddress,
  activeWallet,
  players,
  selfAddress,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  roomAddress: string;
  activeWallet: TestWalletName;
  players: Player[];
  selfAddress: string | null;
}) {
  const [fixtureId, setFixtureId] = useState(MOCK_FIXTURES[0].fixtureId);
  const [predictionType, setPredictionType] = useState<PredictionType>(PredictionType.MatchWinner);
  const [predictedOutcome, setPredictedOutcome] = useState<number>(0);
  const [opponent, setOpponent] = useState<string>("");
  const [landStake, setLandStake] = useState(100);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const opponentOptions = players.filter((p) => p.pubkey !== selfAddress);
  const options = PREDICTION_OUTCOME_OPTIONS[predictionType];

  async function handleSubmit() {
    if (!opponent) {
      setError("Pick an opponent.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await proposeWagerAction(activeWallet, {
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
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-md bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Propose a Wager</h2>

        <div className="mb-3">
          <label className="mb-1 block text-xs text-gray-500">Match</label>
          <select
            value={fixtureId}
            onChange={(e) => setFixtureId(e.target.value)}
            className="w-full rounded border px-2 py-1 text-sm"
          >
            {MOCK_FIXTURES.map((f) => (
              <option key={f.fixtureId} value={f.fixtureId}>
                {f.homeTeam} vs {f.awayTeam}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="mb-1 block text-xs text-gray-500">Prediction type</label>
          <select
            value={predictionType}
            onChange={(e) => {
              setPredictionType(e.target.value as PredictionType);
              setPredictedOutcome(0);
            }}
            className="w-full rounded border px-2 py-1 text-sm"
          >
            {Object.values(PredictionType).map((pt) => (
              <option key={pt} value={pt}>
                {PREDICTION_TYPE_LABELS[pt]}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="mb-1 block text-xs text-gray-500">Your prediction</label>
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
        </div>

        <div className="mb-3">
          <label className="mb-1 block text-xs text-gray-500">Opponent</label>
          <select
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
            className="w-full rounded border px-2 py-1 text-sm"
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
          <label className="mb-1 block text-xs text-gray-500">Land stake</label>
          <input
            type="number"
            value={landStake}
            onChange={(e) => setLandStake(Number(e.target.value))}
            className="w-full rounded border px-2 py-1 text-sm"
          />
        </div>

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded bg-gray-200 px-3 py-1 text-sm">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-50"
          >
            {submitting ? "Sending..." : "Send Wager"}
          </button>
        </div>
      </div>
    </div>
  );
}
