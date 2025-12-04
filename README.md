# StakeVue - Liquid Staking Protocol for Casper Network

![Casper Network](https://img.shields.io/badge/Casper-Testnet-blue)
![Status](https://img.shields.io/badge/Status-Demo-yellow)
![Version](https://img.shields.io/badge/Version-6.2.0-brightgreen)
![Security](https://img.shields.io/badge/Security-A+-success)
![License](https://img.shields.io/badge/License-MIT-green)

**Hackathon:** Casper Hackathon 2025 on DoraHacks
**Track:** DeFi - Liquid Staking

---

## Live Demo

**Web App:** [https://casper-projet.vercel.app](https://casper-projet.vercel.app)

**Contract on Explorer:** [View on Testnet](https://testnet.cspr.live/contract/3a209b27d48b8e288a52f1c4973bf4be290366214de728a65d4e2d3fb5f65d80)

---

## What is StakeVue?

StakeVue is a **liquid staking protocol** for Casper Network. Stake your CSPR and receive **stCSPR** tokens that you can use while earning staking rewards.

```
Stake CSPR → Get stCSPR → Earn 10% APY → Stay Liquid
```

---

## Features (V6.2)

### Core Staking
| Feature | Description |
|---------|-------------|
| Stake CSPR | Deposit CSPR and receive stCSPR (1:1 ratio) |
| Unstake | Burn stCSPR to get your CSPR back |
| 10% APY | Earn staking rewards automatically |

### Live Blockchain Data
| Feature | Description |
|---------|-------------|
| Real Balance | Fetch your actual CSPR balance from blockchain |
| CSPR Price | Live USD price from CoinGecko API |
| Auto-Refresh | Balance updates every 30s, price every 60s |
| LIVE/DEMO Badge | Shows if data is real or simulated |

### Interactive Tools
| Feature | Description |
|---------|-------------|
| Staking Calculator | Estimate earnings over 1-36 months |
| Rewards Chart | Visual projection of 12-month earnings |
| Validator Ranking | Top validators with APY, stake, commission |

### User Experience
| Feature | Description |
|---------|-------------|
| Sound Notifications | Audio feedback on transaction success/error |
| Toast Notifications | Visual alerts with auto-dismiss |
| Input Validation | Real-time validation with error messages |
| Preview Box | "You will receive" preview before staking |
| Copy Hash | One-click copy transaction hash |

### Multi-Page Navigation
| Page | Description |
|------|-------------|
| Home | Landing page with protocol overview |
| Stake | Full staking interface with all tools |
| Guide | Step-by-step instructions |

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Smart Contract** | Rust, casper-contract 5.0.0, WASM |
| **Frontend** | React 18, TypeScript, styled-components |
| **Wallet** | CSPR.click integration |
| **Data** | CSPR.cloud API, CoinGecko API |
| **Deployment** | Vercel (frontend), Casper Testnet (contract) |

---

## Project Structure

```
Casper-projet/
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx        # Portfolio summary with live data
│   │   │   ├── StakingForm.tsx      # Stake/unstake form
│   │   │   ├── StakeHistory.tsx     # Transaction history
│   │   │   ├── StakingCalculator.tsx # Earnings calculator
│   │   │   ├── RewardsChart.tsx     # 12-month projection chart
│   │   │   ├── ValidatorRanking.tsx # Top validators table
│   │   │   ├── Toast.tsx            # Notification system
│   │   │   └── Navigation.tsx       # Multi-page navigation
│   │   ├── hooks/
│   │   │   ├── useBalance.ts        # Blockchain balance + CSPR price
│   │   │   ├── useCsprClick.ts      # Wallet connection
│   │   │   └── useStaking.ts        # Staking operations
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── StakePage.tsx
│   │   │   └── GuidePage.tsx
│   │   └── utils/
│   │       └── notificationSound.ts # Web Audio API sounds
│   └── public/
│       └── config.js                # Runtime configuration
├── smart-contract/              # Rust contract
│   └── src/lib.rs
├── docs/                        # Documentation
├── archive/                     # Old versions (reference only)
└── README.md
```

---

## Smart Contract

### Current Contract

```
Contract Hash: 3a209b27d48b8e288a52f1c4973bf4be290366214de728a65d4e2d3fb5f65d80
Network: casper-test
Status: Live on Vercel
```

### Entry Points

| Function | Description |
|----------|-------------|
| `stake(amount)` | Stake CSPR, receive stCSPR |
| `unstake(amount)` | Burn stCSPR, get CSPR back |
| `transfer_stcspr(recipient, amount)` | Transfer stCSPR tokens |
| `get_my_stake()` | Query your staked amount |
| `my_stcspr_balance()` | Query your stCSPR balance |
| `calculate_my_rewards()` | Calculate rewards (10% APY) |

---

## API Integrations

### CSPR.cloud API
- **Purpose:** Fetch real CSPR balance from blockchain
- **Endpoint:** `https://api.testnet.cspr.cloud/accounts/{publicKey}`
- **Refresh:** Every 30 seconds

### CoinGecko API
- **Purpose:** Get live CSPR price in USD
- **Endpoint:** `https://api.coingecko.com/api/v3/simple/price`
- **Data:** Price + 24h change percentage
- **Refresh:** Every 60 seconds

---

## Local Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Run Frontend

```bash
cd client
npm install
npm start
```

Open http://localhost:3000

### Build for Production

```bash
cd client
npm run build
```

---

## Version History

| Version | Highlights |
|---------|------------|
| **V6.2** | Live blockchain data, CSPR price, charts, sound notifications |
| **V6.1** | Multi-page navigation, toast notifications, staking calculator |
| **V6.0** | React frontend with CSPR.click, Vercel deployment |
| **V5.0** | Security hardening, A+ audit score |
| **V4.0** | Multi-validator support |
| **V3.0** | stCSPR liquid token |

---

## What's New in V6.2

### Live Data Integration
- Real CSPR balance from CSPR.cloud API
- Live USD price from CoinGecko with 24h change
- Auto-refresh (30s balance, 60s price)
- LIVE/DEMO badge to show data source

### Interactive Charts & Tools
- 12-month rewards projection chart (SVG)
- Staking calculator with period slider (1-36 months)
- Validator ranking table with APY, stake, commission

### Enhanced UX
- Sound notifications using Web Audio API (no external files)
- Toast notifications with slide animations
- Input validation with real-time error messages
- "You will receive" preview box
- Copy transaction hash button with feedback

---

## Links

- **Live Demo:** https://casper-projet.vercel.app
- **Contract:** https://testnet.cspr.live/contract/3a209b27d48b8e288a52f1c4973bf4be290366214de728a65d4e2d3fb5f65d80
- **CasperSecure:** https://github.com/le-stagiaire-ag2r/CasperSecure
- **Casper Network:** https://casper.network

---

## License

MIT License

---

**Built for Casper Hackathon 2025**

**StakeVue - Liquid Staking Made Simple**
