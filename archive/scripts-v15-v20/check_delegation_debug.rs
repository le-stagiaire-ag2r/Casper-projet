//! Debug script to check delegation status
//! Run with: cargo run --bin check_delegation_debug --features livenet

use std::str::FromStr;
use odra::casper_types::{AsymmetricType, PublicKey, U256, U512};
use odra::host::{HostRef, HostRefLoader};
use odra::prelude::*;
use stakevue_contract::StakeVue;

// V17 Contract Address
const CONTRACT_HASH: &str = "hash-c549746587ab0fe02f2f72246d52f6cf21d030c6aaac9908191f12e02dd73747";

// MAKE validator
const MAKE_VALIDATOR: &str = "0106ca7c39cd272dbf21a86eeb3b36b7c26e2e9b94af64292419f7862936bca2ca";

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Delegation Debug Check ===");
    println!("Contract: {}", CONTRACT_HASH);

    let address = Address::from_str(CONTRACT_HASH).expect("Invalid contract hash");
    let stakevue = StakeVue::load(&env, address);

    let caller = env.caller();
    println!("\nCaller: {:?}", caller);

    // Parse validator
    let validator = PublicKey::from_hex(MAKE_VALIDATOR)
        .expect("Invalid validator public key");
    println!("Validator: {}", MAKE_VALIDATOR);

    // Check local state from contract
    println!("\n--- Contract Local State ---");
    let delegated_local = stakevue.get_delegated_to_validator(validator.clone());
    println!("Local delegated amount: {} motes ({} CSPR)",
        delegated_local,
        delegated_local / U512::from(1_000_000_000u64));

    let total_pool = stakevue.get_total_pool();
    println!("Total pool: {} motes ({} CSPR)",
        total_pool,
        total_pool / U512::from(1_000_000_000u64));

    let pending = stakevue.get_pending_withdrawals();
    println!("Pending withdrawals: {} motes", pending);

    // Check user's stCSPR balance
    let stcspr_balance = stakevue.get_stcspr_balance(caller);
    println!("\nYour stCSPR balance: {}", stcspr_balance);

    // Check all validators
    println!("\n--- All Validators ---");
    let count = stakevue.get_validator_count();
    println!("Total validators: {}", count);

    for i in 0..count {
        if let Some(v) = stakevue.get_validator(i) {
            let is_active = stakevue.is_validator_active(v.clone());
            let delegated = stakevue.get_delegated_to_validator(v.clone());
            println!("  [{}] {} - Active: {}, Delegated: {} CSPR",
                i,
                v.to_hex(),
                is_active,
                delegated / U512::from(1_000_000_000u64));
        }
    }

    // Check exchange rate
    let rate = stakevue.get_exchange_rate();
    println!("\n--- Exchange Rate ---");
    println!("Current rate: {} (1 stCSPR = {} CSPR)",
        rate,
        rate.as_u64() as f64 / 1_000_000_000.0);

    // Calculate what we would get for unstaking
    if stcspr_balance > U256::zero() {
        let cspr_value = stakevue.get_cspr_value(caller);
        println!("\nYour {} stCSPR = {} CSPR", stcspr_balance, cspr_value);
    }

    println!("\n=== Analysis ===");
    if delegated_local == U512::zero() {
        println!("WARNING: Contract shows ZERO delegation to this validator!");
        println!("This might be why undelegate fails.");
    } else {
        println!("Contract shows delegation exists. Issue might be elsewhere.");
    }
}
