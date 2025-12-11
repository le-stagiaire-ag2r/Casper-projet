//! Deploy StakeVue V13 - Minimal version (like V8.2 that worked)
//! Run with: cargo run --bin deploy_v13 --features livenet

use odra::host::Deployer;
use odra::prelude::*;
use stakevue_contract::{StakeVue, StakeVueInitArgs};

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Deploying StakeVue V13 ===");

    let owner = env.caller();
    println!("Owner: {:?}", owner);

    env.set_gas(500_000_000_000u64);

    println!("Deploying...");
    let contract = StakeVue::deploy(&env, StakeVueInitArgs { owner });

    println!("SUCCESS!");
    println!("Contract: {:?}", contract.address());
}
