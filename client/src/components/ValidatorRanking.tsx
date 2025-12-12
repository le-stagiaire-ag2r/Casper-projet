import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { csprCloudApi, isProxyAvailable, motesToCSPR } from '../services/csprCloud';

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
  background: rgba(167, 139, 250, 0.15);
  color: #a78bfa;
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
  display: flex;
  align-items: center;
  gap: 4px;
`;

const CopyButton = styled.button<{ $isDark: boolean }>`
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  font-size: 10px;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'};
  transition: all 0.2s ease;

  &:hover {
    color: ${props => props.$isDark ? '#fff' : '#000'};
  }
`;

// Standardized public key format: 01ab...cdef (6 + 4)
const formatPublicKey = (key: string): string => {
  if (!key || key.length < 12) return key;
  return `${key.substring(0, 6)}...${key.substring(key.length - 4)}`;
};

const StatValue = styled.div<{ $isDark: boolean; $highlight?: boolean }>`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.$highlight
    ? '#a78bfa'
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
    ? 'rgba(167, 139, 250, 0.2)'
    : 'rgba(244, 114, 182, 0.2)'};
  color: ${props => props.$active ? '#a78bfa' : '#f472b6'};

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

// Realistic fallback data based on actual Casper mainnet validators
const FALLBACK_VALIDATORS: Validator[] = [
  { publicKey: '01c37...81af7', name: 'Casper Delegation', stake: 1_083_531_006, delegators: 1199, fee: 3, isActive: true },
  { publicKey: '01922...4e225', name: 'Casper Staking', stake: 759_525_017, delegators: 1200, fee: 0, isActive: true },
  { publicKey: '01bf4...b14b4', name: 'Everstake', stake: 450_051_366, delegators: 960, fee: 10, isActive: true },
  { publicKey: '0169e...022bc', name: 'Casperian', stake: 359_260_710, delegators: 1200, fee: 0, isActive: true },
  { publicKey: '01abc...stake', name: 'Swiss Stake', stake: 155_552_695, delegators: 1009, fee: 3, isActive: true },
  { publicKey: '01786...f782a', name: 'TWS Staking', stake: 154_023_204, delegators: 468, fee: 3, isActive: true },
  { publicKey: '012ba...6e69b', name: 'Everstake 2', stake: 151_810_161, delegators: 1295, fee: 10, isActive: true },
  { publicKey: '01000...beeee', name: 'Stakepire', stake: 141_769_336, delegators: 718, fee: 5, isActive: true },
  { publicKey: '01e68...318e6', name: 'Casper Validator', stake: 134_252_030, delegators: 470, fee: 1, isActive: true },
  { publicKey: '0103d...99a45', name: 'Casper Black Staking', stake: 131_157_435, delegators: 687, fee: 0, isActive: true },
];

export const ValidatorRanking: React.FC<ValidatorRankingProps> = ({ isDark }) => {
  const [validators, setValidators] = useState<Validator[]>(FALLBACK_VALIDATORS);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const fetchFromCsprCloud = useCallback(async (): Promise<Validator[] | null> => {
    if (!isProxyAvailable()) {
      console.log('CSPR.click proxy not available for validators');
      return null;
    }

    try {
      // First get current era from auction metrics
      const metricsResponse = await csprCloudApi.getAuctionMetrics();
      const currentEraId = metricsResponse.data.current_era_id;

      // Fetch validators for current era
      const validatorsResponse = await csprCloudApi.getValidators(currentEraId, 10);

      return validatorsResponse.data.map((v) => {
        // Extract name from account_info if available
        const name = v.account_info?.info?.owner?.name ||
                     `Validator ${v.public_key.substring(0, 8)}...`;

        return {
          publicKey: v.public_key,
          name,
          stake: motesToCSPR(v.total_stake),
          delegators: v.delegators_number,
          fee: v.fee,
          isActive: v.is_active,
        };
      });
    } catch (error) {
      console.error('Failed to fetch validators from CSPR.cloud:', error);
      return null;
    }
  }, []);

  const fetchFromAPI = useCallback(async (): Promise<Validator[] | null> => {
    try {
      const response = await fetch('/api/validators?limit=10');
      if (response.ok) {
        const data = await response.json();
        if (data.validators?.length > 0) {
          return data.validators.slice(0, 10).map((v: any) => ({
            publicKey: v.publicKey || 'unknown',
            name: v.name,
            stake: v.stake,
            delegators: v.delegators,
            fee: v.fee,
            isActive: v.isActive,
          }));
        }
      }
    } catch (error) {
      console.log('API fallback failed for validators');
    }
    return null;
  }, []);

  useEffect(() => {
    const fetchValidators = async () => {
      setIsLoading(true);

      // First try CSPR.cloud via proxy (real live data)
      const proxyValidators = await fetchFromCsprCloud();
      if (proxyValidators && proxyValidators.length > 0) {
        setValidators(proxyValidators);
        setIsLive(true);
        setIsLoading(false);
        return;
      }

      // Fallback to our API proxy
      const apiValidators = await fetchFromAPI();
      if (apiValidators && apiValidators.length > 0) {
        setValidators(apiValidators);
        setIsLive(true);
        setIsLoading(false);
        return;
      }

      // Use fallback data
      setValidators(FALLBACK_VALIDATORS);
      setIsLive(false);
      setIsLoading(false);
    };

    fetchValidators();
    const interval = setInterval(fetchValidators, 60000);
    return () => clearInterval(interval);
  }, [fetchFromCsprCloud, fetchFromAPI]);

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
          🏆 Top Validators <LiveBadge>{isLive ? 'LIVE' : 'DEMO'}</LiveBadge>
        </Title>
      </Header>

      <Table>
        <TableHeader $isDark={isDark}>
          <div>#</div>
          <div>Validator</div>
          <div style={{ textAlign: 'right' }}>Total Stake</div>
          <div style={{ textAlign: 'right' }}>Delegators</div>
          <div style={{ textAlign: 'right' }} className="hide-mobile">Fee</div>
          <div style={{ textAlign: 'right' }} className="hide-mobile">Status</div>
        </TableHeader>

        {validators.map((validator, index) => (
          <TableRow key={validator.publicKey} $isDark={isDark} $rank={index + 1}>
            <Rank $rank={index + 1}>
              {index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : index + 1 === 3 ? '🥉' : index + 1}
            </Rank>
            <ValidatorInfo>
              <ValidatorName $isDark={isDark}>{validator.name}</ValidatorName>
              <ValidatorAddress $isDark={isDark}>
                {formatPublicKey(validator.publicKey)}
                {isLive && (
                  <CopyButton
                    $isDark={isDark}
                    onClick={() => copyToClipboard(validator.publicKey)}
                    title="Copy full address"
                  >
                    {copiedKey === validator.publicKey ? '✓' : '📋'}
                  </CopyButton>
                )}
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
        ))}
      </Table>

      <DataSource $isDark={isDark}>
        📡 Data from Casper Mainnet
      </DataSource>
    </Container>
  );
};

export default ValidatorRanking;
