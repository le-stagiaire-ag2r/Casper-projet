//! Test unstake() on V13
//! Run with: cargo run --bin test_unstake_v13 --features livenet

use std::str::FromStr;
use odra::host::{HostEnv, HostRef, HostRefLoader};
use odra::prelude::*;
use odra::casper_types::U512;
use stakevue_contract::{StakeVue, StakeVueHostRef};

const STAKEVUE_V13_ADDRESS: &str = "hash-79ef2d52d937b2e97292a7a2c3d9bbd0fda93785baf18c7c547ec6fae9b9ddf3";

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Test Unstake V13 ===");

    let stakevue = load_stakevue(&env);
    let caller = env.caller();

    println!("Contract: {:?}", stakevue.address());
    println!("Your stake: {:?}", stakevue.get_stake(caller));
    println!("Total staked: {:?}", stakevue.get_total_staked());
    println!();

    env.set_gas(10_000_000_000u64);

    // Unstake 1 CSPR
    let unstake_amount = U512::from(1_000_000_000u64);
    println!("Unstaking {} motes (1 CSPR)...", unstake_amount);

    stakevue.unstake(unstake_amount);

    println!();
    println!("=== SUCCESS! Unstake completed. ===");
    println!("Your stake: {:?}", stakevue.get_stake(caller));
    println!("Total staked: {:?}", stakevue.get_total_staked());
}

fn load_stakevue(env: &HostEnv) -> StakeVueHostRef {
    let address = Address::from_str(STAKEVUE_V13_ADDRESS)
        .expect("Failed to parse address");
    StakeVue::load(env, address)
}
