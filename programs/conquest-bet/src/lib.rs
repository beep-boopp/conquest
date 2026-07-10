use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;
use state::PredictionType;

declare_id!("79iywL79mqxWLaPiyu5NFztVdmUQ3A5L8iHNSCE9RHTp");

#[program]
pub mod conquest_bet {
    use super::*;

    pub fn create_room(ctx: Context<CreateRoom>, room_id: u64) -> Result<()> {
        instructions::create_room::create_room_handler(ctx, room_id)
    }

    pub fn join_room(ctx: Context<JoinRoom>) -> Result<()> {
        instructions::join_room::join_room_handler(ctx)
    }

    pub fn propose_wager(
        ctx: Context<ProposeWager>,
        wager_id: u64,
        prediction_type: PredictionType,
        fixture_id: u64,
        proposer_predicted_outcome: u8,
        land_stake: u64,
    ) -> Result<()> {
        instructions::propose_wager::propose_wager_handler(
            ctx,
            wager_id,
            prediction_type,
            fixture_id,
            proposer_predicted_outcome,
            land_stake,
        )
    }

    pub fn accept_wager(ctx: Context<AcceptWager>, predicted_outcome: u8, land_stake: u64) -> Result<()> {
        instructions::accept_wager::accept_wager_handler(ctx, predicted_outcome, land_stake)
    }

    pub fn resolve_wager(ctx: Context<ResolveWager>, match_result: u8) -> Result<()> {
        instructions::resolve_wager::resolve_wager_handler(ctx, match_result)
    }

    pub fn claim_victory(ctx: Context<ClaimVictory>, tournament_complete: bool) -> Result<()> {
        instructions::claim_victory::claim_victory_handler(ctx, tournament_complete)
    }
}
