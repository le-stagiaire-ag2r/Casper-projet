# 🌌 StakeVue

### Liquid Staking Protocol for Casper Network

<p align="center">
  <img src="https://img.shields.io/badge/Casper-2.0_Testnet-00D4FF?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0id2hpdGUiLz48L3N2Zz4="/>
  <img src="https://img.shields.io/badge/Version-16-8B5CF6?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Odra-2.4.0-FF6B35?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge"/>
</p>

<p align="center">
  <b>🎯 Hackathon Casper 2025</b> • <b>💰 Track DeFi</b> • <b>🏆 DoraHacks</b>
</p>

---

## 🤔 C'est quoi StakeVue ?

Tu as des **CSPR**. Tu veux gagner des rewards (~15% APY). Mais le staking classique **bloque tes tokens** pendant des jours...

**StakeVue règle ça :**

```
❌ Staking Traditionnel:
   100 CSPR ──▶ Validator ──▶ 🔒 BLOQUÉ (14+ jours)
                              Tu peux rien faire !

✅ StakeVue:
   100 CSPR ──▶ StakeVue ──▶ 💎 100 stCSPR (utilisable direct!)
                             📈 Tes stCSPR gagnent des rewards
                             🔓 Retire quand tu veux
```

C'est le **liquid staking**. Tes tokens bossent pour toi ET restent liquides. 🚀

---

## ⚙️ Comment ça marche ?

### 1️⃣ Tu stakes

```
Tu envoies:  100 CSPR
Tu reçois:   ~87 stCSPR (au taux actuel 1.15)

📐 Formule: stCSPR = CSPR ÷ exchange_rate
```

### 2️⃣ Tes stCSPR prennent de la valeur

```
📅 Jour 1:   Taux = 1.0   ──▶ 100 stCSPR = 100 CSPR
📅 Jour 30:  Taux = 1.15  ──▶ 100 stCSPR = 115 CSPR  (+15%! 🎉)
📅 Jour 60:  Taux = 1.30  ──▶ 100 stCSPR = 130 CSPR  (+30%! 🚀)

Le taux monte quand les rewards arrivent dans le pool.
Ton nombre de stCSPR bouge pas, mais sa VALEUR augmente!
```

### 3️⃣ Tu unstakes (quand tu veux!)

```
Tu brûles:  100 stCSPR  🔥
Tu reçois:  115 CSPR    💰

📐 Formule: CSPR = stCSPR × exchange_rate
```

**Pas de période de blocage. Pas d'attente. Ton argent, ton choix.** ✨

---

## 💡 L'Exchange Rate (la magie)

C'est l'innovation principale. Exemple concret:

```
🏊 Le Pool au départ:
   Total CSPR:   100
   Total stCSPR: 100
   Taux: 100/100 = 1.0

💰 Des rewards arrivent (+20 CSPR):
   Total CSPR:   120       ⬆️ (+20)
   Total stCSPR: 100       ➡️ (inchangé!)
   Taux: 120/100 = 1.2     📈

🎯 Résultat:
   Tes 100 stCSPR valent maintenant 120 CSPR!
   Tu as gagné +20% sans rien faire! 🎉
```

**La magie:** le pool grossit, le supply reste constant, le taux monte. 📈

---

## 🎮 Essaye-le !

### 🌐 Demo Live

**👉 https://casper-projet.vercel.app**

1. 🔗 Connecte ton wallet Casper (testnet)
2. 🚰 Récupère des CSPR test sur [faucet.casper.network](https://faucet.casper.network)
3. 💰 Stake des CSPR
4. 👀 Regarde ton solde stCSPR

### ✨ Ce que tu verras

| Feature | Description |
|---------|-------------|
| 🌌 Galaxy Background | Animation 3D avec 15,000 particules |
| 🪟 Glass UI | Cartes transparentes avec blur |
| 💜 Thème Purple | Accent violet cosmique |
| 📊 Stats Live | Exchange rate en temps réel |
| 📜 Historique | Toutes tes transactions |

---

## 📜 Le Smart Contract

Déployé sur **Casper 2.0 Testnet**:

```
📦 Package: 2b6c14a2cac5cfe4a1fd1efc2fc02b1090dbc3a6b661a329b90c829245540985
```

🔍 [Voir sur l'Explorer](https://testnet.cspr.live/contract-package/2b6c14a2cac5cfe4a1fd1efc2fc02b1090dbc3a6b661a329b90c829245540985)

### 🎯 Entry Points

| Fonction | Description |
|----------|-------------|
| `stake()` | 💰 Envoie CSPR, reçois stCSPR |
| `unstake(amount)` | 🔥 Brûle stCSPR, récupère CSPR |
| `add_rewards()` | ➕ Ajoute des rewards (owner only) |
| `get_exchange_rate()` | 📊 Taux actuel (9 décimales) |

### 🏗️ Architecture

```rust
pub struct StakeVue {
    token: SubModule<Cep18>,      // 💎 stCSPR (standard CEP-18)
    total_cspr_pool: Var<U512>,   // 🏊 Tout le CSPR du contrat
}

// 📐 Taux = total_cspr_pool / token.total_supply()
```

Construit avec [Odra Framework](https://odra.dev) 🛠️

---

## 📁 Structure du Projet

```
Casper-projet/
│
├── 🎨 client/                  # Frontend React
│   ├── src/
│   │   ├── components/         # Composants UI
│   │   ├── pages/              # Home, Stake, Guide
│   │   └── hooks/              # useStaking, useCsprClick
│   └── api/
│       └── contract-stats.js   # API Vercel (lit la blockchain)
│
├── 🦀 stakevue_contract/       # Smart contract Odra
│   ├── src/lib.rs              # Code du contrat
│   └── bin/                    # Scripts deploy & test
│
├── 🔧 scripts/                 # Utilitaires Node.js
├── 📦 archive/                 # Anciennes versions (V1-V14)
│
├── 📖 README.md                # Tu es ici!
└── 📋 RELEASE_NOTES_V16.md     # Changelog détaillé V8→V16
```

---

## 🚀 Lancer en Local

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

## 📜 Historique des Versions

| Version | Quoi de neuf |
|---------|--------------|
| **🎨 V16** | Visual overhaul - Galaxy, glass UI, SVG icons |
| **🌐 V15.1** | API Live - Stats du contrat en temps réel |
| **📈 V15** | Exchange rate - stCSPR qui s'apprécie |
| **💎 V14** | Token CEP-18 intégré (enfin ça marche!) |
| **🧪 V13** | Test payable minimal |
| **❌ V12** | Tentative CEP-18 (conflit de package) |
| **🔍 V11** | Debug token externe |
| **🔄 V10** | Tentatives d'intégration |
| **🔗 V9** | Référence token externe (cassé) |
| **🔐 V8.2** | Modules Ownable + Pauseable |
| **⭐ V8.0** | Premier vrai staking avec Odra |
| **📊 V7.x** | APY slider, charts, CSV export |
| **🔔 V6.x** | Price alerts, portfolio history |
| **🛡️ V5.0** | Sécurité renforcée (score A+) |
| **👥 V4.0** | Multi-validator support |
| **🪙 V3.0** | Concept token stCSPR |
| **👤 V2.0** | Tracking par utilisateur |
| **🎯 V1.0** | Stake/unstake basique |

📋 **Détails complets:** [RELEASE_NOTES_V16.md](./RELEASE_NOTES_V16.md)

---

## 🛠️ Tech Stack

| Couche | Technologie |
|--------|-------------|
| 🦀 Smart Contract | Rust, Odra 2.4.0, CEP-18 |
| ⚛️ Frontend | React 18, TypeScript, styled-components |
| 🎮 3D Graphics | Three.js, React Three Fiber |
| 👛 Wallet | CSPR.click |
| 🌐 API | Vercel Serverless, Casper RPC |
| 🚀 Deployment | Vercel + Casper Testnet |

---

## 🔗 Liens

| | |
|---|---|
| 🌐 **Demo Live** | https://casper-projet.vercel.app |
| 📜 **Contrat** | [Voir sur Testnet](https://testnet.cspr.live/contract-package/2b6c14a2cac5cfe4a1fd1efc2fc02b1090dbc3a6b661a329b90c829245540985) |
| 🛠️ **Odra Framework** | https://odra.dev |
| 🌍 **Casper Network** | https://casper.network |
| 🚰 **Faucet Testnet** | https://faucet.casper.network |

---

<p align="center">
  <b>🏆 Casper Hackathon 2025</b> • <b>DoraHacks</b> • <b>DeFi Track</b>
</p>

<p align="center">
  <i>Stake smart. Stay liquid.</i> 💎
</p>
