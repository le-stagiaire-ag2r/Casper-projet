//! Admin add liquidity after unbonding - StakeVue V20
//! V20: After unbonding completes, owner adds CSPR back to available liquidity
//! Run with: cargo run --bin admin_add_liquidity_v20 --features livenet

use std::str::FromStr;
use odra::casper_types::U512;
use odra::host::{HostRef, HostRefLoader};
use odra::prelude::*;
use stakevue_contract::StakeVue;

// TODO: Update with your V20 contract address after deployment
const CONTRACT_HASH: &str = "hash-YOUR_V20_CONTRACT_HASH_HERE";

// Amount to add as liquidity (in CSPR)
// This should match the amount that completed unbonding
const LIQUIDITY_AMOUNT_CSPR: u64 = 10;

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Admin Add Liquidity - StakeVue V20 ===");
    println!("V20: Wise Lending Pool Architecture");
    println!("- After unbonding completes, owner transfers CSPR to contract");
    println!("- This makes CSPR available for user claims");
    println!();
    println!("Contract: {}", CONTRACT_HASH);

    let address = Address::from_str(CONTRACT_HASH).expect("Invalid contract hash");
    let mut stakevue = StakeVue::load(&env, address);

    let caller = env.caller();
    println!("Caller (must be owner): {:?}", caller);

    // Check current state
    println!("\n--- Current State ---");
    let pending = stakevue.get_pending_undelegations();
    let liquidity = stakevue.get_available_liquidity();
    let pending_withdrawals = stakevue.get_pending_withdrawals();

    println!("Pending undelegations: {} CSPR", pending / U512::from(1_000_000_000u64));
    println!("Available liquidity: {} CSPR", liquidity / U512::from(1_000_000_000u64));
    println!("Pending user withdrawals: {} CSPR", pending_withdrawals / U512::from(1_000_000_000u64));

    // Add liquidity
    let amount = U512::from(LIQUIDITY_AMOUNT_CSPR) * U512::from(1_000_000_000u64);
    println!("\nAdding {} CSPR liquidity to contract...", LIQUIDITY_AMOUNT_CSPR);

    env.set_gas(5_000_000_000u64); // 5 CSPR gas
    stakevue.with_tokens(amount).admin_add_liquidity();

    // Check results
    println!("\n--- After Adding Liquidity ---");
    let new_pending = stakevue.get_pending_undelegations();
    let new_liquidity = stakevue.get_available_liquidity();

    println!("Pending undelegations: {} CSPR", new_pending / U512::from(1_000_000_000u64));
    println!("Available liquidity: {} CSPR", new_liquidity / U512::from(1_000_000_000u64));

    println!("\nSUCCESS! Liquidity added to contract.");
    println!();
    println!("Users can now claim their withdrawals:");
    println!("cargo run --bin test_claim_v20 --features livenet");
}
