#!/bin/bash

# Script de déploiement StakeVue - Casper 2.0 (put-transaction)
# Version corrigée avec la commande Casper 2.0

echo "🚀 Déploiement StakeVue sur Casper Testnet (Casper 2.0)"
echo "========================================================"
echo ""

# Configuration
CHAIN_NAME="casper-test"
NODE_ADDRESS="https://node.testnet.casper.network/rpc"
CONTRACT_WASM="smart-contract/target/wasm32-unknown-unknown/release/stakevue_contract.wasm"
SECRET_KEY="keys/secret_key.pem"
PAYMENT_AMOUNT="100000000000"  # 100 CSPR
GAS_PRICE_TOLERANCE="5"
TTL="30min"

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
echo "   Payment: $((PAYMENT_AMOUNT / 1000000000)) CSPR"
echo "   Gas Tolerance: $GAS_PRICE_TOLERANCE"
echo "   TTL: $TTL"
echo ""

# Déploiement avec la nouvelle commande Casper 2.0
echo "🚀 Déploiement en cours (Casper 2.0 put-transaction)..."
echo ""

casper-client put-transaction session \
    --node-address "$NODE_ADDRESS" \
    --secret-key "$SECRET_KEY" \
    --chain-name "$CHAIN_NAME" \
    --wasm-path "$CONTRACT_WASM" \
    --payment-amount "$PAYMENT_AMOUNT" \
    --standard-payment true \
    --gas-price-tolerance "$GAS_PRICE_TOLERANCE" \
    --ttl "$TTL" \
    --install-upgrade

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Déploiement initié avec succès!"
    echo ""
    echo "📊 Prochaines étapes:"
    echo "   1. Attendre ~2-3 minutes pour la confirmation"
    echo "   2. Vérifier le déploiement sur: https://testnet.cspr.live"
    echo ""
else
    echo ""
    echo "❌ Erreur lors du déploiement"
    echo ""
    exit 1
fi
