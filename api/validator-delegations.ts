import type { VercelRequest, VercelResponse } from '@vercel/node';

// Casper RPC endpoint (testnet)
const RPC_URL = 'https://rpc.testnet.casperlabs.io/rpc';
// V22 Contract Package Hash
const CONTRACT_PACKAGE_HASH = '2d6a399bca8c71bb007de1cbcd57c7d6a54dc0283376a08fe6024a33c02b0ad3';
// Rate precision (9 decimals)
const RATE_PRECISION = 1_000_000_000;

// Approved validators from config
const APPROVED_VALIDATORS = [
  "0106ca7c39cd272dbf21a86eeb3b36b7c26e2e9b94af64292419f7862936bca2ca",
  "017d96b9a63abcb61c870a4f55187a0a7ac24096bdb5fc585c12a686a4d892009e",
  "017d9aa0b86413d7ff9a9169182c53f0bacaa80d34c211adab007ed4876af17077",
  "012d58e05b2057a84115709e0a6ccf000c6a83b4e8dfa389a680c1ab001864f1f2",
  "0143345f0d7c6e8d1a8e70eecdc3b4801d6b8505cd56c422b56d806b3efd1ebfda",
  "012b365e09c5d75187b4abc25c4aa28109133bab6a256ef4abe24348073e590d80",
  "0153d98c835b493c76050735dc79e6702a17cd78ab69d5b0c3631e72f8f38bb095",
  "013584d18def5ee3ef33374b3e2c9056bbb7860c97044bd16b64d895f8aa073084",
  "01a4a5517e0b83b7cbccae0cc22fb4a03d5c5a3d15c6b6bd7a6f4747e541bea779",
  "01a7cfb168d2bc2f69f90627d5e7bc6cb019b1c52c8a374416fdb9c4cef0233611",
  "01f340df2c32f25391e8f7924a99e93cab3a6f230ff7af1cacbfc070772cbebd94"
];

interface ValidatorDelegation {
  publicKey: string;
  delegatedAmount: string;
  delegatedCspr: number;
  isActive: boolean;
}

/**
 * API endpoint to fetch delegations per validator from the staking contract
 *
 * The contract stores delegated amounts in a Mapping<PublicKey, U512>
 * We query this for each approved validator to show the admin how funds are distributed
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // Cache for 60 seconds
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get the state root hash first
    const stateRootHash = await getStateRootHash();

    // Query delegations for all approved validators
    const delegations: ValidatorDelegation[] = [];
    let totalDelegated = 0;

    for (const validatorKey of APPROVED_VALIDATORS) {
      const delegation = await queryValidatorDelegation(stateRootHash, validatorKey);
      delegations.push(delegation);
      totalDelegated += delegation.delegatedCspr;
    }

    return res.status(200).json({
      delegations,
      totalDelegated,
      totalDelegatedMotes: (totalDelegated * RATE_PRECISION).toString(),
      validatorCount: delegations.filter(d => d.delegatedCspr > 0).length,
      timestamp: new Date().toISOString(),
      contractHash: CONTRACT_PACKAGE_HASH,
    });
  } catch (error: any) {
    console.error('Validator delegations API error:', error);

    // Return empty delegations on error
    return res.status(200).json({
      delegations: APPROVED_VALIDATORS.map(pk => ({
        publicKey: pk,
        delegatedAmount: '0',
        delegatedCspr: 0,
        isActive: false,
      })),
      totalDelegated: 0,
      totalDelegatedMotes: '0',
      validatorCount: 0,
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
}

/**
 * Make a JSON-RPC call
 */
async function rpcCall(method: string, params: any): Promise<any> {
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
  return response.json();
}

/**
 * Get current state root hash from the blockchain
 */
async function getStateRootHash(): Promise<string> {
  const data = await rpcCall('chain_get_state_root_hash', {});
  return data.result?.state_root_hash || '';
}

/**
 * Query the contract for a specific validator's delegated amount
 *
 * The contract stores: delegated_to_validator: Mapping<PublicKey, U512>
 * In Odra, Mappings are stored with hashed keys
 */
async function queryValidatorDelegation(stateRootHash: string, validatorPublicKey: string): Promise<ValidatorDelegation> {
  const defaultResult: ValidatorDelegation = {
    publicKey: validatorPublicKey,
    delegatedAmount: '0',
    delegatedCspr: 0,
    isActive: false,
  };

  try {
    // Try multiple approaches to query the delegation

    // Approach 1: Try query_global_state with key path
    // Odra Mapping keys are typically: {variable_name}_{key_hash}
    const contractKey = `hash-${CONTRACT_PACKAGE_HASH}`;

    // Try direct key lookup with various patterns
    const keyPatterns = [
      ['delegated_to_validator', validatorPublicKey],
      [`delegated_to_validator:${validatorPublicKey}`],
      ['delegated_to_validator'],
    ];

    for (const path of keyPatterns) {
      try {
        const data = await rpcCall('query_global_state', {
          state_identifier: { StateRootHash: stateRootHash },
          key: contractKey,
          path,
        });

        if (data.result?.stored_value) {
          const value = parseClValue(data.result.stored_value);
          if (value !== null && value > 0) {
            return {
              publicKey: validatorPublicKey,
              delegatedAmount: value.toString(),
              delegatedCspr: value / RATE_PRECISION,
              isActive: true,
            };
          }
        }
      } catch {
        // Continue to next pattern
      }
    }

    // Approach 2: Try entity state query for Casper 2.0
    const entityData = await rpcCall('state_get_entity', {
      entity_identifier: {
        EntityAddr: `entity-contract-${CONTRACT_PACKAGE_HASH}`,
      },
      state_root_hash: stateRootHash,
    });

    if (entityData.result?.entity?.named_keys) {
      const namedKeys = entityData.result.entity.named_keys;

      // Look for a key that matches our validator
      for (const nk of namedKeys) {
        if (nk.name.includes('delegated') && nk.name.includes(validatorPublicKey.substring(2, 10))) {
          const keyData = await queryKeyByURef(stateRootHash, nk.key);
          if (keyData !== null && keyData > 0) {
            return {
              publicKey: validatorPublicKey,
              delegatedAmount: keyData.toString(),
              delegatedCspr: keyData / RATE_PRECISION,
              isActive: true,
            };
          }
        }
      }
    }

    // Approach 3: Try to call the contract entry point via state queries
    // Some contracts expose getter entry points that can be called

    return defaultResult;
  } catch (error: any) {
    console.error(`Error querying delegation for ${validatorPublicKey}:`, error.message);
    return defaultResult;
  }
}

/**
 * Query key by URef
 */
async function queryKeyByURef(stateRootHash: string, uref: string): Promise<number | null> {
  try {
    const data = await rpcCall('query_global_state', {
      state_identifier: { StateRootHash: stateRootHash },
      key: uref,
      path: [],
    });

    if (data.result?.stored_value) {
      return parseClValue(data.result.stored_value);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Parse a CLValue to number
 */
function parseClValue(storedValue: any): number | null {
  if (!storedValue) return null;

  // CLValue format
  if (storedValue.CLValue) {
    const parsed = storedValue.CLValue.parsed;
    if (typeof parsed === 'string') {
      return parseInt(parsed, 10) || 0;
    }
    if (typeof parsed === 'number') {
      return parsed;
    }
  }

  // Direct number
  if (typeof storedValue === 'number') {
    return storedValue;
  }

  // String number
  if (typeof storedValue === 'string') {
    return parseInt(storedValue, 10) || null;
  }

  return null;
}
