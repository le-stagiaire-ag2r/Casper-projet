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

// stCSPR Token - V3.0
const STCSPR_TOTAL_SUPPLY_KEY: &str = "stcspr_total_supply";
const STCSPR_TOKEN_NAME: &str = "StakeVue Staked CSPR";
const STCSPR_TOKEN_SYMBOL: &str = "stCSPR";

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

/// Helper function to get user stCSPR balance key (V3.0)
fn get_stcspr_balance_key(account: &AccountHash) -> String {
    format!("stcspr_balance_{}", account)
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

    // V3.0: Mint stCSPR tokens (1:1 with staked CSPR)
    let stcspr_balance_key = get_stcspr_balance_key(&caller);
    let current_stcspr_balance: U512 = runtime::get_key(&stcspr_balance_key)
        .and_then(|key| key.into_uref())
        .and_then(|uref| storage::read(uref).unwrap_or(None))
        .unwrap_or(U512::zero());

    let new_stcspr_balance = current_stcspr_balance + amount;
    let stcspr_balance_uref = storage::new_uref(new_stcspr_balance);
    runtime::put_key(&stcspr_balance_key, stcspr_balance_uref.into());

    // Update stCSPR total supply
    let total_supply_uref: URef = runtime::get_key(STCSPR_TOTAL_SUPPLY_KEY)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);
    storage::add(total_supply_uref, amount);
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

    let new_stcspr_balance = current_stcspr_balance - amount;
    storage::write(stcspr_balance_uref, new_stcspr_balance);

    // Decrease stCSPR total supply
    let total_supply_uref: URef = runtime::get_key(STCSPR_TOTAL_SUPPLY_KEY)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);

    let current_supply: U512 = storage::read(total_supply_uref)
        .unwrap_or_revert_with(ApiError::Read)
        .unwrap_or_revert_with(ApiError::ValueNotFound);

    let new_supply = current_supply - amount;
    storage::write(total_supply_uref, new_supply);
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
    let new_sender_balance = sender_balance - amount;
    storage::write(sender_balance_uref, new_sender_balance);

    // Get or initialize recipient's balance
    let recipient_balance_key = get_stcspr_balance_key(&recipient);
    let current_recipient_balance: U512 = runtime::get_key(&recipient_balance_key)
        .and_then(|key| key.into_uref())
        .and_then(|uref| storage::read(uref).unwrap_or(None))
        .unwrap_or(U512::zero());

    // Increase recipient's balance
    let new_recipient_balance = current_recipient_balance + amount;
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

/// Contract installation entry point
#[no_mangle]
pub extern "C" fn call() {
    // Initialize total staked to 0
    let total_staked_start = storage::new_uref(U512::zero());

    // V3.0: Initialize stCSPR total supply to 0
    let stcspr_total_supply_start = storage::new_uref(U512::zero());

    // Setup named keys
    let mut contract_named_keys = NamedKeys::new();
    contract_named_keys.insert(String::from(TOTAL_STAKED_KEY), total_staked_start.into());
    contract_named_keys.insert(String::from(STCSPR_TOTAL_SUPPLY_KEY), stcspr_total_supply_start.into());

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
