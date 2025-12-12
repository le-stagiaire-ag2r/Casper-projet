import React, { useState, useMemo } from 'react';
import styled, { keyframes, useTheme, css } from 'styled-components';

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const Container = styled.div<{ $isDark: boolean }>`
  background: rgba(20, 10, 30, 0.6);
  border-radius: 24px;
  padding: 28px;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #8b5cf6, #a78bfa);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const Title = styled.h3<{ $isDark: boolean }>`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
`;

const APYBadge = styled.div`
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
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

const InputWrapper = styled.div<{ $isDark: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input<{ $isDark: boolean }>`
  width: 100%;
  padding: 18px 80px 18px 20px;
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.03)'};
  border: 2px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 16px;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  font-size: 24px;
  font-weight: 700;
  box-sizing: border-box;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #5856d6;
    box-shadow: 0 0 0 4px rgba(88, 86, 214, 0.15);
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const InputSuffix = styled.span<{ $isDark: boolean }>`
  position: absolute;
  right: 20px;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
`;

const QuickAmounts = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
`;

const QuickButton = styled.button<{ $isDark: boolean; $active?: boolean }>`
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid ${props => props.$active
    ? '#5856d6'
    : props.$isDark
      ? 'rgba(255, 255, 255, 0.15)'
      : 'rgba(0, 0, 0, 0.1)'};
  background: ${props => props.$active
    ? 'rgba(88, 86, 214, 0.15)'
    : 'transparent'};
  color: ${props => props.$active
    ? '#5856d6'
    : props.$isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #5856d6;
    background: rgba(88, 86, 214, 0.1);
  }
`;

const SliderContainer = styled.div`
  margin-bottom: 28px;
`;

const SliderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const PeriodButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const PeriodButton = styled.button<{ $isDark: boolean; $active: boolean }>`
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  background: ${props => props.$active
    ? 'linear-gradient(135deg, #5856d6, #af52de)'
    : props.$isDark
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.05)'};
  color: ${props => props.$active
    ? '#fff'
    : props.$isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const SliderTrack = styled.div<{ $isDark: boolean }>`
  position: relative;
  height: 8px;
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 4px;
`;

const SliderFill = styled.div<{ $percent: number }>`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: ${props => props.$percent}%;
  background: linear-gradient(90deg, #8b5cf6, #5856d6);
  border-radius: 4px;
  transition: width 0.1s ease;
`;

const Slider = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 8px;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
`;

const SliderThumb = styled.div<{ $percent: number }>`
  position: absolute;
  top: 50%;
  left: ${props => props.$percent}%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #5856d6, #af52de);
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(88, 86, 214, 0.4);
  pointer-events: none;
  transition: transform 0.1s ease;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
  }
`;

const SliderLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
`;

const SliderLabel = styled.span<{ $isDark: boolean }>`
  font-size: 11px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.4)'
    : 'rgba(0, 0, 0, 0.4)'};
`;

const ResultsSection = styled.div<{ $isDark: boolean }>`
  background: rgba(139, 92, 246, 0.06);
  border: 1px solid rgba(139, 92, 246, 0.15);
  border-radius: 20px;
  padding: 24px;
  margin-top: 24px;
  backdrop-filter: blur(10px);
`;

const ResultsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const ResultsTitle = styled.h4<{ $isDark: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  margin: 0;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const ResultCard = styled.div<{ $isDark: boolean; $highlight?: boolean }>`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);

  ${props => props.$highlight && css`
    background: rgba(139, 92, 246, 0.1);
    border: 1px solid rgba(139, 92, 246, 0.25);
    animation: ${pulse} 2s ease-in-out infinite;
  `}
`;

const ResultIcon = styled.div`
  font-size: 28px;
  margin-bottom: 8px;
`;

const ResultLabel = styled.div<{ $isDark: boolean }>`
  font-size: 12px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
`;

const ResultValue = styled.div<{ $highlight?: boolean }>`
  font-size: 24px;
  font-weight: 800;
  color: ${props => props.$highlight ? '#8b5cf6' : 'inherit'};
  background: ${props => props.$highlight
    ? 'linear-gradient(135deg, #8b5cf6, #a78bfa)'
    : 'none'};
  -webkit-background-clip: ${props => props.$highlight ? 'text' : 'none'};
  -webkit-text-fill-color: ${props => props.$highlight ? 'transparent' : 'inherit'};
`;

const ResultSubtext = styled.div<{ $isDark: boolean }>`
  font-size: 11px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.4)'
    : 'rgba(0, 0, 0, 0.4)'};
  margin-top: 4px;
`;

const TotalCard = styled.div<{ $isDark: boolean }>`
  grid-column: 1 / -1;
  background: linear-gradient(135deg,
    ${props => props.$isDark ? 'rgba(88, 86, 214, 0.2)' : 'rgba(88, 86, 214, 0.1)'},
    ${props => props.$isDark ? 'rgba(175, 82, 222, 0.2)' : 'rgba(175, 82, 222, 0.1)'}
  );
  border: 1px solid rgba(88, 86, 214, 0.3);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(255,255,255,0.1) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 3s linear infinite;
  }
`;

const TotalLabel = styled.div<{ $isDark: boolean }>`
  font-size: 14px;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'};
  margin-bottom: 8px;
  font-weight: 600;
`;

const TotalValue = styled.div<{ $isDark: boolean }>`
  font-size: 36px;
  font-weight: 800;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const TotalProfit = styled.span`
  font-size: 18px;
  color: #8b5cf6;
  font-weight: 700;
`;

const Disclaimer = styled.div<{ $isDark: boolean }>`
  margin-top: 20px;
  padding: 14px 16px;
  background: ${props => props.$isDark
    ? 'rgba(255, 159, 10, 0.1)'
    : 'rgba(255, 159, 10, 0.08)'};
  border-radius: 12px;
  border: 1px solid rgba(255, 159, 10, 0.2);
  font-size: 12px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.7)'
    : 'rgba(0, 0, 0, 0.6)'};
  display: flex;
  align-items: flex-start;
  gap: 10px;
  line-height: 1.5;
`;

const DisclaimerIcon = styled.span`
  font-size: 16px;
`;

export const StakingCalculator: React.FC = () => {
  const theme = useTheme() as any;
  const isDark = theme?.mode === 'dark';

  const [stakeAmount, setStakeAmount] = useState<string>('1000');
  const [stakingPeriod, setStakingPeriod] = useState<number>(12); // months
  const [selectedAPY, setSelectedAPY] = useState<number>(17); // Fixed 17% network average

  const apySliderPercent = ((selectedAPY - 1) / 99) * 100;

  const quickAmounts = [100, 500, 1000, 5000, 10000];
  const periodPresets = [
    { label: '3M', months: 3 },
    { label: '6M', months: 6 },
    { label: '1Y', months: 12 },
    { label: '2Y', months: 24 },
  ];

  const calculations = useMemo(() => {
    const amount = parseFloat(stakeAmount) || 0;
    const months = stakingPeriod;
    const years = months / 12;
    const apy = selectedAPY / 100;

    // Compound interest calculation
    const totalWithRewards = amount * Math.pow(1 + apy, years);
    const earnings = totalWithRewards - amount;
    const monthlyAvg = earnings / months;
    const dailyAvg = earnings / (months * 30);

    return {
      earnings,
      total: totalWithRewards,
      monthlyAvg,
      dailyAvg,
      percentGain: amount > 0 ? (earnings / amount) * 100 : 0,
    };
  }, [stakeAmount, stakingPeriod, selectedAPY]);

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
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

  const sliderPercent = ((stakingPeriod - 1) / 35) * 100;

  return (
    <Container $isDark={isDark}>
      <Header>
        <Title $isDark={isDark}>
          🧮 Staking Calculator
        </Title>
        <APYBadge>
          <span></span>
          {selectedAPY}% APY
        </APYBadge>
      </Header>

      <SliderContainer>
        <SliderHeader>
          <Label $isDark={isDark}>
            Expected APY: <strong>{selectedAPY}%</strong>
          </Label>
        </SliderHeader>
        <SliderTrack $isDark={isDark}>
          <SliderFill $percent={apySliderPercent} style={{ background: 'linear-gradient(90deg, #8b5cf6, #ff9f0a)' }} />
          <SliderThumb $percent={apySliderPercent} style={{ background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' }} />
          <Slider
            type="range"
            min="1"
            max="100"
            value={selectedAPY}
            onChange={(e) => setSelectedAPY(parseInt(e.target.value))}
          />
        </SliderTrack>
        <SliderLabels>
          <SliderLabel $isDark={isDark}>1%</SliderLabel>
          <SliderLabel $isDark={isDark}>~17% avg</SliderLabel>
          <SliderLabel $isDark={isDark}>100%</SliderLabel>
        </SliderLabels>
      </SliderContainer>

      <InputSection>
        <Label $isDark={isDark}>Amount to stake</Label>
        <InputWrapper $isDark={isDark}>
          <Input
            $isDark={isDark}
            type="number"
            min="1"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder="Enter amount"
          />
          <InputSuffix $isDark={isDark}>CSPR</InputSuffix>
        </InputWrapper>
        <QuickAmounts>
          {quickAmounts.map(amount => (
            <QuickButton
              key={amount}
              $isDark={isDark}
              $active={stakeAmount === String(amount)}
              onClick={() => setStakeAmount(String(amount))}
            >
              {amount >= 1000 ? `${amount/1000}K` : amount}
            </QuickButton>
          ))}
        </QuickAmounts>
      </InputSection>

      <SliderContainer>
        <SliderHeader>
          <Label $isDark={isDark}>Staking period: <strong>{getPeriodLabel()}</strong></Label>
          <PeriodButtons>
            {periodPresets.map(preset => (
              <PeriodButton
                key={preset.label}
                $isDark={isDark}
                $active={stakingPeriod === preset.months}
                onClick={() => setStakingPeriod(preset.months)}
              >
                {preset.label}
              </PeriodButton>
            ))}
          </PeriodButtons>
        </SliderHeader>
        <SliderTrack $isDark={isDark}>
          <SliderFill $percent={sliderPercent} />
          <SliderThumb $percent={sliderPercent} />
          <Slider
            type="range"
            min="1"
            max="36"
            value={stakingPeriod}
            onChange={(e) => setStakingPeriod(parseInt(e.target.value))}
          />
        </SliderTrack>
        <SliderLabels>
          <SliderLabel $isDark={isDark}>1 month</SliderLabel>
          <SliderLabel $isDark={isDark}>3 years</SliderLabel>
        </SliderLabels>
      </SliderContainer>

      <ResultsSection $isDark={isDark}>
        <ResultsHeader>
          <span style={{ fontSize: '24px' }}></span>
          <ResultsTitle $isDark={isDark}>Estimated Rewards</ResultsTitle>
        </ResultsHeader>

        <ResultsGrid>
          <ResultCard $isDark={isDark} $highlight>
            <ResultIcon></ResultIcon>
            <ResultLabel $isDark={isDark}>Total Earnings</ResultLabel>
            <ResultValue $highlight>
              +{formatNumber(calculations.earnings)}
            </ResultValue>
            <ResultSubtext $isDark={isDark}>
              CSPR over {getPeriodLabel()}
            </ResultSubtext>
          </ResultCard>

          <ResultCard $isDark={isDark}>
            <ResultIcon>📅</ResultIcon>
            <ResultLabel $isDark={isDark}>Monthly Average</ResultLabel>
            <ResultValue>
              +{formatNumber(calculations.monthlyAvg)}
            </ResultValue>
            <ResultSubtext $isDark={isDark}>CSPR/month</ResultSubtext>
          </ResultCard>

          <ResultCard $isDark={isDark}>
            <ResultIcon></ResultIcon>
            <ResultLabel $isDark={isDark}>Daily Average</ResultLabel>
            <ResultValue>
              +{formatNumber(calculations.dailyAvg, 4)}
            </ResultValue>
            <ResultSubtext $isDark={isDark}>CSPR/day</ResultSubtext>
          </ResultCard>

          <ResultCard $isDark={isDark}>
            <ResultIcon></ResultIcon>
            <ResultLabel $isDark={isDark}>Total Return</ResultLabel>
            <ResultValue $highlight>
              +{formatNumber(calculations.percentGain, 1)}%
            </ResultValue>
            <ResultSubtext $isDark={isDark}>on investment</ResultSubtext>
          </ResultCard>

          <TotalCard $isDark={isDark}>
            <TotalLabel $isDark={isDark}>
              🏦 Total Value After {getPeriodLabel()}
            </TotalLabel>
            <TotalValue $isDark={isDark}>
              {formatNumber(calculations.total)} CSPR
              <TotalProfit>(+{formatNumber(calculations.percentGain, 1)}%)</TotalProfit>
            </TotalValue>
          </TotalCard>
        </ResultsGrid>
      </ResultsSection>

      <Disclaimer $isDark={isDark}>
        <DisclaimerIcon></DisclaimerIcon>
        <span>
          Calculation based on {selectedAPY}% APY. Rewards compound automatically.
          Actual returns may vary based on validator choice and network conditions.
        </span>
      </Disclaimer>
    </Container>
  );
};

export default StakingCalculator;
