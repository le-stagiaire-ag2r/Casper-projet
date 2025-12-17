//! Deploy StakeVue V21 contract
//! V21: Hybrid architecture - Direct delegation for stakes >= 500 CSPR
//! Run with: cargo run --bin deploy_v21 --features livenet

use std::str::FromStr;
use odra::host::Deployer;
use odra::prelude::*;
use stakevue_contract::{StakeVue, StakeVueInitArgs};

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== StakeVue V21 Deployment ===");
    println!("V21: Hybrid Architecture - Direct Delegation for Large Stakes");
    println!("- stake() >= 500 CSPR: Delegates DIRECTLY (like Make/Wise)");
    println!("- stake() < 500 CSPR: Goes to pool (admin batches later)");
    println!();

    let owner = env.caller();
    println!("Owner address: {:?}", owner);

    // Set gas for deployment (600 CSPR)
    env.set_gas(600_000_000_000u64);

    println!("\nDeploying V21 contract...");
    let stakevue = StakeVue::deploy(&env, StakeVueInitArgs { owner });

    println!("\n=== Deployment Complete ===");
    println!("Contract address: {:?}", stakevue.address());
    println!();
    println!("Next steps:");
    println!("1. Add validators: cargo run --bin add_validators_v21 --features livenet");
    println!("2. Test stake >= 500 CSPR (direct delegation like Make!)");
    println!("3. If error 64658 occurs, V21 direct delegation doesn't work on this network");
}
