//! Configure StakeVue V10 with the stCSPR token address
//! Run with: cargo run --bin configure_v10 --features livenet

use std::str::FromStr;
use odra::host::{HostEnv, HostRef, HostRefLoader};
use odra::prelude::*;
use stakevue_contract::{StakeVue, StakeVueHostRef};

// Contract addresses on testnet
const STAKEVUE_V10_ADDRESS: &str = "hash-d1857d850653ebc0aaf13fffd7610b9e3f4794dfefae158b193edf11a5dd62e3";
const STCSPR_TOKEN_ADDRESS: &str = "hash-938972a16eba403529c2c76aa1727a026fc1aa328f553185daba45703213f6bc";

fn main() {
    // Load the Casper livenet environment
    let env = odra_casper_livenet_env::env();

    println!("=== StakeVue V10 Configuration ===");
    println!("StakeVue V10: {}", STAKEVUE_V10_ADDRESS);
    println!("stCSPR Token: {}", STCSPR_TOKEN_ADDRESS);
    println!();

    // Load the existing StakeVue V10 contract
    let mut stakevue = load_stakevue(&env);
    println!("Loaded StakeVue at: {:?}", stakevue.address());

    // Parse token address
    let token_address = Address::from_str(STCSPR_TOKEN_ADDRESS)
        .expect("Failed to parse token address");

    // Set gas for the transaction
    env.set_gas(5_000_000_000u64); // 5 CSPR

    // Call set_token
    println!("Calling set_token...");
    stakevue.set_token(token_address);

    println!();
    println!("SUCCESS! Token configured.");
    println!("StakeVue V10 is now linked to stCSPR token.");
}

/// Load the existing StakeVue V10 contract
fn load_stakevue(env: &HostEnv) -> StakeVueHostRef {
    let address = Address::from_str(STAKEVUE_V10_ADDRESS)
        .expect("Failed to parse StakeVue address");
    StakeVue::load(env, address)
}
