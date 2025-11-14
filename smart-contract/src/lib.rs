#![no_std]
#![no_main]

extern crate alloc;

use alloc::string::ToString;
use casper_contract::{
    contract_api::{runtime, storage},
    unwrap_or_revert::UnwrapOrRevert,
};
use casper_types::{
    CLType, EntryPoint, EntryPointAccess, EntryPointType, EntryPoints, Parameter, U512,
};

const COUNTER_KEY: &str = "counter";

#[no_mangle]
pub extern "C" fn increment() {
    let key = runtime::get_key(COUNTER_KEY)
        .unwrap_or_revert()
        .into_uref()
        .unwrap_or_revert();

    let current: U512 = storage::read(key)
        .unwrap_or_revert()
        .unwrap_or(U512::zero());

    storage::write(key, current + U512::one());
}

#[no_mangle]
pub extern "C" fn get_count() {
    let key = runtime::get_key(COUNTER_KEY)
        .unwrap_or_revert()
        .into_uref()
        .unwrap_or_revert();

    let value: U512 = storage::read(key)
        .unwrap_or_revert()
        .unwrap_or(U512::zero());

    runtime::ret(casper_types::CLValue::from_t(value).unwrap_or_revert());
}

#[no_mangle]
pub extern "C" fn call() {
    let mut entry_points = EntryPoints::new();

    entry_points.add_entry_point(EntryPoint::new(
        "increment",
        alloc::vec![],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    entry_points.add_entry_point(EntryPoint::new(
        "get_count",
        alloc::vec![],
        CLType::U512,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    let (contract_hash, _) = storage::new_contract(
        entry_points,
        None,
        Some("counter".to_string()),
        None,
    );

    runtime::put_key("counter_contract", contract_hash.into());

    // Initialize counter
    let counter_uref = storage::new_uref(U512::zero());
    runtime::put_key(COUNTER_KEY, counter_uref.into());
}
