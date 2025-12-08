# StakeVue - Liquid Staking Protocol for Casper Network

![Casper Network](https://img.shields.io/badge/Casper-Testnet-blue)
![Status](https://img.shields.io/badge/Status-Demo-yellow)
![Version](https://img.shields.io/badge/Version-7.1.0-brightgreen)
![Open Source](https://img.shields.io/badge/Open_Source-Yes-success)
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
Stake CSPR → Get stCSPR → Earn ~17% APY → Stay Liquid
```

---

## What's New in V7.1 🚀

### Improvements

| Feature | Description |
|---------|-------------|
| **LIVE Data Everywhere** | All components now properly show LIVE/DEMO badges |
| **CORS Fix** | BalanceContext now uses CSPR.click proxy (no more CORS errors) |
| **Stable APY** | Fixed 17% APY display (removed buggy live calculation that showed 74%) |
| **PriceChart Badge** | Added LIVE/DEMO badge to price chart component |

### Bug Fixes

- Fixed PriceChart not showing data source status
- Fixed BalanceContext direct API call causing CORS issues
- Fixed APY calculation returning unrealistic values (74.9% → 17%)

---

## What's New in V7.0

### Features

| Feature | Description |
|---------|-------------|
| **APY Slider** | Choose any APY from 1% to 100% with a free slider |
| **All-Time Price Chart** | View CSPR price history since token creation (May 2021) |
| **Interactive Tooltip** | Hover on chart to see exact date and price |
| **Real CSV Export** | Export your actual wallet transactions and balances |

### CSV Export

| Export Type | Data Source |
|-------------|-------------|
| **Transactions** | Real blockchain data from your connected wallet |
| **Portfolio** | Your actual CSPR and stCSPR balances |
| **Rewards** | Estimated daily rewards based on your staked amount |
| **Price History** | CoinGecko price data (7D, 30D, 90D, 1Y, All Time) |

---

## ⚠️ Data Transparency: Real vs Demo

### Real Data (from Blockchain/APIs)

| Data | Source | Refresh |
|------|--------|---------|
| **Your CSPR Balance** | CSPR.click / CSPR.cloud API | Every 30s |
| **Your Transactions** | Blockchain via API | On demand |
| **Current CSPR Price** | CoinGecko API | Every 60s |
| **Price History (7 days)** | CoinGecko API | On page load |

### Demo/Fallback Data

| Data | Reason | Note |
|------|--------|------|
| **Price History (long term)** | CoinGecko free API rate limiting | Fallback shows realistic pattern based on cspr.live |
| **Validators List** | CORS restrictions on Casper RPC | Static mainnet data snapshot |
| **TVL & Global Stats** | No public aggregator API | Realistic demo values |
| **Leaderboard** | Demo feature | Showcase UI capability |

### Why Some Data Isn't 100% Accurate?

1. **CoinGecko Rate Limiting**: Free API has request limits. When exceeded, we show fallback data that follows the real CSPR price pattern (started high ~$1.20 in May 2021, then declined)

2. **CORS Restrictions**: Browser security prevents direct calls to Casper RPC nodes. We use Vercel serverless functions as proxy, but some endpoints still fail

3. **No Real stCSPR Token**: The demo contract tracks stakes internally but doesn't mint real tokens on mainnet

### How to Know if Data is Real?

- Look for the **LIVE** badge next to your balance
- Real transactions show actual TX hashes you can verify on [cspr.live](https://cspr.live)
- CSV exports include wallet address and data source in headers

---

## Features

### Core Staking
| Feature | Description |
|---------|-------------|
| Stake CSPR | Deposit CSPR and receive stCSPR (1:1 ratio) |
| Unstake | Burn stCSPR to get your CSPR back |
| ~17% APY | Earn staking rewards automatically |
| Instant Liquidity | Use stCSPR in DeFi while staking |

### Live Blockchain Data
| Feature | Description |
|---------|-------------|
| Real Balance | Fetch your actual CSPR balance from blockchain |
| CSPR Price | Live USD price from CoinGecko API |
| 24h Change | Price change indicator with color coding |
| Auto-Refresh | Balance updates every 30s, price every 60s |
| LIVE/DEMO Badge | Shows if data is real or simulated |

### Portfolio & Analytics
| Feature | Description |
|---------|-------------|
| Portfolio History | Interactive chart showing balance evolution over time |
| Rewards Projection | 12-month earnings forecast based on current stake |
| Protocol Statistics | TVL, total stakers, APY, and total rewards distributed |
| Staking Calculator | Estimate earnings over 1-36 months |

### Price Alerts (NEW)
| Feature | Description |
|---------|-------------|
| Custom Alerts | Set price targets for CSPR (above/below threshold) |
| Browser Notifications | Get notified when target price is reached |
| Sound Alerts | Audio notification on price trigger |
| Persistent Storage | Alerts saved in localStorage |

### Validator System
| Feature | Description |
|---------|-------------|
| Validator Ranking | Top validators with APY, stake, commission |
| Performance Metrics | Delegation rate and total stake |
| One-Click Select | Easy validator selection for staking |

### User Experience
| Feature | Description |
|---------|-------------|
| Confetti Animation | Celebration effect on successful stake |
| Sound Notifications | Audio feedback on success/error |
| Toast Notifications | Visual alerts with auto-dismiss |
| Input Validation | Real-time validation with error messages |
| Preview Box | "You will receive" preview before staking |
| Dark/Light Mode | Full theme support across all components |

### Multi-Page Navigation
| Page | Description |
|------|-------------|
| Home | Modern landing page with protocol overview |
| Stake | Full staking interface with all tools |
| Guide | Interactive tutorial with FAQ section |

---

## Screenshots

### Home Page
- Hero section with animated gradient border
- Protocol statistics (APY, Instant, No Lock, Secure)
- Step-by-step guide cards
- Benefits grid

### Stake Page
- Real-time balance dashboard
- Staking/Unstaking forms
- Portfolio history chart
- Rewards projection
- Price alerts panel
- Validator ranking

### Guide Page
- Comparison: Traditional vs Liquid Staking
- Interactive FAQ with animations
- Step-by-step tutorial

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Smart Contract** | Rust, casper-contract 5.0.0, WASM |
| **Frontend** | React 18, TypeScript, styled-components |
| **State Management** | React Context API (BalanceContext) |
| **Wallet** | CSPR.click integration |
| **Data** | CSPR.cloud API, CoinGecko API |
| **Storage** | localStorage for persistence |
| **Notifications** | Web Audio API, Browser Notifications API |
| **Deployment** | Vercel (frontend), Casper Testnet (contract) |

---

## Project Structure

```
Casper-projet/
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx        # Portfolio summary with live data
│   │   │   ├── StakingForm.tsx      # Stake/unstake form + confetti
│   │   │   ├── StakeHistory.tsx     # Transaction history
│   │   │   ├── StakingCalculator.tsx # APY slider calculator (V7)
│   │   │   ├── PriceChart.tsx       # Interactive price chart with tooltip (V7)
│   │   │   ├── ValidatorRanking.tsx # Top validators table
│   │   │   ├── ExportCSV.tsx        # Real wallet data export (V7)
│   │   │   ├── PortfolioHistory.tsx # Balance evolution chart
│   │   │   ├── PriceAlert.tsx       # Price alert system
│   │   │   ├── Confetti.tsx         # Celebration animation
│   │   │   ├── GlobalStats.tsx      # Protocol statistics
│   │   │   ├── Toast.tsx            # Notification system
│   │   │   └── Navigation.tsx       # Multi-page navigation
│   │   ├── contexts/
│   │   │   └── BalanceContext.tsx   # Shared balance state (NEW)
│   │   ├── hooks/
│   │   │   ├── useBalance.ts        # Blockchain balance + CSPR price
│   │   │   ├── useCsprClick.ts      # Wallet connection
│   │   │   └── useStaking.ts        # Staking operations
│   │   ├── pages/
│   │   │   ├── HomePage.tsx         # Redesigned landing page
│   │   │   ├── StakePage.tsx        # Full staking interface
│   │   │   └── GuidePage.tsx        # Tutorial + FAQ
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

### Current Contract (V5.0 - Production Demo)

```
Contract Hash: 3a209b27d48b8e288a52f1c4973bf4be290366214de728a65d4e2d3fb5f65d80
Network: casper-test
Version: 2.0.4
Status: Live on Vercel
```

This contract uses internal tracking for stakes and stCSPR tokens. Perfect for demonstration and POC purposes.

### Entry Points

| Function | Description |
|----------|-------------|
| `stake(amount)` | Stake CSPR, receive stCSPR |
| `unstake(amount)` | Burn stCSPR, get CSPR back |
| `transfer_stcspr(recipient, amount)` | Transfer stCSPR tokens |
| `get_my_stake()` | Query your staked amount |
| `my_stcspr_balance()` | Query your stCSPR balance |
| `calculate_my_rewards()` | Calculate rewards (~17% APY) |

---

## Experimental Contract (V6.1 - Real Transfers)

### Deployed Contract

```
Contract Hash: hash-d59ba3b52cbf5678f4a3e926e40758316b1119abd3cf8dbdd07300f601e42499
Package Hash: da7ec3951ab01e272bd340cbd69344814755da63f0b60016f56ebd90ae10e82a
Network: casper-test
Status: Deployed but not integrated
```

### What Was Built

We developed an advanced contract with **real CSPR transfers**:

- `stake(amount, source_purse)` - Accepts user's purse for receiving CSPR
- `unstake(amount, dest_purse)` - Accepts user's purse for returning CSPR
- Uses `system::transfer_from_purse_to_purse()` for actual token movement

### Technical Challenge

The Casper VM prevents contracts from accessing user purses via `account::get_main_purse()` (causes "Forged reference" error). Our solution: pass purse as parameter - when user signs, contract gets temporary access.

### Integration Blocker: CORS Restrictions

To use V6.1, the frontend needs to fetch the user's main purse from the Casper RPC. All attempts were blocked:

| Attempt | Result |
|---------|--------|
| Direct RPC call to `rpc.testnet.casperlabs.io` | CORS blocked |
| Vercel Serverless Function | Runtime configuration issues |
| CORS Proxies (corsproxy.io, allorigins, cors-anywhere) | All failed |
| CSPR.cloud API | CORS issues from browser |

### Future Solutions

1. Deploy a backend server (Node.js/Express) to proxy RPC calls
2. Use CSPR.click native features if they add purse fetching
3. Session code deployment (WASM running in user context)

### Conclusion

The V6.1 contract is **fully functional on testnet**. The limitation is browser CORS restrictions, not the smart contract itself. For the hackathon demo, we use the V5.0 contract which works perfectly for demonstration purposes

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

### Browser Notifications API
- **Purpose:** Price alert notifications
- **Trigger:** When CSPR price crosses user-defined threshold

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
| **V7.1** | LIVE badges everywhere, CORS fix, stable 17% APY |
| **V7.0** | APY slider, all-time price chart, interactive tooltip, real CSV export |
| **V6.3** | Price alerts, portfolio history, confetti, redesigned UI |
| **V6.2** | Live blockchain data, CSPR price, charts, sound notifications |
| **V6.1** | Multi-page navigation, toast notifications, staking calculator |
| **V6.0** | React frontend with CSPR.click, Vercel deployment |
| **V5.0** | Security hardening, best practices |
| **V4.0** | Multi-validator support |
| **V3.0** | stCSPR liquid token |

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
