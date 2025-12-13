# 🌌 StakeVue

![Casper Network](https://img.shields.io/badge/Casper-2.0_Testnet-blue)
![Status](https://img.shields.io/badge/Status-V17_Multi--Validator-brightgreen)
![Framework](https://img.shields.io/badge/Framework-Odra_2.4.0-purple)
![License](https://img.shields.io/badge/License-MIT-green)

<p align="center">
  <img src="https://img.shields.io/badge/Casper-2.0_Testnet-00D4FF?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Version-16-8B5CF6?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Odra-2.4.0-FF6B35?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge"/>
</p>

<p align="center">
  <b>🎯 Casper Hackathon 2025</b> • <b>💰 DeFi Track</b> • <b>🏆 DoraHacks</b>
</p>

--- Please note that when reading this, the site is constantly evolving. This readme may not be up-to-date, some figures may have changed, or the logic may have been altered. In short, nothing technically serious, but be aware.

**V17 Contract on Testnet:** [View on Explorer](https://testnet.cspr.live/contract-package/c549746587ab0fe02f2f72246d52f6cf21d030c6aaac9908191f12e02dd73747)

---

You have **CSPR**. You want to earn rewards (~15-17% APY). But traditional staking **locks your tokens** for days...

**StakeVue fixes that:**

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
|  Your 500 CSPR --> StakeVue --> You get 500 stCSPR                  |
|                                                                     |
|  With your stCSPR you can:                                          |
|  +-- Trade on DEX                                                   |
|  +-- Use as collateral in DeFi                                      |
|  +-- Transfer to anyone                                             |
|  +-- Unstake anytime to get CSPR back (with rewards!)               |
+---------------------------------------------------------------------+
```

That's **liquid staking**. Your tokens work for you AND stay liquid. 🚀

## V17 - Multi-Validator Delegation

### New Features

V17 introduces **real network delegation** with multi-validator support:

```
+---------------------------------------------------------------------+
|  V17 MULTI-VALIDATOR                                                |
|                                                                     |
|  User stakes 500 CSPR                                               |
|       |                                                             |
|       v                                                             |
|  +-- StakeVue Contract --+                                          |
|  |                       |                                          |
|  |  Choose validator:    |                                          |
|  |  [x] MAKE (10%)       |                                          |
|  |  [ ] CasperCommunity  |                                          |
|  |  [ ] Era Guardian     |                                          |
|  |  [ ] Bit Cat          |                                          |
|  |  ... 9 validators     |                                          |
|  +-----------+-----------+                                          |
|              |                                                      |
|              v                                                      |
|  +-- Casper Auction Pool --+                                        |
|  |  Real network staking   |                                        |
|  |  Earn validator rewards |                                        |
|  +--------------------------+                                       |
+---------------------------------------------------------------------+
```

### Key V17 Features

| Feature | Description |
|---------|-------------|
| **Multi-Validator** | Choose from 9+ approved validators |
| **Real Delegation** | Stakes go to Casper Auction Pool |
| **Withdrawal Queue** | Request unstake → 7 era unbonding → Claim |
| **Min Stake 500 CSPR** | Casper network delegation requirement |
| **Validator Info** | APY, Commission, Performance displayed |

### Stake Flow (V17)

```
User (500 CSPR) --> StakeVue --> Validator Stakes --> Auction Pool
                        |
                        v
                 Mint 500 stCSPR
```

### Unstake Flow (V17)

```
1. request_unstake(amount, validator)
   --> Queues withdrawal
   --> Burns stCSPR
   --> Starts 7-era unbonding

2. [Wait 7 eras (~14 hours testnet)]

3. claim_withdrawal(request_id)
   --> Receive CSPR back
```

**No lock-up period. No waiting. Your money, your choice.** ✨

---

## V16.1 - UX Visual Refont

### Validator Selector (Accordion Style)

```
+-----------------------------------------------------+
| Choisir un validateur                           v   |
| 9 disponibles                                       |
+-----------------------------------------------------+
           |
           | (click to expand)
           v
+-----------------------------------------------------+
| Trier par: [Meilleur APY v]                         |
+-------------------------+---------------------------+
| MAKE #1                 | CasperCommunity #3        |
| APY 15.3% Comm 10%      | APY 15.3% Comm 10%        |
| Perf 100%               | Perf 100%                 |
+-------------------------+---------------------------+
| Era Guardian #4         | Bit Cat #96               |
| APY 15.3% Comm 10%      | APY 15.3% Comm 10%        |
| Perf 100%               | Perf 100%                 |
+-------------------------+---------------------------+
```

### Features
- **Collapsible accordion** - Click to expand/collapse
- **Grid layout** - 2 columns desktop, 1 column mobile
- **Real-time data** - APY, Commission, Performance from CSPR.cloud
- **Sort options** - By APY, Commission, Performance, Popularity
- **Auto-close** - Closes when validator selected

---

## V15 - Exchange Rate Mechanism

### How stCSPR Appreciates

V15 implements a **dynamic exchange rate** that increases over time as rewards accumulate:

```
+---------------------------------------------------------------------+
|  EXCHANGE RATE APPRECIATION                                         |
|                                                                     |
|  Day 1: Stake 500 CSPR --> Get 500 stCSPR (rate = 1.0)              |
|                                                                     |
|  Day 30: Rewards added to pool                                      |
|          Pool: 575 CSPR / Supply: 500 stCSPR                        |
|          Rate = 1.15 (1 stCSPR = 1.15 CSPR)                         |
|                                                                     |
|  Day 30: Unstake 500 stCSPR --> Get 575 CSPR (+15% profit!)         |
+---------------------------------------------------------------------+
```

---

## Contract Details

### V17 Contract

| Property | Value |
|----------|-------|
| **Contract Hash** | `c549746587ab0fe02f2f72246d52f6cf21d030c6aaac9908191f12e02dd73747` |
| **Network** | casper-test |
| **Framework** | Odra 2.4.0 |
| **Token Standard** | CEP-18 (integrated stCSPR) |
| **Min Stake** | 500 CSPR |
| **Gas Fee** | 15 CSPR |

### Entry Points (V17)

| Function | Type | Description |
|----------|------|-------------|
| `stake(validator)` | Payable | Stake CSPR to chosen validator |
| `request_unstake(amount, validator)` | Public | Queue withdrawal (burns stCSPR) |
| `claim_withdrawal(request_id)` | Public | Claim after unbonding period |
| `harvest_rewards()` | Owner | Auto-compound validator rewards |
| `add_approved_validator(pk)` | Owner | Add validator to whitelist |
| `remove_approved_validator(pk)` | Owner | Remove from whitelist |
| `get_exchange_rate()` | View | Current rate (9 decimals) |
| `get_approved_validators()` | View | List of approved validators |

---

## 📜 The Smart Contract

Deployed on **Casper 2.0 Testnet**:

```
Casper-projet/
+-- client/                      # React frontend
|   +-- public/
|   |   +-- config.js            # V17 contract config
|   |   +-- proxy_caller.wasm    # Odra proxy for browser
|   +-- src/
|   |   +-- components/
|   |   |   +-- stake/
|   |   |       +-- ValidatorSelector.tsx  # Accordion selector
|   |   |       +-- ValidatorSelector.css
|   |   +-- hooks/useStaking.ts  # Stake/unstake logic
|   |   +-- services/
|   |       +-- transaction.ts   # V17 transaction builder
|   |       +-- validatorService.ts  # CSPR.cloud API
|   +-- api/
|       +-- contract-stats.js    # Live RPC API
+-- stakevue_contract/           # Odra smart contract
|   +-- src/lib.rs               # V17 contract code
|   +-- Cargo.toml               # v17.0.0
|   +-- bin/
|       +-- deploy_v17.rs
|       +-- add_validators_v17.rs
|       +-- test_stake_v17.rs
|       +-- test_unstake_v17.rs
+-- README.md
```

---

## Quick Start

### Frontend

```bash
cd client
npm install
npm start        # 🌐 http://localhost:3000
```

### Smart Contract

```bash
cd stakevue_contract

# Build
cargo odra build

# Deploy V17 to testnet
cargo run --bin deploy_v17 --features livenet

# Add approved validators
cargo run --bin add_validators_v17 --features livenet

# Test stake
cargo run --bin test_stake_v17 --features livenet

# Test unstake
cargo run --bin test_unstake_v17 --features livenet
```

---

## Validator Selection Guide

| Metric | What it means | Ideal |
|--------|---------------|-------|
| **Commission** | % validator takes from rewards | Lower = better for you |
| **Performance** | Uptime score | 100% = perfect |
| **APY** | Your estimated yearly return | Higher = better |
| **Delegators** | Number of stakers | More = popular |

**Example:**
- Validator A: 5% commission, 100% perf → APY ~16.1%
- Validator B: 10% commission, 100% perf → APY ~15.3%

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Smart Contract | Rust, Odra 2.4.0, CEP-18 |
| Frontend | React 18, TypeScript, styled-components |
| Wallet | CSPR.click |
| Validator Data | CSPR.cloud API |
| Deployment | Vercel (frontend), Casper 2.0 Testnet |

---

## Roadmap

### Completed
- [x] V15 Exchange rate mechanism
- [x] V16.1 UX Visual Refont (accordion validator selector)
- [x] **V17 Multi-validator delegation**
- [x] **Real Casper Auction Pool staking**
- [x] **Withdrawal queue (7 era unbonding)**
- [x] **9 approved validators with real data**
- [x] **Live on Vercel testnet**

### Next Steps
- [ ] Test unstake flow end-to-end
- [ ] Test claim_withdrawal after unbonding
- [ ] harvest_rewards automation
- [ ] Security audit
- [ ] Mainnet deployment

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| **V17** | Dec 2025 | **Multi-validator delegation** - Real Auction Pool staking, withdrawal queue, 9 validators |
| **V16.1** | Dec 2025 | **UX Visual Refont** - Accordion validator selector, grid layout, real-time data |
| **V16** | Dec 2025 | UI improvements, dark theme |
| **V15.1** | Dec 2025 | Live RPC API - Real-time contract stats |
| **V15** | Dec 2025 | Exchange rate mechanism - stCSPR appreciation |
| **V14** | Dec 2025 | Production-ready with integrated CEP-18 |
| **V1-V13** | Nov-Dec 2025 | Development iterations |

---

## Links

- **Live Demo:** https://casper-projet.vercel.app
- **V17 Contract:** https://testnet.cspr.live/contract-package/c549746587ab0fe02f2f72246d52f6cf21d030c6aaac9908191f12e02dd73747
- **Odra Framework:** https://odra.dev
- **Casper Network:** https://casper.network

---

## 🔗 Links

| | |
|---|---|
| 🌐 **Live Demo** | https://casper-projet.vercel.app |
| 📜 **Contract** | [View on Testnet](https://testnet.cspr.live/contract-package/2b6c14a2cac5cfe4a1fd1efc2fc02b1090dbc3a6b661a329b90c829245540985) |
| 🛠️ **Odra Framework** | https://odra.dev |
| 🌍 **Casper Network** | https://casper.network |
| 🚰 **Testnet Faucet** | https://faucet.casper.network |

---

<p align="center">
  <b>🏆 Casper Hackathon 2025</b> • <b>DoraHacks</b> • <b>DeFi Track</b>
</p>

<p align="center">
  <i>Stake smart. Stay liquid.</i> 💎
</p>
