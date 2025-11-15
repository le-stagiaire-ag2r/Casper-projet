# StakeVue - Liquid Staking Protocol for Casper Network

![Casper Network](https://img.shields.io/badge/Casper-Testnet-blue)
![Status](https://img.shields.io/badge/Status-Deployed-success)
![License](https://img.shields.io/badge/License-MIT-green)

**Hackathon:** Casper Hackathon 2026 on DoraHacks
**Track:** Liquid Staking
**Prize Pool:** $25,000

---

## Overview

StakeVue is a liquid staking protocol built on the Casper Network that enables users to stake their CSPR tokens while maintaining liquidity. Our smart contract provides a simple yet powerful interface for staking operations with full transparency.

### Key Features

- **Stake CSPR tokens** and track your staked amount on-chain
- **Unstake tokens** with built-in safety checks
- **Query staked amounts** in real-time
- **Modern, responsive UI** for easy interaction
- **Fully deployed and tested** on Casper Testnet

---

## Deployed Contract

### Contract Information

**Contract Hash:**
```
contract-82f9352551599a7ae4d1875286e64b2a0ba9124eef8ad22fa8b51b398fbc28f0
```

**Contract Package:**
```
contract-package-8faabf5972da280ccb91c2f64aecd2c1a3763b09fcc9c9fe1a120c6ffdfde506
```

**Named Keys:**
- `stakevue_contract` - Main contract reference
- `stakevue_liquid_staking` - Contract package
- `stakevue_access` - Access control URef

### Deployment Transaction

**Transaction Hash:** `e8e53299df913eb70a819e54b2dbfb8ab8a9605fe9f07b4b1c7e0f3d0c86d4ad`

**View on Explorer:**
https://testnet.cspr.live/transaction/e8e53299df913eb70a819e54b2dbfb8ab8a9605fe9f07b4b1c7e0f3d0c86d4ad

**Deployment Status:** ✅ SUCCESS (error_message: null)
**Block Height:** 5926866
**Gas Consumed:** 59.4 CSPR
**Refund:** 30.4 CSPR
**Net Cost:** ~29 CSPR

---

## Smart Contract API

### Entry Points

#### 1. `stake(amount: U512)`
Stakes CSPR tokens by incrementing the total staked amount.

**Parameters:**
- `amount` (U512): Amount to stake in motes (1 CSPR = 1,000,000,000 motes)

**Returns:** Unit

**Example:**
```bash
casper-client put-transaction invocable-entity-alias \
  --entity-alias stakevue_contract \
  --session-entry-point stake \
  --session-arg "amount:u512='1000000000000'" \
  --payment-amount 2500000000 \
  --standard-payment true \
  --gas-price-tolerance 5 \
  --ttl 30min
```

#### 2. `unstake(amount: U512)`
Unstakes CSPR tokens by decrementing the total staked amount.

**Parameters:**
- `amount` (U512): Amount to unstake in motes

**Returns:** Unit

**Error Handling:**
- Reverts with `ApiError::User(100)` if insufficient staked amount

#### 3. `get_staked_amount()`
Queries the total amount of CSPR currently staked.

**Parameters:** None

**Returns:** U512 - Total staked amount in motes

**Example:**
```bash
casper-client put-transaction invocable-entity-alias \
  --entity-alias stakevue_contract \
  --session-entry-point get_staked_amount \
  --payment-amount 2500000000 \
  --standard-payment true \
  --gas-price-tolerance 5 \
  --ttl 30min
```

---

## Test Results

### Deployment Test
✅ **SUCCESS** - Contract deployed with all entry points
Transaction: `e8e53299df913eb70a819e54b2dbfb8ab8a9605fe9f07b4b1c7e0f3d0c86d4ad`

### Stake Test
✅ **SUCCESS** - Staked 1000 CSPR (1,000,000,000,000 motes)
Transaction: `738714efb54a4b7b271268347cec5b67fee9dc9d5ea6eb5636464d0c01432ecd`
**Verification:** Storage effect shows `"AddUInt512": "1000000000000"`

View test transaction:
https://testnet.cspr.live/transaction/738714efb54a4b7b271268347cec5b67fee9dc9d5ea6eb5636464d0c01432ecd

---

## Architecture

### Tech Stack

**Smart Contract:**
- Rust with `no_std` for WASM compilation
- casper-contract 5.0.0
- casper-types 6.0.0
- Rust nightly-2024-07-31

**Frontend:**
- Pure HTML5/CSS3/JavaScript
- Responsive design
- Casper wallet integration ready
- Real-time data visualization

### Contract Structure

```rust
// Storage
total_staked: U512  // Total CSPR staked in the protocol

// Entry Points
stake(amount: U512) -> Unit
unstake(amount: U512) -> Unit
get_staked_amount() -> U512
```

### Security Features

- ✅ Input validation on all entry points
- ✅ Overflow protection with U512 arithmetic
- ✅ Insufficient balance checks on unstake
- ✅ Locked contract (non-upgradeable for security)
- ✅ Public entry points with caller payment model

---

## Project Structure

```
Casper-projet/
├── frontend/
│   ├── index.html          # Main UI
│   ├── css/
│   │   └── style.css       # Styling
│   └── js/
│       └── app.js          # Frontend logic
├── smart-contract/
│   ├── src/
│   │   └── lib.rs          # Contract implementation
│   ├── Cargo.toml          # Dependencies
│   └── target/
│       └── wasm32-unknown-unknown/
│           └── release/
│               └── stakevue_contract.wasm
├── keys/                   # Deployment keys
├── deploy-v2.sh           # Deployment script
└── README.md              # This file
```

---

## Development Setup

### Prerequisites

- Rust nightly-2024-07-31
- wasm32-unknown-unknown target
- Casper CLI tools
- Node.js (for frontend dev server)

### Building the Contract

```bash
cd smart-contract
rustup override set nightly-2024-07-31
rustup target add wasm32-unknown-unknown
cargo build --release --target wasm32-unknown-unknown
```

The compiled WASM will be at:
```
target/wasm32-unknown-unknown/release/stakevue_contract.wasm
```

### Running the Frontend

```bash
cd frontend
# Serve with any HTTP server
python3 -m http.server 8000
# Or
npx http-server
```

Open http://localhost:8000 in your browser.

---

## Deployment Guide

### Deploying to Casper Testnet

1. **Generate keys** (if not already done):
```bash
casper-client keygen keys/
```

2. **Get testnet CSPR tokens**:
   - Visit https://testnet.cspr.live/tools/faucet
   - Request tokens for your public key

3. **Deploy the contract**:
```bash
./deploy-v2.sh
```

4. **Verify deployment**:
   - Check transaction on https://testnet.cspr.live
   - Look for `error_message: null` in execution result

### Important Deployment Flags

The deployment uses these critical flags:
- `--install-upgrade` - Required for contract installation
- `--standard-payment true` - Use standard payment model
- `--payment-amount 100000000000` - 100 CSPR for deployment

---

## Roadmap

### Current Status (MVP)
- ✅ Core liquid staking contract
- ✅ Stake/unstake/query operations
- ✅ Deployed on Casper Testnet
- ✅ Frontend UI complete

### Future Enhancements
- [ ] Liquid staking tokens (stCSPR) minting
- [ ] Staking rewards distribution
- [ ] Validator delegation integration
- [ ] Governance features
- [ ] Multi-validator support
- [ ] Advanced analytics dashboard

---

## Technical Challenges Solved

During development, we encountered and resolved:

1. **ApiError::NotAllowedToAddContractVersion [48]**
   - **Solution:** Use `--install-upgrade` flag with casper-contract 5.0.0

2. **ApiError::EarlyEndOfStream [17]**
   - **Solution:** Migrate from deprecated `put-deploy` to `put-transaction`

3. **API Version Compatibility**
   - **Solution:** Upgrade from casper-contract 2.0.0 to 5.0.0 with matching Rust toolchain

4. **Entry Point Types**
   - **Solution:** Use `EntryPointType::Called` with `EntryPointPayment::Caller`

---

## Team

Built for Casper Hackathon 2026

---

## License

MIT License - see LICENSE file for details

---

## Links

- **Casper Testnet Explorer:** https://testnet.cspr.live
- **Contract:** https://testnet.cspr.live/contract/82f9352551599a7ae4d1875286e64b2a0ba9124eef8ad22fa8b51b398fbc28f0
- **DoraHacks:** https://dorahacks.io/hackathon/casper-hackathon-2026
- **Casper Network:** https://casper.network

---

## Acknowledgments

- Casper Network team for the excellent documentation
- Casper ecosystem for the counter contract example
- DoraHacks for hosting the hackathon
