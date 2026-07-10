import * as anchor from "@coral-xyz/anchor";

// TODO: import the generated IDL type once `anchor build` has run, e.g.:
// import { Program } from "@coral-xyz/anchor";
// import { ConquestBet } from "../target/types/conquest_bet";

describe("conquest-bet", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // TODO: const program = anchor.workspace.ConquestBet as Program<ConquestBet>;

  it.skip("creates a room", async () => {
    // TODO: call create_room, fetch the Room PDA, assert creator/status/land
  });

  it.skip("joins a room", async () => {
    // TODO: call join_room, assert player appended with initial land
  });

  it.skip("proposes a wager", async () => {
    // TODO: call propose_wager, assert Wager PDA created in Proposed status
  });

  it.skip("accepts a wager", async () => {
    // TODO: call accept_wager, assert status transitions to Accepted
  });

  it.skip("resolves a wager via TxLINE CPI", async () => {
    // TODO: call resolve_wager with a mocked TxLINE stat account, assert land transfer
  });

  it.skip("claims victory", async () => {
    // TODO: call claim_victory, assert room.status becomes Completed
  });
});
