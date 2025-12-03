#![no_std]
#![no_main]

#[cfg(not(target_arch = "wasm32"))]
compile_error!("target arch should be wasm32: compile with '--target wasm32-unknown-unknown'");

extern crate alloc;

use alloc::{
    boxed::Box,
    format,
    string::{String, ToString},
    vec,
    vec::Vec,
};

use casper_contract::{
    contract_api::{runtime, storage, system, account},
    unwrap_or_revert::UnwrapOrRevert,
};

use casper_types::{
    addressable_entity::{EntityEntryPoint as EntryPoint, EntryPoints, Parameter},
    api_error::ApiError,
    contracts::NamedKeys,
    CLType, CLValue, EntryPointAccess, EntryPointPayment, EntryPointType, URef, U512,
    account::AccountHash,
    PublicKey, AsymmetricType,
};

/// Constants
const CONTRACT_PACKAGE_NAME: &str = "stakevue_liquid_staking";
const CONTRACT_ACCESS_UREF: &str = "stakevue_access";
const CONTRACT_KEY: &str = "stakevue_contract";
const TOTAL_STAKED_KEY: &str = "total_staked";
const STAKED_AMOUNT_KEY: &str = "amount";

// stCSPR Token - V3.0
const STCSPR_TOTAL_SUPPLY_KEY: &str = "stcspr_total_supply";
const STCSPR_TOKEN_NAME: &str = "StakeVue Staked CSPR";
const STCSPR_TOKEN_SYMBOL: &str = "stCSPR";

// APY Configuration - 10% annual return
const APY_PERCENTAGE: u64 = 10;

// V6.0: Real CSPR transfers - Contract purse for holding staked CSPR
const CONTRACT_PURSE_KEY: &str = "contract_purse";

// V4.0: Multi-Validator Liquid Staking Architecture
// This contract implements a sophisticated liquid staking system with:
// - Multi-validator support with round-robin distribution
// - Admin-managed validator list (add/remove validators)
// - Per-validator stake tracking for balanced distribution
// - Liquid stCSPR tokens representing staked positions
// Note: Actual delegation to Casper validators happens externally.
// Users can delegate to recommended validators shown in get_validators().
const ADMIN_KEY: &str = "admin";                        // Admin account
const VALIDATORS_LIST_KEY: &str = "validators_list";    // Vec<PublicKey> of active validators
const TOTAL_VALIDATORS_KEY: &str = "total_validators";  // u32 count of validators
const NEXT_VALIDATOR_INDEX_KEY: &str = "next_validator_index"; // Round-robin index
const MAX_VALIDATORS: u32 = 10;                         // Maximum validators allowed
const MIN_STAKE_AMOUNT: u64 = 500_000_000_000;          // 500 CSPR minimum stake

/// Helper function to get user stake key
fn get_user_stake_key(account: &AccountHash) -> String {
    format!("user_stake_{}", account)
}

/// Helper function to get user timestamp key
fn get_user_timestamp_key(account: &AccountHash) -> String {
    format!("user_timestamp_{}", account)
}

/// Helper function to get user stCSPR balance key (V3.0)
fn get_stcspr_balance_key(account: &AccountHash) -> String {
    format!("stcspr_balance_{}", account)
}

/// V4.0: Helper function to get validator stake key
fn get_validator_stake_key(validator: &PublicKey) -> String {
    format!("validator_stake_{}", validator.to_hex())
}

/// V6.0: Helper function to get the contract's purse
fn get_contract_purse() -> URef {
    runtime::get_key(CONTRACT_PURSE_KEY)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant)
}


/// V4.0: Get the admin account
fn get_admin() -> AccountHash {
    let admin_uref: URef = runtime::get_key(ADMIN_KEY)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);

    storage::read(admin_uref)
        .unwrap_or_revert_with(ApiError::Read)
        .unwrap_or_revert_with(ApiError::ValueNotFound)
}

/// V4.0: Check if caller is admin
fn require_admin() {
    let caller = runtime::get_caller();
    let admin = get_admin();
    if caller != admin {
        runtime::revert(ApiError::User(200)); // Not authorized (admin only)
    }
}

/// V4.0: Get the list of active validators
fn get_validators_list() -> Vec<PublicKey> {
    let validators_uref: URef = runtime::get_key(VALIDATORS_LIST_KEY)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);

    storage::read(validators_uref)
        .unwrap_or_revert_with(ApiError::Read)
        .unwrap_or(Vec::new())
}

/// V4.0: Get next validator using round-robin strategy
fn get_next_validator() -> PublicKey {
    let validators = get_validators_list();

    if validators.is_empty() {
        runtime::revert(ApiError::User(201)); // No validators available
    }

    // Get current index
    let index_uref: URef = runtime::get_key(NEXT_VALIDATOR_INDEX_KEY)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);

    let current_index: u32 = storage::read(index_uref)
        .unwrap_or_revert_with(ApiError::Read)
        .unwrap_or(0);

    // Get validator at current index
    let validator_index = (current_index as usize) % validators.len();
    let selected_validator = validators[validator_index].clone();

    // Update index for next call (round-robin)
    let next_index = (current_index + 1) % (validators.len() as u32);
    storage::write(index_uref, next_index);

    selected_validator
}

/// V4.0: Track validator stake internally
/// This updates our internal tracking when a user stakes
fn track_validator_stake(validator: PublicKey, amount: U512) {
    let validator_stake_key = get_validator_stake_key(&validator);
    let current_validator_stake: U512 = runtime::get_key(&validator_stake_key)
        .and_then(|key| key.into_uref())
        .and_then(|uref| storage::read(uref).unwrap_or(None))
        .unwrap_or(U512::zero());

    // V5.0 Security Fix: Use checked addition to prevent overflow
    let new_validator_stake = current_validator_stake.checked_add(amount)
        .unwrap_or_revert_with(ApiError::User(210)); // Arithmetic overflow
    let validator_stake_uref = storage::new_uref(new_validator_stake);
    runtime::put_key(&validator_stake_key, validator_stake_uref.into());
}

/// V4.0: Untrack validator stake internally
/// This updates our internal tracking when a user unstakes
fn untrack_validator_stake(validator: PublicKey, amount: U512) {
    let validator_stake_key = get_validator_stake_key(&validator);
    let validator_stake_uref: URef = runtime::get_key(&validator_stake_key)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);

    let current_validator_stake: U512 = storage::read(validator_stake_uref)
        .unwrap_or_revert_with(ApiError::Read)
        .unwrap_or_revert_with(ApiError::ValueNotFound);

    // Check if validator has enough stake
    if current_validator_stake < amount {
        runtime::revert(ApiError::User(203)); // Insufficient validator stake
    }

    // V5.0 Security Fix: Use checked subtraction to prevent underflow
    let new_validator_stake = current_validator_stake.checked_sub(amount)
        .unwrap_or_revert_with(ApiError::User(211)); // Arithmetic underflow
    storage::write(validator_stake_uref, new_validator_stake);
}

/// Entry point to stake CSPR
/// V6.1: User must pass their purse as parameter for security
#[no_mangle]
pub extern "C" fn stake() {
    // Get the amount parameter
    let amount: U512 = runtime::get_named_arg(STAKED_AMOUNT_KEY);

    // V6.1: Get source purse from user (passed as parameter)
    let source_purse: URef = runtime::get_named_arg("source_purse");

    // Get caller address
    let caller = runtime::get_caller();

    // V6.1: Transfer CSPR from user's purse to contract purse
    let contract_purse = get_contract_purse();

    system::transfer_from_purse_to_purse(source_purse, contract_purse, amount, None)
        .unwrap_or_revert_with(ApiError::User(220)); // Transfer failed

    // For v2, we track when users staked (block number for simplicity)
    // In production, this would be more sophisticated
    let current_block: u64 = 1; // Simplified for POC

    // Update total staked (global counter)
    let total_uref: URef = runtime::get_key(TOTAL_STAKED_KEY)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);
    storage::add(total_uref, amount);

    // Get or initialize user's current stake
    let user_stake_key = get_user_stake_key(&caller);
    let current_user_stake: U512 = runtime::get_key(&user_stake_key)
        .and_then(|key| key.into_uref())
        .and_then(|uref| storage::read(uref).unwrap_or(None))
        .unwrap_or(U512::zero());

    // Add new stake to user's balance
    // V5.0 Security Fix: Use checked addition to prevent overflow
    let new_user_stake = current_user_stake.checked_add(amount)
        .unwrap_or_revert_with(ApiError::User(210)); // Arithmetic overflow

    // Create or update user stake storage
    let user_stake_uref = storage::new_uref(new_user_stake);
    runtime::put_key(&user_stake_key, user_stake_uref.into());

    // Update user's block number (simplified tracking)
    let user_timestamp_key = get_user_timestamp_key(&caller);
    let timestamp_uref = storage::new_uref(current_block);
    runtime::put_key(&user_timestamp_key, timestamp_uref.into());

    // V3.0: Mint stCSPR tokens (1:1 with staked CSPR)
    let stcspr_balance_key = get_stcspr_balance_key(&caller);
    let current_stcspr_balance: U512 = runtime::get_key(&stcspr_balance_key)
        .and_then(|key| key.into_uref())
        .and_then(|uref| storage::read(uref).unwrap_or(None))
        .unwrap_or(U512::zero());

    // V5.0 Security Fix: Use checked addition to prevent overflow
    let new_stcspr_balance = current_stcspr_balance.checked_add(amount)
        .unwrap_or_revert_with(ApiError::User(210)); // Arithmetic overflow
    let stcspr_balance_uref = storage::new_uref(new_stcspr_balance);
    runtime::put_key(&stcspr_balance_key, stcspr_balance_uref.into());

    // Update stCSPR total supply
    let total_supply_uref: URef = runtime::get_key(STCSPR_TOTAL_SUPPLY_KEY)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);
    storage::add(total_supply_uref, amount);

    // V4.0: Track which validator should receive this stake (round-robin)
    // This maintains balanced distribution across all validators
    let selected_validator = get_next_validator();

    // Update internal tracking for this validator
    track_validator_stake(selected_validator, amount);

    // Note: Users can view recommended validators via get_validators()
    // and delegate manually to maintain their preferred distribution
}

/// Entry point to unstake CSPR
/// V6.1: User must pass their purse as parameter for security
#[no_mangle]
pub extern "C" fn unstake() {
    // Get the amount parameter
    let amount: U512 = runtime::get_named_arg(STAKED_AMOUNT_KEY);

    // V6.1: Get destination purse from user (passed as parameter)
    let dest_purse: URef = runtime::get_named_arg("dest_purse");

    // Get caller address
    let caller = runtime::get_caller();

    // Get user's current stake
    let user_stake_key = get_user_stake_key(&caller);
    let user_stake_uref: URef = runtime::get_key(&user_stake_key)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);

    let current_user_stake: U512 = storage::read(user_stake_uref)
        .unwrap_or_revert_with(ApiError::Read)
        .unwrap_or_revert_with(ApiError::ValueNotFound);

    // Check if user has enough staked
    if current_user_stake < amount {
        runtime::revert(ApiError::User(100)); // Custom error: Insufficient staked amount
    }

    // V6.1: Transfer CSPR from contract purse to user's purse
    let contract_purse = get_contract_purse();

    system::transfer_from_purse_to_purse(contract_purse, dest_purse, amount, None)
        .unwrap_or_revert_with(ApiError::User(221)); // Transfer back failed

    // Update user's stake
    // V5.0 Security Fix: Use checked subtraction to prevent underflow
    let new_user_stake = current_user_stake.checked_sub(amount)
        .unwrap_or_revert_with(ApiError::User(211)); // Arithmetic underflow
    storage::write(user_stake_uref, new_user_stake);

    // Update total staked (global counter)
    let total_uref: URef = runtime::get_key(TOTAL_STAKED_KEY)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);

    let current_total: U512 = storage::read(total_uref)
        .unwrap_or_revert_with(ApiError::Read)
        .unwrap_or_revert_with(ApiError::ValueNotFound);

    // V5.0 Security Fix: Use checked subtraction to prevent underflow
    let new_total = current_total.checked_sub(amount)
        .unwrap_or_revert_with(ApiError::User(211)); // Arithmetic underflow
    storage::write(total_uref, new_total);

    // V3.0: Burn stCSPR tokens
    let stcspr_balance_key = get_stcspr_balance_key(&caller);
    let stcspr_balance_uref: URef = runtime::get_key(&stcspr_balance_key)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);

    let current_stcspr_balance: U512 = storage::read(stcspr_balance_uref)
        .unwrap_or_revert_with(ApiError::Read)
        .unwrap_or_revert_with(ApiError::ValueNotFound);

    // Check if user has enough stCSPR to burn
    if current_stcspr_balance < amount {
        runtime::revert(ApiError::User(101)); // Custom error: Insufficient stCSPR balance
    }

    // V5.0 Security Fix: Use checked subtraction to prevent underflow
    let new_stcspr_balance = current_stcspr_balance.checked_sub(amount)
        .unwrap_or_revert_with(ApiError::User(211)); // Arithmetic underflow
    storage::write(stcspr_balance_uref, new_stcspr_balance);

    // Decrease stCSPR total supply
    let total_supply_uref: URef = runtime::get_key(STCSPR_TOTAL_SUPPLY_KEY)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);

    let current_supply: U512 = storage::read(total_supply_uref)
        .unwrap_or_revert_with(ApiError::Read)
        .unwrap_or_revert_with(ApiError::ValueNotFound);

    // V5.0 Security Fix: Use checked subtraction to prevent underflow
    let new_supply = current_supply.checked_sub(amount)
        .unwrap_or_revert_with(ApiError::User(211)); // Arithmetic underflow
    storage::write(total_supply_uref, new_supply);

    // V4.0: Undelegate from a validator via the auction contract
    // Find the validator with the most stake and undelegate from them
    let validators = get_validators_list();

    if !validators.is_empty() {
        // Find validator with most stake
        let mut max_validator = validators[0].clone();
        let mut max_stake = U512::zero();

        for validator in validators.iter() {
            let validator_stake_key = get_validator_stake_key(validator);
            let validator_stake: U512 = runtime::get_key(&validator_stake_key)
                .and_then(|key| key.into_uref())
                .and_then(|uref| storage::read(uref).unwrap_or(None))
                .unwrap_or(U512::zero());

            if validator_stake > max_stake {
                max_stake = validator_stake;
                max_validator = validator.clone();
            }
        }

        // Update internal tracking for the validator with most stake
        untrack_validator_stake(max_validator, amount);
    }
}

/// Entry point to get total staked amount
#[no_mangle]
pub extern "C" fn get_staked_amount() {
    let uref: URef = runtime::get_key(TOTAL_STAKED_KEY)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);

    let result: U512 = storage::read(uref)
        .unwrap_or_revert_with(ApiError::Read)
        .unwrap_or_revert_with(ApiError::ValueNotFound);

    let typed_result = CLValue::from_t(result).unwrap_or_revert();
    runtime::ret(typed_result);
}

/// Entry point to get caller's stake amount
#[no_mangle]
pub extern "C" fn get_my_stake() {
    let caller = runtime::get_caller();
    let user_stake_key = get_user_stake_key(&caller);

    // Get user's stake (default to 0 if not found)
    let user_stake: U512 = runtime::get_key(&user_stake_key)
        .and_then(|key| key.into_uref())
        .and_then(|uref| storage::read(uref).unwrap_or(None))
        .unwrap_or(U512::zero());

    let typed_result = CLValue::from_t(user_stake).unwrap_or_revert();
    runtime::ret(typed_result);
}

/// Entry point to calculate caller's rewards
/// For V2 POC: Returns 10% of staked amount as potential yearly rewards
/// In production, this would be time-based and claim actual rewards from validators
#[no_mangle]
pub extern "C" fn calculate_my_rewards() {
    let caller = runtime::get_caller();
    let user_stake_key = get_user_stake_key(&caller);

    // Get user's stake
    let user_stake: U512 = runtime::get_key(&user_stake_key)
        .and_then(|key| key.into_uref())
        .and_then(|uref| storage::read(uref).unwrap_or(None))
        .unwrap_or(U512::zero());

    // Calculate potential annual rewards: 10% of staked amount
    // This is a simplified POC - production would calculate based on actual time staked
    let stake_u64 = user_stake.as_u64();
    let rewards_raw = stake_u64
        .saturating_mul(APY_PERCENTAGE)
        .saturating_div(100);

    let rewards = U512::from(rewards_raw);

    let typed_result = CLValue::from_t(rewards).unwrap_or_revert();
    runtime::ret(typed_result);
}

/// V3.0: Transfer stCSPR tokens to another account
#[no_mangle]
pub extern "C" fn transfer_stcspr() {
    let recipient: AccountHash = runtime::get_named_arg("recipient");
    let amount: U512 = runtime::get_named_arg(STAKED_AMOUNT_KEY);
    let caller = runtime::get_caller();

    // Get sender's stCSPR balance
    let sender_balance_key = get_stcspr_balance_key(&caller);
    let sender_balance_uref: URef = runtime::get_key(&sender_balance_key)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);

    let sender_balance: U512 = storage::read(sender_balance_uref)
        .unwrap_or_revert_with(ApiError::Read)
        .unwrap_or_revert_with(ApiError::ValueNotFound);

    // Check if sender has enough balance
    if sender_balance < amount {
        runtime::revert(ApiError::User(102)); // Custom error: Insufficient stCSPR for transfer
    }

    // Decrease sender's balance
    // V5.0 Security Fix: Use checked subtraction to prevent underflow
    let new_sender_balance = sender_balance.checked_sub(amount)
        .unwrap_or_revert_with(ApiError::User(211)); // Arithmetic underflow
    storage::write(sender_balance_uref, new_sender_balance);

    // Get or initialize recipient's balance
    let recipient_balance_key = get_stcspr_balance_key(&recipient);
    let current_recipient_balance: U512 = runtime::get_key(&recipient_balance_key)
        .and_then(|key| key.into_uref())
        .and_then(|uref| storage::read(uref).unwrap_or(None))
        .unwrap_or(U512::zero());

    // Increase recipient's balance
    // V5.0 Security Fix: Use checked addition to prevent overflow
    let new_recipient_balance = current_recipient_balance.checked_add(amount)
        .unwrap_or_revert_with(ApiError::User(210)); // Arithmetic overflow
    let recipient_balance_uref = storage::new_uref(new_recipient_balance);
    runtime::put_key(&recipient_balance_key, recipient_balance_uref.into());
}

/// V3.0: Get stCSPR balance of a specific account
#[no_mangle]
pub extern "C" fn balance_of_stcspr() {
    let account: AccountHash = runtime::get_named_arg("account");
    let balance_key = get_stcspr_balance_key(&account);

    // Get account's stCSPR balance (default to 0 if not found)
    let balance: U512 = runtime::get_key(&balance_key)
        .and_then(|key| key.into_uref())
        .and_then(|uref| storage::read(uref).unwrap_or(None))
        .unwrap_or(U512::zero());

    let typed_result = CLValue::from_t(balance).unwrap_or_revert();
    runtime::ret(typed_result);
}

/// V3.0: Get caller's stCSPR balance
#[no_mangle]
pub extern "C" fn my_stcspr_balance() {
    let caller = runtime::get_caller();
    let balance_key = get_stcspr_balance_key(&caller);

    // Get caller's stCSPR balance (default to 0 if not found)
    let balance: U512 = runtime::get_key(&balance_key)
        .and_then(|key| key.into_uref())
        .and_then(|uref| storage::read(uref).unwrap_or(None))
        .unwrap_or(U512::zero());

    let typed_result = CLValue::from_t(balance).unwrap_or_revert();
    runtime::ret(typed_result);
}

/// V3.0: Get total supply of stCSPR tokens
#[no_mangle]
pub extern "C" fn total_supply_stcspr() {
    let total_supply_uref: URef = runtime::get_key(STCSPR_TOTAL_SUPPLY_KEY)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);

    let total_supply: U512 = storage::read(total_supply_uref)
        .unwrap_or_revert_with(ApiError::Read)
        .unwrap_or_revert_with(ApiError::ValueNotFound);

    let typed_result = CLValue::from_t(total_supply).unwrap_or_revert();
    runtime::ret(typed_result);
}

/// V3.0: Get stCSPR token name
#[no_mangle]
pub extern "C" fn token_name() {
    let name = String::from(STCSPR_TOKEN_NAME);
    let typed_result = CLValue::from_t(name).unwrap_or_revert();
    runtime::ret(typed_result);
}

/// V3.0: Get stCSPR token symbol
#[no_mangle]
pub extern "C" fn token_symbol() {
    let symbol = String::from(STCSPR_TOKEN_SYMBOL);
    let typed_result = CLValue::from_t(symbol).unwrap_or_revert();
    runtime::ret(typed_result);
}

/// V3.0: Get stCSPR token decimals (same as CSPR: 9)
#[no_mangle]
pub extern "C" fn decimals() {
    let decimals: u8 = 9;
    let typed_result = CLValue::from_t(decimals).unwrap_or_revert();
    runtime::ret(typed_result);
}

/// V4.0: Add a validator to the list (admin only)
#[no_mangle]
pub extern "C" fn add_validator() {
    require_admin();

    let validator: PublicKey = runtime::get_named_arg("validator");

    // Get current validators list
    let validators_uref: URef = runtime::get_key(VALIDATORS_LIST_KEY)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);

    let mut validators: Vec<PublicKey> = storage::read(validators_uref)
        .unwrap_or_revert_with(ApiError::Read)
        .unwrap_or(Vec::new());

    // Check if validator already exists
    if validators.contains(&validator) {
        runtime::revert(ApiError::User(204)); // Validator already exists
    }

    // Check max validators limit
    if validators.len() >= MAX_VALIDATORS as usize {
        runtime::revert(ApiError::User(205)); // Max validators reached
    }

    // Add validator to list
    validators.push(validator);
    storage::write(validators_uref, validators.clone());

    // Update total validators count
    let total_validators_uref: URef = runtime::get_key(TOTAL_VALIDATORS_KEY)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);

    storage::write(total_validators_uref, validators.len() as u32);
}

/// V4.0: Remove a validator from the list (admin only)
#[no_mangle]
pub extern "C" fn remove_validator() {
    require_admin();

    let validator: PublicKey = runtime::get_named_arg("validator");

    // Get current validators list
    let validators_uref: URef = runtime::get_key(VALIDATORS_LIST_KEY)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);

    let mut validators: Vec<PublicKey> = storage::read(validators_uref)
        .unwrap_or_revert_with(ApiError::Read)
        .unwrap_or(Vec::new());

    // Find and remove validator
    if let Some(pos) = validators.iter().position(|v| v == &validator) {
        validators.remove(pos);
        storage::write(validators_uref, validators.clone());

        // Update total validators count
        let total_validators_uref: URef = runtime::get_key(TOTAL_VALIDATORS_KEY)
            .unwrap_or_revert_with(ApiError::MissingKey)
            .into_uref()
            .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);

        storage::write(total_validators_uref, validators.len() as u32);
    } else {
        runtime::revert(ApiError::User(206)); // Validator not found
    }
}

/// V4.0: Set a new admin (admin only)
#[no_mangle]
pub extern "C" fn set_admin() {
    require_admin();

    let new_admin: AccountHash = runtime::get_named_arg("new_admin");

    let admin_uref: URef = runtime::get_key(ADMIN_KEY)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);

    storage::write(admin_uref, new_admin);
}

/// V4.0: Get list of active validators
#[no_mangle]
pub extern "C" fn get_validators() {
    let validators = get_validators_list();
    let typed_result = CLValue::from_t(validators).unwrap_or_revert();
    runtime::ret(typed_result);
}

/// V4.0: Get stake amount for a specific validator
#[no_mangle]
pub extern "C" fn get_validator_stake() {
    let validator: PublicKey = runtime::get_named_arg("validator");
    let validator_stake_key = get_validator_stake_key(&validator);

    let stake: U512 = runtime::get_key(&validator_stake_key)
        .and_then(|key| key.into_uref())
        .and_then(|uref| storage::read(uref).unwrap_or(None))
        .unwrap_or(U512::zero());

    let typed_result = CLValue::from_t(stake).unwrap_or_revert();
    runtime::ret(typed_result);
}

/// Contract installation entry point
#[no_mangle]
pub extern "C" fn call() {
    // Initialize total staked to 0
    let total_staked_start = storage::new_uref(U512::zero());

    // V3.0: Initialize stCSPR total supply to 0
    let stcspr_total_supply_start = storage::new_uref(U512::zero());

    // V4.0: Initialize multi-validator liquid staking system
    let caller = runtime::get_caller();  // Contract deployer becomes admin
    let admin_start = storage::new_uref(caller);

    let validators_list_start = storage::new_uref(Vec::<PublicKey>::new());
    let total_validators_start = storage::new_uref(0u32);
    let next_validator_index_start = storage::new_uref(0u32);

    // V6.0: Create contract purse to hold staked CSPR
    let contract_purse = system::create_purse();

    // Setup named keys
    let mut contract_named_keys = NamedKeys::new();
    contract_named_keys.insert(String::from(TOTAL_STAKED_KEY), total_staked_start.into());
    contract_named_keys.insert(String::from(STCSPR_TOTAL_SUPPLY_KEY), stcspr_total_supply_start.into());

    // V4.0: Add multi-validator liquid staking named keys
    contract_named_keys.insert(String::from(ADMIN_KEY), admin_start.into());
    contract_named_keys.insert(String::from(VALIDATORS_LIST_KEY), validators_list_start.into());
    contract_named_keys.insert(String::from(TOTAL_VALIDATORS_KEY), total_validators_start.into());
    contract_named_keys.insert(String::from(NEXT_VALIDATOR_INDEX_KEY), next_validator_index_start.into());

    // V6.0: Add contract purse to named keys
    contract_named_keys.insert(String::from(CONTRACT_PURSE_KEY), contract_purse.into());

    // Create entry points
    let mut entry_points = EntryPoints::new();

    // V6.1: stake(amount: U512, source_purse: URef)
    entry_points.add_entry_point(EntryPoint::new(
        "stake",
        vec![
            Parameter::new(STAKED_AMOUNT_KEY, CLType::U512),
            Parameter::new("source_purse", CLType::URef),
        ],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
        EntryPointPayment::Caller,
    ));

    // V6.1: unstake(amount: U512, dest_purse: URef)
    entry_points.add_entry_point(EntryPoint::new(
        "unstake",
        vec![
            Parameter::new(STAKED_AMOUNT_KEY, CLType::U512),
            Parameter::new("dest_purse", CLType::URef),
        ],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
        EntryPointPayment::Caller,
    ));

    // get_staked_amount() -> U512
    entry_points.add_entry_point(EntryPoint::new(
        "get_staked_amount",
        Vec::new(),
        CLType::U512,
        EntryPointAccess::Public,
        EntryPointType::Called,
        EntryPointPayment::Caller,
    ));

    // get_my_stake() -> U512
    entry_points.add_entry_point(EntryPoint::new(
        "get_my_stake",
        Vec::new(),
        CLType::U512,
        EntryPointAccess::Public,
        EntryPointType::Called,
        EntryPointPayment::Caller,
    ));

    // calculate_my_rewards() -> U512
    entry_points.add_entry_point(EntryPoint::new(
        "calculate_my_rewards",
        Vec::new(),
        CLType::U512,
        EntryPointAccess::Public,
        EntryPointType::Called,
        EntryPointPayment::Caller,
    ));

    // V3.0: transfer_stcspr(recipient: AccountHash, amount: U512)
    entry_points.add_entry_point(EntryPoint::new(
        "transfer_stcspr",
        vec![
            Parameter::new("recipient", CLType::Key),
            Parameter::new(STAKED_AMOUNT_KEY, CLType::U512),
        ],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
        EntryPointPayment::Caller,
    ));

    // V3.0: balance_of_stcspr(account: AccountHash) -> U512
    entry_points.add_entry_point(EntryPoint::new(
        "balance_of_stcspr",
        vec![Parameter::new("account", CLType::Key)],
        CLType::U512,
        EntryPointAccess::Public,
        EntryPointType::Called,
        EntryPointPayment::Caller,
    ));

    // V3.0: my_stcspr_balance() -> U512
    entry_points.add_entry_point(EntryPoint::new(
        "my_stcspr_balance",
        Vec::new(),
        CLType::U512,
        EntryPointAccess::Public,
        EntryPointType::Called,
        EntryPointPayment::Caller,
    ));

    // V3.0: total_supply_stcspr() -> U512
    entry_points.add_entry_point(EntryPoint::new(
        "total_supply_stcspr",
        Vec::new(),
        CLType::U512,
        EntryPointAccess::Public,
        EntryPointType::Called,
        EntryPointPayment::Caller,
    ));

    // V3.0: token_name() -> String
    entry_points.add_entry_point(EntryPoint::new(
        "token_name",
        Vec::new(),
        CLType::String,
        EntryPointAccess::Public,
        EntryPointType::Called,
        EntryPointPayment::Caller,
    ));

    // V3.0: token_symbol() -> String
    entry_points.add_entry_point(EntryPoint::new(
        "token_symbol",
        Vec::new(),
        CLType::String,
        EntryPointAccess::Public,
        EntryPointType::Called,
        EntryPointPayment::Caller,
    ));

    // V3.0: decimals() -> U8
    entry_points.add_entry_point(EntryPoint::new(
        "decimals",
        Vec::new(),
        CLType::U8,
        EntryPointAccess::Public,
        EntryPointType::Called,
        EntryPointPayment::Caller,
    ));

    // V4.0: add_validator(validator: PublicKey) - Admin only
    entry_points.add_entry_point(EntryPoint::new(
        "add_validator",
        vec![Parameter::new("validator", CLType::PublicKey)],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
        EntryPointPayment::Caller,
    ));

    // V4.0: remove_validator(validator: PublicKey) - Admin only
    entry_points.add_entry_point(EntryPoint::new(
        "remove_validator",
        vec![Parameter::new("validator", CLType::PublicKey)],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
        EntryPointPayment::Caller,
    ));

    // V4.0: set_admin(new_admin: AccountHash) - Admin only
    entry_points.add_entry_point(EntryPoint::new(
        "set_admin",
        vec![Parameter::new("new_admin", CLType::Key)],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
        EntryPointPayment::Caller,
    ));

    // V4.0: get_validators() -> Vec<PublicKey>
    entry_points.add_entry_point(EntryPoint::new(
        "get_validators",
        Vec::new(),
        CLType::List(Box::new(CLType::PublicKey)),
        EntryPointAccess::Public,
        EntryPointType::Called,
        EntryPointPayment::Caller,
    ));

    // V4.0: get_validator_stake(validator: PublicKey) -> U512
    entry_points.add_entry_point(EntryPoint::new(
        "get_validator_stake",
        vec![Parameter::new("validator", CLType::PublicKey)],
        CLType::U512,
        EntryPointAccess::Public,
        EntryPointType::Called,
        EntryPointPayment::Caller,
    ));

    // Create locked contract
    let (stored_contract_hash, _contract_version) = storage::new_locked_contract(
        entry_points,
        Some(contract_named_keys),
        Some(CONTRACT_PACKAGE_NAME.to_string()),
        Some(CONTRACT_ACCESS_UREF.to_string()),
        None,
    );

    // Store contract hash in named keys
    runtime::put_key(CONTRACT_KEY, stored_contract_hash.into());
}
