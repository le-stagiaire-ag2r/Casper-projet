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

- **Per-User Tracking** - Each user's stake is tracked individually
- **Stake CSPR tokens** and manage your personal staking balance
- **Unstake tokens** with built-in safety checks
- **Query YOUR stake** - See your personal staked amount
- **Calculate rewards** - 10% APY on staked amounts
- **Modern, responsive UI** for easy interaction
- **Fully deployed and tested** on Casper Testnet (V2.0)

---

## Deployed Contract (V2.0)

### Contract Information

**Version:** 2.0 (with per-user tracking and rewards)

**Contract Hash:**
```
contract-e07656796d3ffa429918f9f4df6594dc39a46e57a8291c95ab71f6016cd89200
```

**Contract Package:**
```
contract-package-056acb42522ae98e00bfa7f9c1629a4c75c914614fd8ce96da2ded32ccb0e788
```

**Named Keys:**
- `stakevue_contract` - Main contract reference
- `stakevue_liquid_staking` - Contract package
- `stakevue_access` - Access control URef
- `total_staked` - Global staking counter
- `user_stake_{account}` - Individual user balances
- `user_timestamp_{account}` - Staking timestamps

**View Contract on Explorer:**
https://testnet.cspr.live/contract/e07656796d3ffa429918f9f4df6594dc39a46e57a8291c95ab71f6016cd89200

### Deployment Transaction (V2.0)

**Transaction Hash:** `3e714f8447c0b2473b71d9108469bed9b5eea481347a0098bf6972b85f5c660c`

**View on Explorer:**
https://testnet.cspr.live/transaction/3e714f8447c0b2473b71d9108469bed9b5eea481347a0098bf6972b85f5c660c

**Deployment Status:** ✅ SUCCESS (error_message: null)
**Block Height:** 5928383
**Gas Consumed:** 71.5 CSPR
**Refund:** 21.3 CSPR
**Net Cost:** ~50 CSPR
**Contract Size:** 64 KB

---

## Smart Contract API

### Entry Points

#### 1. `stake(amount: U512)`
Stakes CSPR tokens and updates both the total staked amount AND your personal balance.

**Parameters:**
- `amount` (U512): Amount to stake in motes (1 CSPR = 1,000,000,000 motes)

**Returns:** Unit

**What it does:**
- Increments global total staked counter
- Updates YOUR personal stake balance
- Records timestamp for rewards calculation

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
Unstakes CSPR tokens from YOUR personal balance.

**Parameters:**
- `amount` (U512): Amount to unstake in motes

**Returns:** Unit

**What it does:**
- Checks YOUR personal staked balance (not the global total)
- Decrements YOUR personal stake
- Updates the global total

**Error Handling:**
- Reverts with `ApiError::User(100)` if YOU don't have enough staked

#### 3. `get_staked_amount()`
Queries the TOTAL amount of CSPR currently staked (all users combined).

**Parameters:** None

**Returns:** U512 - Total staked amount in motes

**Example:**
```bash
casper-client put-transaction invocable-entity-alias \
  --entity-alias stakevue_contract \
  --session-entry-point get_staked_amount \
  --payment-amount 3000000000 \
  --standard-payment true \
  --gas-price-tolerance 5 \
  --ttl 30min
```

#### 4. `get_my_stake()` ✨ NEW in V2.0
Queries YOUR personal staked amount.

**Parameters:** None

**Returns:** U512 - YOUR staked amount in motes (returns 0 if you never staked)

**What it does:**
- Reads YOUR personal stake balance from storage
- Independent of other users' stakes
- Safe to call anytime (no gas if never staked)

**Example:**
```bash
casper-client put-transaction invocable-entity-alias \
  --entity-alias stakevue_contract \
  --session-entry-point get_my_stake \
  --payment-amount 3000000000 \
  --standard-payment true \
  --gas-price-tolerance 5 \
  --ttl 30min
```

**Test Transaction:** `0bb41a3f118cdcffe975d5580125b9fdf62dfd9925f268ac90686e82e12e860f` ✅

#### 5. `calculate_my_rewards()` ✨ NEW in V2.0
Calculates YOUR potential annual rewards based on 10% APY.

**Parameters:** None

**Returns:** U512 - YOUR potential annual rewards in motes

**What it does:**
- Reads YOUR personal stake
- Calculates: `your_stake * 10%`
- Returns potential yearly rewards

**Example:**
If you staked 1000 CSPR, this returns 100 CSPR (10% APY)

**Example:**
```bash
casper-client put-transaction invocable-entity-alias \
  --entity-alias stakevue_contract \
  --session-entry-point calculate_my_rewards \
  --payment-amount 3000000000 \
  --standard-payment true \
  --gas-price-tolerance 5 \
  --ttl 30min
```

**Test Transaction:** `f1c39d6dcfb69ae463575c31b38990d91e715897c4d393e88dd0eb78f6b736f8` ✅

---

## Test Results (V2.0)

### Deployment Test V2.0
✅ **SUCCESS** - Contract deployed with 5 entry points
Transaction: `3e714f8447c0b2473b71d9108469bed9b5eea481347a0098bf6972b85f5c660c`
**Block:** 5928383
**Entry Points Confirmed:** stake, unstake, get_staked_amount, get_my_stake, calculate_my_rewards

### Test 1: get_my_stake() - Before Any Stake
✅ **SUCCESS** - Returns 0 for new user
Transaction: `22a50e49a9a8ec8d28cb052def7ac9ac9e68f63e112a53e88b90b8b07ccdd03d`
**Result:** User has no stake yet ✅

### Test 2: stake(500 CSPR)
✅ **SUCCESS** - Staked 500 CSPR (500,000,000,000 motes)
Transaction: `3a5c98c226cbc0ee62ea78d028a6b1bffb5831654ab64e8dcaf76ddfc92b5fd8`
**Verification:** User's personal balance updated ✅

### Test 3: get_my_stake() - After Stake
✅ **SUCCESS** - Returns 500 CSPR for the user
Transaction: `0bb41a3f118cdcffe975d5580125b9fdf62dfd9925f268ac90686e82e12e860f`
**Result:** User's stake correctly tracked ✅

### Test 4: calculate_my_rewards()
✅ **SUCCESS** - Returns 50 CSPR (10% of 500 CSPR)
Transaction: `f1c39d6dcfb69ae463575c31b38990d91e715897c4d393e88dd0eb78f6b736f8`
**Result:** Rewards calculation correct (10% APY) ✅

**All Tests:** error_message: null ✅

View deployment on explorer:
https://testnet.cspr.live/contract/e07656796d3ffa429918f9f4df6594dc39a46e57a8291c95ab71f6016cd89200

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

### Contract Structure (V2.0)

```rust
// Storage
total_staked: U512                     // Global total CSPR staked
user_stake_{account}: U512             // Per-user staking balances
user_timestamp_{account}: u64          // Staking timestamps for rewards

// Entry Points (5 total)
stake(amount: U512) -> Unit            // Stake + track per user
unstake(amount: U512) -> Unit          // Unstake from personal balance
get_staked_amount() -> U512            // Query global total
get_my_stake() -> U512                 // Query YOUR balance ✨ NEW
calculate_my_rewards() -> U512         // Calculate YOUR rewards ✨ NEW

// Configuration
APY_PERCENTAGE = 10%                   // Annual rewards rate
```

### Security Features

- ✅ Input validation on all entry points
- ✅ Overflow protection with U512 arithmetic
- ✅ **Per-user balance tracking** - Can't unstake others' funds
- ✅ Insufficient balance checks on unstake (checks YOUR balance)
- ✅ Locked contract (non-upgradeable for security)
- ✅ Safe arithmetic with saturating operations
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
