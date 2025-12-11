//! Test stake on V15 contract
//! Run with: cargo run --bin test_stake_v15 --features livenet

use odra::casper_types::U512;
use odra::host::{Deployer, HostRef};
use stakevue_contract::{StakeVue, StakeVueInitArgs};

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Testing Stake on V15 ===");

    // Load existing contract
    let owner = env.caller();
    let mut stakevue = StakeVue::deploy(&env, StakeVueInitArgs { owner });

    // Get current exchange rate
    let rate_before = stakevue.get_exchange_rate();
    println!("Exchange rate before: {} (1.0 = 1_000_000_000)", rate_before);

    // Stake 5 CSPR
    let stake_amount = U512::from(5_000_000_000u64); // 5 CSPR
    env.set_gas(300_000_000_000u64);

    println!("Staking 5 CSPR...");
    stakevue.with_tokens(stake_amount).stake();

    // Check balance
    let stcspr_balance = stakevue.get_stcspr_balance(owner);
    let cspr_value = stakevue.get_cspr_value(owner);
    let rate_after = stakevue.get_exchange_rate();

    println!("SUCCESS!");
    println!("stCSPR balance: {}", stcspr_balance);
    println!("CSPR value: {}", cspr_value);
    println!("Exchange rate after: {}", rate_after);
    println!("Total pool: {}", stakevue.get_total_pool());
}
