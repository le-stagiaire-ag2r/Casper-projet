# StakeVue Release Notes

## V17.0.0 - Multi-Validator Delegation (December 2025)

### Major Features

**Real Network Delegation**
- Stakes now go directly to Casper Auction Pool
- Users earn real validator rewards
- True liquid staking on Casper Network

**Multi-Validator Support**
- Choose from 9+ approved validators
- Each validator shows APY, Commission, Performance
- Data fetched in real-time from CSPR.cloud API

**Withdrawal Queue**
- `request_unstake(amount, validator)` - Queue withdrawal request
- 7-era unbonding period (~14 hours on testnet)
- `claim_withdrawal(request_id)` - Claim after unbonding

**Validator Management (Owner)**
- `add_approved_validator(public_key)` - Whitelist validator
- `remove_approved_validator(public_key)` - Remove from whitelist
- `harvest_rewards()` - Auto-compound validator rewards

### Contract Details

```
Contract Hash: c549746587ab0fe02f2f72246d52f6cf21d030c6aaac9908191f12e02dd73747
Network: casper-test
Min Stake: 500 CSPR (Casper network requirement)
Gas Fee: 15 CSPR
```

### Breaking Changes

- Minimum stake increased from 1 CSPR to 500 CSPR
- `stake()` now requires `validator` parameter
- `unstake()` replaced by `request_unstake()` + `claim_withdrawal()`
- New `contract_package_hash` - must update config.js

### Technical Notes

- Built with Odra Framework 2.4.0
- Uses `casper_types::system::auction` for real delegation
- Withdrawal requests stored in contract with era tracking

---

## V16.1.0 - UX Visual Refont (December 2025)

### UI/UX Improvements

**Accordion Validator Selector**
- Collapsible dropdown instead of full list
- Click to expand/collapse
- Shows selected validator in compact header
- Auto-closes when validator selected or clicking outside

**Grid Layout**
- 2-column grid on desktop
- 1-column on mobile (responsive)
- Compact validator cards with key stats

**Validator Information Display**
- APY (estimated annual yield after commission)
- Commission rate (what validator takes)
- Performance score (uptime)
- Rank and delegator count
- "Recommended" badge for best option

**Sort Options**
- Sort by APY (highest first)
- Sort by Commission (lowest first)
- Sort by Performance
- Sort by Popularity (delegators)
- Sort by Rank

### Files Changed

```
client/src/components/stake/ValidatorSelector.tsx  - Accordion component
client/src/components/stake/ValidatorSelector.css  - New styles
client/src/services/validatorService.ts            - CSPR.cloud integration
client/public/config.js                            - V17 config + validators
```

### Technical Notes

- Real-time data from CSPR.cloud API
- Fallback placeholders if API fails
- Key normalization for matching validators

---

## V16.0.0 - UI Improvements (December 2025)

### Changes
- Dark theme refinements
- Improved staking form layout
- Better mobile responsiveness
- Updated branding

---

## V15.1.0 - Live RPC API (December 2025)

### Features
- `/api/contract-stats` endpoint
- Real-time exchange rate from blockchain
- Total pool and stCSPR supply
- Vercel serverless function

---

## V15.0.0 - Exchange Rate Mechanism (December 2025)

### Features
- Dynamic exchange rate (stCSPR appreciates over time)
- `add_rewards()` function for pool growth
- Rate = total_cspr_pool / total_stcspr_supply
- 9-decimal precision

### How it Works
```
Day 1:  Stake 100 CSPR → Get 100 stCSPR (rate = 1.0)
Day 30: Rewards added → Pool grows to 115 CSPR
        Rate = 115/100 = 1.15
        Your 100 stCSPR now worth 115 CSPR!
```

---

## Previous Versions

| Version | Highlights |
|---------|------------|
| V14 | Production-ready with integrated CEP-18 stCSPR token |
| V13 | Minimal version proving payable works |
| V12 | CEP-18 attempt (package key conflict) |
| V9-V11 | External token reference (broken attached_value) |
| V8 | First real CSPR staking with Odra framework |
| V1-V7 | Development iterations |

---

## Upgrade Guide

### From V15/V16 to V17

1. **Update config.js:**
```javascript
contract_hash: "c549746587ab0fe02f2f72246d52f6cf21d030c6aaac9908191f12e02dd73747",
contract_package_hash: "c549746587ab0fe02f2f72246d52f6cf21d030c6aaac9908191f12e02dd73747",
min_stake_amount: "500000000000", // 500 CSPR
transaction_payment: "15000000000", // 15 CSPR gas
approved_validators: [...] // Add validator public keys
```

2. **Update transaction.ts:**
- Add `validatorPublicKeyHex` parameter to `buildStakeTransaction()`
- Replace `unstake` with `request_unstake` + `claim_withdrawal`

3. **Update useStaking.ts:**
- Pass validator to stake/unstake functions

4. **Add ValidatorSelector component:**
- New accordion-style validator picker
- Fetch validator data from CSPR.cloud

---

**StakeVue - Liquid Staking Made Simple**
