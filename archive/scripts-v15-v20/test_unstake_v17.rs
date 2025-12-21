//! Test unstake (withdrawal queue) on V17 contract
//! NOTE: V17 contract is deprecated. Use V20 scripts instead.
//! Run with: cargo run --bin test_unstake_v17 --features livenet

use std::str::FromStr;
use odra::casper_types::{U256, U512};
use odra::host::{HostRefLoader};
use odra::prelude::*;
use stakevue_contract::StakeVue;

// V17 Contract Address (final deploy with correct WASM)
// NOTE: This script uses V20 function signature, which may not match V17 contract on-chain
const CONTRACT_HASH: &str = "hash-c549746587ab0fe02f2f72246d52f6cf21d030c6aaac9908191f12e02dd73747";

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Testing Unstake Queue on V17 ===");
    println!("NOTE: V17 is deprecated. Use V20 scripts for new contracts.");
    println!("Contract: {}", CONTRACT_HASH);

    // Load existing contract
    let address = Address::from_str(CONTRACT_HASH).expect("Invalid contract hash");
    let mut stakevue = StakeVue::load(&env, address);

    let caller = env.caller();
    println!("Caller: {:?}", caller);

    // Check current balance
    let stcspr_balance = stakevue.get_stcspr_balance(caller);
    println!("\nCurrent stCSPR balance: {}", stcspr_balance);

    if stcspr_balance == U256::zero() {
        println!("ERROR: No stCSPR to unstake!");
        println!("Run: cargo run --bin test_stake_v17 --features livenet");
        return;
    }

    // Request unstake for full balance
    // V20: request_unstake no longer requires validator parameter
    let unstake_amount = stcspr_balance;
    env.set_gas(10_000_000_000u64); // 10 CSPR gas

    println!("\nRequesting unstake of {} stCSPR...", unstake_amount);
    let request_id = stakevue.request_unstake(unstake_amount);

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
