//! Admin undelegate from validator - StakeVue V20
//! V20: Only owner can undelegate from validators
//! Run with: cargo run --bin admin_undelegate_v20 --features livenet

use std::str::FromStr;
use odra::casper_types::{AsymmetricType, PublicKey, U512};
use odra::host::{HostRef, HostRefLoader};
use odra::prelude::*;
use stakevue_contract::StakeVue;

// TODO: Update with your V20 contract address after deployment
const CONTRACT_HASH: &str = "hash-YOUR_V20_CONTRACT_HASH_HERE";

// MAKE validator (Casper testnet)
const VALIDATOR_PUBLIC_KEY: &str = "0106ca7c39cd272dbf21a86eeb3b36b7c26e2e9b94af64292419f7862936bca2ca";

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Admin Undelegate - StakeVue V20 ===");
    println!("V20: Wise Lending Pool Architecture");
    println!("- Owner undelegates from validators when users request unstake");
    println!("- Uses SAME contract purse as delegate (fixes error 64658!)");
    println!();
    println!("Contract: {}", CONTRACT_HASH);

    let address = Address::from_str(CONTRACT_HASH).expect("Invalid contract hash");
    let mut stakevue = StakeVue::load(&env, address);

    let caller = env.caller();
    println!("Caller (must be owner): {:?}", caller);

    // Parse validator
    let validator = PublicKey::from_hex(VALIDATOR_PUBLIC_KEY)
        .expect("Invalid validator public key");

    // Check current state
    println!("\n--- Current State ---");
    let pending = stakevue.get_pending_undelegations();
    let delegated = stakevue.get_delegated_to_validator(validator.clone());
    let liquidity = stakevue.get_available_liquidity();

    println!("Pending undelegations: {} CSPR", pending / U512::from(1_000_000_000u64));
    println!("Delegated to validator: {} CSPR", delegated / U512::from(1_000_000_000u64));
    println!("Available liquidity: {} CSPR", liquidity / U512::from(1_000_000_000u64));

    if pending == U512::zero() {
        println!("\nNo pending undelegations to process.");
        println!("Users need to request unstake first.");
        return;
    }

    if delegated == U512::zero() {
        println!("\nERROR: No delegation to this validator!");
        return;
    }

    // Undelegate the pending amount (or all if pending > delegated)
    let undelegate_amount = if pending > delegated { delegated } else { pending };

    println!("\nUndelegating {} CSPR from validator {}...",
        undelegate_amount / U512::from(1_000_000_000u64),
        &VALIDATOR_PUBLIC_KEY[..20]);

    env.set_gas(15_000_000_000u64); // 15 CSPR gas for undelegation
    stakevue.admin_undelegate(validator.clone(), undelegate_amount);

    // Check results
    println!("\n--- After Undelegation ---");
    let new_pending = stakevue.get_pending_undelegations();
    let new_delegated = stakevue.get_delegated_to_validator(validator);

    println!("Pending undelegations: {} CSPR", new_pending / U512::from(1_000_000_000u64));
    println!("Delegated to validator: {} CSPR", new_delegated / U512::from(1_000_000_000u64));

    println!("\nSUCCESS! Undelegate request sent.");
    println!();
    println!("IMPORTANT: Unbonding period is ~7 eras (~14 hours on testnet)");
    println!();
    println!("After unbonding completes:");
    println!("1. Add liquidity: cargo run --bin admin_add_liquidity_v20 --features livenet");
    println!("2. Users can claim: cargo run --bin test_claim_v20 --features livenet");
}
