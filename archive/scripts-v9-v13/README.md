# Archived Scripts (V9-V13)

These scripts were used during development to debug the `attached_value()` issue.

## Timeline

| Script | Purpose | Result |
|--------|---------|--------|
| `configure_v9.rs` | Configure V9 token address | Blocked by Casper 2.0 issue |
| `deploy_v10.rs` | Deploy V10 with token in init | attached_value() = 0 |
| `configure_v10.rs` | Configure V10 token | Same issue |
| `deploy_v11.rs` | Never used (skipped to V12) | - |
| `deploy_v12.rs` | Deploy with SubModule<Cep18> | Error 64658 |
| `deploy_v13.rs` | Deploy minimal (no token) | SUCCESS |
| `test_stake_v9.rs` | Test V9 stake | Failed |
| `test_stake_v10.rs` | Test V10 stake | Failed |
| `test_stake_v12.rs` | Test V12 stake | Failed |
| `test_stake_v13.rs` | Test V13 stake | SUCCESS |
| `test_stake_v82.rs` | Test V8.2 (baseline) | SUCCESS |
| `test_stake_simple.rs` | Isolated payable test | - |
| `test_unstake_v13.rs` | Test V13 unstake | SUCCESS |

## Key Learnings

The issue was using `Var<Address>` to reference an external token contract.
Solution: Use `SubModule<Cep18>` for integrated token (V14).

## Note

These scripts are kept for historical reference. The production scripts are in `stakevue_contract/bin/`.
