#!/bin/bash

# StakeVue V4.0 Deployment Script
# Deploys contract with validator delegation support

echo "🚀 Deploying StakeVue V4.0 - Validator Delegation"
echo "=================================================="

# Configuration
NODE_ADDRESS="https://node.testnet.casper.network/rpc"
CHAIN_NAME="casper-test"
CONTRACT_WASM="smart-contract/target/wasm32-unknown-unknown/release/stakevue_contract.wasm"
SECRET_KEY="keys/secret_key.pem"
PAYMENT_AMOUNT="250000000000"  # 250 CSPR for V4.0 (126KB WASM)
GAS_PRICE_TOLERANCE=5
TTL="30min"

# Deployer's public key (used for delegation)
DELEGATOR_PUBKEY="010456c5cfb4b5157854f325f0980e2c504cbce2dfcb5fafce31b7b0a84538652c"

echo ""
echo "📋 Deployment Configuration:"
echo "  Contract: $CONTRACT_WASM"
echo "  Network: Casper Testnet"
echo "  Payment: 150 CSPR"
echo "  Delegator: $DELEGATOR_PUBKEY"
echo ""

# Check if WASM exists
if [ ! -f "$CONTRACT_WASM" ]; then
    echo "❌ Error: Contract WASM not found at $CONTRACT_WASM"
    echo "Please run: cd smart-contract && cargo build --release --target wasm32-unknown-unknown"
    exit 1
fi

# Get WASM size
WASM_SIZE=$(du -h "$CONTRACT_WASM" | cut -f1)
echo "✅ Contract WASM found (Size: $WASM_SIZE)"
echo ""

# Deploy
echo "🔄 Deploying contract to testnet..."
echo ""

casper-client put-transaction session \
  --node-address "$NODE_ADDRESS" \
  --secret-key "$SECRET_KEY" \
  --chain-name "$CHAIN_NAME" \
  --wasm-path "$CONTRACT_WASM" \
  --session-arg "delegator_pubkey:public_key='$DELEGATOR_PUBKEY'" \
  --install-upgrade \
  --payment-amount "$PAYMENT_AMOUNT" \
  --standard-payment true \
  --gas-price-tolerance "$GAS_PRICE_TOLERANCE" \
  --ttl "$TTL"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment transaction submitted successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "  1. Wait ~60 seconds for deployment to finalize"
    echo "  2. Check transaction on: https://testnet.cspr.live"
    echo "  3. Add validators using add_validator()"
    echo "  4. Start staking to test delegation!"
    echo ""
else
    echo ""
    echo "❌ Deployment failed! Check the error message above."
    exit 1
fi
