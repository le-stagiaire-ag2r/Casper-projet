//! Build contract binary for StakeVue
//! This is used by `cargo odra build` to compile the contract to WASM

use stakevue::StakeVue;

fn main() {
    odra_build::register::<StakeVue>();
    odra_build::build();
}
