//! StakeVue V8 - Odra-based staking contract for Casper 2.0
//!
//! This contract allows users to stake and unstake CSPR tokens.
//! Uses Odra's payable functions and proxy_caller for proper CSPR transfers.

use odra::prelude::*;
use odra::casper_types::U512;

/// Errors that may occur during contract execution
#[odra::odra_error]
pub enum Error {
    /// User has insufficient staked balance
    InsufficientBalance = 1,
    /// Stake amount must be greater than zero
    ZeroAmount = 2,
    /// User has no stake to withdraw
    NoStake = 3,
}

/// Event emitted when a user stakes CSPR
#[odra::event]
pub struct Staked {
    pub user: Address,
    pub amount: U512,
    pub total_stake: U512,
}

/// Event emitted when a user unstakes CSPR
#[odra::event]
pub struct Unstaked {
    pub user: Address,
    pub amount: U512,
    pub remaining_stake: U512,
}

/// StakeVue V8 - Main staking contract
#[odra::module(errors = Error, events = [Staked, Unstaked])]
pub struct StakeVue {
    /// Mapping of user addresses to their staked amounts
    stakes: Mapping<Address, U512>,
    /// Total amount staked in the contract
    total_staked: Var<U512>,
}

#[odra::module]
impl StakeVue {
    /// Initialize the contract (optional, stakes start at 0)
    pub fn init(&mut self) {
        self.total_staked.set(U512::zero());
    }

    /// Stake CSPR tokens
    ///
    /// This function is payable - attach CSPR when calling via proxy_caller
    /// The attached CSPR will be transferred to the contract's purse
    #[odra(payable)]
    pub fn stake(&mut self) {
        let caller = self.env().caller();
        let amount = self.env().attached_value();

        // Validate amount
        if amount == U512::zero() {
            self.env().revert(Error::ZeroAmount);
        }

        // Update user's stake
        let current_stake = self.stakes.get(&caller).unwrap_or_default();
        let new_stake = current_stake + amount;
        self.stakes.set(&caller, new_stake);

        // Update total staked
        let total = self.total_staked.get_or_default() + amount;
        self.total_staked.set(total);

        // Emit event
        self.env().emit_event(Staked {
            user: caller,
            amount,
            total_stake: new_stake,
        });
    }

    /// Unstake CSPR tokens
    ///
    /// Withdraws the specified amount from user's stake and transfers CSPR back
    pub fn unstake(&mut self, amount: U512) {
        let caller = self.env().caller();

        // Validate amount
        if amount == U512::zero() {
            self.env().revert(Error::ZeroAmount);
        }

        // Check user has enough staked
        let current_stake = self.stakes.get(&caller).unwrap_or_default();
        if current_stake == U512::zero() {
            self.env().revert(Error::NoStake);
        }
        if current_stake < amount {
            self.env().revert(Error::InsufficientBalance);
        }

        // Update user's stake
        let new_stake = current_stake - amount;
        self.stakes.set(&caller, new_stake);

        // Update total staked
        let total = self.total_staked.get_or_default();
        self.total_staked.set(total - amount);

        // Transfer CSPR back to user
        self.env().transfer_tokens(&caller, &amount);

        // Emit event
        self.env().emit_event(Unstaked {
            user: caller,
            amount,
            remaining_stake: new_stake,
        });
    }

    /// Get the staked balance for a user
    pub fn get_stake(&self, user: Address) -> U512 {
        self.stakes.get(&user).unwrap_or_default()
    }

    /// Get the total amount staked in the contract
    pub fn get_total_staked(&self) -> U512 {
        self.total_staked.get_or_default()
    }

    /// Get the contract's CSPR balance (should match total_staked)
    pub fn get_contract_balance(&self) -> U512 {
        self.env().self_balance()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use odra::host::{Deployer, HostRef, NoArgs};

    #[test]
    fn test_stake_and_unstake() {
        let env = odra_test::env();

        // Deploy contract
        let mut contract = StakeVue::deploy(&env, NoArgs);

        let user = env.get_account(0);
        env.set_caller(user);

        // Stake 100 CSPR
        let stake_amount = U512::from(100_000_000_000u64); // 100 CSPR in motes
        contract.with_tokens(stake_amount).stake();

        // Check stake
        assert_eq!(contract.get_stake(user), stake_amount);
        assert_eq!(contract.get_total_staked(), stake_amount);

        // Unstake 50 CSPR
        let unstake_amount = U512::from(50_000_000_000u64);
        contract.unstake(unstake_amount);

        // Check remaining stake
        assert_eq!(contract.get_stake(user), stake_amount - unstake_amount);
        assert_eq!(contract.get_total_staked(), stake_amount - unstake_amount);
    }

    #[test]
    fn test_multiple_users() {
        let env = odra_test::env();
        let mut contract = StakeVue::deploy(&env, NoArgs);

        let user1 = env.get_account(0);
        let user2 = env.get_account(1);

        // User 1 stakes
        env.set_caller(user1);
        contract.with_tokens(U512::from(100)).stake();

        // User 2 stakes
        env.set_caller(user2);
        contract.with_tokens(U512::from(200)).stake();

        // Check individual stakes
        assert_eq!(contract.get_stake(user1), U512::from(100));
        assert_eq!(contract.get_stake(user2), U512::from(200));

        // Check total
        assert_eq!(contract.get_total_staked(), U512::from(300));
    }
}
