#!/bin/bash
# Add all validators to V21 contract
# Runs the script multiple times to handle the Events stream 404 error

echo "=== Adding all validators to StakeVue V21 ==="
echo "This will run multiple times to handle Odra 2.5.0 Events stream issue"
echo ""

for i in {1..11}; do
    echo "--- Attempt $i/11 ---"
    cargo run --bin add_validators_v21 --features livenet 2>&1 || true
    echo ""
    echo "Waiting 5 seconds before next attempt..."
    sleep 5
done

echo ""
echo "=== Done! Check the explorer to verify all validators are added ==="
echo "Contract: https://testnet.cspr.live/contract-package/550546bc677e6712faa79b280469c1c550031f825e5d95d038b235d22e83b655"
