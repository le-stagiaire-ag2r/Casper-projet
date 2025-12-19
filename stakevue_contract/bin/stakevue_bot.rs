//! StakeVue V20 Full Automation Bot
//! Handles ALL admin tasks automatically:
//! 1. Auto-delegate when pool >= 500 CSPR
//! 2. Auto-undelegate when users request unstake
//! 3. Track unbonding and manage liquidity
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

const CONTRACT_HASH: &str = "hash-ccc0c534ac1b46cde529b3fa0ec69c3d1c0fae878846185c7d274497ff326d4f";

// Validators to delegate to (round-robin distribution)
const VALIDATORS: &[&str] = &[
    "0106ca7c39cd272dbf21a86eeb3b36b7c26e2e9b94af64292419f7862936bca2ca", // Make
    "01a62e8605be4c984ee547ac3da0cf3541561a92c5bb5de699aa4ec095b471bc81", // Arcadia
    "0124abb8fa2c442db7b75f47e14b520ae1cd5ec9e38323a75a7be28629b8ef1a1c", // Arcadia Premium
];

// Timing
const CHECK_INTERVAL_SECS: u64 = 60;      // Check every 1 minute
const MIN_DELEGATION: u64 = 500_000_000_000; // 500 CSPR

// Gas limits
const GAS_DELEGATE: u64 = 50_000_000_000;   // 50 CSPR
const GAS_UNDELEGATE: u64 = 50_000_000_000; // 50 CSPR

// ============================================================================
// BOT STATE
// ============================================================================

struct BotState {
    validator_index: usize,
    total_delegated: u64,
    total_undelegated: u64,
    cycles: u64,
}

impl BotState {
    fn new() -> Self {
        Self {
            validator_index: 0,
            total_delegated: 0,
            total_undelegated: 0,
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
    println!("║          StakeVue V20 - Full Automation Bot                  ║");
    println!("╠══════════════════════════════════════════════════════════════╣");
    println!("║  Auto-delegate   │ When pool >= 500 CSPR                     ║");
    println!("║  Auto-undelegate │ When users request unstake                ║");
    println!("║  Multi-validator │ Round-robin distribution                  ║");
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
        println!("│ Stats: {} CSPR delegated, {} CSPR undelegated",
                 state.total_delegated / 1_000_000_000,
                 state.total_undelegated / 1_000_000_000);
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

    let liquidity_cspr = available_liquidity.as_u64() / 1_000_000_000;
    let pending_undel_cspr = pending_undelegations.as_u64() / 1_000_000_000;
    let pending_withdraw_cspr = pending_withdrawals.as_u64() / 1_000_000_000;

    println!("│ Pool status:");
    println!("│   Available liquidity: {} CSPR", liquidity_cspr);
    println!("│   Pending undelegations: {} CSPR", pending_undel_cspr);
    println!("│   Pending withdrawals: {} CSPR", pending_withdraw_cspr);

    // ========================================================================
    // ACTION 1: Auto-delegate if pool >= 500 CSPR
    // ========================================================================
    if available_liquidity >= U512::from(MIN_DELEGATION) {
        let validator_str = state.next_validator();
        println!("│");
        println!("│ → Auto-delegating {} CSPR to {}...", liquidity_cspr, &validator_str[..12]);

        let validator = PublicKey::from_hex(validator_str)
            .map_err(|e| format!("Invalid validator: {:?}", e))?;

        env.set_gas(GAS_DELEGATE);
        contract.admin_delegate(validator, available_liquidity);

        state.total_delegated += available_liquidity.as_u64();
        actions += 1;
        println!("│ ✓ Delegated successfully!");
    }

    // ========================================================================
    // ACTION 2: Auto-undelegate if there are pending undelegation requests
    // ========================================================================
    if pending_undelegations > U512::zero() {
        // Find a validator with enough delegation
        for validator_str in VALIDATORS {
            let validator = PublicKey::from_hex(validator_str)
                .map_err(|e| format!("Invalid validator: {:?}", e))?;

            let delegated = contract.get_delegated_to_validator(validator.clone());

            if delegated >= pending_undelegations {
                println!("│");
                println!("│ → Auto-undelegating {} CSPR from {}...", pending_undel_cspr, &validator_str[..12]);

                env.set_gas(GAS_UNDELEGATE);
                contract.admin_undelegate(validator, pending_undelegations);

                state.total_undelegated += pending_undelegations.as_u64();
                actions += 1;
                println!("│ ✓ Undelegated successfully!");
                println!("│   Note: Wait ~7 eras for unbonding, then add liquidity");
                break;
            }
        }
    }

    Ok(actions)
}
