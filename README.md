# StakeVue - Liquid Staking Protocol for Casper Network

![Casper Network](https://img.shields.io/badge/Casper-Testnet-blue)
![Status](https://img.shields.io/badge/Status-V8.2_Beta-orange)
![Version](https://img.shields.io/badge/Version-8.2.0-brightgreen)
![Open Source](https://img.shields.io/badge/Open_Source-Yes-success)
![License](https://img.shields.io/badge/License-MIT-green)

**Hackathon:** Casper Hackathon 2025 on DoraHacks
**Track:** DeFi - Liquid Staking

---

## Live Demo

**Web App:** [https://casper-projet.vercel.app](https://casper-projet.vercel.app)

**V8.2 Contract on Explorer:** [View on Testnet](https://testnet.cspr.live/contract-package/822196e8212ae0e6f1b9d5e158091b6b9e97501b120e16693d4bb9da1bc602de)

---

## What is StakeVue?

StakeVue is a **liquid staking protocol** for Casper Network. Stake your CSPR and receive **stCSPR** tokens that you can use while earning staking rewards.

```
Stake CSPR -> Get stCSPR -> Earn ~17% APY -> Stay Liquid
```

---

## What's New in V8.2

### Admin Controls & Security Modules

| Feature | Description |
|---------|-------------|
| **Ownable Module** | Admin access control via Odra modules |
| **Pauseable Module** | Emergency stop mechanism |
| **Transfer Ownership** | Admin can transfer control to new owner |
| **Pause/Unpause** | Owner can pause staking in emergencies |

### New Entry Points

| Function | Access | Description |
|----------|--------|-------------|
| `pause()` | Owner only | Stop all stake/unstake operations |
| `unpause()` | Owner only | Resume operations |
| `transfer_ownership(new_owner)` | Owner only | Transfer admin rights |
| `get_owner()` | Public | Query current owner |
| `is_paused()` | Public | Check if contract is paused |

### V8.2 Contract Details

```
Package Hash: hash-822196e8212ae0e6f1b9d5e158091b6b9e97501b120e16693d4bb9da1bc602de
Network: casper-test
Framework: Odra 2.4.0
Modules: Ownable, Pauseable
Status: Deployed & Tested
```

---

## Previous Versions

### V8.1 - Frontend Integration
- Frontend connected to real Odra contract
- proxy_caller.wasm for browser calls
- Optimistic balance updates
- Separated CSPR/stCSPR display

### V8.0 - Real CSPR Staking
- Real CSPR transfers via Odra framework
- Payable functions with `#[odra(payable)]`
- CLI tool for contract interaction

---

## Smart Contract (V8.2 - Odra)

### Contract Code

Located in `stakevue_contract/src/lib.rs`:

```rust
#[odra::module(events = [Staked, Unstaked], errors = Error)]
pub struct StakeVue {
    stakes: Mapping<Address, U512>,
    ownable: SubModule<Ownable>,
    pausable: SubModule<Pauseable>,
    total_staked: Var<U512>,
}

#[odra::module]
impl StakeVue {
    pub fn init(&mut self, owner: Address) {
        self.ownable.init(owner);
        self.total_staked.set(U512::zero());
    }

    #[odra(payable)]
    pub fn stake(&mut self) {
        self.pausable.require_not_paused();
        let staker = self.env().caller();
        let amount = self.env().attached_value();
        // ... transfers real CSPR
    }

    pub fn unstake(&mut self, amount: U512) {
        self.pausable.require_not_paused();
        // ... returns real CSPR to user
        self.env().transfer_tokens(&staker, &amount);
    }

    pub fn pause(&mut self) {
        self.ownable.assert_owner(&self.env().caller());
        self.pausable.pause();
    }

    pub fn unpause(&mut self) {
        self.ownable.assert_owner(&self.env().caller());
        self.pausable.unpause();
    }
}
```

### Entry Points

| Function | Description |
|----------|-------------|
| `stake()` | Stake CSPR (payable - attach CSPR to call) |
| `unstake(amount)` | Withdraw CSPR from stake |
| `get_stake(staker)` | Query stake for an address |
| `get_total_staked()` | Query total CSPR staked in contract |
| `pause()` | Pause contract (owner only) |
| `unpause()` | Unpause contract (owner only) |
| `get_owner()` | Query contract owner |
| `is_paused()` | Check if paused |
| `transfer_ownership(new_owner)` | Transfer ownership (owner only) |

### Building the Contract

```bash
cd stakevue_contract
cargo odra build
```

### Deploying

```bash
casper-client put-transaction session \
  --node-address http://NODE:7777 \
  --secret-key ~/secret_key.pem \
  --wasm-path wasm/StakeVue.wasm \
  --chain-name casper-test \
  --gas-price-tolerance 1 \
  --standard-payment true \
  --payment-amount 500000000000 \
  --install-upgrade \
  --session-arg "odra_cfg_package_hash_key_name:string:'stakevue_v8'" \
  --session-arg "odra_cfg_allow_key_override:bool:'true'" \
  --session-arg "odra_cfg_is_upgradable:bool:'true'" \
  --session-arg "odra_cfg_is_upgrade:bool:'false'" \
  --session-arg "odra_cfg_constructor:string:'init'" \
  --session-arg "owner:key:'account-hash-YOUR_ACCOUNT_HASH'"
```

---

## Project Structure

```
Casper-projet/
├── client/                      # React frontend (V8.2)
│   ├── public/
│   │   ├── config.js            # Runtime configuration
│   │   └── proxy_caller.wasm    # WASM for payable calls
│   └── src/
│       ├── components/          # 23 UI components
│       ├── context/             # BalanceContext (optimistic updates)
│       ├── hooks/               # Custom hooks
│       ├── services/            # Transaction builder
│       └── pages/               # Page components
├── stakevue_contract/           # Odra smart contract (V8.2)
│   ├── src/lib.rs               # Contract code with Ownable + Pauseable
│   ├── Cargo.toml               # Odra 2.4.0 + odra-modules
│   └── Odra.toml                # Odra config
├── api/                         # Vercel serverless functions
│   ├── price.ts                 # CoinGecko API proxy
│   └── validators.ts            # Validator data proxy
├── docs/                        # Documentation
├── archive/                     # Old versions (V1-V7)
└── README.md
```

---

## Transaction Fees

| Item | Value | Notes |
|------|-------|-------|
| **Gas Budget** | 5 CSPR | Configured in `config.js` |
| **Actual Gas Used** | ~1 CSPR | Depends on operation |
| **Gas Price** | 1 | Standard Casper price |

---

## Roadmap

### V8.2 - COMPLETE
- [x] Add Ownable module (admin control)
- [x] Add Pauseable module (emergency stop)
- [x] Deploy new contract to testnet
- [x] Unit tests (8 tests passing)

### V9.0 - IN PROGRESS (Experimental)
- [x] Real stCSPR token deployed (CEP-18 standard)
- [x] Cross-contract call architecture implemented
- [x] Token contract: `hash-938972a16eba403529c2c76aa1727a026fc1aa328f553185daba45703213f6bc`
- [x] StakeVue V9 contract: `hash-c977c574e95ec91df64d2354f170542a019bb716dcd6268f301b27412d107e8b`
- [ ] CLI `set_token` configuration (blocked by Casper 2.0 "no such addressable entity" issue)
- [ ] Full integration testing

**Note:** V9 contracts are deployed but configuration via CLI is blocked by Casper 2.0 migration issues. Frontend uses stable V8.2 until resolved.

### V10.0 (Future)
- [ ] Complete V9 integration
- [ ] Mainnet deployment
- [ ] Security audit
- [ ] Validator delegation

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Smart Contract** | Rust, Odra 2.4.0, odra-modules, WASM |
| **Frontend** | React 18, TypeScript, styled-components |
| **State Management** | React Context API |
| **Wallet** | CSPR.click integration |
| **Data** | CSPR.cloud API, CoinGecko API |
| **Deployment** | Vercel (frontend), Casper Testnet (contract) |

---

## Local Development

### Frontend

```bash
cd client
npm install
npm start
```

### Smart Contract

```bash
cd stakevue_contract
rustup install nightly-2025-01-01
rustup target add wasm32-unknown-unknown --toolchain nightly-2025-01-01
cargo odra build
cargo test  # Run 8 unit tests
```

---

## Links

- **Live Demo:** https://casper-projet.vercel.app
- **V8.2 Contract:** https://testnet.cspr.live/contract-package/822196e8212ae0e6f1b9d5e158091b6b9e97501b120e16693d4bb9da1bc602de
- **Odra Framework:** https://odra.dev
- **Casper Network:** https://casper.network
- **CSPR.click Docs:** https://docs.cspr.click

---

## Version History

| Version | Highlights |
|---------|------------|
| **V8.2** | Ownable + Pauseable modules, admin controls |
| **V8.1** | Frontend integration, balance fix, API cache handling |
| **V8.0** | Real CSPR staking with Odra 2.4.0 framework |
| **V7.x** | APY slider, price charts, CSV export |
| **V6.x** | Price alerts, portfolio history |
| **V5.0** | Security hardening |

---

## Archive

Previous versions and legacy code are preserved in the `/archive` folder:
- `frontend-v1/` - Original HTML/CSS/JS frontend
- `server/` - Node.js backend (never deployed)
- `RELEASE_NOTES_V8.md` - V8.0/V8.1 release notes

---

## License

MIT License

---

**Built for Casper Hackathon 2025**

**StakeVue - Liquid Staking Made Simple**
