//! Check StakeVue V20 contract status
//! Run with: cargo run --bin check_status_v20 --features livenet

use std::str::FromStr;
use odra::casper_types::{AsymmetricType, PublicKey, U256, U512};
use odra::host::{HostRef, HostRefLoader};
use odra::prelude::*;
use stakevue_contract::StakeVue;

// TODO: Update with your V20 contract address after deployment
const CONTRACT_HASH: &str = "hash-2d74e6397ffa1e7fcb63a18e0b4f60f5b2d14242273fce0f30efc0e95ce8e937";

// MAKE validator (Casper testnet)
const MAKE_VALIDATOR: &str = "0106ca7c39cd272dbf21a86eeb3b36b7c26e2e9b94af64292419f7862936bca2ca";

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== StakeVue V20 Status ===");
    println!("V20: Wise Lending Pool Architecture");
    println!();
    println!("Contract: {}", CONTRACT_HASH);

    let address = Address::from_str(CONTRACT_HASH).expect("Invalid contract hash");
    let stakevue = StakeVue::load(&env, address);

    let caller = env.caller();
    println!("Caller: {:?}", caller);

    // Pool status
    println!("\n--- Pool Status ---");
    let total_pool = stakevue.get_total_pool();
    let liquidity = stakevue.get_available_liquidity();
    let pending_withdrawals = stakevue.get_pending_withdrawals();
    let pending_undelegations = stakevue.get_pending_undelegations();

    println!("Total pool: {} CSPR", total_pool / U512::from(1_000_000_000u64));
    println!("Available liquidity: {} CSPR", liquidity / U512::from(1_000_000_000u64));
    println!("Pending withdrawals: {} CSPR", pending_withdrawals / U512::from(1_000_000_000u64));
    println!("Pending undelegations: {} CSPR", pending_undelegations / U512::from(1_000_000_000u64));

    // Token status
    println!("\n--- Token Status ---");
    let total_supply = stakevue.token_total_supply();
    let exchange_rate = stakevue.get_exchange_rate();
    println!("Total stCSPR supply: {}", total_supply);
    println!("Exchange rate: {} (1.0 = 1_000_000_000)", exchange_rate);

    // Validators
    println!("\n--- Validators ---");
    let validator_count = stakevue.get_validator_count();
    println!("Total validators: {}", validator_count);

    for i in 0..validator_count {
        if let Some(v) = stakevue.get_validator(i) {
            let is_active = stakevue.is_validator_active(v.clone());
            let delegated = stakevue.get_delegated_to_validator(v.clone());
            println!("  [{}] {}... - Active: {}, Delegated: {} CSPR",
                i,
                &v.to_hex()[..20],
                is_active,
                delegated / U512::from(1_000_000_000u64));
        }
    }

    // User status
    println!("\n--- Your Status ---");
    let stcspr_balance = stakevue.get_stcspr_balance(caller);
    let cspr_value = stakevue.get_cspr_value(caller);
    let request_count = stakevue.get_user_request_count(caller);

    println!("stCSPR balance: {}", stcspr_balance);
    println!("CSPR value: {} CSPR", cspr_value / U512::from(1_000_000_000u64));
    println!("Pending withdrawal requests: {}", request_count);

    // Show user's withdrawal requests
    if request_count > 0 {
        println!("\n--- Your Withdrawal Requests ---");
        // We need to find the request IDs - let's check the first few
        for id in 0..10u64 {
            let amount = stakevue.get_withdrawal_amount(id);
            if amount > U512::zero() {
                let is_ready = stakevue.is_withdrawal_ready(id);
                println!("  Request #{}: {} CSPR - {}",
                    id,
                    amount / U512::from(1_000_000_000u64),
                    if is_ready { "READY TO CLAIM" } else { "Waiting..." });
            }
        }
    }

    // Calculate delegated vs available
    println!("\n--- Summary ---");
    let total_delegated = {
        let validator = PublicKey::from_hex(MAKE_VALIDATOR).ok();
        validator.map(|v| stakevue.get_delegated_to_validator(v)).unwrap_or_default()
    };
    println!("Pool = Liquidity ({}) + Delegated (~{})",
        liquidity / U512::from(1_000_000_000u64),
        total_delegated / U512::from(1_000_000_000u64));

    println!();
    println!("=== Commands ===");
    println!("Stake:           cargo run --bin test_stake_v20 --features livenet");
    println!("Admin delegate:  cargo run --bin admin_delegate_v20 --features livenet");
    println!("Request unstake: cargo run --bin test_request_unstake_v20 --features livenet");
    println!("Admin undelegate: cargo run --bin admin_undelegate_v20 --features livenet");
    println!("Admin add liq:   cargo run --bin admin_add_liquidity_v20 --features livenet");
    println!("Claim:           cargo run --bin test_claim_v20 --features livenet");
}
