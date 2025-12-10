#![no_std]

use odra::prelude::*;
use odra::casper_types::{U256, U512};
use odra::ContractRef;
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
    TokenNotConfigured = 4,
    ConversionOverflow = 5,
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
    pub token_address: Address,
}

// ============================================================================
// EXTERNAL CONTRACT TRAIT - CEP-18 Token Interface
// ============================================================================

/// External contract trait for stCSPR CEP-18 token
/// StakeVue will call these methods on the deployed token contract
#[odra::external_contract]
pub trait StCsprToken {
    /// Mint tokens to owner (only token owner can call)
    fn mint(&mut self, owner: Address, amount: U256);

    /// Burn tokens from owner (only token owner can call)
    fn burn(&mut self, owner: Address, amount: U256);

    /// Get balance of an address
    fn balance_of(&self, address: Address) -> U256;

    /// Get total supply
    fn total_supply(&self) -> U256;

    /// Transfer ownership of the token contract
    fn transfer_ownership(&mut self, new_owner: Address);

    /// Get current owner of the token contract
    fn get_owner(&self) -> Address;
}

// ============================================================================
// STAKEVUE CONTRACT V9 - with External CEP-18 Token
// ============================================================================

/// StakeVue V9 - Liquid Staking Protocol for Casper
///
/// Architecture:
/// - StakeVue contract handles CSPR staking logic
/// - Separate stCSPR token (CEP-18) for liquid staking tokens
/// - Cross-contract calls via External<StCsprTokenContractRef>
///
/// Deployment steps:
/// 1. Deploy stCSPR CEP-18 token
/// 2. Deploy StakeVue with owner address
/// 3. Call set_token() to link the token contract
/// 4. Transfer stCSPR token ownership to StakeVue
///
/// Features:
/// - Ownable: only owner can configure and pause
/// - Pauseable: emergency stop mechanism
/// - Real stCSPR tokens via CEP-18
/// - 1:1 ratio: 1 CSPR staked = 1 stCSPR minted
#[odra::module(events = [Staked, Unstaked, TokenConfigured], errors = Error)]
pub struct StakeVue {
    /// Reference to external stCSPR token contract
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
    /// Initialize the contract
    pub fn init(&mut self, owner: Address) {
        self.ownable.init(owner);
        self.total_staked.set(U512::zero());
    }

    // ========================================================================
    // CONFIGURATION FUNCTIONS (Owner only)
    // ========================================================================

    /// Set the stCSPR token contract address (owner only)
    /// Must be called after deployment to link the token
    pub fn set_token(&mut self, token_address: Address) {
        self.ownable.assert_owner(&self.env().caller());
        self.stcspr_token.set(token_address);
        self.env().emit_event(TokenConfigured { token_address });
    }

    /// Get the stCSPR token contract address
    pub fn get_token(&self) -> Option<Address> {
        self.stcspr_token.get()
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

        // Get token address
        let token_address = match self.stcspr_token.get() {
            Some(addr) => addr,
            None => self.env().revert(Error::TokenNotConfigured),
        };

        // Convert U512 to U256 for token (1 CSPR = 1 stCSPR, same decimals)
        let token_amount = self.u512_to_u256(amount);

        // Mint stCSPR tokens to staker via external contract call
        let mut token: StCsprTokenContractRef = StCsprTokenContractRef::new(self.env(), token_address);
        token.mint(staker, token_amount);

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

        // Get token address
        let token_address = match self.stcspr_token.get() {
            Some(addr) => addr,
            None => self.env().revert(Error::TokenNotConfigured),
        };

        // Convert U512 to U256 for token operations
        let token_amount = self.u512_to_u256(amount);

        // Check staker has enough stCSPR (via external call)
        let mut token: StCsprTokenContractRef = StCsprTokenContractRef::new(self.env(), token_address);
        let balance = token.balance_of(staker);
        if token_amount > balance {
            self.env().revert(Error::InsufficientStCsprBalance);
        }

        // Burn stCSPR tokens from staker
        token.burn(staker, token_amount);

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

    /// Get stCSPR balance of an address (from token contract)
    pub fn get_stake(&self, staker: Address) -> U512 {
        match self.stcspr_token.get() {
            Some(token_address) => {
                let token: StCsprTokenContractRef = StCsprTokenContractRef::new(self.env(), token_address);
                let balance = token.balance_of(staker);
                self.u256_to_u512(balance)
            }
            None => U512::zero(),
        }
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

    // ========================================================================
    // INTERNAL HELPERS
    // ========================================================================

    /// Convert U512 (CSPR motes) to U256 (token amount)
    /// Safe because we're dealing with realistic amounts
    fn u512_to_u256(&self, value: U512) -> U256 {
        // U512 max is much larger than U256 max, but for realistic staking amounts
        // this conversion is safe. We check for overflow.
        let mut bytes = [0u8; 64];
        value.to_little_endian(&mut bytes);
        // Check that upper bytes (32-63) are zero
        for i in 32..64 {
            if bytes[i] != 0 {
                self.env().revert(Error::ConversionOverflow);
            }
        }
        let mut u256_bytes = [0u8; 32];
        u256_bytes.copy_from_slice(&bytes[0..32]);
        U256::from_little_endian(&u256_bytes)
    }

    /// Convert U256 (token amount) to U512 (CSPR motes)
    /// Always safe because U256 fits in U512
    fn u256_to_u512(&self, value: U256) -> U512 {
        let mut bytes = [0u8; 32];
        value.to_little_endian(&mut bytes);
        let mut u512_bytes = [0u8; 64];
        u512_bytes[0..32].copy_from_slice(&bytes);
        U512::from_little_endian(&u512_bytes)
    }
}

// ============================================================================
// TESTS
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use odra::host::{Deployer, HostRef};
    use odra_modules::cep18_token::Cep18;
    use odra_modules::cep18_token::Cep18InitArgs;
    use odra_modules::cep18_token::Cep18HostRef;

    fn setup() -> (odra::host::HostEnv, StakeVueHostRef, Cep18HostRef) {
        let env = odra_test::env();
        let owner = env.get_account(0);

        // Deploy stCSPR token (CEP-18)
        let token = Cep18::deploy(&env, Cep18InitArgs {
            symbol: "stCSPR".to_string(),
            name: "Staked CSPR".to_string(),
            decimals: 9,
            initial_supply: U256::zero(),
        });

        // Deploy StakeVue
        let mut stakevue = StakeVue::deploy(&env, StakeVueInitArgs { owner });

        // Configure token in StakeVue
        env.set_caller(owner);
        stakevue.set_token(token.address().clone());

        // Transfer token ownership to StakeVue
        // Note: In tests, we need to call transfer_ownership on the token
        // The token's transfer_ownership function requires current owner

        (env, stakevue, token)
    }

    #[test]
    fn test_initial_state() {
        let (env, contract, token) = setup();
        let owner = env.get_account(0);

        assert_eq!(contract.get_total_staked(), U512::zero());
        assert_eq!(contract.get_owner(), owner);
        assert!(!contract.is_paused());
        assert_eq!(contract.get_token(), Some(token.address().clone()));
    }

    #[test]
    fn test_token_not_configured() {
        let env = odra_test::env();
        let owner = env.get_account(0);

        // Deploy StakeVue without configuring token
        let contract = StakeVue::deploy(&env, StakeVueInitArgs { owner });

        // Stake should fail because token is not configured
        let result = contract.with_tokens(U512::from(100_000_000_000u64)).try_stake();
        assert_eq!(result, Err(Error::TokenNotConfigured.into()));
    }

    #[test]
    fn test_owner_can_pause() {
        let (env, mut contract, _token) = setup();
        let owner = env.get_account(0);

        env.set_caller(owner);
        contract.pause();
        assert!(contract.is_paused());
    }

    #[test]
    fn test_non_owner_cannot_pause() {
        let (env, mut contract, _token) = setup();
        let non_owner = env.get_account(1);

        env.set_caller(non_owner);
        assert!(contract.try_pause().is_err());
    }

    #[test]
    fn test_non_owner_cannot_set_token() {
        let env = odra_test::env();
        let owner = env.get_account(0);
        let non_owner = env.get_account(1);

        let mut contract = StakeVue::deploy(&env, StakeVueInitArgs { owner });

        env.set_caller(non_owner);
        // This should fail - non-owner trying to set token
        // Note: The error will come from assert_owner
        let token_addr = env.get_account(2); // Some random address
        assert!(contract.try_set_token(token_addr).is_err());
    }
}
