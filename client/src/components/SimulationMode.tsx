import React, { useState, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const Container = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, rgba(88, 86, 214, 0.15), rgba(175, 82, 222, 0.1))'
    : 'linear-gradient(135deg, rgba(88, 86, 214, 0.08), rgba(175, 82, 222, 0.05))'};
  border-radius: 20px;
  padding: 28px;
  border: 1px solid ${props => props.$isDark
    ? 'rgba(88, 86, 214, 0.3)'
    : 'rgba(88, 86, 214, 0.2)'};
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const Title = styled.h3<{ $isDark: boolean }>`
  margin: 0 0 8px 0;
  font-size: 1.4rem;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const Subtitle = styled.p<{ $isDark: boolean }>`
  margin: 0;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(0, 0, 0, 0.6)'};
  font-size: 0.9rem;
`;

const SimulatorGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InputSection = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.02)'};
  border-radius: 16px;
  padding: 20px;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label<{ $isDark: boolean }>`
  display: block;
  font-size: 0.85rem;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.7)'
    : 'rgba(0, 0, 0, 0.7)'};
  margin-bottom: 8px;
  font-weight: 500;
`;

const Input = styled.input<{ $isDark: boolean }>`
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
  font-size: 1.1rem;
  font-weight: 600;

  &:focus {
    outline: none;
    border-color: #5856d6;
  }
`;

const SliderContainer = styled.div`
  padding: 0 4px;
`;

const Slider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(90deg, #5856d6 0%, #af52de 100%);
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    cursor: pointer;
  }
`;

const SliderValue = styled.div<{ $isDark: boolean }>`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 0.85rem;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
`;

const ResultsSection = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(48, 209, 88, 0.1)'
    : 'rgba(48, 209, 88, 0.08)'};
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(48, 209, 88, 0.2);
`;

const ResultTitle = styled.div<{ $isDark: boolean }>`
  font-size: 0.9rem;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(0, 0, 0, 0.6)'};
  margin-bottom: 16px;
  text-align: center;
`;

const BigNumber = styled.div<{ $isDark: boolean }>`
  font-size: 2.5rem;
  font-weight: 700;
  color: #30d158;
  text-align: center;
  animation: ${float} 3s ease-in-out infinite;
  margin-bottom: 4px;
`;

const BigLabel = styled.div<{ $isDark: boolean }>`
  font-size: 0.85rem;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  text-align: center;
  margin-bottom: 20px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const StatBox = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.03)'};
  border-radius: 10px;
  padding: 12px;
  text-align: center;
`;

const StatValue = styled.div<{ $isDark: boolean; $color?: string }>`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => props.$color || (props.$isDark ? '#fff' : '#1a1a2e')};
`;

const StatLabel = styled.div<{ $isDark: boolean }>`
  font-size: 0.7rem;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  margin-top: 2px;
  text-transform: uppercase;
`;

const Timeline = styled.div`
  margin-top: 24px;
`;

const TimelineTitle = styled.div<{ $isDark: boolean }>`
  font-size: 0.9rem;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.7)'
    : 'rgba(0, 0, 0, 0.7)'};
  margin-bottom: 12px;
  font-weight: 500;
`;

const TimelineRow = styled.div<{ $isDark: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.08)'};
  font-size: 0.9rem;

  &:last-child {
    border-bottom: none;
  }
`;

const TimelineLabel = styled.span<{ $isDark: boolean }>`
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(0, 0, 0, 0.6)'};
`;

const TimelineValue = styled.span<{ $isDark: boolean }>`
  color: ${props => props.$isDark ? '#30d158' : '#28a745'};
  font-weight: 600;
`;

interface SimulationModeProps {
  isDark: boolean;
}

export const SimulationMode: React.FC<SimulationModeProps> = ({ isDark }) => {
  const [stakeAmount, setStakeAmount] = useState(1000);
  const [months, setMonths] = useState(12);
  const [apy, setApy] = useState(17);

  const results = useMemo(() => {
    const monthlyRate = apy / 100 / 12;
    const years = months / 12;

    // Compound interest calculation
    let balance = stakeAmount;
    const timeline: { month: number; balance: number; rewards: number }[] = [];

    for (let i = 1; i <= months; i++) {
      const monthlyReward = balance * monthlyRate;
      balance += monthlyReward;
      timeline.push({
        month: i,
        balance: balance,
        rewards: balance - stakeAmount,
      });
    }

    const totalRewards = balance - stakeAmount;
    const roi = (totalRewards / stakeAmount) * 100;
    const dailyRewards = totalRewards / (months * 30);
    const monthlyRewards = totalRewards / months;

    return {
      finalBalance: balance,
      totalRewards,
      roi,
      dailyRewards,
      monthlyRewards,
      timeline: timeline.filter((_, i) => (i + 1) % 3 === 0 || i === months - 1),
    };
  }, [stakeAmount, months, apy]);

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <Container $isDark={isDark}>
      <Header>
        <Title $isDark={isDark}>
          🎮 Staking Simulator
        </Title>
        <Subtitle $isDark={isDark}>
          See how your CSPR can grow over time with compound rewards
        </Subtitle>
      </Header>

      <SimulatorGrid>
        <InputSection $isDark={isDark}>
          <InputGroup>
            <Label $isDark={isDark}>💰 Stake Amount (CSPR)</Label>
            <Input
              $isDark={isDark}
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(Number(e.target.value) || 0)}
              min="1"
            />
          </InputGroup>

          <InputGroup>
            <Label $isDark={isDark}>📅 Duration: {months} months</Label>
            <SliderContainer>
              <Slider
                type="range"
                min="1"
                max="60"
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
              />
              <SliderValue $isDark={isDark}>
                <span>1 month</span>
                <span>5 years</span>
              </SliderValue>
            </SliderContainer>
          </InputGroup>

          <InputGroup>
            <Label $isDark={isDark}>📈 APY: {apy}%</Label>
            <SliderContainer>
              <Slider
                type="range"
                min="5"
                max="25"
                value={apy}
                onChange={(e) => setApy(Number(e.target.value))}
              />
              <SliderValue $isDark={isDark}>
                <span>5%</span>
                <span>25%</span>
              </SliderValue>
            </SliderContainer>
          </InputGroup>
        </InputSection>

        <ResultsSection $isDark={isDark}>
          <ResultTitle $isDark={isDark}>
            After {months} months, you'll have:
          </ResultTitle>

          <BigNumber $isDark={isDark}>
            {formatNumber(results.finalBalance)}
          </BigNumber>
          <BigLabel $isDark={isDark}>CSPR Total</BigLabel>

          <StatsGrid>
            <StatBox $isDark={isDark}>
              <StatValue $isDark={isDark} $color="#30d158">
                +{formatNumber(results.totalRewards)}
              </StatValue>
              <StatLabel $isDark={isDark}>Total Rewards</StatLabel>
            </StatBox>
            <StatBox $isDark={isDark}>
              <StatValue $isDark={isDark} $color="#5856d6">
                {results.roi.toFixed(1)}%
              </StatValue>
              <StatLabel $isDark={isDark}>ROI</StatLabel>
            </StatBox>
            <StatBox $isDark={isDark}>
              <StatValue $isDark={isDark}>
                +{formatNumber(results.monthlyRewards)}
              </StatValue>
              <StatLabel $isDark={isDark}>Per Month</StatLabel>
            </StatBox>
            <StatBox $isDark={isDark}>
              <StatValue $isDark={isDark}>
                +{formatNumber(results.dailyRewards)}
              </StatValue>
              <StatLabel $isDark={isDark}>Per Day</StatLabel>
            </StatBox>
          </StatsGrid>

          <Timeline>
            <TimelineTitle $isDark={isDark}>📊 Growth Timeline</TimelineTitle>
            {results.timeline.map((point) => (
              <TimelineRow key={point.month} $isDark={isDark}>
                <TimelineLabel $isDark={isDark}>
                  Month {point.month}
                </TimelineLabel>
                <TimelineValue $isDark={isDark}>
                  {formatNumber(point.balance)} CSPR (+{formatNumber(point.rewards)})
                </TimelineValue>
              </TimelineRow>
            ))}
          </Timeline>
        </ResultsSection>
      </SimulatorGrid>
    </Container>
  );
};

export default SimulationMode;
