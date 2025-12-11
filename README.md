# StakeVue - Liquid Staking Protocol for Casper Network

![Casper Network](https://img.shields.io/badge/Casper-2.0_Testnet-blue)
![Status](https://img.shields.io/badge/Status-V15_Exchange_Rate-brightgreen)
![Framework](https://img.shields.io/badge/Framework-Odra_2.4.0-purple)
![License](https://img.shields.io/badge/License-MIT-green)

**Hackathon:** Casper Hackathon 2025 on DoraHacks
**Track:** DeFi - Liquid Staking

---

## Live Demo

**Web App:** [https://casper-projet.vercel.app](https://casper-projet.vercel.app)

**V15 Contract on Testnet:** [View on Explorer](https://testnet.cspr.live/contract-package/2b6c14a2cac5cfe4a1fd1efc2fc02b1090dbc3a6b661a329b90c829245540985)

---

## What is Liquid Staking?

Traditional staking locks your tokens. **Liquid staking** lets you stake AND keep your liquidity!

```
+---------------------------------------------------------------------+
|  TRADITIONAL STAKING                                                |
|                                                                     |
|  Your 100 CSPR --> Validator --> LOCKED for days/weeks              |
|                                  You can't use them!                |
+---------------------------------------------------------------------+

+---------------------------------------------------------------------+
|  LIQUID STAKING (StakeVue)                                          |
|                                                                     |
|  Your 100 CSPR --> StakeVue --> You get 100 stCSPR                  |
|                                                                     |
|  With your stCSPR you can:                                          |
|  +-- Trade on DEX                                                   |
|  +-- Use as collateral in DeFi                                      |
|  +-- Transfer to anyone                                             |
|  +-- Unstake anytime to get CSPR back (with rewards!)               |
+---------------------------------------------------------------------+
```

---

## V15 - Exchange Rate Mechanism

### How stCSPR Appreciates

Unlike V14 (1:1 ratio), V15 implements a **dynamic exchange rate** that increases over time as rewards accumulate:

```
+---------------------------------------------------------------------+
|  EXCHANGE RATE APPRECIATION                                         |
|                                                                     |
|  Day 1: Stake 100 CSPR --> Get 100 stCSPR (rate = 1.0)              |
|                                                                     |
|  Day 30: Rewards added to pool                                      |
|          Pool: 115 CSPR / Supply: 100 stCSPR                        |
|          Rate = 1.15 (1 stCSPR = 1.15 CSPR)                         |
|                                                                     |
|  Day 30: Unstake 100 stCSPR --> Get 115 CSPR (+15% profit!)         |
+---------------------------------------------------------------------+
```

### Live Test Results (Testnet)

```
Before rewards:
  Exchange rate: 1.0 (1_000_000_000)
  Pool: 5 CSPR
  stCSPR supply: 5

After 1 CSPR reward added:
  Exchange rate: 1.2 (1_200_000_000)
  Pool: 6 CSPR
  stCSPR supply: 5 (unchanged!)

Result: 5 stCSPR now worth 6 CSPR (+20%)
```

---

## How StakeVue Works

### Stake Flow (at rate 1.15)
```
+----------------+         +---------------------+
|  Your Wallet   |         |  StakeVue Contract  |
|                |         |                     |
|  -115 CSPR     | ------> |  +115 CSPR (pool)   |
|  +100 stCSPR   | <------ |  mint 100 stCSPR    |
+----------------+         +---------------------+

Formula: stCSPR = CSPR / exchange_rate
```

### Unstake Flow (at rate 1.15)
```
+----------------+         +---------------------+
|  Your Wallet   |         |  StakeVue Contract  |
|                |         |                     |
|  +115 CSPR     | <------ |  -115 CSPR (pool)   |
|  -100 stCSPR   | ------> |  BURN 100 stCSPR    |
+----------------+         +---------------------+

Formula: CSPR = stCSPR * exchange_rate
```

**Important:** stCSPR tokens are **burned** (destroyed) when you unstake. They represent your claim to the staked CSPR - once you withdraw, the claim is gone!

---

## V15 - Contract Details

| Property | Value |
|----------|-------|
| **Package Hash** | `2b6c14a2cac5cfe4a1fd1efc2fc02b1090dbc3a6b661a329b90c829245540985` |
| **Network** | casper-test |
| **Framework** | Odra 2.4.0 |
| **Token Standard** | CEP-18 (integrated) |
| **Exchange Rate** | Dynamic (rewards-based) |
| **Status** | Deployed & Tested |

### Architecture

```rust
#[odra::module]
pub struct StakeVue {
    ownable: SubModule<Ownable>,     // Admin control
    token: SubModule<Cep18>,          // Integrated stCSPR token
    total_cspr_pool: Var<U512>,       // Total CSPR (stakes + rewards)
}

// Exchange rate = total_cspr_pool / total_stcspr_supply
// Rate increases when rewards are added (pool grows, supply unchanged)
```

### Entry Points

| Function | Type | Description |
|----------|------|-------------|
| `stake()` | Payable | Stake CSPR, receive stCSPR at current rate |
| `unstake(amount)` | Public | Burn stCSPR, receive CSPR at current rate |
| `add_rewards()` | Owner/Payable | Add rewards to pool (increases rate) |
| `get_exchange_rate()` | View | Current rate (9 decimals: 1.0 = 1_000_000_000) |
| `get_stcspr_balance(addr)` | View | stCSPR balance |
| `get_cspr_value(addr)` | View | CSPR value of stCSPR balance |
| `get_total_pool()` | View | Total CSPR in pool |
| `token_symbol()` | View | Returns "stCSPR" |
| `transfer_ownership(new)` | Owner | Transfer admin rights |

---

## Project Structure

```
Casper-projet/
+-- client/                      # React frontend
|   +-- public/
|   |   +-- config.js            # V15 contract address
|   |   +-- proxy_caller.wasm    # Odra proxy for browser
|   +-- src/
|   |   +-- components/          # UI components
|   |   +-- hooks/useStaking.ts  # Stake/unstake logic
|   |   +-- services/
|   |       +-- transaction.ts   # Transaction builder
|   +-- api/
|       +-- contract-stats.js    # Live RPC API (Vercel serverless)
+-- stakevue_contract/           # Odra smart contract
|   +-- src/lib.rs               # V15 contract code
|   +-- Cargo.toml               # Dependencies (v15.0.0)
|   +-- Odra.toml                # Odra config
|   +-- bin/                     # Deploy/test scripts
|       +-- deploy_v15.rs
|       +-- test_stake_v15.rs
|       +-- test_add_rewards_v15.rs
+-- scripts/                     # Node.js utilities
|   +-- add-rewards.js           # Add rewards via RPC
|   +-- check-stats.js           # Check contract stats
+-- archive/                     # Old versions (V1-V14)
+-- README.md
```

---

## Live Blockchain API

The `/api/contract-stats` endpoint reads **real-time data** from the deployed V15 contract on Casper testnet.

### Endpoint

```
GET https://casper-projet.vercel.app/api/contract-stats
```

### Response Example

```json
{
  "exchangeRate": 1275000000,
  "totalPool": 27000000000,
  "totalStcspr": 21176470587,
  "exchangeRateFormatted": "1.2750",
  "totalPoolCspr": 27,
  "totalStcsprFormatted": 21.17,
  "timestamp": "2025-12-11T16:45:00.000Z",
  "source": "contract_main_purse",
  "contractHash": "2b6c14a2cac5cfe4a1fd1efc2fc02b1090dbc3a6b661a329b90c829245540985"
}
```

### Technical Details

The API queries Casper 2.0 RPC to read Odra framework storage:

| Step | Method | Purpose |
|------|--------|---------|
| 1 | `chain_get_state_root_hash` | Get current state |
| 2 | `state_get_entity` | Find ContractPackage |
| 3 | `query_global_state` | Get active contract version |
| 4 | `query_balance` | Read `__contract_main_purse` balance |

**Key insight:** Odra stores CSPR in `__contract_main_purse` named key, queried via `purse_uref` identifier.

---

## Quick Start

### Frontend

```bash
cd client
npm install
npm start
```

### Smart Contract

```bash
cd stakevue_contract

# Build
cargo odra build

# Run tests (7 tests for exchange rate)
cargo test

# Deploy to testnet (requires secret_key.pem)
cargo run --bin deploy_v15 --features livenet

# Test stake
cargo run --bin test_stake_v15 --features livenet

# Test rewards (increases exchange rate)
cargo run --bin test_add_rewards_v15 --features livenet
```

---

## Risk Levels

| Strategy | Risk | Reward |
|----------|------|--------|
| HODL CSPR | None | None |
| Liquid stake (keep stCSPR safe) | Low | ~15% APY* |
| Use stCSPR in DeFi | High | Variable |

*APY depends on validator rewards added to pool

**Warning:** If you lose/sell your stCSPR, you cannot unstake those CSPR!

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Smart Contract | Rust, Odra 2.4.0, CEP-18 |
| Frontend | React 18, TypeScript, styled-components |
| Wallet | CSPR.click |
| Deployment | Vercel (frontend), Casper 2.0 Testnet |

---

## Roadmap

### Completed
- [x] V14 contract with integrated stCSPR token
- [x] Stake/unstake working on testnet
- [x] Frontend integration
- [x] Transaction signing via CSPR.click
- [x] **V15 Exchange rate mechanism**
- [x] **add_rewards() for rate appreciation**
- [x] **7/7 unit tests passing**
- [x] **Live Blockchain RPC API** (reads real contract stats)
- [x] **Frontend exchange rate display**

### Next Steps
- [ ] Validator delegation (real staking rewards)
- [ ] Automated reward distribution
- [ ] Security audit
- [ ] Mainnet deployment

---

## Links

- **Live Demo:** https://casper-projet.vercel.app
- **V15 Contract:** https://testnet.cspr.live/contract-package/2b6c14a2cac5cfe4a1fd1efc2fc02b1090dbc3a6b661a329b90c829245540985
- **Odra Framework:** https://odra.dev
- **Casper Network:** https://casper.network

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| **V15.1** | Dec 2025 | **Live RPC API** - Real-time contract stats from blockchain |
| **V15** | Dec 2025 | **Exchange rate mechanism** - stCSPR appreciates with rewards |
| **V14** | Dec 2025 | Production-ready with integrated CEP-18 stCSPR token |
| **V13** | Dec 2025 | Minimal version proving payable works |
| **V12** | Dec 2025 | CEP-18 attempt (package key conflict) |
| **V9-V10-V11** | Dec 2025 | External token reference (broken attached_value) |
| **V8.2** | Dec 2025 | Ownable + Pauseable modules, Odra 2.4.0 |
| **V8.0** | Dec 2025 | First real CSPR staking with Odra framework |
| **V7.x** | Nov 2025 | APY slider, price charts, CSV export |
| **V6.x** | Nov 2025 | Price alerts, portfolio history |
| **V5.0** | Nov 2025 | Security hardening - 10 vulnerabilities fixed (A+ score) |
| **V4.0** | Nov 2025 | Multi-validator support, admin functions |
| **V3.0** | Nov 2025 | Liquid token (stCSPR) - mint/burn logic |
| **V2.0** | Nov 2025 | Per-user stake tracking, rewards calculation |
| **V1.0** | Nov 2025 | Core staking - basic stake/unstake |

---

## License

MIT License

---

**Built for Casper Hackathon 2025**

**StakeVue - Liquid Staking Made Simple**
