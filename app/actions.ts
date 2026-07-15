"use server";

import { PublicKey } from "@solana/web3.js";

import * as client from "@/lib/anchor-client";
import { BRACKET_MATCHES, BracketMatch } from "@/lib/bracket-data";
import { MikuCustodyStep } from "@/lib/miku-content";
import { enrichFixture, getFixtures } from "@/lib/txline";
import { MikuPool, Room, Wager } from "@/types";

function tryParsePublicKey(address: string): PublicKey | null {
  try {
    return new PublicKey(address);
  } catch {
    return null;
  }
}

/** Read-only — no signer needed, safe to run server-side regardless of who's logged in. */
export async function getRoomsForWalletAction(walletAddress: string): Promise<Room[]> {
  const key = tryParsePublicKey(walletAddress);
  if (!key) return [];
  return client.fetchRoomsForPlayer(key);
}

export async function getRoomAction(roomAddress: string): Promise<Room | null> {
  const key = tryParsePublicKey(roomAddress);
  if (!key) return null;
  return client.fetchRoom(key);
}

export async function getWagersForRoomAction(roomAddress: string): Promise<Wager[]> {
  const key = tryParsePublicKey(roomAddress);
  if (!key) return [];
  return client.fetchWagersForRoom(key);
}

export async function getMikuPoolAction(): Promise<MikuPool | null> {
  return client.fetchMikuPool();
}

/**
 * Starts from the static BRACKET_MATCHES and overlays real TxLINE results
 * for any not-yet-played match that carries a fixtureId (currently just the
 * England v Argentina semi-final). Also derives the Miku Timeline's final
 * "today" step from that same match, once it's decided.
 */
export async function getGlobalPageDataAction(): Promise<{ bracket: BracketMatch[]; todayStep: MikuCustodyStep | null }> {
  const hasLiveMatch = BRACKET_MATCHES.some((m) => m.fixtureId && m.status !== "played");
  if (!hasLiveMatch) {
    return { bracket: BRACKET_MATCHES, todayStep: null };
  }

  const fixtures = await getFixtures();

  const bracket = await Promise.all(
    BRACKET_MATCHES.map(async (match): Promise<BracketMatch> => {
      if (!match.fixtureId || match.status === "played") return match;

      const result = await enrichFixture(match.fixtureId);
      if (!result) return match;

      const fixtureInfo = fixtures.find((f) => f.fixtureId === String(match.fixtureId));
      const team1IsHome = fixtureInfo ? fixtureInfo.homeTeam.toLowerCase().includes(match.team1.toLowerCase()) : true;
      const score1 = team1IsHome ? result.homeGoals : result.awayGoals;
      const score2 = team1IsHome ? result.awayGoals : result.homeGoals;

      return {
        ...match,
        score1,
        score2,
        wentToExtraTime: result.wentToExtraTime,
        wentToPenalties: result.wentToPenalties,
        winner: score1 > score2 ? "team1" : "team2",
        status: "played",
      };
    }),
  );

  const sfEngland = bracket.find((m) => m.fixtureId === 18241006);
  const aet = sfEngland?.wentToExtraTime ? " (AET)" : "";
  const todayStep: MikuCustodyStep | null =
    sfEngland?.status !== "played"
      ? null
      : sfEngland.winner === "team1"
        ? {
            country: "England",
            flag: "gb-eng",
            resultLabel: `England ${sfEngland.score1}-${sfEngland.score2} Argentina${aet}`,
            quip: "Miku remains English!",
            hasArt: true,
          }
        : {
            country: "Argentina",
            flag: "ar",
            resultLabel: `Argentina ${sfEngland.score2}-${sfEngland.score1} England${aet}`,
            quip: "Miku became Argentine!",
            hasArt: false,
          };

  return { bracket, todayStep };
}
