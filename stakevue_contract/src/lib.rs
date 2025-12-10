#![no_std]

use odra::prelude::*;
use odra::casper_types::{U256, U512};
use odra_modules::cep18_token::Cep18;
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
    pub cspr_amount: U512,
    pub stcspr_minted: U256,
}

#[odra::event]
pub struct Unstaked {
    pub staker: Address,
    pub cspr_amount: U512,
    pub stcspr_burned: U256,
}

// ============================================================================
// STAKEVUE CONTRACT V9
// ============================================================================

/// StakeVue - Liquid Staking Protocol for Casper
///
/// Features:
/// - Real stCSPR token (CEP-18) minted on stake
/// - Ownable: only owner can pause/unpause
/// - Pausable: emergency stop mechanism
/// - 1:1 ratio: 1 CSPR staked = 1 stCSPR minted
#[odra::module(events = [Staked, Unstaked], errors = Error)]
pub struct StakeVue {
    /// CEP-18 token for stCSPR
    stcspr_token: SubModule<Cep18>,
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
        // Initialize stCSPR token
        self.stcspr_token.init(
            "stCSPR".to_string(),           // symbol
            "Staked CSPR".to_string(),      // name
            9,                               // decimals (same as CSPR)
            U256::zero()                     // initial supply
        );

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
        let cspr_amount = self.env().attached_value();

        // Validate amount
        if cspr_amount == U512::zero() {
            self.env().revert(Error::ZeroAmount);
        }

        // Convert U512 (CSPR) to U256 (stCSPR) - 1:1 ratio
        let stcspr_amount = u512_to_u256(cspr_amount);

        // Mint stCSPR tokens to staker
        self.stcspr_token.raw_mint(&staker, &stcspr_amount);

        // Update total staked
        let total = self.total_staked.get_or_default();
        self.total_staked.set(total + cspr_amount);

        // Emit event
        self.env().emit_event(Staked {
            staker,
            cspr_amount,
            stcspr_minted: stcspr_amount,
        });
    }

    /// Unstake: burn stCSPR and receive CSPR back
    pub fn unstake(&mut self, stcspr_amount: U256) {
        // Check not paused
        self.pausable.require_not_paused();

        let staker = self.env().caller();

        // Validate amount
        if stcspr_amount == U256::zero() {
            self.env().revert(Error::ZeroAmount);
        }

        // Check staker has enough stCSPR
        let balance = self.stcspr_token.balance_of(&staker);
        if stcspr_amount > balance {
            self.env().revert(Error::InsufficientStCsprBalance);
        }

        // Convert U256 (stCSPR) to U512 (CSPR) - 1:1 ratio
        let cspr_amount = u256_to_u512(stcspr_amount);

        // Check contract has enough CSPR
        let total = self.total_staked.get_or_default();
        if cspr_amount > total {
            self.env().revert(Error::InsufficientBalance);
        }

        // Burn stCSPR tokens from staker
        self.stcspr_token.raw_burn(&staker, &stcspr_amount);

        // Update total staked
        self.total_staked.set(total - cspr_amount);

        // Transfer CSPR back to staker
        self.env().transfer_tokens(&staker, &cspr_amount);

        // Emit event
        self.env().emit_event(Unstaked {
            staker,
            cspr_amount,
            stcspr_burned: stcspr_amount,
        });
    }

    // ========================================================================
    // VIEW FUNCTIONS
    // ========================================================================

    /// Get stCSPR balance of an address
    pub fn balance_of(&self, address: Address) -> U256 {
        self.stcspr_token.balance_of(&address)
    }

    /// Get total CSPR staked in the contract
    pub fn get_total_staked(&self) -> U512 {
        self.total_staked.get_or_default()
    }

    /// Get total stCSPR supply
    pub fn get_total_stcspr_supply(&self) -> U256 {
        self.stcspr_token.total_supply()
    }

    /// Get stCSPR token name
    pub fn stcspr_name(&self) -> String {
        self.stcspr_token.name()
    }

    /// Get stCSPR token symbol
    pub fn stcspr_symbol(&self) -> String {
        self.stcspr_token.symbol()
    }

    /// Get stCSPR token decimals
    pub fn stcspr_decimals(&self) -> u8 {
        self.stcspr_token.decimals()
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

    // ========================================================================
    // CEP-18 TOKEN FUNCTIONS (for stCSPR transfers)
    // ========================================================================

    /// Transfer stCSPR tokens
    pub fn transfer(&mut self, recipient: Address, amount: U256) {
        self.stcspr_token.transfer(&recipient, &amount);
    }

    /// Approve spender to spend stCSPR
    pub fn approve(&mut self, spender: Address, amount: U256) {
        self.stcspr_token.approve(&spender, &amount);
    }

    /// Transfer stCSPR from another account (requires approval)
    pub fn transfer_from(&mut self, owner: Address, recipient: Address, amount: U256) {
        self.stcspr_token.transfer_from(&owner, &recipient, &amount);
    }

    /// Get allowance
    pub fn allowance(&self, owner: Address, spender: Address) -> U256 {
        self.stcspr_token.allowance(&owner, &spender)
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/// Convert U512 to U256 (for CSPR to stCSPR)
fn u512_to_u256(value: U512) -> U256 {
    let mut bytes = [0u8; 64];
    value.to_little_endian(&mut bytes);
    U256::from_little_endian(&bytes[..32])
}

/// Convert U256 to U512 (for stCSPR to CSPR)
fn u256_to_u512(value: U256) -> U512 {
    let mut bytes = [0u8; 64];
    value.to_little_endian(&mut bytes[..32]);
    U512::from_little_endian(&bytes)
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

    // ========================================================================
    // INITIALIZATION TESTS
    // ========================================================================

    #[test]
    fn test_initial_state() {
        let (env, contract) = setup();
        let owner = env.get_account(0);

        // Check initial values
        assert_eq!(contract.get_total_staked(), U512::zero());
        assert_eq!(contract.get_total_stcspr_supply(), U256::zero());
        assert_eq!(contract.get_owner(), owner);
        assert!(!contract.is_paused());

        // Check token metadata
        assert_eq!(contract.stcspr_symbol(), "stCSPR");
        assert_eq!(contract.stcspr_name(), "Staked CSPR");
        assert_eq!(contract.stcspr_decimals(), 9);
    }

    // ========================================================================
    // STAKING TESTS
    // ========================================================================

    #[test]
    fn test_stake_mints_stcspr() {
        let (env, contract) = setup();
        let staker = env.get_account(0);
        let stake_amount = U512::from(100_000_000_000u64); // 100 CSPR
        let expected_stcspr = U256::from(100_000_000_000u64);

        // Stake
        contract.with_tokens(stake_amount).stake();

        // Check stCSPR was minted
        assert_eq!(contract.balance_of(staker), expected_stcspr);
        assert_eq!(contract.get_total_stcspr_supply(), expected_stcspr);
        assert_eq!(contract.get_total_staked(), stake_amount);

        // Check event
        assert!(env.emitted_event(
            &contract,
            Staked {
                staker,
                cspr_amount: stake_amount,
                stcspr_minted: expected_stcspr,
            }
        ));
    }

    #[test]
    fn test_multiple_stakes_accumulate() {
        let (env, contract) = setup();
        let staker = env.get_account(0);
        let first_stake = U512::from(50_000_000_000u64);
        let second_stake = U512::from(30_000_000_000u64);
        let total = U256::from(80_000_000_000u64);

        contract.with_tokens(first_stake).stake();
        contract.with_tokens(second_stake).stake();

        assert_eq!(contract.balance_of(staker), total);
        assert_eq!(contract.get_total_staked(), first_stake + second_stake);
    }

    #[test]
    fn test_multiple_users_stake() {
        let (env, contract) = setup();
        let user1 = env.get_account(0);
        let user2 = env.get_account(1);
        let amount1 = U512::from(100_000_000_000u64);
        let amount2 = U512::from(50_000_000_000u64);

        env.set_caller(user1);
        contract.with_tokens(amount1).stake();

        env.set_caller(user2);
        contract.with_tokens(amount2).stake();

        assert_eq!(contract.balance_of(user1), U256::from(100_000_000_000u64));
        assert_eq!(contract.balance_of(user2), U256::from(50_000_000_000u64));
        assert_eq!(contract.get_total_staked(), amount1 + amount2);
    }

    // ========================================================================
    // UNSTAKING TESTS
    // ========================================================================

    #[test]
    fn test_unstake_burns_stcspr() {
        let (env, mut contract) = setup();
        let staker = env.get_account(0);
        let stake_amount = U512::from(100_000_000_000u64);
        let unstake_amount = U256::from(40_000_000_000u64);

        contract.with_tokens(stake_amount).stake();
        contract.unstake(unstake_amount);

        // Check stCSPR was burned
        assert_eq!(contract.balance_of(staker), U256::from(60_000_000_000u64));
        assert_eq!(contract.get_total_staked(), U512::from(60_000_000_000u64));

        // Check event
        assert!(env.emitted_event(
            &contract,
            Unstaked {
                staker,
                cspr_amount: U512::from(40_000_000_000u64),
                stcspr_burned: unstake_amount,
            }
        ));
    }

    #[test]
    fn test_unstake_full_amount() {
        let (_env, mut contract) = setup();
        let stake_amount = U512::from(100_000_000_000u64);

        contract.with_tokens(stake_amount).stake();
        contract.unstake(U256::from(100_000_000_000u64));

        assert_eq!(contract.get_total_staked(), U512::zero());
        assert_eq!(contract.get_total_stcspr_supply(), U256::zero());
    }

    #[test]
    fn test_unstake_insufficient_stcspr_fails() {
        let (_env, mut contract) = setup();
        let stake_amount = U512::from(50_000_000_000u64);

        contract.with_tokens(stake_amount).stake();

        // Try to unstake more than balance
        assert_eq!(
            contract.try_unstake(U256::from(100_000_000_000u64)),
            Err(Error::InsufficientStCsprBalance.into())
        );
    }

    #[test]
    fn test_unstake_zero_amount_fails() {
        let (_env, mut contract) = setup();
        contract.with_tokens(U512::from(100_000_000_000u64)).stake();

        assert_eq!(
            contract.try_unstake(U256::zero()),
            Err(Error::ZeroAmount.into())
        );
    }

    // ========================================================================
    // PAUSABLE TESTS
    // ========================================================================

    #[test]
    fn test_owner_can_pause() {
        let (env, mut contract) = setup();
        let owner = env.get_account(0);

        env.set_caller(owner);
        contract.pause();

        assert!(contract.is_paused());
    }

    #[test]
    fn test_stake_fails_when_paused() {
        let (env, mut contract) = setup();
        let owner = env.get_account(0);

        env.set_caller(owner);
        contract.pause();

        // Try to stake while paused
        let result = contract.with_tokens(U512::from(100_000_000_000u64)).try_stake();
        assert!(result.is_err());
    }

    #[test]
    fn test_unstake_fails_when_paused() {
        let (env, mut contract) = setup();
        let owner = env.get_account(0);

        contract.with_tokens(U512::from(100_000_000_000u64)).stake();

        env.set_caller(owner);
        contract.pause();

        // Try to unstake while paused
        assert!(contract.try_unstake(U256::from(50_000_000_000u64)).is_err());
    }

    #[test]
    fn test_owner_can_unpause() {
        let (env, mut contract) = setup();
        let owner = env.get_account(0);

        env.set_caller(owner);
        contract.pause();
        contract.unpause();

        assert!(!contract.is_paused());

        // Should be able to stake again
        contract.with_tokens(U512::from(100_000_000_000u64)).stake();
        assert_eq!(contract.get_total_staked(), U512::from(100_000_000_000u64));
    }

    // ========================================================================
    // OWNABLE TESTS
    // ========================================================================

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

        // New owner can pause
        env.set_caller(new_owner);
        contract.pause();
        assert!(contract.is_paused());
    }

    // ========================================================================
    // CEP-18 TOKEN TRANSFER TESTS
    // ========================================================================

    #[test]
    fn test_stcspr_transfer() {
        let (env, mut contract) = setup();
        let user1 = env.get_account(0);
        let user2 = env.get_account(1);

        // User1 stakes
        env.set_caller(user1);
        contract.with_tokens(U512::from(100_000_000_000u64)).stake();

        // User1 transfers stCSPR to user2
        contract.transfer(user2, U256::from(30_000_000_000u64));

        assert_eq!(contract.balance_of(user1), U256::from(70_000_000_000u64));
        assert_eq!(contract.balance_of(user2), U256::from(30_000_000_000u64));
    }

    #[test]
    fn test_stcspr_approve_and_transfer_from() {
        let (env, mut contract) = setup();
        let user1 = env.get_account(0);
        let user2 = env.get_account(1);
        let spender = env.get_account(2);

        // User1 stakes
        env.set_caller(user1);
        contract.with_tokens(U512::from(100_000_000_000u64)).stake();

        // User1 approves spender
        contract.approve(spender, U256::from(50_000_000_000u64));
        assert_eq!(contract.allowance(user1, spender), U256::from(50_000_000_000u64));

        // Spender transfers from user1 to user2
        env.set_caller(spender);
        contract.transfer_from(user1, user2, U256::from(30_000_000_000u64));

        assert_eq!(contract.balance_of(user1), U256::from(70_000_000_000u64));
        assert_eq!(contract.balance_of(user2), U256::from(30_000_000_000u64));
    }

    // ========================================================================
    // SECURITY TESTS
    // ========================================================================

    #[test]
    fn test_user_cannot_unstake_others_stcspr() {
        let (env, mut contract) = setup();
        let user1 = env.get_account(0);
        let user2 = env.get_account(1);

        env.set_caller(user1);
        contract.with_tokens(U512::from(100_000_000_000u64)).stake();

        // User2 tries to unstake (but has no stCSPR)
        env.set_caller(user2);
        assert_eq!(
            contract.try_unstake(U256::from(100_000_000_000u64)),
            Err(Error::InsufficientStCsprBalance.into())
        );

        // User1's balance unchanged
        assert_eq!(contract.balance_of(user1), U256::from(100_000_000_000u64));
    }
}
