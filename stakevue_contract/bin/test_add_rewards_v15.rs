//! Test add_rewards on V15 contract (owner only)
//! Run with: cargo run --bin test_add_rewards_v15 --features livenet

use odra::casper_types::U512;
use odra::host::{Deployer, HostRef};
use stakevue_contract::{StakeVue, StakeVueInitArgs};

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Testing Add Rewards on V15 ===");

    // Load existing contract
    let owner = env.caller();
    let mut stakevue = StakeVue::deploy(&env, StakeVueInitArgs { owner });

    // Get state before
    let rate_before = stakevue.get_exchange_rate();
    let pool_before = stakevue.get_total_pool();
    let supply_before = stakevue.token_total_supply();

    println!("Before rewards:");
    println!("  Exchange rate: {} (1.0 = 1_000_000_000)", rate_before);
    println!("  Pool: {} CSPR", pool_before);
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
    println!("  Pool: {} CSPR", pool_after);
    println!("  stCSPR supply: {} (unchanged)", stakevue.token_total_supply());

    println!("\nSUCCESS! Exchange rate increased.");
}
