#![no_std]

use odra::prelude::*;
use odra::casper_types::{U512, U256};
use odra::ContractRef;
use odra_modules::access::Ownable;
use odra_modules::security::Pauseable;

// ============================================================================
// EXTERNAL TOKEN INTERFACE
// ============================================================================

#[odra::external_contract]
pub trait StCsprToken {
    fn mint(&mut self, to: Address, amount: U256);
    fn burn(&mut self, from: Address, amount: U256);
    fn balance_of(&self, address: Address) -> U256;
    fn transfer_ownership(&mut self, new_owner: Address);
}

// ============================================================================
// ERRORS
// ============================================================================

#[odra::odra_error]
pub enum Error {
    InsufficientBalance = 1,
    InsufficientStCsprBalance = 2,
    ZeroAmount = 3,
    TokenNotConfigured = 4,
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

#[odra::event]
pub struct TokenConfigured {
    pub token: Address,
}

// ============================================================================
// STAKEVUE CONTRACT V10 - with token in init
// ============================================================================

#[odra::module(events = [Staked, Unstaked, TokenConfigured], errors = Error)]
pub struct StakeVue {
    /// stCSPR token contract address
    stcspr_token: Var<Address>,
    /// Access control
    ownable: SubModule<Ownable>,
    /// Emergency pause
    pausable: SubModule<Pauseable>,
    /// Total CSPR staked in contract
    total_staked: Var<U512>,
}

#[odra::module]
impl StakeVue {
    /// Initialize the contract with owner and token address
    pub fn init(&mut self, owner: Address, token: Address) {
        self.ownable.init(owner);
        self.stcspr_token.set(token);
        self.total_staked.set(U512::zero());
        self.env().emit_event(TokenConfigured { token });
    }

    // ========================================================================
    // TOKEN CONFIGURATION
    // ========================================================================

    /// Set the stCSPR token contract address (owner only, once)
    pub fn set_token(&mut self, token: Address) {
        self.ownable.assert_owner(&self.env().caller());
        self.stcspr_token.set(token);
        self.env().emit_event(TokenConfigured { token });
    }

    /// Get the token contract address
    pub fn get_token(&self) -> Address {
        self.stcspr_token.get_or_revert_with(Error::TokenNotConfigured)
    }

    // ========================================================================
    // STAKING FUNCTIONS
    // ========================================================================

    /// Stake CSPR and receive stCSPR tokens
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

        // Mint stCSPR tokens to staker
        let token_addr = self.stcspr_token.get_or_revert_with(Error::TokenNotConfigured);
        let mut token = StCsprTokenContractRef::new(self.env(), token_addr);
        token.mint(staker, token_amount);

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

        // Get token and check balance
        let token_addr = self.stcspr_token.get_or_revert_with(Error::TokenNotConfigured);
        let mut token = StCsprTokenContractRef::new(self.env(), token_addr);

        let staker_balance = token.balance_of(staker);
        if token_amount > staker_balance {
            self.env().revert(Error::InsufficientStCsprBalance);
        }

        // Burn stCSPR tokens
        token.burn(staker, token_amount);

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

    /// Get stCSPR balance of an address (from token contract)
    pub fn get_stake(&self, staker: Address) -> U256 {
        let token_addr = self.stcspr_token.get_or_revert_with(Error::TokenNotConfigured);
        let token = StCsprTokenContractRef::new(self.env(), token_addr);
        token.balance_of(staker)
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
        // Use a dummy token address for testing
        let token = env.get_account(1);
        let contract = StakeVue::deploy(&env, StakeVueInitArgs { owner, token });
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
}
