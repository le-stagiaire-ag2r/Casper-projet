#!/usr/bin/env node
/**
 * StakeVue Stats Checker
 *
 * Queries the contract state and displays current statistics.
 * Useful for verifying the contract state before/after operations.
 *
 * Usage:
 *   node check-stats.js
 *
 * Environment Variables:
 *   RPC_URL         - Casper RPC endpoint (default: testnet)
 *   CONTRACT_HASH   - Contract package hash
 */

import dotenv from 'dotenv';
dotenv.config();

// Configuration
const RPC_URL = process.env.RPC_URL || 'https://rpc.testnet.casperlabs.io/rpc';
const CONTRACT_PACKAGE_HASH = process.env.CONTRACT_HASH || '2b6c14a2cac5cfe4a1fd1efc2fc02b1090dbc3a6b661a329b90c829245540985';
const RATE_PRECISION = 1_000_000_000;

async function main() {
  console.log('=== StakeVue Contract Stats ===');
  console.log(`RPC: ${RPC_URL}`);
  console.log(`Contract: ${CONTRACT_PACKAGE_HASH}`);
  console.log('');

  try {
    // Get state root hash
    const stateRootHash = await getStateRootHash();
    console.log(`State Root Hash: ${stateRootHash.slice(0, 16)}...`);
    console.log('');

    // Query contract package
    const contractData = await queryContract(stateRootHash);

    if (contractData) {
      console.log('Contract Package Found!');
      console.log('---');

      // Try to find named keys and values
      if (contractData.Package) {
        console.log('Type: Contract Package');
        const versions = contractData.Package.versions || [];
        console.log(`Versions: ${versions.length}`);

        if (versions.length > 0) {
          const latestVersion = versions[versions.length - 1];
          console.log(`Latest Version: ${latestVersion.contract_version}`);
          console.log(`Contract Hash: ${latestVersion.contract_hash}`);
        }
      }

      if (contractData.Contract) {
        console.log('Type: Contract');
        const namedKeys = contractData.Contract.named_keys || [];
        console.log(`Named Keys: ${namedKeys.length}`);

        namedKeys.forEach(nk => {
          console.log(`  - ${nk.name}: ${nk.key}`);
        });
      }
    }

    // Try to query specific keys
    console.log('\n--- Attempting Direct Key Queries ---');

    const keys = [
      'exchange_rate',
      'total_cspr_pool',
      'total_stcspr_supply',
      'owner',
      'stcspr_contract'
    ];

    for (const key of keys) {
      const value = await queryContractKey(stateRootHash, key);
      if (value) {
        console.log(`${key}: ${formatValue(value)}`);
      } else {
        console.log(`${key}: (not found or error)`);
      }
    }

    // Calculate and display formatted values
    console.log('\n--- Formatted Stats ---');
    console.log('Note: If values show 0, the contract may use different storage keys');
    console.log('Check the Odra-generated storage format for exact key names');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function rpcCall(method, params) {
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message);
  }
  return data.result;
}

async function getStateRootHash() {
  const result = await rpcCall('chain_get_state_root_hash', {});
  return result.state_root_hash;
}

async function queryContract(stateRootHash) {
  try {
    const result = await rpcCall('query_global_state', {
      state_identifier: { StateRootHash: stateRootHash },
      key: `hash-${CONTRACT_PACKAGE_HASH}`,
      path: [],
    });
    return result.stored_value;
  } catch (err) {
    console.error('Query error:', err.message);
    return null;
  }
}

async function queryContractKey(stateRootHash, key) {
  try {
    const result = await rpcCall('query_global_state', {
      state_identifier: { StateRootHash: stateRootHash },
      key: `hash-${CONTRACT_PACKAGE_HASH}`,
      path: [key],
    });
    return result.stored_value;
  } catch {
    return null;
  }
}

function formatValue(storedValue) {
  if (!storedValue) return 'null';

  if (storedValue.CLValue) {
    const parsed = storedValue.CLValue.parsed;
    if (typeof parsed === 'string' || typeof parsed === 'number') {
      return parsed.toString();
    }
    return JSON.stringify(parsed);
  }

  return JSON.stringify(storedValue).slice(0, 100);
}

main();
