# 🌌 StakeVue

![Casper Network](https://img.shields.io/badge/Casper-2.0_Testnet-blue)
![Status](https://img.shields.io/badge/Status-V21_Odra_2.5.0-brightgreen)
![Framework](https://img.shields.io/badge/Framework-Odra_2.5.0-purple)
![License](https://img.shields.io/badge/License-MIT-green)

<p align="center">
  <img src="https://img.shields.io/badge/Casper-2.0_Testnet-00D4FF?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Version-21-8B5CF6?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Odra-2.5.0-FF6B35?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge"/>
</p>

<p align="center">
  <b>🎯 Casper Hackathon 2025</b> • <b>💰 DeFi Track</b> • <b>🏆 DoraHacks</b>
</p>

--- Please note that when reading this, the site is constantly evolving. This readme may not be up-to-date, some figures may have changed, or the logic may have been altered. In short, nothing technically serious, but be aware.

**V21 Contract on Testnet:** [View on Explorer](https://testnet.cspr.live/contract-package/550546bc677e6712faa79b280469c1c550031f825e5d95d038b235d22e83b655)

---

## 🎉 V21 - Odra 2.5.0 Upgrade (Pool-Based Architecture)

### ✅ Deployed & Ready for Testing

V21 upgrades to **Odra 2.5.0** while maintaining the same pool-based liquid staking architecture from V20:

| Step | Command | Status |
|------|---------|--------|
| ✅ Deploy | `cargo run --bin deploy_v21 --features livenet` | **Done** |
| 🔧 Add Validators | `cargo run --bin add_validators_v21 --features livenet` | **Next** |
| 🔧 User Stake | `cargo run --bin test_stake_v21 --features livenet` | Pending |
| 🔧 Admin Delegate | `cargo run --bin admin_delegate_v20 --features livenet` | Pending |
| 🔧 User Request Unstake | `cargo run --bin test_request_unstake_v20 --features livenet` | Pending |
| 🔧 Admin Undelegate | `cargo run --bin admin_undelegate_v20 --features livenet` | Pending |
| 🔧 Admin Add Liquidity | `cargo run --bin admin_add_liquidity_v20 --features livenet` | Pending |
| 🔧 User Claim | `cargo run --bin test_claim_v20 --features livenet` | Pending |

### V20 Architecture

```
+---------------------------------------------------------------------+
|  V20 POOL-BASED ARCHITECTURE (Wise Lending Style)                   |
|                                                                     |
|  STAKE FLOW:                                                        |
|  User 500 CSPR --> Pool --> Admin delegates --> Validator           |
|       |                                                             |
|       v                                                             |
|  Mint 500 stCSPR (immediate)                                        |
|                                                                     |
|  UNSTAKE FLOW:                                                      |
|  1. User request_unstake() --> Burns stCSPR, creates request        |
|  2. Admin undelegate() --> Removes from validator                   |
|  3. Wait 7 eras (~14h) --> Unbonding period                         |
|  4. Admin add_liquidity() --> CSPR returns to pool                  |
|  5. User claim() --> Receives CSPR                                  |
+---------------------------------------------------------------------+
```

### Why Pool-Based?

V20 solves the **error 64658** (purse mismatch) that plagued V17-V19:

| Architecture | Direct Delegation | Pool-Based (V20) |
|--------------|-------------------|------------------|
| User delegates | User → Validator | User → Pool |
| Admin delegates | N/A | Pool → Validator |
| Undelegate | User (fails 64658) | Admin (works!) |
| Complexity | Simple but buggy | More steps but reliable |

---

## ⚠️ Known Issue: Web Frontend vs CLI

### CLI (Rust/Odra) = ✅ 100% Working

All operations work perfectly via command line:

```bash
cd stakevue_contract

# Full cycle test
cargo run --bin test_stake_v20 --features livenet
cargo run --bin admin_delegate_v20 --features livenet
cargo run --bin test_request_unstake_v20 --features livenet
cargo run --bin admin_undelegate_v20 --features livenet
# Wait ~14 hours for unbonding
cargo run --bin admin_add_liquidity_v20 --features livenet
cargo run --bin test_claim_v20 --features livenet
```

### Web Frontend (Vercel) = ⚠️ Partial

| Function | Web Status | Issue |
|----------|------------|-------|
| **Stake** | ✅ Working | Uses proxy_caller.wasm correctly |
| **Unstake** | ❌ Error 19 | SDK serialization issue with U256 |
| **Claim** | ❌ Error 19 | SDK serialization issue with u64 |

**Root Cause:** The `casper-js-sdk` v5 serializes `RuntimeArgs` differently than Odra expects. When passing U256 or u64 arguments through `proxy_caller.wasm`, the deserialization fails with `LeftOverBytes [19]`.

**Workaround:** Use CLI for unstake/claim operations until SDK compatibility is fixed.

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

### V21 Contract (Current - Odra 2.5.0)

| Property | Value |
|----------|-------|
| **Package Hash** | `550546bc677e6712faa79b280469c1c550031f825e5d95d038b235d22e83b655` |
| **Network** | casper-test |
| **Framework** | Odra 2.5.0 |
| **Token Standard** | CEP-18 (integrated stCSPR) |
| **Min Stake** | 500 CSPR |
| **Architecture** | Pool-based (Wise Lending style) |

### V20 Contract (Archived)

| Property | Value |
|----------|-------|
| **Package Hash** | `2d74e6397ffa1e7fcb63a18e0b4f60f5b2d14242273fce0f30efc0e95ce8e937` |
| **Status** | Archived - Upgraded to V21 with Odra 2.5.0 |

### Entry Points (V21)

#### User Functions
| Function | Type | Description |
|----------|------|-------------|
| `stake(validator)` | Payable | Stake CSPR to pool, choose validator for admin delegation |
| `request_unstake(stcspr_amount)` | Public | Burn stCSPR, create withdrawal request (NO validator param) |
| `claim_withdrawal(request_id)` | Public | Claim CSPR after unbonding + liquidity added |

#### Admin Functions
| Function | Type | Description |
|----------|------|-------------|
| `admin_delegate(validator, amount)` | Owner | Delegate pool CSPR to validator |
| `admin_undelegate(validator, amount)` | Owner | Undelegate from validator |
| `admin_add_liquidity()` | Owner | Transfer unbonded CSPR back to pool |
| `add_approved_validator(pk)` | Owner | Add validator to whitelist |
| `remove_approved_validator(pk)` | Owner | Remove from whitelist |

#### View Functions
| Function | Description |
|----------|-------------|
| `get_exchange_rate()` | Current stCSPR/CSPR rate (9 decimals) |
| `get_stcspr_balance(account)` | User's stCSPR balance |
| `get_cspr_value(account)` | User's CSPR value (stCSPR × rate) |
| `get_pending_withdrawals()` | Total pending withdrawal requests |
| `get_withdrawal_amount(request_id)` | CSPR amount for a withdrawal request |

### V17 Contract (Archived)

| Property | Value |
|----------|-------|
| **Contract Hash** | `c549746587ab0fe02f2f72246d52f6cf21d030c6aaac9908191f12e02dd73747` |
| **Status** | Archived - Had error 64658 on undelegate |

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

### Completed ✅
- [x] V15 Exchange rate mechanism
- [x] V16.1 UX Visual Refont (accordion validator selector)
- [x] V17 Multi-validator delegation
- [x] V18-V19 Debug iterations (error 64658)
- [x] **V20 Pool-based architecture (Wise Lending style)**
- [x] **Full cycle tested: stake → delegate → unstake → undelegate → claim**
- [x] **Error 64658 solved with admin-controlled delegation**
- [x] **Live on Vercel testnet (stake working)**

### In Progress 🔧
- [ ] Fix web frontend unstake/claim (SDK serialization issue)
- [ ] Investigate casper-js-sdk v5 RuntimeArgs compatibility

### Next Steps 📋
- [ ] harvest_rewards automation (auto-compound)
- [ ] Security audit
- [ ] Mainnet deployment

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| **V21** | Dec 2025 | **Odra 2.5.0 Upgrade** - Same pool-based architecture, upgraded framework for better validator support |
| **V20** | Dec 2025 | **Pool-based architecture** - Wise Lending style, admin delegation, full cycle working via CLI |
| **V19** | Dec 2025 | Debug attempt - still had 64658 |
| **V18** | Dec 2025 | Debug attempt - purse mismatch issues |
| **V17** | Dec 2025 | **Multi-validator delegation** - Real Auction Pool staking, withdrawal queue, 9 validators |
| **V16.1** | Dec 2025 | **UX Visual Refont** - Accordion validator selector, grid layout, real-time data |
| **V16** | Dec 2025 | **Visual Overhaul** - Galaxy background, glass UI, SVG icons, purple theme |
| **V15.1** | Dec 2025 | **Live RPC API** - Real-time contract stats from blockchain |
| **V15** | Dec 2025 | **Exchange rate mechanism** - stCSPR appreciates with rewards |
| **V14** | Dec 2025 | Production-ready with integrated CEP-18 stCSPR token |
| **V13** | Dec 2025 | Minimal version proving payable works |
| **V12** | Dec 2025 | CEP-18 attempt (package key conflict) |
| **V11** | Dec 2025 | External token reference debugging |
| **V10** | Dec 2025 | Token integration attempts |
| **V9** | Dec 2025 | External token reference (broken attached_value) |
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

## Links

| | |
|---|---|
| 🌐 **Live Demo** | https://casper-projet.vercel.app |
| 📜 **V21 Contract** | [View on Testnet](https://testnet.cspr.live/contract-package/550546bc677e6712faa79b280469c1c550031f825e5d95d038b235d22e83b655) |
| 📜 **V20 Contract (Archived)** | [View on Testnet](https://testnet.cspr.live/contract-package/2d74e6397ffa1e7fcb63a18e0b4f60f5b2d14242273fce0f30efc0e95ce8e937) |
| 📜 **V17 Contract (Archived)** | [View on Testnet](https://testnet.cspr.live/contract-package/c549746587ab0fe02f2f72246d52f6cf21d030c6aaac9908191f12e02dd73747) |
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
