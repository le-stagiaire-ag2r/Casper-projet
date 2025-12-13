//! Deploy StakeVue V18 - Multi-Validator + Withdrawal Queue + Delegation Debug
//! Run with: cargo run --bin deploy_v18 --features livenet

use odra::host::{Deployer, HostEnv};
use odra::prelude::*;
use stakevue_contract::{StakeVue, StakeVueInitArgs};

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Deploying StakeVue V18 ===");
    println!("Features:");
    println!("- Multi-validator support (up to 20 validators)");
    println!("- Withdrawal queue with unbonding period");
    println!("- Harvest rewards function");
    println!("- V18: Pre-flight delegation checks before undelegate");
    println!("- V18: Diagnostic functions for debugging delegation state");
    println!();

    let owner = env.caller();
    println!("Owner: {:?}", owner);

    // Set gas for deployment (600 CSPR like V16/V17)
    env.set_gas(600_000_000_000u64); // 600 CSPR

    // Deploy V18 contract
    println!("\nDeploying contract...");
    let contract = StakeVue::deploy(&env, StakeVueInitArgs { owner });

    println!("\nSUCCESS!");
    println!("Contract deployed at: {:?}", contract.address());
    println!();
    println!("Token Name: {}", contract.token_name());
    println!("Token Symbol: {}", contract.token_symbol());
    println!();
    println!("Next steps:");
    println!("1. Update CONTRACT_HASH in add_validators_v18.rs");
    println!("2. Run: cargo run --bin add_validators_v18 --features livenet");
    println!("3. Run: cargo run --bin test_stake_v18 --features livenet");
}
