import type { VercelRequest, VercelResponse } from '@vercel/node';

// Casper RPC endpoint (testnet)
const RPC_URL = 'https://rpc.testnet.casperlabs.io/rpc';
// Contract Package Hash
const CONTRACT_PACKAGE_HASH = '2d6a399bca8c71bb007de1cbcd57c7d6a54dc0283376a08fe6024a33c02b0ad3';
// Unbonding period in blocks (approximately 7 eras = ~14 hours on testnet)
const UNBONDING_BLOCKS = 14 * 3600 * 1000; // 14 hours in ms
// 1 era ≈ 2 hours on testnet
const ERA_DURATION_MS = 2 * 60 * 60 * 1000;
const UNBONDING_ERAS = 7;

/**
 * API endpoint to fetch user's withdrawal requests
 *
 * Query params:
 * - account: User's public key in hex format (with 01/02 prefix)
 *
 * Returns: Array of withdrawal requests with status
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=30');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const account = req.query.account as string;
  if (!account) {
    return res.status(400).json({ error: 'account parameter required' });
  }

  try {
    const stateRootHash = await getStateRootHash();
    const withdrawals = await getUserWithdrawals(stateRootHash, account);

    return res.status(200).json({
      account,
      withdrawals,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Withdrawals API error:', error);
    return res.status(500).json({
      error: error.message,
      withdrawals: [],
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
 * Get current state root hash
 */
async function getStateRootHash(): Promise<string> {
  const data = await rpcCall('chain_get_state_root_hash', {});
  return data.result?.state_root_hash || '';
}

/**
 * Convert public key to account hash
 */
function publicKeyToAccountHash(publicKey: string): string {
  // For simplicity, we'll use the public key directly as it's how Odra stores Address
  // The actual hashing would require blake2b, but Odra stores the full address
  return publicKey.toLowerCase();
}

/**
 * Query a dictionary item from the contract
 */
async function queryDictionaryItem(
  stateRootHash: string,
  dictionaryName: string,
  dictionaryKey: string
): Promise<any> {
  try {
    // First, try using entity-based query for Casper 2.0
    const entityKey = `entity-contract-${CONTRACT_PACKAGE_HASH}`;

    const data = await rpcCall('state_get_dictionary_item', {
      state_root_hash: stateRootHash,
      dictionary_identifier: {
        ContractNamedKey: {
          key: entityKey,
          dictionary_name: dictionaryName,
          dictionary_item_key: dictionaryKey,
        },
      },
    });

    if (data.result?.stored_value?.CLValue) {
      return data.result.stored_value.CLValue;
    }

    // Try alternative format
    const data2 = await rpcCall('state_get_dictionary_item', {
      state_root_hash: stateRootHash,
      dictionary_identifier: {
        AccountNamedKey: {
          key: `hash-${CONTRACT_PACKAGE_HASH}`,
          dictionary_name: dictionaryName,
          dictionary_item_key: dictionaryKey,
        },
      },
    });

    if (data2.result?.stored_value?.CLValue) {
      return data2.result.stored_value.CLValue;
    }

    return null;
  } catch (error) {
    console.error(`Dictionary query failed for ${dictionaryName}[${dictionaryKey}]:`, error);
    return null;
  }
}

/**
 * Query contract path
 */
async function queryContractPath(
  stateRootHash: string,
  path: string[]
): Promise<any> {
  try {
    const data = await rpcCall('query_global_state', {
      state_identifier: { StateRootHash: stateRootHash },
      key: `hash-${CONTRACT_PACKAGE_HASH}`,
      path,
    });

    if (data.result?.stored_value?.CLValue) {
      return data.result.stored_value.CLValue;
    }
    return null;
  } catch {
    return null;
  }
}

interface WithdrawalInfo {
  requestId: number;
  csprAmount: number;
  isReady: boolean;
  isClaimed: boolean;
  requestBlock: number;
  requestTime: string;
  estimatedReadyTime: string;
}

/**
 * Get user's withdrawal requests
 */
async function getUserWithdrawals(
  stateRootHash: string,
  publicKey: string
): Promise<WithdrawalInfo[]> {
  const withdrawals: WithdrawalInfo[] = [];
  const accountHash = publicKeyToAccountHash(publicKey);

  try {
    // Step 1: Get user's request count
    // Odra stores Mapping<Address, u64> as a dictionary
    // Dictionary key is typically the serialized address
    const countResult = await queryDictionaryItem(
      stateRootHash,
      'user_request_count',
      accountHash
    );

    let requestCount = 0;
    if (countResult?.parsed) {
      requestCount = parseInt(countResult.parsed.toString(), 10);
    }

    console.log(`User ${publicKey.slice(0, 10)}... has ${requestCount} requests`);

    // Step 2: For each request index, get the request_id
    for (let index = 0; index < requestCount; index++) {
      // The key for user_requests is a tuple (Address, u64)
      // Odra serializes this as a combined string
      const tupleKey = `${accountHash}_${index}`;

      const requestIdResult = await queryDictionaryItem(
        stateRootHash,
        'user_requests',
        tupleKey
      );

      if (!requestIdResult?.parsed) {
        continue;
      }

      const requestId = parseInt(requestIdResult.parsed.toString(), 10);

      // Step 3: Get the withdrawal request details
      const requestResult = await queryDictionaryItem(
        stateRootHash,
        'withdrawal_requests',
        requestId.toString()
      );

      if (!requestResult?.parsed) {
        continue;
      }

      // Parse the WithdrawalRequest struct
      // Odra serializes structs as tuples or maps
      const parsed = requestResult.parsed;
      let csprAmount = 0;
      let requestBlock = 0;
      let isClaimed = false;
      let staker = '';

      if (Array.isArray(parsed)) {
        // Tuple format: [staker, cspr_amount, request_block, claimed]
        staker = parsed[0]?.toString() || '';
        csprAmount = parseInt(parsed[1]?.toString() || '0', 10);
        requestBlock = parseInt(parsed[2]?.toString() || '0', 10);
        isClaimed = parsed[3] === true || parsed[3] === 'true';
      } else if (typeof parsed === 'object') {
        // Object/map format
        staker = parsed.staker || '';
        csprAmount = parseInt(parsed.cspr_amount?.toString() || '0', 10);
        requestBlock = parseInt(parsed.request_block?.toString() || '0', 10);
        isClaimed = parsed.claimed === true || parsed.claimed === 'true';
      }

      // Calculate timing
      const requestTime = new Date(requestBlock);
      const unbondingComplete = new Date(requestBlock + UNBONDING_ERAS * ERA_DURATION_MS);
      const now = new Date();
      const isReady = now >= unbondingComplete && !isClaimed;

      withdrawals.push({
        requestId,
        csprAmount: csprAmount / 1_000_000_000, // Convert motes to CSPR
        isReady,
        isClaimed,
        requestBlock,
        requestTime: requestTime.toISOString(),
        estimatedReadyTime: unbondingComplete.toISOString(),
      });
    }

    // If no withdrawals found via user_requests mapping, try scanning recent request IDs
    if (withdrawals.length === 0) {
      console.log('No requests found via mapping, scanning recent IDs...');
      withdrawals.push(...(await scanRecentWithdrawals(stateRootHash, publicKey)));
    }

    return withdrawals;
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return withdrawals;
  }
}

/**
 * Scan recent withdrawal request IDs to find user's requests
 * This is a fallback if the mapping query fails
 */
async function scanRecentWithdrawals(
  stateRootHash: string,
  publicKey: string
): Promise<WithdrawalInfo[]> {
  const withdrawals: WithdrawalInfo[] = [];
  const accountKey = publicKey.toLowerCase();

  // Get next_request_id to know the upper bound
  const nextIdResult = await queryContractPath(stateRootHash, ['next_request_id']);
  let nextId = 1;
  if (nextIdResult?.parsed) {
    nextId = parseInt(nextIdResult.parsed.toString(), 10);
  }

  // Scan the last 50 requests (or all if less than 50)
  const startId = Math.max(1, nextId - 50);

  for (let id = startId; id < nextId; id++) {
    try {
      const requestResult = await queryDictionaryItem(
        stateRootHash,
        'withdrawal_requests',
        id.toString()
      );

      if (!requestResult?.parsed) {
        continue;
      }

      const parsed = requestResult.parsed;
      let staker = '';
      let csprAmount = 0;
      let requestBlock = 0;
      let isClaimed = false;

      if (Array.isArray(parsed)) {
        staker = parsed[0]?.toString() || '';
        csprAmount = parseInt(parsed[1]?.toString() || '0', 10);
        requestBlock = parseInt(parsed[2]?.toString() || '0', 10);
        isClaimed = parsed[3] === true || parsed[3] === 'true';
      } else if (typeof parsed === 'object') {
        staker = parsed.staker || '';
        csprAmount = parseInt(parsed.cspr_amount?.toString() || '0', 10);
        requestBlock = parseInt(parsed.request_block?.toString() || '0', 10);
        isClaimed = parsed.claimed === true || parsed.claimed === 'true';
      }

      // Check if this request belongs to the user
      // The staker field could be in various formats
      if (staker.toLowerCase().includes(accountKey.slice(2, 10))) {
        const requestTime = new Date(requestBlock);
        const unbondingComplete = new Date(requestBlock + UNBONDING_ERAS * ERA_DURATION_MS);
        const now = new Date();
        const isReady = now >= unbondingComplete && !isClaimed;

        withdrawals.push({
          requestId: id,
          csprAmount: csprAmount / 1_000_000_000,
          isReady,
          isClaimed,
          requestBlock,
          requestTime: requestTime.toISOString(),
          estimatedReadyTime: unbondingComplete.toISOString(),
        });
      }
    } catch {
      // Continue to next ID
    }
  }

  return withdrawals;
}
