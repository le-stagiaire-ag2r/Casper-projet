import React, { useEffect } from 'react';
import styled from 'styled-components';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Dashboard } from '../components/Dashboard';
import { StakingForm } from '../components/StakingForm';
import { StakeHistory } from '../components/StakeHistory';
import { V15StatsCard } from '../components/V15StatsCard';
import { WithdrawalStatus } from '../components/WithdrawalStatus';
import { PriceAlertComponent } from '../components/PriceAlert';
import { ExportCSV } from '../components/ExportCSV';
import { AdminPanel } from '../components/AdminPanel';
import { colors, typography, spacing, layout, effects } from '../styles/designTokens';

gsap.registerPlugin(ScrollTrigger);

const PageContainer = styled.div`
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
`;

const HeroHeader = styled.header`
  text-align: center;
  padding: ${spacing[16]} ${spacing[6]} ${spacing[8]};
  background: transparent;
  position: relative;
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
  letter-spacing: ${typography.letterSpacing.tight};
  line-height: ${typography.lineHeight.none};
  margin-bottom: ${spacing[4]};

  span {
    display: block;
    color: ${colors.text.tertiary};
    font-size: 0.6em;
    font-weight: ${typography.fontWeight.normal};
  }
`;

const HeroSubtitle = styled.p`
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.lg};
  color: ${colors.text.secondary};
  max-width: 500px;
  margin: 0 auto;
  line-height: ${typography.lineHeight.relaxed};
`;

const Section = styled.section`
  background: transparent;
  padding: ${spacing[12]} 0;
  position: relative;

  @media (max-width: 768px) {
    padding: ${spacing[8]} 0;
  }
`;

const SectionInner = styled.div`
  max-width: ${layout.contentWidth};
  margin: 0 auto;
  padding: 0 ${spacing[6]};

  @media (max-width: 768px) {
    padding: 0 ${spacing[4]};
  }
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
  font-size: clamp(${typography.fontSize['2xl']}, 4vw, ${typography.fontSize['4xl']});
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.text.primary};
  letter-spacing: ${typography.letterSpacing.tight};
  margin-bottom: ${spacing[2]};
`;

const SectionDescription = styled.p`
  font-size: ${typography.fontSize.base};
  color: ${colors.text.secondary};
  max-width: 600px;
  line-height: ${typography.lineHeight.relaxed};
`;

const InfoBanner = styled.div`
  background: ${colors.accent.muted};
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: ${layout.borderRadius.lg};
  padding: ${spacing[5]} ${spacing[6]};
  margin-bottom: ${spacing[8]};
  display: flex;
  align-items: flex-start;
  gap: ${spacing[4]};
`;

const InfoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${colors.accent.primary};
  border-radius: ${layout.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
    color: white;
  }
`;

const InfoContent = styled.div``;

const InfoTitle = styled.h3`
  font-family: ${typography.fontFamily.display};
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.semibold};
  color: ${colors.text.primary};
  margin-bottom: ${spacing[1]};
`;

const InfoText = styled.p`
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.secondary};
  line-height: ${typography.lineHeight.relaxed};
`;

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing[6]};

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const FullWidth = styled.div`
  margin-bottom: ${spacing[8]};
`;

const ToolsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing[6]};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoSvgIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

interface StakePageProps {
  isDark?: boolean;
}

export const StakePage: React.FC<StakePageProps> = ({ isDark = true }) => {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-title', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 });
      gsap.fromTo('.hero-subtitle', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.2 });

      gsap.utils.toArray('.animate-on-scroll').forEach((el: any) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <PageContainer>
      <HeroHeader>
        <HeroLabel>Liquid Staking</HeroLabel>
        <HeroTitle className="hero-title">
          Stake & Earn
          <span>Deposit CSPR, receive stCSPR</span>
        </HeroTitle>
        <HeroSubtitle className="hero-subtitle">
          Stake your CSPR tokens and receive liquid stCSPR while earning rewards automatically
        </HeroSubtitle>
      </HeroHeader>

      {/* Contract Stats */}
      <Section>
        <SectionInner>
          <InfoBanner className="animate-on-scroll">
            <InfoIcon>
              <InfoSvgIcon />
            </InfoIcon>
            <InfoContent>
              <InfoTitle>V22 Multi-Validator Staking</InfoTitle>
              <InfoText>
                Choose your validator, stake min 500 CSPR, and earn rewards!
                Unstaking queues a withdrawal (~7 eras unbonding period).
              </InfoText>
            </InfoContent>
          </InfoBanner>

          <FullWidth className="animate-on-scroll">
            <V15StatsCard />
          </FullWidth>

          <div className="animate-on-scroll">
            <Dashboard />
          </div>
        </SectionInner>
      </Section>

      {/* Staking Form & History */}
      <Section>
        <SectionInner>
          <SectionHeader className="animate-on-scroll">
            <SectionLabel>01 / Stake</SectionLabel>
            <SectionTitle>Stake & Unstake</SectionTitle>
            <SectionDescription>
              Deposit CSPR to receive stCSPR tokens. Your balance grows as rewards accumulate.
            </SectionDescription>
          </SectionHeader>

          <TwoColumnGrid className="animate-on-scroll">
            <StakingForm />
            <StakeHistory />
          </TwoColumnGrid>
        </SectionInner>
      </Section>

      {/* Withdrawal Status */}
      <Section>
        <SectionInner>
          <SectionHeader className="animate-on-scroll">
            <SectionLabel>02 / Withdrawals</SectionLabel>
            <SectionTitle>Pending Withdrawals</SectionTitle>
            <SectionDescription>
              Track your unstaking requests and claim when ready
            </SectionDescription>
          </SectionHeader>

          <FullWidth className="animate-on-scroll">
            <WithdrawalStatus />
          </FullWidth>
        </SectionInner>
      </Section>

      {/* Tools Section */}
      <Section>
        <SectionInner>
          <SectionHeader className="animate-on-scroll">
            <SectionLabel>03 / Tools</SectionLabel>
            <SectionTitle>Alerts & Export</SectionTitle>
            <SectionDescription>
              Set price alerts and export your staking data
            </SectionDescription>
          </SectionHeader>

          <ToolsGrid className="animate-on-scroll">
            <PriceAlertComponent isDark={isDark} />
            <ExportCSV isDark={isDark} />
          </ToolsGrid>
        </SectionInner>
      </Section>

      {/* Admin Section - Only visible to contract owner */}
      <Section>
        <SectionInner>
          <SectionHeader className="animate-on-scroll">
            <SectionLabel>04 / Admin</SectionLabel>
            <SectionTitle>Contract Administration</SectionTitle>
            <SectionDescription>
              Manage rewards, delegations, and pool liquidity
            </SectionDescription>
          </SectionHeader>

          <FullWidth className="animate-on-scroll">
            <AdminPanel isOwner={true} />
          </FullWidth>
        </SectionInner>
      </Section>
    </PageContainer>
  );
};

export default StakePage;
