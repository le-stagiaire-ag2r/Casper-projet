# StakeVue - Liquid Staking on Casper 2.0

<p align="center">
  <img src="https://img.shields.io/badge/Casper-2.0_Testnet-00D4FF?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Version-22-8B5CF6?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Odra-2.5.0-FF6B35?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge"/>
</p>

<p align="center">
  <b>Casper Hackathon 2025</b> | <b>DeFi Track</b> | <b>DoraHacks</b>
</p>

---

## What is StakeVue?

StakeVue is a **liquid staking protocol** on Casper Network. Stake your CSPR, receive stCSPR tokens, and stay liquid while earning staking rewards.

### The Problem

Traditional staking locks your CSPR for weeks. You can't use it, trade it, or access it quickly.

### The Solution

StakeVue gives you **stCSPR tokens** when you stake. These tokens:
- Represent your staked CSPR
- Appreciate in value as rewards accumulate
- Can be transferred or traded (liquidity!)
- Are redeemable for CSPR anytime

---

## Quick Demo: 3 Simple Steps

```
1. STAKE    →  Send 100 CSPR  →  Receive 100 stCSPR
2. WAIT     →  Rewards accumulate  →  Your stCSPR is now worth 115 CSPR
3. UNSTAKE  →  Burn 100 stCSPR  →  Get back 115 CSPR (+15% profit!)
```

---

## User Personas

### Alice - The DeFi Enthusiast

> "I want to stake my CSPR but also use it as collateral in other protocols."

**How StakeVue helps:** Alice stakes 1000 CSPR and receives 1000 stCSPR. She can now use her stCSPR in DeFi while still earning staking rewards.

### Bob - The Long-Term Holder

> "I believe in Casper but hate that my tokens are locked for weeks."

**How StakeVue helps:** Bob stakes 5000 CSPR. After a year, his stCSPR is worth 5850 CSPR (17% APY). He can unstake anytime - the 7-era (~14h) unbonding is much shorter than native staking.

### Carol - The Active Trader

> "I want exposure to staking rewards but need flexibility."

**How StakeVue helps:** Carol stakes when she's not trading. If she spots an opportunity, she requests unstake and has her CSPR back in ~14 hours.

---

## How It Works

### Architecture: Pool-Based (Wise Lending Style)

```
+-------------------------------------------------------------------+
|                     STAKEVUE ARCHITECTURE                          |
+-------------------------------------------------------------------+
|                                                                    |
|   USER LAYER                                                       |
|   +--------+                                                       |
|   |  User  |  stake(validator) ───> Pool receives CSPR            |
|   |        |  <─── mints stCSPR                                   |
|   |        |                                                       |
|   |        |  request_unstake(amount) ───> Burns stCSPR            |
|   |        |  <─── creates withdrawal request                     |
|   |        |                                                       |
|   |        |  claim(request_id) ───> After unbonding               |
|   |        |  <─── receives CSPR                                  |
|   +--------+                                                       |
|                                                                    |
|   ADMIN LAYER (Automated/Manual)                                   |
|   +--------+                                                       |
|   | Admin  |  admin_delegate(validator, amount)                    |
|   |        |  ───> Delegates pool CSPR to validators              |
|   |        |                                                       |
|   |        |  admin_undelegate(validator, amount)                  |
|   |        |  ───> Undelegates from validators                    |
|   |        |                                                       |
|   |        |  admin_add_liquidity()                                |
|   |        |  ───> Returns unbonded CSPR to pool                  |
|   |        |                                                       |
|   |        |  harvest_rewards()                                    |
|   |        |  ───> Updates exchange rate with rewards             |
|   +--------+                                                       |
|                                                                    |
|   VALIDATOR LAYER                                                  |
|   +--------+  +--------+  +--------+                               |
|   | MAKE   |  | Bit Cat|  | Era    |  ... 9 approved validators   |
|   | #1     |  | #96    |  | Guard  |                               |
|   +--------+  +--------+  +--------+                               |
|                                                                    |
+-------------------------------------------------------------------+
```

### Why Pool-Based?

We tried direct delegation (V17-V19) but hit **error 64658** (purse mismatch). The pool-based approach:

| Aspect | Direct (V17-V19) | Pool-Based (V20+) |
|--------|------------------|-------------------|
| User delegates | User → Validator | User → Pool |
| Undelegate | User (fails!) | Admin (works!) |
| Complexity | Simple but broken | More steps, reliable |
| Result | Error 64658 | Full cycle works |

---

## The stCSPR Token

### Exchange Rate Mechanism

stCSPR appreciates as staking rewards accumulate:

```
Day 1:   1 stCSPR = 1.000 CSPR  (rate = 1.0)
Day 30:  1 stCSPR = 1.025 CSPR  (rate = 1.025)
Day 90:  1 stCSPR = 1.075 CSPR  (rate = 1.075)
Day 365: 1 stCSPR = 1.170 CSPR  (rate = 1.17, ~17% APY)
```

### Example: Staking Journey

```
1. Alice stakes 1000 CSPR when rate = 1.0
   → Alice receives 1000 stCSPR

2. 6 months later, admin harvests 85 CSPR rewards
   → Pool now has 1085 CSPR for 1000 stCSPR supply
   → New rate = 1.085

3. Alice unstakes her 1000 stCSPR
   → 1000 stCSPR × 1.085 = 1085 CSPR
   → Alice profits 85 CSPR (+8.5%)
```

---

## Complete User Flow

### Step 1: Connect Wallet

```
Click "Connect Wallet" → Choose Casper Wallet/Ledger → Approve connection
```

### Step 2: Stake CSPR

```
1. Enter amount (minimum 1 CSPR)
2. Select a validator from the grid
3. Click "Stake"
4. Confirm in wallet
5. Receive stCSPR tokens instantly
```

### Step 3: Monitor & Earn

```
Your stCSPR balance stays the same
But its CSPR value increases over time!
Check "Your Holdings" to see current value
```

### Step 4: Unstake (When Ready)

```
1. Go to "Unstake" tab
2. Enter stCSPR amount
3. Click "Request Unstake"
4. Wait ~14 hours (7 eras unbonding)
5. Click "Claim" when ready
6. CSPR arrives in your wallet
```

---

## Technical Details

### Current Contract (V22)

| Property | Value |
|----------|-------|
| **Contract Hash** | `2d6a399bca8c71bb007de1cbcd57c7d6a54dc0283376a08fe6024a33c02b0ad3` |
| **Network** | casper-test |
| **Framework** | Odra 2.5.0 |
| **Token** | CEP-18 stCSPR (integrated) |
| **Min Stake** | 1 CSPR |
| **Unbonding** | ~14 hours (7 eras) |

### Entry Points

#### User Functions

| Function | Args | Description |
|----------|------|-------------|
| `stake` | `validator: PublicKey` | Stake attached CSPR, mint stCSPR |
| `request_unstake` | `stcspr_amount: U512` | Burn stCSPR, create withdrawal |
| `claim` | `request_id: u64` | Claim ready withdrawal |

#### Admin Functions

| Function | Args | Description |
|----------|------|-------------|
| `admin_delegate` | `validator, amount` | Delegate pool to validator |
| `admin_undelegate` | `validator, amount` | Undelegate from validator |
| `admin_add_liquidity` | - | Return unbonded to pool |
| `harvest_rewards` | `amount` | Add rewards, update rate |
| `add_approved_validator` | `pk` | Whitelist a validator |

#### View Functions

| Function | Returns | Description |
|----------|---------|-------------|
| `get_exchange_rate` | `U512` | Current stCSPR/CSPR rate |
| `get_stcspr_balance` | `U256` | User's stCSPR balance |
| `get_cspr_value` | `U512` | stCSPR value in CSPR |
| `get_pool_balance` | `U512` | Total pool CSPR |
| `get_pending_withdrawals` | `u64` | Count of pending requests |

### Error Codes

| Code | Error | Meaning |
|------|-------|---------|
| 1 | InsufficientBalance | Not enough CSPR |
| 2 | InsufficientStCsprBalance | Not enough stCSPR |
| 3 | ZeroAmount | Can't stake/unstake 0 |
| 9 | WithdrawalNotReady | Still unbonding |
| 10 | WithdrawalNotFound | Invalid request ID |
| 16 | InsufficientLiquidity | Pool needs more CSPR |
| 19 | ContractPaused | Contract is paused |
| 20 | RewardsTooHigh | Harvest > 10% of pool |
| 21 | ValueOverflow | Numeric overflow |

---

## Development

### Project Structure

```
Casper-projet/
├── client/                    # React Frontend
│   ├── public/
│   │   ├── config.js          # Runtime configuration
│   │   ├── proxy_caller.wasm  # For payable calls
│   │   └── proxy_caller_with_return.wasm  # For return values
│   ├── src/
│   │   ├── components/
│   │   │   ├── StakingForm.tsx       # Main staking UI
│   │   │   ├── WithdrawalStatus.tsx  # Pending claims
│   │   │   └── stake/
│   │   │       └── ValidatorSelector.tsx  # Validator grid
│   │   ├── hooks/
│   │   │   └── useStaking.ts         # Staking logic
│   │   └── services/
│   │       ├── transaction.ts        # Transaction builder
│   │       └── validatorService.ts   # CSPR.cloud API
│   └── api/
│       └── contract-stats.js         # Live RPC API
│
├── stakevue_contract/         # Odra Smart Contract
│   ├── src/lib.rs             # V22 Contract Code
│   ├── Cargo.toml             # Odra 2.5.0
│   └── bin/
│       ├── deploy_v22.rs      # Deploy script
│       ├── add_validators_v22.rs
│       └── test_stake_v22.rs
│
├── archive/                   # Historical versions
│   ├── scripts-v9-v13/
│   ├── scripts-v14/
│   ├── scripts-v15-v20/
│   └── frontend-v1/
│
└── README.md                  # This file
```

### Run Frontend

```bash
cd client
npm install
npm start
# Opens http://localhost:3000
```

### Build Contract

```bash
cd stakevue_contract
cargo odra build
```

### Deploy Contract (Testnet)

```bash
cd stakevue_contract
cargo run --bin deploy_v22 --features livenet
```

### Run Tests

```bash
cd stakevue_contract
cargo odra test
# Runs 12 tests, all passing
```

---

## Security

### Audit Results

| Check | Status |
|-------|--------|
| Reentrancy | Safe (Casper model) |
| Overflow | Protected (u512_to_u256 check) |
| Access Control | Ownable module |
| Rate Limits | harvest_rewards max 10% |
| CEP-18 Standard | Full compliance |

### Security Measures

1. **Ownable**: Only owner can call admin functions
2. **Overflow Protection**: U512→U256 conversion checks
3. **Reward Limits**: harvest_rewards capped at 10% of pool
4. **Validator Whitelist**: Only approved validators allowed

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| **V22** | Dec 2025 | **SDK Compatibility** - U512 for request_unstake, fixes Error 19 |
| **V21** | Dec 2025 | **Odra 2.5.0** - Framework upgrade |
| **V20** | Dec 2025 | **Pool Architecture** - Wise Lending style, fixes error 64658 |
| **V17** | Dec 2025 | Multi-validator delegation |
| **V16** | Dec 2025 | Visual overhaul, accordion selector |
| **V15** | Dec 2025 | Exchange rate mechanism |
| **V14** | Dec 2025 | Integrated CEP-18 token |
| **V13** | Dec 2025 | Minimal payable test |
| **V8** | Dec 2025 | First Odra version |
| **V5** | Nov 2025 | Security hardening |
| **V1** | Nov 2025 | Initial prototype |

---

## Links

| Resource | URL |
|----------|-----|
| **Live Demo** | https://casper-projet.vercel.app |
| **V22 Contract** | [View on Testnet](https://testnet.cspr.live/contract/2d6a399bca8c71bb007de1cbcd57c7d6a54dc0283376a08fe6024a33c02b0ad3) |
| **Odra Framework** | https://odra.dev |
| **Casper Network** | https://casper.network |
| **Testnet Faucet** | https://faucet.casper.network |

---

## FAQ

### How is this different from native staking?

Native staking locks your CSPR directly with a validator. StakeVue gives you liquid tokens (stCSPR) that represent your stake, so you can use them elsewhere while still earning.

### What's the unbonding period?

~14 hours (7 eras on testnet). This is the time between requesting unstake and being able to claim.

### Are there any fees?

Currently no protocol fees. Validators take their commission from rewards.

### Is it safe?

The contract uses Odra's security modules and has been tested extensively. However, this is testnet - always do your own research.

### Why do I need to select a validator?

Your validator choice determines who the admin will delegate to. Different validators have different commission rates and performance.

---

## Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Open Pull Request

---

<p align="center">
  <b>Casper Hackathon 2025</b> | <b>DoraHacks</b> | <b>DeFi Track</b>
</p>

<p align="center">
  <i>Stake smart. Stay liquid.</i>
</p>
