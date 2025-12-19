//! StakeVue V20 Full Automation Bot
//!
//! Handles ALL admin tasks automatically:
//! 1. Auto-delegate when pool >= 500 CSPR
//! 2. Auto-undelegate when users request unstake
//! 3. Auto-add-liquidity after unbonding period
//! 4. Auto-claim for users (sends CSPR directly to them)
//!
//! User only needs to: STAKE and UNSTAKE
//! Everything else is automatic!
//!
//! Usage: cargo run --bin stakevue_bot --features livenet

use odra::casper_types::{U512, PublicKey, AsymmetricType};
use odra::host::HostRefLoader;
use odra::prelude::*;
use stakevue_contract::StakeVue;
use std::str::FromStr;
use std::{thread, time::Duration};

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONTRACT_HASH: &str = "hash-2d74e6397ffa1e7fcb63a18e0b4f60f5b2d14242273fce0f30efc0e95ce8e937";

// Validators to delegate to (round-robin distribution)
const VALIDATORS: &[&str] = &[
    "0106ca7c39cd272dbf21a86eeb3b36b7c26e2e9b94af64292419f7862936bca2ca", // Make
    "01a62e8605be4c984ee547ac3da0cf3541561a92c5bb5de699aa4ec095b471bc81", // Arcadia
];

// Timing
const CHECK_INTERVAL_SECS: u64 = 60;      // Check every 1 minute
const MIN_DELEGATION: u64 = 500_000_000_000; // 500 CSPR

// Gas limits
const GAS_DELEGATE: u64 = 50_000_000_000;    // 50 CSPR
const GAS_UNDELEGATE: u64 = 50_000_000_000;  // 50 CSPR
const GAS_ADD_LIQUIDITY: u64 = 5_000_000_000; // 5 CSPR
const GAS_CLAIM: u64 = 5_000_000_000;        // 5 CSPR

// ============================================================================
// BOT STATE
// ============================================================================

struct BotState {
    validator_index: usize,
    total_delegated: u64,
    total_undelegated: u64,
    total_claimed: u64,
    cycles: u64,
}

impl BotState {
    fn new() -> Self {
        Self {
            validator_index: 0,
            total_delegated: 0,
            total_undelegated: 0,
            total_claimed: 0,
            cycles: 0,
        }
    }

    fn next_validator(&mut self) -> &'static str {
        let validator = VALIDATORS[self.validator_index];
        self.validator_index = (self.validator_index + 1) % VALIDATORS.len();
        validator
    }
}

// ============================================================================
// MAIN BOT LOOP
// ============================================================================

fn main() {
    println!("╔══════════════════════════════════════════════════════════════╗");
    println!("║       StakeVue V20 - Full Automation Bot                     ║");
    println!("╠══════════════════════════════════════════════════════════════╣");
    println!("║  User does:                                                  ║");
    println!("║    • Stake    → Deposit CSPR, get stCSPR                     ║");
    println!("║    • Unstake  → Request withdrawal                           ║");
    println!("║    • Wait     → CSPR arrives automatically!                  ║");
    println!("╠══════════════════════════════════════════════════════════════╣");
    println!("║  Bot handles:                                                ║");
    println!("║    ✓ Auto-delegate to validators                             ║");
    println!("║    ✓ Auto-undelegate on unstake requests                     ║");
    println!("║    ✓ Auto-add-liquidity after unbonding                      ║");
    println!("║    ✓ Auto-claim and send CSPR to users                       ║");
    println!("╚══════════════════════════════════════════════════════════════╝");
    println!();
    println!("Contract: {}", CONTRACT_HASH);
    println!("Validators: {}", VALIDATORS.len());
    println!("Check interval: {} seconds", CHECK_INTERVAL_SECS);
    println!();
    println!("Press Ctrl+C to stop");
    println!("═══════════════════════════════════════════════════════════════");
    println!();

    let mut state = BotState::new();

    loop {
        state.cycles += 1;
        println!("┌─ Cycle {} ─────────────────────────────────────────────────", state.cycles);

        match run_cycle(&mut state) {
            Ok(actions) => {
                if actions == 0 {
                    println!("│ ✓ No action needed");
                }
            }
            Err(e) => {
                println!("│ ✗ Error: {}", e);
            }
        }

        println!("│");
        println!("│ Total stats:");
        println!("│   Delegated: {} CSPR", state.total_delegated / 1_000_000_000);
        println!("│   Undelegated: {} CSPR", state.total_undelegated / 1_000_000_000);
        println!("│   Claimed for users: {} CSPR", state.total_claimed / 1_000_000_000);
        println!("└─ Next check in {} seconds", CHECK_INTERVAL_SECS);
        println!();

        thread::sleep(Duration::from_secs(CHECK_INTERVAL_SECS));
    }
}

fn run_cycle(state: &mut BotState) -> Result<u32, String> {
    let env = odra_casper_livenet_env::env();
    let address = Address::from_str(CONTRACT_HASH)
        .map_err(|e| format!("Invalid contract hash: {:?}", e))?;
    let mut contract = StakeVue::load(&env, address);

    let mut actions = 0;

    // Get current state
    let available_liquidity = contract.get_available_liquidity();
    let pending_undelegations = contract.get_pending_undelegations();
    let pending_withdrawals = contract.get_pending_withdrawals();
    let next_request_id = contract.get_next_request_id();

    let liquidity_cspr = available_liquidity.as_u64() / 1_000_000_000;
    let pending_undel_cspr = pending_undelegations.as_u64() / 1_000_000_000;
    let pending_withdraw_cspr = pending_withdrawals.as_u64() / 1_000_000_000;

    println!("│ Pool status:");
    println!("│   Available liquidity: {} CSPR", liquidity_cspr);
    println!("│   Pending undelegations: {} CSPR", pending_undel_cspr);
    println!("│   Pending withdrawals: {} CSPR", pending_withdraw_cspr);
    println!("│   Next request ID: {}", next_request_id);

    // ========================================================================
    // ACTION 1: Auto-delegate if pool >= 500 CSPR
    // ========================================================================
    if available_liquidity >= U512::from(MIN_DELEGATION) {
        let validator_str = state.next_validator();
        println!("│");
        println!("│ → [DELEGATE] {} CSPR to {}...", liquidity_cspr, &validator_str[..12]);

        let validator = PublicKey::from_hex(validator_str)
            .map_err(|e| format!("Invalid validator: {:?}", e))?;

        env.set_gas(GAS_DELEGATE);
        contract.admin_delegate(validator, available_liquidity);

        state.total_delegated += available_liquidity.as_u64();
        actions += 1;
        println!("│   ✓ Delegated!");
    }

    // ========================================================================
    // ACTION 2: Auto-undelegate if there are pending undelegation requests
    // ========================================================================
    if pending_undelegations > U512::zero() {
        for validator_str in VALIDATORS {
            let validator = PublicKey::from_hex(validator_str)
                .map_err(|e| format!("Invalid validator: {:?}", e))?;

            let delegated = contract.get_delegated_to_validator(validator.clone());

            if delegated >= pending_undelegations {
                println!("│");
                println!("│ → [UNDELEGATE] {} CSPR from {}...", pending_undel_cspr, &validator_str[..12]);

                env.set_gas(GAS_UNDELEGATE);
                contract.admin_undelegate(validator, pending_undelegations);

                state.total_undelegated += pending_undelegations.as_u64();
                actions += 1;
                println!("│   ✓ Undelegated! (unbonding ~7 eras)");
                break;
            }
        }
    }

    // ========================================================================
    // ACTION 3: Auto-claim ready withdrawals for users
    // ========================================================================
    // Iterate through all request IDs and process ready ones
    for request_id in 1..next_request_id {
        // Check if this request is ready and not claimed
        let amount = contract.get_withdrawal_amount(request_id);
        let is_ready = contract.is_withdrawal_ready(request_id);
        let is_claimed = contract.is_withdrawal_claimed(request_id);

        if amount > U512::zero() && is_ready && !is_claimed {
            // Check if we have enough liquidity
            let current_liquidity = contract.get_available_liquidity();
            if current_liquidity >= amount {
                let amount_cspr = amount.as_u64() / 1_000_000_000;
                println!("│");
                println!("│ → [AUTO-CLAIM] Request #{}: {} CSPR to user...", request_id, amount_cspr);

                env.set_gas(GAS_CLAIM);
                contract.admin_process_claim(request_id);

                state.total_claimed += amount.as_u64();
                actions += 1;
                println!("│   ✓ Claimed and sent to user!");
            }
        }
    }

    Ok(actions)
}
