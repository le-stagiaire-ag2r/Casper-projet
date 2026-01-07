import type { VercelRequest, VercelResponse } from '@vercel/node';

// Casper RPC endpoint (testnet)
const RPC_URL = 'https://rpc.testnet.casperlabs.io/rpc';
// Contract Package Hash
const CONTRACT_PACKAGE_HASH = '2d6a399bca8c71bb007de1cbcd57c7d6a54dc0283376a08fe6024a33c02b0ad3';

/**
 * Debug API - Check withdrawal request details
 *
 * Query: /api/debug-withdrawal?request_id=1
 *
 * Returns: staker address, amount, claimed status
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const requestId = req.query.request_id as string || '1';

  try {
    const stateRootHash = await getStateRootHash();

    // Get next_request_id to know total requests
    const nextId = await queryContractPath(stateRootHash, ['next_request_id']);

    // Try to get withdrawal request details
    const withdrawalData = await queryDictionaryItem(stateRootHash, 'withdrawal_requests', requestId);

    return res.status(200).json({
      requestId,
      nextRequestId: nextId?.parsed || 'unknown',
      totalRequests: nextId?.parsed ? parseInt(nextId.parsed.toString()) - 1 : 'unknown',
      withdrawal: withdrawalData ? {
        raw: withdrawalData.parsed,
        bytes: withdrawalData.bytes,
      } : null,
      stateRootHash,
      contractHash: CONTRACT_PACKAGE_HASH,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
      requestId,
    });
  }
}

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

async function getStateRootHash(): Promise<string> {
  const data = await rpcCall('chain_get_state_root_hash', {});
  return data.result?.state_root_hash || '';
}

async function queryContractPath(stateRootHash: string, path: string[]): Promise<any> {
  try {
    const data = await rpcCall('query_global_state', {
      state_identifier: { StateRootHash: stateRootHash },
      key: `hash-${CONTRACT_PACKAGE_HASH}`,
      path,
    });
    return data.result?.stored_value?.CLValue || null;
  } catch {
    return null;
  }
}

async function queryDictionaryItem(stateRootHash: string, dictName: string, key: string): Promise<any> {
  try {
    // Try entity-contract format first (Casper 2.0)
    const data = await rpcCall('state_get_dictionary_item', {
      state_root_hash: stateRootHash,
      dictionary_identifier: {
        ContractNamedKey: {
          key: `entity-contract-${CONTRACT_PACKAGE_HASH}`,
          dictionary_name: dictName,
          dictionary_item_key: key,
        },
      },
    });

    if (data.result?.stored_value?.CLValue) {
      return data.result.stored_value.CLValue;
    }

    // Try hash format
    const data2 = await rpcCall('state_get_dictionary_item', {
      state_root_hash: stateRootHash,
      dictionary_identifier: {
        ContractNamedKey: {
          key: `hash-${CONTRACT_PACKAGE_HASH}`,
          dictionary_name: dictName,
          dictionary_item_key: key,
        },
      },
    });

    return data2.result?.stored_value?.CLValue || null;
  } catch (error) {
    console.error(`Dictionary query failed:`, error);
    return null;
  }
}
