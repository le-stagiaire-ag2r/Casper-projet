//! Test unstake (withdrawal queue) on V17 contract
//! Run with: cargo run --bin test_unstake_v17 --features livenet

use std::str::FromStr;
use odra::casper_types::{AsymmetricType, PublicKey, U256, U512};
use odra::host::{HostRef, HostRefLoader};
use odra::prelude::*;
use stakevue_contract::StakeVue;

// V17 Contract Address - UPDATE THIS AFTER DEPLOY (with 'hash-' prefix)
const CONTRACT_HASH: &str = "hash-REPLACE_AFTER_DEPLOY";

// MAKE validator - same as where we staked
const VALIDATOR_PUBLIC_KEY: &str = "0106ca7c39cd272dbf21a86eeb3b36b7c26e2e9b94af64292419f7862936bca2ca";

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Testing Unstake Queue on V17 ===");
    println!("Contract: {}", CONTRACT_HASH);

    // Load existing contract
    let address = Address::from_str(CONTRACT_HASH).expect("Invalid contract hash");
    let mut stakevue = StakeVue::load(&env, address);

    let caller = env.caller();
    println!("Caller: {:?}", caller);

    // Parse validator
    let validator = PublicKey::from_hex(VALIDATOR_PUBLIC_KEY)
        .expect("Invalid validator public key");

    // Check current balance
    let stcspr_balance = stakevue.get_stcspr_balance(caller);
    println!("\nCurrent stCSPR balance: {}", stcspr_balance);

    if stcspr_balance == U256::zero() {
        println!("ERROR: No stCSPR to unstake!");
        println!("Run: cargo run --bin test_stake_v17 --features livenet");
        return;
    }

    // Request unstake for full balance
    let unstake_amount = stcspr_balance;
    env.set_gas(10_000_000_000u64); // 10 CSPR gas

    println!("\nRequesting unstake of {} stCSPR...", unstake_amount);
    let request_id = stakevue.request_unstake(unstake_amount, validator);

    // Check results
    let new_balance = stakevue.get_stcspr_balance(caller);
    let pending = stakevue.get_pending_withdrawals();
    let request_amount = stakevue.get_withdrawal_amount(request_id);
    let is_ready = stakevue.is_withdrawal_ready(request_id);
    let user_requests = stakevue.get_user_request_count(caller);

    println!("\nSUCCESS!");
    println!("Request ID: {}", request_id);
    println!("CSPR to receive: {}", request_amount);
    println!("New stCSPR balance: {}", new_balance);
    println!("Total pending: {}", pending);
    println!("Your request count: {}", user_requests);
    println!("Ready to claim: {}", if is_ready { "Yes" } else { "No (wait ~7 eras)" });
    println!();
    println!("Unbonding takes ~7 eras (~14 hours on testnet)");
    println!("Check status later: cargo run --bin check_withdrawal_v17 --features livenet");
}
