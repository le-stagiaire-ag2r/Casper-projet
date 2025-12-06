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

const LiveBadge = styled.span`
  font-size: 10px;
  background: rgba(48, 209, 88, 0.15);
  color: #30d158;
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: 600;
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
  grid-template-columns: 40px 1fr 90px 90px 90px 80px;
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

  @media (max-width: 768px) {
    grid-template-columns: 30px 1fr 70px 70px;
  }
`;

const TableRow = styled.div<{ $isDark: boolean; $rank: number }>`
  display: grid;
  grid-template-columns: 40px 1fr 90px 90px 90px 80px;
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

  @media (max-width: 768px) {
    grid-template-columns: 30px 1fr 70px 70px;
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

  @media (max-width: 768px) {
    &.hide-mobile {
      display: none;
    }
  }
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

  @media (max-width: 768px) {
    display: none;
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

const DataSource = styled.div<{ $isDark: boolean }>`
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
  fee: number;
  isActive: boolean;
}

interface ValidatorRankingProps {
  isDark: boolean;
}

export const ValidatorRanking: React.FC<ValidatorRankingProps> = ({ isDark }) => {
  const [validators, setValidators] = useState<Validator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchValidators = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        'https://event-store-api-clarity-mainnet.make.services/validators?page=1&limit=10&order_direction=DESC&order_by=total_stake'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch validators');
      }

      const data = await response.json();

      const transformedValidators: Validator[] = data.data.map((v: any) => ({
        publicKey: v.public_key,
        name: v.account_info?.info?.owner?.name ||
              `Validator ${v.public_key.substring(0, 8)}...`,
        stake: parseFloat(v.total_stake) / 1e9,
        delegators: v.delegators_number || 0,
        fee: v.fee ? v.fee / 100 : 0,
        isActive: v.is_active,
      }));

      setValidators(transformedValidators);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Error fetching validators:', err);
      setError('Failed to load validators. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchValidators();
    const interval = setInterval(fetchValidators, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatStake = (stake: number): string => {
    if (stake >= 1_000_000_000) {
      return `${(stake / 1_000_000_000).toFixed(2)}B`;
    }
    if (stake >= 1_000_000) {
      return `${(stake / 1_000_000).toFixed(1)}M`;
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
          🏆 Top Validators <LiveBadge>LIVE</LiveBadge>
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
              <div style={{ textAlign: 'right' }}>Total Stake</div>
              <div style={{ textAlign: 'right' }}>Delegators</div>
              <div style={{ textAlign: 'right' }} className="hide-mobile">Fee</div>
              <div style={{ textAlign: 'right' }} className="hide-mobile">Status</div>
            </TableHeader>

            {isLoading ? (
              <>
                {[1, 2, 3, 4, 5].map(i => (
                  <LoadingRow key={i} $isDark={isDark} />
                ))}
              </>
            ) : (
              validators.map((validator, index) => (
                <TableRow key={validator.publicKey} $isDark={isDark} $rank={index + 1}>
                  <Rank $rank={index + 1}>
                    {index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : index + 1 === 3 ? '🥉' : index + 1}
                  </Rank>
                  <ValidatorInfo>
                    <ValidatorName $isDark={isDark}>{validator.name}</ValidatorName>
                    <ValidatorAddress $isDark={isDark}>
                      {validator.publicKey.substring(0, 12)}...
                    </ValidatorAddress>
                  </ValidatorInfo>
                  <StatValue $isDark={isDark}>
                    {formatStake(validator.stake)}
                  </StatValue>
                  <StatValue $isDark={isDark}>
                    {validator.delegators.toLocaleString()}
                  </StatValue>
                  <StatValue $isDark={isDark} className="hide-mobile">
                    {validator.fee}%
                  </StatValue>
                  <div className="hide-mobile">
                    <StatusBadge $active={validator.isActive}>
                      {validator.isActive ? 'Active' : 'Inactive'}
                    </StatusBadge>
                  </div>
                </TableRow>
              ))
            )}
          </Table>

          <DataSource $isDark={isDark}>
            📡 Live data from Casper Mainnet
            {lastUpdated && ` • ${lastUpdated.toLocaleTimeString()}`}
          </DataSource>
        </>
      )}
    </Container>
  );
};

export default ValidatorRanking;
