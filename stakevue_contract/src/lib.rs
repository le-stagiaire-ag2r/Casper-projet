#![no_std]

use odra::prelude::*;
use odra::casper_types::U512;
use odra_modules::access::Ownable;
use odra_modules::security::Pauseable;

// ============================================================================
// ERRORS
// ============================================================================

#[odra::odra_error]
pub enum Error {
    InsufficientBalance = 1,
    InsufficientStCsprBalance = 2,
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
// STAKEVUE CONTRACT V9 - Simplified with Ownable + Pauseable
// ============================================================================

/// StakeVue - Liquid Staking Protocol for Casper
///
/// Features:
/// - Ownable: only owner can pause/unpause
/// - Pauseable: emergency stop mechanism
/// - Simple stCSPR tracking via Mapping
/// - 1:1 ratio: 1 CSPR staked = 1 stCSPR
#[odra::module(events = [Staked, Unstaked], errors = Error)]
pub struct StakeVue {
    /// stCSPR balances per user
    stakes: Mapping<Address, U512>,
    /// Access control
    ownable: SubModule<Ownable>,
    /// Emergency pause
    pausable: SubModule<Pauseable>,
    /// Total CSPR staked in contract
    total_staked: Var<U512>,
}

#[odra::module]
impl StakeVue {
    /// Initialize the contract
    pub fn init(&mut self, owner: Address) {
        // Set owner
        self.ownable.init(owner);
        // Initialize total staked
        self.total_staked.set(U512::zero());
    }

    // ========================================================================
    // STAKING FUNCTIONS
    // ========================================================================

    /// Stake CSPR and receive stCSPR tokens
    /// Ratio: 1 CSPR = 1 stCSPR
    #[odra(payable)]
    pub fn stake(&mut self) {
        // Check not paused
        self.pausable.require_not_paused();

        let staker = self.env().caller();
        let amount = self.env().attached_value();

        // Validate amount
        if amount == U512::zero() {
            self.env().revert(Error::ZeroAmount);
        }

        // Update user's stCSPR balance
        let current = self.stakes.get(&staker).unwrap_or(U512::zero());
        self.stakes.set(&staker, current + amount);

        // Update total staked
        let total = self.total_staked.get_or_default();
        self.total_staked.set(total + amount);

        // Emit event
        self.env().emit_event(Staked { staker, amount });
    }

    /// Unstake: burn stCSPR and receive CSPR back
    pub fn unstake(&mut self, amount: U512) {
        // Check not paused
        self.pausable.require_not_paused();

        let staker = self.env().caller();

        // Validate amount
        if amount == U512::zero() {
            self.env().revert(Error::ZeroAmount);
        }

        // Check staker has enough stCSPR
        let current = self.stakes.get(&staker).unwrap_or(U512::zero());
        if amount > current {
            self.env().revert(Error::InsufficientStCsprBalance);
        }

        // Update user's stCSPR balance
        self.stakes.set(&staker, current - amount);

        // Update total staked
        let total = self.total_staked.get_or_default();
        self.total_staked.set(total - amount);

        // Transfer CSPR back to staker
        self.env().transfer_tokens(&staker, &amount);

        // Emit event
        self.env().emit_event(Unstaked { staker, amount });
    }

    // ========================================================================
    // VIEW FUNCTIONS
    // ========================================================================

    /// Get stCSPR balance of an address
    pub fn get_stake(&self, staker: Address) -> U512 {
        self.stakes.get(&staker).unwrap_or(U512::zero())
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
    }

    #[test]
    fn test_stake_works() {
        let (env, contract) = setup();
        let staker = env.get_account(0);
        let stake_amount = U512::from(100_000_000_000u64);

        contract.with_tokens(stake_amount).stake();

        assert_eq!(contract.get_stake(staker), stake_amount);
        assert_eq!(contract.get_total_staked(), stake_amount);

        assert!(env.emitted_event(&contract, Staked { staker, amount: stake_amount }));
    }

    #[test]
    fn test_multiple_stakes() {
        let (env, contract) = setup();
        let staker = env.get_account(0);
        let first = U512::from(50_000_000_000u64);
        let second = U512::from(30_000_000_000u64);

        contract.with_tokens(first).stake();
        contract.with_tokens(second).stake();

        assert_eq!(contract.get_stake(staker), first + second);
    }

    #[test]
    fn test_unstake_works() {
        let (env, mut contract) = setup();
        let staker = env.get_account(0);
        let stake_amount = U512::from(100_000_000_000u64);
        let unstake_amount = U512::from(40_000_000_000u64);

        contract.with_tokens(stake_amount).stake();
        contract.unstake(unstake_amount);

        assert_eq!(contract.get_stake(staker), stake_amount - unstake_amount);
        assert!(env.emitted_event(&contract, Unstaked { staker, amount: unstake_amount }));
    }

    #[test]
    fn test_unstake_insufficient_fails() {
        let (_env, mut contract) = setup();
        contract.with_tokens(U512::from(50_000_000_000u64)).stake();

        assert_eq!(
            contract.try_unstake(U512::from(100_000_000_000u64)),
            Err(Error::InsufficientStCsprBalance.into())
        );
    }

    #[test]
    fn test_owner_can_pause() {
        let (env, mut contract) = setup();
        let owner = env.get_account(0);

        env.set_caller(owner);
        contract.pause();
        assert!(contract.is_paused());

        // Stake should fail when paused
        let result = contract.with_tokens(U512::from(100_000_000_000u64)).try_stake();
        assert!(result.is_err());
    }

    #[test]
    fn test_non_owner_cannot_pause() {
        let (env, mut contract) = setup();
        let non_owner = env.get_account(1);

        env.set_caller(non_owner);
        assert!(contract.try_pause().is_err());
    }

    #[test]
    fn test_transfer_ownership() {
        let (env, mut contract) = setup();
        let owner = env.get_account(0);
        let new_owner = env.get_account(1);

        env.set_caller(owner);
        contract.transfer_ownership(new_owner);

        assert_eq!(contract.get_owner(), new_owner);
    }
}
