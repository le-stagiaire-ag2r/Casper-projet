# 🌌 StakeVue

### Liquid Staking Protocol for Casper Network

<p align="center">
  <img src="https://img.shields.io/badge/Casper-2.0_Testnet-00D4FF?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Version-16-8B5CF6?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Odra-2.4.0-FF6B35?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge"/>
</p>

<p align="center">
  <b>🎯 Casper Hackathon 2025</b> • <b>💰 DeFi Track</b> • <b>🏆 DoraHacks</b>
</p>

---

## 🤔 What is StakeVue?

You have **CSPR**. You want to earn rewards (~15% APY). But traditional staking **locks your tokens** for days...

**StakeVue fixes that:**

```
❌ Traditional Staking:
   100 CSPR ──▶ Validator ──▶ 🔒 LOCKED (14+ days)
                              You can't use them!

✅ StakeVue:
   100 CSPR ──▶ StakeVue ──▶ 💎 100 stCSPR (usable immediately!)
                             📈 Your stCSPR earns rewards
                             🔓 Withdraw anytime
```

That's **liquid staking**. Your tokens work for you AND stay liquid. 🚀

---

## ⚙️ How Does It Work?

### 1️⃣ You Stake

```
You send:    100 CSPR
You receive: ~87 stCSPR (at current rate 1.15)

📐 Formula: stCSPR = CSPR ÷ exchange_rate
```

### 2️⃣ Your stCSPR Appreciates

```
📅 Day 1:   Rate = 1.0   ──▶ 100 stCSPR = 100 CSPR
📅 Day 30:  Rate = 1.15  ──▶ 100 stCSPR = 115 CSPR  (+15%! 🎉)
📅 Day 60:  Rate = 1.30  ──▶ 100 stCSPR = 130 CSPR  (+30%! 🚀)

The rate increases as rewards flow into the pool.
Your stCSPR count stays the same, but its VALUE grows!
```

### 3️⃣ You Unstake (Whenever You Want!)

```
You burn:    100 stCSPR  🔥
You receive: 115 CSPR    💰

📐 Formula: CSPR = stCSPR × exchange_rate
```

**No lock-up period. No waiting. Your money, your choice.** ✨

---

## 💡 The Exchange Rate (The Magic)

This is the core innovation. Real example:

```
🏊 Pool starts with:
   Total CSPR:   100
   Total stCSPR: 100
   Rate: 100/100 = 1.0

💰 Rewards are added (+20 CSPR):
   Total CSPR:   120       ⬆️ (+20)
   Total stCSPR: 100       ➡️ (unchanged!)
   Rate: 120/100 = 1.2     📈

🎯 Result:
   Your 100 stCSPR is now worth 120 CSPR!
   You gained +20% without doing anything! 🎉
```

**The magic:** pool grows, supply stays constant, rate increases. 📈

---

## 🎮 Try It!

### 🌐 Live Demo

**👉 https://casper-projet.vercel.app**

1. 🔗 Connect your Casper wallet (testnet)
2. 🚰 Get test CSPR from [faucet.casper.network](https://faucet.casper.network)
3. 💰 Stake some CSPR
4. 👀 Watch your stCSPR balance

### ✨ What You'll See

| Feature | Description |
|---------|-------------|
| 🌌 Galaxy Background | 3D animation with 15,000 particles |
| 🪟 Glass UI | Transparent cards with blur effect |
| 💜 Purple Theme | Cosmic violet accent throughout |
| 📊 Live Stats | Real-time exchange rate |
| 📜 History | All your transactions |

---

## 📜 The Smart Contract

Deployed on **Casper 2.0 Testnet**:

```
📦 Package: 2b6c14a2cac5cfe4a1fd1efc2fc02b1090dbc3a6b661a329b90c829245540985
```

🔍 [View on Explorer](https://testnet.cspr.live/contract-package/2b6c14a2cac5cfe4a1fd1efc2fc02b1090dbc3a6b661a329b90c829245540985)

### 🎯 Entry Points

| Function | Description |
|----------|-------------|
| `stake()` | 💰 Send CSPR, receive stCSPR |
| `unstake(amount)` | 🔥 Burn stCSPR, get CSPR back |
| `add_rewards()` | ➕ Add rewards to pool (owner only) |
| `get_exchange_rate()` | 📊 Current rate (9 decimals) |

### 🏗️ Architecture

```rust
pub struct StakeVue {
    token: SubModule<Cep18>,      // 💎 stCSPR (CEP-18 standard)
    total_cspr_pool: Var<U512>,   // 🏊 All CSPR in the contract
}

// 📐 Rate = total_cspr_pool / token.total_supply()
```

Built with [Odra Framework](https://odra.dev) 🛠️

---

## 📁 Project Structure

```
Casper-projet/
│
├── 🎨 client/                  # React frontend
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── pages/              # Home, Stake, Guide
│   │   └── hooks/              # useStaking, useCsprClick
│   └── api/
│       └── contract-stats.js   # Vercel serverless (reads blockchain)
│
├── 🦀 stakevue_contract/       # Odra smart contract
│   ├── src/lib.rs              # Contract code
│   └── bin/                    # Deploy & test scripts
│
├── 🔧 scripts/                 # Node.js utilities
├── 📦 archive/                 # Old versions (V1-V14)
│
├── 📖 README.md                # You are here!
└── 📋 RELEASE_NOTES_V16.md     # Detailed changelog V8→V16
```

---

## 🚀 Run Locally

### Frontend

```bash
cd client
npm install
npm start        # 🌐 http://localhost:3000
```

### Smart Contract

```bash
cd stakevue_contract
cargo odra build                              # 🔨 Compile
cargo test                                    # ✅ Tests
cargo run --bin deploy_v15 --features livenet # 🚀 Deploy
```

---

## 📜 Version History

| Version | What's New |
|---------|------------|
| **🎨 V16** | Visual overhaul - Galaxy, glass UI, SVG icons |
| **🌐 V15.1** | Live API - Real-time contract stats |
| **📈 V15** | Exchange rate - stCSPR appreciation |
| **💎 V14** | Integrated CEP-18 token (finally works!) |
| **🧪 V13** | Minimal payable test |
| **❌ V12** | CEP-18 attempt (package conflict) |
| **🔍 V11** | External token debugging |
| **🔄 V10** | Integration attempts |
| **🔗 V9** | External token reference (broken) |
| **🔐 V8.2** | Ownable + Pauseable modules |
| **⭐ V8.0** | First real staking with Odra |
| **📊 V7.x** | APY slider, charts, CSV export |
| **🔔 V6.x** | Price alerts, portfolio history |
| **🛡️ V5.0** | Security hardening (A+ score) |
| **👥 V4.0** | Multi-validator support |
| **🪙 V3.0** | stCSPR token concept |
| **👤 V2.0** | Per-user tracking |
| **🎯 V1.0** | Basic stake/unstake |

📋 **Full details:** [RELEASE_NOTES_V16.md](./RELEASE_NOTES_V16.md)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| 🦀 Smart Contract | Rust, Odra 2.4.0, CEP-18 |
| ⚛️ Frontend | React 18, TypeScript, styled-components |
| 🎮 3D Graphics | Three.js, React Three Fiber |
| 👛 Wallet | CSPR.click |
| 🌐 API | Vercel Serverless, Casper RPC |
| 🚀 Deployment | Vercel + Casper Testnet |

---

## 🔗 Links

| | |
|---|---|
| 🌐 **Live Demo** | https://casper-projet.vercel.app |
| 📜 **Contract** | [View on Testnet](https://testnet.cspr.live/contract-package/2b6c14a2cac5cfe4a1fd1efc2fc02b1090dbc3a6b661a329b90c829245540985) |
| 🛠️ **Odra Framework** | https://odra.dev |
| 🌍 **Casper Network** | https://casper.network |
| 🚰 **Testnet Faucet** | https://faucet.casper.network |

---

<p align="center">
  <b>🏆 Casper Hackathon 2025</b> • <b>DoraHacks</b> • <b>DeFi Track</b>
</p>

<p align="center">
  <i>Stake smart. Stay liquid.</i> 💎
</p>
