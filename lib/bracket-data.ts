/**
 * Real FIFA World Cup 2026 knockout-stage results (match numbers M73-M104),
 * as supplied by the user. R32/R16/QF are all decided — no fixtureId
 * needed since status is fixed at "played". SF2 (England v Argentina, M102)
 * is genuinely live/upcoming as of this build and carries the real TxLINE
 * fixtureId so app/actions.ts's getGlobalPageDataAction can overlay the
 * real result once it lands. The Final (M104) is TBD until that match
 * concludes. The Third-Place Playoff (M103) isn't modeled — BracketMatch's
 * round union is R32/R16/QF/SF/F only, matching the original spec.
 */

export interface BracketMatch {
  fixtureId?: number;
  round: "R32" | "R16" | "QF" | "SF" | "F";
  team1: string;
  team1Flag: string;
  team2: string;
  team2Flag: string;
  score1?: number;
  score2?: number;
  wentToExtraTime?: boolean;
  wentToPenalties?: boolean;
  winner?: "team1" | "team2";
  status: "played" | "upcoming" | "live";
}

export const BRACKET_MATCHES: BracketMatch[] = [
  // ---- Round of 32 (M73-M88) ----
  { round: "R32", team1: "South Africa", team1Flag: "🇿🇦", team2: "Canada", team2Flag: "🇨🇦", score1: 0, score2: 1, winner: "team2", status: "played" },
  { round: "R32", team1: "Germany", team1Flag: "🇩🇪", team2: "Paraguay", team2Flag: "🇵🇾", score1: 1, score2: 1, wentToPenalties: true, winner: "team2", status: "played" },
  { round: "R32", team1: "Netherlands", team1Flag: "🇳🇱", team2: "Morocco", team2Flag: "🇲🇦", score1: 1, score2: 1, wentToPenalties: true, winner: "team2", status: "played" },
  { round: "R32", team1: "Brazil", team1Flag: "🇧🇷", team2: "Japan", team2Flag: "🇯🇵", score1: 2, score2: 1, winner: "team1", status: "played" },
  { round: "R32", team1: "France", team1Flag: "🇫🇷", team2: "Sweden", team2Flag: "🇸🇪", score1: 3, score2: 0, winner: "team1", status: "played" },
  { round: "R32", team1: "Ivory Coast", team1Flag: "🇨🇮", team2: "Norway", team2Flag: "🇳🇴", score1: 1, score2: 2, winner: "team2", status: "played" },
  { round: "R32", team1: "Mexico", team1Flag: "🇲🇽", team2: "Ecuador", team2Flag: "🇪🇨", score1: 2, score2: 0, winner: "team1", status: "played" },
  { round: "R32", team1: "England", team1Flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", team2: "DR Congo", team2Flag: "🇨🇩", score1: 2, score2: 1, winner: "team1", status: "played" },
  { round: "R32", team1: "USA", team1Flag: "🇺🇸", team2: "Bosnia", team2Flag: "🇧🇦", score1: 2, score2: 0, winner: "team1", status: "played" },
  { round: "R32", team1: "Belgium", team1Flag: "🇧🇪", team2: "Senegal", team2Flag: "🇸🇳", score1: 3, score2: 2, wentToExtraTime: true, winner: "team1", status: "played" },
  { round: "R32", team1: "Portugal", team1Flag: "🇵🇹", team2: "Croatia", team2Flag: "🇭🇷", score1: 2, score2: 1, winner: "team1", status: "played" },
  { round: "R32", team1: "Spain", team1Flag: "🇪🇸", team2: "Austria", team2Flag: "🇦🇹", score1: 3, score2: 0, winner: "team1", status: "played" },
  { round: "R32", team1: "Switzerland", team1Flag: "🇨🇭", team2: "Algeria", team2Flag: "🇩🇿", score1: 2, score2: 0, winner: "team1", status: "played" },
  { round: "R32", team1: "Argentina", team1Flag: "🇦🇷", team2: "Cabo Verde", team2Flag: "🇨🇻", score1: 3, score2: 2, wentToExtraTime: true, winner: "team1", status: "played" },
  { round: "R32", team1: "Colombia", team1Flag: "🇨🇴", team2: "Ghana", team2Flag: "🇬🇭", score1: 1, score2: 0, winner: "team1", status: "played" },
  { round: "R32", team1: "Australia", team1Flag: "🇦🇺", team2: "Egypt", team2Flag: "🇪🇬", score1: 1, score2: 1, wentToPenalties: true, winner: "team2", status: "played" },

  // ---- Round of 16 (M89-M96) ----
  { round: "R16", team1: "Paraguay", team1Flag: "🇵🇾", team2: "France", team2Flag: "🇫🇷", score1: 0, score2: 1, winner: "team2", status: "played" },
  { round: "R16", team1: "Canada", team1Flag: "🇨🇦", team2: "Morocco", team2Flag: "🇲🇦", score1: 0, score2: 3, winner: "team2", status: "played" },
  { round: "R16", team1: "Brazil", team1Flag: "🇧🇷", team2: "Norway", team2Flag: "🇳🇴", score1: 1, score2: 2, winner: "team2", status: "played" },
  { round: "R16", team1: "Mexico", team1Flag: "🇲🇽", team2: "England", team2Flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", score1: 2, score2: 3, winner: "team2", status: "played" },
  { round: "R16", team1: "Portugal", team1Flag: "🇵🇹", team2: "Spain", team2Flag: "🇪🇸", score1: 0, score2: 1, winner: "team2", status: "played" },
  { round: "R16", team1: "USA", team1Flag: "🇺🇸", team2: "Belgium", team2Flag: "🇧🇪", score1: 1, score2: 4, winner: "team2", status: "played" },
  { round: "R16", team1: "Argentina", team1Flag: "🇦🇷", team2: "Egypt", team2Flag: "🇪🇬", score1: 3, score2: 2, winner: "team1", status: "played" },
  { round: "R16", team1: "Switzerland", team1Flag: "🇨🇭", team2: "Colombia", team2Flag: "🇨🇴", score1: 0, score2: 0, wentToPenalties: true, winner: "team1", status: "played" },

  // ---- Quarter-finals (M97-M100) ----
  { round: "QF", team1: "France", team1Flag: "🇫🇷", team2: "Morocco", team2Flag: "🇲🇦", score1: 2, score2: 0, winner: "team1", status: "played" },
  { round: "QF", team1: "Spain", team1Flag: "🇪🇸", team2: "Belgium", team2Flag: "🇧🇪", score1: 2, score2: 1, winner: "team1", status: "played" },
  { round: "QF", team1: "Norway", team1Flag: "🇳🇴", team2: "England", team2Flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", score1: 1, score2: 2, wentToExtraTime: true, winner: "team2", status: "played" },
  { round: "QF", team1: "Argentina", team1Flag: "🇦🇷", team2: "Switzerland", team2Flag: "🇨🇭", score1: 3, score2: 1, wentToExtraTime: true, winner: "team1", status: "played" },

  // ---- Semi-finals (M101-M102) ----
  { round: "SF", team1: "France", team1Flag: "🇫🇷", team2: "Spain", team2Flag: "🇪🇸", score1: 0, score2: 2, winner: "team2", status: "played" },
  { round: "SF", fixtureId: 18241006, team1: "England", team1Flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", team2: "Argentina", team2Flag: "🇦🇷", status: "live" },

  // ---- Final (M104) ---- (team2 TBD until the live SF above concludes)
  { round: "F", team1: "Spain", team1Flag: "🇪🇸", team2: "TBD", team2Flag: "🏳️", status: "upcoming" },
];
