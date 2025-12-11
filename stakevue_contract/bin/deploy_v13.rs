//! Deploy StakeVue V13 - Minimal version (like V8.2 that worked)
//! This tests if payable works without any CEP-18 token
//! Run with: cargo run --bin deploy_v13 --features livenet

use odra::host::Deployer;
use odra::prelude::*;
use stakevue_contract::{StakeVue, StakeVueInitArgs};

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Deploying StakeVue V13 (Minimal - like V8.2) ===");
    println!();
    println!("This is a minimal staking contract without CEP-18 token.");
    println!("Testing if payable/attached_value() works on Casper 2.0.");
    println!();

    // Get owner from the livenet environment (your account)
    let owner = env.caller();
    println!("Owner: {:?}", owner);

    // Set gas for deployment (300 CSPR should be enough for this simple contract)
    env.set_gas(300_000_000_000u64);

    // Deploy the contract
    println!("Deploying...");
    let contract = StakeVue::deploy(&env, StakeVueInitArgs { owner });

    println!();
    println!("SUCCESS!");
    println!("Contract deployed at: {:?}", contract.address());
    println!();
    println!("Now test with: cargo run --bin test_stake_v13 --features livenet");
}
