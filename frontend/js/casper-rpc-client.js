/**
 * Casper RPC Client - Frontend Helper
 * Use this module to make RPC calls through the Vercel proxy
 *
 * This solves CORS issues by routing requests through your backend proxy
 */

// Determine the API URL based on environment
const getApiUrl = () => {
  // In production (Vercel deployment)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return '/api/rpc-proxy';
  }
  // In development, use localhost or your dev server
  return 'http://localhost:3000/api/rpc-proxy';
};

/**
 * Makes an RPC call to Casper Network through the proxy
 * @param {string} method - The RPC method name (e.g., 'account_put_deploy')
 * @param {object} params - The parameters for the RPC call
 * @returns {Promise<object>} - The RPC response
 */
export async function casperRpcCall(method, params = {}) {
  const apiUrl = getApiUrl();

  console.log(`📡 Making RPC call: ${method}`);
  console.log('📋 Using proxy:', apiUrl);

  try {
    const response = await fetch(apiUrl, {
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

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ RPC call failed:', errorData);
      throw new Error(errorData.error || 'RPC request failed');
    }

    const data = await response.json();
    console.log('✅ RPC call successful');

    return data;
  } catch (error) {
    console.error('❌ RPC error:', error);
    throw error;
  }
}

/**
 * Put a deploy on Casper Network
 * @param {object} deploy - The signed deploy object
 * @returns {Promise<string>} - The deploy hash
 */
export async function putDeploy(deploy) {
  console.log('📋 Submitting deploy to Casper Network...');

  try {
    const response = await casperRpcCall('account_put_deploy', { deploy });

    if (response.error) {
      throw new Error(response.error.message || 'Deploy submission failed');
    }

    const deployHash = response.result?.deploy_hash;
    console.log('✅ Deploy submitted successfully:', deployHash);

    return deployHash;
  } catch (error) {
    console.error('❌ Deploy submission failed:', error);
    throw error;
  }
}

/**
 * Get deploy information
 * @param {string} deployHash - The deploy hash
 * @returns {Promise<object>} - The deploy information
 */
export async function getDeploy(deployHash) {
  console.log('📋 Fetching deploy:', deployHash);

  try {
    const response = await casperRpcCall('info_get_deploy', {
      deploy_hash: deployHash
    });

    if (response.error) {
      throw new Error(response.error.message || 'Failed to get deploy');
    }

    return response.result;
  } catch (error) {
    console.error('❌ Get deploy failed:', error);
    throw error;
  }
}

/**
 * Get account information
 * @param {string} publicKey - The account public key
 * @returns {Promise<object>} - The account information
 */
export async function getAccountInfo(publicKey) {
  console.log('📋 Fetching account info for:', publicKey);

  try {
    const response = await casperRpcCall('state_get_account_info', {
      public_key: publicKey,
    });

    if (response.error) {
      throw new Error(response.error.message || 'Failed to get account info');
    }

    return response.result;
  } catch (error) {
    console.error('❌ Get account info failed:', error);
    throw error;
  }
}

/**
 * Get the latest block information
 * @returns {Promise<object>} - The latest block
 */
export async function getLatestBlock() {
  console.log('📋 Fetching latest block...');

  try {
    const response = await casperRpcCall('chain_get_block');

    if (response.error) {
      throw new Error(response.error.message || 'Failed to get latest block');
    }

    return response.result;
  } catch (error) {
    console.error('❌ Get latest block failed:', error);
    throw error;
  }
}

/**
 * Get account balance
 * @param {string} purseUref - The purse URef
 * @returns {Promise<string>} - The balance
 */
export async function getAccountBalance(purseUref) {
  console.log('📋 Fetching balance for purse:', purseUref);

  try {
    const response = await casperRpcCall('state_get_balance', {
      state_root_hash: (await getLatestBlock()).block.header.state_root_hash,
      purse_uref: purseUref,
    });

    if (response.error) {
      throw new Error(response.error.message || 'Failed to get balance');
    }

    return response.result.balance_value;
  } catch (error) {
    console.error('❌ Get balance failed:', error);
    throw error;
  }
}

// Export default object with all methods
export default {
  casperRpcCall,
  putDeploy,
  getDeploy,
  getAccountInfo,
  getLatestBlock,
  getAccountBalance,
};
