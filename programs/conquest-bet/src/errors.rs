use anchor_lang::prelude::*;

#[error_code]
pub enum ConquestBetError {
    #[msg("Room already has the maximum number of players.")]
    RoomFull,

    #[msg("Room has already started; no new players can join.")]
    RoomAlreadyStarted,

    #[msg("Player is already a member of this room.")]
    PlayerAlreadyInRoom,

    #[msg("Account is not a valid player for this action.")]
    InvalidPlayer,

    #[msg("Wager is not in the expected status for this action.")]
    InvalidWagerStatus,

    #[msg("Wager does not belong to the supplied room.")]
    WagerRoomMismatch,

    #[msg("Predicted outcome must differ from the proposer's predicted outcome.")]
    SamePredictedOutcome,

    #[msg("Player does not have enough land to cover this stake.")]
    InsufficientLand,

    #[msg("Arithmetic overflow while updating land balances.")]
    MathOverflow,

    #[msg("Room cannot be completed yet: no player is eliminated and the tournament is not marked complete.")]
    RoomNotComplete,

    #[msg("Room has already been completed.")]
    RoomAlreadyCompleted,
}
