/**
 * CSPR.cloud API Service
 * Uses CSPR.click proxy to bypass CORS and handle authentication
 * Documentation: https://docs.cspr.cloud/
 */

// Types for CSPR.cloud API responses
export interface CsprCloudAccount {
  public_key: string;
  account_hash: string;
  balance: string; // in motes
  main_purse_uref: string;
  // Optional properties with includes
  delegated_balance?: string;
  staked_balance?: string;
  undelegating_balance?: string;
  auction_status?: 'inactive_bidder' | 'active_bidder' | 'active_validator' | 'pending_validator';
}

export interface CsprCloudAuctionMetrics {
  current_era_id: number;
  active_validator_number: number;
  total_bids_number: number;
  active_bids_number: number;
  total_active_era_stake: string; // TVL in motes
}

export interface CsprCloudSupply {
  token: string;
  total: number;
  circulating: number;
  timestamp: number;
}

export interface CsprCloudRate {
  currency_id: number;
  amount: number;
  created: string;
}

export interface CsprCloudValidator {
  public_key: string;
  era_id: number;
  rank: number;
  is_active: boolean;
  fee: number; // percentage
  delegators_number: number;
  bid_amount: string;
  delegators_stake: string;
  total_stake: string;
  self_stake: string;
  self_share: number;
  network_share: number;
  reserved_slots: number;
  minimum_delegation_amount: string;
  maximum_delegation_amount: string;
  // Optional
  account_info?: CsprCloudAccountInfo;
  average_performance?: CsprCloudValidatorPerformance;
}

export interface CsprCloudAccountInfo {
  account_hash: string;
  url: string;
  is_active: boolean;
  info: {
    owner?: {
      name?: string;
      website?: string;
      branding?: {
        logo?: {
          svg?: string;
          png_256?: string;
          png_1024?: string;
        };
      };
    };
  };
}

export interface CsprCloudValidatorPerformance {
  public_key: string;
  era_id: number;
  score: number;
}

export interface CsprCloudDelegation {
  delegator_identifier: string;
  delegator_identifier_type_id: number;
  public_key: string;
  validator_public_key: string;
  stake: string; // in motes
  bonding_purse: string;
  // Optional
  validator_account_info?: CsprCloudAccountInfo;
}

export interface CsprCloudDelegatorReward {
  delegator_identifier: string;
  era_id: number;
  amount: string;
  timestamp: string;
  validator_public_key: string;
}

export interface CsprCloudTransfer {
  id: number;
  deploy_hash: string;
  block_height: number;
  initiator_account_hash: string;
  from_purse: string;
  to_purse: string;
  to_account_hash: string;
  amount: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  item_count: number;
  page_count: number;
}

// Helper to get the CSPR.click proxy
const getProxy = (): any => {
  if (typeof window !== 'undefined' && (window as any).csprclick) {
    return (window as any).csprclick.getCsprCloudProxy?.();
  }
  return null;
};

// Check if proxy is available
export const isProxyAvailable = (): boolean => {
  return !!getProxy();
};

// Generic fetch function using proxy
const proxyFetch = async <T>(endpoint: string): Promise<T> => {
  const proxy = getProxy();

  if (!proxy) {
    throw new Error('CSPR.click proxy not available. Please connect your wallet first.');
  }

  try {
    const response = await proxy.fetch(endpoint);
    return response as T;
  } catch (error: any) {
    console.error(`CSPR.cloud API error for ${endpoint}:`, error);
    throw error;
  }
};

/**
 * CSPR.cloud API Service
 */
export const csprCloudApi = {
  /**
   * Get account details with optional includes
   */
  async getAccount(publicKeyOrHash: string): Promise<{ data: CsprCloudAccount }> {
    return proxyFetch<{ data: CsprCloudAccount }>(
      `/accounts/${publicKeyOrHash}?includes=delegated_balance,staked_balance,undelegating_balance,auction_status`
    );
  },

  /**
   * Get auction metrics (TVL, validator count, etc.)
   */
  async getAuctionMetrics(): Promise<{ data: CsprCloudAuctionMetrics }> {
    return proxyFetch<{ data: CsprCloudAuctionMetrics }>('/auction-metrics');
  },

  /**
   * Get CSPR supply (total and circulating)
   */
  async getSupply(): Promise<{ data: CsprCloudSupply }> {
    return proxyFetch<{ data: CsprCloudSupply }>('/supply');
  },

  /**
   * Get current CSPR rate in USD (currency_id=1)
   */
  async getCurrentRate(currencyId: number = 1): Promise<{ data: CsprCloudRate }> {
    return proxyFetch<{ data: CsprCloudRate }>(`/rates/${currencyId}/latest`);
  },

  /**
   * Get historical CSPR rates
   */
  async getHistoricalRates(
    currencyId: number = 1,
    from?: string,
    to?: string
  ): Promise<PaginatedResponse<CsprCloudRate>> {
    let endpoint = `/currencies/${currencyId}/rates?order_direction=ASC`;
    if (from) endpoint += `&from=${from}`;
    if (to) endpoint += `&to=${to}`;
    return proxyFetch<PaginatedResponse<CsprCloudRate>>(endpoint);
  },

  /**
   * Get validators for current era
   */
  async getValidators(eraId: number, limit: number = 100): Promise<PaginatedResponse<CsprCloudValidator>> {
    return proxyFetch<PaginatedResponse<CsprCloudValidator>>(
      `/validators?era_id=${eraId}&includes=account_info,average_performance&limit=${limit}`
    );
  },

  /**
   * Get bidders (includes validators and candidates)
   */
  async getBidders(eraId: number, limit: number = 100): Promise<PaginatedResponse<CsprCloudValidator>> {
    return proxyFetch<PaginatedResponse<CsprCloudValidator>>(
      `/bidders?era_id=${eraId}&includes=account_info,average_performance&limit=${limit}`
    );
  },

  /**
   * Get account delegations
   */
  async getAccountDelegations(publicKey: string): Promise<PaginatedResponse<CsprCloudDelegation>> {
    return proxyFetch<PaginatedResponse<CsprCloudDelegation>>(
      `/accounts/${publicKey}/delegations?includes=validator_account_info`
    );
  },

  /**
   * Get account delegation rewards
   */
  async getAccountDelegationRewards(
    publicKey: string,
    limit: number = 100
  ): Promise<PaginatedResponse<CsprCloudDelegatorReward>> {
    return proxyFetch<PaginatedResponse<CsprCloudDelegatorReward>>(
      `/accounts/${publicKey}/delegation-rewards?limit=${limit}`
    );
  },

  /**
   * Get total delegation rewards for account
   */
  async getTotalDelegationRewards(publicKey: string): Promise<{ data: number }> {
    return proxyFetch<{ data: number }>(`/accounts/${publicKey}/total-delegation-rewards`);
  },

  /**
   * Get account transfers
   */
  async getAccountTransfers(
    publicKey: string,
    limit: number = 50
  ): Promise<PaginatedResponse<CsprCloudTransfer>> {
    return proxyFetch<PaginatedResponse<CsprCloudTransfer>>(
      `/accounts/${publicKey}/transfers?limit=${limit}`
    );
  },

  /**
   * Calculate real network APY
   * Formula: APY = (total_supply * annual_inflation_rate) / total_staked
   * Casper has ~8% annual inflation
   */
  async calculateNetworkAPY(): Promise<number> {
    try {
      const [metricsResponse, supplyResponse] = await Promise.all([
        this.getAuctionMetrics(),
        this.getSupply()
      ]);

      const totalStakedMotes = BigInt(metricsResponse.data.total_active_era_stake);
      const totalStakedCSPR = Number(totalStakedMotes) / 1e9;
      const totalSupply = supplyResponse.data.total;

      // Casper annual inflation rate is approximately 8%
      const annualInflation = 0.08;
      const annualRewards = totalSupply * annualInflation;

      // APY = annual rewards / total staked * 100
      const apy = (annualRewards / totalStakedCSPR) * 100;

      return Math.round(apy * 100) / 100; // Round to 2 decimals
    } catch (error) {
      console.error('Failed to calculate APY:', error);
      return 10; // Fallback APY
    }
  }
};

/**
 * Helper to convert motes to CSPR
 */
export const motesToCSPR = (motes: string | number): number => {
  return Number(BigInt(motes)) / 1e9;
};

/**
 * Helper to format large numbers
 */
export const formatLargeNumber = (num: number): string => {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
};

export default csprCloudApi;
