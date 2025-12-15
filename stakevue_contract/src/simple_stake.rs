#![allow(dead_code)]
//! Simple Stake Contract - Minimal test for delegate/undelegate
//! No tokens, no exchange rate, just pure delegation

use odra::prelude::*;
use odra::casper_types::{U512, PublicKey};

// Minimum delegation amount (500 CSPR in motes) - required by Casper
const MIN_DELEGATION: u64 = 500_000_000_000;

#[odra::odra_error]
pub enum SimpleError {
    ZeroAmount = 1,
    ValidatorNotSet = 2,
    InsufficientDelegation = 3,
    BelowMinimumDelegation = 4,
}

#[odra::event]
pub struct SimpleDelegated {
    pub validator: PublicKey,
    pub amount: U512,
}

#[odra::event]
pub struct SimpleUndelegated {
    pub validator: PublicKey,
    pub amount: U512,
}

/// Minimal contract to test delegate/undelegate on testnet
#[odra::module(events = [SimpleDelegated, SimpleUndelegated], errors = SimpleError)]
pub struct SimpleStake {
    /// Owner of the contract
    owner: Var<Address>,
    /// The validator we delegate to
    validator: Var<PublicKey>,
    /// Total delegated (our tracking)
    total_delegated: Var<U512>,
}

#[odra::module]
impl SimpleStake {
    /// Initialize with owner and validator
    pub fn init(&mut self, owner: Address, validator: PublicKey) {
        self.owner.set(owner);
        self.validator.set(validator);
        self.total_delegated.set(U512::zero());
    }

    /// Simple stake - just delegate to the validator
    #[odra(payable)]
    pub fn stake(&mut self) {
        let amount = self.env().attached_value();

        if amount == U512::zero() {
            self.env().revert(SimpleError::ZeroAmount);
        }

        // Check minimum delegation (500 CSPR required by Casper)
        if amount < U512::from(MIN_DELEGATION) {
            self.env().revert(SimpleError::BelowMinimumDelegation);
        }

        let validator = self.validator.get().unwrap_or_else(|| {
            self.env().revert(SimpleError::ValidatorNotSet)
        });

        // Update our tracking
        let current = self.total_delegated.get_or_default();
        self.total_delegated.set(current + amount);

        // Call Odra's native delegate
        self.env().delegate(validator.clone(), amount);

        self.env().emit_event(SimpleDelegated {
            validator,
            amount,
        });
    }

    /// Simple unstake - just undelegate from the validator
    pub fn unstake(&mut self, amount: U512) {
        if amount == U512::zero() {
            self.env().revert(SimpleError::ZeroAmount);
        }

        let validator = self.validator.get().unwrap_or_else(|| {
            self.env().revert(SimpleError::ValidatorNotSet)
        });

        let current = self.total_delegated.get_or_default();
        if amount > current {
            self.env().revert(SimpleError::InsufficientDelegation);
        }

        // Update our tracking
        self.total_delegated.set(current - amount);

        // Call Odra's native undelegate
        self.env().undelegate(validator.clone(), amount);

        self.env().emit_event(SimpleUndelegated {
            validator,
            amount,
        });
    }

    // ========================================================================
    // VIEW FUNCTIONS
    // ========================================================================

    /// Get our tracked delegation amount
    pub fn get_tracked_delegation(&self) -> U512 {
        self.total_delegated.get_or_default()
    }

    /// Get actual on-chain delegation (from Casper auction)
    pub fn get_actual_delegation(&self) -> U512 {
        match self.validator.get() {
            Some(v) => self.env().delegated_amount(v),
            None => U512::zero(),
        }
    }

    /// Get the validator
    pub fn get_validator(&self) -> Option<PublicKey> {
        self.validator.get()
    }

    /// Get owner
    pub fn get_owner(&self) -> Address {
        self.owner.get().unwrap_or_else(|| self.env().caller())
    }

    /// Debug: Compare tracked vs actual
    pub fn debug_status(&self) -> (U512, U512, bool) {
        let tracked = self.total_delegated.get_or_default();
        let actual = match self.validator.get() {
            Some(v) => self.env().delegated_amount(v),
            None => U512::zero(),
        };
        (tracked, actual, tracked == actual)
    }
}

// ============================================================================
// TESTS
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use odra::host::{Deployer, HostRef};

    fn setup() -> (odra::host::HostEnv, SimpleStakeHostRef) {
        let env = odra_test::env();
        let owner = env.get_account(0);
        let validator = env.get_validator(0);

        let contract = SimpleStake::deploy(&env, SimpleStakeInitArgs {
            owner,
            validator
        });

        (env, contract)
    }

    #[test]
    fn test_simple_stake() {
        let (env, mut contract) = setup();
        let staker = env.get_account(1);

        env.set_caller(staker);
        let amount = U512::from(1000_000_000_000u64); // 1000 CSPR

        contract.with_tokens(amount).stake();

        assert_eq!(contract.get_tracked_delegation(), amount);
    }

    #[test]
    fn test_simple_stake_unstake() {
        let (env, mut contract) = setup();
        let staker = env.get_account(1);
        let auction_delay = env.auction_delay();

        // Stake
        env.set_caller(staker);
        let amount = U512::from(1000_000_000_000u64);
        contract.with_tokens(amount).stake();

        // Wait for delegation to process
        env.advance_with_auctions(auction_delay * 2);

        // Unstake half
        env.set_caller(staker);
        let unstake_amount = U512::from(500_000_000_000u64);
        contract.unstake(unstake_amount);

        assert_eq!(contract.get_tracked_delegation(), U512::from(500_000_000_000u64));
    }

    #[test]
    fn test_simple_full_unstake() {
        let (env, mut contract) = setup();
        let staker = env.get_account(1);
        let auction_delay = env.auction_delay();

        // Stake
        env.set_caller(staker);
        let amount = U512::from(1000_000_000_000u64);
        contract.with_tokens(amount).stake();

        // Wait
        env.advance_with_auctions(auction_delay * 2);

        // Unstake all
        env.set_caller(staker);
        contract.unstake(amount);

        assert_eq!(contract.get_tracked_delegation(), U512::zero());
    }
}
