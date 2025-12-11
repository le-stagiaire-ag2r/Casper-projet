//! Test stake on V15 contract
//! Run with: cargo run --bin test_stake_v15 --features livenet

use odra::casper_types::U512;
use odra::host::HostRef;
use odra::Address;
use stakevue_contract::StakeVueHostRef;

// V15 Contract Address - UPDATE THIS AFTER DEPLOY
const CONTRACT_HASH: &str = "hash-73c7d3eb92943c49a6367120e0ea93f0e8cf0de3f998e5937c376ab3a1828e5e";

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Testing Stake on V15 ===");
    println!("Contract: {}", CONTRACT_HASH);

    // Load existing contract
    let address = Address::try_from(CONTRACT_HASH).expect("Invalid contract hash");
    let mut stakevue = StakeVueHostRef::new(address, env.clone());

    let caller = env.caller();

    // Get current exchange rate
    let rate_before = stakevue.get_exchange_rate();
    println!("Exchange rate before: {} (1.0 = 1_000_000_000)", rate_before);
    println!("Total pool before: {}", stakevue.get_total_pool());

    // Stake 5 CSPR
    let stake_amount = U512::from(5_000_000_000u64); // 5 CSPR
    env.set_gas(300_000_000_000u64);

    println!("\nStaking 5 CSPR...");
    stakevue.with_tokens(stake_amount).stake();

    // Check balance
    let stcspr_balance = stakevue.get_stcspr_balance(caller);
    let cspr_value = stakevue.get_cspr_value(caller);
    let rate_after = stakevue.get_exchange_rate();

    println!("\nSUCCESS!");
    println!("stCSPR balance: {}", stcspr_balance);
    println!("CSPR value: {}", cspr_value);
    println!("Exchange rate after: {}", rate_after);
    println!("Total pool: {}", stakevue.get_total_pool());
}
