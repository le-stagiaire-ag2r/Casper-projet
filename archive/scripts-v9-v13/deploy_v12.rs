//! Deploy StakeVue V12 - Integrated CEP-18 token architecture
//! This follows the same pattern as official Casper liquid staking contracts
//! Run with: cargo run --bin deploy_v12 --features livenet

use odra::host::Deployer;
use odra::prelude::*;
use stakevue_contract::{StakeVue, StakeVueInitArgs};

// Custom config to set unique package name and allow override
struct DeployConfig;

impl odra::host::OdraConfig for DeployConfig {
    fn package_hash(&self) -> String {
        "stakevue_v12".to_string()  // Unique name for V12
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

    println!("=== Deploying StakeVue V12 (Integrated CEP-18 Token) ===");
    println!();
    println!("This version integrates the stCSPR token directly into the contract");
    println!("using SubModule<Cep18>, like the official Casper liquid staking contracts.");
    println!();
    println!("Package key: stakevue_v12");
    println!();

    // Get owner from the livenet environment (your account)
    let owner = env.caller();
    println!("Owner: {:?}", owner);

    // Set gas for deployment (500 CSPR for safety with CEP-18)
    env.set_gas(500_000_000_000u64);

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
    println!("The stCSPR token is now integrated into this contract.");
    println!("No separate token contract needed!");
}
