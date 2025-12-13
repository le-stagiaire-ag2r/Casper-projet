//! Set validator for StakeVue V16
//! Run with: cargo run --bin set_validator_v16 --features livenet

use std::str::FromStr;
use odra::casper_types::{AsymmetricType, PublicKey};
use odra::host::HostRefLoader;
use odra::prelude::*;
use stakevue_contract::StakeVue;

// V16 Contract Address - UPDATE THIS AFTER DEPLOY (with 'hash-' prefix)
const CONTRACT_HASH: &str = "hash-bfcaf222f20c620d16297acf702d1ba46b4e1b95264fb02f1bcc154dc93923b2";

// Testnet validator public key - MAKE (10% commission, 100% performance)
// Find more at: https://testnet.cspr.live/validators
const VALIDATOR_PUBLIC_KEY: &str = "0106ca7c39cd272dbf21a86eeb3b36b7c26e2e9b94af64292419f7862936bca2ca";

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
