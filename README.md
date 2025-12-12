# StakeVue - Liquid Staking Protocol for Casper Network

![Casper Network](https://img.shields.io/badge/Casper-2.0_Testnet-blue)
![Status](https://img.shields.io/badge/Status-V16_Visual_Overhaul-brightgreen)
![Framework](https://img.shields.io/badge/Framework-Odra_2.4.0-purple)
![License](https://img.shields.io/badge/License-MIT-green)

**Hackathon:** Casper Hackathon 2025 on DoraHacks
**Track:** DeFi - Liquid Staking

---

## Live Demo

**Web App:** [https://casper-projet.vercel.app](https://casper-projet.vercel.app)

**V15 Contract on Testnet:** [View on Explorer](https://testnet.cspr.live/contract-package/2b6c14a2cac5cfe4a1fd1efc2fc02b1090dbc3a6b661a329b90c829245540985)

---

## V16 - Visual Overhaul

Complete UI/UX redesign with premium crypto aesthetics:

### Design System

| Feature | Description |
|---------|-------------|
| **Galaxy Background** | 3D WebGL animated background with 15,000 particles |
| **Glass Morphism** | Transparent cards with backdrop blur effect |
| **Purple Theme** | Cosmic purple accent (#8b5cf6) throughout |
| **Custom Cursor** | Animated cursor with glow effects |
| **SVG Icons** | Clean vector icons replacing all emojis |
| **Pill Navigation** | Floating glass buttons with hover effects |

### UI Components

```
+--------------------------------------------------+
|  Navigation (transparent, pill buttons)           |
+--------------------------------------------------+
|                                                  |
|  +-- Galaxy Background (WebGL 3D)                |
|  |                                               |
|  |  +----------------------------------------+   |
|  |  |  Glass Card (rgba(20,10,30,0.6))       |   |
|  |  |  - Backdrop blur                       |   |
|  |  |  - Purple border on hover              |   |
|  |  |  - SVG icons                           |   |
|  |  +----------------------------------------+   |
|  |                                               |
+--------------------------------------------------+
```

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

## Features

### Staking
- **Stake/Unstake** - Full CSPR.click wallet integration
- **Exchange Rate** - Dynamic rate that appreciates with rewards
- **Transaction History** - Track all your stake/unstake actions
- **stCSPR Token** - CEP-18 compliant liquid token

### Analytics
- **Global Stats** - Network APY, total staked, validators
- **Price Chart** - Historical CSPR price with 7d/30d/1y views
- **TVL Chart** - Total Value Locked over time
- **Validator Ranking** - Compare validators by performance

### Tools
- **Staking Calculator** - Estimate rewards by amount and duration
- **Validator Comparator** - Side-by-side validator comparison
- **Price Alerts** - Set alerts for CSPR price targets
- **CSV Export** - Export transaction history

### Gamification
- **NFT Badges** - Earn badges for staking milestones
- **Leaderboard** - Top stakers ranking
- **Portfolio History** - Track portfolio value over time

### Admin
- **Admin Panel** - Password protected (default: `stakevue2024`)
- **Settings** - Theme, notifications, preferences
- **FAQ Bot** - AI-powered help assistant

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

---

## Contract Details

| Property | Value |
|----------|-------|
| **Package Hash** | `2b6c14a2cac5cfe4a1fd1efc2fc02b1090dbc3a6b661a329b90c829245540985` |
| **Network** | casper-test |
| **Framework** | Odra 2.4.0 |
| **Token Standard** | CEP-18 (integrated) |
| **Exchange Rate** | Dynamic (rewards-based) |

### Entry Points

| Function | Type | Description |
|----------|------|-------------|
| `stake()` | Payable | Stake CSPR, receive stCSPR at current rate |
| `unstake(amount)` | Public | Burn stCSPR, receive CSPR at current rate |
| `add_rewards()` | Owner/Payable | Add rewards to pool (increases rate) |
| `get_exchange_rate()` | View | Current rate (9 decimals) |
| `get_stcspr_balance(addr)` | View | stCSPR balance |
| `get_cspr_value(addr)` | View | CSPR value of stCSPR balance |

---

## Project Structure

```
Casper-projet/
+-- client/                      # React frontend
|   +-- src/
|   |   +-- components/          # UI components
|   |   |   +-- ui/              # Galaxy, Cursor, etc.
|   |   +-- pages/               # Home, Stake, Guide
|   |   +-- styles/              # Design tokens
|   |   +-- hooks/               # useStaking, useCsprClick
|   +-- api/
|       +-- contract-stats.js    # Vercel serverless API
+-- stakevue_contract/           # Odra smart contract
|   +-- src/lib.rs               # V15 contract
|   +-- bin/                     # Deploy/test scripts
+-- scripts/                     # Node.js utilities
+-- archive/                     # Old versions (V1-V14)
```

---

## Live Blockchain API

Real-time data from the deployed V15 contract:

```
GET https://casper-projet.vercel.app/api/contract-stats
```

```json
{
  "exchangeRate": 1275000000,
  "totalPool": 27000000000,
  "totalStcspr": 21176470587,
  "exchangeRateFormatted": "1.2750",
  "totalPoolCspr": 27
}
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
cargo odra build
cargo test
cargo run --bin deploy_v15 --features livenet
```

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Smart Contract | Rust, Odra 2.4.0, CEP-18 |
| Frontend | React 18, TypeScript, styled-components |
| 3D Graphics | Three.js, React Three Fiber |
| Wallet | CSPR.click |
| Deployment | Vercel, Casper 2.0 Testnet |

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| **V16** | Dec 2025 | **Visual Overhaul** - Galaxy background, glass UI, SVG icons, purple theme |
| **V15.1** | Dec 2025 | Live RPC API - Real-time contract stats |
| **V15** | Dec 2025 | Exchange rate mechanism - stCSPR appreciation |
| **V14** | Dec 2025 | Production-ready with integrated CEP-18 |
| **V1-V13** | Nov-Dec 2025 | Iterations (see archive/) |

---

## Links

- **Live Demo:** https://casper-projet.vercel.app
- **Contract:** https://testnet.cspr.live/contract-package/2b6c14a2cac5cfe4a1fd1efc2fc02b1090dbc3a6b661a329b90c829245540985
- **Odra Framework:** https://odra.dev
- **Casper Network:** https://casper.network

---

## License

MIT License

---

**Built for Casper Hackathon 2025**

**StakeVue - Liquid Staking Made Simple**
