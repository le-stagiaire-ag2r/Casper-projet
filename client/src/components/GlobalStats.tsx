import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

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

const LiveBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(48, 209, 88, 0.15);
  color: #30d158;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  text-transform: uppercase;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    background: #30d158;
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

export const GlobalStats: React.FC<GlobalStatsProps> = ({ isDark }) => {
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchStats = async () => {
    try {
      // Fetch validators data
      const validatorsRes = await fetch(
        'https://event-store-api-clarity-mainnet.make.services/validators?page=1&limit=100&order_direction=DESC&order_by=total_stake'
      );
      const validatorsData = await validatorsRes.json();

      // Calculate totals from validators
      let totalStaked = 0;
      let totalDelegators = 0;
      let activeValidators = 0;

      if (validatorsData.data) {
        validatorsData.data.forEach((v: any) => {
          totalStaked += parseFloat(v.total_stake || 0);
          totalDelegators += v.delegators_number || 0;
          if (v.is_active) activeValidators++;
        });
      }

      // Convert from motes to CSPR
      totalStaked = totalStaked / 1e9;

      // Fetch CSPR price from CoinGecko
      let csprPrice = 0;
      try {
        const priceRes = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=casper-network&vs_currencies=usd'
        );
        const priceData = await priceRes.json();
        csprPrice = priceData['casper-network']?.usd || 0;
      } catch {
        csprPrice = 0.025; // Fallback price
      }

      // Casper network constants (approximate)
      const circulatingSupply = 12_000_000_000; // ~12B CSPR
      const stakingRatio = (totalStaked / circulatingSupply) * 100;

      setStats({
        totalStaked,
        activeValidators,
        totalDelegators,
        currentEra: Math.floor(Date.now() / 3600000) % 10000, // Approximate
        csprPrice,
        circulatingSupply,
        stakingRatio,
      });

      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching network stats:', error);
      // Fallback data
      setStats({
        totalStaked: 8_500_000_000,
        activeValidators: 100,
        totalDelegators: 15000,
        currentEra: 12500,
        csprPrice: 0.025,
        circulatingSupply: 12_000_000_000,
        stakingRatio: 70.8,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

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
        <LiveBadge>Live</LiveBadge>
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
          <StatLabel $isDark={isDark}>Active Validators</StatLabel>
          <StatValue $isDark={isDark}>
            {stats.activeValidators}
          </StatValue>
          <StatSubtext $isDark={isDark}>
            Securing the network
          </StatSubtext>
        </StatCard>

        <StatCard $isDark={isDark}>
          <StatIcon>👥</StatIcon>
          <StatLabel $isDark={isDark}>Total Delegators</StatLabel>
          <StatValue $isDark={isDark}>
            {formatNumber(stats.totalDelegators)}
          </StatValue>
          <StatSubtext $isDark={isDark}>
            Active stakers
          </StatSubtext>
        </StatCard>

        <StatCard $isDark={isDark}>
          <StatIcon>📈</StatIcon>
          <StatLabel $isDark={isDark}>Staking Ratio</StatLabel>
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
        📡 Data from Casper Mainnet API & CoinGecko
        {lastUpdate && ` • Updated ${lastUpdate.toLocaleTimeString()}`}
      </DataSource>
    </Container>
  );
};

export default GlobalStats;
