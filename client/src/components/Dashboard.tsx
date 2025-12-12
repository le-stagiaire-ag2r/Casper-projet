import React, { useEffect, useState } from 'react';
import styled, { keyframes, useTheme } from 'styled-components';
import { useCsprClick } from '../hooks/useCsprClick';
import { useCsprPrice } from '../hooks/useBalance';
import { useBalanceContext } from '../context/BalanceContext';
import { PriceChart } from './PriceChart';
import { Tooltip } from './Tooltip';
import { colors, typography, spacing, layout, effects } from '../styles/designTokens';

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
  gap: ${spacing[5]};
  margin-bottom: ${spacing[8]};
`;

const Card = styled.div`
  background: ${colors.glass.medium};
  border-radius: ${layout.borderRadius.xl};
  padding: ${spacing[7]};
  border: 1px solid ${colors.border.default};
  backdrop-filter: blur(12px);
  transition: all ${effects.transition.normal};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${colors.accent.primary};
    opacity: 0;
    transition: opacity ${effects.transition.normal};
  }

  &:hover {
    transform: translateY(-4px);
    border-color: ${colors.accent.primary};
    box-shadow: ${effects.shadow.glow};

    &::before {
      opacity: 1;
    }
  }
`;

const CardIcon = styled.div`
  width: 48px;
  height: 48px;
  background: ${colors.accent.muted};
  border-radius: ${layout.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${spacing[4]};
  color: ${colors.accent.primary};

  svg {
    width: 24px;
    height: 24px;
  }
`;

const CardTitle = styled.h3`
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.xs};
  color: ${colors.text.tertiary};
  margin-bottom: ${spacing[3]};
  text-transform: uppercase;
  letter-spacing: ${typography.letterSpacing.wider};
  font-weight: ${typography.fontWeight.semibold};
`;

const CardValue = styled.div`
  font-family: ${typography.fontFamily.display};
  font-size: ${typography.fontSize['3xl']};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.text.primary};
  margin-bottom: ${spacing[2]};
  letter-spacing: ${typography.letterSpacing.tight};
`;

const CardSubtext = styled.div`
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.tertiary};
  font-weight: ${typography.fontWeight.medium};
`;

const LoadingSkeleton = styled.div`
  height: 36px;
  width: 120px;
  background: linear-gradient(
    90deg,
    ${colors.background.tertiary} 0%,
    ${colors.background.elevated} 50%,
    ${colors.background.tertiary} 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: ${layout.borderRadius.md};
  margin-bottom: ${spacing[2]};
`;

const ConnectPrompt = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing[2]};
  color: ${colors.text.tertiary};
  font-size: ${typography.fontSize.sm};
  animation: ${pulse} 2s infinite;
`;

const LiveIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing[2]};
  font-size: ${typography.fontSize.xs};
  color: ${colors.text.tertiary};
  margin-top: ${spacing[3]};

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    background: ${colors.status.success};
    border-radius: 50%;
    animation: ${pulse} 1.5s infinite;
  }
`;

const PortfolioSection = styled.div`
  margin-bottom: ${spacing[6]};
`;

const PortfolioTitle = styled.h3`
  font-family: ${typography.fontFamily.display};
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.secondary};
  margin-bottom: ${spacing[4]};
  text-transform: uppercase;
  letter-spacing: ${typography.letterSpacing.wider};
  font-weight: ${typography.fontWeight.semibold};
  display: flex;
  align-items: center;
  gap: ${spacing[2]};
`;

const LiveBadge = styled.span`
  font-size: ${typography.fontSize.xs};
  background: ${colors.status.successMuted};
  color: ${colors.status.success};
  padding: 2px 8px;
  border-radius: ${layout.borderRadius.sm};
  font-weight: ${typography.fontWeight.semibold};
`;

const PortfolioGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${spacing[4]};
`;

const PortfolioCard = styled.div<{ $highlight?: boolean }>`
  background: ${props => props.$highlight
    ? colors.glass.purple
    : colors.glass.medium};
  border-radius: ${layout.borderRadius.lg};
  padding: ${spacing[5]};
  border: 1px solid ${props => props.$highlight
    ? 'rgba(139, 92, 246, 0.3)'
    : colors.border.default};
  backdrop-filter: blur(12px);
  transition: all ${effects.transition.normal};

  &:hover {
    transform: translateY(-2px);
  }
`;

const PortfolioLabel = styled.div`
  font-size: ${typography.fontSize.xs};
  color: ${colors.text.tertiary};
  margin-bottom: ${spacing[2]};
  display: flex;
  align-items: center;
  gap: ${spacing[2]};
  text-transform: uppercase;
  letter-spacing: ${typography.letterSpacing.wide};
`;

const PortfolioValue = styled.div<{ $highlight?: boolean }>`
  font-family: ${typography.fontFamily.display};
  font-size: ${typography.fontSize['2xl']};
  font-weight: ${typography.fontWeight.bold};
  color: ${props => props.$highlight ? colors.accent.primary : colors.text.primary};
`;

const PortfolioSubtext = styled.div<{ $positive?: boolean }>`
  font-size: ${typography.fontSize.xs};
  color: ${props => props.$positive ? colors.status.success : colors.text.tertiary};
  margin-top: ${spacing[1]};
`;

const PriceChartWrapper = styled.div`
  margin-top: ${spacing[6]};
`;

// SVG Icons
interface IconProps {
  style?: React.CSSProperties;
}

const GlobeIcon: React.FC<IconProps> = ({ style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const WalletIcon: React.FC<IconProps> = ({ style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}>
    <path d="M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
    <circle cx="17" cy="12" r="2" />
  </svg>
);

const TrendingIcon: React.FC<IconProps> = ({ style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}>
    <path d="M23 6l-9.5 9.5-5-5L1 18" />
    <path d="M17 6h6v6" />
  </svg>
);

const ZapIcon: React.FC<IconProps> = ({ style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const CoinsIcon: React.FC<IconProps> = ({ style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}>
    <circle cx="8" cy="8" r="7" />
    <path d="M18.09 10.37A7 7 0 1 1 10.37 18.09" />
  </svg>
);

const DiamondIcon: React.FC<IconProps> = ({ style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}>
    <path d="M12 2L2 7l10 13L22 7z" />
    <path d="M2 7h20" />
    <path d="M12 22V7" />
  </svg>
);

const LinkIcon: React.FC<IconProps> = ({ style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const DollarIcon: React.FC<IconProps> = ({ style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const FIXED_APY = 0.17;

export const Dashboard: React.FC = () => {
  const { activeAccount } = useCsprClick();
  const theme = useTheme() as any;
  const isDark = theme?.mode === 'dark';
  const [loading, setLoading] = useState(true);

  const { csprBalance, stCsprBalance, isLoading: balanceLoading, isRealBalance } = useBalanceContext();
  const { usdPrice, usdChange24h, isLoading: priceLoading } = useCsprPrice();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const estimatedYearlyRewards = stCsprBalance * FIXED_APY;

  return (
    <>
      {activeAccount && (
        <PortfolioSection>
          <PortfolioTitle>
            Your Portfolio
            {isRealBalance && <LiveBadge>Live</LiveBadge>}
          </PortfolioTitle>
          <PortfolioGrid>
            <PortfolioCard>
              <PortfolioLabel>
                <CoinsIcon style={{ width: 14, height: 14 }} />
                Available CSPR
              </PortfolioLabel>
              <PortfolioValue>
                {balanceLoading ? '...' : csprBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} CSPR
              </PortfolioValue>
              <PortfolioSubtext>
                {usdPrice > 0 && `≈ $${(csprBalance * usdPrice).toFixed(2)} USD`}
                {!usdPrice && 'Ready to stake'}
              </PortfolioSubtext>
            </PortfolioCard>

            <PortfolioCard $highlight={stCsprBalance > 0}>
              <PortfolioLabel>
                <DiamondIcon style={{ width: 14, height: 14 }} />
                Staked (stCSPR)
                <Tooltip
                  isDark={isDark}
                  title="stCSPR Token"
                  content="stCSPR is a liquid staking token. When you stake CSPR, you receive stCSPR at a 1:1 ratio."
                />
              </PortfolioLabel>
              <PortfolioValue $highlight={stCsprBalance > 0}>
                {stCsprBalance.toLocaleString()} stCSPR
              </PortfolioValue>
              <PortfolioSubtext>Earning rewards</PortfolioSubtext>
            </PortfolioCard>

            <PortfolioCard $highlight={estimatedYearlyRewards > 0}>
              <PortfolioLabel>
                <TrendingIcon style={{ width: 14, height: 14 }} />
                Est. Yearly Rewards
                <Tooltip
                  isDark={isDark}
                  title="APY"
                  content="APY represents the annualized return on your staked tokens."
                />
              </PortfolioLabel>
              <PortfolioValue $highlight={estimatedYearlyRewards > 0}>
                +{estimatedYearlyRewards.toFixed(1)} CSPR
              </PortfolioValue>
              <PortfolioSubtext>At ~{(FIXED_APY * 100).toFixed(0)}% APY</PortfolioSubtext>
            </PortfolioCard>

            <PortfolioCard>
              <PortfolioLabel>
                <DollarIcon style={{ width: 14, height: 14 }} />
                CSPR Price
              </PortfolioLabel>
              <PortfolioValue>
                {priceLoading ? '...' : `$${usdPrice.toFixed(4)}`}
              </PortfolioValue>
              <PortfolioSubtext $positive={usdChange24h >= 0}>
                {usdChange24h >= 0 ? '↑' : '↓'} {Math.abs(usdChange24h).toFixed(2)}% (24h)
              </PortfolioSubtext>
            </PortfolioCard>
          </PortfolioGrid>

          <PriceChartWrapper>
            <PriceChart isDark={isDark} />
          </PriceChartWrapper>
        </PortfolioSection>
      )}

      <Container>
        <Card>
          <CardIcon><GlobeIcon /></CardIcon>
          <CardTitle>Network</CardTitle>
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <CardValue>Testnet</CardValue>
              <CardSubtext>Casper Network</CardSubtext>
              <LiveIndicator>Connected</LiveIndicator>
            </>
          )}
        </Card>

        <Card>
          <CardIcon><WalletIcon /></CardIcon>
          <CardTitle>Wallet Status</CardTitle>
          {loading ? (
            <LoadingSkeleton />
          ) : activeAccount ? (
            <>
              <CardValue>Connected</CardValue>
              <CardSubtext>
                {activeAccount.publicKey?.substring(0, 8)}...{activeAccount.publicKey?.substring(activeAccount.publicKey.length - 6)}
              </CardSubtext>
            </>
          ) : (
            <ConnectPrompt>
              <LinkIcon style={{ width: 16, height: 16 }} />
              Connect via top bar
            </ConnectPrompt>
          )}
        </Card>

        <Card>
          <CardIcon><TrendingIcon /></CardIcon>
          <CardTitle>Staking APY</CardTitle>
          <CardValue>~{(FIXED_APY * 100).toFixed(0)}%</CardValue>
          <CardSubtext>Casper Network Average</CardSubtext>
        </Card>

        <Card>
          <CardIcon><ZapIcon /></CardIcon>
          <CardTitle>Protocol</CardTitle>
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <CardValue>StakeVue</CardValue>
              <CardSubtext>Liquid Staking</CardSubtext>
              <LiveIndicator>Active</LiveIndicator>
            </>
          )}
        </Card>
      </Container>
    </>
  );
};

export default Dashboard;
