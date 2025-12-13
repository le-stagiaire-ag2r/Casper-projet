//! Add validators to StakeVue V17
//! Run with: cargo run --bin add_validators_v17 --features livenet

use std::str::FromStr;
use odra::casper_types::{AsymmetricType, PublicKey};
use odra::host::HostRefLoader;
use odra::prelude::*;
use stakevue_contract::StakeVue;

// V17 Contract Address (final deploy with correct WASM)
const CONTRACT_HASH: &str = "hash-c549746587ab0fe02f2f72246d52f6cf21d030c6aaac9908191f12e02dd73747";

// Testnet validators - provided by user
// All from https://testnet.cspr.live/validators
const VALIDATORS: &[&str] = &[
    // MAKE validator (10% commission, 100% performance)
    "0106ca7c39cd272dbf21a86eeb3b36b7c26e2e9b94af64292419f7862936bca2ca",
    // Additional validators
    "017d96b9a63abcb61c870a4f55187a0a7ac24096bdb5fc585c12a686a4d892009e",
    "017d9aa0b86413d7ff9a9169182c53f0bacaa80d34c211adab007ed4876af17077",
    "012d58e05b2057a84115709e0a6ccf000c6a83b4e8dfa389a680c1ab001864f1f2",
    "0143345f0d7c6e8d1a8e70eecdc3b4801d6b8505cd56c422b56d806b3efd1ebfda",
    "012b365e09c5d75187b4abc25c4aa28109133bab6a256ef4abe24348073e590d80",
    "0153d98c835b493c76050735dc79e6702a17cd78ab69d5b0c3631e72f8f38bb095",
    "013584d18def5ee3ef33374b3e2c9056bbb7860c97044bd16b64d895f8aa073084",
    "01a4a5517e0b83b7cbccae0cc22fb4a03d5c5a3d15c6b6bd7a6f4747e541bea779",
    "01a7cfb168d2bc2f69f90627d5e7bc6cb019b1c52c8a374416fdb9c4cef0233611",
    "01f340df2c32f25391e8f7924a99e93cab3a6f230ff7af1cacbfc070772cbebd94",
];

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Adding Validators to StakeVue V17 ===");
    println!("Contract: {}", CONTRACT_HASH);
    println!();

    // Load existing contract
    let address = Address::from_str(CONTRACT_HASH).expect("Invalid contract hash");
    let mut stakevue = StakeVue::load(&env, address);

    // Check current validator count
    let current_count = stakevue.get_validator_count();
    println!("Current validators: {}", current_count);
    println!("Adding {} validators...\n", VALIDATORS.len());

    // Set gas for each add_validator call
    env.set_gas(5_000_000_000u64); // 5 CSPR per call

    for (i, validator_hex) in VALIDATORS.iter().enumerate() {
        let validator = PublicKey::from_hex(validator_hex)
            .expect("Invalid validator public key");

        // Check if already active
        if stakevue.is_validator_active(validator.clone()) {
            println!("[{}/{}] Already active: {}", i + 1, VALIDATORS.len(), &validator_hex[..16]);
            continue;
        }

        println!("[{}/{}] Adding: {}...", i + 1, VALIDATORS.len(), &validator_hex[..16]);
        stakevue.add_validator(validator);
    }

    let final_count = stakevue.get_validator_count();
    println!("\nSUCCESS!");
    println!("Total validators: {}", final_count);
    println!();
    println!("Now users can stake with: cargo run --bin test_stake_v17 --features livenet");
}
