//! Test stake on V16 contract with validator delegation
//! Run with: cargo run --bin test_stake_v16 --features livenet

use std::str::FromStr;
use odra::casper_types::U512;
use odra::host::{HostRef, HostRefLoader};
use odra::prelude::*;
use stakevue_contract::StakeVue;

// V16 Contract Address - UPDATE THIS AFTER DEPLOY (with 'hash-' prefix)
const CONTRACT_HASH: &str = "hash-bfcaf222f20c620d16297acf702d1ba46b4e1b95264fb02f1bcc154dc93923b2";

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Testing Stake on V16 (Validator Delegation) ===");
    println!("Contract: {}", CONTRACT_HASH);

    // Load existing contract
    let address = Address::from_str(CONTRACT_HASH).expect("Invalid contract hash");
    let stakevue = StakeVue::load(&env, address);

    let caller = env.caller();

    // Check validator is set
    match stakevue.get_validator() {
        Some(validator) => println!("Validator: {:?}", validator),
        None => {
            println!("ERROR: No validator set!");
            println!("Run: cargo run --bin set_validator_v16 --features livenet");
            return;
        }
    }

    // Get current state
    let rate_before = stakevue.get_exchange_rate();
    println!("\nExchange rate: {} (1.0 = 1_000_000_000)", rate_before);
    println!("Total pool: {}", stakevue.get_total_pool());

    // Stake 500 CSPR (minimum for delegation)
    let stake_amount = U512::from(500_000_000_000u64); // 500 CSPR
    env.set_gas(15_000_000_000u64); // 15 CSPR gas

    println!("\nStaking 500 CSPR (minimum delegation)...");
    stakevue.with_tokens(stake_amount).stake();

    // Check results
    let stcspr_balance = stakevue.get_stcspr_balance(caller);
    let cspr_value = stakevue.get_cspr_value(caller);
    let rate_after = stakevue.get_exchange_rate();
    let delegated = stakevue.get_delegated_amount();

    println!("\nSUCCESS!");
    println!("stCSPR balance: {}", stcspr_balance);
    println!("CSPR value: {}", cspr_value);
    println!("Exchange rate: {}", rate_after);
    println!("Total pool: {}", stakevue.get_total_pool());
    println!("Delegated to validator: {}", delegated);
}
