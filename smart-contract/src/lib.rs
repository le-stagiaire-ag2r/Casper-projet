#![no_std]
#![no_main]

extern crate alloc;

use alloc::{string::String, vec::Vec, format};
use casper_contract::{
    contract_api::{runtime, storage},
    unwrap_or_revert::UnwrapOrRevert,
};
use casper_types::{
    runtime_args, CLType, CLValue, EntryPoint, EntryPointAccess,
    EntryPointType, EntryPoints, Key, Parameter, RuntimeArgs, U512, URef,
};

// Constantes
const CONTRACT_HASH_KEY: &str = "stakevue_contract_hash";
const CONTRACT_VERSION: &str = "contract_version";
const TOTAL_STAKED_KEY: &str = "total_staked";
const USER_STAKES_DICT: &str = "user_stakes_dict";

/// Initialisation du contrat
#[no_mangle]
pub extern "C" fn init() {
    // Créer le dictionnaire pour les stakes utilisateurs
    let dict_uref = storage::new_dictionary(USER_STAKES_DICT).unwrap_or_revert();
    runtime::put_key(USER_STAKES_DICT, dict_uref.into());

    // Initialiser le total staké à 0
    let total_uref = storage::new_uref(U512::zero());
    runtime::put_key(TOTAL_STAKED_KEY, total_uref.into());
}

/// Fonction pour récupérer le montant total staké
#[no_mangle]
pub extern "C" fn get_total_staked() {
    let total_key = runtime::get_key(TOTAL_STAKED_KEY).unwrap_or_revert();
    let total_uref = total_key.into_uref().unwrap_or_revert();
    let total: U512 = storage::read(total_uref)
        .unwrap_or_revert()
        .unwrap_or(U512::zero());

    runtime::ret(CLValue::from_t(total).unwrap_or_revert());
}

/// Fonction pour récupérer le montant staké par un utilisateur
#[no_mangle]
pub extern "C" fn get_user_stake() {
    let user_account: Key = runtime::get_named_arg("user");
    let user_key_str = format!("{:?}", user_account);

    let dict_key = runtime::get_key(USER_STAKES_DICT).unwrap_or_revert();
    let dict_uref = dict_key.into_uref().unwrap_or_revert();

    let user_stake: U512 = storage::dictionary_get(dict_uref, &user_key_str)
        .unwrap_or_revert()
        .unwrap_or(U512::zero());

    runtime::ret(CLValue::from_t(user_stake).unwrap_or_revert());
}

/// Fonction pour staker des CSPR
#[no_mangle]
pub extern "C" fn stake() {
    let amount: U512 = runtime::get_named_arg("amount");
    let caller = runtime::get_caller();
    let caller_key = Key::from(caller);
    let caller_key_str = format!("{:?}", caller_key);

    // Récupérer le dictionnaire des stakes
    let dict_key = runtime::get_key(USER_STAKES_DICT).unwrap_or_revert();
    let dict_uref = dict_key.into_uref().unwrap_or_revert();

    // Récupérer le stake actuel de l'utilisateur
    let current_stake: U512 = storage::dictionary_get(dict_uref, &caller_key_str)
        .unwrap_or_revert()
        .unwrap_or(U512::zero());

    // Ajouter le nouveau montant
    let new_stake = current_stake + amount;

    // Mettre à jour le stake de l'utilisateur
    storage::dictionary_put(dict_uref, &caller_key_str, new_stake);

    // Mettre à jour le total
    let total_key = runtime::get_key(TOTAL_STAKED_KEY).unwrap_or_revert();
    let total_uref = total_key.into_uref().unwrap_or_revert();

    let current_total: U512 = storage::read(total_uref)
        .unwrap_or_revert()
        .unwrap_or(U512::zero());

    storage::write(total_uref, current_total + amount);
}

/// Point d'entrée pour l'installation du contrat
#[no_mangle]
pub extern "C" fn call() {
    let mut entry_points = EntryPoints::new();

    // Entry point: init
    entry_points.add_entry_point(EntryPoint::new(
        "init",
        Vec::new(),
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    // Entry point: get_total_staked
    entry_points.add_entry_point(EntryPoint::new(
        "get_total_staked",
        Vec::new(),
        CLType::U512,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    // Entry point: get_user_stake
    let mut get_params = Vec::new();
    get_params.push(Parameter::new("user", CLType::Key));
    entry_points.add_entry_point(EntryPoint::new(
        "get_user_stake",
        get_params,
        CLType::U512,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    // Entry point: stake
    let mut stake_params = Vec::new();
    stake_params.push(Parameter::new("amount", CLType::U512));
    entry_points.add_entry_point(EntryPoint::new(
        "stake",
        stake_params,
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    // Installer le contrat
    let (contract_hash, contract_version) = storage::new_contract(
        entry_points,
        None,
        Some(String::from("stakevue_package")),
        None,
    );

    runtime::put_key(CONTRACT_HASH_KEY, contract_hash.into());
    runtime::put_key(CONTRACT_VERSION, storage::new_uref(contract_version).into());

    // Initialiser automatiquement
    runtime::call_contract::<()>(contract_hash, "init", runtime_args! {});
}
