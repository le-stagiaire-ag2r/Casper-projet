//! StakeVue CLI Tool
//!
//! Deploy and interact with the StakeVue contract on Casper network.
//!
//! Usage:
//!   cargo run --bin stakevue-cli --features livenet deploy
//!   cargo run --bin stakevue-cli --features livenet contract StakeVue stake --attached_value 10000000000 --gas 5000000000
//!   cargo run --bin stakevue-cli --features livenet contract StakeVue get_stake --user "account-hash-xxx"

use odra::host::HostEnv;
use odra_cli::{
    deploy::DeployScript,
    DeployedContractsContainer,
    OdraCli,
};

// Import our contract
use stakevue::{StakeVue, StakeVueInitArgs};

/// Deploy script for StakeVue contract
pub struct DeployStakeVueScript;

impl DeployScript for DeployStakeVueScript {
    fn deploy(
        &self,
        env: &HostEnv,
        container: &mut DeployedContractsContainer,
    ) -> Result<(), odra_cli::deploy::Error> {
        // Set gas for deployment (300 CSPR)
        env.set_gas(300_000_000_000);

        // Deploy the contract
        let contract = StakeVue::try_deploy(env, StakeVueInitArgs {})?;

        // Add to container for later use
        container.add_contract(&contract)?;

        println!("StakeVue V8 deployed successfully!");
        println!("Contract package hash: {:?}", contract.address());

        Ok(())
    }
}

/// Main function
pub fn main() {
    OdraCli::new()
        .about("StakeVue V8 - Casper 2.0 Staking Contract CLI")
        .deploy(DeployStakeVueScript)
        .contract::<StakeVue>()
        .build()
        .run();
}
