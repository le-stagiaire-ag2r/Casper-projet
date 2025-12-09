# StakeVue - Liquid Staking Protocol for Casper Network

![Casper Network](https://img.shields.io/badge/Casper-Testnet-blue)
![Status](https://img.shields.io/badge/Status-V8.1_Beta-orange)
![Version](https://img.shields.io/badge/Version-8.1.0-brightgreen)
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
Stake CSPR -> Get stCSPR -> Earn ~17% APY -> Stay Liquid
```

---

## What's New in V8.1

### Frontend Integration Complete

| Feature | Description |
|---------|-------------|
| **V8 Contract Connected** | Frontend now calls the real Odra V8 contract |
| **proxy_caller.wasm** | Browser-compatible WASM for payable functions |
| **Real CSPR Transfers** | Actual CSPR moves to/from the contract |
| **Optimistic Balance Updates** | Instant UI feedback after transactions |
| **Separated Token Display** | CSPR and stCSPR shown separately (no confusion) |

### V8.1 Bug Fixes

| Issue | Solution |
|-------|----------|
| Balance showing combined CSPR + stCSPR | Fixed - now displayed separately in Portfolio History |
| API cache returning stale balance | Fixed - local balance is source of truth after transaction |

---

## What's New in V8.0

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

## Known Limitations

### CSPR.click API Cache Behavior

The CSPR.click SDK caches balance data and **does not refresh automatically** without a page reload. This is a limitation of their API, not our code.

**What happens:**
```
1. You stake 20 CSPR
2. Your real balance: 550 -> 530 CSPR (on blockchain)
3. CSPR.click API cache: still returns 550 (stale!)
4. Without protection, UI would show wrong balance
```

**Our solution:**
```
1. After any transaction, we use LOCAL balance calculation
2. Auto-refresh from API is disabled for that session
3. When you reload the page, fresh data is fetched
4. Balance is always accurate in the UI
```

This is the same approach used by MetaMask, Phantom, and other crypto wallets - **optimistic updates** with sync on page reload.

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

## Project Structure

```
Casper-projet/
├── client/                      # React frontend (V8.1)
│   ├── public/
│   │   ├── config.js            # Runtime configuration
│   │   └── proxy_caller.wasm    # WASM for payable calls
│   └── src/
│       ├── components/          # 23 UI components
│       ├── context/             # BalanceContext (optimistic updates)
│       ├── hooks/               # Custom hooks
│       ├── services/            # Transaction builder
│       └── pages/               # Page components
├── stakevue_contract/           # Odra smart contract (V8)
│   ├── src/lib.rs               # Contract code (73 lines)
│   ├── bin/cli.rs               # CLI tool
│   ├── Cargo.toml               # Odra 2.4.0 dependencies
│   ├── Odra.toml                # Odra config
│   └── resources/contracts.toml # Deployed contract info
├── api/                         # Vercel serverless functions
│   ├── price.ts                 # CoinGecko API proxy
│   └── validators.ts            # Validator data proxy
├── docs/                        # Documentation
├── archive/                     # Old versions (V1-V7)
└── README.md
```

---

## Transaction Fees

| Item | Value | Notes |
|------|-------|-------|
| **Gas Budget** | 5 CSPR | Configured in `config.js` |
| **Actual Gas Used** | ~1 CSPR | Depends on operation |
| **Gas Price** | 1 | Standard Casper price |

The frontend validates that users have enough balance for both the stake amount AND gas fees before submitting.

---

## Roadmap

### V8.1 - COMPLETE
- [x] Integrate V8 contract with frontend
- [x] Add proxy_caller.wasm for browser calls
- [x] Update staking forms to use real CSPR
- [x] Fix balance display (separate CSPR/stCSPR)
- [x] Handle API cache limitation

### V8.2 (Future)
- [ ] Add stCSPR token minting (ERC-20 style)
- [ ] Implement reward distribution mechanism
- [ ] Add validator delegation selection
- [ ] Multi-validator support

### V9.0 (Future)
- [ ] Mainnet deployment
- [ ] Security audit
- [ ] Governance token

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Smart Contract** | Rust, Odra 2.4.0, WASM |
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

### Environment Variables

For local development, create `client/.env`:

```env
# Optional - defaults are in public/config.js
REACT_APP_CHAIN_NAME=casper-test
```

---

## Links

- **Live Demo:** https://casper-projet.vercel.app
- **V8 Contract:** https://testnet.cspr.live/contract-package/f9205d8ad33cfb7fd47873babc4bc3388098beaea3573e7b8a69800dab9d68e4
- **Odra Framework:** https://odra.dev
- **Casper Network:** https://casper.network
- **CSPR.click Docs:** https://docs.cspr.click

---

## Version History

| Version | Highlights |
|---------|------------|
| **V8.1** | Frontend integration, balance fix, API cache handling |
| **V8.0** | Real CSPR staking with Odra 2.4.0 framework |
| **V7.1** | LIVE badges, CORS fix, stable 17% APY |
| **V7.0** | APY slider, all-time price chart, CSV export |
| **V6.x** | Price alerts, portfolio history, redesigned UI |
| **V5.0** | Security hardening, best practices |

---

## Archive

Previous versions and legacy code are preserved in the `/archive` folder:
- `frontend-v1/` - Original HTML/CSS/JS frontend
- `server/` - Node.js backend (never deployed)
- `infra/` - Docker configurations
- `V6.1-DEVELOPMENT-NOTES.md` - Historical development notes

---

## License

MIT License

---

**Built for Casper Hackathon 2025**

**StakeVue - Liquid Staking Made Simple**
