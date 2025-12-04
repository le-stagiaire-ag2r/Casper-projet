# StakeVue - Liquid Staking Protocol for Casper Network

![Casper Network](https://img.shields.io/badge/Casper-Testnet-blue)
![Status](https://img.shields.io/badge/Status-Demo-yellow)
![Version](https://img.shields.io/badge/Version-6.0.0-brightgreen)
![Security](https://img.shields.io/badge/Security-A+-success)
![License](https://img.shields.io/badge/License-MIT-green)

**Hackathon:** Casper Hackathon 2025 on DoraHacks
**Track:** DeFi - Liquid Staking

---

## Live Demo

**Web App:** casper-projet.vercel.app
**Contract on Explorer:** [View on Testnet](https://testnet.cspr.live/contract/3a209b27d48b8e288a52f1c4973bf4be290366214de728a65d4e2d3fb5f65d80)

---

## Current State - Important Notice

### What Works Now (V6.0 - Demo Version)

The current deployed version is a **demonstration/showcase site**:

| Feature | Status | Details |
|---------|--------|---------|
| Connect Wallet | ✅ Works | CSPR.click integration |
| Stake Interface | ✅ Works | Enter amount, sign transaction |
| Unstake Interface | ✅ Works | Enter amount, sign transaction |
| stCSPR Tracking | ✅ Works | Internal balance tracking |
| Contract Execution | ✅ Works | Transaction succeeds on-chain |
| **Real CSPR Transfer** | ❌ No | CSPR stays in your wallet |

**In other words:** The contract executes successfully, you can see it on the explorer, but your CSPR tokens **don't actually move**. It's an internal tracking system that demonstrates the liquid staking concept.

### What We Built (V6.1 - Real Transfers)

We developed a **new contract** (V6.1) that actually transfers CSPR:

```
V6.1 Contract Hash: d59ba3b52cbf5678f4a3e926e40758316b1119abd3cf8dbdd07300f601e42499
Status: Deployed on Testnet ✅
Integration: NOT POSSIBLE ❌
```

**Why V6.1 wasn't deployed to the frontend:**

To transfer real CSPR, the frontend needs to fetch the user's "purse" (wallet address) from the Casper network. Browser security (CORS) blocks these requests.

| Solution Tried | Result |
|----------------|--------|
| Direct RPC call | Blocked by CORS |
| Vercel Serverless Function | Runtime errors |
| CORS Proxies (5 different ones) | All failed |
| CSPR.cloud API | CORS issues |

**Full technical details:** [docs/V6.1-DEVELOPMENT-NOTES.md](./docs/V6.1-DEVELOPMENT-NOTES.md)

### Summary

```
┌─────────────────────────────────────────────────────────────────┐
│  CURRENT LIVE SITE (V6.0)                                       │
│  ─────────────────────────────────────────────────────────────  │
│  ✅ Contract works                                              │
│  ✅ UI works                                                    │
│  ✅ Wallet connection works                                     │
│  ❌ CSPR doesn't move (demo/showcase only)                      │
├─────────────────────────────────────────────────────────────────┤
│  NEW CONTRACT DEVELOPED (V6.1)                                  │
│  ─────────────────────────────────────────────────────────────  │
│  ✅ Contract deployed and working on testnet                    │
│  ✅ Real CSPR transfers work                                    │
│  ❌ Can't connect frontend (CORS blocking)                      │
│  📋 Needs backend server to proxy requests                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Overview

StakeVue is a **liquid staking protocol** built on Casper Network that introduces **stCSPR**, a transferable liquid staking token.

### How It Works (Concept)

```
1. Connect Wallet     →  Use CSPR.click to connect
2. Stake CSPR         →  Deposit CSPR into the contract
3. Receive stCSPR     →  Get 1 stCSPR per 1 CSPR staked
4. Earn Rewards       →  10% APY on staked CSPR
5. Stay Liquid        →  Transfer/trade your stCSPR freely
6. Unstake Anytime    →  Burn stCSPR to get CSPR back
```

**Example:** Stake 1000 CSPR → Get 1000 stCSPR → Your CSPR earns rewards while you use stCSPR!

---

## Features

### Core Staking
- **Stake CSPR** - Deposit CSPR and receive stCSPR tokens (1:1 ratio)
- **Unstake CSPR** - Burn stCSPR to withdraw your CSPR
- **10% APY** - Earn staking rewards on your deposited CSPR

### Liquid Token (stCSPR)
- **Transferable** - Send stCSPR to any account
- **Tradeable** - Use in DeFi protocols
- **ERC20-like** - Standard token interface (name, symbol, decimals)

### Multi-Validator (V4.0+)
- **10 Validators** - Stake across multiple validators
- **Round-Robin** - Intelligent distribution algorithm
- **Admin Managed** - Secure validator list management

### Security (V5.0+)
- **Audited** - CasperSecure automated analysis (A+ grade)
- **Safe Arithmetic** - All operations use checked_add/checked_sub
- **10 Vulnerabilities Fixed** - Integer overflow/underflow eliminated

---

## Security Story

### How We Found and Fixed Critical Bugs

We built **[CasperSecure](https://github.com/le-stagiaire-ag2r/CasperSecure)** - an automated security analyzer for Casper contracts. Then we used it on our own contract.

**Result:** 10 critical arithmetic vulnerabilities found and fixed.

```
Before (V4.0)                          After (V5.0)
─────────────────────────────────────────────────────────
Security Score: 0/100 (F)       →     100/100 (A+)
MEDIUM Vulns: 10                →     0
Attack Risk: HIGH               →     PROTECTED
```

**Full Report:** [SECURITY_AUDIT_BEFORE_AFTER.md](./SECURITY_AUDIT_BEFORE_AFTER.md)

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Smart Contract** | Rust, casper-contract 5.0.0, WASM |
| **Frontend** | React, TypeScript, styled-components |
| **Wallet** | CSPR.click integration |
| **Deployment** | Vercel (frontend), Casper Testnet (contract) |

---

## Project Structure

```
Casper-projet/
├── client/                    # React frontend (Vercel)
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/          # Casper transaction builders
│   │   └── hooks/             # Custom React hooks
│   └── public/
├── smart-contract/            # Rust contract
│   └── src/lib.rs             # Contract code (857 lines)
├── docs/                      # Documentation
│   └── V6.1-DEVELOPMENT-NOTES.md
├── keys/                      # Deployment keys
├── archive/                   # Old files (reference)
└── README.md
```

---

## Smart Contracts

### Current Contract (V6.0 - Demo)

```
Contract Hash: 3a209b27d48b8e288a52f1c4973bf4be290366214de728a65d4e2d3fb5f65d80
Network: casper-test
Type: Internal tracking (no real transfers)
Status: Live on Vercel
```

### New Contract (V6.1 - Real Transfers)

```
Contract Hash: d59ba3b52cbf5678f4a3e926e40758316b1119abd3cf8dbdd07300f601e42499
Network: casper-test
Type: Real CSPR transfers
Status: Deployed but not integrated (CORS blocking)
```

### Entry Points

| Function | Description |
|----------|-------------|
| `stake(amount)` | Stake CSPR, mint stCSPR |
| `unstake(amount)` | Burn stCSPR, unstake CSPR |
| `transfer_stcspr(recipient, amount)` | Transfer stCSPR tokens |
| `get_my_stake()` | Query your staked CSPR |
| `my_stcspr_balance()` | Query your stCSPR balance |
| `calculate_my_rewards()` | Calculate your rewards (10% APY) |
| `total_supply_stcspr()` | Total stCSPR in circulation |
| `get_staked_amount()` | Total CSPR staked (all users) |
| `add_validator(pubkey)` | Add validator (admin) |
| `remove_validator(pubkey)` | Remove validator (admin) |
| `get_validators()` | List approved validators |

---

## Local Development

### Prerequisites

- Node.js 18+
- Rust nightly-2024-07-31
- Casper CLI tools

### Run Frontend

```bash
cd client
npm install
npm start
```

Open http://localhost:3000

### Build Contract

```bash
cd smart-contract
rustup override set nightly-2024-07-31
rustup target add wasm32-unknown-unknown
cargo build --release --target wasm32-unknown-unknown
```

---

## Version History

| Version | Highlights |
|---------|------------|
| **V6.1** | Real CSPR transfers (deployed but not integrated - CORS) |
| **V6.0** | React frontend with CSPR.click, Vercel deployment |
| **V5.0** | Security hardening, 10 vulnerabilities fixed, A+ audit |
| **V4.0** | Multi-validator support, round-robin distribution |
| **V3.0** | stCSPR liquid token, ERC20-like interface |
| **V2.0** | Per-user tracking, rewards calculation |
| **V1.0** | Core stake/unstake functionality |

---

## Next Steps (Future Work)

To enable real CSPR transfers (V6.1), we need:

1. **Backend Proxy Server** - Node.js/Express server to proxy RPC calls and bypass CORS
2. **Or** - Wait for CSPR.click to add native purse fetching support

The V6.1 contract is ready and working. Only the frontend integration is blocked.

---

## Links

- **Live Demo:** https://casper-stake.vercel.app
- **Current Contract (V6.0):** https://testnet.cspr.live/contract/3a209b27d48b8e288a52f1c4973bf4be290366214de728a65d4e2d3fb5f65d80
- **New Contract (V6.1):** https://testnet.cspr.live/contract/d59ba3b52cbf5678f4a3e926e40758316b1119abd3cf8dbdd07300f601e42499
- **CasperSecure:** https://github.com/le-stagiaire-ag2r/CasperSecure
- **Casper Network:** https://casper.network

---

## License

MIT License - see LICENSE file for details

---

**Built for Casper Hackathon 2025**

**StakeVue - Liquid Staking Made Simple**
