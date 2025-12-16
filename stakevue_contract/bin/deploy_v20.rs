//! Deploy StakeVue V20 contract
//! Run with: cargo run --bin deploy_v20 --features livenet

use odra::host::Deployer;
use odra::prelude::*;
use stakevue_contract::StakeVue;

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Deploying StakeVue V20 ===");
    println!("V20: Wise Lending Pool Architecture");
    println!("- stake() -> CSPR to pool (no direct delegation)");
    println!("- request_unstake() -> burn only (no undelegate)");
    println!("- admin_delegate() -> owner delegates to validators");
    println!("- admin_undelegate() -> owner handles undelegation");
    println!();

    let owner = env.caller();
    println!("Owner: {:?}", owner);

    env.set_gas(100_000_000_000u64); // 100 CSPR for deployment

    let contract = StakeVue::deploy(&env, stakevue_contract::StakeVueInitArgs { owner });

    println!();
    println!("SUCCESS! StakeVue V20 deployed!");
    println!("Contract address: {:?}", contract.address());
    println!();
    println!("Next steps:");
    println!("1. Add validator: cargo run --bin add_validators_v20 --features livenet");
    println!("2. Test stake: cargo run --bin test_stake_v20 --features livenet");
}
