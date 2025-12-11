//! Test stake() on V12 using Odra livenet with_tokens()
//! Run with: cargo run --bin test_stake_v12 --features livenet

use std::str::FromStr;
use odra::host::{HostEnv, HostRef, HostRefLoader};
use odra::prelude::*;
use odra::casper_types::U512;
use stakevue_contract::{StakeVue, StakeVueHostRef};

// TODO: Update this with the deployed V12 contract address
const STAKEVUE_V12_ADDRESS: &str = "hash-REPLACE_WITH_V12_ADDRESS";

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Test Stake V12 (Integrated CEP-18 Token) ===");
    println!("StakeVue V12: {}", STAKEVUE_V12_ADDRESS);
    println!();

    let stakevue = load_stakevue(&env);
    println!("Loaded StakeVue at: {:?}", stakevue.address());

    // Check initial state
    println!();
    println!("=== Initial State ===");
    println!("Total staked: {:?}", stakevue.get_total_staked());
    println!("Token symbol: {}", stakevue.token_symbol());
    println!("Token total supply: {:?}", stakevue.token_total_supply());
    println!();

    // Set gas (15 CSPR should be enough)
    env.set_gas(15_000_000_000u64);

    // Stake 1 CSPR using with_tokens()
    let stake_amount = U512::from(1_000_000_000u64); // 1 CSPR
    println!("Staking {} motes (1 CSPR) via with_tokens()...", stake_amount);

    stakevue.with_tokens(stake_amount).stake();

    println!();
    println!("=== SUCCESS! Stake completed. ===");
    println!();
    println!("=== Final State ===");
    println!("Total staked: {:?}", stakevue.get_total_staked());
    println!("Token total supply: {:?}", stakevue.token_total_supply());

    // Check our stCSPR balance
    let caller = env.caller();
    println!("Your stCSPR balance: {:?}", stakevue.balance_of(&caller));
}

fn load_stakevue(env: &HostEnv) -> StakeVueHostRef {
    let address = Address::from_str(STAKEVUE_V12_ADDRESS)
        .expect("Failed to parse StakeVue address");
    StakeVue::load(env, address)
}
