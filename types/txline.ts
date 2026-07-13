/** A single World Cup fixture as returned by TxLINE's fixtures endpoint. */
export interface TxLineFixture {
  fixtureId: string;
  homeTeam: string;
  awayTeam: string;
  kickoffTime: string;
  competition: string;
}

// TODO: define TxLineScore and TxLineOdds shapes once TxLINE's API docs
// for the World Cup free tier (scores/odds endpoints) are consulted.
