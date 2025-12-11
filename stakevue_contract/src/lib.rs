#![no_std]

use odra::prelude::*;
use odra::casper_types::{U512, U256};
use odra_modules::access::Ownable;

// ============================================================================
// ERRORS
// ============================================================================

#[odra::odra_error]
pub enum Error {
    InsufficientBalance = 1,
    ZeroAmount = 3,
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
// STAKEVUE CONTRACT V13 - Minimal test (like V8.2 that worked)
// ============================================================================
// This is the simplest possible staking contract to test if payable works.
// No CEP-18 token, just basic stake tracking with a Mapping.
// If this works, the issue is with SubModule<Cep18>.
// If this fails, the issue is with the payable mechanism itself.
// ============================================================================

#[odra::module(events = [Staked, Unstaked], errors = Error)]
pub struct StakeVue {
    /// Access control
    ownable: SubModule<Ownable>,
    /// User balances (internal tracking, no external token)
    balances: Mapping<Address, U512>,
    /// Total CSPR staked in contract
    total_staked: Var<U512>,
}

#[odra::module]
impl StakeVue {
    /// Initialize the contract with owner only (like V8.2)
    pub fn init(&mut self, owner: Address) {
        self.ownable.init(owner);
        self.total_staked.set(U512::zero());
    }

    // ========================================================================
    // STAKING FUNCTIONS
    // ========================================================================

    /// Stake CSPR - simple tracking without token minting
    #[odra(payable)]
    pub fn stake(&mut self) {
        let staker = self.env().caller();
        let amount = self.env().attached_value();

        if amount == U512::zero() {
            self.env().revert(Error::ZeroAmount);
        }

        // Update user balance
        let current_balance = self.balances.get(&staker).unwrap_or_default();
        self.balances.set(&staker, current_balance + amount);

        // Update total staked
        let total = self.total_staked.get_or_default();
        self.total_staked.set(total + amount);

        self.env().emit_event(Staked { staker, amount });
    }

    /// Unstake: withdraw CSPR
    pub fn unstake(&mut self, amount: U512) {
        let staker = self.env().caller();

        if amount == U512::zero() {
            self.env().revert(Error::ZeroAmount);
        }

        // Check balance
        let current_balance = self.balances.get(&staker).unwrap_or_default();
        if amount > current_balance {
            self.env().revert(Error::InsufficientBalance);
        }

        // Update user balance
        self.balances.set(&staker, current_balance - amount);

        // Update total staked
        let total = self.total_staked.get_or_default();
        self.total_staked.set(total - amount);

        // Transfer CSPR back to staker
        self.env().transfer_tokens(&staker, &amount);

        self.env().emit_event(Unstaked { staker, amount });
    }

    // ========================================================================
    // VIEW FUNCTIONS
    // ========================================================================

    /// Get staked balance of an address
    pub fn get_stake(&self, staker: Address) -> U512 {
        self.balances.get(&staker).unwrap_or_default()
    }

    /// Get total CSPR staked in the contract
    pub fn get_total_staked(&self) -> U512 {
        self.total_staked.get_or_default()
    }

    /// Get contract owner
    pub fn get_owner(&self) -> Address {
        self.ownable.get_owner()
    }

    // ========================================================================
    // ADMIN FUNCTIONS (Owner only)
    // ========================================================================

    /// Transfer ownership (owner only)
    pub fn transfer_ownership(&mut self, new_owner: Address) {
        self.ownable.transfer_ownership(&new_owner);
    }
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
    }

    #[test]
    fn test_stake_and_unstake() {
        let (env, mut contract) = setup();
        let staker = env.get_account(1);

        // Switch to staker account
        env.set_caller(staker);

        // Stake 10 CSPR
        let stake_amount = U512::from(10_000_000_000u64);
        contract.with_tokens(stake_amount).stake();

        // Check balances
        assert_eq!(contract.get_stake(staker), stake_amount);
        assert_eq!(contract.get_total_staked(), stake_amount);

        // Unstake 5 CSPR
        let unstake_amount = U512::from(5_000_000_000u64);
        contract.unstake(unstake_amount);

        // Check balances updated
        assert_eq!(contract.get_stake(staker), U512::from(5_000_000_000u64));
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
    #[should_panic(expected = "InsufficientBalance")]
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
