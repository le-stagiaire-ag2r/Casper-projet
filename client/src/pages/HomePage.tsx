import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

// Hero Section
const HeroSection = styled.section<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, rgba(88, 86, 214, 0.15) 0%, rgba(255, 45, 85, 0.15) 50%, rgba(175, 82, 222, 0.15) 100%)'
    : 'linear-gradient(135deg, rgba(88, 86, 214, 0.1) 0%, rgba(255, 45, 85, 0.1) 50%, rgba(175, 82, 222, 0.1) 100%)'};
  border-radius: 32px;
  padding: 64px 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.08)'};
  margin-bottom: 48px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #ff2d55, #5856d6, #af52de, #ff2d55);
    background-size: 300% 100%;
    animation: ${shimmer} 3s linear infinite;
  }
`;

const HeroIcon = styled.div`
  font-size: 80px;
  margin-bottom: 24px;
  animation: ${float} 3s ease-in-out infinite;
  filter: drop-shadow(0 10px 20px rgba(88, 86, 214, 0.3));
`;

const HeroTitle = styled.h1`
  font-size: 56px;
  font-weight: 800;
  background: linear-gradient(135deg, #ff2d55 0%, #5856d6 50%, #af52de 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 20px;
  letter-spacing: -2px;

  @media (max-width: 768px) {
    font-size: 40px;
  }
`;

const HeroSubtitle = styled.p<{ $isDark: boolean }>`
  font-size: 20px;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'};
  max-width: 650px;
  margin: 0 auto 36px;
  line-height: 1.7;
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
`;

const PrimaryButton = styled.button`
  padding: 18px 48px;
  font-size: 18px;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #ff2d55, #5856d6);
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 30px rgba(88, 86, 214, 0.4);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(88, 86, 214, 0.5);
  }
`;

const SecondaryButton = styled.button<{ $isDark: boolean }>`
  padding: 18px 48px;
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#fff' : '#5856d6'};
  background: transparent;
  border: 2px solid ${props => props.$isDark ? 'rgba(255,255,255,0.3)' : '#5856d6'};
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.$isDark ? 'rgba(255,255,255,0.1)' : 'rgba(88, 86, 214, 0.1)'};
    transform: translateY(-3px);
  }
`;

// Stats Row
const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 56px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div<{ $isDark: boolean; $gradient: string }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.03)'
    : 'rgba(255, 255, 255, 0.9)'};
  border-radius: 24px;
  padding: 28px;
  text-align: center;
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.08)'};
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.$gradient};
  }

  &:hover {
    transform: translateY(-6px);
  }
`;

const StatIcon = styled.div`
  font-size: 36px;
  margin-bottom: 12px;
`;

const StatValue = styled.div<{ $color: string }>`
  font-size: 32px;
  font-weight: 800;
  color: ${props => props.$color};
  margin-bottom: 4px;
`;

const StatLabel = styled.div<{ $isDark: boolean }>`
  font-size: 14px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
`;

// Section
const Section = styled.section`
  margin-bottom: 64px;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2<{ $isDark: boolean }>`
  font-size: 36px;
  font-weight: 800;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  margin-bottom: 12px;
`;

const SectionSubtitle = styled.p<{ $isDark: boolean }>`
  font-size: 18px;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'};
`;

// Steps
const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  position: relative;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const StepCard = styled.div<{ $isDark: boolean; $step: number }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.03)'
    : 'rgba(255, 255, 255, 0.9)'};
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.08)'};
  border-radius: 24px;
  padding: 36px 28px;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => {
      const colors = [
        'linear-gradient(90deg, #ff2d55, #ff6b8a)',
        'linear-gradient(90deg, #5856d6, #7a78e6)',
        'linear-gradient(90deg, #30d158, #5ae67e)',
      ];
      return colors[props.$step - 1] || colors[0];
    }};
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  }
`;

const StepNumber = styled.div<{ $step: number }>`
  width: 64px;
  height: 64px;
  background: ${props => {
    const colors = [
      'linear-gradient(135deg, #ff2d55, #ff6b8a)',
      'linear-gradient(135deg, #5856d6, #7a78e6)',
      'linear-gradient(135deg, #30d158, #5ae67e)',
    ];
    return colors[props.$step - 1] || colors[0];
  }};
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 800;
  color: white;
  margin: 0 auto 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

const StepIcon = styled.div`
  font-size: 52px;
  margin-bottom: 20px;
`;

const StepTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 12px;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
`;

const StepDescription = styled.p<{ $isDark: boolean }>`
  font-size: 15px;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'};
  line-height: 1.7;
`;

// Benefits
const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BenefitCard = styled.div<{ $isDark: boolean; $color: string }>`
  display: flex;
  gap: 20px;
  padding: 28px;
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.03)'
    : 'rgba(255, 255, 255, 0.9)'};
  border-radius: 20px;
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.08)'};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${props => props.$color};
  }

  &:hover {
    transform: translateX(8px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
`;

const BenefitIconBox = styled.div<{ $bg: string }>`
  width: 56px;
  height: 56px;
  background: ${props => props.$bg};
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
`;

const BenefitContent = styled.div``;

const BenefitTitle = styled.h4<{ $isDark: boolean }>`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
`;

const BenefitDescription = styled.p<{ $isDark: boolean }>`
  font-size: 14px;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'};
  line-height: 1.6;
`;

// Example Box
const ExampleBox = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, rgba(88, 86, 214, 0.15), rgba(175, 82, 222, 0.1))'
    : 'linear-gradient(135deg, rgba(88, 86, 214, 0.1), rgba(175, 82, 222, 0.05))'};
  border: 2px solid ${props => props.$isDark
    ? 'rgba(88, 86, 214, 0.3)'
    : 'rgba(88, 86, 214, 0.2)'};
  border-radius: 24px;
  padding: 40px;
  margin-top: 48px;
  text-align: center;
`;

const ExampleTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 24px;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const ExampleFlow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const ExampleStep = styled.div<{ $isDark: boolean; $highlight?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  background: ${props => props.$highlight
    ? 'linear-gradient(135deg, #30d158, #34c759)'
    : props.$isDark
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.05)'};
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  color: ${props => props.$highlight ? '#fff' : (props.$isDark ? '#fff' : '#1a1a2e')};
`;

const Arrow = styled.span`
  font-size: 24px;
  color: #5856d6;
`;

// CTA Section
const CTASection = styled.div`
  background: linear-gradient(135deg, #ff2d55 0%, #5856d6 50%, #af52de 100%);
  border-radius: 32px;
  padding: 56px 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const CTATitle = styled.h2`
  font-size: 36px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 16px;
`;

const CTASubtitle = styled.p`
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 32px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
`;

const CTAButton = styled.button`
  padding: 20px 56px;
  background: #fff;
  border: none;
  border-radius: 16px;
  color: #5856d6;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  }
`;

interface HomePageProps {
  isDark: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({ isDark }) => {
  const navigate = useNavigate();

  return (
    <Container>
      {/* Hero */}
      <HeroSection $isDark={isDark}>
        <HeroIcon>💎</HeroIcon>
        <HeroTitle>StakeVue</HeroTitle>
        <HeroSubtitle $isDark={isDark}>
          The liquid staking protocol on Casper Network.
          Stake CSPR, receive stCSPR tokens, and earn ~10% APY
          while keeping full liquidity.
        </HeroSubtitle>
        <HeroButtons>
          <PrimaryButton onClick={() => navigate('/stake')}>
            🚀 Start Staking
          </PrimaryButton>
          <SecondaryButton $isDark={isDark} onClick={() => navigate('/guide')}>
            📖 Learn More
          </SecondaryButton>
        </HeroButtons>
      </HeroSection>

      {/* Stats */}
      <StatsRow>
        <StatCard $isDark={isDark} $gradient="linear-gradient(90deg, #30d158, #34c759)">
          <StatIcon>📈</StatIcon>
          <StatValue $color="#30d158">~10%</StatValue>
          <StatLabel $isDark={isDark}>APY Rewards</StatLabel>
        </StatCard>
        <StatCard $isDark={isDark} $gradient="linear-gradient(90deg, #5856d6, #7a78e6)">
          <StatIcon>⚡</StatIcon>
          <StatValue $color="#5856d6">Instant</StatValue>
          <StatLabel $isDark={isDark}>stCSPR Minting</StatLabel>
        </StatCard>
        <StatCard $isDark={isDark} $gradient="linear-gradient(90deg, #ff9f0a, #ffb84d)">
          <StatIcon>🔓</StatIcon>
          <StatValue $color="#ff9f0a">No Lock</StatValue>
          <StatLabel $isDark={isDark}>Unstake Anytime</StatLabel>
        </StatCard>
        <StatCard $isDark={isDark} $gradient="linear-gradient(90deg, #ff2d55, #ff6b8a)">
          <StatIcon>🛡️</StatIcon>
          <StatValue $color="#ff2d55">Audited</StatValue>
          <StatLabel $isDark={isDark}>Smart Contract</StatLabel>
        </StatCard>
      </StatsRow>

      {/* How it works */}
      <Section>
        <SectionHeader>
          <SectionTitle $isDark={isDark}>How Does It Work?</SectionTitle>
          <SectionSubtitle $isDark={isDark}>Three simple steps to start earning rewards</SectionSubtitle>
        </SectionHeader>
        <StepsGrid>
          <StepCard $isDark={isDark} $step={1}>
            <StepNumber $step={1}>1</StepNumber>
            <StepIcon>🔗</StepIcon>
            <StepTitle $isDark={isDark}>Connect Wallet</StepTitle>
            <StepDescription $isDark={isDark}>
              Connect your Casper wallet via CSPR.click.
              Compatible with Casper Wallet, Ledger, and more.
            </StepDescription>
          </StepCard>

          <StepCard $isDark={isDark} $step={2}>
            <StepNumber $step={2}>2</StepNumber>
            <StepIcon>💰</StepIcon>
            <StepTitle $isDark={isDark}>Stake CSPR</StepTitle>
            <StepDescription $isDark={isDark}>
              Deposit any amount of CSPR. Instantly receive
              stCSPR tokens at 1:1 ratio.
            </StepDescription>
          </StepCard>

          <StepCard $isDark={isDark} $step={3}>
            <StepNumber $step={3}>3</StepNumber>
            <StepIcon>🚀</StepIcon>
            <StepTitle $isDark={isDark}>Earn Rewards</StepTitle>
            <StepDescription $isDark={isDark}>
              Your CSPR earns ~10% APY. Use your stCSPR
              freely in DeFi or unstake anytime.
            </StepDescription>
          </StepCard>
        </StepsGrid>

        <ExampleBox $isDark={isDark}>
          <ExampleTitle $isDark={isDark}>
            💡 Real Example
          </ExampleTitle>
          <ExampleFlow>
            <ExampleStep $isDark={isDark}>1000 CSPR</ExampleStep>
            <Arrow>→</Arrow>
            <ExampleStep $isDark={isDark}>Stake</ExampleStep>
            <Arrow>→</Arrow>
            <ExampleStep $isDark={isDark}>1000 stCSPR</ExampleStep>
            <Arrow>→</Arrow>
            <ExampleStep $isDark={isDark} $highlight>+100 CSPR/year</ExampleStep>
          </ExampleFlow>
        </ExampleBox>
      </Section>

      {/* Benefits */}
      <Section>
        <SectionHeader>
          <SectionTitle $isDark={isDark}>Why StakeVue?</SectionTitle>
          <SectionSubtitle $isDark={isDark}>The best liquid staking experience on Casper</SectionSubtitle>
        </SectionHeader>
        <BenefitsGrid>
          <BenefitCard $isDark={isDark} $color="#30d158">
            <BenefitIconBox $bg="rgba(48, 209, 88, 0.15)">🔓</BenefitIconBox>
            <BenefitContent>
              <BenefitTitle $isDark={isDark}>Full Liquidity</BenefitTitle>
              <BenefitDescription $isDark={isDark}>
                Your stCSPR tokens are fully liquid. Trade, transfer, or use in DeFi
                while earning staking rewards.
              </BenefitDescription>
            </BenefitContent>
          </BenefitCard>

          <BenefitCard $isDark={isDark} $color="#5856d6">
            <BenefitIconBox $bg="rgba(88, 86, 214, 0.15)">📈</BenefitIconBox>
            <BenefitContent>
              <BenefitTitle $isDark={isDark}>~10% APY Returns</BenefitTitle>
              <BenefitDescription $isDark={isDark}>
                Earn automatic staking rewards without any effort.
                Watch your balance grow over time.
              </BenefitDescription>
            </BenefitContent>
          </BenefitCard>

          <BenefitCard $isDark={isDark} $color="#ff2d55">
            <BenefitIconBox $bg="rgba(255, 45, 85, 0.15)">🛡️</BenefitIconBox>
            <BenefitContent>
              <BenefitTitle $isDark={isDark}>Secure & Audited</BenefitTitle>
              <BenefitDescription $isDark={isDark}>
                Smart contract audited by CasperSecure with A+ rating.
                Open source and fully verifiable.
              </BenefitDescription>
            </BenefitContent>
          </BenefitCard>

          <BenefitCard $isDark={isDark} $color="#ff9f0a">
            <BenefitIconBox $bg="rgba(255, 159, 10, 0.15)">⚡</BenefitIconBox>
            <BenefitContent>
              <BenefitTitle $isDark={isDark}>Multi-Validator</BenefitTitle>
              <BenefitDescription $isDark={isDark}>
                Automatic distribution across top validators to
                minimize risk and maximize returns.
              </BenefitDescription>
            </BenefitContent>
          </BenefitCard>
        </BenefitsGrid>
      </Section>

      {/* CTA */}
      <CTASection>
        <CTATitle>Ready to Start Earning?</CTATitle>
        <CTASubtitle>
          Join thousands of CSPR holders earning passive income with StakeVue
        </CTASubtitle>
        <CTAButton onClick={() => navigate('/stake')}>
          🚀 Start Staking Now
        </CTAButton>
      </CTASection>
    </Container>
  );
};
