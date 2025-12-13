//! Deploy StakeVue V19 - Native Odra delegate/undelegate
//! Run with: cargo run --bin deploy_v19 --features livenet

use odra::host::{Deployer, HostEnv};
use odra::prelude::*;
use stakevue_contract::{StakeVue, StakeVueInitArgs};

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Deploying StakeVue V19 ===");
    println!("Features:");
    println!("- Multi-validator support (up to 20 validators)");
    println!("- Withdrawal queue with unbonding period");
    println!("- Harvest rewards function");
    println!("- V19: Uses native Odra env().delegate() and env().undelegate()");
    println!("- V19: Proper delegator_purse argument for contract-level delegation");
    println!();

    let owner = env.caller();
    println!("Owner: {:?}", owner);

    // Set gas for deployment (600 CSPR like V16/V17/V18)
    env.set_gas(600_000_000_000u64); // 600 CSPR

    // Deploy V19 contract
    println!("\nDeploying contract...");
    let contract = StakeVue::deploy(&env, StakeVueInitArgs { owner });

    println!("\nSUCCESS!");
    println!("Contract deployed at: {:?}", contract.address());
    println!();
    println!("Token Name: {}", contract.token_name());
    println!("Token Symbol: {}", contract.token_symbol());
    println!();
    println!("Next steps:");
    println!("1. Update CONTRACT_HASH in add_validators_v19.rs");
    println!("2. Run: cargo run --bin add_validators_v19 --features livenet");
    println!("3. Test stake/unstake in the UI");
}
