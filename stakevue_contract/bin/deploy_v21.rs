//! Deploy StakeVue V21 contract (Odra 2.5.0)
//! Run with: cargo run --bin deploy_v21 --features livenet

use odra::host::Deployer;
use odra::prelude::*;
use stakevue_contract::StakeVue;

fn main() {
    let env = odra_casper_livenet_env::env();

    println!("=== Deploying StakeVue V21 ===");
    println!("V21: Odra 2.5.0 Upgrade");
    println!("- Same pool-based architecture as V20");
    println!("- Updated to Odra 2.5.0 (improved validator support)");
    println!("- stake() -> CSPR to pool");
    println!("- request_unstake() -> burn stCSPR");
    println!("- admin_delegate() -> owner delegates");
    println!("- admin_undelegate() -> owner undelegates");
    println!();

    let owner = env.caller();
    println!("Owner: {:?}", owner);

    env.set_gas(600_000_000_000u64); // 600 CSPR for deployment

    let contract = StakeVue::deploy(&env, stakevue_contract::StakeVueInitArgs { owner });

    println!();
    println!("SUCCESS! StakeVue V21 deployed!");
    println!("Contract address: {:?}", contract.address());
    println!();
    println!("Next steps:");
    println!("1. Update CONTRACT_HASH in all v21 scripts");
    println!("2. Add validator: cargo run --bin add_validators_v20 --features livenet");
    println!("3. Test stake: cargo run --bin test_stake_v20 --features livenet");
}
