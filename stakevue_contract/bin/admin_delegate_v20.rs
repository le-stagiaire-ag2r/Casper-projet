//! Admin delegate from pool to validator - StakeVue V20
//! V20: Only owner can delegate pool funds to validators
//! Run with: cargo run --bin admin_delegate_v20 --features livenet

use std::str::FromStr;
use odra::casper_types::{AsymmetricType, PublicKey, U512};
use odra::host::{HostRef, HostRefLoader};
use odra::prelude::*;
use stakevue_contract::StakeVue;

// TODO: Update with your V20 contract address after deployment
const CONTRACT_HASH: &str = "hash-2d74e6397ffa1e7fcb63a18e0b4f60f5b2d14242273fce0f30efc0e95ce8e937";

// MAKE validator (Casper testnet)
const VALIDATOR_PUBLIC_KEY: &str = "0106ca7c39cd272dbf21a86eeb3b36b7c26e2e9b94af64292419f7862936bca2ca";

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Admin Delegate - StakeVue V20 ===");
    println!("V20: Wise Lending Pool Architecture");
    println!("- Owner delegates pool funds to validators");
    println!("- Uses contract purse as delegator (same purse for delegate/undelegate!)");
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
    let liquidity = stakevue.get_available_liquidity();
    let total_pool = stakevue.get_total_pool();
    let delegated = stakevue.get_delegated_to_validator(validator.clone());

    println!("Available liquidity: {} CSPR", liquidity / U512::from(1_000_000_000u64));
    println!("Total pool: {} CSPR", total_pool / U512::from(1_000_000_000u64));
    println!("Already delegated to validator: {} CSPR", delegated / U512::from(1_000_000_000u64));

    if liquidity == U512::zero() {
        println!("\nERROR: No available liquidity to delegate!");
        println!("Users need to stake first: cargo run --bin test_stake_v20 --features livenet");
        return;
    }

    // Delegate all available liquidity
    // Note: Minimum delegation is 500 CSPR
    let min_delegation = U512::from(500_000_000_000u64);
    if liquidity < min_delegation {
        println!("\nWARNING: Available liquidity ({} CSPR) is below minimum (500 CSPR)",
            liquidity / U512::from(1_000_000_000u64));
        println!("Need more stakes before delegating.");
        return;
    }

    let delegate_amount = liquidity;
    println!("\nDelegating {} CSPR to validator {}...",
        delegate_amount / U512::from(1_000_000_000u64),
        &VALIDATOR_PUBLIC_KEY[..20]);

    env.set_gas(15_000_000_000u64); // 15 CSPR gas for delegation
    stakevue.admin_delegate(validator.clone(), delegate_amount);

    // Check results
    println!("\n--- After Delegation ---");
    let new_liquidity = stakevue.get_available_liquidity();
    let new_delegated = stakevue.get_delegated_to_validator(validator);

    println!("Available liquidity: {} CSPR", new_liquidity / U512::from(1_000_000_000u64));
    println!("Delegated to validator: {} CSPR", new_delegated / U512::from(1_000_000_000u64));

    println!("\nSUCCESS! Pool funds delegated to validator.");
    println!();
    println!("V20 Flow:");
    println!("1. [DONE] Users stake -> CSPR in pool");
    println!("2. [DONE] Admin delegates pool to validators");
    println!("3. Users can request unstake: cargo run --bin test_request_unstake_v20 --features livenet");
}
