# StakeVue Release Notes: V23

**Release Date**: January 2026
**Framework**: Odra 2.5.0
**Network**: Casper Testnet 2.0

---

## V23 - Analytics & Documentation Update

**Contract Hash**: `2d6a399bca8c71bb007de1cbcd57c7d6a54dc0283376a08fe6024a33c02b0ad3` (unchanged)

### What's New

V23 focuses on analytics, TVL tracking, and documentation improvements. No smart contract changes - same stable V22 contract.

---

## TVL Tracking Fix

**Problem**: TVL chart displayed 1,073.81M CSPR (network total) instead of contract TVL (~1,146 CSPR)

**Solution**: Changed to fetch from `/api/contract-stats` which returns actual contract TVL

**Result**: Now correctly shows ~1,146 CSPR

---

## Validator Delegations Display

Real-time display of validator delegations in the Admin Panel:

| Validator | Amount | Share |
|-----------|--------|-------|
| MAKE (#1) | 550 CSPR | 48% |
| Era Guardian (#4) | 532 CSPR | 47% |
| Liquid | 64 CSPR | 5% |
| **Total TVL** | **1,146 CSPR** | **100%** |

---

## Screenshots Section

Added 8 screenshots to README:

- `hero.png` - Landing page
- `dashboard.png` - Portfolio with stats
- `stake.png` - Stake form
- `calculator.png` - Rewards calculator
- `validators.png` - Validators list
- `guide.png` - Master Liquid Staking guide
- `faq.png` - FAQ section
- `contract-proof.png` - On-chain proof from cspr.live

---

## Live Stats

| Metric | Value |
|--------|-------|
| Total TVL | ~1,146 CSPR |
| Liquid Balance | ~64 CSPR |
| Delegated | ~1,082 CSPR |
| Active Validators | 2 (11 approved) |
| Tests | 12/12 passing |

---

## Key Improvements

1. **Accurate TVL** - Shows contract TVL, not network total
2. **Visual Documentation** - 8 screenshots in README
3. **On-Chain Proof** - Direct link to cspr.live
4. **Clean Codebase** - Archived unused files
5. **Admin Visibility** - Delegation breakdown by validator

---

## Links

- **Contract**: https://testnet.cspr.live/contract/2d6a399bca8c71bb007de1cbcd57c7d6a54dc0283376a08fe6024a33c02b0ad3
- **Contract Purse**: https://testnet.cspr.live/uref/uref-3e8ff29a521e5902bcfc106c2e1fe94aa29fa8a6246ed1fe375d350f5d34f6e2-007
- **Frontend**: https://casper-projet.vercel.app

---

*Released: January 7, 2026*
