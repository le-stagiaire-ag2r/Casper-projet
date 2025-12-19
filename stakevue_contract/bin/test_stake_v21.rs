//! Test stake on StakeVue V21 contract (Odra 2.5.0)
//! V21: CSPR goes to pool, admin delegates later
//! Run with: cargo run --bin test_stake_v21 --features livenet

use std::str::FromStr;
use odra::casper_types::{AsymmetricType, PublicKey, U512};
use odra::host::{HostRef, HostRefLoader};
use odra::prelude::*;
use stakevue_contract::StakeVue;

// V21 Contract (Odra 2.5.0)
const CONTRACT_HASH: &str = "hash-550546bc677e6712faa79b280469c1c550031f825e5d95d038b235d22e83b655";

// MAKE validator (Casper testnet)
const VALIDATOR_PUBLIC_KEY: &str = "0106ca7c39cd272dbf21a86eeb3b36b7c26e2e9b94af64292419f7862936bca2ca";

// Stake amount: 10 CSPR
const STAKE_AMOUNT_CSPR: u64 = 10;

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Testing Stake on StakeVue V21 ===");
    println!("V21: Odra 2.5.0 Upgrade");
    println!("- CSPR goes to contract pool (available_liquidity)");
    println!("- NO direct delegation (admin does it later)");
    println!();
    println!("Contract: {}", CONTRACT_HASH);

    let address = Address::from_str(CONTRACT_HASH).expect("Invalid contract hash");
    let mut stakevue = StakeVue::load(&env, address);

    let caller = env.caller();
    println!("Caller: {:?}", caller);

    // Parse validator
    let validator = PublicKey::from_hex(VALIDATOR_PUBLIC_KEY)
        .expect("Invalid validator public key");

    // Check state before
    println!("\n--- Before Stake ---");
    let stcspr_before = stakevue.get_stcspr_balance(caller);
    let pool_before = stakevue.get_total_pool();
    let liquidity_before = stakevue.get_available_liquidity();
    println!("Your stCSPR balance: {}", stcspr_before);
    println!("Total pool: {} CSPR", pool_before / U512::from(1_000_000_000u64));
    println!("Available liquidity: {} CSPR", liquidity_before / U512::from(1_000_000_000u64));

    // Stake
    let stake_amount = U512::from(STAKE_AMOUNT_CSPR) * U512::from(1_000_000_000u64);
    println!("\nStaking {} CSPR...", STAKE_AMOUNT_CSPR);

    env.set_gas(10_000_000_000u64); // 10 CSPR gas
    stakevue.with_tokens(stake_amount).stake(validator);

    // Check state after
    println!("\n--- After Stake ---");
    let stcspr_after = stakevue.get_stcspr_balance(caller);
    let pool_after = stakevue.get_total_pool();
    let liquidity_after = stakevue.get_available_liquidity();

    println!("Your stCSPR balance: {} (+{})", stcspr_after, stcspr_after - stcspr_before);
    println!("Total pool: {} CSPR", pool_after / U512::from(1_000_000_000u64));
    println!("Available liquidity: {} CSPR", liquidity_after / U512::from(1_000_000_000u64));

    println!("\nSUCCESS! CSPR added to pool.");
    println!();
    println!("V21 Flow:");
    println!("1. [DONE] User stakes -> CSPR in pool");
    println!("2. [NEXT] Admin delegates pool to validators: cargo run --bin admin_delegate_v21 --features livenet");
    println!("3. User requests unstake -> tokens burned, pending undelegation");
    println!("4. Admin undelegates from validators");
    println!("5. Admin adds liquidity after unbonding period");
    println!("6. User claims CSPR");
}
