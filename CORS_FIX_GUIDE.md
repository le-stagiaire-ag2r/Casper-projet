# 🔧 Guide de Résolution du Problème CORS

## ❌ Le Problème

Lorsque vous essayez d'appeler le RPC Casper directement depuis votre navigateur, vous obtenez cette erreur :

```
Access to XMLHttpRequest at 'https://node.testnet.casper.network/rpc'
from origin 'https://caspernews-nubbnn2kw-le-stagiaire-ag2rs-projects.vercel.app'
has been blocked by CORS policy: Response to preflight request doesn't pass
access control check: No 'Access-Control-Allow-Origin' header is present
on the requested resource.
```

**Pourquoi ?** Les nœuds RPC Casper ne permettent pas les requêtes directes depuis les navigateurs web pour des raisons de sécurité (CORS = Cross-Origin Resource Sharing).

## ✅ La Solution

Utilisez un **proxy backend** qui fait les appels RPC pour vous. J'ai créé une fonction serverless Vercel qui résout ce problème.

---

## 📁 Fichiers Créés

### 1. `/api/rpc-proxy.js`
Fonction serverless Vercel qui agit comme proxy entre votre frontend et le RPC Casper.

### 2. `/vercel.json`
Configuration Vercel pour gérer les CORS et les routes API.

### 3. `/frontend/js/casper-rpc-client.js`
Module frontend qui simplifie l'utilisation du proxy.

---

## 🚀 Comment Utiliser

### Méthode 1 : Utiliser le Module Helper (Recommandé)

```javascript
// Importez le module
import { putDeploy, getDeploy, getAccountInfo } from './casper-rpc-client.js';

// Exemple : Soumettre un deploy
async function submitDeployExample(signedDeploy) {
  try {
    const deployHash = await putDeploy(signedDeploy);
    console.log('Deploy soumis avec succès:', deployHash);
    return deployHash;
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Exemple : Obtenir les infos d'un compte
async function getAccountExample(publicKey) {
  try {
    const accountInfo = await getAccountInfo(publicKey);
    console.log('Informations du compte:', accountInfo);
    return accountInfo;
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Exemple : Suivre un deploy
async function trackDeployExample(deployHash) {
  try {
    const deployInfo = await getDeploy(deployHash);
    console.log('Statut du deploy:', deployInfo);
    return deployInfo;
  } catch (error) {
    console.error('Erreur:', error);
  }
}
```

### Méthode 2 : Appel Direct au Proxy

```javascript
// Appel direct au proxy API
async function callRpcProxy(method, params) {
  const response = await fetch('/api/rpc-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: Date.now(),
    }),
  });

  const data = await response.json();
  return data;
}

// Exemple d'utilisation
const result = await callRpcProxy('account_put_deploy', { deploy: myDeploy });
```

---

## 🔄 Migration depuis le Code Existant

### Avant (Code qui cause l'erreur CORS) ❌

```javascript
import { CasperClient } from 'casper-js-sdk';

const client = new CasperClient('https://node.testnet.casper.network/rpc');

// Ceci cause une erreur CORS dans le navigateur !
await client.putDeploy(signedDeploy);
```

### Après (Utilise le proxy) ✅

```javascript
import { putDeploy } from './frontend/js/casper-rpc-client.js';

// Ça fonctionne ! Le proxy gère le CORS
const deployHash = await putDeploy(signedDeploy);
```

---

## 🔧 Configuration pour Votre Projet

### Si vous utilisez un framework moderne (React, Vue, etc.)

1. **Copiez les fichiers** dans votre projet :
   ```
   votre-projet/
   ├── api/
   │   └── rpc-proxy.js          ← Fonction Vercel
   ├── src/
   │   └── utils/
   │       └── casper-rpc-client.js  ← Helper frontend
   └── vercel.json               ← Configuration Vercel
   ```

2. **Importez le module** dans votre code :
   ```javascript
   // Dans un composant React
   import { putDeploy } from '@/utils/casper-rpc-client';

   const handleDeposit = async (amount) => {
     try {
       const deploy = await createDeploy(amount);
       const signedDeploy = await signDeploy(deploy);
       const deployHash = await putDeploy(signedDeploy);

       console.log('✅ Dépôt réussi:', deployHash);
     } catch (error) {
       console.error('❌ Erreur:', error);
     }
   };
   ```

3. **Déployez sur Vercel** :
   ```bash
   git add .
   git commit -m "Fix: Add RPC proxy to resolve CORS issues"
   git push
   ```

---

## 🧪 Tester Localement

### 1. Installez Vercel CLI (si pas déjà fait)
```bash
npm install -g vercel
```

### 2. Lancez le serveur de développement Vercel
```bash
vercel dev
```

Cela démarre un serveur local qui simule l'environnement Vercel, y compris les fonctions serverless.

### 3. Testez l'API
```bash
# Test avec curl
curl -X POST http://localhost:3000/api/rpc-proxy \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "chain_get_block",
    "params": {},
    "id": 1
  }'
```

---

## 📊 Comparaison Avant/Après

| Aspect | Avant (Direct RPC) | Après (Avec Proxy) |
|--------|-------------------|-------------------|
| **Erreur CORS** | ❌ Oui | ✅ Non |
| **Fonctionne dans le navigateur** | ❌ Non | ✅ Oui |
| **Requiert un backend** | ❌ Non | ✅ Oui (Vercel serverless) |
| **Sécurité** | ⚠️ Expose la clé RPC | ✅ Masque les détails |
| **Performance** | ⚡ Directe | ⚡ Rapide (serverless) |

---

## 🔒 Sécurité en Production

Pour la production, **limitez l'origine CORS** à votre domaine :

```javascript
// Dans api/rpc-proxy.js
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://votre-domaine.vercel.app', // Au lieu de '*'
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
```

---

## 🆘 Dépannage

### Problème : "404 Not Found" pour `/api/rpc-proxy`

**Solution** : Assurez-vous que :
1. Le dossier `api/` est à la racine du projet
2. `vercel.json` est présent
3. Vous avez redéployé sur Vercel

### Problème : "Network Error" en local

**Solution** : Utilisez `vercel dev` au lieu de votre serveur de développement habituel.

### Problème : "Function timeout"

**Solution** : Augmentez le timeout dans `vercel.json` :
```json
{
  "functions": {
    "api/**/*": {
      "maxDuration": 60
    }
  }
}
```

---

## 📚 Ressources

- [Documentation Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Casper RPC Documentation](https://docs.casper.network/developers/json-rpc/)

---

## ✅ Checklist de Déploiement

- [ ] Copiez `api/rpc-proxy.js` dans votre projet
- [ ] Copiez `vercel.json` à la racine
- [ ] Copiez `frontend/js/casper-rpc-client.js` dans votre projet
- [ ] Mettez à jour vos imports pour utiliser le proxy
- [ ] Testez localement avec `vercel dev`
- [ ] Commitez et pushez sur GitHub
- [ ] Vérifiez que Vercel a redéployé automatiquement
- [ ] Testez sur votre URL de production

---

**🎉 Problème CORS résolu !** Votre application peut maintenant communiquer avec le RPC Casper sans erreurs.
