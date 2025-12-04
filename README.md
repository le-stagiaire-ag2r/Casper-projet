# StakeVue - Liquid Staking Protocol for Casper Network

![Casper Network](https://img.shields.io/badge/Casper-Testnet-blue)
![Status](https://img.shields.io/badge/Status-Demo-yellow)
![Version](https://img.shields.io/badge/Version-6.3.0-brightgreen)
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
Stake CSPR → Get stCSPR → Earn 11.5% APY → Stay Liquid
```

---

## Features (V6.3)

### Core Staking
| Feature | Description |
|---------|-------------|
| Stake CSPR | Deposit CSPR and receive stCSPR (1:1 ratio) |
| Unstake | Burn stCSPR to get your CSPR back |
| 11.5% APY | Earn staking rewards automatically |
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
- Protocol statistics (APY, Instant, No Lock, Audited)
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
│   │   │   ├── StakingCalculator.tsx # Earnings calculator
│   │   │   ├── RewardsChart.tsx     # 12-month projection chart
│   │   │   ├── ValidatorRanking.tsx # Top validators table
│   │   │   ├── PortfolioHistory.tsx # Balance evolution chart (NEW)
│   │   │   ├── PriceAlert.tsx       # Price alert system (NEW)
│   │   │   ├── Confetti.tsx         # Celebration animation (NEW)
│   │   │   ├── GlobalStats.tsx      # Protocol statistics (NEW)
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
| `calculate_my_rewards()` | Calculate rewards (11.5% APY) |

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
| **V6.3** | Price alerts, portfolio history, confetti, redesigned UI |
| **V6.2** | Live blockchain data, CSPR price, charts, sound notifications |
| **V6.1** | Multi-page navigation, toast notifications, staking calculator |
| **V6.0** | React frontend with CSPR.click, Vercel deployment |
| **V5.0** | Security hardening, A+ audit score |
| **V4.0** | Multi-validator support |
| **V3.0** | stCSPR liquid token |

---

## What's New in V6.3

### Price Alerts System
- Set custom price targets for CSPR
- Choose "above" or "below" threshold
- Browser notifications when target is reached
- Audio alert with sound notification
- Persistent alerts saved in localStorage

### Portfolio History
- Interactive line chart showing balance evolution
- Combines CSPR + stCSPR holdings
- Tracks changes over time
- localStorage persistence

### Confetti Celebration
- Animated confetti on successful stake
- 100 colorful particles
- Enhances user experience

### UI/UX Redesign
- **Home Page:** Gradient hero, animated icons, stats row, step cards, benefits grid
- **Guide Page:** Comparison cards, interactive FAQ, step-by-step tutorial
- **Stake Page:** Integrated portfolio history and price alerts

### Technical Improvements
- BalanceContext for shared state management
- stCSPR balance persistence in localStorage
- Fixed chart viewBox for proper label rendering
- Improved dark/light mode support

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
