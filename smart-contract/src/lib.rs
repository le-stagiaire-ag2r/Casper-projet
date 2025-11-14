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

const KEY_NAME: &str = "total_staked";
const CONTRACT_VERSION: &str = "contract_version";

#[no_mangle]
pub extern "C" fn stake() {
    let amount: U512 = runtime::get_named_arg("amount");

    let key = runtime::get_key(KEY_NAME)
        .unwrap_or_revert()
        .into_uref()
        .unwrap_or_revert();

    let current: U512 = storage::read(key)
        .unwrap_or_revert()
        .unwrap_or(U512::zero());

    storage::write(key, current + amount);
}

#[no_mangle]
pub extern "C" fn get_total() {
    let key = runtime::get_key(KEY_NAME)
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
        "stake",
        alloc::vec![Parameter::new("amount", CLType::U512)],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    entry_points.add_entry_point(EntryPoint::new(
        "get_total",
        alloc::vec![],
        CLType::U512,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    let (contract_hash, contract_version) = storage::new_contract(
        entry_points,
        None,
        Some("stakevue".to_string()),
        None,
    );

    let version_uref = storage::new_uref(contract_version);
    runtime::put_key(CONTRACT_VERSION, version_uref.into());
    runtime::put_key("stakevue_contract", contract_hash.into());

    // Initialize storage
    let total_uref = storage::new_uref(U512::zero());
    runtime::put_key(KEY_NAME, total_uref.into());
}
