# StakeVue - Liquid Staking Protocol for Casper Network

![Casper Network](https://img.shields.io/badge/Casper-Testnet-blue)
![Status](https://img.shields.io/badge/Status-V9_Development-orange)
![Version](https://img.shields.io/badge/Version-9.0.0-brightgreen)
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

## What's New in V9

### Real CEP-18 stCSPR Token

V9 introduces a **separate CEP-18 token contract** for stCSPR, enabling real liquid staking tokens:

| Feature | Description |
|---------|-------------|
| **Separate Token Contract** | stCSPR deployed as standalone CEP-18 token |
| **Cross-Contract Calls** | StakeVue calls token via `External<ContractRef>` |
| **Real Token Transfers** | stCSPR can be transferred between users |
| **Token Ownership** | StakeVue contract owns the token (can mint/burn) |

### Architecture

```
┌─────────────────────┐       ┌─────────────────────┐
│   StakeVue V9       │       │   stCSPR Token      │
│   (Main Contract)   │──────▶│   (CEP-18)          │
│                     │       │                     │
│ • stake()           │       │ • mint()            │
│ • unstake()         │       │ • burn()            │
│ • set_token()       │       │ • transfer()        │
│ • Ownable           │       │ • balance_of()      │
│ • Pauseable         │       │                     │
└─────────────────────┘       └─────────────────────┘
```

### Deployment Steps

1. Deploy stCSPR CEP-18 token
2. Deploy StakeVue V9 with owner address
3. Call `set_token()` to link the token contract
4. Transfer stCSPR token ownership to StakeVue

### V9 Entry Points

| Function | Access | Description |
|----------|--------|-------------|
| `stake()` | Public (payable) | Stake CSPR, mint stCSPR via external call |
| `unstake(amount)` | Public | Burn stCSPR via external call, receive CSPR |
| `set_token(address)` | Owner only | Link the stCSPR token contract |
| `get_token()` | Public | Query linked token address |
| `pause()` | Owner only | Stop all operations |
| `unpause()` | Owner only | Resume operations |

---

## Previous Versions

### V8.2 - Admin Controls
- Ownable module for access control
- Pauseable module for emergency stop
- Simple Mapping for stCSPR tracking

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

## Smart Contract (V9 - Odra with CEP-18)

### Contract Code

Located in `stakevue_contract/src/lib.rs`:

```rust
// External contract trait for stCSPR CEP-18 token
#[odra::external_contract]
pub trait StCsprToken {
    fn mint(&mut self, owner: Address, amount: U256);
    fn burn(&mut self, owner: Address, amount: U256);
    fn balance_of(&self, address: Address) -> U256;
}

#[odra::module(events = [Staked, Unstaked, TokenConfigured], errors = Error)]
pub struct StakeVue {
    stcspr_token: Var<Address>,      // External CEP-18 token
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

    pub fn set_token(&mut self, token_address: Address) {
        self.ownable.assert_owner(&self.env().caller());
        self.stcspr_token.set(token_address);
    }

    #[odra(payable)]
    pub fn stake(&mut self) {
        self.pausable.require_not_paused();
        let staker = self.env().caller();
        let amount = self.env().attached_value();
        // Mint stCSPR via cross-contract call
        let mut token = StCsprTokenContractRef::new(self.env(), token_address);
        token.mint(staker, token_amount);
    }

    pub fn unstake(&mut self, amount: U512) {
        self.pausable.require_not_paused();
        // Burn stCSPR via cross-contract call
        token.burn(staker, token_amount);
        // Return CSPR
        self.env().transfer_tokens(&staker, &amount);
    }
}
```

### Entry Points

| Function | Description |
|----------|-------------|
| `stake()` | Stake CSPR (payable - attach CSPR to call) |
| `unstake(amount)` | Burn stCSPR and withdraw CSPR |
| `set_token(address)` | Link stCSPR token contract (owner only) |
| `get_token()` | Query linked token address |
| `get_stake(staker)` | Query stake for an address (from token contract) |
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

### V9.0 - IN PROGRESS
- [x] Separate CEP-18 token contract for stCSPR
- [x] Cross-contract calls via External<ContractRef>
- [x] Unit tests passing (5 tests)
- [x] WASM built successfully
- [ ] Deploy to testnet
- [ ] Frontend integration

### V10.0 (Future)
- [ ] Mainnet deployment
- [ ] Security audit
- [ ] Validator delegation
- [ ] DEX integration

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
| **V9.0** | Separate CEP-18 token, cross-contract calls, real stCSPR tokens |
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
