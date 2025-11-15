#![no_std]
#![no_main]

#[cfg(not(target_arch = "wasm32"))]
compile_error!("target arch should be wasm32: compile with '--target wasm32-unknown-unknown'");

extern crate alloc;

use alloc::{
    format,
    string::{String, ToString},
    vec,
    vec::Vec,
};

use casper_contract::{
    contract_api::{runtime, storage},
    unwrap_or_revert::UnwrapOrRevert,
};

use casper_types::{
    addressable_entity::{EntityEntryPoint as EntryPoint, EntryPoints, Parameter},
    api_error::ApiError,
    contracts::NamedKeys,
    CLType, CLValue, EntryPointAccess, EntryPointPayment, EntryPointType, URef, U512,
    account::AccountHash,
};

/// Constants
const CONTRACT_PACKAGE_NAME: &str = "stakevue_liquid_staking";
const CONTRACT_ACCESS_UREF: &str = "stakevue_access";
const CONTRACT_KEY: &str = "stakevue_contract";
const TOTAL_STAKED_KEY: &str = "total_staked";
const STAKED_AMOUNT_KEY: &str = "amount";

// APY Configuration - 10% annual return
const APY_PERCENTAGE: u64 = 10;

/// Helper function to get user stake key
fn get_user_stake_key(account: &AccountHash) -> String {
    format!("user_stake_{}", account)
}

/// Helper function to get user timestamp key
fn get_user_timestamp_key(account: &AccountHash) -> String {
    format!("user_timestamp_{}", account)
}

/// Entry point to stake CSPR
#[no_mangle]
pub extern "C" fn stake() {
    // Get the amount parameter
    let amount: U512 = runtime::get_named_arg(STAKED_AMOUNT_KEY);

    // Get caller address
    let caller = runtime::get_caller();

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
    let new_user_stake = current_user_stake + amount;

    // Create or update user stake storage
    let user_stake_uref = storage::new_uref(new_user_stake);
    runtime::put_key(&user_stake_key, user_stake_uref.into());

    // Update user's block number (simplified tracking)
    let user_timestamp_key = get_user_timestamp_key(&caller);
    let timestamp_uref = storage::new_uref(current_block);
    runtime::put_key(&user_timestamp_key, timestamp_uref.into());
}

/// Entry point to unstake CSPR
#[no_mangle]
pub extern "C" fn unstake() {
    // Get the amount parameter
    let amount: U512 = runtime::get_named_arg(STAKED_AMOUNT_KEY);

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

    // Update user's stake
    let new_user_stake = current_user_stake - amount;
    storage::write(user_stake_uref, new_user_stake);

    // Update total staked (global counter)
    let total_uref: URef = runtime::get_key(TOTAL_STAKED_KEY)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);

    let current_total: U512 = storage::read(total_uref)
        .unwrap_or_revert_with(ApiError::Read)
        .unwrap_or_revert_with(ApiError::ValueNotFound);

    let new_total = current_total - amount;
    storage::write(total_uref, new_total);
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

/// Contract installation entry point
#[no_mangle]
pub extern "C" fn call() {
    // Initialize total staked to 0
    let total_staked_start = storage::new_uref(U512::zero());

    // Setup named keys
    let mut contract_named_keys = NamedKeys::new();
    contract_named_keys.insert(String::from(TOTAL_STAKED_KEY), total_staked_start.into());

    // Create entry points
    let mut entry_points = EntryPoints::new();

    // stake(amount: U512)
    entry_points.add_entry_point(EntryPoint::new(
        "stake",
        vec![Parameter::new(STAKED_AMOUNT_KEY, CLType::U512)],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
        EntryPointPayment::Caller,
    ));

    // unstake(amount: U512)
    entry_points.add_entry_point(EntryPoint::new(
        "unstake",
        vec![Parameter::new(STAKED_AMOUNT_KEY, CLType::U512)],
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
