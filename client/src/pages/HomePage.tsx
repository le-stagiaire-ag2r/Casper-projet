import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Hero = styled.section<{ $isDark: boolean }>`
  text-align: center;
  padding: 60px 20px 80px;
`;

const HeroIcon = styled.div`
  font-size: 80px;
  margin-bottom: 24px;
  animation: ${float} 3s ease-in-out infinite;
`;

const HeroTitle = styled.h1`
  font-size: 48px;
  font-weight: 800;
  background: linear-gradient(135deg, #ff2d55 0%, #5856d6 50%, #af52de 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
  letter-spacing: -1px;

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const HeroSubtitle = styled.p<{ $isDark: boolean }>`
  font-size: 20px;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'};
  max-width: 600px;
  margin: 0 auto 32px;
  line-height: 1.6;
`;

const CTAButton = styled.button`
  padding: 16px 40px;
  font-size: 18px;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #ff2d55, #5856d6);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 20px rgba(88, 86, 214, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 30px rgba(88, 86, 214, 0.5);
  }
`;

const Section = styled.section<{ $isDark: boolean }>`
  padding: 60px 20px;
`;

const SectionTitle = styled.h2<{ $isDark: boolean }>`
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 48px;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
`;

const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const StepCard = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.03)'};
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.08)'};
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const StepNumber = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #ff2d55, #5856d6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0 auto 20px;
`;

const StepIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const StepTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
`;

const StepDescription = styled.p<{ $isDark: boolean }>`
  font-size: 15px;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'};
  line-height: 1.6;
`;

const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BenefitCard = styled.div<{ $isDark: boolean }>`
  display: flex;
  gap: 16px;
  padding: 24px;
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.03)'
    : 'rgba(0, 0, 0, 0.02)'};
  border-radius: 12px;
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.05)'};
`;

const BenefitIcon = styled.div`
  font-size: 32px;
  flex-shrink: 0;
`;

const BenefitContent = styled.div``;

const BenefitTitle = styled.h4<{ $isDark: boolean }>`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
`;

const BenefitDescription = styled.p<{ $isDark: boolean }>`
  font-size: 14px;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'};
  line-height: 1.5;
`;

const ExampleBox = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, rgba(88, 86, 214, 0.2), rgba(175, 82, 222, 0.1))'
    : 'linear-gradient(135deg, rgba(88, 86, 214, 0.1), rgba(175, 82, 222, 0.05))'};
  border: 1px solid ${props => props.$isDark
    ? 'rgba(88, 86, 214, 0.3)'
    : 'rgba(88, 86, 214, 0.2)'};
  border-radius: 16px;
  padding: 32px;
  margin-top: 48px;
`;

const ExampleTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ExampleContent = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 18px;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'};
`;

const ExampleStep = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.05)'};
  border-radius: 8px;
  font-weight: 500;
`;

const Arrow = styled.span`
  font-size: 24px;
  color: #5856d6;
`;

interface HomePageProps {
  isDark: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({ isDark }) => {
  const navigate = useNavigate();

  return (
    <Container>
      <Hero $isDark={isDark}>
        <HeroIcon>💎</HeroIcon>
        <HeroTitle>StakeVue</HeroTitle>
        <HeroSubtitle $isDark={isDark}>
          The liquid staking protocol on Casper Network.
          Stake your CSPR, receive stCSPR tokens, and keep your liquidity
          while earning rewards.
        </HeroSubtitle>
        <CTAButton onClick={() => navigate('/stake')}>
          Start Staking →
        </CTAButton>
      </Hero>

      <Section $isDark={isDark}>
        <SectionTitle $isDark={isDark}>How Does It Work?</SectionTitle>
        <StepsGrid>
          <StepCard $isDark={isDark}>
            <StepNumber>1</StepNumber>
            <StepIcon>🔗</StepIcon>
            <StepTitle $isDark={isDark}>Connect Your Wallet</StepTitle>
            <StepDescription $isDark={isDark}>
              Use CSPR.click to connect your Casper wallet in one click.
              Compatible with Casper Wallet, Ledger, and more.
            </StepDescription>
          </StepCard>

          <StepCard $isDark={isDark}>
            <StepNumber>2</StepNumber>
            <StepIcon>💰</StepIcon>
            <StepTitle $isDark={isDark}>Stake Your CSPR</StepTitle>
            <StepDescription $isDark={isDark}>
              Deposit your CSPR into the protocol. Instantly receive
              stCSPR tokens (1:1). Your CSPR is distributed across 10 validators.
            </StepDescription>
          </StepCard>

          <StepCard $isDark={isDark}>
            <StepNumber>3</StepNumber>
            <StepIcon>🚀</StepIcon>
            <StepTitle $isDark={isDark}>Enjoy Liquidity</StepTitle>
            <StepDescription $isDark={isDark}>
              Use your stCSPR freely: trade, transfer, or use them
              in other DeFi protocols. All while earning 10% APY!
            </StepDescription>
          </StepCard>
        </StepsGrid>

        <ExampleBox $isDark={isDark}>
          <ExampleTitle $isDark={isDark}>
            💡 Real Example
          </ExampleTitle>
          <ExampleContent $isDark={isDark}>
            <ExampleStep $isDark={isDark}>
              1000 CSPR
            </ExampleStep>
            <Arrow>→</Arrow>
            <ExampleStep $isDark={isDark}>
              Stake
            </ExampleStep>
            <Arrow>→</Arrow>
            <ExampleStep $isDark={isDark}>
              1000 stCSPR
            </ExampleStep>
            <Arrow>→</Arrow>
            <ExampleStep $isDark={isDark}>
              +100 CSPR/year (10% APY)
            </ExampleStep>
          </ExampleContent>
        </ExampleBox>
      </Section>

      <Section $isDark={isDark}>
        <SectionTitle $isDark={isDark}>Why StakeVue?</SectionTitle>
        <BenefitsGrid>
          <BenefitCard $isDark={isDark}>
            <BenefitIcon>🔓</BenefitIcon>
            <BenefitContent>
              <BenefitTitle $isDark={isDark}>Keep Your Liquidity</BenefitTitle>
              <BenefitDescription $isDark={isDark}>
                Unlike traditional staking, your tokens remain usable.
                No lock-up period!
              </BenefitDescription>
            </BenefitContent>
          </BenefitCard>

          <BenefitCard $isDark={isDark}>
            <BenefitIcon>📈</BenefitIcon>
            <BenefitContent>
              <BenefitTitle $isDark={isDark}>10% APY Rewards</BenefitTitle>
              <BenefitDescription $isDark={isDark}>
                Earn staking rewards automatically,
                without doing anything.
              </BenefitDescription>
            </BenefitContent>
          </BenefitCard>

          <BenefitCard $isDark={isDark}>
            <BenefitIcon>🛡️</BenefitIcon>
            <BenefitContent>
              <BenefitTitle $isDark={isDark}>Secure & Audited</BenefitTitle>
              <BenefitDescription $isDark={isDark}>
                Contract audited by CasperSecure with A+ grade.
                10 vulnerabilities fixed.
              </BenefitDescription>
            </BenefitContent>
          </BenefitCard>

          <BenefitCard $isDark={isDark}>
            <BenefitIcon>⚡</BenefitIcon>
            <BenefitContent>
              <BenefitTitle $isDark={isDark}>Multi-Validator</BenefitTitle>
              <BenefitDescription $isDark={isDark}>
                Automatic distribution across 10 validators to
                reduce risks and maximize returns.
              </BenefitDescription>
            </BenefitContent>
          </BenefitCard>
        </BenefitsGrid>
      </Section>
    </Container>
  );
};
