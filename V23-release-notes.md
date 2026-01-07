# StakeVue Release Notes: V23

> **Release Date**: January 2026
> **Framework**: Odra 2.5.0
> **Network**: Casper Testnet 2.0
> **Contract**: Unchanged from V22

---

## 📋 Version Summary

| Version | Date | Main Change | Status |
|---------|------|-------------|--------|
| **V23** | Jan 7 | Analytics & Documentation | ✅ **Current** |
| **V22** | Dec 19 | SDK Compatibility (U512 fix) | ✅ Stable |
| **V21** | Dec 19 | Odra 2.5.0 Upgrade | ✅ Tested |
| **V20** | Dec 18 | Pool Architecture | ✅ Tested |

---

## V23 - Analytics & Documentation Update ✅

**Contract Hash**: `2d6a399bca8c71bb007de1cbcd57c7d6a54dc0283376a08fe6024a33c02b0ad3` *(unchanged from V22)*

### Overview

V23 focuses on **frontend analytics**, **TVL accuracy**, and **documentation**. No smart contract modifications - the V22 contract remains deployed and stable.

---

## 📊 TVL Tracking Fix

### Problem Identified

The TVL chart component was displaying **1,073.81M CSPR** which represents the entire Casper network's staked amount, instead of the contract's actual TVL (~1,146 CSPR).

### Root Cause Analysis

```typescript
// BEFORE (V22) - client/src/components/TVLChart.tsx
const fetchTVL = useCallback(async () => {
  try {
    const metrics = await csprCloudApi.getAuctionMetrics();
    // ❌ Problem: getAuctionMetrics() returns NETWORK-WIDE staking data
    // This includes ALL validators on Casper, not just our contract
    return metrics.total_stake; // Returns ~1,073,810,000,000 motes
  } catch (error) {
    console.error('Failed to fetch TVL:', error);
    return null;
  }
}, []);
```

### Solution Implemented

```typescript
// AFTER (V23) - client/src/components/TVLChart.tsx
const FALLBACK_TVL = 1082; // Known delegated amount as fallback

const fetchContractTVL = useCallback(async () => {
  try {
    const response = await fetch('/api/contract-stats');
    if (response.ok) {
      const data = await response.json();
      // ✅ Fix: Fetch from our API that queries the actual contract purse
      const tvl = data.totalPoolCspr || 0;
      return tvl;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch contract TVL:', error);
    return null;
  }
}, []);
```

### API Enhancement

```javascript
// client/api/contract-stats.js

// Known delegations tracked manually (updated when admin delegates/undelegates)
const KNOWN_DELEGATIONS = {
  // MAKE Validator - 550 CSPR delegated
  "0106ca7c39cd272dbf21a86eeb3b36b7c26e2e9b94af64292419f7862936bca2ca": 550000000000,
  // Era Guardian Validator - 532 CSPR delegated
  "012d58e05b2057a84115709e0a6ccf000c6a83b4e8dfa389a680c1ab001864f1f2": 532000000000
};

const TOTAL_DELEGATED = Object.values(KNOWN_DELEGATIONS).reduce((a, b) => a + b, 0);
// TOTAL_DELEGATED = 1,082,000,000,000 motes = 1,082 CSPR

export default async function handler(req, res) {
  // Query contract purse for liquid balance
  const purseURef = "uref-3e8ff29a521e5902bcfc106c2e1fe94aa29fa8a6246ed1fe375d350f5d34f6e2-007";

  // Fetch liquid balance from CSPR.cloud
  const response = await fetch(`https://api.testnet.cspr.cloud/purses/${purseURef}`);
  const data = await response.json();
  const liquidBalance = data.balance || 0; // ~64 CSPR

  // Total TVL = Liquid + Delegated
  const totalPool = liquidBalance + TOTAL_DELEGATED;

  return res.json({
    liquidBalance: liquidBalance,
    liquidBalanceCspr: liquidBalance / 1e9,
    delegatedBalance: TOTAL_DELEGATED,
    delegatedBalanceCspr: TOTAL_DELEGATED / 1e9,
    totalPool: totalPool,
    totalPoolCspr: totalPool / 1e9  // ~1,146 CSPR
  });
}
```

### Result

| Metric | Before (V22) | After (V23) |
|--------|--------------|-------------|
| TVL Displayed | 1,073.81M CSPR ❌ | 1,146 CSPR ✅ |
| Data Source | Network auction metrics | Contract purse + delegations |
| Accuracy | Incorrect | Correct |

---

## 🔍 Validator Delegations API

### New Endpoint

```javascript
// client/api/validator-delegations.js

const VALIDATORS = [
  {
    index: 1,
    name: "MAKE",
    publicKey: "0106ca7c39cd272dbf21a86eeb3b36b7c26e2e9b94af64292419f7862936bca2ca"
  },
  {
    index: 4,
    name: "Era Guardian",
    publicKey: "012d58e05b2057a84115709e0a6ccf000c6a83b4e8dfa389a680c1ab001864f1f2"
  }
  // ... 11 approved validators total
];

const knownDelegations = {
  "0106ca7c39cd272dbf21a86eeb3b36b7c26e2e9b94af64292419f7862936bca2ca": 550000000000,
  "012d58e05b2057a84115709e0a6ccf000c6a83b4e8dfa389a680c1ab001864f1f2": 532000000000
};

export default async function handler(req, res) {
  const delegations = VALIDATORS.map(v => ({
    ...v,
    delegatedAmount: knownDelegations[v.publicKey] || 0,
    delegatedAmountCspr: (knownDelegations[v.publicKey] || 0) / 1e9
  }));

  const totalDelegated = Object.values(knownDelegations).reduce((a, b) => a + b, 0);

  return res.json({
    delegations,
    totalDelegated,
    totalDelegatedCspr: totalDelegated / 1e9
  });
}
```

### Technical Challenge: Live Delegation Data

We attempted to fetch live delegation data but encountered limitations:

```typescript
// Attempt 1: Direct RPC Query - FAILED
// client/src/services/contractReader.ts
const getDelegations = async (purseURef: string) => {
  const rpcUrl = "https://rpc.testnet.casperlabs.io/rpc";
  // ❌ Error: ERR_NAME_NOT_RESOLVED (DNS blocked in browser)
};

// Attempt 2: CSPR.cloud Delegators Endpoint - FAILED
// GET /validators/{publicKey}/delegators
const response = await fetch(
  `https://api.testnet.cspr.cloud/validators/${validatorPk}/delegators`
);
// ❌ Error: 404 Not Found (endpoint doesn't exist for testnet)
```

### Solution: Hardcoded Fallback

Since live delegation queries are not available through accessible APIs, we implemented a hardcoded fallback that must be manually updated when delegations change:

```javascript
// Update these values after admin delegate/undelegate operations
const KNOWN_DELEGATIONS = {
  "0106ca7c...": 550000000000, // Update after delegate to MAKE
  "012d58e0...": 532000000000  // Update after delegate to Era Guardian
};
```

---

## 📸 Documentation: Screenshots Section

### New README Structure

Added comprehensive visual documentation with 8 screenshots:

```markdown
## 📸 Screenshots

<p align="center">
  <img src="docs/images/hero.png" alt="StakeVue Hero" width="100%"/>
  <br><em>Landing page with real-time CSPR stats</em>
</p>
<!-- ... 7 more screenshots ... -->

### 🔗 On-Chain Proof
<p align="center">
  <img src="docs/images/contract-proof.png" alt="Contract Proof"/>
  <br><em>Real contract data on cspr.live showing 1,146 CSPR TVL</em>
</p>
```

### File Structure

```
docs/
└── images/
    ├── hero.png           (702 KB) - Landing page "Stake CSPR. Earn Rewards"
    ├── dashboard.png      (312 KB) - Portfolio with stats & charts
    ├── stake.png          (290 KB) - Stake form with validator selection
    ├── calculator.png     (196 KB) - Rewards calculator
    ├── validators.png     (222 KB) - Approved validators list
    ├── guide.png          (953 KB) - "Master Liquid Staking" guide
    ├── faq.png            (187 KB) - FAQ section
    └── contract-proof.png (173 KB) - cspr.live delegation proof
```

---

## 🗂️ Project Cleanup

### Archived Files

Moved deprecated TypeScript API files to `archive/` folder:

| File | Reason | New Location |
|------|--------|--------------|
| `api/contract-stats.ts` | Replaced by JS serverless function | `archive/api-typescript-old/` |
| `api/staking-stats.ts` | Unused endpoint | `archive/api-typescript-old/` |
| `vercel.json` (root) | Duplicate of client/vercel.json | `archive/vercel-root-old.json` |

### Updated Project Structure

```
Casper-projet/
├── client/
│   ├── api/                          # Vercel Serverless Functions
│   │   ├── contract-stats.js         # ✅ TVL & pool statistics
│   │   ├── validator-delegations.js  # ✅ Delegation breakdown
│   │   └── price.js                  # CSPR price from CoinGecko
│   ├── src/
│   │   ├── components/
│   │   │   ├── TVLChart.tsx          # ✅ Fixed to use contract TVL
│   │   │   ├── ValidatorDelegations.tsx
│   │   │   └── AdminPanel.tsx
│   │   ├── services/
│   │   │   ├── csprCloud.ts          # CSPR.cloud API integration
│   │   │   └── contractReader.ts     # Contract state queries
│   │   └── hooks/
│   └── vercel.json                   # Vercel configuration
├── docs/
│   └── images/                       # ✅ NEW: 8 screenshots
├── stakevue_contract/                # Odra smart contract (unchanged)
│   ├── src/lib.rs
│   └── Odra.toml
├── scripts/                          # Admin helper scripts
└── archive/                          # Deprecated files
```

---

## 🔧 Modified Files Summary

### Frontend Components

| File | Changes |
|------|---------|
| `TVLChart.tsx` | Changed data source from `getAuctionMetrics()` to `/api/contract-stats` |
| `csprCloud.ts` | Added `getValidatorDelegators()` method (unused - API returns 404) |

### Serverless APIs

| File | Changes |
|------|---------|
| `contract-stats.js` | Added `KNOWN_DELEGATIONS` tracking, calculates total TVL |
| `validator-delegations.js` | New endpoint for delegation breakdown |

### Documentation

| File | Changes |
|------|---------|
| `README.md` | Added Screenshots section, On-Chain Proof, updated to V23 |
| `docs/images/*` | 8 new screenshot files |

---

## 📊 Contract State (V23)

### Purse Information

```
URef: uref-3e8ff29a521e5902bcfc106c2e1fe94aa29fa8a6246ed1fe375d350f5d34f6e2-007
Type: Purse
```

### Balance Breakdown

| Category | Amount (motes) | Amount (CSPR) | Percentage |
|----------|---------------|---------------|------------|
| Liquid Balance | ~64,000,000,000 | ~64 CSPR | 5.6% |
| Delegated to MAKE | 550,000,000,000 | 550 CSPR | 48.0% |
| Delegated to Era Guardian | 532,000,000,000 | 532 CSPR | 46.4% |
| **Total TVL** | **~1,146,000,000,000** | **~1,146 CSPR** | **100%** |

### Delegation Details

| Validator | Public Key | Amount | Commission |
|-----------|------------|--------|------------|
| MAKE (#1) | `0106ca7c39cd272dbf21a86eeb3b36b7c26e2e9b94af64292419f7862936bca2ca` | 550 CSPR | 10% |
| Era Guardian (#4) | `012d58e05b2057a84115709e0a6ccf000c6a83b4e8dfa389a680c1ab001864f1f2` | 532 CSPR | 10% |

---

## 🚀 Migration V22 → V23

### Breaking Changes

**None**. V23 is fully backward compatible:
- Same V22 smart contract deployed
- Same entry points and signatures
- Only frontend/API improvements

### Update Steps

```bash
# Pull latest code
git pull origin main

# Install dependencies (no new packages)
cd client && npm install

# Start development server
npm start
```

### Environment Variables

No changes required. Same configuration as V22:

```env
REACT_APP_CSPR_CLOUD_API_KEY=your_api_key
REACT_APP_CONTRACT_HASH=2d6a399bca8c71bb007de1cbcd57c7d6a54dc0283376a08fe6024a33c02b0ad3
```

---

## 🧪 Testing

### Contract Tests

```bash
cd stakevue_contract
cargo odra test

# Results: 12/12 tests passing ✅
```

### Test Coverage

| Test | Status |
|------|--------|
| `test_stake` | ✅ Pass |
| `test_unstake` | ✅ Pass |
| `test_claim` | ✅ Pass |
| `test_exchange_rate` | ✅ Pass |
| `test_harvest_rewards` | ✅ Pass |
| `test_admin_delegate` | ✅ Pass |
| `test_admin_undelegate` | ✅ Pass |
| `test_admin_add_liquidity` | ✅ Pass |
| `test_overflow_protection` | ✅ Pass |
| `test_rewards_limit` | ✅ Pass |
| `test_pause_unpause` | ✅ Pass |
| `test_access_control` | ✅ Pass |

---

## 🎯 Key Improvements Summary

1. **Accurate TVL Display**
   - Fixed: Shows contract TVL (~1,146 CSPR) instead of network total (~1,073M CSPR)
   - Source: Contract purse balance + tracked delegations

2. **Delegation Visibility**
   - New API endpoint for delegation breakdown
   - Shows which validators hold pool funds

3. **Visual Documentation**
   - 8 screenshots demonstrating all features
   - On-chain proof linking to cspr.live

4. **Code Cleanup**
   - Archived deprecated TypeScript APIs
   - Consolidated configuration files

5. **README V23**
   - Updated version badge and TVL badge
   - Added Screenshots and On-Chain Proof sections
   - Updated Version History

---

## 🔗 Links

| Resource | URL |
|----------|-----|
| **V22 Contract** | https://testnet.cspr.live/contract/2d6a399bca8c71bb007de1cbcd57c7d6a54dc0283376a08fe6024a33c02b0ad3 |
| **Contract Purse** | https://testnet.cspr.live/uref/uref-3e8ff29a521e5902bcfc106c2e1fe94aa29fa8a6246ed1fe375d350f5d34f6e2-007 |
| **Frontend** | https://casper-projet.vercel.app |
| **Repository** | https://github.com/le-stagiaire-ag2r/Casper-projet |
| **Odra Framework** | https://odra.dev |

---

## 📝 Known Limitations

1. **Delegation Tracking**: Currently hardcoded; requires manual update after admin operations
2. **Live RPC Queries**: DNS blocked in browser environment
3. **CSPR.cloud Delegators API**: Returns 404 on testnet

### Future Improvements (V24+)

- [ ] Automatic delegation tracking via backend job
- [ ] WebSocket updates for real-time TVL
- [ ] Historical TVL chart with time series data

---

*Released: January 7, 2026*
*Contract unchanged from V22 - Frontend & Documentation update only*
