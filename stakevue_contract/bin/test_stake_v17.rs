//! Test stake on V17 contract with multi-validator support
//! Run with: cargo run --bin test_stake_v17 --features livenet

use std::str::FromStr;
use odra::casper_types::{AsymmetricType, PublicKey, U512};
use odra::host::{HostRef, HostRefLoader};
use odra::prelude::*;
use stakevue_contract::StakeVue;

// V17 Contract Address
const CONTRACT_HASH: &str = "hash-8725e658c44512f4ab44a3bc3009e17382ae9f83743270219cc4a9e2dd4b21ff";

// MAKE validator - default for testing
const VALIDATOR_PUBLIC_KEY: &str = "0106ca7c39cd272dbf21a86eeb3b36b7c26e2e9b94af64292419f7862936bca2ca";

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Testing Stake on V17 (Multi-Validator) ===");
    println!("Contract: {}", CONTRACT_HASH);

    // Load existing contract
    let address = Address::from_str(CONTRACT_HASH).expect("Invalid contract hash");
    let stakevue = StakeVue::load(&env, address);

    let caller = env.caller();
    println!("Caller: {:?}", caller);

    // Parse validator
    let validator = PublicKey::from_hex(VALIDATOR_PUBLIC_KEY)
        .expect("Invalid validator public key");

    // Check validator is approved
    if !stakevue.is_validator_active(validator.clone()) {
        println!("\nERROR: Validator not approved!");
        println!("Run: cargo run --bin add_validators_v17 --features livenet");
        return;
    }
    println!("\nValidator: {}", &VALIDATOR_PUBLIC_KEY[..20]);
    println!("Validator active: ✓");

    // Get current state
    let rate_before = stakevue.get_exchange_rate();
    println!("\nExchange rate: {} (1.0 = 1_000_000_000)", rate_before);
    println!("Total pool: {}", stakevue.get_total_pool());
    println!("Total validators: {}", stakevue.get_validator_count());

    // Stake 500 CSPR (minimum for delegation)
    let stake_amount = U512::from(500_000_000_000u64); // 500 CSPR
    env.set_gas(15_000_000_000u64); // 15 CSPR gas

    println!("\nStaking 500 CSPR to validator...");
    stakevue.with_tokens(stake_amount).stake(validator.clone());

    // Check results
    let stcspr_balance = stakevue.get_stcspr_balance(caller);
    let cspr_value = stakevue.get_cspr_value(caller);
    let rate_after = stakevue.get_exchange_rate();
    let delegated = stakevue.get_delegated_to_validator(validator);

    println!("\nSUCCESS!");
    println!("stCSPR balance: {}", stcspr_balance);
    println!("CSPR value: {}", cspr_value);
    println!("Exchange rate: {}", rate_after);
    println!("Total pool: {}", stakevue.get_total_pool());
    println!("Delegated to validator: {}", delegated);
    println!();
    println!("To request unstake:");
    println!("cargo run --bin test_unstake_v17 --features livenet");
}
