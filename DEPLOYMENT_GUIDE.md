# 📘 Guide de Déploiement StakeVue

## 🎯 État Actuel du Projet

### ✅ Complété
- [x] Smart contract compilé (`stakevue_contract.wasm` - 121KB)
- [x] Clés Casper générées
- [x] Frontend fonctionnel
- [x] Documentation complète
- [x] Script de déploiement prêt

### ⏳ En cours
- [ ] Obtenir tokens testnet (ACTION MANUELLE REQUISE)
- [ ] Déployer sur Casper Testnet
- [ ] Intégrer frontend avec le contrat déployé

---

## 🔑 Vos Identifiants

**Clé publique :**
```
010456c5cfb4b5157854f325f0980e2c504cbce2dfcb5fafce31b7b0a84538652c
```

**Adresse du compte :**
```
account-hash-bcaf8b12a5981c06cec6d26cd908ea42fefb5afdc03df0b2873c878d803ae427
```

---

## 📝 Instructions de Déploiement

### Étape 1 : Obtenir les Tokens Testnet (MANUEL)

1. **Installer Casper Signer**
   - Aller sur : https://cspr.live/
   - Installer l'extension navigateur
   - Créer/Importer un compte

2. **Obtenir 1000 CSPR testnet**
   - Aller sur : https://testnet.cspr.live/tools/faucet
   - Connecter votre wallet Casper Signer
   - Cliquer "Request tokens"
   - Attendre confirmation (~1-2 min)

### Étape 2 : Déployer le Smart Contract (AUTOMATIQUE)

Une fois que vous avez les tokens, lancez :

```bash
./deploy.sh
```

Le script va automatiquement :
- ✅ Vérifier tous les fichiers nécessaires
- ✅ Afficher les informations de déploiement
- ✅ Déployer le contrat sur Casper Testnet
- ✅ Afficher le hash de déploiement

### Étape 3 : Vérifier le Déploiement

1. Aller sur : https://testnet.cspr.live
2. Rechercher votre adresse de compte
3. Vérifier le statut du déploiement (2-3 min)
4. Noter le **contract hash** une fois confirmé

---

## 🔧 Configuration Technique

### Réseau
- **Chain:** casper-test
- **Node RPC:** http://95.216.67.162:7777
- **Explorer:** https://testnet.cspr.live

### Coûts
- **Déploiement:** ~200 CSPR
- **Appel stake():** ~2-5 CSPR
- **Queries (lectures):** GRATUIT

### Fichiers Importants
```
Casper-projet/
├── smart-contract/
│   └── target/wasm32-unknown-unknown/release/
│       └── stakevue_contract.wasm  ← Contract compilé
├── keys/
│   ├── secret_key.pem              ← GARDEZ SECRET!
│   ├── public_key.pem
│   └── public_key_hex
├── frontend/                        ← Application web
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
└── deploy.sh                        ← Script de déploiement
```

---

## 🎯 Après le Déploiement

### Intégration Frontend

Une fois déployé, mettez à jour `frontend/js/app.js` :

```javascript
// Remplacer par votre contract hash
const CONTRACT_HASH = 'hash-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const NODE_ADDRESS = 'http://95.216.67.162:7777';
```

### Tester l'Application

```bash
cd frontend
python3 -m http.server 8000
```

Ouvrir : http://localhost:8000

---

## 🐛 Dépannage

### Erreur : "Insufficient balance"
→ Retourner sur le faucet pour obtenir plus de tokens

### Erreur : "Deploy failed"
→ Vérifier que le node est accessible : `curl http://95.216.67.162:7777/status`

### Erreur : "Keys not found"
→ Vérifier que les fichiers dans `keys/` existent

---

## 📊 Soumission Hackathon

### Checklist Finale
- [ ] Smart contract déployé sur testnet
- [ ] Frontend accessible publiquement
- [ ] Vidéo démo (2-3 min)
- [ ] Documentation complète
- [ ] Repository GitHub public

### Liens Importants
- **DoraHacks:** https://dorahacks.io/hackathon/casper-2026
- **Deadline:** 4 janvier 2026
- **Prize Pool:** $2,500 (Liquid Staking Track)

---

## 🚀 Prochaines Étapes

1. ✅ Obtenir tokens testnet
2. ⏳ Déployer le contrat (`./deploy.sh`)
3. ⏳ Mettre à jour le frontend avec le contract hash
4. ⏳ Créer une vidéo démo
5. ⏳ Soumettre sur DoraHacks

---

**Bon courage ! 🎉**
