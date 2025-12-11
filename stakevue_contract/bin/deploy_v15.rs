//! Deploy StakeVue V15 - With Exchange Rate
//! Run with: cargo run --bin deploy_v15 --features livenet

use odra::host::Deployer;
use odra::prelude::*;
use stakevue_contract::{StakeVue, StakeVueInitArgs};

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Deploying StakeVue V15 (Exchange Rate) ===");

    let owner = env.caller();
    println!("Owner: {:?}", owner);

    // Gas for deployment
    env.set_gas(600_000_000_000u64);

    println!("Deploying...");
    let contract = StakeVue::deploy(&env, StakeVueInitArgs { owner });

    println!("SUCCESS!");
    println!("Contract: {:?}", contract.address());
    println!();
    println!("V15 Features:");
    println!("- Exchange rate mechanism");
    println!("- add_rewards() to simulate validator rewards");
    println!("- get_exchange_rate() to query current rate");
    println!();
    println!("Test with:");
    println!("cargo run --bin test_stake_v15 --features livenet");
}
