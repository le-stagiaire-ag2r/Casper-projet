//! Test stake on V15 contract
//! NOTE: V15 contract is deprecated. Use V20 scripts instead.
//! Run with: cargo run --bin test_stake_v15 --features livenet

use std::str::FromStr;
use odra::casper_types::{AsymmetricType, PublicKey, U512};
use odra::host::{HostRef, HostRefLoader};
use odra::prelude::*;
use stakevue_contract::StakeVue;

// V15 Contract Address - UPDATE THIS AFTER DEPLOY (with 'hash-' prefix)
// NOTE: This script uses V20 function signature, which may not match V15 contract on-chain
const CONTRACT_HASH: &str = "hash-2b6c14a2cac5cfe4a1fd1efc2fc02b1090dbc3a6b661a329b90c829245540985";

// MAKE validator (Casper testnet) - required for V20+ signature
const VALIDATOR_PUBLIC_KEY: &str = "0106ca7c39cd272dbf21a86eeb3b36b7c26e2e9b94af64292419f7862936bca2ca";

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Testing Stake on V15 ===");
    println!("NOTE: V15 is deprecated. Use V20 scripts for new contracts.");
    println!("Contract: {}", CONTRACT_HASH);

    // Load existing contract
    let address = Address::from_str(CONTRACT_HASH).expect("Invalid contract hash");
    let stakevue = StakeVue::load(&env, address);

    let caller = env.caller();

    // Parse validator (required for V20+ signature)
    let validator = PublicKey::from_hex(VALIDATOR_PUBLIC_KEY)
        .expect("Invalid validator public key");

    // Get current exchange rate
    let rate_before = stakevue.get_exchange_rate();
    println!("Exchange rate before: {} (1.0 = 1_000_000_000)", rate_before);
    println!("Total pool before: {}", stakevue.get_total_pool());

    // Stake 5 CSPR
    let stake_amount = U512::from(5_000_000_000u64); // 5 CSPR
    env.set_gas(15_000_000_000u64); // 15 CSPR gas (same as V14)

    println!("\nStaking 5 CSPR...");
    stakevue.with_tokens(stake_amount).stake(validator);

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
