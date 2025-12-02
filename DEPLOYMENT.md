# 🚀 Guide de Déploiement StakeVue

Ce guide t'explique comment déployer StakeVue sur **Vercel** (frontend) et **Railway** (backend) sans ligne de commande.

---

## 📋 Vue d'ensemble

```
Frontend (React)  →  Vercel        ✅ Gratuit
Backend (API)     →  Railway       ✅ Gratuit (500h/mois)
Database (MySQL)  →  Railway       ✅ Gratuit (inclus)
Event Listener    →  Railway       ✅ Gratuit (service séparé)
```

---

## 🎯 Étape 1 : Préparer le Repository GitHub

### 1.1 Créer une Pull Request

Depuis ton repo GitHub :

1. Va sur https://github.com/le-stagiaire-ag2r/Casper-projet
2. Tu devrais voir un bouton **"Compare & pull request"** pour ta branche `claude/analyze-casper-staking-01LUafYLqENGuQeuAJrSEam3`
3. Clique dessus
4. Titre : **"Add StakeVue full-stack dApp"**
5. Clique sur **"Create pull request"**
6. Puis **"Merge pull request"** → **"Confirm merge"**

Maintenant tout est sur la branche `main` ! ✅

---

## 🌐 Étape 2 : Déployer le Frontend sur Vercel

### 2.1 Créer un compte Vercel

1. Va sur https://vercel.com
2. Clique sur **"Sign Up"**
3. Connecte-toi avec **GitHub**
4. Autorise Vercel à accéder à tes repos

### 2.2 Importer le projet

1. Sur le dashboard Vercel, clique sur **"Add New..."** → **"Project"**
2. Trouve **"Casper-projet"** dans la liste
3. Clique sur **"Import"**

### 2.3 Configurer le projet

**Framework Preset:** Détecté automatiquement (Create React App)

**Root Directory:** Clique sur **"Edit"** et sélectionne `client`

**Build Command:**
```
npm run build
```

**Output Directory:**
```
build
```

**Install Command:**
```
npm install
```

### 2.4 Ajouter les variables d'environnement

Clique sur **"Environment Variables"** et ajoute :

| Name | Value |
|------|-------|
| `REACT_APP_API_URL` | `https://ton-api.railway.app` (on le mettra après) |
| `REACT_APP_CASPER_NETWORK` | `casper-test` |
| `REACT_APP_CASPER_CHAIN_NAME` | `casper-test` |
| `REACT_APP_CONTRACT_HASH` | `contract-3a209b27d48b8e288a52f1c4973bf4be290366214de728a65d4e2d3fb5f65d80` |
| `REACT_APP_CONTRACT_PACKAGE_HASH` | `hash-3a209b27d48b8e288a52f1c4973bf4be290366214de728a65d4e2d3fb5f65d80` |
| `REACT_APP_CSPR_CLOUD_URL` | `https://api.testnet.cspr.cloud` |
| `REACT_APP_CSPRCLICK_APP_ID` | `4f5baf79-a4d3-4efc-b778-eea95fae` |
| `REACT_APP_CSPRCLICK_APP_KEY` | `1a5a117c532545489f6b119f8739bff8` |

### 2.5 Déployer

1. Clique sur **"Deploy"**
2. Attends 2-3 minutes ⏳
3. Ton frontend est live ! 🎉

**URL:** `https://casper-projet-xxx.vercel.app`

⚠️ **Important :** Note cette URL, on en aura besoin !

---

## 🚂 Étape 3 : Déployer le Backend sur Railway

### 3.1 Créer un compte Railway

1. Va sur https://railway.app
2. Clique sur **"Login"**
3. Connecte-toi avec **GitHub**
4. Autorise Railway

### 3.2 Créer un nouveau projet

1. Dashboard → **"New Project"**
2. Sélectionne **"Deploy from GitHub repo"**
3. Choisis **"Casper-projet"**
4. Railway va détecter le monorepo

### 3.3 Ajouter MySQL Database

1. Dans ton projet Railway, clique sur **"+ New"**
2. Sélectionne **"Database"** → **"Add MySQL"**
3. MySQL va se déployer automatiquement
4. Clique sur le service MySQL
5. Va dans l'onglet **"Variables"**
6. Note la variable **`DATABASE_URL`** (quelque chose comme `mysql://root:xxx@xxx.railway.app:3306/railway`)

### 3.4 Configurer le service API

1. Clique sur **"+ New"** → **"GitHub Repo"**
2. Sélectionne ton repo **"Casper-projet"**
3. **Root Directory:** `server`
4. **Build Command:** `npm install && npm run build`
5. **Start Command:** `node dist/api.js`

#### Variables d'environnement pour l'API :

Onglet **"Variables"**, ajoute :

| Name | Value |
|------|-------|
| `HTTP_PORT` | `3001` |
| `DB_URI` | `[copie la DATABASE_URL de MySQL]` |
| `CSPR_CLOUD_URL` | `https://api.testnet.cspr.cloud` |
| `CSPR_CLOUD_STREAMING_URL` | `wss://streaming.testnet.cspr.cloud` |
| `CSPR_CLOUD_ACCESS_KEY` | `019a8d88-2cde-78ef-9cbd-d124f33adb0d` |
| `CONTRACT_HASH` | `contract-3a209b27d48b8e288a52f1c4973bf4be290366214de728a65d4e2d3fb5f65d80` |
| `CONTRACT_PACKAGE_HASH` | `hash-3a209b27d48b8e288a52f1c4973bf4be290366214de728a65d4e2d3fb5f65d80` |
| `TZ` | `UTC` |
| `NODE_ENV` | `production` |

6. Clique sur **"Deploy"**

#### Exposer l'API publiquement :

1. Onglet **"Settings"**
2. Section **"Networking"**
3. Clique sur **"Generate Domain"**
4. Note l'URL : `https://stakevue-api.up.railway.app` (exemple)

### 3.5 Configurer le service Event Listener

1. Clique sur **"+ New"** → **"GitHub Repo"**
2. Sélectionne **"Casper-projet"** à nouveau
3. **Root Directory:** `server`
4. **Build Command:** `npm install && npm run build`
5. **Start Command:** `node dist/event-handler.js`

#### Variables d'environnement pour l'Event Listener :

Même config que l'API (copie-colle les mêmes variables).

6. Clique sur **"Deploy"**

⚠️ **Pas besoin d'exposer publiquement** l'event listener, il tourne en interne.

---

## 🔗 Étape 4 : Connecter Frontend et Backend

### 4.1 Mettre à jour Vercel avec l'URL Railway

1. Retourne sur **Vercel**
2. Projet → **"Settings"** → **"Environment Variables"**
3. Trouve `REACT_APP_API_URL`
4. Change la valeur pour : `https://stakevue-api.up.railway.app` (ton URL Railway)
5. Clique sur **"Save"**

### 4.2 Redéployer le frontend

1. Onglet **"Deployments"**
2. Clique sur les **3 points** du dernier déploiement
3. **"Redeploy"**
4. Attends 2 minutes

---

## ✅ Étape 5 : Vérifier que tout fonctionne

### 5.1 Tester l'API

Ouvre dans ton navigateur :
```
https://stakevue-api.up.railway.app/health
```

Tu dois voir :
```json
{
  "status": "healthy",
  "timestamp": "2025-12-02T..."
}
```

### 5.2 Tester le Frontend

Ouvre ton URL Vercel :
```
https://casper-projet-xxx.vercel.app
```

Tu dois voir :
- ✅ Dashboard avec TVL, APY, etc.
- ✅ Bouton "Connect Wallet"
- ✅ Formulaire de staking

### 5.3 Tester la connexion wallet

1. Clique sur **"Connect Wallet"**
2. CSPR.click devrait s'ouvrir
3. Connecte ton wallet Casper
4. Tu devrais voir ton adresse en haut à droite

### 5.4 Vérifier les logs Railway

1. Railway → Service **API** → Onglet **"Deployments"**
2. Clique sur le dernier déploiement
3. Onglet **"Logs"**
4. Tu dois voir : `✅ API Server running on http://localhost:3001`

Même chose pour l'**Event Listener** :
- Tu dois voir : `✅ Connected to blockchain event stream`

---

## 🐛 Troubleshooting

### ❌ Frontend : "Cannot connect to API"

**Solution :**
1. Vérifie que l'URL Railway est correcte dans Vercel
2. Vérifie que l'API Railway est en ligne (onglet "Deployments")
3. Redéploie le frontend Vercel

### ❌ Backend : "Database connection failed"

**Solution :**
1. Vérifie que MySQL Railway est en ligne
2. Vérifie que `DB_URI` est correcte
3. Redéploie le service API

### ❌ Event Listener : "WebSocket connection failed"

**Solution :**
1. Vérifie `CSPR_CLOUD_ACCESS_KEY` est correcte
2. Vérifie `CONTRACT_PACKAGE_HASH` est correcte
3. Regarde les logs Railway pour plus de détails

### ❌ Wallet : "Failed to connect"

**Solution :**
1. Vérifie `REACT_APP_CSPRCLICK_APP_ID` et `KEY` dans Vercel
2. Assure-toi d'avoir un wallet Casper installé (extension)
3. Essaye de rafraîchir la page

---

## 📊 Monitoring

### Vercel

- **Dashboard :** https://vercel.com/dashboard
- **Analytics :** Vercel fournit des analytics automatiques
- **Logs :** Vercel → Projet → Deployments → View Logs

### Railway

- **Dashboard :** https://railway.app/dashboard
- **Metrics :** Railway → Service → Metrics (CPU, RAM, Network)
- **Logs :** Railway → Service → Deployments → View Logs

---

## 💰 Coûts

### Vercel (Hobby Plan - Gratuit)
- ✅ Bande passante : 100 GB/mois
- ✅ Builds : Illimités
- ✅ Déploiements : Illimités

### Railway (Trial Plan - Gratuit)
- ✅ $5 de crédit gratuit/mois
- ✅ 500 heures d'exécution
- ✅ Suffisant pour un projet de test

Si tu dépasses, upgrade vers **Hobby ($5/mois)** ou **Pro ($20/mois)**.

---

## 🚀 URLs Finales

Une fois déployé, tu auras :

```
Frontend:  https://casper-projet-xxx.vercel.app
API:       https://stakevue-api.up.railway.app
Event:     (interne, pas d'URL publique)
Database:  (interne, pas d'URL publique)
```

---

## 🎉 C'est déployé !

Ton app est maintenant **live** sur Internet ! 🌐

Tu peux la partager avec :
- https://casper-projet-xxx.vercel.app (remplace par ton URL)

**Prochaines étapes :**
1. Tester le staking avec un vrai wallet
2. Monitorer les logs pour les premiers utilisateurs
3. Partager ton projet au Casper Hackathon 2026 ! 🏆

---

## 📚 Ressources

- **Vercel Docs :** https://vercel.com/docs
- **Railway Docs :** https://docs.railway.app
- **CSPR.click Docs :** https://docs.cspr.click
- **Casper Docs :** https://docs.casper.network

---

**Besoin d'aide ?** Ouvre un issue sur GitHub ou contacte le support Vercel/Railway. 💬
