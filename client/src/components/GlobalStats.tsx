import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Tooltip } from './Tooltip';
import { csprCloudApi, isProxyAvailable, motesToCSPR } from '../services/csprCloud';

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const Container = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, rgba(88, 86, 214, 0.1) 0%, rgba(255, 45, 85, 0.1) 100%)'
    : 'linear-gradient(135deg, rgba(88, 86, 214, 0.08) 0%, rgba(255, 45, 85, 0.08) 100%)'};
  border-radius: 24px;
  padding: 32px;
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.$isDark
    ? 'rgba(88, 86, 214, 0.2)'
    : 'rgba(88, 86, 214, 0.15)'};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #5856d6, #ff2d55, #af52de);
  }
`;

const Title = styled.h2<{ $isDark: boolean }>`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LiveBadge = styled.span<{ $isLive?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${props => props.$isLive !== false
    ? 'rgba(48, 209, 88, 0.15)'
    : 'rgba(255, 159, 10, 0.15)'};
  color: ${props => props.$isLive !== false ? '#30d158' : '#ff9f0a'};
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  text-transform: uppercase;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    background: ${props => props.$isLive !== false ? '#30d158' : '#ff9f0a'};
    border-radius: 50%;
    animation: ${pulse} 1.5s infinite;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
`;

const StatCard = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.03)'
    : 'rgba(255, 255, 255, 0.8)'};
  border-radius: 16px;
  padding: 20px;
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.05)'};
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.div`
  font-size: 24px;
  margin-bottom: 12px;
`;

const StatLabel = styled.div<{ $isDark: boolean }>`
  font-size: 12px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StatValue = styled.div<{ $isDark: boolean; $highlight?: boolean }>`
  font-size: 28px;
  font-weight: 800;
  color: ${props => props.$highlight
    ? '#30d158'
    : props.$isDark ? '#fff' : '#1a1a2e'};
  letter-spacing: -1px;
`;

const StatSubtext = styled.div<{ $isDark: boolean; $positive?: boolean }>`
  font-size: 12px;
  color: ${props => props.$positive
    ? '#30d158'
    : props.$isDark
      ? 'rgba(255, 255, 255, 0.4)'
      : 'rgba(0, 0, 0, 0.4)'};
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const NetworkInfo = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.08)'};
`;

const NetworkItem = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(0, 0, 0, 0.6)'};
`;

const NetworkValue = styled.span<{ $isDark: boolean }>`
  font-weight: 600;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
`;

const DataSource = styled.div<{ $isDark: boolean }>`
  margin-top: 16px;
  font-size: 0.7rem;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'};
  text-align: right;
`;

const LoadingText = styled.span`
  opacity: 0.5;
`;

interface GlobalStatsProps {
  isDark: boolean;
}

interface NetworkStats {
  totalStaked: number;
  activeValidators: number;
  totalDelegators: number;
  currentEra: number;
  csprPrice: number;
  circulatingSupply: number;
  stakingRatio: number;
}

// Fallback data based on cspr.live (Dec 2024)
const FALLBACK_STATS: NetworkStats = {
  totalStaked: 6_971_726_448,
  activeValidators: 88,
  totalDelegators: 18773,
  currentEra: 15234,
  csprPrice: 0.0057,
  circulatingSupply: 12_000_000_000,
  stakingRatio: 58.1,
};

export const GlobalStats: React.FC<GlobalStatsProps> = ({ isDark }) => {
  const [stats, setStats] = useState<NetworkStats>(FALLBACK_STATS);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const fetchStatsFromProxy = useCallback(async () => {
    // Try to use CSPR.click proxy for real CSPR.cloud data
    if (!isProxyAvailable()) {
      console.log('CSPR.click proxy not available, using fallback');
      return null;
    }

    try {
      // Fetch auction metrics (TVL, validator count, era)
      const metricsResponse = await csprCloudApi.getAuctionMetrics();
      const metrics = metricsResponse.data;

      // Fetch supply data
      const supplyResponse = await csprCloudApi.getSupply();
      const supply = supplyResponse.data;

      // Fetch current CSPR price
      let csprPrice = FALLBACK_STATS.csprPrice;
      try {
        const rateResponse = await csprCloudApi.getCurrentRate(1); // USD
        csprPrice = rateResponse.data.amount;
      } catch (e) {
        console.log('Price fetch failed, using fallback');
      }

      // Get validators to count total delegators
      let totalDelegators = FALLBACK_STATS.totalDelegators;
      try {
        const validatorsResponse = await csprCloudApi.getValidators(metrics.current_era_id, 100);
        totalDelegators = validatorsResponse.data.reduce(
          (sum, v) => sum + (v.delegators_number || 0),
          0
        );
      } catch (e) {
        console.log('Validators fetch failed, using fallback delegators count');
      }

      const totalStaked = motesToCSPR(metrics.total_active_era_stake);
      const circulatingSupply = supply.circulating;
      const stakingRatio = (totalStaked / circulatingSupply) * 100;

      return {
        totalStaked,
        activeValidators: metrics.active_validator_number,
        totalDelegators,
        currentEra: metrics.current_era_id,
        csprPrice,
        circulatingSupply,
        stakingRatio,
      };
    } catch (error) {
      console.error('Failed to fetch from CSPR.cloud:', error);
      return null;
    }
  }, []);

  const fetchStatsFromAPI = useCallback(async () => {
    // Fallback: try our own API proxy
    try {
      const validatorsRes = await fetch('/api/validators?limit=100');
      const priceRes = await fetch('/api/price?days=1');

      let validatorStats = null;
      let priceData = null;

      if (validatorsRes.ok) {
        const data = await validatorsRes.json();
        if (data.stats) {
          validatorStats = data.stats;
        }
      }

      if (priceRes.ok) {
        const data = await priceRes.json();
        if (data.prices?.length > 0) {
          priceData = data.prices[data.prices.length - 1][1];
        } else if (data.price) {
          priceData = data.price;
        }
      }

      if (validatorStats) {
        const totalStaked = validatorStats.totalStaked;
        const circulatingSupply = FALLBACK_STATS.circulatingSupply;
        return {
          totalStaked,
          activeValidators: validatorStats.activeValidators,
          totalDelegators: validatorStats.totalDelegators,
          currentEra: FALLBACK_STATS.currentEra,
          csprPrice: priceData || FALLBACK_STATS.csprPrice,
          circulatingSupply,
          stakingRatio: (totalStaked / circulatingSupply) * 100,
        };
      }
    } catch (error) {
      console.log('API fallback failed');
    }
    return null;
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);

      // First try CSPR.cloud via proxy (real live data)
      const proxyStats = await fetchStatsFromProxy();
      if (proxyStats) {
        setStats(proxyStats);
        setIsLive(true);
        setLoading(false);
        return;
      }

      // Fallback to our API proxy
      const apiStats = await fetchStatsFromAPI();
      if (apiStats) {
        setStats(apiStats);
        setIsLive(true);
        setLoading(false);
        return;
      }

      // Use fallback data
      setStats(FALLBACK_STATS);
      setIsLive(false);
      setLoading(false);
    };

    fetchStats();

    // Refresh every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [fetchStatsFromProxy, fetchStatsFromAPI]);

  const formatNumber = (num: number, decimals: number = 0) => {
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(2) + 'B';
    }
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(2) + 'M';
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(1) + 'K';
    }
    return num.toFixed(decimals);
  };

  const formatUSD = (cspr: number, price: number) => {
    const usd = cspr * price;
    if (usd >= 1_000_000_000) return '$' + (usd / 1_000_000_000).toFixed(2) + 'B';
    if (usd >= 1_000_000) return '$' + (usd / 1_000_000).toFixed(1) + 'M';
    return '$' + formatNumber(usd);
  };

  if (loading || !stats) {
    return (
      <Container $isDark={isDark}>
        <Title $isDark={isDark}>
          <span>📊</span>
          Casper Network Statistics
          <LiveBadge>Loading...</LiveBadge>
        </Title>
        <StatsGrid>
          {[1, 2, 3, 4].map(i => (
            <StatCard key={i} $isDark={isDark}>
              <StatIcon>⏳</StatIcon>
              <StatLabel $isDark={isDark}>Loading</StatLabel>
              <StatValue $isDark={isDark}>
                <LoadingText>--</LoadingText>
              </StatValue>
            </StatCard>
          ))}
        </StatsGrid>
      </Container>
    );
  }

  return (
    <Container $isDark={isDark}>
      <Title $isDark={isDark}>
        <span>📊</span>
        Casper Network Statistics
        <LiveBadge $isLive={isLive}>{isLive ? 'LIVE' : 'DEMO'}</LiveBadge>
      </Title>

      <StatsGrid>
        <StatCard $isDark={isDark}>
          <StatIcon>💰</StatIcon>
          <StatLabel $isDark={isDark}>Total Staked</StatLabel>
          <StatValue $isDark={isDark}>
            {formatNumber(stats.totalStaked)} CSPR
          </StatValue>
          <StatSubtext $isDark={isDark}>
            {formatUSD(stats.totalStaked, stats.csprPrice)} USD
          </StatSubtext>
        </StatCard>

        <StatCard $isDark={isDark}>
          <StatIcon>✅</StatIcon>
          <StatLabel $isDark={isDark}>
            Active Validators
            <Tooltip
              isDark={isDark}
              title="Validators"
              content="Validators are nodes that participate in the consensus mechanism. They validate transactions and create new blocks. More validators means better decentralization and security."
            />
          </StatLabel>
          <StatValue $isDark={isDark}>
            {stats.activeValidators}
          </StatValue>
          <StatSubtext $isDark={isDark}>
            Securing the network
          </StatSubtext>
        </StatCard>

        <StatCard $isDark={isDark}>
          <StatIcon>👥</StatIcon>
          <StatLabel $isDark={isDark}>
            Total Delegators
            <Tooltip
              isDark={isDark}
              title="Delegators"
              content="Delegators are users who stake their CSPR tokens with validators. They earn staking rewards proportional to their stake, minus the validator's commission fee."
            />
          </StatLabel>
          <StatValue $isDark={isDark}>
            {formatNumber(stats.totalDelegators)}
          </StatValue>
          <StatSubtext $isDark={isDark}>
            Active stakers
          </StatSubtext>
        </StatCard>

        <StatCard $isDark={isDark}>
          <StatIcon>📈</StatIcon>
          <StatLabel $isDark={isDark}>
            Staking Ratio
            <Tooltip
              isDark={isDark}
              title="Staking Ratio"
              content="The percentage of total circulating CSPR that is currently staked. A higher ratio indicates more network participation and generally better security for the blockchain."
            />
          </StatLabel>
          <StatValue $isDark={isDark} $highlight>
            {stats.stakingRatio.toFixed(1)}%
          </StatValue>
          <StatSubtext $isDark={isDark}>
            Of circulating supply
          </StatSubtext>
        </StatCard>
      </StatsGrid>

      <NetworkInfo $isDark={isDark}>
        <NetworkItem $isDark={isDark}>
          <span>🌐</span>
          Network:
          <NetworkValue $isDark={isDark}>Casper Mainnet</NetworkValue>
        </NetworkItem>
        <NetworkItem $isDark={isDark}>
          <span>💵</span>
          CSPR Price:
          <NetworkValue $isDark={isDark}>${stats.csprPrice.toFixed(4)}</NetworkValue>
        </NetworkItem>
        <NetworkItem $isDark={isDark}>
          <span>🔄</span>
          Supply:
          <NetworkValue $isDark={isDark}>{formatNumber(stats.circulatingSupply)}</NetworkValue>
        </NetworkItem>
        <NetworkItem $isDark={isDark}>
          <span>⏱️</span>
          Era Time:
          <NetworkValue $isDark={isDark}>~2 hours</NetworkValue>
        </NetworkItem>
      </NetworkInfo>

      <DataSource $isDark={isDark}>
        📡 {isLive ? 'Live data from Casper API' : 'Fallback data from cspr.live'}
      </DataSource>
    </Container>
  );
};

export default GlobalStats;
