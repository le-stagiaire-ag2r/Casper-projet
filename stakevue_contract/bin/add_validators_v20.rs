//! Add validators to StakeVue V20 contract
//! Run with: cargo run --bin add_validators_v20 --features livenet

use std::str::FromStr;
use odra::casper_types::{AsymmetricType, PublicKey};
use odra::host::{HostRef, HostRefLoader};
use odra::prelude::*;
use stakevue_contract::StakeVue;

// TODO: Update with your V20 contract address after deployment
const CONTRACT_HASH: &str = "hash-YOUR_V20_CONTRACT_HASH_HERE";

// MAKE validator (Casper testnet)
const MAKE_VALIDATOR: &str = "0106ca7c39cd272dbf21a86eeb3b36b7c26e2e9b94af64292419f7862936bca2ca";

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Adding Validators to StakeVue V20 ===");
    println!("Contract: {}", CONTRACT_HASH);

    let address = Address::from_str(CONTRACT_HASH).expect("Invalid contract hash");
    let mut stakevue = StakeVue::load(&env, address);

    let caller = env.caller();
    println!("Caller (must be owner): {:?}", caller);

    // Parse validator
    let validator = PublicKey::from_hex(MAKE_VALIDATOR)
        .expect("Invalid validator public key");

    println!("\nAdding MAKE validator: {}", MAKE_VALIDATOR);

    env.set_gas(5_000_000_000u64); // 5 CSPR gas
    stakevue.add_validator(validator.clone());

    println!("SUCCESS! Validator added.");

    // Check validators
    let count = stakevue.get_validator_count();
    println!("\nTotal validators: {}", count);

    for i in 0..count {
        if let Some(v) = stakevue.get_validator(i) {
            let is_active = stakevue.is_validator_active(v.clone());
            println!("  [{}] {} - Active: {}", i, v.to_hex(), is_active);
        }
    }

    println!();
    println!("Next: Test stake with: cargo run --bin test_stake_v20 --features livenet");
}
