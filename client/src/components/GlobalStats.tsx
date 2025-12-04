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

interface GlobalStatsProps {
  isDark: boolean;
}

export const GlobalStats: React.FC<GlobalStatsProps> = ({ isDark }) => {
  // Demo stats - in production, these would be fetched from the protocol
  const [stats, setStats] = useState({
    tvl: 2450000,
    totalStakers: 1247,
    avgApy: 10.2,
    totalRewards: 245000,
    validators: 8,
    networkParticipation: 62.4
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        tvl: prev.tvl + Math.random() * 100 - 50,
        totalStakers: prev.totalStakers + (Math.random() > 0.7 ? 1 : 0),
        totalRewards: prev.totalRewards + Math.random() * 10
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number, decimals: number = 0) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(decimals);
  };

  return (
    <Container $isDark={isDark}>
      <Title $isDark={isDark}>
        <span>📊</span>
        Protocol Statistics
        <LiveBadge>Live</LiveBadge>
      </Title>

      <StatsGrid>
        <StatCard $isDark={isDark}>
          <StatIcon>💰</StatIcon>
          <StatLabel $isDark={isDark}>Total Value Locked</StatLabel>
          <StatValue $isDark={isDark}>
            {formatNumber(stats.tvl)} CSPR
          </StatValue>
          <StatSubtext $isDark={isDark} $positive>
            ↑ +12.5% this week
          </StatSubtext>
        </StatCard>

        <StatCard $isDark={isDark}>
          <StatIcon>👥</StatIcon>
          <StatLabel $isDark={isDark}>Active Stakers</StatLabel>
          <StatValue $isDark={isDark}>
            {stats.totalStakers.toLocaleString()}
          </StatValue>
          <StatSubtext $isDark={isDark} $positive>
            ↑ +23 this week
          </StatSubtext>
        </StatCard>

        <StatCard $isDark={isDark}>
          <StatIcon>📈</StatIcon>
          <StatLabel $isDark={isDark}>Average APY</StatLabel>
          <StatValue $isDark={isDark} $highlight>
            {stats.avgApy.toFixed(1)}%
          </StatValue>
          <StatSubtext $isDark={isDark}>
            Range: 8-12%
          </StatSubtext>
        </StatCard>

        <StatCard $isDark={isDark}>
          <StatIcon>🎁</StatIcon>
          <StatLabel $isDark={isDark}>Total Rewards Paid</StatLabel>
          <StatValue $isDark={isDark}>
            {formatNumber(stats.totalRewards)} CSPR
          </StatValue>
          <StatSubtext $isDark={isDark}>
            To all stakers
          </StatSubtext>
        </StatCard>
      </StatsGrid>

      <NetworkInfo $isDark={isDark}>
        <NetworkItem $isDark={isDark}>
          <span>🌐</span>
          Network:
          <NetworkValue $isDark={isDark}>Casper Testnet</NetworkValue>
        </NetworkItem>
        <NetworkItem $isDark={isDark}>
          <span>⚡</span>
          Validators:
          <NetworkValue $isDark={isDark}>{stats.validators} Active</NetworkValue>
        </NetworkItem>
        <NetworkItem $isDark={isDark}>
          <span>🔗</span>
          Network Participation:
          <NetworkValue $isDark={isDark}>{stats.networkParticipation}%</NetworkValue>
        </NetworkItem>
        <NetworkItem $isDark={isDark}>
          <span>⏱️</span>
          Era Time:
          <NetworkValue $isDark={isDark}>~1 hour</NetworkValue>
        </NetworkItem>
      </NetworkInfo>
    </Container>
  );
};

export default GlobalStats;
