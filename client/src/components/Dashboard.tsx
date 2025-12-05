import React, { useEffect, useState } from 'react';
import styled, { keyframes, useTheme } from 'styled-components';
import { useCsprClick } from '../hooks/useCsprClick';
import { useCsprPrice } from '../hooks/useBalance';
import { useBalanceContext } from '../context/BalanceContext';
import { PriceChart } from './PriceChart';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const Card = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.03)'
    : 'rgba(255, 255, 255, 0.8)'};
  border-radius: 20px;
  padding: 28px;
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.08)'};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: ${props => props.$isDark
    ? 'none'
    : '0 4px 20px rgba(0, 0, 0, 0.08)'};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #ff2d55, #5856d6, #af52de);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px);
    border-color: ${props => props.$isDark
      ? 'rgba(255, 255, 255, 0.15)'
      : 'rgba(88, 86, 214, 0.3)'};
    box-shadow: ${props => props.$isDark
      ? '0 20px 40px rgba(0, 0, 0, 0.3)'
      : '0 20px 40px rgba(88, 86, 214, 0.15)'};

    &::before {
      opacity: 1;
    }
  }
`;

const CardIcon = styled.div`
  font-size: 28px;
  margin-bottom: 16px;
`;

const CardTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 13px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 600;
`;

const CardValue = styled.div<{ $isDark: boolean }>`
  font-size: 36px;
  font-weight: 800;
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%)'
    : 'linear-gradient(135deg, #1a1a2e 0%, #5856d6 100%)'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  letter-spacing: -1px;
`;

const CardSubtext = styled.div<{ $isDark: boolean }>`
  font-size: 14px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.4)'
    : 'rgba(0, 0, 0, 0.4)'};
  font-weight: 500;
`;

const LoadingSkeleton = styled.div<{ $isDark: boolean }>`
  height: 36px;
  width: 120px;
  background: ${props => props.$isDark
    ? 'linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 100%)'
    : 'linear-gradient(90deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.05) 100%)'};
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 8px;
  margin-bottom: 8px;
`;

const ConnectPrompt = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.4)'
    : 'rgba(0, 0, 0, 0.4)'};
  font-size: 14px;
  animation: ${pulse} 2s infinite;
`;

const APYBadge = styled.span`
  display: inline-block;
  background: linear-gradient(135deg, #30d158 0%, #34c759 100%);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  margin-left: 8px;
  vertical-align: middle;
`;

const LiveIndicator = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.4)'
    : 'rgba(0, 0, 0, 0.4)'};
  margin-top: 12px;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    background: #30d158;
    border-radius: 50%;
    animation: ${pulse} 1.5s infinite;
  }
`;

const DemoTag = styled.span<{ $isDark: boolean }>`
  display: inline-block;
  background: ${props => props.$isDark
    ? 'rgba(255, 159, 10, 0.2)'
    : 'rgba(255, 159, 10, 0.15)'};
  color: #ff9f0a;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  margin-left: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PortfolioSection = styled.div`
  margin-bottom: 24px;
`;

const PortfolioTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 14px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(0, 0, 0, 0.6)'};
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
`;

const PortfolioGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const PortfolioCard = styled.div<{ $isDark: boolean; $highlight?: boolean }>`
  background: ${props => props.$highlight
    ? 'linear-gradient(135deg, rgba(48, 209, 88, 0.1) 0%, rgba(88, 86, 214, 0.1) 100%)'
    : props.$isDark
      ? 'rgba(255, 255, 255, 0.03)'
      : 'rgba(255, 255, 255, 0.8)'};
  border-radius: 16px;
  padding: 20px;
  border: 1px solid ${props => props.$highlight
    ? 'rgba(48, 209, 88, 0.2)'
    : props.$isDark
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.08)'};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const PortfolioLabel = styled.div<{ $isDark: boolean }>`
  font-size: 12px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PortfolioValue = styled.div<{ $isDark: boolean; $highlight?: boolean }>`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.$highlight
    ? '#30d158'
    : props.$isDark ? '#fff' : '#1a1a2e'};
`;

const PortfolioSubtext = styled.div<{ $isDark: boolean }>`
  font-size: 11px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.4)'
    : 'rgba(0, 0, 0, 0.4)'};
  margin-top: 4px;
`;

const PriceChartWrapper = styled.div`
  margin-top: 24px;
`;

const APY_AVG = 0.17; // 17%

export const Dashboard: React.FC = () => {
  const { activeAccount } = useCsprClick();
  const theme = useTheme() as any;
  const isDark = theme?.mode === 'dark';
  const [loading, setLoading] = useState(true);

  // Use shared balance context
  const { csprBalance, stCsprBalance, isLoading: balanceLoading, isRealBalance } = useBalanceContext();
  const { usdPrice, usdChange24h, isLoading: priceLoading } = useCsprPrice();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Calculate estimated rewards
  const estimatedYearlyRewards = stCsprBalance * APY_AVG;

  return (
    <>
      {/* Portfolio Summary - only show when connected */}
      {activeAccount && (
        <PortfolioSection>
          <PortfolioTitle $isDark={isDark}>
            📊 Your Portfolio
            {isRealBalance && (
              <span style={{
                fontSize: '10px',
                background: 'rgba(48, 209, 88, 0.2)',
                color: '#30d158',
                padding: '2px 8px',
                borderRadius: '4px',
                marginLeft: '8px',
                fontWeight: 600
              }}>
                LIVE
              </span>
            )}
          </PortfolioTitle>
          <PortfolioGrid>
            <PortfolioCard $isDark={isDark}>
              <PortfolioLabel $isDark={isDark}>
                💰 Available CSPR
              </PortfolioLabel>
              <PortfolioValue $isDark={isDark}>
                {balanceLoading ? '...' : csprBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} CSPR
              </PortfolioValue>
              <PortfolioSubtext $isDark={isDark}>
                {usdPrice > 0 && `≈ $${(csprBalance * usdPrice).toFixed(2)} USD`}
                {!usdPrice && 'Ready to stake'}
              </PortfolioSubtext>
            </PortfolioCard>

            <PortfolioCard $isDark={isDark} $highlight={stCsprBalance > 0}>
              <PortfolioLabel $isDark={isDark}>
                💎 Staked (stCSPR)
              </PortfolioLabel>
              <PortfolioValue $isDark={isDark} $highlight={stCsprBalance > 0}>
                {stCsprBalance.toLocaleString()} stCSPR
              </PortfolioValue>
              <PortfolioSubtext $isDark={isDark}>Earning rewards</PortfolioSubtext>
            </PortfolioCard>

            <PortfolioCard $isDark={isDark} $highlight={estimatedYearlyRewards > 0}>
              <PortfolioLabel $isDark={isDark}>
                📈 Est. Yearly Rewards
              </PortfolioLabel>
              <PortfolioValue $isDark={isDark} $highlight={estimatedYearlyRewards > 0}>
                +{estimatedYearlyRewards.toFixed(1)} CSPR
              </PortfolioValue>
              <PortfolioSubtext $isDark={isDark}>At ~10% APY</PortfolioSubtext>
            </PortfolioCard>

            <PortfolioCard $isDark={isDark}>
              <PortfolioLabel $isDark={isDark}>
                💵 CSPR Price
              </PortfolioLabel>
              <PortfolioValue $isDark={isDark}>
                {priceLoading ? '...' : `$${usdPrice.toFixed(4)}`}
              </PortfolioValue>
              <PortfolioSubtext $isDark={isDark} style={{
                color: usdChange24h >= 0 ? '#30d158' : '#ff453a'
              }}>
                {usdChange24h >= 0 ? '↑' : '↓'} {Math.abs(usdChange24h).toFixed(2)}% (24h)
              </PortfolioSubtext>
            </PortfolioCard>
          </PortfolioGrid>

          {/* Price Chart */}
          <PriceChartWrapper>
            <PriceChart isDark={isDark} />
          </PriceChartWrapper>
        </PortfolioSection>
      )}

    <Container>
      <Card $isDark={isDark}>
        <CardIcon>🌐</CardIcon>
        <CardTitle $isDark={isDark}>Network</CardTitle>
        {loading ? (
          <LoadingSkeleton $isDark={isDark} />
        ) : (
          <>
            <CardValue $isDark={isDark}>Testnet</CardValue>
            <CardSubtext $isDark={isDark}>Casper Network</CardSubtext>
            <LiveIndicator $isDark={isDark}>Connected</LiveIndicator>
          </>
        )}
      </Card>

      <Card $isDark={isDark}>
        <CardIcon>💳</CardIcon>
        <CardTitle $isDark={isDark}>Wallet Status</CardTitle>
        {loading ? (
          <LoadingSkeleton $isDark={isDark} />
        ) : activeAccount ? (
          <>
            <CardValue $isDark={isDark}>Connected</CardValue>
            <CardSubtext $isDark={isDark}>
              {activeAccount.publicKey?.substring(0, 8)}...{activeAccount.publicKey?.substring(activeAccount.publicKey.length - 6)}
            </CardSubtext>
          </>
        ) : (
          <ConnectPrompt $isDark={isDark}>
            <span>🔗</span> Connect via top bar
          </ConnectPrompt>
        )}
      </Card>

      <Card $isDark={isDark}>
        <CardIcon>📈</CardIcon>
        <CardTitle $isDark={isDark}>
          Staking APY
          <DemoTag $isDark={isDark}>Demo</DemoTag>
        </CardTitle>
        <CardValue $isDark={isDark}>
          ~15-18%
          <APYBadge>EST.</APYBadge>
        </CardValue>
        <CardSubtext $isDark={isDark}>Casper Network Average</CardSubtext>
      </Card>

      <Card $isDark={isDark}>
        <CardIcon>⚡</CardIcon>
        <CardTitle $isDark={isDark}>Protocol</CardTitle>
        {loading ? (
          <LoadingSkeleton $isDark={isDark} />
        ) : (
          <>
            <CardValue $isDark={isDark}>StakeVue</CardValue>
            <CardSubtext $isDark={isDark}>Liquid Staking</CardSubtext>
            <LiveIndicator $isDark={isDark}>Active</LiveIndicator>
          </>
        )}
      </Card>
    </Container>
    </>
  );
};
