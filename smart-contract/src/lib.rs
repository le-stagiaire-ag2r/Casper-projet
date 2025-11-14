#![no_std]
#![no_main]

extern crate alloc;

use alloc::{string::String, vec::Vec};
use casper_contract::{
    contract_api::{runtime, storage},
    unwrap_or_revert::UnwrapOrRevert,
};
use casper_types::{
    CLType, CLValue, EntryPoint, EntryPointAccess, EntryPointType, EntryPoints,
    Parameter, RuntimeArgs, U512, runtime_args,
};

const CONTRACT_KEY: &str = "stakevue_contract";
const TOTAL_STAKED: &str = "total_staked";

#[no_mangle]
pub extern "C" fn init() {
    let total_staked_uref = storage::new_uref(U512::zero());
    runtime::put_key(TOTAL_STAKED, total_staked_uref.into());
}

#[no_mangle]
pub extern "C" fn get_total_staked() {
    let total_staked_key = runtime::get_key(TOTAL_STAKED).unwrap_or_revert();
    let total_staked_uref = total_staked_key.into_uref().unwrap_or_revert();
    let total: U512 = storage::read(total_staked_uref)
        .unwrap_or_revert()
        .unwrap_or(U512::zero());
    runtime::ret(CLValue::from_t(total).unwrap_or_revert());
}

#[no_mangle]
pub extern "C" fn stake() {
    let amount: U512 = runtime::get_named_arg("amount");

    let total_staked_key = runtime::get_key(TOTAL_STAKED).unwrap_or_revert();
    let total_staked_uref = total_staked_key.into_uref().unwrap_or_revert();

    let current_total: U512 = storage::read(total_staked_uref)
        .unwrap_or_revert()
        .unwrap_or(U512::zero());

    let new_total = current_total + amount;
    storage::write(total_staked_uref, new_total);
}

#[no_mangle]
pub extern "C" fn call() {
    let mut entry_points = EntryPoints::new();

    entry_points.add_entry_point(EntryPoint::new(
        String::from("init"),
        Vec::new(),
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    entry_points.add_entry_point(EntryPoint::new(
        String::from("get_total_staked"),
        Vec::new(),
        CLType::U512,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    let mut stake_params = Vec::new();
    stake_params.push(Parameter::new("amount", CLType::U512));
    entry_points.add_entry_point(EntryPoint::new(
        String::from("stake"),
        stake_params,
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    let (contract_hash, _contract_version) = storage::new_contract(
        entry_points,
        None,
        Some(String::from("stakevue_package")),
        None,
    );

    runtime::put_key(CONTRACT_KEY, contract_hash.into());

    // Initialize immediately without call_contract
    let total_staked_uref = storage::new_uref(U512::zero());
    runtime::put_key(TOTAL_STAKED, total_staked_uref.into());
}
