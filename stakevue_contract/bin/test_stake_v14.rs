//! Test stake() on V14 with CEP-18 token
//! Run with: cargo run --bin test_stake_v14 --features livenet

use std::str::FromStr;
use odra::host::{HostEnv, HostRef, HostRefLoader};
use odra::prelude::*;
use odra::casper_types::U512;
use stakevue_contract::{StakeVue, StakeVueHostRef};

// TODO: Update with V14 contract address after deployment
const STAKEVUE_V14_ADDRESS: &str = "hash-REPLACE_WITH_V14_ADDRESS";

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Test Stake V14 (CEP-18 integrated) ===");

    let mut stakevue = load_stakevue(&env);
    let caller = env.caller();

    println!("Contract: {:?}", stakevue.address());
    println!("Token symbol: {}", stakevue.token_symbol());
    println!("Token total supply: {:?}", stakevue.token_total_supply());
    println!("Your stCSPR balance: {:?}", stakevue.get_stake(caller));
    println!("Total staked: {:?}", stakevue.get_total_staked());
    println!();

    env.set_gas(15_000_000_000u64);

    let stake_amount = U512::from(1_000_000_000u64);
    println!("Staking {} motes (1 CSPR)...", stake_amount);

    stakevue.with_tokens(stake_amount).stake();

    println!();
    println!("=== SUCCESS! ===");
    println!("Your stCSPR balance: {:?}", stakevue.get_stake(caller));
    println!("Token total supply: {:?}", stakevue.token_total_supply());
    println!("Total staked: {:?}", stakevue.get_total_staked());
}

fn load_stakevue(env: &HostEnv) -> StakeVueHostRef {
    let address = Address::from_str(STAKEVUE_V14_ADDRESS)
        .expect("Failed to parse address");
    StakeVue::load(env, address)
}
