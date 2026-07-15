/** Mirrors the on-chain u8 team code in MikuPool (programs/conquest-bet/src/state.rs). */
export enum MikuTeam {
  England = 0,
  Argentina = 1,
  Spain = 2,
}

export interface MikuBettor {
  address: string;
  team: MikuTeam;
}

export interface MikuPool {
  address: string;
  totalEngland: number;
  totalArgentina: number;
  totalSpain: number;
  currentHolder: MikuTeam;
  isResolved: boolean;
  totalPool: number;
  bettors: MikuBettor[];
}
