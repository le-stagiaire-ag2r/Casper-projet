# StakeVue V8 - Release Notes

## Real Liquid Staking is finally here on Casper!

After months of development, StakeVue V8 marks a major milestone: **your CSPR is actually staked** on the Casper blockchain.

---

## What is StakeVue?

Imagine you have 1000 CSPR in your wallet. You want to put them to work and earn rewards (~17% per year), but you don't want to lock them up for months.

**StakeVue lets you:**

```
1. Deposit your CSPR
2. Receive stCSPR (liquid tokens)
3. Earn rewards automatically
4. Withdraw anytime
```

It's like a savings account, but for your crypto!

---

## Real-World Example

### Before (without StakeVue)

```
You have: 1000 CSPR
You stake directly with a validator
Your CSPR is locked for 14+ days
You can't do anything with it meanwhile
```

### With StakeVue V8

```
You have: 1000 CSPR
You deposit 500 CSPR on StakeVue
You receive: 500 stCSPR (usable immediately)
You keep: 500 CSPR in your wallet

Your 500 stCSPR earns ~17% APY
You can withdraw anytime
No lock-up period!
```

---

## What's New in V8

### Before (V7 and earlier)

| Aspect | How it worked |
|--------|---------------|
| Your CSPR | Stayed in your wallet (simulation) |
| Staking | Was simulated for demo purposes |
| Rewards | Were calculated locally |

### Now (V8)

| Aspect | How it works |
|--------|--------------|
| Your CSPR | **Actually transferred** to the smart contract |
| Staking | **Real** on the Casper blockchain |
| Rewards | Calculated by the protocol |

---

## How Does It Work?

### 1. Connect Your Wallet

Go to [casper-projet.vercel.app](https://casper-projet.vercel.app) and click "Connect Wallet".

We support all Casper wallets via CSPR.click:
- Casper Wallet
- Ledger
- Torus
- And more...

### 2. Deposit Your CSPR

```
Example: You want to stake 100 CSPR

What happens:
- 100 CSPR leaves your wallet
- ~5 CSPR gas fee (Casper network)
- You receive 100 stCSPR

Your wallet after: -105 CSPR, +100 stCSPR
```

### 3. Your stCSPR Works for You

While you sleep, your stCSPR earns rewards:

```
100 stCSPR at 17% APY

After 1 month:  ~1.4 CSPR in rewards
After 6 months: ~8.5 CSPR in rewards
After 1 year:   ~17 CSPR in rewards
```

### 4. Withdraw Anytime

```
Want your CSPR back?

- You "unstake" your 100 stCSPR
- You receive ~100 CSPR (+ accumulated rewards)
- ~5 CSPR gas fee

No waiting period!
```

---

## Fees

| Fee Type | Amount | Who receives it |
|----------|--------|-----------------|
| Gas (stake) | ~5-8 CSPR | Casper Network |
| Gas (unstake) | ~5-8 CSPR | Casper Network |
| StakeVue fee | 0% | Nobody (free!) |

**Note:** Gas fees are paid to the Casper network, not to StakeVue. We don't take any commission!

---

## Security

### The Smart Contract

Our code is:
- **Open source** - Anyone can verify it
- **Simple** - Only 73 lines of Rust code
- **Tested** - Deployed and tested on testnet

### Your Funds

```
Your CSPR is stored in the smart contract
Only YOU can withdraw it (with your wallet)
Nobody else has access to your funds
```

---

## Frequently Asked Questions

### "What is stCSPR?"

It's a token that represents your share in the staking pool. 1 stCSPR = 1 CSPR deposited (plus rewards accumulated over time).

### "Why doesn't my balance update immediately?"

The wallet API (CSPR.click) has a cache. After a transaction:
- The interface shows the correct amount (local calculation)
- If you refresh the page, you'll see the blockchain balance

This is normal! Your CSPR is definitely there.

### "Is this on mainnet?"

No, V8 is on **testnet** for now. This means you can test with free test CSPR without risking real funds.

To get test CSPR: [faucet.casper.network](https://faucet.casper.network)

### "When mainnet?"

We're planning mainnet for V9, after a complete security audit.

---

## See It in Action

### Real Stake Transaction

Here's an actual stake transaction on testnet:

**Transaction:** [2945b131...](https://testnet.cspr.live/transaction/2945b1311537024452ccdf9812797a2349696049b1c78eb809bd7af9297e4124)

```
Action: Stake
Amount: 5 CSPR
Result: 5 CSPR transferred to contract
Gas used: ~1 CSPR
```

### Real Unstake Transaction

**Transaction:** [fcc6fd33...](https://testnet.cspr.live/transaction/fcc6fd3320e84c93d8a077f0502c7cd7557b03429804d0a2baf1f6ca169e372b)

```
Action: Unstake
Amount: 2 CSPR
Result: 2 CSPR returned to wallet
Gas used: ~1 CSPR
```

---

## Useful Links

| Resource | Link |
|----------|------|
| **Web App** | [casper-projet.vercel.app](https://casper-projet.vercel.app) |
| **Smart Contract** | [View on testnet](https://testnet.cspr.live/contract-package/f9205d8ad33cfb7fd47873babc4bc3388098beaea3573e7b8a69800dab9d68e4) |
| **Source Code** | [GitHub](https://github.com/le-stagiaire-ag2r/Casper-projet) |
| **Testnet Faucet** | [faucet.casper.network](https://faucet.casper.network) |

---

## Version History

| Version | Date | What's New |
|---------|------|------------|
| **V8.1** | Dec 2025 | Frontend integration, balance fix |
| **V8.0** | Dec 2025 | Real staking with Odra framework |
| V7.x | Nov 2025 | Improved interface, demo mode |
| V6.x | Oct 2025 | Price alerts, portfolio history |
| V5.x | Sep 2025 | Enhanced security |

---

## Acknowledgments

StakeVue is developed for the **Casper Hackathon 2025** on DoraHacks.

Thanks to:
- The Casper team for the network and documentation
- Odra for their smart contract framework
- CSPR.click for wallet integration
- The community for feedback and testing

---

## Contact

Questions? Bugs? Suggestions?

- Open an issue on [GitHub](https://github.com/le-stagiaire-ag2r/Casper-projet/issues)

---

**StakeVue - Liquid staking, simplified.**

*Stake smart. Stay liquid.*
