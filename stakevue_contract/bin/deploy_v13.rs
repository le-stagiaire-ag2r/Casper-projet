//! Deploy StakeVue V13 - Minimal version (like V8.2 that worked)
//! This tests if payable works without any CEP-18 token
//! Run with: cargo run --bin deploy_v13 --features livenet

use odra::host::Deployer;
use odra::prelude::*;
use stakevue_contract::{StakeVue, StakeVueInitArgs};

// Custom config to set unique package name and allow override
struct DeployConfig;

impl odra::host::OdraConfig for DeployConfig {
    fn package_hash(&self) -> String {
        "stakevue_v13".to_string()  // Unique name for V13
    }
    fn is_upgradable(&self) -> bool {
        false
    }
    fn allow_key_override(&self) -> bool {
        true  // Allow override if key exists
    }
}

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Deploying StakeVue V13 (Minimal - like V8.2) ===");
    println!();
    println!("This is a minimal staking contract without CEP-18 token.");
    println!("Testing if payable/attached_value() works on Casper 2.0.");
    println!();
    println!("Package key: stakevue_v13");
    println!();

    // Get owner from the livenet environment (your account)
    let owner = env.caller();
    println!("Owner: {:?}", owner);

    // Set gas for deployment (300 CSPR should be enough for this simple contract)
    env.set_gas(300_000_000_000u64);

    // Deploy the contract with custom config
    println!("Deploying...");
    let contract = StakeVue::try_deploy_with_cfg(
        &env,
        StakeVueInitArgs { owner },
        DeployConfig,
    ).expect("Deployment failed");

    println!();
    println!("SUCCESS!");
    println!("Contract deployed at: {:?}", contract.address());
    println!();
    println!("Now test with: cargo run --bin test_stake_v13 --features livenet");
}
