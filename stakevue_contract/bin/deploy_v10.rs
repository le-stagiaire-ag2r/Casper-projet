//! Deploy StakeVue V10 with token address in init
//! Run with: cargo run --bin deploy_v10 --features livenet

use std::str::FromStr;
use odra::host::Deployer;
use odra::prelude::*;
use stakevue_contract::{StakeVue, StakeVueInitArgs};

const STCSPR_TOKEN_ADDRESS: &str = "hash-938972a16eba403529c2c76aa1727a026fc1aa328f553185daba45703213f6bc";

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Deploying StakeVue V10 ===");

    // Get owner from the livenet environment (your account)
    let owner = env.caller();
    println!("Owner: {:?}", owner);

    // Parse token address
    let token = Address::from_str(STCSPR_TOKEN_ADDRESS)
        .expect("Failed to parse token address");
    println!("Token: {:?}", token);

    // Set gas for deployment
    env.set_gas(200_000_000_000u64); // 200 CSPR

    // Deploy the contract
    println!("Deploying...");
    let contract = StakeVue::deploy(&env, StakeVueInitArgs { owner, token });

    println!();
    println!("SUCCESS!");
    println!("Contract deployed at: {:?}", contract.address());
}
