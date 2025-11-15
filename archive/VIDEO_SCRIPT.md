# StakeVue - Video Demo Script

**Duration:** 3-5 minutes
**Format:** Screen recording + voiceover

---

## Introduction (30 seconds)

**[Show frontend homepage]**

"Hi! I'm presenting StakeVue, a liquid staking protocol built for the Casper Network as part of the Casper Hackathon 2026.

StakeVue enables users to stake their CSPR tokens while maintaining liquidity through a simple, secure smart contract deployed on Casper Testnet."

---

## Problem & Solution (30 seconds)

**[Show frontend features section]**

"Traditional staking locks your tokens, making them illiquid. StakeVue solves this by:
- Providing instant stake/unstake operations
- Tracking staked amounts on-chain with full transparency
- Built with security-first approach using Rust and WASM"

---

## Live Smart Contract Demo (90 seconds)

**[Open Casper Testnet Explorer]**

### Part 1: Show Deployed Contract (30 sec)

**Navigate to:**
https://testnet.cspr.live/contract/82f9352551599a7ae4d1875286e64b2a0ba9124eef8ad22fa8b51b398fbc28f0

"Here's our live smart contract deployed on Casper Testnet. You can see:
- Contract hash: 82f9352551599a7ae4d1875286e64b2a0ba9124eef8ad22fa8b51b398fbc28f0
- Three entry points: stake, unstake, and get_staked_amount
- All publicly accessible and verified on-chain"

### Part 2: Show Deployment Transaction (30 sec)

**Navigate to:**
https://testnet.cspr.live/transaction/e8e53299df913eb70a819e54b2dbfb8ab8a9605fe9f07b4b1c7e0f3d0c86d4ad

"This is the deployment transaction. Notice:
- Status: SUCCESS with no errors
- Gas consumed: 59.4 CSPR with 30.4 CSPR refunded
- Block height: 5,926,866
- All entry points properly registered"

**[Scroll to show entry points in transaction details]**

### Part 3: Show Test Transaction (30 sec)

**Navigate to:**
https://testnet.cspr.live/transaction/738714efb54a4b7b271268347cec5b67fee9dc9d5ea6eb5636464d0c01432ecd

"Here's a live test - we staked 1,000 CSPR tokens. Look at the effects:
- AddUInt512: 1000000000000 motes
- This proves the contract correctly updates on-chain storage
- Transaction successful with minimal gas costs"

---

## Frontend Demo (60 seconds)

**[Open frontend/index.html in browser]**

### Show UI Features (30 sec)

"The frontend provides:
- Clean, modern interface for staking operations
- Real-time balance display
- Transaction history tracking
- Responsive design for all devices"

**[Click through different sections]**

### Show How It Works (30 sec)

"The user flow is simple:
1. Connect your Casper wallet
2. Enter amount to stake
3. Confirm transaction
4. View your staked balance instantly

The UI is ready for Casper Signer integration."

---

## Technical Highlights (60 seconds)

**[Show code or README]**

"Let me highlight the technical achievements:

**Smart Contract:**
- Built with Rust and casper-contract 5.0.0
- Compiled to WebAssembly for efficiency
- Three entry points with proper parameter validation
- Security features: overflow protection, balance checks, locked contract

**Deployment:**
- Overcame multiple technical challenges
- ApiError 48 solved with install-upgrade flag
- Migrated from put-deploy to put-transaction for Casper 2.0
- Successfully deployed with all tests passing

**Testing:**
- All entry points verified on testnet
- Real transactions with proof on block explorer
- Gas optimized for cost-effective operations"

---

## Future Vision (30 seconds)

**[Show frontend or roadmap]**

"Our roadmap includes:
- Liquid staking token (stCSPR) minting
- Automated staking rewards distribution
- Multi-validator delegation
- Governance features for community input
- Advanced analytics dashboard"

---

## Call to Action (20 seconds)

**[Show GitHub repo or links]**

"All code is open source on GitHub with comprehensive documentation.

Try it yourself:
- Contract is live on Casper Testnet
- README includes full deployment guide
- Frontend ready to test

Thank you for watching! Vote for StakeVue on DoraHacks!"

---

## Recording Tips

### Setup:
1. **Clean your desktop** - Remove distractions
2. **Browser tabs** - Pre-open all needed tabs:
   - Frontend (localhost or deployed)
   - Contract explorer link
   - Deployment transaction
   - Test transaction
3. **Test audio** - Use good microphone
4. **Screen resolution** - 1920x1080 recommended

### During Recording:
- **Speak clearly and confidently**
- **Don't rush** - Take pauses
- **Show, don't just tell** - Use mouse to highlight
- **If you mess up** - Just pause and continue (edit later)

### Tools Suggestions:
- **OBS Studio** (free, powerful)
- **Loom** (easy, web-based)
- **Zoom** (record yourself presenting)

### Video Format:
- **Resolution:** 1080p minimum
- **Format:** MP4
- **Length:** 3-5 minutes (max 10 for DoraHacks)
- **File size:** Under 500MB

---

## B-Roll Suggestions (Optional)

If you want to add visual interest:
- Show code snippets with syntax highlighting
- Zoom into important parts of transactions
- Add text overlays for key points
- Include simple animations/transitions

---

## Quick Alternative (If Short on Time)

**Minimum 2-minute version:**

1. **Intro** (15 sec) - What is StakeVue
2. **Show deployed contract** (45 sec) - Prove it's real
3. **Show test transaction** (30 sec) - Prove it works
4. **Frontend quick tour** (30 sec) - Show UI

**Total: 2 minutes - Still impressive!**

---

## Checklist Before Submitting

- [ ] Video is 3-5 minutes long
- [ ] Audio is clear
- [ ] Shows live deployed contract
- [ ] Shows proof of testing
- [ ] Shows frontend UI
- [ ] Explains technical approach
- [ ] Includes call to action
- [ ] File size under 500MB
- [ ] MP4 format
