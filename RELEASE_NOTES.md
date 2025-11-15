# StakeVue v1.0 - Release Notes

## 🎉 First Release - Casper Hackathon 2026

**Release Date:** November 15, 2025
**Version:** 1.0.0
**Status:** Production Ready

---

## 📦 What's Included

This release contains a fully functional liquid staking protocol for Casper Network:

### Smart Contract
- **Language:** Rust with WebAssembly compilation
- **Version:** casper-contract 5.0.0
- **Deployment:** Casper Testnet 2.0
- **Contract Hash:** `contract-82f9352551599a7ae4d1875286e64b2a0ba9124eef8ad22fa8b51b398fbc28f0`

### Features
✅ **stake(amount)** - Stake CSPR tokens
✅ **unstake(amount)** - Unstake with balance validation
✅ **get_staked_amount()** - Query total staked

### Frontend
✅ Modern, responsive user interface
✅ Ready for Casper wallet integration
✅ Real-time balance visualization

---

## 🔗 Live Deployment

**Deployed Contract:**
https://testnet.cspr.live/contract/82f9352551599a7ae4d1875286e64b2a0ba9124eef8ad22fa8b51b398fbc28f0

**Deployment Transaction:**
https://testnet.cspr.live/transaction/e8e53299df913eb70a819e54b2dbfb8ab8a9605fe9f07b4b1c7e0f3d0c86d4ad

**Test Transaction (Stake 1000 CSPR):**
https://testnet.cspr.live/transaction/738714efb54a4b7b271268347cec5b67fee9dc9d5ea6eb5636464d0c01432ecd

---

## 📚 Documentation

- **README.md** - Complete project documentation
- **SUBMISSION_GUIDE.md** - DoraHacks submission guide
- **VIDEO_SCRIPT.md** - Demo video script

---

## 🏆 Hackathon Submission

**Event:** Casper Hackathon 2026
**Platform:** DoraHacks
**Track:** Liquid Staking
**Prize Pool:** $25,000

---

## 🛠️ Technical Specifications

**Smart Contract:**
- Rust nightly-2024-07-31
- casper-contract 5.0.0
- casper-types 6.0.0
- Compiled to WASM (54KB optimized)

**Security:**
- Input validation on all entry points
- Overflow protection with U512
- Balance checks before unstaking
- Locked contract (non-upgradeable)

**Gas Costs:**
- Deployment: ~29 CSPR
- Stake operation: ~0.6 CSPR
- Query operation: ~0.6 CSPR

---

## ✅ Verification

All functionality has been tested on Casper Testnet:
- ✅ Contract successfully deployed
- ✅ Entry points accessible
- ✅ Storage operations verified
- ✅ Error handling confirmed

---

## 📋 Files Included

```
stakevue-v1.0/
├── README.md
├── SUBMISSION_GUIDE.md
├── VIDEO_SCRIPT.md
├── deploy-v2.sh
├── .gitignore
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
└── smart-contract/
    ├── Cargo.toml
    └── src/lib.rs
```

---

## 🚀 Quick Start

### Deploy Your Own Instance

```bash
# 1. Clone repository
git clone https://github.com/le-stagiaire-ag2r/Casper-projet
cd Casper-projet

# 2. Build contract
cd smart-contract
rustup override set nightly-2024-07-31
cargo build --release --target wasm32-unknown-unknown

# 3. Deploy to testnet
cd ..
./deploy-v2.sh
```

### Run Frontend

```bash
cd frontend
python3 -m http.server 8000
# Open http://localhost:8000
```

---

## 📞 Support

For questions or issues, please refer to the documentation or visit the contract on Casper Testnet Explorer.

---

## 📄 License

MIT License - See LICENSE file for details

---

**Built for Casper Hackathon 2026 | Liquid Staking Track**
