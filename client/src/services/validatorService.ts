/**
 * Validator Service for StakeVue V17
 * Fetches approved validators from contract and enriches with CSPR.cloud data
 */

import { csprCloudApi, CsprCloudValidator, motesToCSPR, formatLargeNumber } from './csprCloud';

// Simplified validator info for UI
export interface ValidatorInfo {
  publicKey: string;
  name: string;
  logo?: string;
  website?: string;
  // Staking info
  commission: number; // percentage (e.g., 10 = 10%)
  performance: number; // 0-100 score
  totalStake: number; // in CSPR
  totalStakeFormatted: string; // "1.5M CSPR"
  delegatorsCount: number;
  // Calculated
  estimatedAPY: number; // after commission
  rank: number;
  isActive: boolean;
  // For comparison
  selfStakePercent: number;
  networkSharePercent: number;
  minDelegation: number; // in CSPR
}

// Sort options for validator list
export type ValidatorSortOption =
  | 'performance'
  | 'commission'
  | 'totalStake'
  | 'apy'
  | 'delegators'
  | 'rank';

/**
 * Get enriched validator info for approved validators
 * @param approvedPublicKeys - Array of public keys approved in contract
 * @param baseAPY - Network base APY (before commission)
 */
export const getApprovedValidatorsInfo = async (
  approvedPublicKeys: string[],
  baseAPY: number = 10
): Promise<ValidatorInfo[]> => {
  try {
    // Get current era validators from CSPR.cloud
    const metricsResponse = await csprCloudApi.getAuctionMetrics();
    const currentEra = metricsResponse.data.current_era_id;

    const validatorsResponse = await csprCloudApi.getValidators(currentEra, 200);
    const allValidators = validatorsResponse.data;

    // Filter to only approved validators
    // Normalize public keys: remove "hash-" prefix, lowercase, trim
    const normalizeKey = (pk: string) => pk.replace(/^(hash-|account-hash-)/i, '').toLowerCase().trim();
    const approvedSet = new Set(approvedPublicKeys.map(normalizeKey));

    console.log('[ValidatorService] Approved validators:', approvedPublicKeys.length);
    console.log('[ValidatorService] Total validators from API:', allValidators.length);

    const enrichedValidators: ValidatorInfo[] = [];

    for (const validator of allValidators) {
      const normalizedApiKey = normalizeKey(validator.public_key);

      if (!approvedSet.has(normalizedApiKey)) {
        continue;
      }

      console.log('[ValidatorService] Found approved validator:', validator.public_key);

      const info = validator.account_info?.info?.owner;
      const perf = validator.average_performance;

      // Calculate APY after commission
      const commissionPercent = validator.fee;
      const estimatedAPY = baseAPY * (1 - commissionPercent / 100);

      enrichedValidators.push({
        publicKey: validator.public_key,
        name: info?.name || shortenPublicKey(validator.public_key),
        logo: info?.branding?.logo?.png_256 || info?.branding?.logo?.svg,
        website: info?.website,
        commission: commissionPercent,
        performance: perf?.score || 100,
        totalStake: motesToCSPR(validator.total_stake),
        totalStakeFormatted: formatLargeNumber(motesToCSPR(validator.total_stake)) + ' CSPR',
        delegatorsCount: validator.delegators_number,
        estimatedAPY: Math.round(estimatedAPY * 100) / 100,
        rank: validator.rank,
        isActive: validator.is_active,
        selfStakePercent: Math.round(validator.self_share * 100) / 100,
        networkSharePercent: Math.round(validator.network_share * 10000) / 100,
        minDelegation: motesToCSPR(validator.minimum_delegation_amount),
      });
    }

    console.log('[ValidatorService] Enriched validators count:', enrichedValidators.length);

    // If no validators found but we have approved keys, create placeholder entries
    if (enrichedValidators.length === 0 && approvedPublicKeys.length > 0) {
      console.warn('[ValidatorService] No validators matched from API. Creating placeholders.');

      // Create placeholder validators so users can still select them
      for (let i = 0; i < Math.min(approvedPublicKeys.length, 5); i++) {
        const pk = approvedPublicKeys[i];
        enrichedValidators.push({
          publicKey: pk,
          name: `Validator ${i + 1}`,
          commission: 10,
          performance: 100,
          totalStake: 0,
          totalStakeFormatted: 'N/A',
          delegatorsCount: 0,
          estimatedAPY: baseAPY * 0.9,
          rank: i + 1,
          isActive: true,
          selfStakePercent: 0,
          networkSharePercent: 0,
          minDelegation: 500,
        });
      }
    }

    return enrichedValidators;
  } catch (error) {
    console.error('[ValidatorService] Error fetching validators:', error);

    // Return placeholder validators on error so users can still stake
    if (approvedPublicKeys.length > 0) {
      console.warn('[ValidatorService] Returning placeholder validators due to error');
      return approvedPublicKeys.slice(0, 5).map((pk, i) => ({
        publicKey: pk,
        name: `Validator ${i + 1}`,
        commission: 10,
        performance: 100,
        totalStake: 0,
        totalStakeFormatted: 'N/A',
        delegatorsCount: 0,
        estimatedAPY: baseAPY * 0.9,
        rank: i + 1,
        isActive: true,
        selfStakePercent: 0,
        networkSharePercent: 0,
        minDelegation: 500,
      }));
    }

    throw error;
  }
};

/**
 * Sort validators by criteria
 */
export const sortValidators = (
  validators: ValidatorInfo[],
  sortBy: ValidatorSortOption,
  ascending: boolean = false
): ValidatorInfo[] => {
  const sorted = [...validators].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'performance':
        comparison = b.performance - a.performance;
        break;
      case 'commission':
        comparison = a.commission - b.commission; // Lower is better
        break;
      case 'totalStake':
        comparison = b.totalStake - a.totalStake;
        break;
      case 'apy':
        comparison = b.estimatedAPY - a.estimatedAPY;
        break;
      case 'delegators':
        comparison = b.delegatorsCount - a.delegatorsCount;
        break;
      case 'rank':
        comparison = a.rank - b.rank; // Lower rank is better
        break;
    }

    return ascending ? -comparison : comparison;
  });

  return sorted;
};

/**
 * Get recommended validator (best APY with good performance)
 */
export const getRecommendedValidator = (validators: ValidatorInfo[]): ValidatorInfo | null => {
  if (validators.length === 0) return null;

  // Score = APY * (performance/100) - prioritize high APY with good performance
  return validators.reduce((best, current) => {
    const bestScore = best.estimatedAPY * (best.performance / 100);
    const currentScore = current.estimatedAPY * (current.performance / 100);
    return currentScore > bestScore ? current : best;
  });
};

/**
 * Filter validators by criteria
 */
export const filterValidators = (
  validators: ValidatorInfo[],
  filters: {
    minPerformance?: number;
    maxCommission?: number;
    minStake?: number;
    activeOnly?: boolean;
  }
): ValidatorInfo[] => {
  return validators.filter(v => {
    if (filters.minPerformance && v.performance < filters.minPerformance) return false;
    if (filters.maxCommission && v.commission > filters.maxCommission) return false;
    if (filters.minStake && v.totalStake < filters.minStake) return false;
    if (filters.activeOnly && !v.isActive) return false;
    return true;
  });
};

/**
 * Helper to shorten public key for display
 */
const shortenPublicKey = (publicKey: string): string => {
  if (publicKey.length <= 16) return publicKey;
  return `${publicKey.slice(0, 8)}...${publicKey.slice(-6)}`;
};

/**
 * Format validator for display card
 */
export const formatValidatorCard = (validator: ValidatorInfo): {
  title: string;
  subtitle: string;
  badges: string[];
  stats: { label: string; value: string }[];
} => {
  const badges: string[] = [];

  if (validator.performance >= 99) badges.push('🏆 Top Performance');
  if (validator.commission <= 5) badges.push('💰 Low Fee');
  if (validator.rank <= 10) badges.push('⭐ Top 10');
  if (validator.delegatorsCount >= 100) badges.push('👥 Popular');

  return {
    title: validator.name,
    subtitle: shortenPublicKey(validator.publicKey),
    badges,
    stats: [
      { label: 'APY', value: `${validator.estimatedAPY.toFixed(1)}%` },
      { label: 'Commission', value: `${validator.commission}%` },
      { label: 'Performance', value: `${validator.performance}%` },
      { label: 'Total Staked', value: validator.totalStakeFormatted },
      { label: 'Delegators', value: validator.delegatorsCount.toLocaleString() },
      { label: 'Rank', value: `#${validator.rank}` },
    ],
  };
};

export default {
  getApprovedValidatorsInfo,
  sortValidators,
  filterValidators,
  getRecommendedValidator,
  formatValidatorCard,
};
