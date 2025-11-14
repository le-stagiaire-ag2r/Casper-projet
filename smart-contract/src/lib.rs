#![no_std]
#![no_main]

#[cfg(not(target_arch = "wasm32"))]
compile_error!("target arch should be wasm32: compile with '--target wasm32-unknown-unknown'");

extern crate alloc;

use casper_contract::contract_api::{runtime, storage};

const COUNT_KEY: &str = "count";

#[no_mangle]
pub extern "C" fn call() {
    // Just store a simple value and exit
    let count_uref = storage::new_uref(42_i32);
    runtime::put_key(COUNT_KEY, count_uref.into());
}
