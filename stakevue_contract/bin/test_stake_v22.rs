//! Test stake on StakeVue V22 contract (Odra 2.5.0 + U512 fix)
//! Run with: cargo run --bin test_stake_v22 --features livenet

use std::str::FromStr;
use odra::casper_types::{AsymmetricType, PublicKey, U512};
use odra::host::{HostRef, HostRefLoader};
use odra::prelude::*;
use stakevue_contract::StakeVue;

// V22 Contract (U512 SDK fix)
const CONTRACT_HASH: &str = "hash-2d6a399bca8c71bb007de1cbcd57c7d6a54dc0283376a08fe6024a33c02b0ad3";

// MAKE validator (Casper testnet)
const VALIDATOR_PUBLIC_KEY: &str = "0106ca7c39cd272dbf21a86eeb3b36b7c26e2e9b94af64292419f7862936bca2ca";

// Stake amount: 10 CSPR
const STAKE_AMOUNT_CSPR: u64 = 10;

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Testing StakeVue V22 ===");
    println!("V22: U512 fix for SDK compatibility");
    println!();
    println!("Contract: {}", CONTRACT_HASH);

    let address = Address::from_str(CONTRACT_HASH).expect("Invalid contract hash");
    let stakevue = StakeVue::load(&env, address);

    let caller = env.caller();
    println!("Caller: {:?}", caller);

    // Check validators
    println!("\n--- Validators ---");
    let validators = stakevue.get_validators();
    println!("Total validators: {}", validators.len());
    for (i, v) in validators.iter().enumerate() {
        println!("  [{}] {}", i + 1, v.to_hex());
    }

    // Check state
    println!("\n--- Contract State ---");
    let stcspr_balance = stakevue.get_stcspr_balance(caller);
    let pool = stakevue.get_total_pool();
    let liquidity = stakevue.get_available_liquidity();
    println!("Your stCSPR balance: {}", stcspr_balance);
    println!("Total pool: {} CSPR", pool / U512::from(1_000_000_000u64));
    println!("Available liquidity: {} CSPR", liquidity / U512::from(1_000_000_000u64));

    println!("\n=== V22 Ready! ===");
    println!("To stake, uncomment the stake code below and run again.");

    // Uncomment to test stake:
    /*
    let validator = PublicKey::from_hex(VALIDATOR_PUBLIC_KEY)
        .expect("Invalid validator public key");
    let stake_amount = U512::from(STAKE_AMOUNT_CSPR) * U512::from(1_000_000_000u64);
    println!("\nStaking {} CSPR...", STAKE_AMOUNT_CSPR);
    env.set_gas(10_000_000_000u64);
    stakevue.with_tokens(stake_amount).stake(validator);
    println!("Stake SUCCESS!");
    */
}
