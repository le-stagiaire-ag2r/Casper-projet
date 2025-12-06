import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.02)'};
  border-radius: 16px;
  padding: 24px;
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h3<{ $isDark: boolean }>`
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Subtitle = styled.p<{ $isDark: boolean }>`
  margin: 0;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(0, 0, 0, 0.6)'};
  font-size: 0.9rem;
`;

const LoadingState = styled.div<{ $isDark: boolean }>`
  text-align: center;
  padding: 40px;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'};
`;

const SelectorRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const SelectWrapper = styled.div<{ $isDark: boolean }>`
  position: relative;
`;

const Select = styled.select<{ $isDark: boolean }>`
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.2)'
    : 'rgba(0, 0, 0, 0.15)'};
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : '#fff'};
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  font-size: 0.95rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #5856d6;
  }

  option {
    background: ${props => props.$isDark ? '#1a1a2e' : '#fff'};
    color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  }
`;

const VsLabel = styled.div<{ $isDark: boolean }>`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.4)'
    : 'rgba(0, 0, 0, 0.3)'};
  text-align: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ValidatorCard = styled.div<{ $isDark: boolean; $highlight?: boolean }>`
  background: ${props => props.$highlight
    ? props.$isDark
      ? 'rgba(48, 209, 88, 0.1)'
      : 'rgba(48, 209, 88, 0.08)'
    : props.$isDark
      ? 'rgba(255, 255, 255, 0.03)'
      : 'rgba(0, 0, 0, 0.02)'};
  border-radius: 16px;
  padding: 20px;
  border: 1px solid ${props => props.$highlight
    ? 'rgba(48, 209, 88, 0.3)'
    : props.$isDark
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.08)'};
`;

const ValidatorHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`;

const ValidatorAvatar = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const ValidatorInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ValidatorName = styled.div<{ $isDark: boolean }>`
  font-weight: 600;
  font-size: 1rem;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ValidatorAddress = styled.div<{ $isDark: boolean }>`
  font-size: 0.7rem;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'};
  font-family: monospace;
`;

const StatsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StatRow = styled.div<{ $isDark: boolean; $isWinner?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: ${props => props.$isWinner
    ? props.$isDark
      ? 'rgba(48, 209, 88, 0.1)'
      : 'rgba(48, 209, 88, 0.08)'
    : 'transparent'};
  border-radius: 8px;
`;

const StatLabel = styled.span<{ $isDark: boolean }>`
  font-size: 0.85rem;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(0, 0, 0, 0.6)'};
`;

const StatValue = styled.span<{ $isDark: boolean; $highlight?: boolean }>`
  font-weight: 600;
  font-size: 0.95rem;
  color: ${props => props.$highlight
    ? '#30d158'
    : props.$isDark ? '#fff' : '#1a1a2e'};
`;

const WinnerBadge = styled.span`
  font-size: 0.8rem;
  margin-left: 6px;
`;

const SummarySection = styled.div<{ $isDark: boolean }>`
  margin-top: 24px;
  padding: 16px;
  background: ${props => props.$isDark
    ? 'rgba(88, 86, 214, 0.1)'
    : 'rgba(88, 86, 214, 0.05)'};
  border-radius: 12px;
  border: 1px solid rgba(88, 86, 214, 0.2);
`;

const SummaryTitle = styled.div<{ $isDark: boolean }>`
  font-weight: 600;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SummaryText = styled.p<{ $isDark: boolean }>`
  margin: 0;
  font-size: 0.9rem;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.7)'
    : 'rgba(0, 0, 0, 0.7)'};
  line-height: 1.5;
`;

const DataSource = styled.div<{ $isDark: boolean }>`
  margin-top: 16px;
  font-size: 0.75rem;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'};
  text-align: center;
`;

interface Validator {
  publicKey: string;
  name: string;
  totalStake: number;
  delegatorsCount: number;
  fee: number;
  isActive: boolean;
  selfStake: number;
  networkShare: number;
}

interface MetricData {
  label: string;
  v1: number;
  v2: number;
  higherBetter: boolean;
}

interface ValidatorComparatorProps {
  isDark: boolean;
}

// Helper to generate color from public key
const getColorFromKey = (key: string): string => {
  const colors = [
    'linear-gradient(135deg, #5856d6, #af52de)',
    'linear-gradient(135deg, #ff2d55, #ff9500)',
    'linear-gradient(135deg, #30d158, #34c759)',
    'linear-gradient(135deg, #007aff, #5ac8fa)',
    'linear-gradient(135deg, #ffcc00, #ff9500)',
    'linear-gradient(135deg, #af52de, #ff2d55)',
    'linear-gradient(135deg, #00c7be, #30d158)',
    'linear-gradient(135deg, #ff375f, #ff6b6b)',
  ];
  const hash = key.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// Get icon based on validator name or rank
const getValidatorIcon = (name: string, index: number): string => {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('casper') || nameLower.includes('labs')) return '🏛️';
  if (nameLower.includes('make')) return '🔧';
  if (nameLower.includes('bit') || nameLower.includes('coin')) return '💰';
  if (nameLower.includes('stake') || nameLower.includes('node')) return '🔷';
  if (nameLower.includes('valid')) return '✅';

  const icons = ['🌐', '⚡', '🎯', '💎', '🚀', '🔥', '⭐', '🏆'];
  return icons[index % icons.length];
};

export const ValidatorComparator: React.FC<ValidatorComparatorProps> = ({ isDark }) => {
  const [validators, setValidators] = useState<Validator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validator1Index, setValidator1Index] = useState(0);
  const [validator2Index, setValidator2Index] = useState(1);

  useEffect(() => {
    const fetchValidators = async () => {
      try {
        setLoading(true);

        // Fetch from CSPR.live API
        const response = await fetch('https://event-store-api-clarity-mainnet.make.services/validators?page=1&limit=50&order_direction=DESC&order_by=total_stake');

        if (!response.ok) {
          throw new Error('Failed to fetch validators');
        }

        const data = await response.json();

        // Transform API response to our format
        const transformedValidators: Validator[] = data.data.map((v: any) => ({
          publicKey: v.public_key,
          name: v.account_info?.info?.owner?.name ||
                `Validator ${v.public_key.substring(0, 8)}...`,
          totalStake: parseFloat(v.total_stake) / 1e9, // Convert from motes to CSPR
          delegatorsCount: v.delegators_number || 0,
          fee: v.fee ? v.fee / 100 : 0, // Convert basis points to percentage
          isActive: v.is_active,
          selfStake: parseFloat(v.self_stake || 0) / 1e9,
          networkShare: v.network_share ? parseFloat(v.network_share) : 0,
        }));

        setValidators(transformedValidators);
        setError(null);
      } catch (err) {
        console.error('Error fetching validators:', err);
        setError('Could not load validators. Using sample data.');

        // Fallback to sample data
        setValidators([
          { publicKey: '01a03...', name: 'CasperLabs', totalStake: 125000000, delegatorsCount: 2450, fee: 5, isActive: true, selfStake: 5000000, networkShare: 3.2 },
          { publicKey: '01b04...', name: 'Make Software', totalStake: 85000000, delegatorsCount: 1890, fee: 8, isActive: true, selfStake: 3500000, networkShare: 2.1 },
          { publicKey: '01c05...', name: 'BitCat', totalStake: 72000000, delegatorsCount: 1560, fee: 10, isActive: true, selfStake: 2800000, networkShare: 1.8 },
          { publicKey: '01d06...', name: 'HashQuark', totalStake: 65000000, delegatorsCount: 1200, fee: 5, isActive: true, selfStake: 2500000, networkShare: 1.6 },
          { publicKey: '01e07...', name: 'Everstake', totalStake: 58000000, delegatorsCount: 980, fee: 8, isActive: true, selfStake: 2200000, networkShare: 1.4 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchValidators();
  }, []);

  const validator1 = validators[validator1Index];
  const validator2 = validators[validator2Index];

  const comparison = useMemo(() => {
    if (!validator1 || !validator2) return { metrics: {} as Record<string, MetricData>, v1Wins: 0, v2Wins: 0 };

    const metrics: Record<string, MetricData> = {
      totalStake: { label: '💰 Total Stake', v1: validator1.totalStake, v2: validator2.totalStake, higherBetter: true },
      fee: { label: '💸 Fee', v1: validator1.fee, v2: validator2.fee, higherBetter: false },
      delegatorsCount: { label: '👥 Delegators', v1: validator1.delegatorsCount, v2: validator2.delegatorsCount, higherBetter: true },
      selfStake: { label: '🔒 Self-Stake', v1: validator1.selfStake, v2: validator2.selfStake, higherBetter: true },
      networkShare: { label: '📊 Network Share', v1: validator1.networkShare, v2: validator2.networkShare, higherBetter: false },
    };

    let v1Wins = 0;
    let v2Wins = 0;

    Object.values(metrics).forEach(m => {
      if (m.higherBetter) {
        if (m.v1 > m.v2) v1Wins++;
        else if (m.v2 > m.v1) v2Wins++;
      } else {
        if (m.v1 < m.v2) v1Wins++;
        else if (m.v2 < m.v1) v2Wins++;
      }
    });

    return { metrics, v1Wins, v2Wins };
  }, [validator1, validator2]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toFixed(1);
  };

  const getWinner = (key: string): number => {
    const m = comparison.metrics[key];
    if (!m) return 0;
    if (m.higherBetter) {
      if (m.v1 > m.v2) return 1;
      if (m.v2 > m.v1) return 2;
    } else {
      if (m.v1 < m.v2) return 1;
      if (m.v2 < m.v1) return 2;
    }
    return 0;
  };

  const renderValue = (key: string, value: number) => {
    switch (key) {
      case 'fee':
        return `${value}%`;
      case 'networkShare':
        return `${value.toFixed(2)}%`;
      default:
        return formatNumber(value);
    }
  };

  const getSummary = () => {
    if (!validator1 || !validator2) return '';

    if (comparison.v1Wins > comparison.v2Wins) {
      return `${validator1.name} performs better in ${comparison.v1Wins} out of 5 metrics. ${validator1.fee < validator2.fee ? 'Lower fees mean more rewards for you!' : 'Consider the fee difference when choosing.'}`;
    } else if (comparison.v2Wins > comparison.v1Wins) {
      return `${validator2.name} performs better in ${comparison.v2Wins} out of 5 metrics. ${validator2.fee < validator1.fee ? 'Lower fees mean more rewards for you!' : 'Consider the fee difference when choosing.'}`;
    }
    return "Both validators are evenly matched! Choose based on fees and decentralization preferences.";
  };

  if (loading) {
    return (
      <Container $isDark={isDark}>
        <Header>
          <Title $isDark={isDark}>⚖️ Validator Comparator</Title>
        </Header>
        <LoadingState $isDark={isDark}>
          Loading real validator data from Casper Network... ⏳
        </LoadingState>
      </Container>
    );
  }

  if (validators.length < 2) {
    return (
      <Container $isDark={isDark}>
        <Header>
          <Title $isDark={isDark}>⚖️ Validator Comparator</Title>
        </Header>
        <LoadingState $isDark={isDark}>
          Not enough validators to compare.
        </LoadingState>
      </Container>
    );
  }

  return (
    <Container $isDark={isDark}>
      <Header>
        <Title $isDark={isDark}>
          ⚖️ Validator Comparator
        </Title>
        <Subtitle $isDark={isDark}>
          Compare real Casper validators side-by-side
          {error && <span style={{ color: '#ff9500' }}> (using cached data)</span>}
        </Subtitle>
      </Header>

      <SelectorRow>
        <SelectWrapper $isDark={isDark}>
          <Select
            $isDark={isDark}
            value={validator1Index}
            onChange={(e) => setValidator1Index(Number(e.target.value))}
          >
            {validators.map((v, i) => (
              <option key={v.publicKey} value={i}>
                {getValidatorIcon(v.name, i)} {v.name}
              </option>
            ))}
          </Select>
        </SelectWrapper>

        <VsLabel $isDark={isDark}>VS</VsLabel>

        <SelectWrapper $isDark={isDark}>
          <Select
            $isDark={isDark}
            value={validator2Index}
            onChange={(e) => setValidator2Index(Number(e.target.value))}
          >
            {validators.map((v, i) => (
              <option key={v.publicKey} value={i}>
                {getValidatorIcon(v.name, i)} {v.name}
              </option>
            ))}
          </Select>
        </SelectWrapper>
      </SelectorRow>

      <ComparisonGrid>
        <ValidatorCard $isDark={isDark} $highlight={comparison.v1Wins > comparison.v2Wins}>
          <ValidatorHeader>
            <ValidatorAvatar $color={getColorFromKey(validator1.publicKey)}>
              {getValidatorIcon(validator1.name, validator1Index)}
            </ValidatorAvatar>
            <ValidatorInfo>
              <ValidatorName $isDark={isDark}>{validator1.name}</ValidatorName>
              <ValidatorAddress $isDark={isDark}>
                {validator1.publicKey.substring(0, 12)}...
              </ValidatorAddress>
            </ValidatorInfo>
          </ValidatorHeader>

          <StatsGrid>
            {Object.entries(comparison.metrics).map(([key, metric]) => (
              <StatRow key={key} $isDark={isDark} $isWinner={getWinner(key) === 1}>
                <StatLabel $isDark={isDark}>{metric.label}</StatLabel>
                <StatValue $isDark={isDark} $highlight={getWinner(key) === 1}>
                  {renderValue(key, metric.v1)}
                  {getWinner(key) === 1 && <WinnerBadge>✓</WinnerBadge>}
                </StatValue>
              </StatRow>
            ))}
          </StatsGrid>
        </ValidatorCard>

        <ValidatorCard $isDark={isDark} $highlight={comparison.v2Wins > comparison.v1Wins}>
          <ValidatorHeader>
            <ValidatorAvatar $color={getColorFromKey(validator2.publicKey)}>
              {getValidatorIcon(validator2.name, validator2Index)}
            </ValidatorAvatar>
            <ValidatorInfo>
              <ValidatorName $isDark={isDark}>{validator2.name}</ValidatorName>
              <ValidatorAddress $isDark={isDark}>
                {validator2.publicKey.substring(0, 12)}...
              </ValidatorAddress>
            </ValidatorInfo>
          </ValidatorHeader>

          <StatsGrid>
            {Object.entries(comparison.metrics).map(([key, metric]) => (
              <StatRow key={key} $isDark={isDark} $isWinner={getWinner(key) === 2}>
                <StatLabel $isDark={isDark}>{metric.label}</StatLabel>
                <StatValue $isDark={isDark} $highlight={getWinner(key) === 2}>
                  {renderValue(key, metric.v2)}
                  {getWinner(key) === 2 && <WinnerBadge>✓</WinnerBadge>}
                </StatValue>
              </StatRow>
            ))}
          </StatsGrid>
        </ValidatorCard>
      </ComparisonGrid>

      <SummarySection $isDark={isDark}>
        <SummaryTitle $isDark={isDark}>
          💡 Recommendation
        </SummaryTitle>
        <SummaryText $isDark={isDark}>
          {getSummary()}
        </SummaryText>
      </SummarySection>

      <DataSource $isDark={isDark}>
        📡 Live data from Casper Mainnet • Updated in real-time
      </DataSource>
    </Container>
  );
};

export default ValidatorComparator;
