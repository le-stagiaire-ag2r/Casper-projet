import React, { useState, useMemo } from 'react';
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
`;

const ValidatorName = styled.div<{ $isDark: boolean }>`
  font-weight: 600;
  font-size: 1.1rem;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
`;

const ValidatorBadge = styled.span<{ $type: 'verified' | 'top' | 'new' }>`
  font-size: 0.7rem;
  padding: 3px 8px;
  border-radius: 10px;
  margin-left: 8px;
  background: ${props =>
    props.$type === 'verified' ? 'rgba(88, 86, 214, 0.2)' :
    props.$type === 'top' ? 'rgba(255, 204, 0, 0.2)' :
    'rgba(48, 209, 88, 0.2)'};
  color: ${props =>
    props.$type === 'verified' ? '#5856d6' :
    props.$type === 'top' ? '#ffcc00' :
    '#30d158'};
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

interface Validator {
  id: string;
  name: string;
  icon: string;
  color: string;
  apy: number;
  commission: number;
  uptime: number;
  totalStake: number;
  delegators: number;
  selfStake: number;
  badge?: 'verified' | 'top' | 'new';
}

const VALIDATORS: Validator[] = [
  {
    id: 'v1',
    name: 'CasperLabs Official',
    icon: '🏛️',
    color: 'linear-gradient(135deg, #5856d6, #af52de)',
    apy: 17.2,
    commission: 5,
    uptime: 99.98,
    totalStake: 125000000,
    delegators: 2450,
    selfStake: 5000000,
    badge: 'verified',
  },
  {
    id: 'v2',
    name: 'StakeVue Pool',
    icon: '💎',
    color: 'linear-gradient(135deg, #ff2d55, #ff9500)',
    apy: 18.1,
    commission: 3,
    uptime: 99.95,
    totalStake: 45000000,
    delegators: 890,
    selfStake: 2500000,
    badge: 'top',
  },
  {
    id: 'v3',
    name: 'Casper Community',
    icon: '🌐',
    color: 'linear-gradient(135deg, #30d158, #34c759)',
    apy: 16.8,
    commission: 8,
    uptime: 99.92,
    totalStake: 78000000,
    delegators: 1560,
    selfStake: 3200000,
    badge: 'verified',
  },
  {
    id: 'v4',
    name: 'BlockTech Node',
    icon: '🔷',
    color: 'linear-gradient(135deg, #007aff, #5ac8fa)',
    apy: 17.5,
    commission: 4,
    uptime: 99.88,
    totalStake: 32000000,
    delegators: 620,
    selfStake: 1800000,
  },
  {
    id: 'v5',
    name: 'CryptoStake Pro',
    icon: '⚡',
    color: 'linear-gradient(135deg, #ffcc00, #ff9500)',
    apy: 17.8,
    commission: 6,
    uptime: 99.85,
    totalStake: 28000000,
    delegators: 480,
    selfStake: 1500000,
    badge: 'new',
  },
  {
    id: 'v6',
    name: 'ValidatorOne',
    icon: '🎯',
    color: 'linear-gradient(135deg, #af52de, #ff2d55)',
    apy: 16.5,
    commission: 10,
    uptime: 99.80,
    totalStake: 22000000,
    delegators: 340,
    selfStake: 1200000,
  },
];

interface ValidatorComparatorProps {
  isDark: boolean;
}

export const ValidatorComparator: React.FC<ValidatorComparatorProps> = ({ isDark }) => {
  const [validator1Id, setValidator1Id] = useState(VALIDATORS[0].id);
  const [validator2Id, setValidator2Id] = useState(VALIDATORS[1].id);

  const validator1 = VALIDATORS.find(v => v.id === validator1Id)!;
  const validator2 = VALIDATORS.find(v => v.id === validator2Id)!;

  const comparison = useMemo(() => {
    const metrics = {
      apy: { label: '📈 APY', v1: validator1.apy, v2: validator2.apy, higherBetter: true },
      commission: { label: '💸 Commission', v1: validator1.commission, v2: validator2.commission, higherBetter: false },
      uptime: { label: '⏱️ Uptime', v1: validator1.uptime, v2: validator2.uptime, higherBetter: true },
      totalStake: { label: '💰 Total Stake', v1: validator1.totalStake, v2: validator2.totalStake, higherBetter: true },
      delegators: { label: '👥 Delegators', v1: validator1.delegators, v2: validator2.delegators, higherBetter: true },
      selfStake: { label: '🔒 Self-Stake', v1: validator1.selfStake, v2: validator2.selfStake, higherBetter: true },
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
    return num.toString();
  };

  const getWinner = (key: string) => {
    const m = comparison.metrics[key as keyof typeof comparison.metrics];
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
      case 'apy':
      case 'uptime':
        return `${value}%`;
      case 'commission':
        return `${value}%`;
      default:
        return formatNumber(value);
    }
  };

  const getSummary = () => {
    if (comparison.v1Wins > comparison.v2Wins) {
      return `${validator1.name} wins in ${comparison.v1Wins} out of 6 categories. It offers ${validator1.apy > validator2.apy ? 'higher APY' : 'lower commission'} and may be a better choice for maximizing returns.`;
    } else if (comparison.v2Wins > comparison.v1Wins) {
      return `${validator2.name} wins in ${comparison.v2Wins} out of 6 categories. It offers ${validator2.apy > validator1.apy ? 'higher APY' : 'lower commission'} and may be a better choice for maximizing returns.`;
    }
    return "Both validators are evenly matched! Choose based on your priorities: higher APY vs lower commission, or larger stake vs more decentralization.";
  };

  return (
    <Container $isDark={isDark}>
      <Header>
        <Title $isDark={isDark}>
          ⚖️ Validator Comparator
        </Title>
        <Subtitle $isDark={isDark}>
          Compare validators side-by-side to find the best option for your stake
        </Subtitle>
      </Header>

      <SelectorRow>
        <SelectWrapper $isDark={isDark}>
          <Select
            $isDark={isDark}
            value={validator1Id}
            onChange={(e) => setValidator1Id(e.target.value)}
          >
            {VALIDATORS.map(v => (
              <option key={v.id} value={v.id}>
                {v.icon} {v.name}
              </option>
            ))}
          </Select>
        </SelectWrapper>

        <VsLabel $isDark={isDark}>VS</VsLabel>

        <SelectWrapper $isDark={isDark}>
          <Select
            $isDark={isDark}
            value={validator2Id}
            onChange={(e) => setValidator2Id(e.target.value)}
          >
            {VALIDATORS.map(v => (
              <option key={v.id} value={v.id}>
                {v.icon} {v.name}
              </option>
            ))}
          </Select>
        </SelectWrapper>
      </SelectorRow>

      <ComparisonGrid>
        <ValidatorCard $isDark={isDark} $highlight={comparison.v1Wins > comparison.v2Wins}>
          <ValidatorHeader>
            <ValidatorAvatar $color={validator1.color}>
              {validator1.icon}
            </ValidatorAvatar>
            <ValidatorInfo>
              <ValidatorName $isDark={isDark}>
                {validator1.name}
                {validator1.badge && (
                  <ValidatorBadge $type={validator1.badge}>
                    {validator1.badge === 'verified' ? '✓ Verified' :
                     validator1.badge === 'top' ? '★ Top' : '🆕 New'}
                  </ValidatorBadge>
                )}
              </ValidatorName>
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
            <ValidatorAvatar $color={validator2.color}>
              {validator2.icon}
            </ValidatorAvatar>
            <ValidatorInfo>
              <ValidatorName $isDark={isDark}>
                {validator2.name}
                {validator2.badge && (
                  <ValidatorBadge $type={validator2.badge}>
                    {validator2.badge === 'verified' ? '✓ Verified' :
                     validator2.badge === 'top' ? '★ Top' : '🆕 New'}
                  </ValidatorBadge>
                )}
              </ValidatorName>
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
    </Container>
  );
};

export default ValidatorComparator;
