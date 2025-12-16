//! Test request unstake on StakeVue V20 contract
//! V20: Burns stCSPR, creates withdrawal request (NO direct undelegate)
//! Run with: cargo run --bin test_request_unstake_v20 --features livenet

use std::str::FromStr;
use odra::casper_types::{U256, U512};
use odra::host::{HostRef, HostRefLoader};
use odra::prelude::*;
use stakevue_contract::StakeVue;

// TODO: Update with your V20 contract address after deployment
const CONTRACT_HASH: &str = "hash-ccc0c534ac1b46cde529b3fa0ec69c3d1c0fae878846185c7d274497ff326d4f";

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Test Request Unstake - StakeVue V20 ===");
    println!("V20: Wise Lending Pool Architecture");
    println!("- Burns stCSPR tokens");
    println!("- Creates withdrawal request");
    println!("- NO direct undelegate (admin handles it)");
    println!();
    println!("Contract: {}", CONTRACT_HASH);

    let address = Address::from_str(CONTRACT_HASH).expect("Invalid contract hash");
    let mut stakevue = StakeVue::load(&env, address);

    let caller = env.caller();
    println!("Caller: {:?}", caller);

    // Check current stCSPR balance
    let stcspr_balance = stakevue.get_stcspr_balance(caller);
    println!("\n--- Current State ---");
    println!("Your stCSPR balance: {}", stcspr_balance);

    if stcspr_balance == U256::zero() {
        println!("\nERROR: No stCSPR to unstake!");
        println!("Stake first: cargo run --bin test_stake_v20 --features livenet");
        return;
    }

    let cspr_value = stakevue.get_cspr_value(caller);
    println!("Your CSPR value: {} CSPR", cspr_value / U512::from(1_000_000_000u64));

    // Request unstake for full balance
    let unstake_amount = stcspr_balance;
    println!("\nRequesting unstake of {} stCSPR...", unstake_amount);

    env.set_gas(10_000_000_000u64); // 10 CSPR gas
    let request_id = stakevue.request_unstake(unstake_amount);

    // Check results
    println!("\n--- After Request ---");
    let new_balance = stakevue.get_stcspr_balance(caller);
    let pending = stakevue.get_pending_withdrawals();
    let pending_undel = stakevue.get_pending_undelegations();
    let request_amount = stakevue.get_withdrawal_amount(request_id);
    let user_requests = stakevue.get_user_request_count(caller);

    println!("Request ID: {}", request_id);
    println!("CSPR to receive: {} motes", request_amount);
    println!("New stCSPR balance: {}", new_balance);
    println!("Total pending withdrawals: {} CSPR", pending / U512::from(1_000_000_000u64));
    println!("Pending undelegations: {} CSPR", pending_undel / U512::from(1_000_000_000u64));
    println!("Your request count: {}", user_requests);

    println!("\nSUCCESS! Unstake request created.");
    println!();
    println!("V20 Flow - Next steps:");
    println!("1. Admin undelegates: cargo run --bin admin_undelegate_v20 --features livenet");
    println!("2. Wait ~7 eras for unbonding");
    println!("3. Admin adds liquidity: cargo run --bin admin_add_liquidity_v20 --features livenet");
    println!("4. Claim CSPR: cargo run --bin test_claim_v20 --features livenet");
}
