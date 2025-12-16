//! Test claim CSPR on StakeVue V20 contract
//! V20: Claims from available liquidity pool
//! Run with: cargo run --bin test_claim_v20 --features livenet

use std::str::FromStr;
use odra::casper_types::U512;
use odra::host::{HostRef, HostRefLoader};
use odra::prelude::*;
use stakevue_contract::StakeVue;

// TODO: Update with your V20 contract address after deployment
const CONTRACT_HASH: &str = "hash-ccc0c534ac1b46cde529b3fa0ec69c3d1c0fae878846185c7d274497ff326d4f";

// Request ID to claim (get from request_unstake output)
const REQUEST_ID: u64 = 0;

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Test Claim - StakeVue V20 ===");
    println!("V20: Wise Lending Pool Architecture");
    println!("- Claims CSPR from available liquidity pool");
    println!("- Requires sufficient liquidity (admin adds after unbonding)");
    println!();
    println!("Contract: {}", CONTRACT_HASH);

    let address = Address::from_str(CONTRACT_HASH).expect("Invalid contract hash");
    let mut stakevue = StakeVue::load(&env, address);

    let caller = env.caller();
    println!("Caller: {:?}", caller);
    println!("Request ID: {}", REQUEST_ID);

    // Check current state
    println!("\n--- Current State ---");
    let liquidity = stakevue.get_available_liquidity();
    let pending = stakevue.get_pending_withdrawals();
    let request_amount = stakevue.get_withdrawal_amount(REQUEST_ID);
    let is_ready = stakevue.is_withdrawal_ready(REQUEST_ID);

    println!("Available liquidity: {} CSPR", liquidity / U512::from(1_000_000_000u64));
    println!("Total pending withdrawals: {} CSPR", pending / U512::from(1_000_000_000u64));
    println!("Your request amount: {} motes", request_amount);
    println!("Request ready: {}", if is_ready { "Yes" } else { "No" });

    if request_amount == U512::zero() {
        println!("\nERROR: No withdrawal request found with ID {}!", REQUEST_ID);
        println!("Request unstake first: cargo run --bin test_request_unstake_v20 --features livenet");
        return;
    }

    if !is_ready {
        println!("\nWithdrawal not ready yet.");
        println!("Wait for unbonding period (~7 eras / ~14 hours on testnet)");
        return;
    }

    if liquidity < request_amount {
        println!("\nERROR: Insufficient liquidity!");
        println!("Available: {} CSPR", liquidity / U512::from(1_000_000_000u64));
        println!("Needed: {} CSPR", request_amount / U512::from(1_000_000_000u64));
        println!();
        println!("Admin needs to add liquidity after unbonding completes:");
        println!("cargo run --bin admin_add_liquidity_v20 --features livenet");
        return;
    }

    // Claim
    println!("\nClaiming {} CSPR...", request_amount / U512::from(1_000_000_000u64));

    env.set_gas(5_000_000_000u64); // 5 CSPR gas
    stakevue.claim(REQUEST_ID);

    // Check results
    println!("\n--- After Claim ---");
    let new_liquidity = stakevue.get_available_liquidity();
    let new_pending = stakevue.get_pending_withdrawals();
    let new_request_amount = stakevue.get_withdrawal_amount(REQUEST_ID);

    println!("Available liquidity: {} CSPR", new_liquidity / U512::from(1_000_000_000u64));
    println!("Total pending withdrawals: {} CSPR", new_pending / U512::from(1_000_000_000u64));
    println!("Request amount (should be 0): {} motes", new_request_amount);

    println!("\nSUCCESS! CSPR claimed.");
    println!();
    println!("V20 Full Cycle Complete!");
    println!("1. [x] User staked -> CSPR to pool");
    println!("2. [x] Admin delegated pool to validators");
    println!("3. [x] User requested unstake");
    println!("4. [x] Admin undelegated from validators");
    println!("5. [x] Admin added liquidity after unbonding");
    println!("6. [x] User claimed CSPR");
}
