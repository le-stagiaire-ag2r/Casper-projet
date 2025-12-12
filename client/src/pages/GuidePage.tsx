import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { colors, typography, spacing, layout, effects } from '../styles/designTokens';

gsap.registerPlugin(ScrollTrigger);

const Container = styled.div`
  max-width: ${layout.contentWidth};
  margin: 0 auto;
  padding: ${spacing[8]} ${spacing[6]};

  @media (max-width: 768px) {
    padding: ${spacing[6]} ${spacing[4]};
  }
`;

// Hero Section
const HeroSection = styled.section`
  text-align: center;
  padding: ${spacing[16]} 0;
  margin-bottom: ${spacing[12]};
`;

const HeroLabel = styled.span`
  display: inline-block;
  font-family: ${typography.fontFamily.mono};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.medium};
  color: ${colors.accent.primary};
  text-transform: uppercase;
  letter-spacing: ${typography.letterSpacing.widest};
  margin-bottom: ${spacing[4]};
  padding: ${spacing[2]} ${spacing[4]};
  background: ${colors.accent.muted};
  border-radius: ${layout.borderRadius.full};
`;

const HeroTitle = styled.h1`
  font-family: ${typography.fontFamily.display};
  font-size: clamp(${typography.fontSize['4xl']}, 8vw, ${typography.fontSize['7xl']});
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.text.primary};
  line-height: ${typography.lineHeight.tight};
  letter-spacing: ${typography.letterSpacing.tight};
  margin-bottom: ${spacing[6]};
`;

const HeroSubtitle = styled.p`
  font-size: ${typography.fontSize.lg};
  color: ${colors.text.secondary};
  max-width: 600px;
  margin: 0 auto ${spacing[8]};
  line-height: ${typography.lineHeight.relaxed};
`;

const HeroButton = styled.button`
  padding: ${spacing[4]} ${spacing[8]};
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: ${typography.letterSpacing.wider};
  color: ${colors.text.primary};
  background: ${colors.accent.primary};
  border: none;
  border-radius: ${layout.borderRadius.full};
  cursor: pointer;
  transition: all ${effects.transition.normal};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${effects.shadow.glow};
  }
`;

// Stats
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${spacing[4]};
  margin-bottom: ${spacing[16]};

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: ${colors.background.secondary};
  border: 1px solid ${colors.border.default};
  border-radius: ${layout.borderRadius.lg};
  padding: ${spacing[6]};
  text-align: center;
  transition: all ${effects.transition.normal};

  &:hover {
    border-color: ${colors.border.hover};
    transform: translateY(-2px);
  }
`;

const StatValue = styled.div`
  font-family: ${typography.fontFamily.display};
  font-size: ${typography.fontSize['2xl']};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.text.primary};
  margin-bottom: ${spacing[1]};
`;

const StatLabel = styled.div`
  font-size: ${typography.fontSize.xs};
  color: ${colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: ${typography.letterSpacing.wider};
`;

// Section
const Section = styled.section`
  margin-bottom: ${spacing[16]};
`;

const SectionHeader = styled.div`
  margin-bottom: ${spacing[8]};
`;

const SectionLabel = styled.span`
  display: inline-block;
  font-family: ${typography.fontFamily.mono};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.medium};
  color: ${colors.accent.primary};
  text-transform: uppercase;
  letter-spacing: ${typography.letterSpacing.widest};
  margin-bottom: ${spacing[3]};
`;

const SectionTitle = styled.h2`
  font-family: ${typography.fontFamily.display};
  font-size: ${typography.fontSize['3xl']};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.text.primary};
  letter-spacing: ${typography.letterSpacing.tight};
`;

// Comparison
const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing[6]};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ComparisonCard = styled.div<{ $type: 'bad' | 'good' }>`
  background: ${colors.background.secondary};
  border: 1px solid ${props => props.$type === 'good'
    ? 'rgba(34, 197, 94, 0.3)'
    : 'rgba(239, 68, 68, 0.3)'};
  border-radius: ${layout.borderRadius.xl};
  padding: ${spacing[8]};
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${props => props.$type === 'good'
      ? colors.status.success
      : colors.status.error};
  }
`;

const ComparisonTitle = styled.h3<{ $type: 'bad' | 'good' }>`
  font-family: ${typography.fontFamily.display};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.semibold};
  color: ${props => props.$type === 'good'
    ? colors.status.success
    : colors.status.error};
  margin-bottom: ${spacing[6]};
`;

const ComparisonList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ComparisonItem = styled.li`
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.secondary};
  padding: ${spacing[3]} 0;
  display: flex;
  align-items: center;
  gap: ${spacing[3]};
  border-bottom: 1px solid ${colors.border.default};

  &:last-child {
    border-bottom: none;
  }

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

// Tutorial Steps
const TutorialGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[4]};
`;

const TutorialStep = styled.div`
  display: flex;
  gap: ${spacing[6]};
  padding: ${spacing[6]};
  background: ${colors.background.secondary};
  border: 1px solid ${colors.border.default};
  border-radius: ${layout.borderRadius.lg};
  transition: all ${effects.transition.normal};

  &:hover {
    border-color: ${colors.accent.primary};
    transform: translateX(4px);
  }

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const StepNumber = styled.div`
  width: 48px;
  height: 48px;
  background: ${colors.accent.muted};
  border-radius: ${layout.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${typography.fontFamily.mono};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.accent.primary};
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.h4`
  font-family: ${typography.fontFamily.display};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.semibold};
  color: ${colors.text.primary};
  margin-bottom: ${spacing[2]};
`;

const StepDescription = styled.p`
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.secondary};
  line-height: ${typography.lineHeight.relaxed};
  margin: 0;
`;

const StepTip = styled.div`
  margin-top: ${spacing[3]};
  padding: ${spacing[3]} ${spacing[4]};
  background: ${colors.accent.muted};
  border-radius: ${layout.borderRadius.md};
  font-size: ${typography.fontSize.xs};
  color: ${colors.accent.primary};
  display: flex;
  align-items: center;
  gap: ${spacing[2]};
`;

// FAQ
const FAQGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[3]};
`;

const FAQItem = styled.div<{ $isOpen: boolean }>`
  background: ${colors.background.secondary};
  border: 1px solid ${props => props.$isOpen
    ? colors.accent.primary
    : colors.border.default};
  border-radius: ${layout.borderRadius.lg};
  overflow: hidden;
  transition: all ${effects.transition.normal};
`;

const FAQQuestion = styled.button`
  width: 100%;
  padding: ${spacing[5]} ${spacing[6]};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
`;

const FAQQuestionText = styled.span`
  font-family: ${typography.fontFamily.display};
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.medium};
  color: ${colors.text.primary};
`;

const FAQIcon = styled.div<{ $isOpen: boolean }>`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.text.tertiary};
  transition: transform ${effects.transition.normal};
  transform: rotate(${props => props.$isOpen ? '180deg' : '0deg'});
`;

const FAQAnswer = styled.div<{ $isOpen: boolean }>`
  padding: ${props => props.$isOpen ? `0 ${spacing[6]} ${spacing[5]}` : `0 ${spacing[6]}`};
  max-height: ${props => props.$isOpen ? '500px' : '0'};
  opacity: ${props => props.$isOpen ? 1 : 0};
  overflow: hidden;
  transition: all ${effects.transition.normal};
  font-size: ${typography.fontSize.sm};
  line-height: ${typography.lineHeight.relaxed};
  color: ${colors.text.secondary};
`;

// CTA
const CTASection = styled.div`
  text-align: center;
  padding: ${spacing[16]} ${spacing[6]};
  background: ${colors.background.secondary};
  border: 1px solid ${colors.border.default};
  border-radius: ${layout.borderRadius['2xl']};
`;

const CTATitle = styled.h2`
  font-family: ${typography.fontFamily.display};
  font-size: ${typography.fontSize['3xl']};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.text.primary};
  margin-bottom: ${spacing[4]};

  span {
    color: ${colors.accent.primary};
  }
`;

const CTASubtitle = styled.p`
  font-size: ${typography.fontSize.base};
  color: ${colors.text.secondary};
  margin-bottom: ${spacing[8]};
`;

// Icons
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke={colors.status.success} strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke={colors.status.error} strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const LightbulbIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
    <path d="M9 18h6M10 22h4M12 2v1M4.22 4.22l.7.7M1 12h1M4.22 19.78l.7-.7M21 12h1M19.78 4.22l-.7.7M19.78 19.78l-.7-.7M12 6a6 6 0 0 0-3 11.2V18a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-.8A6 6 0 0 0 12 6z" />
  </svg>
);

interface GuidePageProps {
  isDark?: boolean;
}

export const GuidePage: React.FC<GuidePageProps> = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-content > *',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }
      );

      gsap.utils.toArray('.animate-section').forEach((el: any) => {
        gsap.fromTo(el,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.8,
            scrollTrigger: { trigger: el, start: 'top 85%' }
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const faqs = [
    {
      question: "What is liquid staking?",
      answer: "Liquid staking lets you stake CSPR while receiving stCSPR tokens in return. These tokens represent your staked position and can be freely traded, transferred, or used in DeFi - all while earning ~17% APY rewards."
    },
    {
      question: "Is my stake secure?",
      answer: "Yes! StakeVue's smart contract follows best security practices. Your stake is distributed across top-performing validators to minimize risk. The code is open source and verifiable on GitHub."
    },
    {
      question: "How much can I earn?",
      answer: "Current APY is approximately 15-18% depending on network conditions. For example, staking 1000 CSPR would earn you roughly 170 CSPR per year in rewards."
    },
    {
      question: "Can I unstake anytime?",
      answer: "Yes! There's no lock-up period. You can unstake your stCSPR back to CSPR whenever you want. The standard Casper unbonding period applies (~14 hours)."
    },
    {
      question: "What's the minimum stake?",
      answer: "You can stake as little as 1 CSPR. We recommend keeping some CSPR for transaction fees (around 5 CSPR)."
    },
    {
      question: "How is stCSPR different from CSPR?",
      answer: "stCSPR is a liquid token representing your staked CSPR. Over time, 1 stCSPR becomes worth more CSPR as rewards accumulate."
    }
  ];

  const tutorials = [
    { title: "Install Casper Wallet", description: "Download the official Casper Wallet extension. Create a new wallet and securely save your recovery phrase.", tip: "Never share your recovery phrase" },
    { title: "Get Some CSPR", description: "Purchase CSPR on exchanges like Binance or OKX. Transfer to your wallet. For testnet, use the free faucet.", tip: "Start with a small amount to test" },
    { title: "Connect to StakeVue", description: "Click Connect in the top bar. Select your wallet and approve the connection.", tip: "Make sure you're on the correct network" },
    { title: "Stake Your CSPR", description: "Enter the amount to stake, review the preview, and click Stake. Sign in your wallet.", tip: "You'll receive stCSPR instantly" },
    { title: "Watch Rewards Grow", description: "Your CSPR is now earning ~17% APY. Track rewards in the dashboard.", tip: "Set price alerts for opportunities" }
  ];

  return (
    <Container ref={containerRef}>
      <HeroSection className="hero-content">
        <HeroLabel>Complete Guide</HeroLabel>
        <HeroTitle>Master Liquid Staking</HeroTitle>
        <HeroSubtitle>
          Learn how to earn passive income on your CSPR while keeping full liquidity.
          No lock-ups, no complexity - just rewards.
        </HeroSubtitle>
        <HeroButton onClick={() => navigate('/stake')}>
          Start Staking Now
        </HeroButton>
      </HeroSection>

      <StatsGrid className="animate-section">
        <StatCard><StatValue>~17%</StatValue><StatLabel>APY Rewards</StatLabel></StatCard>
        <StatCard><StatValue>Instant</StatValue><StatLabel>stCSPR Minting</StatLabel></StatCard>
        <StatCard><StatValue>No Lock</StatValue><StatLabel>Unstake Anytime</StatLabel></StatCard>
        <StatCard><StatValue>Secure</StatValue><StatLabel>Open Source</StatLabel></StatCard>
      </StatsGrid>

      <Section className="animate-section">
        <SectionHeader>
          <SectionLabel>Comparison</SectionLabel>
          <SectionTitle>Why Liquid Staking?</SectionTitle>
        </SectionHeader>
        <ComparisonGrid>
          <ComparisonCard $type="bad">
            <ComparisonTitle $type="bad">Traditional Staking</ComparisonTitle>
            <ComparisonList>
              <ComparisonItem><XIcon /> Tokens locked for weeks</ComparisonItem>
              <ComparisonItem><XIcon /> Long unbonding period</ComparisonItem>
              <ComparisonItem><XIcon /> Can't use in DeFi</ComparisonItem>
              <ComparisonItem><XIcon /> Miss market opportunities</ComparisonItem>
              <ComparisonItem><XIcon /> Complex validator management</ComparisonItem>
            </ComparisonList>
          </ComparisonCard>
          <ComparisonCard $type="good">
            <ComparisonTitle $type="good">Liquid Staking (StakeVue)</ComparisonTitle>
            <ComparisonList>
              <ComparisonItem><CheckIcon /> Fully liquid stCSPR tokens</ComparisonItem>
              <ComparisonItem><CheckIcon /> Unstake anytime</ComparisonItem>
              <ComparisonItem><CheckIcon /> Use in DeFi protocols</ComparisonItem>
              <ComparisonItem><CheckIcon /> Never miss opportunities</ComparisonItem>
              <ComparisonItem><CheckIcon /> We handle validators for you</ComparisonItem>
            </ComparisonList>
          </ComparisonCard>
        </ComparisonGrid>
      </Section>

      <Section className="animate-section">
        <SectionHeader>
          <SectionLabel>Tutorial</SectionLabel>
          <SectionTitle>How to Stake in 5 Steps</SectionTitle>
        </SectionHeader>
        <TutorialGrid>
          {tutorials.map((t, i) => (
            <TutorialStep key={i}>
              <StepNumber>0{i + 1}</StepNumber>
              <StepContent>
                <StepTitle>{t.title}</StepTitle>
                <StepDescription>{t.description}</StepDescription>
                <StepTip><LightbulbIcon /> {t.tip}</StepTip>
              </StepContent>
            </TutorialStep>
          ))}
        </TutorialGrid>
      </Section>

      <Section className="animate-section">
        <SectionHeader>
          <SectionLabel>FAQ</SectionLabel>
          <SectionTitle>Frequently Asked Questions</SectionTitle>
        </SectionHeader>
        <FAQGrid>
          {faqs.map((faq, i) => (
            <FAQItem key={i} $isOpen={openFAQ === i}>
              <FAQQuestion onClick={() => setOpenFAQ(openFAQ === i ? null : i)}>
                <FAQQuestionText>{faq.question}</FAQQuestionText>
                <FAQIcon $isOpen={openFAQ === i}><ChevronIcon /></FAQIcon>
              </FAQQuestion>
              <FAQAnswer $isOpen={openFAQ === i}>{faq.answer}</FAQAnswer>
            </FAQItem>
          ))}
        </FAQGrid>
      </Section>

      <CTASection className="animate-section">
        <CTATitle>Ready to <span>Start Earning</span>?</CTATitle>
        <CTASubtitle>Join the Casper community earning passive rewards</CTASubtitle>
        <HeroButton onClick={() => navigate('/stake')}>Start Staking Now</HeroButton>
      </CTASection>
    </Container>
  );
};

export default GuidePage;
