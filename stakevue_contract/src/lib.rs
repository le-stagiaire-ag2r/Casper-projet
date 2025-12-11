#![no_std]

use odra::prelude::*;
use odra::casper_types::{U512, U256};
use odra_modules::access::Ownable;
use odra_modules::security::Pauseable;
use odra_modules::cep18_token::Cep18;

// ============================================================================
// ERRORS
// ============================================================================

#[odra::odra_error]
pub enum Error {
    InsufficientBalance = 1,
    InsufficientStCsprBalance = 2,
    ZeroAmount = 3,
    NoBackingForRedemption = 4,
}

// ============================================================================
// EVENTS
// ============================================================================

#[odra::event]
pub struct Staked {
    pub staker: Address,
    pub amount: U512,
}

#[odra::event]
pub struct Unstaked {
    pub staker: Address,
    pub amount: U512,
}

// ============================================================================
// STAKEVUE CONTRACT V12 - Integrated CEP-18 Token (like official liquid staking)
// ============================================================================
// This version integrates the stCSPR token directly into the contract using
// SubModule<Cep18>, following the architecture of the official Casper
// liquid staking contracts that passed the Halborn audit.
// ============================================================================

#[odra::module(events = [Staked, Unstaked], errors = Error)]
pub struct StakeVue {
    /// Integrated stCSPR CEP-18 token
    token: SubModule<Cep18>,
    /// Access control
    ownable: SubModule<Ownable>,
    /// Emergency pause
    pausable: SubModule<Pauseable>,
    /// Total CSPR staked in contract
    total_staked: Var<U512>,
}

#[odra::module]
impl StakeVue {
    /// Initialize the contract with owner
    /// The stCSPR token is initialized internally with 0 supply
    pub fn init(&mut self, owner: Address) {
        self.ownable.init(owner);
        self.total_staked.set(U512::zero());

        // Initialize the integrated stCSPR token
        // Starting with 0 supply - tokens are minted when users stake
        self.token.init(
            String::from("stCSPR"),           // symbol
            String::from("Staked CSPR"),      // name
            9,                                 // decimals (same as CSPR)
            U256::zero(),                      // initial_supply
        );
    }

    // ========================================================================
    // STAKING FUNCTIONS
    // ========================================================================

    /// Stake CSPR and receive stCSPR tokens (1:1 ratio for simplicity)
    #[odra(payable)]
    pub fn stake(&mut self) {
        self.pausable.require_not_paused();

        let staker = self.env().caller();
        let amount = self.env().attached_value();

        if amount == U512::zero() {
            self.env().revert(Error::ZeroAmount);
        }

        // Convert U512 to U256 for token
        let token_amount = u512_to_u256(amount);

        // Mint stCSPR tokens to staker using raw_mint (internal)
        self.token.raw_mint(&staker, &token_amount);

        // Update total staked
        let total = self.total_staked.get_or_default();
        self.total_staked.set(total + amount);

        self.env().emit_event(Staked { staker, amount });
    }

    /// Unstake: burn stCSPR and receive CSPR back
    pub fn unstake(&mut self, amount: U512) {
        self.pausable.require_not_paused();

        let staker = self.env().caller();

        if amount == U512::zero() {
            self.env().revert(Error::ZeroAmount);
        }

        // Convert U512 to U256 for token
        let token_amount = u512_to_u256(amount);

        // Check staker's stCSPR balance
        let staker_balance = self.token.balance_of(&staker);
        if token_amount > staker_balance {
            self.env().revert(Error::InsufficientStCsprBalance);
        }

        // Check contract has enough CSPR
        let total = self.total_staked.get_or_default();
        if amount > total {
            self.env().revert(Error::NoBackingForRedemption);
        }

        // Burn stCSPR tokens using raw_burn (internal)
        self.token.raw_burn(&staker, &token_amount);

        // Update total staked
        self.total_staked.set(total - amount);

        // Transfer CSPR back to staker
        self.env().transfer_tokens(&staker, &amount);

        self.env().emit_event(Unstaked { staker, amount });
    }

    // ========================================================================
    // TOKEN VIEW FUNCTIONS (delegated from CEP-18)
    // ========================================================================

    /// Get stCSPR token name
    pub fn token_name(&self) -> String {
        self.token.name()
    }

    /// Get stCSPR token symbol
    pub fn token_symbol(&self) -> String {
        self.token.symbol()
    }

    /// Get stCSPR token decimals
    pub fn token_decimals(&self) -> u8 {
        self.token.decimals()
    }

    /// Get total stCSPR supply
    pub fn token_total_supply(&self) -> U256 {
        self.token.total_supply()
    }

    /// Get stCSPR balance of an address
    pub fn balance_of(&self, address: &Address) -> U256 {
        self.token.balance_of(address)
    }

    // ========================================================================
    // STAKING VIEW FUNCTIONS
    // ========================================================================

    /// Get stCSPR balance of an address (alias for balance_of)
    pub fn get_stake(&self, staker: Address) -> U256 {
        self.token.balance_of(&staker)
    }

    /// Get total CSPR staked in the contract
    pub fn get_total_staked(&self) -> U512 {
        self.total_staked.get_or_default()
    }

    /// Check if contract is paused
    pub fn is_paused(&self) -> bool {
        self.pausable.is_paused()
    }

    /// Get contract owner
    pub fn get_owner(&self) -> Address {
        self.ownable.get_owner()
    }

    // ========================================================================
    // ADMIN FUNCTIONS (Owner only)
    // ========================================================================

    /// Pause the contract (owner only)
    pub fn pause(&mut self) {
        self.ownable.assert_owner(&self.env().caller());
        self.pausable.pause();
    }

    /// Unpause the contract (owner only)
    pub fn unpause(&mut self) {
        self.ownable.assert_owner(&self.env().caller());
        self.pausable.unpause();
    }

    /// Transfer ownership (owner only)
    pub fn transfer_ownership(&mut self, new_owner: Address) {
        self.ownable.transfer_ownership(&new_owner);
    }
}

// ============================================================================
// HELPERS
// ============================================================================

fn u512_to_u256(value: U512) -> U256 {
    let mut bytes = [0u8; 64];
    value.to_little_endian(&mut bytes);
    U256::from_little_endian(&bytes[..32])
}

// ============================================================================
// TESTS
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use odra::host::{Deployer, HostRef};

    fn setup() -> (odra::host::HostEnv, StakeVueHostRef) {
        let env = odra_test::env();
        let owner = env.get_account(0);
        let contract = StakeVue::deploy(&env, StakeVueInitArgs { owner });
        (env, contract)
    }

    #[test]
    fn test_initial_state() {
        let (env, contract) = setup();
        let owner = env.get_account(0);

        assert_eq!(contract.get_total_staked(), U512::zero());
        assert_eq!(contract.get_owner(), owner);
        assert!(!contract.is_paused());
        assert_eq!(contract.token_total_supply(), U256::zero());
        assert_eq!(contract.token_symbol(), "stCSPR");
    }

    #[test]
    fn test_stake_and_unstake() {
        let (env, mut contract) = setup();
        let staker = env.get_account(1);

        // Switch to staker account
        env.set_caller(staker);

        // Stake 10 CSPR
        let stake_amount = U512::from(10_000_000_000u64); // 10 CSPR
        contract.with_tokens(stake_amount).stake();

        // Check staker received stCSPR
        assert_eq!(contract.get_stake(staker), U256::from(10_000_000_000u64));
        assert_eq!(contract.get_total_staked(), stake_amount);
        assert_eq!(contract.token_total_supply(), U256::from(10_000_000_000u64));

        // Unstake 5 CSPR
        let unstake_amount = U512::from(5_000_000_000u64);
        contract.unstake(unstake_amount);

        // Check balances updated
        assert_eq!(contract.get_stake(staker), U256::from(5_000_000_000u64));
        assert_eq!(contract.get_total_staked(), U512::from(5_000_000_000u64));
    }

    #[test]
    #[should_panic(expected = "ZeroAmount")]
    fn test_stake_zero_fails() {
        let (env, contract) = setup();
        env.set_caller(env.get_account(1));
        contract.with_tokens(U512::zero()).stake();
    }

    #[test]
    #[should_panic(expected = "InsufficientStCsprBalance")]
    fn test_unstake_more_than_balance_fails() {
        let (env, mut contract) = setup();
        let staker = env.get_account(1);
        env.set_caller(staker);

        // Stake 10 CSPR
        contract.with_tokens(U512::from(10_000_000_000u64)).stake();

        // Try to unstake 20 CSPR
        contract.unstake(U512::from(20_000_000_000u64));
    }
}
