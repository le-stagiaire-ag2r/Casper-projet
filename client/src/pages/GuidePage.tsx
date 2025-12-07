import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
`;

// Hero Section
const HeroSection = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, rgba(88, 86, 214, 0.2) 0%, rgba(255, 45, 85, 0.2) 100%)'
    : 'linear-gradient(135deg, rgba(88, 86, 214, 0.15) 0%, rgba(255, 45, 85, 0.15) 100%)'};
  border-radius: 32px;
  padding: 48px;
  margin-bottom: 48px;
  position: relative;
  overflow: hidden;
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.08)'};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #ff2d55, #5856d6, #af52de);
  }
`;

const HeroContent = styled.div`
  text-align: center;
  position: relative;
  z-index: 1;
`;

const HeroEmoji = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
  animation: ${float} 3s ease-in-out infinite;
`;

const HeroTitle = styled.h1`
  font-size: 42px;
  font-weight: 800;
  background: linear-gradient(135deg, #ff2d55 0%, #5856d6 50%, #af52de 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
`;

const HeroSubtitle = styled.p<{ $isDark: boolean }>`
  font-size: 18px;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'};
  margin-bottom: 32px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const HeroButton = styled.button`
  padding: 16px 40px;
  background: linear-gradient(135deg, #ff2d55 0%, #5856d6 100%);
  border: none;
  border-radius: 16px;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(255, 45, 85, 0.4);
  }
`;

// Stats Row
const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 48px;

  @media (max-width: 800px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.03)'
    : 'rgba(255, 255, 255, 0.8)'};
  border-radius: 20px;
  padding: 24px;
  text-align: center;
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.08)'};
  backdrop-filter: blur(20px);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-4px);
  }
`;

const StatIcon = styled.div`
  font-size: 32px;
  margin-bottom: 12px;
`;

const StatValue = styled.div<{ $color?: string }>`
  font-size: 28px;
  font-weight: 800;
  color: ${props => props.$color || '#5856d6'};
  margin-bottom: 4px;
`;

const StatLabel = styled.div<{ $isDark: boolean }>`
  font-size: 13px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// Section
const Section = styled.section`
  margin-bottom: 56px;
`;

const SectionHeader = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
`;

const SectionIcon = styled.div<{ $bg: string }>`
  width: 50px;
  height: 50px;
  background: ${props => props.$bg};
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

const SectionTitle = styled.h2<{ $isDark: boolean }>`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
`;

// Comparison Cards
const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const ComparisonCard = styled.div<{ $isDark: boolean; $type: 'bad' | 'good' }>`
  background: ${props => props.$type === 'good'
    ? 'linear-gradient(135deg, rgba(48, 209, 88, 0.1) 0%, rgba(52, 199, 89, 0.05) 100%)'
    : 'linear-gradient(135deg, rgba(255, 69, 58, 0.1) 0%, rgba(255, 59, 48, 0.05) 100%)'};
  border: 2px solid ${props => props.$type === 'good'
    ? 'rgba(48, 209, 88, 0.3)'
    : 'rgba(255, 69, 58, 0.3)'};
  border-radius: 24px;
  padding: 32px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.$type === 'good' ? '#30d158' : '#ff453a'};
  }
`;

const ComparisonTitle = styled.h3<{ $isDark: boolean; $type: 'bad' | 'good' }>`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.$type === 'good' ? '#30d158' : '#ff453a'};
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ComparisonList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ComparisonItem = styled.li<{ $isDark: boolean }>`
  font-size: 15px;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'};
  padding: 12px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.05)'};

  &:last-child {
    border-bottom: none;
  }
`;

// Tutorial Steps
const TutorialContainer = styled.div`
  position: relative;
`;

const TutorialLine = styled.div<{ $isDark: boolean }>`
  position: absolute;
  left: 29px;
  top: 60px;
  bottom: 60px;
  width: 2px;
  background: ${props => props.$isDark
    ? 'linear-gradient(180deg, #5856d6 0%, #ff2d55 100%)'
    : 'linear-gradient(180deg, #5856d6 0%, #ff2d55 100%)'};
  opacity: 0.3;

  @media (max-width: 600px) {
    display: none;
  }
`;

const TutorialStep = styled.div<{ $isDark: boolean }>`
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  position: relative;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const StepNumber = styled.div<{ $step: number }>`
  width: 60px;
  height: 60px;
  background: ${props => {
    const colors = [
      'linear-gradient(135deg, #ff2d55, #ff6b8a)',
      'linear-gradient(135deg, #ff9f0a, #ffb84d)',
      'linear-gradient(135deg, #30d158, #5ae67e)',
      'linear-gradient(135deg, #5856d6, #7a78e6)',
      'linear-gradient(135deg, #af52de, #c77deb)',
    ];
    return colors[props.$step - 1] || colors[0];
  }};
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 800;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
`;

const StepContent = styled.div<{ $isDark: boolean }>`
  flex: 1;
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.03)'
    : 'rgba(255, 255, 255, 0.8)'};
  border-radius: 20px;
  padding: 24px;
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.08)'};
`;

const StepTitle = styled.h4<{ $isDark: boolean }>`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  margin-bottom: 8px;
`;

const StepDescription = styled.p<{ $isDark: boolean }>`
  font-size: 14px;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'};
  line-height: 1.7;
  margin: 0;
`;

const StepTip = styled.div<{ $isDark: boolean }>`
  margin-top: 12px;
  padding: 10px 14px;
  background: ${props => props.$isDark
    ? 'rgba(88, 86, 214, 0.15)'
    : 'rgba(88, 86, 214, 0.1)'};
  border-radius: 10px;
  font-size: 13px;
  color: #5856d6;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// FAQ Section
const FAQGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FAQItem = styled.div<{ $isDark: boolean; $isOpen: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.03)'
    : 'rgba(255, 255, 255, 0.8)'};
  border: 2px solid ${props => props.$isOpen
    ? '#5856d6'
    : props.$isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${props => props.$isOpen ? '#5856d6' : 'rgba(88, 86, 214, 0.3)'};
  }
`;

const FAQQuestion = styled.button<{ $isDark: boolean }>`
  width: 100%;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
`;

const FAQQuestionText = styled.span<{ $isDark: boolean }>`
  font-size: 17px;
  font-weight: 600;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
`;

const FAQIcon = styled.div<{ $isOpen: boolean; $isDark: boolean }>`
  width: 32px;
  height: 32px;
  background: ${props => props.$isOpen
    ? 'linear-gradient(135deg, #ff2d55, #5856d6)'
    : props.$isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$isOpen ? '#fff' : (props.$isDark ? '#fff' : '#1a1a2e')};
  font-size: 14px;
  transition: all 0.3s ease;
  transform: rotate(${props => props.$isOpen ? '180deg' : '0deg'});
`;

const FAQAnswer = styled.div<{ $isDark: boolean; $isOpen: boolean }>`
  padding: ${props => props.$isOpen ? '0 24px 24px' : '0 24px'};
  max-height: ${props => props.$isOpen ? '500px' : '0'};
  opacity: ${props => props.$isOpen ? 1 : 0};
  overflow: hidden;
  transition: all 0.3s ease;
  font-size: 15px;
  line-height: 1.8;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'};
`;

// CTA Section
const CTASection = styled.div<{ $isDark: boolean }>`
  background: linear-gradient(135deg, #5856d6 0%, #af52de 100%);
  border-radius: 32px;
  padding: 48px;
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const CTATitle = styled.h2`
  font-size: 32px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 16px;
`;

const CTASubtitle = styled.p`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 28px;
`;

const CTAButton = styled.button`
  padding: 18px 48px;
  background: #fff;
  border: none;
  border-radius: 16px;
  color: #5856d6;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
`;

interface GuidePageProps {
  isDark: boolean;
}

export const GuidePage: React.FC<GuidePageProps> = ({ isDark }) => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const navigate = useNavigate();

  const faqs = [
    {
      question: "What is liquid staking?",
      answer: "Liquid staking lets you stake CSPR while receiving stCSPR tokens in return. These tokens represent your staked position and can be freely traded, transferred, or used in DeFi - all while earning ~17% APY rewards."
    },
    {
      question: "Is my stake secure?",
      answer: "Yes! StakeVue's smart contract has been audited and follows best security practices. Your stake is distributed across top-performing validators to minimize risk. The code is open source and verifiable on GitHub."
    },
    {
      question: "How much can I earn?",
      answer: "Current APY is approximately 15-18% depending on network conditions. For example, staking 1000 CSPR would earn you roughly 170 CSPR per year in rewards, automatically compounded."
    },
    {
      question: "Can I unstake anytime?",
      answer: "Absolutely! There's no lock-up period. You can unstake your stCSPR back to CSPR whenever you want. The standard Casper unbonding period applies (~14 hours)."
    },
    {
      question: "What's the minimum stake?",
      answer: "You can stake as little as 1 CSPR. We recommend keeping some CSPR for transaction fees (around 5 CSPR per transaction)."
    },
    {
      question: "How is stCSPR different from CSPR?",
      answer: "stCSPR is a liquid token representing your staked CSPR. Over time, 1 stCSPR becomes worth more CSPR as rewards accumulate. You can trade it, use it as collateral, or simply hold it to earn rewards."
    }
  ];

  const tutorials = [
    {
      title: "Install Casper Wallet",
      description: "Download the official Casper Wallet extension from the Chrome Web Store. Create a new wallet and securely save your recovery phrase.",
      tip: "💡 Never share your recovery phrase with anyone!"
    },
    {
      title: "Get Some CSPR",
      description: "Purchase CSPR on exchanges like Binance, Coinbase, or OKX. Transfer to your Casper wallet address. For testnet, use the free faucet.",
      tip: "💡 Start with a small amount to test the process"
    },
    {
      title: "Connect to StakeVue",
      description: "Click 'Connect' in the top navigation bar. Select your wallet and approve the connection request.",
      tip: "💡 Make sure you're on the correct network (Testnet/Mainnet)"
    },
    {
      title: "Stake Your CSPR",
      description: "Enter the amount you want to stake, review the transaction preview, and click 'Stake'. Sign the transaction in your wallet.",
      tip: "💡 You'll receive stCSPR tokens instantly"
    },
    {
      title: "Watch Your Rewards Grow",
      description: "That's it! Your CSPR is now earning ~17% APY. Track your rewards in the dashboard, and unstake anytime you want.",
      tip: "💡 Set price alerts to never miss market opportunities"
    }
  ];

  return (
    <Container>
      {/* Hero Section */}
      <HeroSection $isDark={isDark}>
        <HeroContent>
          <HeroEmoji>🚀</HeroEmoji>
          <HeroTitle>Master Liquid Staking</HeroTitle>
          <HeroSubtitle $isDark={isDark}>
            Learn how to earn passive income on your CSPR while keeping full liquidity.
            No lock-ups, no complexity - just rewards.
          </HeroSubtitle>
          <HeroButton onClick={() => navigate('/stake')}>
            Start Staking Now →
          </HeroButton>
        </HeroContent>
      </HeroSection>

      {/* Stats Row */}
      <StatsRow>
        <StatCard $isDark={isDark}>
          <StatIcon>📈</StatIcon>
          <StatValue $color="#30d158">~17%</StatValue>
          <StatLabel $isDark={isDark}>APY Rewards</StatLabel>
        </StatCard>
        <StatCard $isDark={isDark}>
          <StatIcon>⚡</StatIcon>
          <StatValue>Instant</StatValue>
          <StatLabel $isDark={isDark}>stCSPR Minting</StatLabel>
        </StatCard>
        <StatCard $isDark={isDark}>
          <StatIcon>🔓</StatIcon>
          <StatValue>No Lock</StatValue>
          <StatLabel $isDark={isDark}>Unstake Anytime</StatLabel>
        </StatCard>
        <StatCard $isDark={isDark}>
          <StatIcon>🛡️</StatIcon>
          <StatValue $color="#5856d6">Secure</StatValue>
          <StatLabel $isDark={isDark}>Open Source</StatLabel>
        </StatCard>
      </StatsRow>

      {/* Comparison Section */}
      <Section>
        <SectionHeader $isDark={isDark}>
          <SectionIcon $bg="linear-gradient(135deg, #ff2d55, #5856d6)">⚖️</SectionIcon>
          <SectionTitle $isDark={isDark}>Why Liquid Staking?</SectionTitle>
        </SectionHeader>
        <ComparisonGrid>
          <ComparisonCard $isDark={isDark} $type="bad">
            <ComparisonTitle $isDark={isDark} $type="bad">
              ❌ Traditional Staking
            </ComparisonTitle>
            <ComparisonList>
              <ComparisonItem $isDark={isDark}>🔒 Tokens locked for weeks</ComparisonItem>
              <ComparisonItem $isDark={isDark}>⏳ Long unbonding period</ComparisonItem>
              <ComparisonItem $isDark={isDark}>🚫 Can't use in DeFi</ComparisonItem>
              <ComparisonItem $isDark={isDark}>📉 Miss market opportunities</ComparisonItem>
              <ComparisonItem $isDark={isDark}>😰 Complex validator management</ComparisonItem>
            </ComparisonList>
          </ComparisonCard>

          <ComparisonCard $isDark={isDark} $type="good">
            <ComparisonTitle $isDark={isDark} $type="good">
              ✅ Liquid Staking (StakeVue)
            </ComparisonTitle>
            <ComparisonList>
              <ComparisonItem $isDark={isDark}>🔓 Fully liquid stCSPR tokens</ComparisonItem>
              <ComparisonItem $isDark={isDark}>⚡ Unstake anytime</ComparisonItem>
              <ComparisonItem $isDark={isDark}>🔄 Use in DeFi protocols</ComparisonItem>
              <ComparisonItem $isDark={isDark}>📈 Never miss opportunities</ComparisonItem>
              <ComparisonItem $isDark={isDark}>😎 We handle validators for you</ComparisonItem>
            </ComparisonList>
          </ComparisonCard>
        </ComparisonGrid>
      </Section>

      {/* Tutorial Section */}
      <Section>
        <SectionHeader $isDark={isDark}>
          <SectionIcon $bg="linear-gradient(135deg, #30d158, #34c759)">📝</SectionIcon>
          <SectionTitle $isDark={isDark}>How to Stake in 5 Steps</SectionTitle>
        </SectionHeader>
        <TutorialContainer>
          <TutorialLine $isDark={isDark} />
          {tutorials.map((tutorial, index) => (
            <TutorialStep key={index} $isDark={isDark}>
              <StepNumber $step={index + 1}>{index + 1}</StepNumber>
              <StepContent $isDark={isDark}>
                <StepTitle $isDark={isDark}>{tutorial.title}</StepTitle>
                <StepDescription $isDark={isDark}>{tutorial.description}</StepDescription>
                <StepTip $isDark={isDark}>{tutorial.tip}</StepTip>
              </StepContent>
            </TutorialStep>
          ))}
        </TutorialContainer>
      </Section>

      {/* FAQ Section */}
      <Section>
        <SectionHeader $isDark={isDark}>
          <SectionIcon $bg="linear-gradient(135deg, #ff9f0a, #ffb84d)">❓</SectionIcon>
          <SectionTitle $isDark={isDark}>Frequently Asked Questions</SectionTitle>
        </SectionHeader>
        <FAQGrid>
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              $isDark={isDark}
              $isOpen={openFAQ === index}
            >
              <FAQQuestion
                $isDark={isDark}
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              >
                <FAQQuestionText $isDark={isDark}>{faq.question}</FAQQuestionText>
                <FAQIcon $isOpen={openFAQ === index} $isDark={isDark}>▼</FAQIcon>
              </FAQQuestion>
              <FAQAnswer $isDark={isDark} $isOpen={openFAQ === index}>
                {faq.answer}
              </FAQAnswer>
            </FAQItem>
          ))}
        </FAQGrid>
      </Section>

      {/* CTA Section */}
      <CTASection $isDark={isDark}>
        <CTATitle>Ready to Start Earning?</CTATitle>
        <CTASubtitle>
          Join thousands of CSPR holders earning passive rewards with StakeVue
        </CTASubtitle>
        <CTAButton onClick={() => navigate('/stake')}>
          🚀 Start Staking Now
        </CTAButton>
      </CTASection>
    </Container>
  );
};
