#![no_std]

use odra::prelude::*;
use odra::casper_types::{U512, U256, PublicKey};
use odra_modules::access::Ownable;
use odra_modules::cep18_token::Cep18;

// ============================================================================
// V21 - Hybrid Architecture (Direct Delegation for Large Stakes)
// ============================================================================
// Improvement over V20:
// - stake() >= 500 CSPR: Delegates DIRECTLY to validator (like Make/Wise)
// - stake() < 500 CSPR: Goes to pool (admin delegates later when pool >= 500)
// - request_unstake(): Burns stCSPR, creates withdrawal request
// - claim(): Transfers from pool liquidity (if available)
// - admin_delegate(): Owner delegates pool funds to validators
// - admin_undelegate(): Owner undelegates (separate process)
//
// This gives the best of both worlds:
// - Large stakes: 1 transaction, delegated immediately (like Make)
// - Small stakes: Pool-based, batched by admin
// ============================================================================

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
    ValidatorNotApproved = 7,
    ValidatorAlreadyExists = 8,
    WithdrawalNotReady = 9,
    WithdrawalNotFound = 10,
    WithdrawalAlreadyClaimed = 11,
    NotWithdrawalOwner = 12,
    MaxValidatorsReached = 13,
    NoDelegationFound = 14,
    UndelegateAmountExceedsDelegation = 15,
    InsufficientLiquidity = 16,
    NothingToDelegate = 17,
    NothingToUndelegate = 18,
}

// ============================================================================
// EVENTS
// ============================================================================

#[odra::event]
pub struct Staked {
    pub staker: Address,
    pub validator: PublicKey,
    pub cspr_amount: U512,
    pub stcspr_minted: U256,
}

#[odra::event]
pub struct UnstakeRequested {
    pub staker: Address,
    pub request_id: u64,
    pub stcspr_amount: U256,
    pub cspr_amount: U512,
}

#[odra::event]
pub struct Claimed {
    pub staker: Address,
    pub request_id: u64,
    pub cspr_amount: U512,
}

#[odra::event]
pub struct RewardsHarvested {
    pub amount: U512,
    pub new_exchange_rate: U512,
}

#[odra::event]
pub struct ValidatorAdded {
    pub validator: PublicKey,
}

#[odra::event]
pub struct ValidatorRemoved {
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

#[odra::event]
pub struct AdminDelegated {
    pub validator: PublicKey,
    pub amount: U512,
}

#[odra::event]
pub struct AdminUndelegated {
    pub validator: PublicKey,
    pub amount: U512,
}

#[odra::event]
pub struct LiquidityAdded {
    pub amount: U512,
}

// ============================================================================
// WITHDRAWAL REQUEST
// ============================================================================

/// Stored withdrawal request - we don't return it from public functions
/// to avoid needing complex trait implementations
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct WithdrawalRequest {
    pub staker: Address,
    pub cspr_amount: U512,
    pub request_block: u64,
    pub claimed: bool,
}

impl odra::casper_types::bytesrepr::ToBytes for WithdrawalRequest {
    fn to_bytes(&self) -> Result<Vec<u8>, odra::casper_types::bytesrepr::Error> {
        let mut result = Vec::new();
        result.append(&mut self.staker.to_bytes()?);
        result.append(&mut self.cspr_amount.to_bytes()?);
        result.append(&mut self.request_block.to_bytes()?);
        result.append(&mut self.claimed.to_bytes()?);
        Ok(result)
    }
    fn serialized_length(&self) -> usize {
        self.staker.serialized_length()
            + self.cspr_amount.serialized_length()
            + self.request_block.serialized_length()
            + self.claimed.serialized_length()
    }
}

impl odra::casper_types::bytesrepr::FromBytes for WithdrawalRequest {
    fn from_bytes(bytes: &[u8]) -> Result<(Self, &[u8]), odra::casper_types::bytesrepr::Error> {
        let (staker, remainder) = Address::from_bytes(bytes)?;
        let (cspr_amount, remainder) = U512::from_bytes(remainder)?;
        let (request_block, remainder) = u64::from_bytes(remainder)?;
        let (claimed, remainder) = bool::from_bytes(remainder)?;
        Ok((
            WithdrawalRequest {
                staker,
                cspr_amount,
                request_block,
                claimed,
            },
            remainder,
        ))
    }
}

impl odra::casper_types::CLTyped for WithdrawalRequest {
    fn cl_type() -> odra::casper_types::CLType {
        odra::casper_types::CLType::Any
    }
}

// ============================================================================
// STAKEVUE CONTRACT V21 - Hybrid Architecture
// ============================================================================
// Features:
// - Multi-validator support (user chooses validator)
// - Withdrawal queue with 7 era unbonding
// - Harvest rewards function for auto-compounding
// - Exchange rate mechanism
// - V21: Hybrid architecture (Direct + Pool)
//   * stake() >= 500 CSPR: Delegates DIRECTLY (like Make/Wise)
//   * stake() < 500 CSPR: Goes to pool, admin batches later
//   * request_unstake(): Burns tokens, creates withdrawal
//   * Admin handles undelegation for claims
// ============================================================================

// Precision for exchange rate calculations (9 decimals like CSPR)
const RATE_PRECISION: u64 = 1_000_000_000;

// Minimum delegation amount (500 CSPR in motes)
const MIN_DELEGATION: u64 = 500_000_000_000;

// Unbonding period in blocks (approximate 7 eras on testnet ~14 hours)
// On mainnet this would be much longer
const UNBONDING_BLOCKS: u64 = 5000;

// Maximum number of validators
const MAX_VALIDATORS: usize = 20;

#[odra::module(events = [Staked, UnstakeRequested, Claimed, RewardsHarvested, ValidatorAdded, ValidatorRemoved, Delegated, Undelegated, AdminDelegated, AdminUndelegated, LiquidityAdded], errors = Error)]
pub struct StakeVue {
    /// Access control
    ownable: SubModule<Ownable>,
    /// Integrated stCSPR CEP-18 token
    token: SubModule<Cep18>,
    /// Total CSPR in pool (staked value, including rewards)
    total_cspr_pool: Var<U512>,
    /// Available liquidity in contract (not delegated, can be used for claims)
    available_liquidity: Var<U512>,
    /// Total pending withdrawals (requested but not yet claimed)
    pending_withdrawals: Var<U512>,
    /// Total pending undelegations (requested, waiting for admin to undelegate)
    pending_undelegations: Var<U512>,
    /// Approved validators (index -> pubkey)
    validators: Mapping<u8, PublicKey>,
    /// Number of validators
    validator_count: Var<u8>,
    /// Validator active status
    validator_active: Mapping<PublicKey, bool>,
    /// Amount delegated per validator (actual on-chain delegation)
    validator_delegated: Mapping<PublicKey, U512>,
    /// Withdrawal requests (id -> request)
    withdrawal_requests: Mapping<u64, WithdrawalRequest>,
    /// Next withdrawal request ID
    next_request_id: Var<u64>,
    /// User's withdrawal request IDs (staker -> index -> request_id)
    user_requests: Mapping<(Address, u64), u64>,
    /// User's request count
    user_request_count: Mapping<Address, u64>,
}

#[odra::module]
impl StakeVue {
    /// Initialize the contract
    pub fn init(&mut self, owner: Address) {
        self.ownable.init(owner);
        self.total_cspr_pool.set(U512::zero());
        self.available_liquidity.set(U512::zero());
        self.pending_withdrawals.set(U512::zero());
        self.pending_undelegations.set(U512::zero());
        self.validator_count.set(0);
        self.next_request_id.set(1);

        // Initialize the integrated stCSPR token
        self.token.init(
            String::from("stCSPR"),
            String::from("Staked CSPR"),
            9,
            U256::zero(),
        );
    }

    // ========================================================================
    // STAKING FUNCTIONS (V21 - Hybrid: Direct + Pool)
    // ========================================================================

    /// Stake CSPR and receive stCSPR tokens
    ///
    /// V21 Hybrid:
    /// - >= 500 CSPR: Delegates DIRECTLY to validator (like Make/Wise)
    /// - < 500 CSPR: Goes to pool (admin delegates later)
    #[odra(payable)]
    pub fn stake(&mut self, validator: PublicKey) {
        let staker = self.env().caller();
        let cspr_amount = self.env().attached_value();

        if cspr_amount == U512::zero() {
            self.env().revert(Error::ZeroAmount);
        }

        // Check validator is approved
        if !self.validator_active.get(&validator).unwrap_or(false) {
            self.env().revert(Error::ValidatorNotApproved);
        }

        // Calculate stCSPR to mint based on exchange rate
        let stcspr_to_mint = self.cspr_to_stcspr(cspr_amount);

        // Mint stCSPR tokens to staker
        self.token.raw_mint(&staker, &stcspr_to_mint);

        // Add CSPR to total pool (represents total staked value)
        let pool = self.total_cspr_pool.get_or_default();
        self.total_cspr_pool.set(pool + cspr_amount);

        // V21: Check if we can delegate directly
        let current_delegated = self.validator_delegated.get(&validator).unwrap_or(U512::zero());
        let can_delegate_directly = cspr_amount >= U512::from(MIN_DELEGATION) || current_delegated > U512::zero();

        if can_delegate_directly {
            // Direct delegation (like Make/Wise) - 1 transaction!
            // Update validator delegated amount
            self.validator_delegated.set(&validator, current_delegated + cspr_amount);

            // Delegate to auction contract
            #[cfg(not(test))]
            {
                self.env().delegate(validator.clone(), cspr_amount);
            }

            self.env().emit_event(Delegated {
                validator: validator.clone(),
                amount: cspr_amount,
            });
        } else {
            // Small stake: add to pool (admin delegates later when pool >= 500)
            let liquidity = self.available_liquidity.get_or_default();
            self.available_liquidity.set(liquidity + cspr_amount);
        }

        self.env().emit_event(Staked {
            staker,
            validator,
            cspr_amount,
            stcspr_minted: stcspr_to_mint,
        });
    }

    /// Request unstake: burn stCSPR and queue withdrawal
    ///
    /// V20: Burns tokens and creates withdrawal request.
    /// NO direct undelegate call - admin handles that separately.
    /// User can claim when liquidity is available in the pool.
    pub fn request_unstake(&mut self, stcspr_amount: U256) -> u64 {
        let staker = self.env().caller();

        if stcspr_amount == U256::zero() {
            self.env().revert(Error::ZeroAmount);
        }

        // Check staker's stCSPR balance
        let staker_balance = self.token.balance_of(&staker);
        if stcspr_amount > staker_balance {
            self.env().revert(Error::InsufficientStCsprBalance);
        }

        // Calculate CSPR value
        let cspr_to_return = self.stcspr_to_cspr(stcspr_amount);

        // Check total pool has enough
        let pool = self.total_cspr_pool.get_or_default();
        if cspr_to_return > pool {
            self.env().revert(Error::InsufficientPoolBalance);
        }

        // Burn stCSPR tokens
        self.token.raw_burn(&staker, &stcspr_amount);

        // Update total pool
        self.total_cspr_pool.set(pool - cspr_to_return);

        // Add to pending withdrawals
        let pending = self.pending_withdrawals.get_or_default();
        self.pending_withdrawals.set(pending + cspr_to_return);

        // Add to pending undelegations (admin needs to undelegate this amount)
        let pending_undel = self.pending_undelegations.get_or_default();
        self.pending_undelegations.set(pending_undel + cspr_to_return);

        // Create withdrawal request
        let request_id = self.next_request_id.get_or_default();
        self.next_request_id.set(request_id + 1);

        let request = WithdrawalRequest {
            staker,
            cspr_amount: cspr_to_return,
            request_block: self.env().get_block_time(),
            claimed: false,
        };
        self.withdrawal_requests.set(&request_id, request);

        // Track user's requests
        let user_count = self.user_request_count.get(&staker).unwrap_or(0);
        self.user_requests.set(&(staker, user_count), request_id);
        self.user_request_count.set(&staker, user_count + 1);

        // V20: NO direct undelegate here!
        // Admin will call admin_undelegate() to handle auction contract interaction
        // This avoids the purse mismatch error (64658)

        self.env().emit_event(UnstakeRequested {
            staker,
            request_id,
            stcspr_amount,
            cspr_amount: cspr_to_return,
        });

        request_id
    }

    /// Claim a completed withdrawal request
    ///
    /// V20: Transfers from pool liquidity. Requires:
    /// 1. Unbonding period has passed
    /// 2. Pool has enough liquidity (admin must have processed undelegations)
    pub fn claim(&mut self, request_id: u64) {
        let caller = self.env().caller();

        // Get withdrawal request
        let request = self.withdrawal_requests.get(&request_id);
        if request.is_none() {
            self.env().revert(Error::WithdrawalNotFound);
        }
        let mut request = request.unwrap();

        // Check ownership
        if request.staker != caller {
            self.env().revert(Error::NotWithdrawalOwner);
        }

        // Check not already claimed
        if request.claimed {
            self.env().revert(Error::WithdrawalAlreadyClaimed);
        }

        // Check unbonding period has passed
        let current_block = self.env().get_block_time();
        if current_block < request.request_block + UNBONDING_BLOCKS {
            self.env().revert(Error::WithdrawalNotReady);
        }

        // V20: Check pool has enough liquidity
        let liquidity = self.available_liquidity.get_or_default();
        if request.cspr_amount > liquidity {
            self.env().revert(Error::InsufficientLiquidity);
        }

        // Mark as claimed
        request.claimed = true;
        self.withdrawal_requests.set(&request_id, request.clone());

        // Remove from pending withdrawals
        let pending = self.pending_withdrawals.get_or_default();
        self.pending_withdrawals.set(pending - request.cspr_amount);

        // Reduce available liquidity
        self.available_liquidity.set(liquidity - request.cspr_amount);

        // Transfer CSPR to staker from pool
        self.env().transfer_tokens(&caller, &request.cspr_amount);

        self.env().emit_event(Claimed {
            staker: caller,
            request_id,
            cspr_amount: request.cspr_amount,
        });
    }

    // ========================================================================
    // EXCHANGE RATE FUNCTIONS
    // ========================================================================

    /// Get current exchange rate (with 9 decimal precision)
    pub fn get_exchange_rate(&self) -> U512 {
        let total_cspr = self.total_cspr_pool.get_or_default();
        let total_stcspr = self.token.total_supply();

        if total_stcspr == U256::zero() {
            return U512::from(RATE_PRECISION);
        }

        let precision = U512::from(RATE_PRECISION);
        let total_stcspr_512 = u256_to_u512(total_stcspr);

        (total_cspr * precision) / total_stcspr_512
    }

    fn cspr_to_stcspr(&self, cspr_amount: U512) -> U256 {
        let total_cspr = self.total_cspr_pool.get_or_default();
        let total_stcspr = self.token.total_supply();

        if total_stcspr == U256::zero() || total_cspr == U512::zero() {
            return u512_to_u256(cspr_amount);
        }

        let total_stcspr_512 = u256_to_u512(total_stcspr);
        let result = (cspr_amount * total_stcspr_512) / total_cspr;
        u512_to_u256(result)
    }

    fn stcspr_to_cspr(&self, stcspr_amount: U256) -> U512 {
        let total_cspr = self.total_cspr_pool.get_or_default();
        let total_stcspr = self.token.total_supply();

        if total_stcspr == U256::zero() {
            return U512::zero();
        }

        let stcspr_512 = u256_to_u512(stcspr_amount);
        let total_stcspr_512 = u256_to_u512(total_stcspr);

        (stcspr_512 * total_cspr) / total_stcspr_512
    }

    // ========================================================================
    // ADMIN FUNCTIONS (V20 - Pool Management)
    // ========================================================================

    /// Delegate pool funds to a validator (owner only)
    ///
    /// V20: Admin controls when to delegate. Takes CSPR from available_liquidity
    /// and delegates to the specified validator.
    pub fn admin_delegate(&mut self, validator: PublicKey, amount: U512) {
        self.ownable.assert_owner(&self.env().caller());

        if amount == U512::zero() {
            self.env().revert(Error::ZeroAmount);
        }

        // Check validator is approved
        if !self.validator_active.get(&validator).unwrap_or(false) {
            self.env().revert(Error::ValidatorNotApproved);
        }

        // Check we have enough liquidity to delegate
        let liquidity = self.available_liquidity.get_or_default();
        if amount > liquidity {
            self.env().revert(Error::InsufficientLiquidity);
        }

        // Check minimum delegation requirement
        let current_delegated = self.validator_delegated.get(&validator).unwrap_or(U512::zero());
        if current_delegated == U512::zero() && amount < U512::from(MIN_DELEGATION) {
            self.env().revert(Error::BelowMinimumDelegation);
        }

        // Reduce available liquidity
        self.available_liquidity.set(liquidity - amount);

        // Update validator delegated amount
        self.validator_delegated.set(&validator, current_delegated + amount);

        // Actually delegate to auction contract
        #[cfg(not(test))]
        {
            self.env().delegate(validator.clone(), amount);
        }

        self.env().emit_event(AdminDelegated {
            validator,
            amount,
        });
    }

    /// Undelegate from a validator (owner only)
    ///
    /// V20: Admin calls this to undelegate. After unbonding period,
    /// call admin_add_liquidity() to add the returned CSPR to the pool.
    pub fn admin_undelegate(&mut self, validator: PublicKey, amount: U512) {
        self.ownable.assert_owner(&self.env().caller());

        if amount == U512::zero() {
            self.env().revert(Error::ZeroAmount);
        }

        // Check validator has enough delegated
        let delegated = self.validator_delegated.get(&validator).unwrap_or(U512::zero());
        if amount > delegated {
            self.env().revert(Error::UndelegateAmountExceedsDelegation);
        }

        // Update validator delegated amount
        self.validator_delegated.set(&validator, delegated - amount);

        // Reduce pending undelegations (this amount is now being processed)
        let pending_undel = self.pending_undelegations.get_or_default();
        if amount <= pending_undel {
            self.pending_undelegations.set(pending_undel - amount);
        } else {
            self.pending_undelegations.set(U512::zero());
        }

        // Actually undelegate from auction contract
        #[cfg(not(test))]
        {
            self.env().undelegate(validator.clone(), amount);
        }

        self.env().emit_event(AdminUndelegated {
            validator,
            amount,
        });
    }

    /// Add liquidity to the pool (owner only)
    ///
    /// V20: After unbonding completes, admin calls this to add the
    /// returned CSPR back to available_liquidity for claims.
    #[odra(payable)]
    pub fn admin_add_liquidity(&mut self) {
        self.ownable.assert_owner(&self.env().caller());

        let amount = self.env().attached_value();
        if amount == U512::zero() {
            self.env().revert(Error::ZeroAmount);
        }

        // Add to available liquidity
        let liquidity = self.available_liquidity.get_or_default();
        self.available_liquidity.set(liquidity + amount);

        self.env().emit_event(LiquidityAdded { amount });
    }

    /// Add a validator to the approved list (owner only)
    pub fn add_validator(&mut self, validator: PublicKey) {
        self.ownable.assert_owner(&self.env().caller());

        // Check not already active
        if self.validator_active.get(&validator).unwrap_or(false) {
            self.env().revert(Error::ValidatorAlreadyExists);
        }

        // Check max validators
        let count = self.validator_count.get_or_default();
        if count as usize >= MAX_VALIDATORS {
            self.env().revert(Error::MaxValidatorsReached);
        }

        // Add validator
        self.validators.set(&count, validator.clone());
        self.validator_active.set(&validator, true);
        self.validator_delegated.set(&validator, U512::zero());
        self.validator_count.set(count + 1);

        self.env().emit_event(ValidatorAdded { validator });
    }

    /// Remove a validator from the approved list (owner only)
    /// Note: Does not affect existing delegations
    pub fn remove_validator(&mut self, validator: PublicKey) {
        self.ownable.assert_owner(&self.env().caller());
        self.validator_active.set(&validator, false);
        self.env().emit_event(ValidatorRemoved { validator });
    }

    /// Harvest rewards and add to pool (owner only)
    /// This increases the exchange rate
    #[odra(payable)]
    pub fn harvest_rewards(&mut self) {
        self.ownable.assert_owner(&self.env().caller());

        let reward_amount = self.env().attached_value();
        if reward_amount == U512::zero() {
            self.env().revert(Error::ZeroAmount);
        }

        let pool = self.total_cspr_pool.get_or_default();
        self.total_cspr_pool.set(pool + reward_amount);

        let new_rate = self.get_exchange_rate();
        self.env().emit_event(RewardsHarvested {
            amount: reward_amount,
            new_exchange_rate: new_rate,
        });
    }

    /// Transfer ownership (owner only)
    pub fn transfer_ownership(&mut self, new_owner: Address) {
        self.ownable.transfer_ownership(&new_owner);
    }

    // ========================================================================
    // VIEW FUNCTIONS
    // ========================================================================

    /// Get stCSPR balance of an address
    pub fn get_stcspr_balance(&self, account: Address) -> U256 {
        self.token.balance_of(&account)
    }

    /// Get CSPR value of stCSPR balance
    pub fn get_cspr_value(&self, account: Address) -> U512 {
        let stcspr_balance = self.token.balance_of(&account);
        self.stcspr_to_cspr(stcspr_balance)
    }

    /// Get total CSPR in pool
    pub fn get_total_pool(&self) -> U512 {
        self.total_cspr_pool.get_or_default()
    }

    /// Get total pending withdrawals
    pub fn get_pending_withdrawals(&self) -> U512 {
        self.pending_withdrawals.get_or_default()
    }

    /// Get available liquidity (V20)
    /// This is CSPR in the contract that can be used for claims
    pub fn get_available_liquidity(&self) -> U512 {
        self.available_liquidity.get_or_default()
    }

    /// Get pending undelegations (V20)
    /// Amount that needs to be undelegated by admin
    pub fn get_pending_undelegations(&self) -> U512 {
        self.pending_undelegations.get_or_default()
    }

    /// Get contract owner
    pub fn get_owner(&self) -> Address {
        self.ownable.get_owner()
    }

    /// Get number of validators
    pub fn get_validator_count(&self) -> u8 {
        self.validator_count.get_or_default()
    }

    /// Get validator by index
    pub fn get_validator(&self, index: u8) -> Option<PublicKey> {
        self.validators.get(&index)
    }

    /// Check if validator is approved
    pub fn is_validator_active(&self, validator: PublicKey) -> bool {
        self.validator_active.get(&validator).unwrap_or(false)
    }

    /// Get amount delegated to a validator
    pub fn get_delegated_to_validator(&self, validator: PublicKey) -> U512 {
        self.validator_delegated.get(&validator).unwrap_or(U512::zero())
    }

    /// Get withdrawal request CSPR amount by ID
    pub fn get_withdrawal_amount(&self, request_id: u64) -> U512 {
        match self.withdrawal_requests.get(&request_id) {
            Some(request) => request.cspr_amount,
            None => U512::zero(),
        }
    }

    /// Get withdrawal request staker by ID
    pub fn get_withdrawal_staker(&self, request_id: u64) -> Option<Address> {
        self.withdrawal_requests.get(&request_id).map(|r| r.staker)
    }

    /// Check if withdrawal is claimed
    pub fn is_withdrawal_claimed(&self, request_id: u64) -> bool {
        match self.withdrawal_requests.get(&request_id) {
            Some(request) => request.claimed,
            None => false,
        }
    }

    /// Get number of withdrawal requests for a user
    pub fn get_user_request_count(&self, user: Address) -> u64 {
        self.user_request_count.get(&user).unwrap_or(0)
    }

    /// Get user's withdrawal request ID by index
    pub fn get_user_request_id(&self, user: Address, index: u64) -> Option<u64> {
        self.user_requests.get(&(user, index))
    }

    /// Check if withdrawal is ready to claim
    pub fn is_withdrawal_ready(&self, request_id: u64) -> bool {
        match self.withdrawal_requests.get(&request_id) {
            Some(request) => {
                !request.claimed &&
                self.env().get_block_time() >= request.request_block + UNBONDING_BLOCKS
            }
            None => false,
        }
    }

    /// Get token info
    pub fn token_name(&self) -> String {
        self.token.name()
    }

    pub fn token_symbol(&self) -> String {
        self.token.symbol()
    }

    pub fn token_total_supply(&self) -> U256 {
        self.token.total_supply()
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

    // Valid Ed25519 test public keys (32 bytes)
    fn test_validator() -> PublicKey {
        // Use a valid 32-byte Ed25519 public key
        let mut bytes = [0u8; 32];
        bytes[0] = 0x01;
        bytes[31] = 0x01;
        PublicKey::ed25519_from_bytes(bytes).unwrap()
    }

    fn test_validator2() -> PublicKey {
        // Second valid 32-byte Ed25519 public key
        let mut bytes = [0u8; 32];
        bytes[0] = 0x02;
        bytes[31] = 0x02;
        PublicKey::ed25519_from_bytes(bytes).unwrap()
    }

    fn unapproved_validator() -> PublicKey {
        // Third valid 32-byte Ed25519 public key (not approved)
        let mut bytes = [0u8; 32];
        bytes[0] = 0x03;
        bytes[31] = 0x03;
        PublicKey::ed25519_from_bytes(bytes).unwrap()
    }

    fn setup() -> (odra::host::HostEnv, StakeVueHostRef) {
        let env = odra_test::env();
        let owner = env.get_account(0);
        let mut contract = StakeVue::deploy(&env, StakeVueInitArgs { owner });

        // Add test validator
        env.set_caller(owner);
        contract.add_validator(test_validator());

        (env, contract)
    }

    #[test]
    fn test_initial_state() {
        let (_env, contract) = setup();
        assert_eq!(contract.get_exchange_rate(), U512::from(RATE_PRECISION));
        assert_eq!(contract.get_validator_count(), 1);
        assert!(contract.is_validator_active(test_validator()));
    }

    #[test]
    fn test_add_multiple_validators() {
        let (env, mut contract) = setup();
        let owner = env.get_account(0);
        env.set_caller(owner);

        contract.add_validator(test_validator2());

        assert_eq!(contract.get_validator_count(), 2);
        assert!(contract.is_validator_active(test_validator()));
        assert!(contract.is_validator_active(test_validator2()));
    }

    #[test]
    fn test_stake_to_validator() {
        let (env, mut contract) = setup();
        let staker = env.get_account(1);
        env.set_caller(staker);

        let stake_amount = U512::from(MIN_DELEGATION);
        contract.with_tokens(stake_amount).stake(test_validator());

        // V21: stake >= 500 CSPR delegates directly (in test mode, delegate is no-op)
        assert_eq!(contract.get_stcspr_balance(staker), U256::from(MIN_DELEGATION));
        assert_eq!(contract.get_total_pool(), stake_amount);
        // V21: liquidity is 0 because it was delegated directly
        assert_eq!(contract.get_available_liquidity(), U512::zero());
        // V21: Validator has the delegation (tracked internally)
        assert_eq!(contract.get_delegated_to_validator(test_validator()), stake_amount);
    }

    #[test]
    fn test_stake_to_multiple_validators() {
        let (env, mut contract) = setup();
        let owner = env.get_account(0);
        let staker = env.get_account(1);

        // Add second validator
        env.set_caller(owner);
        contract.add_validator(test_validator2());

        // Stake >= 500 CSPR to each validator
        env.set_caller(staker);
        contract.with_tokens(U512::from(MIN_DELEGATION)).stake(test_validator());
        contract.with_tokens(U512::from(MIN_DELEGATION)).stake(test_validator2());

        // V21: both stakes are delegated directly
        assert_eq!(contract.get_stcspr_balance(staker), U256::from(MIN_DELEGATION * 2));
        // V21: liquidity is 0 because both were delegated
        assert_eq!(contract.get_available_liquidity(), U512::zero());
        // V21: Each validator has their delegation
        assert_eq!(contract.get_delegated_to_validator(test_validator()), U512::from(MIN_DELEGATION));
        assert_eq!(contract.get_delegated_to_validator(test_validator2()), U512::from(MIN_DELEGATION));
    }

    #[test]
    fn test_admin_delegate() {
        let (env, mut contract) = setup();
        let owner = env.get_account(0);
        let staker = env.get_account(1);

        // V21: User stakes small amount (goes to pool)
        env.set_caller(staker);
        contract.with_tokens(U512::from(100_000_000_000u64)).stake(test_validator());
        contract.with_tokens(U512::from(100_000_000_000u64)).stake(test_validator());
        contract.with_tokens(U512::from(100_000_000_000u64)).stake(test_validator());
        contract.with_tokens(U512::from(100_000_000_000u64)).stake(test_validator());
        contract.with_tokens(U512::from(100_000_000_000u64)).stake(test_validator());

        // Pool now has 500 CSPR in liquidity
        assert_eq!(contract.get_available_liquidity(), U512::from(MIN_DELEGATION));

        // Admin delegates pool to validator
        env.set_caller(owner);
        contract.admin_delegate(test_validator(), U512::from(MIN_DELEGATION));

        // Now validator has delegation, liquidity is 0
        assert_eq!(contract.get_delegated_to_validator(test_validator()), U512::from(MIN_DELEGATION));
        assert_eq!(contract.get_available_liquidity(), U512::zero());
    }

    #[test]
    #[should_panic(expected = "ValidatorNotApproved")]
    fn test_stake_to_unapproved_validator_fails() {
        let (env, contract) = setup();
        env.set_caller(env.get_account(1));
        contract.with_tokens(U512::from(MIN_DELEGATION)).stake(unapproved_validator());
    }

    #[test]
    fn test_request_unstake() {
        let (env, mut contract) = setup();
        let staker = env.get_account(1);
        env.set_caller(staker);

        // Stake first
        contract.with_tokens(U512::from(MIN_DELEGATION)).stake(test_validator());

        // Request unstake (V20: no validator param needed)
        let request_id = contract.request_unstake(U256::from(MIN_DELEGATION));

        assert_eq!(request_id, 1);
        assert_eq!(contract.get_stcspr_balance(staker), U256::zero());
        assert_eq!(contract.get_pending_withdrawals(), U512::from(MIN_DELEGATION));
        assert_eq!(contract.get_pending_undelegations(), U512::from(MIN_DELEGATION));
        assert_eq!(contract.get_user_request_count(staker), 1);
    }

    #[test]
    fn test_admin_undelegate() {
        let (env, mut contract) = setup();
        let owner = env.get_account(0);
        let staker = env.get_account(1);

        // V21: User stakes >= 500 CSPR (delegated directly)
        env.set_caller(staker);
        contract.with_tokens(U512::from(MIN_DELEGATION)).stake(test_validator());

        // V21: Validator already has delegation from direct stake
        assert_eq!(contract.get_delegated_to_validator(test_validator()), U512::from(MIN_DELEGATION));

        // User requests unstake
        env.set_caller(staker);
        contract.request_unstake(U256::from(MIN_DELEGATION));

        // Admin undelegates
        env.set_caller(owner);
        contract.admin_undelegate(test_validator(), U512::from(MIN_DELEGATION));

        assert_eq!(contract.get_delegated_to_validator(test_validator()), U512::zero());
        assert_eq!(contract.get_pending_undelegations(), U512::zero());
    }

    #[test]
    fn test_harvest_rewards() {
        let (env, mut contract) = setup();
        let owner = env.get_account(0);
        let staker = env.get_account(1);

        // Stake
        env.set_caller(staker);
        contract.with_tokens(U512::from(1000_000_000_000u64)).stake(test_validator());

        // Harvest rewards
        env.set_caller(owner);
        contract.with_tokens(U512::from(100_000_000_000u64)).harvest_rewards();

        // Exchange rate should increase
        assert_eq!(contract.get_total_pool(), U512::from(1100_000_000_000u64));
        // Rate = 1100/1000 * 1e9 = 1.1e9
        assert_eq!(contract.get_exchange_rate(), U512::from(1_100_000_000u64));
    }

    #[test]
    #[should_panic(expected = "BelowMinimumDelegation")]
    fn test_admin_delegate_below_minimum_fails() {
        let (env, mut contract) = setup();
        let owner = env.get_account(0);
        let staker = env.get_account(1);

        // User stakes (any amount is ok in V20)
        env.set_caller(staker);
        contract.with_tokens(U512::from(100_000_000_000u64)).stake(test_validator());

        // Admin tries to delegate below minimum - should fail
        env.set_caller(owner);
        contract.admin_delegate(test_validator(), U512::from(100_000_000_000u64));
    }

    #[test]
    fn test_stake_any_amount_succeeds() {
        let (env, mut contract) = setup();
        let staker = env.get_account(1);
        env.set_caller(staker);

        // V20: stake accepts any amount (minimum is checked on admin_delegate)
        contract.with_tokens(U512::from(100_000_000_000u64)).stake(test_validator());
        contract.with_tokens(U512::from(100_000_000_000u64)).stake(test_validator());

        assert_eq!(contract.get_stcspr_balance(staker), U256::from(200_000_000_000u64));
        assert_eq!(contract.get_available_liquidity(), U512::from(200_000_000_000u64));
    }

    #[test]
    fn test_remove_validator() {
        let (env, mut contract) = setup();
        let owner = env.get_account(0);
        env.set_caller(owner);

        contract.remove_validator(test_validator());
        assert!(!contract.is_validator_active(test_validator()));
    }
}
