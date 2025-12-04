import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const Container = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.03)'
    : 'rgba(255, 255, 255, 0.8)'};
  border-radius: 20px;
  padding: 24px;
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.08)'};
  backdrop-filter: blur(20px);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h3<{ $isDark: boolean }>`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
`;

const RefreshButton = styled.button<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.05)'};
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.7)'
    : 'rgba(0, 0, 0, 0.7)'};
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$isDark
      ? 'rgba(255, 255, 255, 0.15)'
      : 'rgba(0, 0, 0, 0.1)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Table = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TableHeader = styled.div<{ $isDark: boolean }>`
  display: grid;
  grid-template-columns: 40px 1fr 80px 80px 80px 80px;
  gap: 12px;
  padding: 12px 16px;
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.03)'};
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableRow = styled.div<{ $isDark: boolean; $rank: number }>`
  display: grid;
  grid-template-columns: 40px 1fr 80px 80px 80px 80px;
  gap: 12px;
  padding: 14px 16px;
  background: ${props => {
    if (props.$rank === 1) return props.$isDark
      ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%)'
      : 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%)';
    if (props.$rank === 2) return props.$isDark
      ? 'linear-gradient(135deg, rgba(192, 192, 192, 0.15) 0%, rgba(192, 192, 192, 0.05) 100%)'
      : 'linear-gradient(135deg, rgba(192, 192, 192, 0.2) 0%, rgba(192, 192, 192, 0.1) 100%)';
    if (props.$rank === 3) return props.$isDark
      ? 'linear-gradient(135deg, rgba(205, 127, 50, 0.15) 0%, rgba(205, 127, 50, 0.05) 100%)'
      : 'linear-gradient(135deg, rgba(205, 127, 50, 0.2) 0%, rgba(205, 127, 50, 0.1) 100%)';
    return props.$isDark
      ? 'rgba(255, 255, 255, 0.02)'
      : 'rgba(0, 0, 0, 0.02)';
  }};
  border-radius: 12px;
  align-items: center;
  transition: all 0.2s ease;
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.05)'};

  &:hover {
    background: ${props => props.$isDark
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.05)'};
    transform: translateX(4px);
  }
`;

const Rank = styled.div<{ $rank: number }>`
  font-size: 16px;
  font-weight: 700;
  color: ${props => {
    if (props.$rank === 1) return '#ffd700';
    if (props.$rank === 2) return '#c0c0c0';
    if (props.$rank === 3) return '#cd7f32';
    return '#888';
  }};
`;

const ValidatorInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const ValidatorName = styled.div<{ $isDark: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ValidatorAddress = styled.div<{ $isDark: boolean }>`
  font-size: 11px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.4)'
    : 'rgba(0, 0, 0, 0.4)'};
  font-family: monospace;
`;

const StatValue = styled.div<{ $isDark: boolean; $highlight?: boolean }>`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.$highlight
    ? '#30d158'
    : props.$isDark ? '#fff' : '#1a1a2e'};
  text-align: right;
`;

const StatusBadge = styled.span<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 6px;
  background: ${props => props.$active
    ? 'rgba(48, 209, 88, 0.2)'
    : 'rgba(255, 69, 58, 0.2)'};
  color: ${props => props.$active ? '#30d158' : '#ff453a'};

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
`;

const LoadingRow = styled.div<{ $isDark: boolean }>`
  height: 60px;
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.03)'};
  border-radius: 12px;
  background-image: linear-gradient(
    90deg,
    transparent,
    ${props => props.$isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'},
    transparent
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

const ErrorMessage = styled.div<{ $isDark: boolean }>`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  font-size: 14px;
`;

const LastUpdated = styled.div<{ $isDark: boolean }>`
  text-align: center;
  margin-top: 16px;
  font-size: 11px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.4)'
    : 'rgba(0, 0, 0, 0.4)'};
`;

interface Validator {
  publicKey: string;
  name: string;
  stake: number;
  delegators: number;
  commission: number;
  apy: number;
  isActive: boolean;
}

interface ValidatorRankingProps {
  isDark: boolean;
}

// Simulated validators data (in production, fetch from CSPR.cloud API)
const MOCK_VALIDATORS: Validator[] = [
  { publicKey: '01a5c...8f2d', name: 'Casper Labs', stake: 125000000, delegators: 1250, commission: 5, apy: 11.2, isActive: true },
  { publicKey: '01b7e...4a1c', name: 'BitCat', stake: 98000000, delegators: 890, commission: 8, apy: 10.8, isActive: true },
  { publicKey: '01c9f...2b3e', name: 'HashQuark', stake: 87000000, delegators: 756, commission: 10, apy: 10.5, isActive: true },
  { publicKey: '01d2a...5c4f', name: 'StakeVue Official', stake: 72000000, delegators: 623, commission: 3, apy: 11.8, isActive: true },
  { publicKey: '01e4b...7d6a', name: 'CryptoStake', stake: 65000000, delegators: 542, commission: 12, apy: 9.9, isActive: true },
  { publicKey: '01f6c...9e8b', name: 'ValidatorX', stake: 54000000, delegators: 421, commission: 15, apy: 9.2, isActive: true },
  { publicKey: '01a8d...1f2c', name: 'NodeGuard', stake: 43000000, delegators: 356, commission: 7, apy: 10.9, isActive: true },
  { publicKey: '01b9e...3a4d', name: 'StakePool Pro', stake: 32000000, delegators: 289, commission: 20, apy: 8.5, isActive: false },
];

export const ValidatorRanking: React.FC<ValidatorRankingProps> = ({ isDark }) => {
  const [validators, setValidators] = useState<Validator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchValidators = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // In production, fetch from:
      // const response = await fetch('https://api.testnet.cspr.cloud/validators?page=1&page_size=10');

      // Sort by APY (highest first)
      const sorted = [...MOCK_VALIDATORS].sort((a, b) => b.apy - a.apy);
      setValidators(sorted);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to load validators');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchValidators();

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchValidators, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatStake = (stake: number): string => {
    if (stake >= 1000000) {
      return `${(stake / 1000000).toFixed(1)}M`;
    }
    if (stake >= 1000) {
      return `${(stake / 1000).toFixed(0)}K`;
    }
    return stake.toFixed(0);
  };

  return (
    <Container $isDark={isDark}>
      <Header>
        <Title $isDark={isDark}>
          🏆 Top Validators
        </Title>
        <RefreshButton
          $isDark={isDark}
          onClick={fetchValidators}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : '↻ Refresh'}
        </RefreshButton>
      </Header>

      {error ? (
        <ErrorMessage $isDark={isDark}>
          {error}
        </ErrorMessage>
      ) : (
        <>
          <Table>
            <TableHeader $isDark={isDark}>
              <div>#</div>
              <div>Validator</div>
              <div style={{ textAlign: 'right' }}>Stake</div>
              <div style={{ textAlign: 'right' }}>APY</div>
              <div style={{ textAlign: 'right' }}>Fee</div>
              <div style={{ textAlign: 'right' }}>Status</div>
            </TableHeader>

            {isLoading ? (
              <>
                {[1, 2, 3, 4, 5].map(i => (
                  <LoadingRow key={i} $isDark={isDark} />
                ))}
              </>
            ) : (
              validators.slice(0, 8).map((validator, index) => (
                <TableRow key={validator.publicKey} $isDark={isDark} $rank={index + 1}>
                  <Rank $rank={index + 1}>
                    {index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : index + 1 === 3 ? '🥉' : index + 1}
                  </Rank>
                  <ValidatorInfo>
                    <ValidatorName $isDark={isDark}>{validator.name}</ValidatorName>
                    <ValidatorAddress $isDark={isDark}>{validator.publicKey}</ValidatorAddress>
                  </ValidatorInfo>
                  <StatValue $isDark={isDark}>
                    {formatStake(validator.stake)}
                  </StatValue>
                  <StatValue $isDark={isDark} $highlight>
                    {validator.apy.toFixed(1)}%
                  </StatValue>
                  <StatValue $isDark={isDark}>
                    {validator.commission}%
                  </StatValue>
                  <div>
                    <StatusBadge $active={validator.isActive}>
                      {validator.isActive ? 'Active' : 'Inactive'}
                    </StatusBadge>
                  </div>
                </TableRow>
              ))
            )}
          </Table>

          {lastUpdated && (
            <LastUpdated $isDark={isDark}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </LastUpdated>
          )}
        </>
      )}
    </Container>
  );
};

export default ValidatorRanking;
