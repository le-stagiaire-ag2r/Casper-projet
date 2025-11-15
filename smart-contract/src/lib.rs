#![no_std]
#![no_main]

#[cfg(not(target_arch = "wasm32"))]
compile_error!("target arch should be wasm32: compile with '--target wasm32-unknown-unknown'");

extern crate alloc;

use alloc::{
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
};

/// Constants
const CONTRACT_PACKAGE_NAME: &str = "stakevue_liquid_staking";
const CONTRACT_ACCESS_UREF: &str = "stakevue_access";
const CONTRACT_KEY: &str = "stakevue_contract";
const TOTAL_STAKED_KEY: &str = "total_staked";
const STAKED_AMOUNT_KEY: &str = "amount";

/// Entry point to stake CSPR
#[no_mangle]
pub extern "C" fn stake() {
    // Get the amount parameter
    let amount: U512 = runtime::get_named_arg(STAKED_AMOUNT_KEY);

    // Get current total staked
    let uref: URef = runtime::get_key(TOTAL_STAKED_KEY)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);

    // Add the new stake amount
    storage::add(uref, amount);
}

/// Entry point to unstake CSPR
#[no_mangle]
pub extern "C" fn unstake() {
    // Get the amount parameter
    let amount: U512 = runtime::get_named_arg(STAKED_AMOUNT_KEY);

    // Get current total staked
    let uref: URef = runtime::get_key(TOTAL_STAKED_KEY)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);

    // Read current value
    let current_staked: U512 = storage::read(uref)
        .unwrap_or_revert_with(ApiError::Read)
        .unwrap_or_revert_with(ApiError::ValueNotFound);

    // Check if we have enough staked
    if current_staked < amount {
        runtime::revert(ApiError::User(100)); // Custom error: Insufficient staked amount
    }

    // Subtract the unstake amount
    let new_amount = current_staked - amount;
    storage::write(uref, new_amount);
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
