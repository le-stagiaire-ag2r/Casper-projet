use odra_cli::OdraCli;
use stakevue_contract::StakeVue;

pub fn main() {
    OdraCli::new()
        .about("StakeVue CLI")
        .contract::<StakeVue>()
        .build()
        .run();
}
