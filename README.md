# StakeVue - Liquid Staking Protocol for Casper Network

![Casper Network](https://img.shields.io/badge/Casper-Testnet-blue)
![Status](https://img.shields.io/badge/Status-Live-success)
![Version](https://img.shields.io/badge/Version-6.0.0-brightgreen)
![Security](https://img.shields.io/badge/Security-A+-success)
![License](https://img.shields.io/badge/License-MIT-green)

**Hackathon:** Casper Hackathon 2025 on DoraHacks
**Track:** DeFi - Liquid Staking

---

## Live Demo

**Web App:** [https://casper-stake.vercel.app](https://casper-stake.vercel.app)

**Contract on Explorer:** [View on Testnet](https://testnet.cspr.live/contract/3a209b27d48b8e288a52f1c4973bf4be290366214de728a65d4e2d3fb5f65d80)

---

## Overview

StakeVue is a **liquid staking protocol** built on Casper Network that introduces **stCSPR**, a transferable liquid staking token.

### How It Works

```
1. Connect Wallet     →  Use CSPR.click to connect
2. Stake CSPR         →  Enter amount and stake
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

**Example Fix:**
```rust
// V4.0 - VULNERABLE
let new_stake = current_stake - amount;  // Could underflow!

// V5.0 - SECURED
let new_stake = current_stake.checked_sub(amount)
    .unwrap_or_revert_with(ApiError::User(211));  // Safe revert
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

## Smart Contract

### Deployed Contract

```
Contract Hash: 3a209b27d48b8e288a52f1c4973bf4be290366214de728a65d4e2d3fb5f65d80
Network: casper-test
Entry Points: 18
Code: 857 lines
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
| **V6.0** | React frontend with CSPR.click, Vercel deployment |
| **V5.0** | Security hardening, 10 vulnerabilities fixed, A+ audit |
| **V4.0** | Multi-validator support, round-robin distribution |
| **V3.0** | stCSPR liquid token, ERC20-like interface |
| **V2.0** | Per-user tracking, rewards calculation |
| **V1.0** | Core stake/unstake functionality |

### V6.1 Development (Not Deployed)

We developed V6.1 with **real CSPR transfers** but couldn't deploy due to CORS restrictions when fetching user purse data from the browser.

**Details:** [docs/V6.1-DEVELOPMENT-NOTES.md](./docs/V6.1-DEVELOPMENT-NOTES.md)

---

## Links

- **Live Demo:** https://casper-stake.vercel.app
- **Contract:** https://testnet.cspr.live/contract/3a209b27d48b8e288a52f1c4973bf4be290366214de728a65d4e2d3fb5f65d80
- **CasperSecure:** https://github.com/le-stagiaire-ag2r/CasperSecure
- **Casper Network:** https://casper.network

---

## License

MIT License - see LICENSE file for details

---

**Built for Casper Hackathon 2025**

**StakeVue - Liquid Staking Made Simple**
