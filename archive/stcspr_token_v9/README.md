# Archived: stCSPR Token (V9)

This external CEP-18 token contract was used in V9/V10 but caused the `attached_value() = 0` bug.

## Why Archived

Using `Var<Address>` to reference this external token broke the payable mechanism in Odra.

## Solution (V14)

Integrated the token directly using `SubModule<Cep18>` instead of external reference.

See main contract at `stakevue_contract/src/lib.rs`
