#!/bin/bash

# Script de déploiement StakeVue sur Casper Testnet
# Généré automatiquement

echo "🚀 Déploiement de StakeVue sur Casper Testnet"
echo "=============================================="
echo ""

# Configuration
CHAIN_NAME="casper-test"
NODE_ADDRESS="http://95.216.67.162:7777"
CONTRACT_WASM="smart-contract/target/wasm32-unknown-unknown/release/stakevue_contract.wasm"
SECRET_KEY="keys/secret_key.pem"
PUBLIC_KEY="keys/public_key_hex"
PAYMENT_AMOUNT="200000000000"  # 200 CSPR (en motes)

# Vérification des fichiers
echo "📁 Vérification des fichiers..."
if [ ! -f "$CONTRACT_WASM" ]; then
    echo "❌ Erreur: Contract WASM non trouvé: $CONTRACT_WASM"
    exit 1
fi

if [ ! -f "$SECRET_KEY" ]; then
    echo "❌ Erreur: Clé secrète non trouvée: $SECRET_KEY"
    exit 1
fi

echo "✅ Tous les fichiers sont présents"
echo ""

# Affichage des informations
echo "📋 Informations de déploiement:"
echo "   Chain: $CHAIN_NAME"
echo "   Node: $NODE_ADDRESS"
echo "   Contract: $(basename $CONTRACT_WASM)"
echo "   Payment: $(($PAYMENT_AMOUNT / 1000000000)) CSPR"
echo ""

# Vérification du solde (optionnel)
echo "💰 Vérification du solde du compte..."
ACCOUNT=$(casper-client account-address --public-key $PUBLIC_KEY)
echo "   Adresse: $ACCOUNT"
echo ""

# Déploiement
echo "🚀 Déploiement en cours..."
echo ""

casper-client put-deploy \
    --node-address $NODE_ADDRESS \
    --chain-name $CHAIN_NAME \
    --secret-key $SECRET_KEY \
    --payment-amount $PAYMENT_AMOUNT \
    --session-path $CONTRACT_WASM

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Déploiement initié avec succès!"
    echo ""
    echo "📊 Prochaines étapes:"
    echo "   1. Attendre ~2-3 minutes pour la confirmation"
    echo "   2. Vérifier le déploiement sur: https://testnet.cspr.live"
    echo "   3. Rechercher votre adresse: $ACCOUNT"
    echo ""
else
    echo ""
    echo "❌ Erreur lors du déploiement"
    echo "   Vérifiez que vous avez assez de CSPR testnet"
    echo "   Obtenez des tokens sur: https://testnet.cspr.live/tools/faucet"
    echo ""
    exit 1
fi
