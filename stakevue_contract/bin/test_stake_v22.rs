//! Test stake on StakeVue V22 contract (Odra 2.5.0 + U512 fix)
//! Run with: cargo run --bin test_stake_v22 --features livenet

use std::str::FromStr;
use odra::casper_types::{AsymmetricType, U512, bytesrepr::ToBytes};
use odra::host::{HostRef, HostRefLoader};
use odra::prelude::*;
use stakevue_contract::StakeVue;

// V22 Contract (U512 SDK fix)
const CONTRACT_HASH: &str = "hash-2d6a399bca8c71bb007de1cbcd57c7d6a54dc0283376a08fe6024a33c02b0ad3";

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Testing StakeVue V22 ===");
    println!("V22: U512 fix for SDK compatibility");
    println!();
    println!("Contract: {}", CONTRACT_HASH);

    let address = Address::from_str(CONTRACT_HASH).expect("Invalid contract hash");
    let mut stakevue = StakeVue::load(&env, address);

    let caller = env.caller();
    println!("Caller: {:?}", caller);

    // Check validators
    println!("\n--- Validators ---");
    let count = stakevue.get_validator_count();
    println!("Total validators: {}", count);
    for i in 0..count {
        if let Some(v) = stakevue.get_validator(i) {
            println!("  [{}] {}", i + 1, v.to_hex());
        }
    }

    // Check state
    println!("\n--- Contract State ---");
    let stcspr_balance = stakevue.get_stcspr_balance(caller);
    let pool = stakevue.get_total_pool();
    let liquidity = stakevue.get_available_liquidity();
    println!("Your stCSPR balance: {}", stcspr_balance);
    println!("Total pool: {} CSPR", pool / U512::from(1_000_000_000u64));
    println!("Available liquidity: {} CSPR", liquidity / U512::from(1_000_000_000u64));

    // Debug: Show how Rust serializes U512
    let test_amount = U512::from(10_000_000_000u64); // 10 stCSPR
    let serialized = test_amount.to_bytes().unwrap();
    println!("\n--- Debug: Rust U512 serialization ---");
    println!("Value: {}", test_amount);
    println!("Bytes: {:02x?}", serialized);
    println!("Hex: {}", serialized.iter().map(|b| format!("{:02x}", b)).collect::<Vec<_>>().join(" "));

    // TEST UNSTAKE - This will call request_unstake via Rust/Odra
    println!("\n--- Testing request_unstake via Rust ---");
    let unstake_amount = U512::from(5_000_000_000u64); // 5 stCSPR
    println!("Calling request_unstake with {} motes...", unstake_amount);

    env.set_gas(10_000_000_000u64);
    let request_id = stakevue.request_unstake(unstake_amount);
    println!("SUCCESS! Request ID: {}", request_id);
}
