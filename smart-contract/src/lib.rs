#![no_std]
#![no_main]

#[cfg(not(target_arch = "wasm32"))]
compile_error!("target arch should be wasm32: compile with '--target wasm32-unknown-unknown'");

// This code imports necessary aspects of external crates that we will use in our contract code.
extern crate alloc;
// Importing Rust types.
use alloc::{
    string::{String, ToString},
    vec::Vec,
};
// Importing aspects of the Casper platform.
use casper_contract::{
    contract_api::{runtime, storage},
    unwrap_or_revert::UnwrapOrRevert,
};
// Importing specific Casper types.
use casper_types::{
    addressable_entity::{EntityEntryPoint as EntryPoint, EntryPoints},
    api_error::ApiError,
    contracts::NamedKeys,
    CLType, CLValue, EntryPointAccess, EntryPointPayment, EntryPointType, URef,
};

/// Constants for the keys pointing to values stored in the account's named keys.
const CONTRACT_PACKAGE_NAME: &str = "stakevue_v2_package";
const CONTRACT_ACCESS_UREF: &str = "stakevue_v2_access";

/// Creating constants for the various contract entry points.
const ENTRY_POINT_INCREMENT: &str = "increment";
const ENTRY_POINT_GET_COUNT: &str = "get_count";

/// Constants for the keys pointing to values stored in the contract's named keys.
const CONTRACT_VERSION_KEY: &str = "version";
const CONTRACT_KEY: &str = "stakevue";
const COUNT_KEY: &str = "count";

/// Entry point that increments the count value by 1.
#[no_mangle]
pub extern "C" fn increment() {
    let uref: URef = runtime::get_key(COUNT_KEY)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);
    storage::add(uref, 1); // Increment the count by 1.
}

/// Entry point that returns the count value.
#[no_mangle]
pub extern "C" fn get_count() {
    let uref: URef = runtime::get_key(COUNT_KEY)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);
    let result: i32 = storage::read(uref)
        .unwrap_or_revert_with(ApiError::Read)
        .unwrap_or_revert_with(ApiError::ValueNotFound);
    let typed_result = CLValue::from_t(result).unwrap_or_revert();
    runtime::ret(typed_result); // Return the count value.
}

/// Entry point that executes automatically when a caller installs the contract.
#[no_mangle]
pub extern "C" fn call() {
    // Initialize the count to 0, locally.
    let count_start = storage::new_uref(0_i32);

    // In the named keys of the contract, add a key for the count.
    let mut counter_named_keys = NamedKeys::new();
    let key_name = String::from(COUNT_KEY);
    counter_named_keys.insert(key_name, count_start.into());

    // Create the entry points for this contract.
    let mut counter_entry_points = EntryPoints::new();

    counter_entry_points.add_entry_point(EntryPoint::new(
        ENTRY_POINT_GET_COUNT,
        Vec::new(),
        CLType::I32,
        EntryPointAccess::Public,
        EntryPointType::Called,
        EntryPointPayment::Caller,
    ));

    counter_entry_points.add_entry_point(EntryPoint::new(
        ENTRY_POINT_INCREMENT,
        Vec::new(),
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
        EntryPointPayment::Caller,
    ));

    // Create a locked contract (non-upgradeable)
    let (stored_contract_hash, _contract_version) = storage::new_locked_contract(
        counter_entry_points,
        Some(counter_named_keys),
        Some(CONTRACT_PACKAGE_NAME.to_string()),
        Some(CONTRACT_ACCESS_UREF.to_string()),
        None,
    );

    // Create a named key for the contract hash.
    runtime::put_key(CONTRACT_KEY, stored_contract_hash.into());
}
