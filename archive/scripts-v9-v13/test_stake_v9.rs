//! Test stake() on StakeVue V9 using Odra livenet with_tokens()
//! Run with: cargo run --bin test_stake_v9 --features livenet

use std::str::FromStr;
use odra::host::{HostEnv, HostRef, HostRefLoader};
use odra::prelude::*;
use odra::casper_types::U512;
use stakevue_contract::{StakeVue, StakeVueHostRef};

// StakeVue V9 package hash
const STAKEVUE_V9_ADDRESS: &str = "hash-c977c574e95ec91df64d2354f170542a019bb716dcd6268f301b27412d107e8b";

fn main() {
    // Load the Casper livenet environment
    let env = odra_casper_livenet_env::env();

    println!("=== Test Stake V9 ===");
    println!("StakeVue V9: {}", STAKEVUE_V9_ADDRESS);
    println!();

    // Load the existing StakeVue V9 contract
    let mut stakevue = load_stakevue(&env);
    println!("Loaded StakeVue at: {:?}", stakevue.address());

    // Check current state
    println!("Total staked: {:?}", stakevue.get_total_staked());
    println!("Token address: {:?}", stakevue.get_token());
    println!();

    // Set gas for stake transaction (needs to include gas + attached value)
    // 5 CSPR for gas + 1 CSPR for stake
    env.set_gas(6_000_000_000u64);

    // Stake 1 CSPR using with_tokens()
    let stake_amount = U512::from(1_000_000_000u64); // 1 CSPR
    println!("Staking {} motes via with_tokens()...", stake_amount);

    stakevue.with_tokens(stake_amount).stake();

    println!();
    println!("SUCCESS! Stake completed.");
    println!("New total staked: {:?}", stakevue.get_total_staked());
}

/// Load the existing StakeVue V9 contract
fn load_stakevue(env: &HostEnv) -> StakeVueHostRef {
    let address = Address::from_str(STAKEVUE_V9_ADDRESS)
        .expect("Failed to parse StakeVue address");
    StakeVue::load(env, address)
}
