# StakeVue Release Notes: V18 → V22

> **Development Period**: December 2025
> **Framework**: Odra 2.4.0 → 2.5.0
> **Network**: Casper Testnet 2.0

---

## 📋 Version Summary

| Version | Date | Main Change | Status |
|---------|------|-------------|--------|
| **V22** | Dec 19 | SDK Compatibility (U512 fix) | ✅ **Current** |
| **V21** | Dec 19 | Odra 2.5.0 Upgrade | ✅ Tested |
| **V20** | Dec 18 | Pool Architecture (Wise Lending) | ✅ Tested |
| **V19** | Dec 17 | Native Odra delegate/undelegate | ❌ Error 64658 |
| **V18** | Dec 16 | Delegation Debug Tools | ❌ Error 64658 |

---

## V22 - SDK Compatibility Fix ✅

**Contract Hash**: `2d6a399bca8c71bb007de1cbcd57c7d6a54dc0283376a08fe6024a33c02b0ad3`

### Problem Solved

Calling `request_unstake` from the web frontend caused **Error 19 (LeftOverBytes)**. The JavaScript SDK encoded amounts as U512 but the contract expected U256.

### Changes

```rust
// BEFORE (V21)
pub fn request_unstake(&mut self, stcspr_amount: U256) -> u64

// AFTER (V22)
pub fn request_unstake(&mut self, stcspr_amount: U512) -> u64
```

### Modified Event

```rust
pub struct UnstakeRequested {
    pub staker: Address,
    pub request_id: u64,
    pub stcspr_amount: U512,  // Changed from U256 to U512
    pub cspr_amount: U512,
}
```

### Result

- ✅ Unstake works from frontend
- ✅ Full cycle stake → unstake → claim tested and validated
- ✅ 12 tests passing

### Test Transactions

| Action | Transaction Hash | Amount | Status |
|--------|-----------------|--------|--------|
| Stake | `43dc3f14...` | 25 CSPR | ✅ Success |
| Unstake | `edc4cd05...` | 20 CSPR | ✅ Success |
| Claim | `75f598bd...` | 5 CSPR | ✅ Success |

---

## V21 - Odra 2.5.0 Upgrade

### Changes

- Framework upgrade Odra 2.4.0 → **2.5.0**
- Better validator support
- Same pool-based architecture as V20
- Internal Odra bug fixes

### Dependencies

```toml
[dependencies]
odra = "2.5.0"
odra-modules = "2.5.0"

[dev-dependencies]
odra-test = "2.5.0"
```

### Tests

- ✅ 12/12 tests passing
- ✅ Testnet deployment successful
- ❌ Frontend unstake failed (Error 19) → Fixed in V22

---

## V20 - Pool Architecture (Wise Lending Style) ✅

### Why This Change?

Versions V17-V19 attempted to delegate directly from the contract to validators, but Casper 2.0 consistently returned **Error 64658** (purse mismatch).

After analyzing **Wise Lending** transactions on testnet, we adopted their pool-based architecture.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    POOL ARCHITECTURE V20                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   USER                           ADMIN                      │
│   ────                           ─────                      │
│   stake() ────────────┐   ┌───── admin_delegate()           │
│                       │   │                                 │
│   request_unstake() ──┼───┼───── admin_undelegate()         │
│                       │   │                                 │
│   claim() ────────────┼───┼───── admin_add_liquidity()      │
│                       ▼   ▼                                 │
│                 ┌───────────────┐                           │
│                 │     POOL      │                           │
│                 │    (CSPR)     │                           │
│                 └───────┬───────┘                           │
│                         │                                   │
│                         ▼                                   │
│              ┌─────────────────────┐                        │
│              │     VALIDATORS      │                        │
│              │  (admin delegation) │                        │
│              └─────────────────────┘                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### User Entry Points

| Function | Description |
|----------|-------------|
| `stake(validator)` | CSPR → pool, mint stCSPR |
| `request_unstake(amount)` | Burn stCSPR, create request |
| `claim(request_id)` | Retrieve CSPR (if ready) |

### Admin Entry Points

| Function | Description |
|----------|-------------|
| `admin_delegate(validator, amount)` | Delegate from pool to validator |
| `admin_undelegate(validator, amount)` | Undelegate from a validator |
| `admin_add_liquidity()` | Return undelegated CSPR to pool |
| `harvest_rewards(amount)` | Add rewards, update exchange rate |

### Result

- ✅ No more error 64658
- ✅ Full cycle works
- ✅ Production-ready architecture

---

## V19 - Native Odra Delegation ❌

### Attempt

Use native Odra functions for delegation:

```rust
self.env().delegate(validator, amount, None);
self.env().undelegate(validator, amount, None);
```

### Problem

**Error 64658** (purse mismatch) persisted. The contract cannot undelegate funds it delegated because the "purse" (internal wallet) doesn't match.

### Lesson Learned

On Casper 2.0, undelegation operations must be performed by the same entity that delegated. A smart contract cannot easily recover delegated funds.

---

## V18 - Delegation Debug ❌

### Features

- Pre-flight checks before undelegate
- Diagnostic functions to debug delegation state
- Detailed operation logs

### Debug Functions Added

```rust
pub fn get_delegation_info(&self, validator: PublicKey) -> DelegationInfo
pub fn check_undelegate_feasibility(&self, validator: PublicKey, amount: U512) -> bool
```

### Problem

Despite diagnostics, **Error 64658** continued. The problem was fundamental to the architecture, not the implementation.

### Conclusion

V18 helped understand that the issue wasn't a bug but an architectural limitation of Casper 2.0.

---

## 🔧 Security Fixes (V22)

After CasperSecure analysis, the following fixes were added:

### 1. harvest_rewards Limit

```rust
pub fn harvest_rewards(&mut self, reward_amount: U512) {
    self.ownable.assert_owner(&self.env().caller());

    // Security: Max 10% of pool to prevent manipulation
    let pool = self.pool_balance.get_or_default();
    let max_reward = pool / U512::from(10);
    if reward_amount > max_reward && pool > U512::zero() {
        self.env().revert(Error::RewardsTooHigh);
    }
    // ...
}
```

### 2. U512→U256 Overflow Protection

```rust
fn u512_to_u256(value: U512) -> U256 {
    let mut bytes = [0u8; 64];
    value.to_little_endian(&mut bytes);

    // Check for overflow (bytes 32-63 must be zero)
    for i in 32..64 {
        if bytes[i] != 0 {
            return U256::MAX; // Saturate on overflow
        }
    }
    U256::from_little_endian(&bytes[..32])
}
```

### 3. New Error Codes

| Code | Error | Description |
|------|-------|-------------|
| 19 | ContractPaused | Contract is paused |
| 20 | RewardsTooHigh | Harvest > 10% of pool |
| 21 | ValueOverflow | Numeric overflow |

---

## 📊 Metrics Evolution

| Metric | V18 | V19 | V20 | V21 | V22 |
|--------|-----|-----|-----|-----|-----|
| **Tests** | 8 | 8 | 10 | 12 | 12 |
| **Entry Points** | 18 | 16 | 20 | 20 | 20 |
| **Rust Lines** | ~450 | ~420 | ~520 | ~520 | ~540 |
| **Architecture** | Direct | Direct | Pool | Pool | Pool |
| **Status** | ❌ | ❌ | ✅ | ⚠️ | ✅ |

---

## 🚀 Migration V21 → V22

### Breaking Changes

**None for users**. Only the internal signature of `request_unstake` changes.

### For Frontend

```typescript
// BEFORE (V21 - caused Error 19)
const args = Args.fromMap({
    stcspr_amount: CLValue.newCLU256(amount),  // ❌
});

// AFTER (V22 - works)
const args = Args.fromMap({
    stcspr_amount: CLValue.newCLU512(amount),  // ✅
});
```

### Migration Steps

1. Redeploy V22 contract
2. Update `config.js` with new hash
3. ✅ That's it!

---

## 🎯 Key Lessons

1. **Casper 2.0 purse model**: Contracts cannot undelegate directly → use pool architecture
2. **SDK type matching**: Rust type must exactly match JS SDK type
3. **Error 19 = LeftOverBytes**: Often a type mismatch issue (U256 vs U512)
4. **Error 64658 = Purse mismatch**: Architectural problem, not a bug

---

## 📝 Modified Files

### V22
- `stakevue_contract/src/lib.rs` - U512 for request_unstake
- `client/src/services/transaction.ts` - Fix claim entry point
- `client/src/components/StakingForm.tsx` - Fix request ID tracking

### V20
- Architecture completely rewritten
- New admin_* entry points
- Removed direct auction contract calls

---

## 🔗 Useful Links

| Resource | URL |
|----------|-----|
| **V22 Contract** | [Testnet Explorer](https://testnet.cspr.live/contract/2d6a399bca8c71bb007de1cbcd57c7d6a54dc0283376a08fe6024a33c02b0ad3) |
| **Frontend** | https://casper-projet.vercel.app |
| **Odra Docs** | https://odra.dev |
| **Casper Docs** | https://docs.casper.network |

---

*Last updated: December 21, 2025*
