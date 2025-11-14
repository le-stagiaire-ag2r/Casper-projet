# StakeVue - Casper Liquid Staking Dashboard

![Casper Hackathon 2026](https://img.shields.io/badge/Casper-Hackathon%202026-red)
![Category](https://img.shields.io/badge/Category-Liquid%20Staking-blue)

## Overview

**StakeVue** is a modern, user-friendly dashboard for liquid staking on the Casper Network. It allows users to stake their CSPR tokens while maintaining liquidity, earning rewards, and managing their staked assets through an intuitive web interface.

## Features

- ✅ **Wallet Integration**: Connect with Casper Signer or CSPR.click
- ✅ **Real-time Stats**: View total value locked, APY, and your personal stake
- ✅ **Easy Staking**: Stake CSPR with just a few clicks
- ✅ **Rewards Calculator**: Estimate your potential rewards
- ✅ **Transaction History**: Track all your staking activities
- ✅ **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- **HTML5/CSS3**: Modern, responsive UI
- **JavaScript**: Vanilla JS for blockchain interaction
- **Casper SDK**: Integration with Casper Network
- **CSPR.click**: Wallet connectivity

### Smart Contract
- **Language**: Rust
- **Framework**: Casper Contract / Odra (in development)
- **Network**: Casper Testnet

## Project Structure

```
ArchivesduP/
├── frontend/
│   ├── index.html          # Main application page
│   ├── css/
│   │   └── style.css       # Styling and animations
│   └── js/
│       └── app.js          # Blockchain interaction logic
├── smart-contract/
│   ├── Cargo.toml          # Rust dependencies
│   └── src/
│       └── lib.rs          # Smart contract code
├── docs/
│   └── README.md           # This file
├── keys/                   # Private keys (gitignored)
└── .gitignore              # Security config
```

## Getting Started

### Prerequisites
- Rust 1.91+
- Casper CLI 5.0+
- Node.js 22+ (for development server)
- Casper Signer or CSPR.click wallet extension

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/le-stagiaire-ag2r/ArchivesduP.git
   cd ArchivesduP
   ```

2. **View the Frontend**
   ```bash
   cd frontend
   python3 -m http.server 8000
   # Or use any local server
   ```

3. **Open in Browser**
   Navigate to `http://localhost:8000`

### Smart Contract Development

```bash
cd smart-contract
cargo +nightly build --release --target wasm32-unknown-unknown
```

## How It Works

1. **Connect Wallet**: Users connect their Casper wallet
2. **View Stats**: Dashboard displays current staking statistics
3. **Stake CSPR**: Enter amount and confirm transaction
4. **Earn Rewards**: Automatically accrue 12.5% APY
5. **Track History**: Monitor all transactions

## Roadmap

- [x] Frontend UI/UX design
- [x] Wallet integration (demo mode)
- [ ] Smart contract deployment
- [ ] Testnet integration
- [ ] Reward distribution logic
- [ ] Unstaking functionality
- [ ] Mainnet deployment (post-hackathon)

## Hackathon Submission

**Category**: Liquid Staking Track
**Prize Pool**: $2,500
**Event**: Casper Hackathon 2026
**Platform**: DoraHacks

### Key Differentiators

1. **User Experience**: Clean, modern interface that simplifies liquid staking
2. **Real-time Data**: Live updates of staking statistics
3. **Accessibility**: Built for both beginners and experienced users
4. **Mobile-First**: Responsive design for on-the-go management

## Testing

The frontend is currently in demo mode and can be tested without a real wallet connection.

To test with Casper Testnet:
1. Install Casper Signer extension
2. Create a testnet account
3. Get testnet CSPR from the faucet
4. Connect your wallet in StakeVue

## Security

- ✅ Private keys never stored in code
- ✅ All sensitive files gitignored
- ✅ Transactions signed client-side
- ✅ Smart contract auditable on-chain

## Contributing

This project was built for the Casper Hackathon 2026. Contributions and feedback are welcome!

## License

MIT License - Built for the Casper Community

## Contact

- **Developer**: le-stagiaire-ag2r
- **GitHub**: https://github.com/le-stagiaire-ag2r/ArchivesduP
- **Built with**: Casper Network

---

**Powered by Casper Network | Testnet**
*Making blockchain accessible to everyone*
