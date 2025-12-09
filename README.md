# StakeVue - Liquid Staking Protocol for Casper Network

![Casper Network](https://img.shields.io/badge/Casper-Testnet-blue)
![Status](https://img.shields.io/badge/Status-V8_Beta-orange)
![Version](https://img.shields.io/badge/Version-8.0.0-brightgreen)
![Open Source](https://img.shields.io/badge/Open_Source-Yes-success)
![License](https://img.shields.io/badge/License-MIT-green)

**Hackathon:** Casper Hackathon 2025 on DoraHacks
**Track:** DeFi - Liquid Staking

---

## Live Demo

**Web App:** [https://casper-projet.vercel.app](https://casper-projet.vercel.app)

**V8 Contract on Explorer:** [View on Testnet](https://testnet.cspr.live/contract-package/f9205d8ad33cfb7fd47873babc4bc3388098beaea3573e7b8a69800dab9d68e4)

---

## What is StakeVue?

StakeVue is a **liquid staking protocol** for Casper Network. Stake your CSPR and receive **stCSPR** tokens that you can use while earning staking rewards.

```
Stake CSPR → Get stCSPR → Earn ~17% APY → Stay Liquid
```

---

## What's New in V8.0 🚀

### Real CSPR Staking with Odra Framework

| Feature | Description |
|---------|-------------|
| **Real CSPR Transfers** | Actual CSPR tokens are transferred to/from the contract |
| **Odra 2.4.0 Framework** | Modern smart contract framework for Casper 2.0 |
| **Payable Functions** | Uses `#[odra(payable)]` for receiving CSPR |
| **CLI Tool** | Built-in CLI for contract interaction |
| **Testnet Deployed** | Fully tested on Casper testnet |

### V8 Contract Details

```
Package Hash: hash-f9205d8ad33cfb7fd47873babc4bc3388098beaea3573e7b8a69800dab9d68e4
Network: casper-test
Framework: Odra 2.4.0
Status: Deployed & Tested
```

### Tested Transactions

| Action | Transaction Hash |
|--------|------------------|
| Stake (5 CSPR) | [2945b131...](https://testnet.cspr.live/transaction/2945b1311537024452ccdf9812797a2349696049b1c78eb809bd7af9297e4124) |
| Unstake (2 CSPR) | [fcc6fd33...](https://testnet.cspr.live/transaction/fcc6fd3320e84c93d8a077f0502c7cd7557b03429804d0a2baf1f6ca169e372b) |

---

## Smart Contract (V8 - Odra)

### Contract Code

Located in `stakevue_contract/src/lib.rs`:

```rust
#[odra::module(events = [Staked, Unstaked])]
pub struct StakeVue {
    stakes: Mapping<Address, U512>,
    total_staked: Var<U512>,
}

#[odra::module]
impl StakeVue {
    #[odra(payable)]
    pub fn stake(&mut self) {
        let staker = self.env().caller();
        let amount = self.env().attached_value();
        // ... transfers real CSPR
    }

    pub fn unstake(&mut self, amount: U512) {
        // ... returns real CSPR to user
        self.env().transfer_tokens(&staker, &amount);
    }
}
```

### Entry Points

| Function | Description |
|----------|-------------|
| `stake()` | Stake CSPR (payable - attach CSPR to call) |
| `unstake(amount)` | Withdraw CSPR from stake |
| `get_stake(staker)` | Query stake for an address |
| `get_total_staked()` | Query total CSPR staked in contract |

### Building the Contract

```bash
cd stakevue_contract
cargo odra build -c StakeVue
```

### Deploying

```bash
casper-client put-transaction session \
  --node-address http://NODE:7777 \
  --secret-key ~/secret_key.pem \
  --wasm-path wasm/StakeVue.wasm \
  --chain-name casper-test \
  --gas-price-tolerance 10 \
  --transaction-runtime vm-casper-v1 \
  --standard-payment true \
  --payment-amount 450000000000 \
  --install-upgrade \
  --session-arg "odra_cfg_package_hash_key_name:string:'stakevue'" \
  --session-arg "odra_cfg_allow_key_override:bool:'true'" \
  --session-arg "odra_cfg_is_upgradable:bool:'true'" \
  --session-arg "odra_cfg_is_upgrade:bool:'false'" \
  --session-arg "odra_cfg_constructor:string:'init'"
```

### Using the CLI

```bash
cd stakevue_contract

# Set environment variables
export ODRA_CASPER_LIVENET_SECRET_KEY_PATH=~/secret_key.pem
export ODRA_CASPER_LIVENET_NODE_ADDRESS=http://NODE:7777
export ODRA_CASPER_LIVENET_CHAIN_NAME=casper-test
export ODRA_CASPER_LIVENET_EVENTS_URL=http://NODE:9999/events/main

# Stake 5 CSPR
cargo run --bin stakevue_cli --features livenet -- contract StakeVue stake --attached_value 5000000000 --gas 50000000000

# Unstake 2 CSPR
cargo run --bin stakevue_cli --features livenet -- contract StakeVue unstake --amount 2000000000 --gas 50000000000
```

---

## Previous Versions

### V7.1 (Frontend - Currently on Vercel)

The frontend at [casper-projet.vercel.app](https://casper-projet.vercel.app) uses V7.1 with demo/tracking mode.

**Contract Hash:** `3a209b27d48b8e288a52f1c4973bf4be290366214de728a65d4e2d3fb5f65d80`

### Key Differences

| Feature | V7.1 (Demo) | V8 (Odra) |
|---------|-------------|-----------|
| CSPR Transfer | Simulated | Real |
| Framework | casper-contract | Odra 2.4.0 |
| Frontend | Integrated | CLI only (V8.1 will add frontend) |

---

## Project Structure

```
Casper-projet/
├── client/                      # React frontend (V7.1)
│   └── src/
│       ├── components/          # UI components
│       ├── contexts/            # React contexts
│       ├── hooks/               # Custom hooks
│       └── pages/               # Page components
├── stakevue_contract/           # Odra smart contract (V8)
│   ├── src/lib.rs               # Contract code
│   ├── bin/cli.rs               # CLI tool
│   ├── Cargo.toml               # Dependencies
│   ├── Odra.toml                # Odra config
│   └── resources/contracts.toml # Deployed contract info
├── smart-contract/              # Legacy contract (V5-V7)
├── docs/                        # Documentation
├── archive/                     # Old versions
└── README.md
```

---

## Roadmap

### V8.1 (Next)
- [ ] Integrate V8 contract with frontend
- [ ] Add proxy_caller.wasm for browser calls
- [ ] Update staking forms to use real CSPR

### V8.2 (Future)
- [ ] Add stCSPR token minting
- [ ] Implement reward distribution
- [ ] Add validator delegation

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Smart Contract V8** | Rust, Odra 2.4.0, WASM |
| **Smart Contract V7** | Rust, casper-contract 5.0.0, WASM |
| **Frontend** | React 18, TypeScript, styled-components |
| **State Management** | React Context API |
| **Wallet** | CSPR.click integration |
| **Data** | CSPR.cloud API, CoinGecko API |
| **Deployment** | Vercel (frontend), Casper Testnet (contract) |

---

## Local Development

### Frontend

```bash
cd client
npm install
npm start
```

### Smart Contract (V8)

```bash
cd stakevue_contract
rustup install nightly-2025-01-01
rustup target add wasm32-unknown-unknown --toolchain nightly-2025-01-01
cargo odra build -c StakeVue
```

---

## Links

- **Live Demo:** https://casper-projet.vercel.app
- **V8 Contract:** https://testnet.cspr.live/contract-package/f9205d8ad33cfb7fd47873babc4bc3388098beaea3573e7b8a69800dab9d68e4
- **V7 Contract:** https://testnet.cspr.live/contract/3a209b27d48b8e288a52f1c4973bf4be290366214de728a65d4e2d3fb5f65d80
- **Odra Framework:** https://odra.dev
- **Casper Network:** https://casper.network

---

## Version History

| Version | Highlights |
|---------|------------|
| **V8.0** | Real CSPR staking with Odra 2.4.0 framework |
| **V7.1** | LIVE badges, CORS fix, stable 17% APY |
| **V7.0** | APY slider, all-time price chart, CSV export |
| **V6.x** | Price alerts, portfolio history, redesigned UI |
| **V5.0** | Security hardening, best practices |

---

## License

MIT License

---

**Built for Casper Hackathon 2025**

**StakeVue - Liquid Staking Made Simple**
