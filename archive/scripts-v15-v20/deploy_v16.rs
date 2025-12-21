//! Deploy StakeVue V16 - With Validator Delegation
//! Run with: cargo run --bin deploy_v16 --features livenet

use odra::host::Deployer;
use odra::prelude::*;
use stakevue_contract::{StakeVue, StakeVueInitArgs};

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Deploying StakeVue V16 (Validator Delegation) ===");

    let owner = env.caller();
    println!("Owner: {:?}", owner);

    // Gas for deployment
    env.set_gas(600_000_000_000u64);

    println!("Deploying...");
    let contract = StakeVue::deploy(&env, StakeVueInitArgs { owner });

    println!("SUCCESS!");
    println!("Contract: {:?}", contract.address());
    println!();
    println!("V16 Features:");
    println!("- Exchange rate mechanism");
    println!("- Validator delegation support");
    println!("- Minimum delegation: 500 CSPR");
    println!();
    println!("IMPORTANT: Set validator after deploy:");
    println!("cargo run --bin set_validator_v16 --features livenet");
    println!();
    println!("Test with:");
    println!("cargo run --bin test_stake_v16 --features livenet");
}
