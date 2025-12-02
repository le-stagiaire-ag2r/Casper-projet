# ⚡ Déploiement Rapide - StakeVue

## 🎯 En bref

1. **Merge ta branche** sur GitHub
2. **Vercel** → Importe le repo → Root: `client` → Deploy
3. **Railway** → New Project → Add MySQL → Deploy API (root: `server`) → Deploy Event Listener (root: `server`)
4. **Vercel** → Update `REACT_APP_API_URL` avec l'URL Railway → Redeploy

## 📝 Variables d'environnement

### Vercel (Frontend)
```
REACT_APP_API_URL=https://ton-api.railway.app
REACT_APP_CONTRACT_HASH=contract-3a209b27d48b8e288a52f1c4973bf4be290366214de728a65d4e2d3fb5f65d80
REACT_APP_CSPRCLICK_APP_ID=4f5baf79-a4d3-4efc-b778-eea95fae
REACT_APP_CSPRCLICK_APP_KEY=1a5a117c532545489f6b119f8739bff8
```

### Railway (Backend - API + Event Listener)
```
DB_URI=[copie depuis MySQL Railway]
CSPR_CLOUD_ACCESS_KEY=019a8d88-2cde-78ef-9cbd-d124f33adb0d
CONTRACT_HASH=contract-3a209b27d48b8e288a52f1c4973bf4be290366214de728a65d4e2d3fb5f65d80
CONTRACT_PACKAGE_HASH=hash-3a209b27d48b8e288a52f1c4973bf4be290366214de728a65d4e2d3fb5f65d80
HTTP_PORT=3001
NODE_ENV=production
```

## ✅ Check

- Frontend : https://ton-projet.vercel.app
- API Health : https://ton-api.railway.app/health

Voir [DEPLOYMENT.md](./DEPLOYMENT.md) pour le guide complet.
