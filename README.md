# StakeVue - Liquid Staking Protocol for Casper Network

![Casper Network](https://img.shields.io/badge/Casper-2.0_Testnet-blue)
![Status](https://img.shields.io/badge/Status-V14_Production-brightgreen)
![Framework](https://img.shields.io/badge/Framework-Odra_2.4.0-purple)
![License](https://img.shields.io/badge/License-MIT-green)

**Hackathon:** Casper Hackathon 2025 on DoraHacks
**Track:** DeFi - Liquid Staking

---

## Live Demo

**Web App:** [https://casper-projet.vercel.app](https://casper-projet.vercel.app)

**V14 Contract on Testnet:** [View on Explorer](https://testnet.cspr.live/contract-package/e55ad54bcc8fa35710ca8776675cb79d044a467368c143c2c2771aa150cec696)

---

## What is Liquid Staking?

Traditional staking locks your tokens. **Liquid staking** lets you stake AND keep your liquidity!

```
┌─────────────────────────────────────────────────────────────────┐
│  TRADITIONAL STAKING                                            │
│                                                                 │
│  Your 100 CSPR → Validator → LOCKED for days/weeks              │
│                              You can't use them!                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  LIQUID STAKING (StakeVue)                                      │
│                                                                 │
│  Your 100 CSPR → StakeVue → You get 100 stCSPR                  │
│                                                                 │
│  With your stCSPR you can:                                      │
│  ├── Trade on DEX                                               │
│  ├── Use as collateral in DeFi                                  │
│  ├── Transfer to anyone                                         │
│  └── Unstake anytime to get CSPR back                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## How StakeVue Works

### Stake Flow
```
┌──────────────┐         ┌─────────────────────┐
│  Your Wallet │         │  StakeVue Contract  │
│              │         │                     │
│  -10 CSPR    │ ──────► │  +10 CSPR (stored)  │
│  +10 stCSPR  │ ◄────── │  mint 10 stCSPR     │
└──────────────┘         └─────────────────────┘
```

### Unstake Flow
```
┌──────────────┐         ┌─────────────────────┐
│  Your Wallet │         │  StakeVue Contract  │
│              │         │                     │
│  +10 CSPR    │ ◄────── │  -10 CSPR           │
│  -10 stCSPR  │ ──────► │  BURN 10 stCSPR     │
└──────────────┘         └─────────────────────┘
```

**Important:** stCSPR tokens are **burned** (destroyed) when you unstake. They represent your claim to the staked CSPR - once you withdraw, the claim is gone!

---

## V14 - Production Ready

### Contract Details

| Property | Value |
|----------|-------|
| **Package Hash** | `e55ad54bcc8fa35710ca8776675cb79d044a467368c143c2c2771aa150cec696` |
| **Network** | casper-test |
| **Framework** | Odra 2.4.0 |
| **Token Standard** | CEP-18 (integrated) |
| **Status** | Deployed & Tested |

### Architecture

```rust
#[odra::module]
pub struct StakeVue {
    ownable: SubModule<Ownable>,     // Admin control
    token: SubModule<Cep18>,          // Integrated stCSPR token
    total_staked: Var<U512>,          // Total CSPR in contract
}
```

### Key Features

| Feature | Description |
|---------|-------------|
| **Integrated CEP-18 Token** | stCSPR minted/burned internally via `SubModule<Cep18>` |
| **Payable Stake** | Uses `#[odra(payable)]` + `attached_value()` |
| **Instant Unstake** | Burns stCSPR, returns CSPR immediately |
| **Ownable** | Admin can transfer ownership |

### Entry Points

| Function | Type | Description |
|----------|------|-------------|
| `stake()` | Payable | Stake CSPR, receive stCSPR |
| `unstake(amount)` | Public | Burn stCSPR, receive CSPR |
| `get_stake(address)` | View | Query stCSPR balance |
| `get_total_staked()` | View | Total CSPR in contract |
| `token_symbol()` | View | Returns "stCSPR" |
| `transfer_ownership(new)` | Owner | Transfer admin rights |

---

## Development Journey: V8.2 → V14

We encountered and solved a critical bug during development:

### The Problem
`attached_value()` returned **0** on V9/V10 contracts, breaking the payable stake function.

### Root Cause
Using `Var<Address>` to reference an external token contract interfered with Odra's payable mechanism.

### The Solution
Following the official Casper liquid staking architecture (Halborn audit), we integrated the token directly using `SubModule<Cep18>`.

```
V8.2  → Working (no token, just Mapping<Address, U512>)
V9    → Broken (external token reference)
V10   → Broken (external token with different init)
V12   → Error 64658 (package key conflict)
V13   → Working (minimal, no token - proved payable works)
V14   → Working (V13 + SubModule<Cep18>) ← FINAL
```

### Key Learnings

| Approach | Result |
|----------|--------|
| `Var<Address>` for external token | BROKEN - attached_value() = 0 |
| `SubModule<Cep18>` integrated token | WORKS - attached_value() correct |

---

## Project Structure

```
Casper-projet/
├── client/                      # React frontend
│   ├── public/
│   │   ├── config.js            # V14 contract address
│   │   └── proxy_caller.wasm    # Odra proxy for browser
│   └── src/
│       ├── components/          # UI components
│       ├── hooks/useStaking.ts  # Stake/unstake logic
│       └── services/
│           └── transaction.ts   # Transaction builder
├── stakevue_contract/           # Odra smart contract
│   ├── src/lib.rs               # V14 contract code
│   ├── Cargo.toml               # Dependencies
│   ├── Odra.toml                # Odra config
│   └── bin/                     # Deploy/test scripts
├── api/                         # Vercel serverless
├── archive/                     # Old versions (V1-V8)
└── README.md
```

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

# Run tests
cargo test

# Deploy to testnet (requires secret_key.pem)
cargo run --bin deploy_v14 --features livenet
```

---

## Transaction Flow (Technical)

When you stake via the frontend:

```
1. Frontend builds transaction with proxy_caller.wasm
2. User signs with CSPR.click wallet
3. proxy_caller creates cargo purse with attached CSPR
4. proxy_caller calls StakeVue.stake() entry point
5. Contract receives CSPR via attached_value()
6. Contract mints stCSPR via SubModule<Cep18>.raw_mint()
7. Staked event emitted
```

---

## Risk Levels

| Strategy | Risk | Reward |
|----------|------|--------|
| HODL CSPR | None | None |
| Liquid stake (keep stCSPR safe) | Low | ~15% APY* |
| Use stCSPR in DeFi | High | Variable |

*APY when validator delegation is implemented

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

### Next Steps
- [ ] Validator delegation (real staking rewards)
- [ ] Exchange rate mechanism (stCSPR appreciation)
- [ ] Security audit
- [ ] Mainnet deployment

---

## Links

- **Live Demo:** https://casper-projet.vercel.app
- **V14 Contract:** https://testnet.cspr.live/contract-package/e55ad54bcc8fa35710ca8776675cb79d044a467368c143c2c2771aa150cec696
- **Odra Framework:** https://odra.dev
- **Casper Network:** https://casper.network

---

## Version History

| Version | Highlights |
|---------|------------|
| **V14** | Production-ready with integrated CEP-18 stCSPR token |
| **V13** | Minimal version proving payable works |
| **V12** | CEP-18 attempt (package key conflict) |
| **V9-V10** | External token reference (broken attached_value) |
| **V8.2** | Ownable + Pauseable modules |
| **V8.0** | First real CSPR staking with Odra |

---

## License

MIT License

---

**Built for Casper Hackathon 2025**

**StakeVue - Liquid Staking Made Simple**
