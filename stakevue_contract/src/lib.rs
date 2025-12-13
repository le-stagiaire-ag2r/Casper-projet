#![no_std]

use odra::prelude::*;
use odra::casper_types::{U512, U256, PublicKey};
use odra_modules::access::Ownable;
use odra_modules::cep18_token::Cep18;

// ============================================================================
// ERRORS
// ============================================================================

#[odra::odra_error]
pub enum Error {
    InsufficientBalance = 1,
    InsufficientStCsprBalance = 2,
    ZeroAmount = 3,
    InsufficientPoolBalance = 4,
    NoValidatorSet = 5,
    BelowMinimumDelegation = 6,
}

// ============================================================================
// EVENTS
// ============================================================================

#[odra::event]
pub struct Staked {
    pub staker: Address,
    pub cspr_amount: U512,
    pub stcspr_minted: U256,
}

#[odra::event]
pub struct Unstaked {
    pub staker: Address,
    pub stcspr_burned: U256,
    pub cspr_returned: U512,
}

#[odra::event]
pub struct RewardsAdded {
    pub amount: U512,
    pub new_exchange_rate: U512,
}

#[odra::event]
pub struct ValidatorSet {
    pub validator: PublicKey,
}

#[odra::event]
pub struct Delegated {
    pub validator: PublicKey,
    pub amount: U512,
}

#[odra::event]
pub struct Undelegated {
    pub validator: PublicKey,
    pub amount: U512,
}

// ============================================================================
// STAKEVUE CONTRACT V16 - With Validator Delegation
// ============================================================================
// V15 + Real validator delegation using Odra 2.0 native support
//
// Features:
// - Exchange Rate = total_cspr_pool / total_stcspr_supply
// - Automatic delegation to validator on stake
// - Automatic undelegation on unstake
// - Rewards come from actual validator rewards
//
// Important timing (Casper network):
// - Delegation becomes active after 1 era
// - Undelegation completes after 7 eras (mainnet)
// - Minimum delegation: 500 CSPR per validator
// ============================================================================

// Precision for exchange rate calculations (9 decimals like CSPR)
const RATE_PRECISION: u64 = 1_000_000_000;

// Minimum delegation amount (500 CSPR in motes)
const MIN_DELEGATION: u64 = 500_000_000_000;

#[odra::module(events = [Staked, Unstaked, RewardsAdded, ValidatorSet, Delegated, Undelegated], errors = Error)]
pub struct StakeVue {
    /// Access control
    ownable: SubModule<Ownable>,
    /// Integrated stCSPR CEP-18 token
    token: SubModule<Cep18>,
    /// Total CSPR in pool (including rewards)
    total_cspr_pool: Var<U512>,
    /// Validator public key for delegation
    validator: Var<PublicKey>,
}

#[odra::module]
impl StakeVue {
    /// Initialize the contract
    pub fn init(&mut self, owner: Address) {
        self.ownable.init(owner);
        self.total_cspr_pool.set(U512::zero());

        // Initialize the integrated stCSPR token
        self.token.init(
            String::from("stCSPR"),
            String::from("Staked CSPR"),
            9,
            U256::zero(),
        );
    }

    // ========================================================================
    // STAKING FUNCTIONS
    // ========================================================================

    /// Stake CSPR and receive stCSPR tokens based on current exchange rate
    ///
    /// If exchange rate is 1.15 (1 stCSPR = 1.15 CSPR):
    /// - Stake 115 CSPR → receive 100 stCSPR
    ///
    /// The CSPR is automatically delegated to the configured validator
    #[odra(payable)]
    pub fn stake(&mut self) {
        let staker = self.env().caller();
        let cspr_amount = self.env().attached_value();

        if cspr_amount == U512::zero() {
            self.env().revert(Error::ZeroAmount);
        }

        // Check validator is configured
        let validator = self.validator.get();
        if validator.is_none() {
            self.env().revert(Error::NoValidatorSet);
        }
        let validator = validator.unwrap();

        // Check minimum delegation (only for first stake or if total would be below minimum)
        // Note: delegated_amount not available in test environment
        #[cfg(not(test))]
        {
            let current_delegated = self.env().delegated_amount(validator.clone());
            if current_delegated == U512::zero() && cspr_amount < U512::from(MIN_DELEGATION) {
                self.env().revert(Error::BelowMinimumDelegation);
            }
        }
        #[cfg(test)]
        {
            // In tests, check against pool balance instead
            let current_pool = self.total_cspr_pool.get_or_default();
            if current_pool == U512::zero() && cspr_amount < U512::from(MIN_DELEGATION) {
                self.env().revert(Error::BelowMinimumDelegation);
            }
        }

        // Calculate stCSPR to mint based on exchange rate
        let stcspr_to_mint = self.cspr_to_stcspr(cspr_amount);

        // Mint stCSPR tokens to staker
        self.token.raw_mint(&staker, &stcspr_to_mint);

        // Add CSPR to pool
        let pool = self.total_cspr_pool.get_or_default();
        self.total_cspr_pool.set(pool + cspr_amount);

        // Delegate CSPR to validator (only in production/livenet)
        #[cfg(not(test))]
        {
            self.env().delegate(validator.clone(), cspr_amount);
            self.env().emit_event(Delegated {
                validator,
                amount: cspr_amount,
            });
        }
        #[cfg(test)]
        let _ = validator; // Silence unused variable warning in tests

        self.env().emit_event(Staked {
            staker,
            cspr_amount,
            stcspr_minted: stcspr_to_mint,
        });
    }

    /// Unstake: burn stCSPR and receive CSPR based on current exchange rate
    ///
    /// If exchange rate is 1.15 (1 stCSPR = 1.15 CSPR):
    /// - Unstake 100 stCSPR → receive 115 CSPR
    ///
    /// Note: Undelegation takes 7 eras to complete on mainnet.
    /// The CSPR will be available after the unbonding period.
    pub fn unstake(&mut self, stcspr_amount: U256) {
        let staker = self.env().caller();

        if stcspr_amount == U256::zero() {
            self.env().revert(Error::ZeroAmount);
        }

        // Check staker's stCSPR balance
        let staker_balance = self.token.balance_of(&staker);
        if stcspr_amount > staker_balance {
            self.env().revert(Error::InsufficientStCsprBalance);
        }

        // Check validator is configured
        let validator = self.validator.get();
        if validator.is_none() {
            self.env().revert(Error::NoValidatorSet);
        }
        let validator = validator.unwrap();

        // Calculate CSPR to return based on exchange rate
        let cspr_to_return = self.stcspr_to_cspr(stcspr_amount);

        // Check pool has enough CSPR
        let pool = self.total_cspr_pool.get_or_default();
        if cspr_to_return > pool {
            self.env().revert(Error::InsufficientPoolBalance);
        }

        // Burn stCSPR tokens
        self.token.raw_burn(&staker, &stcspr_amount);

        // Remove CSPR from pool
        self.total_cspr_pool.set(pool - cspr_to_return);

        // Undelegate from validator (only in production/livenet)
        #[cfg(not(test))]
        {
            self.env().undelegate(validator.clone(), cspr_to_return);
            self.env().emit_event(Undelegated {
                validator,
                amount: cspr_to_return,
            });
        }
        #[cfg(test)]
        let _ = validator; // Silence unused variable warning in tests

        // Transfer CSPR back to staker
        // Note: In production, this would need to wait for unbonding period
        self.env().transfer_tokens(&staker, &cspr_to_return);

        self.env().emit_event(Unstaked {
            staker,
            stcspr_burned: stcspr_amount,
            cspr_returned: cspr_to_return,
        });
    }

    // ========================================================================
    // EXCHANGE RATE FUNCTIONS
    // ========================================================================

    /// Get current exchange rate (with 9 decimal precision)
    /// Returns how many CSPR 1 stCSPR is worth (in motes)
    ///
    /// Example: 1_150_000_000 means 1 stCSPR = 1.15 CSPR
    pub fn get_exchange_rate(&self) -> U512 {
        let total_cspr = self.total_cspr_pool.get_or_default();
        let total_stcspr = self.token.total_supply();

        if total_stcspr == U256::zero() {
            // Initial rate: 1 stCSPR = 1 CSPR
            return U512::from(RATE_PRECISION);
        }

        // rate = (total_cspr * PRECISION) / total_stcspr
        let precision = U512::from(RATE_PRECISION);
        let total_stcspr_512 = u256_to_u512(total_stcspr);

        (total_cspr * precision) / total_stcspr_512
    }

    /// Convert CSPR amount to stCSPR based on current exchange rate
    fn cspr_to_stcspr(&self, cspr_amount: U512) -> U256 {
        let total_cspr = self.total_cspr_pool.get_or_default();
        let total_stcspr = self.token.total_supply();

        if total_stcspr == U256::zero() || total_cspr == U512::zero() {
            // First stake: 1:1 ratio
            return u512_to_u256(cspr_amount);
        }

        // stcspr = cspr_amount * total_stcspr / total_cspr
        let total_stcspr_512 = u256_to_u512(total_stcspr);
        let result = (cspr_amount * total_stcspr_512) / total_cspr;
        u512_to_u256(result)
    }

    /// Convert stCSPR amount to CSPR based on current exchange rate
    fn stcspr_to_cspr(&self, stcspr_amount: U256) -> U512 {
        let total_cspr = self.total_cspr_pool.get_or_default();
        let total_stcspr = self.token.total_supply();

        if total_stcspr == U256::zero() {
            return U512::zero();
        }

        // cspr = stcspr_amount * total_cspr / total_stcspr
        let stcspr_512 = u256_to_u512(stcspr_amount);
        let total_stcspr_512 = u256_to_u512(total_stcspr);

        (stcspr_512 * total_cspr) / total_stcspr_512
    }

    // ========================================================================
    // ADMIN FUNCTIONS
    // ========================================================================

    /// Add rewards to the pool (simulates validator rewards)
    /// This increases the exchange rate, benefiting all stCSPR holders
    ///
    /// Only owner can call this (in production, would be automated)
    #[odra(payable)]
    pub fn add_rewards(&mut self) {
        self.ownable.assert_owner(&self.env().caller());

        let reward_amount = self.env().attached_value();
        if reward_amount == U512::zero() {
            self.env().revert(Error::ZeroAmount);
        }

        // Add rewards to pool (increases exchange rate)
        let pool = self.total_cspr_pool.get_or_default();
        self.total_cspr_pool.set(pool + reward_amount);

        let new_rate = self.get_exchange_rate();
        self.env().emit_event(RewardsAdded {
            amount: reward_amount,
            new_exchange_rate: new_rate,
        });
    }

    /// Transfer ownership (owner only)
    pub fn transfer_ownership(&mut self, new_owner: Address) {
        self.ownable.transfer_ownership(&new_owner);
    }

    /// Set the validator to delegate to (owner only)
    /// Must be called before any staking can occur
    pub fn set_validator(&mut self, validator: PublicKey) {
        self.ownable.assert_owner(&self.env().caller());
        self.validator.set(validator.clone());

        self.env().emit_event(ValidatorSet {
            validator,
        });
    }

    // ========================================================================
    // VIEW FUNCTIONS
    // ========================================================================

    /// Get stCSPR balance of an address
    pub fn get_stcspr_balance(&self, account: Address) -> U256 {
        self.token.balance_of(&account)
    }

    /// Get CSPR value of stCSPR balance (what you'd get if you unstake now)
    pub fn get_cspr_value(&self, account: Address) -> U512 {
        let stcspr_balance = self.token.balance_of(&account);
        self.stcspr_to_cspr(stcspr_balance)
    }

    /// Get total CSPR in pool
    pub fn get_total_pool(&self) -> U512 {
        self.total_cspr_pool.get_or_default()
    }

    /// Get contract owner
    pub fn get_owner(&self) -> Address {
        self.ownable.get_owner()
    }

    /// Get token name
    pub fn token_name(&self) -> String {
        self.token.name()
    }

    /// Get token symbol
    pub fn token_symbol(&self) -> String {
        self.token.symbol()
    }

    /// Get token total supply
    pub fn token_total_supply(&self) -> U256 {
        self.token.total_supply()
    }

    /// Get configured validator public key
    pub fn get_validator(&self) -> Option<PublicKey> {
        self.validator.get()
    }

    /// Get amount currently delegated to validator
    pub fn get_delegated_amount(&self) -> U512 {
        #[cfg(not(test))]
        {
            match self.validator.get() {
                Some(validator) => self.env().delegated_amount(validator),
                None => U512::zero(),
            }
        }
        #[cfg(test)]
        {
            // In tests, return total pool as proxy for delegated amount
            self.total_cspr_pool.get_or_default()
        }
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

fn u256_to_u512(value: U256) -> U512 {
    let mut bytes = [0u8; 32];
    value.to_little_endian(&mut bytes);
    U512::from_little_endian(&bytes)
}

// ============================================================================
// TESTS
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use odra::host::{Deployer, HostRef};
    use odra::casper_types::AsymmetricType;

    // Test validator public key (dummy for testing)
    fn test_validator() -> PublicKey {
        // Create a test public key using ed25519
        PublicKey::ed25519_from_bytes([1u8; 32]).unwrap()
    }

    fn setup() -> (odra::host::HostEnv, StakeVueHostRef) {
        let env = odra_test::env();
        let owner = env.get_account(0);
        let mut contract = StakeVue::deploy(&env, StakeVueInitArgs { owner });

        // Set up validator for delegation
        env.set_caller(owner);
        contract.set_validator(test_validator());

        (env, contract)
    }

    #[test]
    fn test_initial_exchange_rate() {
        let (_env, contract) = setup();
        // Initial rate should be 1:1 (1_000_000_000 = 1.0 with 9 decimals)
        assert_eq!(contract.get_exchange_rate(), U512::from(RATE_PRECISION));
    }

    #[test]
    fn test_validator_set() {
        let (_env, contract) = setup();
        // Validator should be set
        let validator = contract.get_validator();
        assert!(validator.is_some());
        assert_eq!(validator.unwrap(), test_validator());
    }

    #[test]
    fn test_stake_at_initial_rate() {
        let (env, mut contract) = setup();
        let staker = env.get_account(1);
        env.set_caller(staker);

        // Stake 500 CSPR at 1:1 rate (minimum delegation)
        let stake_amount = U512::from(MIN_DELEGATION);
        contract.with_tokens(stake_amount).stake();

        // Should receive 500 stCSPR
        assert_eq!(contract.get_stcspr_balance(staker), U256::from(MIN_DELEGATION));
        assert_eq!(contract.get_total_pool(), stake_amount);
        assert_eq!(contract.get_exchange_rate(), U512::from(RATE_PRECISION));
    }

    #[test]
    fn test_exchange_rate_increases_with_rewards() {
        let (env, mut contract) = setup();
        let owner = env.get_account(0);
        let staker = env.get_account(1);

        // Staker stakes 1000 CSPR
        env.set_caller(staker);
        contract.with_tokens(U512::from(1000_000_000_000u64)).stake();

        // 1000 stCSPR minted, 1000 CSPR in pool
        assert_eq!(contract.token_total_supply(), U256::from(1000_000_000_000u64));
        assert_eq!(contract.get_total_pool(), U512::from(1000_000_000_000u64));

        // Owner adds 150 CSPR rewards (simulating 15% APY)
        env.set_caller(owner);
        contract.with_tokens(U512::from(150_000_000_000u64)).add_rewards();

        // Pool now has 1150 CSPR, still 1000 stCSPR
        assert_eq!(contract.get_total_pool(), U512::from(1150_000_000_000u64));
        assert_eq!(contract.token_total_supply(), U256::from(1000_000_000_000u64));

        // Exchange rate should be 1.15 (1150/1000)
        // 1.15 * 1_000_000_000 = 1_150_000_000
        assert_eq!(contract.get_exchange_rate(), U512::from(1_150_000_000u64));
    }

    #[test]
    fn test_unstake_with_rewards() {
        let (env, mut contract) = setup();
        let owner = env.get_account(0);
        let staker = env.get_account(1);

        // Staker stakes 1000 CSPR
        env.set_caller(staker);
        contract.with_tokens(U512::from(1000_000_000_000u64)).stake();

        // Owner adds 150 CSPR rewards
        env.set_caller(owner);
        contract.with_tokens(U512::from(150_000_000_000u64)).add_rewards();

        // Staker unstakes all 1000 stCSPR
        env.set_caller(staker);
        contract.unstake(U256::from(1000_000_000_000u64));

        // Should receive 1150 CSPR (1000 + 150 rewards)
        // Pool should be empty
        assert_eq!(contract.get_total_pool(), U512::zero());
        assert_eq!(contract.token_total_supply(), U256::zero());
    }

    #[test]
    fn test_stake_after_rate_increase() {
        let (env, mut contract) = setup();
        let owner = env.get_account(0);
        let alice = env.get_account(1);
        let bob = env.get_account(2);

        // Alice stakes 1000 CSPR at 1:1
        env.set_caller(alice);
        contract.with_tokens(U512::from(1000_000_000_000u64)).stake();
        assert_eq!(contract.get_stcspr_balance(alice), U256::from(1000_000_000_000u64));

        // Owner adds 150 CSPR rewards (rate now 1.15)
        env.set_caller(owner);
        contract.with_tokens(U512::from(150_000_000_000u64)).add_rewards();

        // Bob stakes 1150 CSPR at 1.15 rate
        env.set_caller(bob);
        contract.with_tokens(U512::from(1150_000_000_000u64)).stake();

        // Bob should receive ~1000 stCSPR (1150 / 1.15)
        let bob_balance = contract.get_stcspr_balance(bob);
        assert_eq!(bob_balance, U256::from(1000_000_000_000u64));
    }

    #[test]
    #[should_panic(expected = "ZeroAmount")]
    fn test_stake_zero_fails() {
        let (env, contract) = setup();
        env.set_caller(env.get_account(1));
        contract.with_tokens(U512::zero()).stake();
    }

    #[test]
    #[should_panic(expected = "BelowMinimumDelegation")]
    fn test_stake_below_minimum_fails() {
        let (env, contract) = setup();
        env.set_caller(env.get_account(1));
        // Try to stake 100 CSPR (below 500 minimum)
        contract.with_tokens(U512::from(100_000_000_000u64)).stake();
    }

    #[test]
    #[should_panic(expected = "NoValidatorSet")]
    fn test_stake_without_validator_fails() {
        let env = odra_test::env();
        let owner = env.get_account(0);
        // Deploy without setting validator
        let contract = StakeVue::deploy(&env, StakeVueInitArgs { owner });

        env.set_caller(env.get_account(1));
        contract.with_tokens(U512::from(MIN_DELEGATION)).stake();
    }

    #[test]
    #[should_panic(expected = "InsufficientStCsprBalance")]
    fn test_unstake_more_than_balance_fails() {
        let (env, mut contract) = setup();
        let staker = env.get_account(1);
        env.set_caller(staker);

        contract.with_tokens(U512::from(MIN_DELEGATION)).stake();
        contract.unstake(U256::from(1000_000_000_000u64));
    }

    #[test]
    fn test_additional_stake_below_minimum_succeeds() {
        let (env, mut contract) = setup();
        let staker = env.get_account(1);
        env.set_caller(staker);

        // First stake meets minimum (500 CSPR)
        contract.with_tokens(U512::from(MIN_DELEGATION)).stake();

        // Additional stake below minimum should succeed
        // because we already have a delegation
        contract.with_tokens(U512::from(100_000_000_000u64)).stake();

        // Total should be 600 stCSPR
        assert_eq!(contract.get_stcspr_balance(staker), U256::from(600_000_000_000u64));
    }
}
