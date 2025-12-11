//! Deploy StakeVue V14 - With integrated CEP-18 token
//! Run with: cargo run --bin deploy_v14 --features livenet

use odra::host::Deployer;
use odra::prelude::*;
use stakevue_contract::{StakeVue, StakeVueInitArgs};

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Deploying StakeVue V14 (CEP-18 integrated) ===");

    let owner = env.caller();
    println!("Owner: {:?}", owner);

    // More gas needed for CEP-18 integration
    env.set_gas(600_000_000_000u64);

    println!("Deploying...");
    let contract = StakeVue::deploy(&env, StakeVueInitArgs { owner });

    println!("SUCCESS!");
    println!("Contract: {:?}", contract.address());
    println!();
    println!("stCSPR token is integrated. Test with:");
    println!("cargo run --bin test_stake_v14 --features livenet");
}
