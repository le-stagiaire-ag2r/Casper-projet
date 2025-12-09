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

## Déploiement avec CLI (recommandé)

Le CLI Odra simplifie énormément le déploiement et l'interaction !

### Configuration

```bash
# Exporter les variables d'environnement
export ODRA_CASPER_LIVENET_SECRET_KEY_PATH=~/secret_key.pem
export ODRA_CASPER_LIVENET_NODE_ADDRESS=http://65.109.83.79:7777/rpc
export ODRA_CASPER_LIVENET_CHAIN_NAME=casper-test
```

### Déployer

```bash
cargo run --bin stakevue-cli --features livenet deploy
```

Output:
```
💁  INFO : Found wasm under "wasm/StakeVue.wasm".
💁  INFO : Deploying "StakeVue".
🙄  WAIT : Waiting 10 for transaction...
💁  INFO : Contract deployed successfully!
🔗  LINK : https://testnet.cspr.live/transaction/xxx
```

### Voir les commandes disponibles

```bash
cargo run --bin stakevue-cli --features livenet contract StakeVue
```

Output:
```
Commands for interacting with the StakeVue contract

Usage: stakevue-cli contract StakeVue <COMMAND>

Commands:
  stake             Stake CSPR tokens (payable)
  unstake           Unstake CSPR tokens
  get_stake         Get stake balance for a user
  get_total_staked  Get total staked in contract
  get_contract_balance  Get contract CSPR balance
```

### Staker des CSPR

```bash
# Staker 10 CSPR (10_000_000_000 motes)
cargo run --bin stakevue-cli --features livenet -- contract StakeVue stake \
  --attached_value 10000000000 \
  --gas 5000000000
```

### Voir son stake

```bash
cargo run --bin stakevue-cli --features livenet -- contract StakeVue get_stake \
  --user "account-hash-2f63ef2c9db78bcf2288529e2217cd8e70614f0b1aad4f8ef8871acd39ac2f7e"
```

### Unstaker des CSPR

```bash
# Unstaker 5 CSPR
cargo run --bin stakevue-cli --features livenet -- contract StakeVue unstake \
  --amount 5000000000 \
  --gas 5000000000
```

### Voir les events

```bash
cargo run --bin stakevue-cli --features livenet -- print-events StakeVue -n 5
```

## Structure

```
smart-contract-odra/
├── Cargo.toml        # Dépendances Rust
├── Odra.toml         # Config Odra
├── src/
│   └── lib.rs        # Code du contrat
├── bin/
│   └── cli.rs        # CLI pour deploy/interact
├── resources/
│   └── contracts.toml  # (généré) Adresses des contrats déployés
└── wasm/             # (généré après build)
    └── StakeVue.wasm
```

## Entry Points

| Function | Description | Payable |
|----------|-------------|---------|
| `stake()` | Stake CSPR (montant = attached_value) | ✅ Oui |
| `unstake(amount)` | Retirer des CSPR | Non |
| `get_stake(user)` | Voir le stake d'un user | Non (view) |
| `get_total_staked()` | Total staké | Non (view) |
| `get_contract_balance()` | Balance du contrat | Non (view) |

## Events

- `Staked { user, amount, total_stake }` - Émis quand un user stake
- `Unstaked { user, amount, remaining_stake }` - Émis quand un user unstake
