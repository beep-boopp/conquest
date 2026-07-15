import { MikuTeam } from "@/types";

/** Shared flag/label constants for Miku Cup teams (England/Argentina/Spain) — the on-chain MikuTeam enum. */
export const MIKU_TEAM_LABELS: Record<MikuTeam, string> = {
  [MikuTeam.England]: "England",
  [MikuTeam.Argentina]: "Argentina",
  [MikuTeam.Spain]: "Spain",
};

/** ISO codes for the `flag-icons` package — see bracket-data.ts's file comment for why not raw emoji. */
export const MIKU_TEAM_FLAGS: Record<MikuTeam, string> = {
  [MikuTeam.England]: "gb-eng",
  [MikuTeam.Argentina]: "ar",
  [MikuTeam.Spain]: "es",
};

export const MIKU_QUOTES: Record<MikuTeam, string> = {
  [MikuTeam.England]: "Fancy a cuppa? ☕",
  [MikuTeam.Argentina]: "¡Vamos! 🔥",
  [MikuTeam.Spain]: "¡Olé! 💃",
};

/** Path to the only real Miku art we have — used wherever England is the current holder. */
export const ENGLAND_MIKU_IMAGE = "/british-miku-v0-p7y8lk33dwch1.webp";

export interface MikuCustodyStep {
  country: string;
  flag: string;
  resultLabel: string;
  quip: string;
  hasArt: boolean;
}

/**
 * Miku's real-world custody journey — every transfer is a real head-to-head
 * elimination in BRACKET_MATCHES: Brazil beat Japan (R32), Norway beat
 * Brazil (R16), England beat Norway (QF, AET). The final step is NOT in
 * this static list — it's computed live off fixture 18241006 by
 * app/actions.ts's getGlobalPageDataAction, since England v Argentina is
 * still undecided as of this build.
 */
export const MIKU_TIMELINE: MikuCustodyStep[] = [
  { country: "Japan", flag: "jp", resultLabel: "Starting nation", quip: "Where it all began.", hasArt: false },
  { country: "Brazil", flag: "br", resultLabel: "Brazil 2-1 Japan (R32)", quip: "Miku became Brazilian!", hasArt: false },
  { country: "Norway", flag: "no", resultLabel: "Norway 2-1 Brazil (R16)", quip: "Miku became Norwegian!", hasArt: false },
  { country: "England", flag: "gb-eng", resultLabel: "England 2-1 Norway (QF, AET)", quip: "Miku became English!", hasArt: true },
];
