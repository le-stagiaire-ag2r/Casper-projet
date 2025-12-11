//! Test stake() on V10 using Odra livenet with_tokens()
//! Run with: cargo run --bin test_stake_v10 --features livenet

use std::str::FromStr;
use odra::host::{HostEnv, HostRefLoader};
use odra::prelude::*;
use odra::casper_types::U512;
use stakevue_contract::{StakeVue, StakeVueHostRef};

// StakeVue V10 package hash
const STAKEVUE_V10_ADDRESS: &str = "hash-d1857d850653ebc0aaf13fffd7610b9e3f4794dfefae158b193edf11a5dd62e3";

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Test Stake V10 ===");
    println!("StakeVue V10: {}", STAKEVUE_V10_ADDRESS);
    println!();

    let stakevue = load_stakevue(&env);
    println!("Loaded StakeVue at: {:?}", stakevue.address());

    // Check current state
    println!("Total staked before: {:?}", stakevue.get_total_staked());
    println!("Token address: {:?}", stakevue.get_token());
    println!();

    // Set gas (15 CSPR should be enough)
    env.set_gas(15_000_000_000u64);

    // Stake 1 CSPR using with_tokens()
    let stake_amount = U512::from(1_000_000_000u64); // 1 CSPR
    println!("Staking {} motes (1 CSPR) via with_tokens()...", stake_amount);

    stakevue.with_tokens(stake_amount).stake();

    println!();
    println!("SUCCESS! Stake completed.");
    println!("Total staked after: {:?}", stakevue.get_total_staked());
}

fn load_stakevue(env: &HostEnv) -> StakeVueHostRef {
    let address = Address::from_str(STAKEVUE_V10_ADDRESS)
        .expect("Failed to parse StakeVue address");
    StakeVue::load(env, address)
}
