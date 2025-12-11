//! Test unstake() on V14 with CEP-18 token
//! Run with: cargo run --bin test_unstake_v14 --features livenet

use std::str::FromStr;
use odra::host::{HostEnv, HostRefLoader};
use odra::prelude::*;
use odra::casper_types::U512;
use stakevue_contract::{StakeVue, StakeVueHostRef};

const STAKEVUE_V14_ADDRESS: &str = "hash-e55ad54bcc8fa35710ca8776675cb79d044a467368c143c2c2771aa150cec696";

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Test Unstake V14 (CEP-18 integrated) ===");

    let mut stakevue = load_stakevue(&env);
    let caller = env.caller();

    println!("Contract: {:?}", stakevue.address());
    println!("Your stCSPR balance: {:?}", stakevue.get_stake(caller));
    println!("Token total supply: {:?}", stakevue.token_total_supply());
    println!("Total staked: {:?}", stakevue.get_total_staked());
    println!();

    env.set_gas(15_000_000_000u64);

    let unstake_amount = U512::from(1_000_000_000u64);
    println!("Unstaking {} motes (1 CSPR)...", unstake_amount);

    stakevue.unstake(unstake_amount);

    println!();
    println!("=== SUCCESS! ===");
    println!("Your stCSPR balance: {:?}", stakevue.get_stake(caller));
    println!("Token total supply: {:?}", stakevue.token_total_supply());
    println!("Total staked: {:?}", stakevue.get_total_staked());
}

fn load_stakevue(env: &HostEnv) -> StakeVueHostRef {
    let address = Address::from_str(STAKEVUE_V14_ADDRESS)
        .expect("Failed to parse address");
    StakeVue::load(env, address)
}
