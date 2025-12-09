# StakeVue V8 - Odra Smart Contract

Smart contract pour staking CSPR utilisant le framework Odra pour Casper 2.0.

## Prérequis

Sur Ubuntu/WSL :

```bash
# 1. Installer Rust (si pas déjà fait)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# 2. Ajouter la target wasm32
rustup target add wasm32-unknown-unknown

# 3. Installer cargo-odra
cargo install cargo-odra

# 4. Vérifier casper-client (tu l'as déjà)
casper-client --version
```

## Build

```bash
cd smart-contract-odra

# Compiler le contrat
cargo odra build -c StakeVue

# Le WASM sera dans ./wasm/StakeVue.wasm
```

## Test

```bash
# Tests sur OdraVM (rapide)
cargo odra test

# Tests sur CasperVM (plus lent, plus précis)
cargo odra test -b casper
```

## Déploiement

```bash
# Déployer sur testnet
casper-client put-transaction session \
  --node-address http://65.109.83.79:7777/rpc \
  --chain-name casper-test \
  --secret-key ~/secret_key.pem \
  --payment-amount 300000000000 \
  --gas-price-tolerance 1 \
  --standard-payment true \
  --wasm-path ./wasm/StakeVue.wasm \
  --session-arg "odra_cfg_package_hash_key_name:string:'stakevue_v8_package'" \
  --session-arg "odra_cfg_allow_key_override:bool:'true'" \
  --session-arg "odra_cfg_is_upgradable:bool:'true'"
```

## Appeler stake (avec proxy_caller)

Pour staker des CSPR, il faut utiliser le proxy_caller d'Odra :

```bash
# D'abord, récupérer le proxy_caller.wasm depuis Odra
# Puis appeler stake avec les tokens attachés

casper-client put-transaction session \
  --node-address http://65.109.83.79:7777/rpc \
  --chain-name casper-test \
  --secret-key ~/secret_key.pem \
  --payment-amount 10000000000 \
  --gas-price-tolerance 1 \
  --standard-payment true \
  --wasm-path ./wasm/proxy_caller.wasm \
  --session-arg "contract_package_hash:key='hash-XXXXX'" \
  --session-arg "entry_point:string='stake'" \
  --session-arg "attached_value:u512='10000000000'" \
  --session-arg "amount:u512='10000000000'"
```

## Appeler unstake (direct)

```bash
casper-client put-transaction package \
  --node-address http://65.109.83.79:7777/rpc \
  --chain-name casper-test \
  --secret-key ~/secret_key.pem \
  --gas-price-tolerance 1 \
  --contract-package-hash "hash-XXXXX" \
  --payment-amount 5000000000 \
  --standard-payment true \
  --session-entry-point "unstake" \
  --session-arg "amount:u512='5000000000'"
```

## Entry Points

| Function | Description | Payable |
|----------|-------------|---------|
| `stake()` | Stake CSPR (montant = attached_value) | Oui |
| `unstake(amount)` | Retirer des CSPR | Non |
| `get_stake(user)` | Voir le stake d'un user | Non (view) |
| `get_total_staked()` | Total staké | Non (view) |
| `get_contract_balance()` | Balance du contrat | Non (view) |

## Structure

```
smart-contract-odra/
├── Cargo.toml        # Dépendances Rust
├── Odra.toml         # Config Odra
├── src/
│   └── lib.rs        # Code du contrat
├── bin/
│   └── build.rs      # Build helper
└── wasm/             # (généré après build)
    └── StakeVue.wasm
```
