//! Set validator for StakeVue V16
//! Run with: cargo run --bin set_validator_v16 --features livenet

use std::str::FromStr;
use odra::casper_types::PublicKey;
use odra::host::{HostRef, HostRefLoader};
use odra::prelude::*;
use stakevue_contract::StakeVue;

// V16 Contract Address - UPDATE THIS AFTER DEPLOY (with 'hash-' prefix)
const CONTRACT_HASH: &str = "hash-REPLACE_WITH_V16_CONTRACT_HASH";

// Testnet validator public key - 1% commission
// Find more at: https://testnet.cspr.live/validators
const VALIDATOR_PUBLIC_KEY: &str = "01c377281132044bd3278b039925eeb3efdb9d99dd5f46d9ec6a764add34581af7";

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Setting Validator for StakeVue V16 ===");
    println!("Contract: {}", CONTRACT_HASH);
    println!("Validator: {}", VALIDATOR_PUBLIC_KEY);

    // Load existing contract
    let address = Address::from_str(CONTRACT_HASH).expect("Invalid contract hash");
    let mut stakevue = StakeVue::load(&env, address);

    // Parse validator public key
    let validator = PublicKey::from_hex(VALIDATOR_PUBLIC_KEY)
        .expect("Invalid validator public key");

    // Set gas for the transaction
    env.set_gas(5_000_000_000u64); // 5 CSPR

    println!("\nSetting validator...");
    stakevue.set_validator(validator);

    println!("\nSUCCESS!");
    println!("Validator configured for delegation");
    println!();
    println!("Current validator: {:?}", stakevue.get_validator());
    println!();
    println!("Now you can stake:");
    println!("cargo run --bin test_stake_v16 --features livenet");
}
