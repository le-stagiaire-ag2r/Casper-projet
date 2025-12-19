//! Deploy StakeVue V22 contract (Odra 2.5.0 + U512 fix)
//!
//! V22 Changes:
//! - request_unstake now accepts U512 instead of U256 for SDK compatibility
//! - Fixes Error 19 (LeftOverBytes) when calling from web frontend
//!
//! Run with: cargo run --bin deploy_v22 --features livenet

use odra::host::Deployer;
use odra::prelude::*;
use stakevue_contract::StakeVue;

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Deploying StakeVue V22 ===");
    println!("V22: request_unstake now accepts U512 for SDK compatibility");
    println!();

    let owner = env.caller();
    println!("Owner: {:?}", owner);

    // Deploy with higher gas for Odra 2.5.0
    env.set_gas(600_000_000_000u64); // 600 CSPR

    let contract = StakeVue::deploy(&env, stakevue_contract::StakeVueInitArgs { owner });

    println!();
    println!("SUCCESS! StakeVue V22 deployed!");
    println!("Contract address: {:?}", contract.address());
    println!();
    println!("Next steps:");
    println!("1. Add validators: cargo run --bin add_validators_v22 --features livenet");
    println!("2. Test stake: cargo run --bin test_stake_v22 --features livenet");
    println!("3. Test unstake from frontend (should work now!)");
}
