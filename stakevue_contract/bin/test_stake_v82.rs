//! Test stake() on V8.2 using Odra livenet with_tokens()
//! This tests if payable works on a contract that WORKED before
//! Run with: cargo run --bin test_stake_v82 --features livenet

use std::str::FromStr;
use odra::host::{HostEnv, HostRef, HostRefLoader};
use odra::prelude::*;
use odra::casper_types::U512;
use stakevue_contract::{StakeVue, StakeVueHostRef};

// StakeVue V8.2 package hash (the one that worked!)
const STAKEVUE_V82_ADDRESS: &str = "hash-822196e8212ae0e6f1b9d5e158091b6b9e97501b120e16693d4bb9da1bc602de";

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Test Stake V8.2 (the working version) ===");
    println!("StakeVue V8.2: {}", STAKEVUE_V82_ADDRESS);
    println!();

    let stakevue = load_stakevue(&env);
    println!("Loaded StakeVue at: {:?}", stakevue.address());

    // Check current state
    println!("Total staked before: {:?}", stakevue.get_total_staked());
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
    let address = Address::from_str(STAKEVUE_V82_ADDRESS)
        .expect("Failed to parse StakeVue address");
    StakeVue::load(env, address)
}
