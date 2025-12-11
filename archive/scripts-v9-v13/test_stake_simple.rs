//! Test stake_simple() - payable function WITHOUT cross-contract calls
//! This isolates if attached_value() works on Casper 2.0
//! Run with: cargo run --bin test_stake_simple --features livenet

use std::str::FromStr;
use odra::host::{HostEnv, HostRef, HostRefLoader};
use odra::prelude::*;
use odra::casper_types::U512;
use stakevue_contract::{StakeVue, StakeVueHostRef};

// StakeVue V10 package hash
const STAKEVUE_V10_ADDRESS: &str = "hash-d1857d850653ebc0aaf13fffd7610b9e3f4794dfefae158b193edf11a5dd62e3";

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Test Stake Simple (NO cross-contract calls) ===");
    println!("StakeVue V10: {}", STAKEVUE_V10_ADDRESS);
    println!();

    let stakevue = load_stakevue(&env);
    println!("Loaded StakeVue at: {:?}", stakevue.address());

    // Check current state
    println!("Total staked before: {:?}", stakevue.get_total_staked());
    println!();

    // Set gas (10 CSPR should be enough for simple function)
    env.set_gas(10_000_000_000u64);

    // Stake 1 CSPR using with_tokens() - calls stake_simple()
    let stake_amount = U512::from(1_000_000_000u64); // 1 CSPR
    println!("Calling stake_simple() with {} motes (1 CSPR)...", stake_amount);
    println!("This function does NOT do any cross-contract calls.");
    println!();

    stakevue.with_tokens(stake_amount).stake_simple();

    println!();
    println!("SUCCESS! stake_simple() completed.");
    println!("Total staked after: {:?}", stakevue.get_total_staked());
}

fn load_stakevue(env: &HostEnv) -> StakeVueHostRef {
    let address = Address::from_str(STAKEVUE_V10_ADDRESS)
        .expect("Failed to parse StakeVue address");
    StakeVue::load(env, address)
}
