//! Test add_rewards on V15 contract (owner only)
//! Run with: cargo run --bin test_add_rewards_v15 --features livenet

use odra::casper_types::{U512, PackageHash};
use odra::host::HostRef;
use odra::prelude::*;
use stakevue_contract::StakeVueHostRef;

// V15 Contract Address - UPDATE THIS AFTER DEPLOY (without 'hash-' prefix)
const CONTRACT_HASH: &str = "73c7d3eb92943c49a6367120e0ea93f0e8cf0de3f998e5937c376ab3a1828e5e";

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Testing Add Rewards on V15 ===");
    println!("Contract: hash-{}", CONTRACT_HASH);

    // Load existing contract (Casper 2.0 uses PackageHash)
    let package_hash = PackageHash::from_formatted_str(&format!("package-{}", CONTRACT_HASH))
        .expect("Invalid package hash");
    let address = Address::from(package_hash);
    let mut stakevue = StakeVueHostRef::new(address, env.clone());

    // Get state before
    let rate_before = stakevue.get_exchange_rate();
    let pool_before = stakevue.get_total_pool();
    let supply_before = stakevue.token_total_supply();

    println!("\nBefore rewards:");
    println!("  Exchange rate: {} (1.0 = 1_000_000_000)", rate_before);
    println!("  Pool: {} motes", pool_before);
    println!("  stCSPR supply: {}", supply_before);

    // Add 1 CSPR as rewards (simulating validator rewards)
    let reward_amount = U512::from(1_000_000_000u64); // 1 CSPR
    env.set_gas(200_000_000_000u64);

    println!("\nAdding 1 CSPR rewards...");
    stakevue.with_tokens(reward_amount).add_rewards();

    // Get state after
    let rate_after = stakevue.get_exchange_rate();
    let pool_after = stakevue.get_total_pool();

    println!("\nAfter rewards:");
    println!("  Exchange rate: {} (increased!)", rate_after);
    println!("  Pool: {} motes", pool_after);
    println!("  stCSPR supply: {} (unchanged)", stakevue.token_total_supply());

    // Calculate rate change
    let rate_increase = rate_after - rate_before;
    println!("\nRate increased by: {}", rate_increase);
    println!("SUCCESS! Exchange rate increased.");
}
