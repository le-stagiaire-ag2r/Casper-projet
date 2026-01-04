import React from 'react';
import styled, { keyframes, useTheme } from 'styled-components';
import { useContractData } from '../hooks/useContractData';

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

const Container = styled.div<{ $isDark: boolean }>`
  background: rgba(20, 10, 30, 0.6);
  border-radius: 24px;
  padding: 24px;
  border: 1px solid rgba(139, 92, 246, 0.2);
  backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;
`;

const VersionBadge = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background: linear-gradient(135deg, #5856d6 0%, #af52de 100%);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const LiveDot = styled.span`
  width: 6px;
  height: 6px;
  background: #30d158;
  border-radius: 50%;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const Title = styled.h3<{ $isDark: boolean }>`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TitleIcon = styled.span`
  font-size: 24px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div<{ $isDark: boolean; $highlight?: boolean }>`
  background: ${props => props.$highlight
    ? 'rgba(139, 92, 246, 0.15)'
    : 'rgba(20, 10, 30, 0.5)'};
  border-radius: 16px;
  padding: 16px;
  border: 1px solid ${props => props.$highlight
    ? 'rgba(139, 92, 246, 0.3)'
    : 'rgba(255, 255, 255, 0.08)'};
  backdrop-filter: blur(8px);
`;

const StatLabel = styled.div<{ $isDark: boolean }>`
  font-size: 12px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StatValue = styled.div<{ $isDark: boolean; $color?: string }>`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.$color || (props.$isDark ? '#fff' : '#1a1a2e')};
`;

const StatSubtext = styled.div<{ $isDark: boolean }>`
  font-size: 12px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.4)'
    : 'rgba(0, 0, 0, 0.4)'};
  margin-top: 4px;
`;

const RateChangeIndicator = styled.span<{ $positive: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${props => props.$positive ? '#30d158' : '#ff453a'};
  background: ${props => props.$positive
    ? 'rgba(48, 209, 88, 0.15)'
    : 'rgba(255, 69, 58, 0.15)'};
  padding: 2px 8px;
  border-radius: 6px;
  margin-left: 8px;
`;

const Description = styled.p<{ $isDark: boolean }>`
  font-size: 13px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  margin-top: 16px;
  line-height: 1.5;
  padding-top: 16px;
  border-top: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.05)'};
`;

export const V15StatsCard: React.FC = () => {
  const theme = useTheme() as any;
  const isDark = theme?.mode === 'dark';
  const {
    exchangeRate,
    totalPool,
    totalStcspr,
    lastUpdated,
    isLive,
    isLoading,
    refresh,
  } = useContractData();

  // Format values
  const formatCspr = (motes: string) => {
    const cspr = Number(BigInt(motes || '0')) / 1_000_000_000;
    if (cspr >= 1_000_000) {
      return `${(cspr / 1_000_000).toFixed(2)}M`;
    } else if (cspr >= 1_000) {
      return `${(cspr / 1_000).toFixed(2)}K`;
    }
    return cspr.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  // Estimated APY based on Casper testnet staking rewards
  const estimatedAPY = '2.35';

  const rateChange = ((exchangeRate - 1) * 100);

  return (
    <Container $isDark={isDark}>
      <VersionBadge style={{ background: isLive ? 'linear-gradient(135deg, #30d158 0%, #5856d6 100%)' : 'linear-gradient(135deg, #ff9f0a 0%, #ff2d55 100%)' }}>
        <LiveDot style={{ background: isLive ? '#30d158' : '#ff9f0a' }} />
        {isLive ? 'LIVE' : 'CACHED'}
      </VersionBadge>

      <Title $isDark={isDark}>
        <TitleIcon></TitleIcon>
        Contract Statistics
        <button
          onClick={refresh}
          disabled={isLoading}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: isLoading ? 'wait' : 'pointer',
            fontSize: '16px',
            marginLeft: '8px',
            opacity: isLoading ? 0.5 : 1,
          }}
          title="Refresh from blockchain"
        >
          
        </button>
      </Title>

      <StatsGrid>
        <StatCard $isDark={isDark} $highlight>
          <StatLabel $isDark={isDark}>
            Exchange Rate
          </StatLabel>
          <StatValue $isDark={isDark} $color="#30d158">
            {exchangeRate.toFixed(4)}
            {rateChange !== 0 && (
              <RateChangeIndicator $positive={rateChange > 0}>
                {rateChange > 0 ? '↑' : '↓'} {Math.abs(rateChange).toFixed(2)}%
              </RateChangeIndicator>
            )}
          </StatValue>
          <StatSubtext $isDark={isDark}>
            1 stCSPR = {exchangeRate.toFixed(4)} CSPR
          </StatSubtext>
        </StatCard>

        <StatCard $isDark={isDark}>
          <StatLabel $isDark={isDark}>
            Total Value Locked (TVL)
          </StatLabel>
          <StatValue $isDark={isDark}>
            {formatCspr(totalPool)} CSPR
          </StatValue>
          <StatSubtext $isDark={isDark}>
            In staking pool
          </StatSubtext>
        </StatCard>

        <StatCard $isDark={isDark}>
          <StatLabel $isDark={isDark}>
            stCSPR Supply
          </StatLabel>
          <StatValue $isDark={isDark}>
            {formatCspr(totalStcspr)}
          </StatValue>
          <StatSubtext $isDark={isDark}>
            Liquid staking tokens
          </StatSubtext>
        </StatCard>

        <StatCard $isDark={isDark}>
          <StatLabel $isDark={isDark}>
            Estimated APY
          </StatLabel>
          <StatValue $isDark={isDark} $color="#5856d6">
            ~{estimatedAPY}%
          </StatValue>
          <StatSubtext $isDark={isDark}>
            Based on rewards
          </StatSubtext>
        </StatCard>
      </StatsGrid>

      <Description $isDark={isDark}>
        V15 introduces the exchange rate mechanism. When rewards are added to the pool,
        the rate increases, making each stCSPR worth more CSPR over time.
        {lastUpdated && (
          <> Last updated: {lastUpdated.toLocaleTimeString()}</>
        )}
      </Description>
    </Container>
  );
};

export default V15StatsCard;
