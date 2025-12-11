#![no_std]

use odra::prelude::*;
use odra::casper_types::{U512, U256};
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
// STAKEVUE CONTRACT V14 - With integrated CEP-18 token (like Halborn audit)
// ============================================================================
// Based on V13 that works + SubModule<Cep18> for stCSPR token
// Following the pattern from official Casper liquid staking contracts
// ============================================================================

#[odra::module(events = [Staked, Unstaked], errors = Error)]
pub struct StakeVue {
    /// Access control
    ownable: SubModule<Ownable>,
    /// Integrated stCSPR CEP-18 token
    token: SubModule<Cep18>,
    /// Total CSPR staked in contract
    total_staked: Var<U512>,
}

#[odra::module]
impl StakeVue {
    /// Initialize the contract with owner only (like V13/V8.2)
    pub fn init(&mut self, owner: Address) {
        self.ownable.init(owner);
        self.total_staked.set(U512::zero());

        // Initialize the integrated stCSPR token (like in Halborn audit)
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

    /// Stake CSPR and receive stCSPR tokens
    #[odra(payable)]
    pub fn stake(&mut self) {
        let staker = self.env().caller();
        let amount = self.env().attached_value();

        if amount == U512::zero() {
            self.env().revert(Error::ZeroAmount);
        }

        // Convert U512 to U256 for token
        let token_amount = u512_to_u256(amount);

        // Mint stCSPR tokens to staker (using raw_mint like in tutorial)
        self.token.raw_mint(&staker, &token_amount);

        // Update total staked
        let total = self.total_staked.get_or_default();
        self.total_staked.set(total + amount);

        self.env().emit_event(Staked { staker, amount });
    }

    /// Unstake: burn stCSPR and receive CSPR back
    pub fn unstake(&mut self, amount: U512) {
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

        // Burn stCSPR tokens (using raw_burn like in tutorial)
        self.token.raw_burn(&staker, &token_amount);

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

    /// Get stCSPR balance (staked amount) of an address
    pub fn get_stake(&self, staker: Address) -> U256 {
        self.token.balance_of(&staker)
    }

    /// Get total CSPR staked in the contract
    pub fn get_total_staked(&self) -> U512 {
        self.total_staked.get_or_default()
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

    // ========================================================================
    // ADMIN FUNCTIONS
    // ========================================================================

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
        assert_eq!(contract.token_symbol(), "stCSPR");
        assert_eq!(contract.token_total_supply(), U256::zero());
    }

    #[test]
    fn test_stake_and_unstake() {
        let (env, mut contract) = setup();
        let staker = env.get_account(1);

        env.set_caller(staker);

        // Stake 10 CSPR
        let stake_amount = U512::from(10_000_000_000u64);
        contract.with_tokens(stake_amount).stake();

        // Check stCSPR received
        assert_eq!(contract.get_stake(staker), U256::from(10_000_000_000u64));
        assert_eq!(contract.get_total_staked(), stake_amount);
        assert_eq!(contract.token_total_supply(), U256::from(10_000_000_000u64));

        // Unstake 5 CSPR
        contract.unstake(U512::from(5_000_000_000u64));

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

        contract.with_tokens(U512::from(10_000_000_000u64)).stake();
        contract.unstake(U512::from(20_000_000_000u64));
    }
}
