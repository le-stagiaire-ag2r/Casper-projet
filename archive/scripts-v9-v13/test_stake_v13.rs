//! Test stake() on V13 - Minimal version
//! Run with: cargo run --bin test_stake_v13 --features livenet

use std::str::FromStr;
use odra::host::{HostEnv, HostRef, HostRefLoader};
use odra::prelude::*;
use odra::casper_types::U512;
use stakevue_contract::{StakeVue, StakeVueHostRef};

// TODO: Update this with the deployed V13 contract address
const STAKEVUE_V13_ADDRESS: &str = "hash-REPLACE_WITH_V13_ADDRESS";

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Test Stake V13 (Minimal - like V8.2) ===");
    println!("StakeVue V13: {}", STAKEVUE_V13_ADDRESS);
    println!();

    let stakevue = load_stakevue(&env);
    println!("Loaded StakeVue at: {:?}", stakevue.address());

    // Check initial state
    println!();
    println!("=== Initial State ===");
    println!("Total staked: {:?}", stakevue.get_total_staked());

    let caller = env.caller();
    println!("Your current stake: {:?}", stakevue.get_stake(caller));
    println!();

    // Set gas (10 CSPR should be enough for simple stake)
    env.set_gas(10_000_000_000u64);

    // Stake 1 CSPR using with_tokens()
    let stake_amount = U512::from(1_000_000_000u64); // 1 CSPR
    println!("Staking {} motes (1 CSPR) via with_tokens()...", stake_amount);
    println!();

    stakevue.with_tokens(stake_amount).stake();

    println!("=== SUCCESS! Stake completed. ===");
    println!();
    println!("=== Final State ===");
    println!("Total staked: {:?}", stakevue.get_total_staked());
    println!("Your stake: {:?}", stakevue.get_stake(caller));
}

fn load_stakevue(env: &HostEnv) -> StakeVueHostRef {
    let address = Address::from_str(STAKEVUE_V13_ADDRESS)
        .expect("Failed to parse StakeVue address");
    StakeVue::load(env, address)
}
