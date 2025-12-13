//! Deploy StakeVue V17 - Multi-Validator + Withdrawal Queue
//! Run with: cargo run --bin deploy_v17 --features livenet

use odra::host::{Deployer, HostEnv};
use odra::prelude::*;
use stakevue_contract::{StakeVue, StakeVueInitArgs};

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Deploying StakeVue V17 ===");
    println!("Features:");
    println!("- Multi-validator support (up to 20 validators)");
    println!("- Withdrawal queue with unbonding period");
    println!("- Harvest rewards function");
    println!();

    let owner = env.caller();
    println!("Owner: {:?}", owner);

    // Set gas for deployment
    env.set_gas(200_000_000_000u64); // 200 CSPR

    // Deploy V17 contract
    println!("\nDeploying contract...");
    let contract = StakeVue::deploy(&env, StakeVueInitArgs { owner });

    println!("\nSUCCESS!");
    println!("Contract deployed at: {:?}", contract.address());
    println!();
    println!("Token Name: {}", contract.token_name());
    println!("Token Symbol: {}", contract.token_symbol());
    println!();
    println!("Next steps:");
    println!("1. Update CONTRACT_HASH in add_validators_v17.rs");
    println!("2. Run: cargo run --bin add_validators_v17 --features livenet");
    println!("3. Run: cargo run --bin test_stake_v17 --features livenet");
}
