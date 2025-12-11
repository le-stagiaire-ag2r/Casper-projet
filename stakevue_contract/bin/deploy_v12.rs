//! Deploy StakeVue V12 - Integrated CEP-18 token architecture
//! This follows the same pattern as official Casper liquid staking contracts
//! Run with: cargo run --bin deploy_v12 --features livenet

use odra::host::Deployer;
use odra::prelude::*;
use stakevue_contract::{StakeVue, StakeVueInitArgs};

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Deploying StakeVue V12 (Integrated CEP-18 Token) ===");
    println!();
    println!("This version integrates the stCSPR token directly into the contract");
    println!("using SubModule<Cep18>, like the official Casper liquid staking contracts.");
    println!();

    // Get owner from the livenet environment (your account)
    let owner = env.caller();
    println!("Owner: {:?}", owner);

    // Set gas for deployment (500 CSPR for safety)
    env.set_gas(500_000_000_000u64);

    // Deploy the contract - only needs owner now!
    println!("Deploying...");
    let contract = StakeVue::deploy(&env, StakeVueInitArgs { owner });

    println!();
    println!("SUCCESS!");
    println!("Contract deployed at: {:?}", contract.address());
    println!();
    println!("The stCSPR token is now integrated into this contract.");
    println!("No separate token contract needed!");
}
