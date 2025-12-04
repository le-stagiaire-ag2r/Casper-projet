import React, { useState, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';

const Container = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.03)'
    : 'rgba(255, 255, 255, 0.8)'};
  border-radius: 24px;
  padding: 28px;
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.08)'};
  box-shadow: ${props => props.$isDark
    ? 'none'
    : '0 4px 20px rgba(0, 0, 0, 0.08)'};
`;

const Title = styled.h3<{ $isDark: boolean }>`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const InputSection = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label<{ $isDark: boolean }>`
  display: block;
  font-size: 14px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(0, 0, 0, 0.6)'};
  margin-bottom: 8px;
  font-weight: 500;
`;

const Input = styled.input<{ $isDark: boolean }>`
  width: 100%;
  padding: 14px 16px;
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.03)'};
  border: 2px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 12px;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  font-size: 18px;
  font-weight: 600;
  box-sizing: border-box;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #5856d6;
  }
`;

const SliderContainer = styled.div`
  margin-bottom: 24px;
`;

const SliderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const SliderValue = styled.span<{ $isDark: boolean }>`
  font-size: 14px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  background: ${props => props.$isDark
    ? 'rgba(88, 86, 214, 0.2)'
    : 'rgba(88, 86, 214, 0.15)'};
  padding: 4px 10px;
  border-radius: 6px;
`;

const Slider = styled.input<{ $isDark: boolean }>`
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
  outline: none;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ff2d55 0%, #5856d6 100%);
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 24px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ResultCard = styled.div<{ $isDark: boolean; $highlight?: boolean }>`
  background: ${props => props.$highlight
    ? 'linear-gradient(135deg, rgba(48, 209, 88, 0.15) 0%, rgba(88, 86, 214, 0.15) 100%)'
    : props.$isDark
      ? 'rgba(255, 255, 255, 0.03)'
      : 'rgba(0, 0, 0, 0.02)'};
  border: 1px solid ${props => props.$highlight
    ? 'rgba(48, 209, 88, 0.3)'
    : props.$isDark
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.05)'};
  border-radius: 12px;
  padding: 16px;
  text-align: center;
`;

const ResultLabel = styled.div<{ $isDark: boolean }>`
  font-size: 12px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ResultValue = styled.div<{ $isDark: boolean; $highlight?: boolean }>`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.$highlight
    ? '#30d158'
    : props.$isDark ? '#fff' : '#1a1a2e'};
`;

const ResultSubtext = styled.div<{ $isDark: boolean }>`
  font-size: 11px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.4)'
    : 'rgba(0, 0, 0, 0.4)'};
  margin-top: 4px;
`;

const Disclaimer = styled.div<{ $isDark: boolean }>`
  margin-top: 20px;
  padding: 12px;
  background: ${props => props.$isDark
    ? 'rgba(255, 159, 10, 0.1)'
    : 'rgba(255, 159, 10, 0.08)'};
  border-radius: 8px;
  font-size: 12px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(0, 0, 0, 0.6)'};
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

// APY range
const APY_MIN = 0.08;
const APY_MAX = 0.12;

export const StakingCalculator: React.FC = () => {
  const theme = useTheme() as any;
  const isDark = theme?.mode === 'dark';

  const [stakeAmount, setStakeAmount] = useState<string>('100');
  const [stakingPeriod, setStakingPeriod] = useState<number>(12); // months

  const calculations = useMemo(() => {
    const amount = parseFloat(stakeAmount) || 0;
    const months = stakingPeriod;
    const years = months / 12;

    const earningsMin = amount * APY_MIN * years;
    const earningsMax = amount * APY_MAX * years;
    const earningsAvg = (earningsMin + earningsMax) / 2;

    const totalMin = amount + earningsMin;
    const totalMax = amount + earningsMax;

    const monthlyMin = earningsMin / months;
    const monthlyMax = earningsMax / months;

    return {
      earningsMin,
      earningsMax,
      earningsAvg,
      totalMin,
      totalMax,
      monthlyMin,
      monthlyMax,
    };
  }, [stakeAmount, stakingPeriod]);

  const formatNumber = (num: number) => {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getPeriodLabel = () => {
    if (stakingPeriod === 1) return '1 month';
    if (stakingPeriod < 12) return `${stakingPeriod} months`;
    if (stakingPeriod === 12) return '1 year';
    if (stakingPeriod === 24) return '2 years';
    if (stakingPeriod === 36) return '3 years';
    return `${stakingPeriod} months`;
  };

  return (
    <Container $isDark={isDark}>
      <Title $isDark={isDark}>
        🧮 Staking Calculator
      </Title>

      <InputSection>
        <Label $isDark={isDark}>Amount to stake (CSPR)</Label>
        <Input
          $isDark={isDark}
          type="number"
          min="1"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
          placeholder="Enter amount"
        />
      </InputSection>

      <SliderContainer>
        <SliderHeader>
          <Label $isDark={isDark}>Staking period</Label>
          <SliderValue $isDark={isDark}>{getPeriodLabel()}</SliderValue>
        </SliderHeader>
        <Slider
          $isDark={isDark}
          type="range"
          min="1"
          max="36"
          value={stakingPeriod}
          onChange={(e) => setStakingPeriod(parseInt(e.target.value))}
        />
      </SliderContainer>

      <ResultsGrid>
        <ResultCard $isDark={isDark}>
          <ResultLabel $isDark={isDark}>Est. Earnings</ResultLabel>
          <ResultValue $isDark={isDark} $highlight>
            +{formatNumber(calculations.earningsMin)} - {formatNumber(calculations.earningsMax)}
          </ResultValue>
          <ResultSubtext $isDark={isDark}>CSPR over {getPeriodLabel()}</ResultSubtext>
        </ResultCard>

        <ResultCard $isDark={isDark}>
          <ResultLabel $isDark={isDark}>Monthly Earnings</ResultLabel>
          <ResultValue $isDark={isDark} $highlight>
            +{formatNumber(calculations.monthlyMin)} - {formatNumber(calculations.monthlyMax)}
          </ResultValue>
          <ResultSubtext $isDark={isDark}>CSPR/month avg</ResultSubtext>
        </ResultCard>

        <ResultCard $isDark={isDark} $highlight>
          <ResultLabel $isDark={isDark}>Total Value</ResultLabel>
          <ResultValue $isDark={isDark}>
            {formatNumber(calculations.totalMin)} - {formatNumber(calculations.totalMax)}
          </ResultValue>
          <ResultSubtext $isDark={isDark}>CSPR after {getPeriodLabel()}</ResultSubtext>
        </ResultCard>
      </ResultsGrid>

      <Disclaimer $isDark={isDark}>
        <span>⚠️</span>
        <span>
          These are estimates based on current APY rates (8-12%). Actual returns may vary
          based on network conditions and validator performance. Past performance does not
          guarantee future results.
        </span>
      </Disclaimer>
    </Container>
  );
};

export default StakingCalculator;
