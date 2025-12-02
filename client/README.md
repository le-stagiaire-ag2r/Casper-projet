# StakeVue Client

Frontend React application for StakeVue Liquid Staking dApp.

## 🚀 Features

- 💎 **Liquid Staking** - Stake CSPR and receive tradeable stCSPR tokens
- 🔗 **Wallet Integration** - Connect via CSPR.click (Casper Wallet, Ledger, Torus)
- 📊 **Real-time Dashboard** - View TVL, your stakes, APY, and active validators
- 📈 **Transaction History** - Track all your staking activities
- 🎨 **Modern UI** - Beautiful gradient design with smooth animations

## 🏗️ Tech Stack

- **React 18** with TypeScript
- **CSPR.click** for wallet connection
- **casper-js-sdk** for blockchain interaction
- **styled-components** for styling
- **axios** for API calls

## 📦 Installation

```bash
cd client
npm install
```

## ⚙️ Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:

```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_CASPER_NETWORK=casper-test
REACT_APP_CONTRACT_HASH=contract-xxxxx
REACT_APP_CSPRCLICK_APP_ID=your-app-id
REACT_APP_CSPRCLICK_APP_KEY=your-app-key
```

## 🚀 Development

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## 🏭 Build

```bash
npm run build
```

Builds the app for production to the `build` folder.

## 📁 Project Structure

```
client/src/
├── components/         # React components
│   ├── WalletConnect.tsx
│   ├── Dashboard.tsx
│   ├── StakingForm.tsx
│   └── StakeHistory.tsx
├── hooks/             # Custom React hooks
│   ├── useCsprClick.ts
│   └── useStaking.ts
├── services/          # API and configuration
│   ├── api.ts
│   └── config.ts
├── types/             # TypeScript types
│   └── index.ts
├── App.tsx            # Main app component
└── index.tsx          # Entry point
```

## 🔌 Components

### WalletConnect
Connect/disconnect wallet with CSPR.click

### Dashboard
Display key metrics:
- Total Value Locked (TVL)
- Your stCSPR balance
- APY (10%)
- Active validators count

### StakingForm
Stake CSPR or unstake stCSPR with tabbed interface

### StakeHistory
View transaction history with pagination

## 🪝 Hooks

### useCsprClick()
Manages wallet connection state and signing

```tsx
const { activeAccount, connect, disconnect, signDeploy } = useCsprClick();
```

### useStaking()
Handles staking operations

```tsx
const { stake, unstake, isProcessing, txHash, error } = useStaking();
```

## 🎨 Styling

Uses styled-components with:
- Gradient backgrounds
- Glass-morphism effects
- Smooth transitions
- Responsive design

## 🔧 Polyfills

The app uses `react-app-rewired` with `config-overrides.js` to polyfill Node.js modules for the browser:
- crypto (crypto-browserify)
- buffer
- stream (stream-browserify)
- util
- process

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set environment variables in Vercel dashboard.

### Manual Build

```bash
npm run build
# Upload ./build folder to any static host
```

## 📝 Notes

- Requires backend API running on `REACT_APP_API_URL`
- Testnet only (configure for mainnet in production)
- Transaction fees: ~5 CSPR per operation
