//! Auto-Delegate Bot for StakeVue V20
//! Automatically delegates pool funds to validators when threshold is reached
//!
//! Usage: cargo run --bin auto_delegate_bot --features livenet

use odra::casper_types::U512;
use odra::host::HostRefLoader;
use stakevue_contract::stakevue_v20::StakeVueV20HostRef;
use std::{thread, time::Duration};

// Configuration
const CONTRACT_HASH: &str = "hash-ccc0c534ac1b46cde529b3fa0ec69c3d1c0fae878846185c7d274497ff326d4f";
const MIN_DELEGATION_AMOUNT: u64 = 500_000_000_000; // 500 CSPR minimum
const CHECK_INTERVAL_SECS: u64 = 300; // Check every 5 minutes
const VALIDATOR: &str = "0106ca7c39cd272dbf21a86eeb3b36b7c26e2e9b94af64292419f7862936bca2ca";

fn main() {
    println!("=== StakeVue V20 Auto-Delegate Bot ===");
    println!("Contract: {}", CONTRACT_HASH);
    println!("Min delegation: {} CSPR", MIN_DELEGATION_AMOUNT / 1_000_000_000);
    println!("Check interval: {} seconds", CHECK_INTERVAL_SECS);
    println!("Target validator: {}...", &VALIDATOR[..20]);
    println!();
    println!("Bot started! Press Ctrl+C to stop.");
    println!("=========================================\n");

    loop {
        match check_and_delegate() {
            Ok(delegated) => {
                if delegated {
                    println!("[✅] Delegation successful!");
                } else {
                    println!("[⏳] Pool below threshold, waiting...");
                }
            }
            Err(e) => {
                println!("[❌] Error: {}", e);
            }
        }

        println!("[🔄] Next check in {} seconds...\n", CHECK_INTERVAL_SECS);
        thread::sleep(Duration::from_secs(CHECK_INTERVAL_SECS));
    }
}

fn check_and_delegate() -> Result<bool, String> {
    let env = odra_casper_livenet_env::env();

    // Load contract
    let contract = StakeVueV20HostRef::load(&env, CONTRACT_HASH.parse().unwrap());

    // Check available liquidity
    let available = contract.get_available_liquidity();
    let available_cspr = available.as_u64() / 1_000_000_000;

    println!("[📊] Pool status:");
    println!("     Available liquidity: {} CSPR", available_cspr);

    // Check if above threshold
    if available < U512::from(MIN_DELEGATION_AMOUNT) {
        println!("     Below minimum ({} CSPR), skipping.", MIN_DELEGATION_AMOUNT / 1_000_000_000);
        return Ok(false);
    }

    println!("[🚀] Delegating {} CSPR to validator...", available_cspr);

    // Parse validator
    let validator = VALIDATOR.parse()
        .map_err(|e| format!("Invalid validator: {:?}", e))?;

    // Set gas for delegation (50 CSPR should be enough)
    env.set_gas(50_000_000_000u64);

    // Execute delegation
    contract.admin_delegate(validator, available);

    println!("[✅] Delegated {} CSPR successfully!", available_cspr);

    Ok(true)
}
