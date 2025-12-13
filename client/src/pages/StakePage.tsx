import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Dashboard } from '../components/Dashboard';
import { StakingForm } from '../components/StakingForm';
import { StakeHistory } from '../components/StakeHistory';
import { StakingCalculator } from '../components/StakingCalculator';
import { ValidatorRanking } from '../components/ValidatorRanking';
import { GlobalStats } from '../components/GlobalStats';
import { PriceAlertComponent } from '../components/PriceAlert';
import { PortfolioHistory } from '../components/PortfolioHistory';
import { Leaderboard } from '../components/Leaderboard';
import { TVLChart } from '../components/TVLChart';
import { ExportCSV } from '../components/ExportCSV';
import { ValidatorComparator } from '../components/ValidatorComparator';
import { V15StatsCard } from '../components/V15StatsCard';
import { AdminPanel } from '../components/AdminPanel';
import { colors, typography, spacing, layout, effects } from '../styles/designTokens';

gsap.registerPlugin(ScrollTrigger);

// Page Container
const PageContainer = styled.div`
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  overflow-y: visible;
`;

// Section Styles - Transparent pour voir la galaxie
const Section = styled.section<{ $dark?: boolean }>`
  background: transparent;
  padding: ${spacing[16]} 0;
  position: relative;

  @media (max-width: 768px) {
    padding: ${spacing[12]} 0;
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

// Hero Header - Transparent pour voir la galaxie
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
  position: relative;
`;

const HeroTitle = styled.h1`
  font-family: ${typography.fontFamily.display};
  font-size: clamp(${typography.fontSize['4xl']}, 8vw, ${typography.fontSize['7xl']});
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.text.primary};
  letter-spacing: ${typography.letterSpacing.tight};
  line-height: ${typography.lineHeight.none};
  margin-bottom: ${spacing[4]};
  position: relative;

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
  position: relative;
`;

// Section Navigation - Transparent, just floating pills
// NOTE: z-index must be lower than CSPR.click dropdown (999999)
const SectionNav = styled.nav`
  position: sticky;
  top: 0;
  z-index: 10;
  background: transparent;
  padding: ${spacing[4]} 0;
`;

const NavInner = styled.div`
  max-width: ${layout.contentWidth};
  margin: 0 auto;
  padding: 0 ${spacing[6]};
  display: flex;
  justify-content: center;
  gap: ${spacing[2]};

  @media (max-width: 768px) {
    padding: 0 ${spacing[4]};
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const NavButton = styled.button<{ $active?: boolean }>`
  padding: ${spacing[2]} ${spacing[5]};
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: ${typography.letterSpacing.wider};
  color: ${props => props.$active ? colors.text.primary : colors.text.secondary};
  background: ${props => props.$active ? 'rgba(139, 92, 246, 0.3)' : 'rgba(30, 20, 50, 0.7)'};
  border: 1px solid ${props => props.$active ? 'rgba(139, 92, 246, 0.6)' : 'rgba(139, 92, 246, 0.2)'};
  border-radius: ${layout.borderRadius.full};
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all ${effects.transition.fast};
  white-space: nowrap;

  &:hover {
    color: ${colors.text.primary};
    background: rgba(139, 92, 246, 0.25);
    border-color: rgba(139, 92, 246, 0.4);
  }
`;

// Section Header
const SectionHeader = styled.div`
  margin-bottom: ${spacing[10]};
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
  font-size: clamp(${typography.fontSize['3xl']}, 5vw, ${typography.fontSize['5xl']});
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

// Info Banner
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

// Grid Layouts
const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing[6]};

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const ThreeColumnGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${spacing[6]};

  @media (max-width: 1100px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FullWidth = styled.div`
  margin-bottom: ${spacing[8]};
`;

// Icon
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

type ActiveSection = 'stake' | 'analytics' | 'validators' | 'settings';

export const StakePage: React.FC<StakePageProps> = ({ isDark = true }) => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('stake');
  const stakeRef = useRef<HTMLElement>(null);
  const analyticsRef = useRef<HTMLElement>(null);
  const validatorsRef = useRef<HTMLElement>(null);
  const settingsRef = useRef<HTMLElement>(null);

  const scrollToSection = (section: ActiveSection) => {
    const refs: Record<ActiveSection, React.RefObject<HTMLElement | null>> = {
      stake: stakeRef,
      analytics: analyticsRef,
      validators: validatorsRef,
      settings: settingsRef,
    };
    refs[section].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(section);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.fromTo('.hero-title', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 });
      gsap.fromTo('.hero-subtitle', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.2 });

      // Section animations
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

    // Update active section on scroll
    const handleScroll = () => {
      const sections = [
        { ref: stakeRef, name: 'stake' as const },
        { ref: analyticsRef, name: 'analytics' as const },
        { ref: validatorsRef, name: 'validators' as const },
        { ref: settingsRef, name: 'settings' as const },
      ];

      for (const section of sections) {
        if (section.ref.current) {
          const rect = section.ref.current.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom > 100) {
            setActiveSection(section.name);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      ctx.revert();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <PageContainer>
      {/* Hero Header */}
      <HeroHeader>
        <HeroTitle className="hero-title">
          Stake & Earn
          <span>Manage your liquid staking portfolio</span>
        </HeroTitle>
        <HeroSubtitle className="hero-subtitle">
          Stake CSPR, track analytics, explore validators, and customize your experience
        </HeroSubtitle>
      </HeroHeader>

      {/* Section Navigation */}
      <SectionNav>
        <NavInner>
          <NavButton
            $active={activeSection === 'stake'}
            onClick={() => scrollToSection('stake')}
          >
            Stake
          </NavButton>
          <NavButton
            $active={activeSection === 'analytics'}
            onClick={() => scrollToSection('analytics')}
          >
            Analytics
          </NavButton>
          <NavButton
            $active={activeSection === 'validators'}
            onClick={() => scrollToSection('validators')}
          >
            Validators
          </NavButton>
          <NavButton
            $active={activeSection === 'settings'}
            onClick={() => scrollToSection('settings')}
          >
            Settings
          </NavButton>
        </NavInner>
      </SectionNav>

      {/* STAKE SECTION */}
      <Section ref={stakeRef} id="stake">
        <SectionInner>
          <SectionHeader className="animate-on-scroll">
            <SectionLabel>01 / Staking</SectionLabel>
            <SectionTitle>Stake & Unstake</SectionTitle>
            <SectionDescription>
              Deposit CSPR to receive stCSPR tokens and start earning rewards automatically
            </SectionDescription>
          </SectionHeader>

          <InfoBanner className="animate-on-scroll">
            <InfoIcon>
              <InfoSvgIcon />
            </InfoIcon>
            <InfoContent>
              <InfoTitle>V17 Multi-Validator Staking</InfoTitle>
              <InfoText>
                Choose your validator, stake min 500 CSPR, and earn rewards!
                Unstaking queues a withdrawal (~7 eras unbonding).
              </InfoText>
            </InfoContent>
          </InfoBanner>

          <FullWidth className="animate-on-scroll">
            <V15StatsCard />
          </FullWidth>

          <div className="animate-on-scroll">
            <Dashboard />
          </div>

          <TwoColumnGrid className="animate-on-scroll" style={{ marginTop: spacing[8] }}>
            <StakingForm />
            <StakeHistory />
          </TwoColumnGrid>

          <FullWidth className="animate-on-scroll" style={{ marginTop: spacing[8] }}>
            <AdminPanel isOwner={true} />
          </FullWidth>
        </SectionInner>
      </Section>

      {/* ANALYTICS SECTION */}
      <Section ref={analyticsRef} id="analytics" $dark>
        <SectionInner>
          <SectionHeader className="animate-on-scroll">
            <SectionLabel>02 / Analytics</SectionLabel>
            <SectionTitle>Portfolio & Network Stats</SectionTitle>
            <SectionDescription>
              Track your staking performance, explore network statistics, and analyze trends
            </SectionDescription>
          </SectionHeader>

          <FullWidth className="animate-on-scroll">
            <StakingCalculator />
          </FullWidth>

          <FullWidth className="animate-on-scroll">
            <GlobalStats isDark={isDark} />
          </FullWidth>

          <TwoColumnGrid className="animate-on-scroll">
            <TVLChart isDark={isDark} />
            <PortfolioHistory isDark={isDark} />
          </TwoColumnGrid>

          <FullWidth className="animate-on-scroll" style={{ marginTop: spacing[8] }}>
            <Leaderboard isDark={isDark} />
          </FullWidth>
        </SectionInner>
      </Section>

      {/* VALIDATORS SECTION */}
      <Section ref={validatorsRef} id="validators">
        <SectionInner>
          <SectionHeader className="animate-on-scroll">
            <SectionLabel>03 / Validators</SectionLabel>
            <SectionTitle>Validator Network</SectionTitle>
            <SectionDescription>
              Explore the validator ecosystem, compare performance, and find the best validators
            </SectionDescription>
          </SectionHeader>

          <FullWidth className="animate-on-scroll">
            <ValidatorRanking isDark={isDark} />
          </FullWidth>

          <FullWidth className="animate-on-scroll">
            <ValidatorComparator isDark={isDark} />
          </FullWidth>
        </SectionInner>
      </Section>

      {/* SETTINGS SECTION */}
      <Section ref={settingsRef} id="settings" $dark>
        <SectionInner>
          <SectionHeader className="animate-on-scroll">
            <SectionLabel>04 / Tools</SectionLabel>
            <SectionTitle>Settings & Tools</SectionTitle>
            <SectionDescription>
              Configure alerts, export data, and customize your dashboard experience
            </SectionDescription>
          </SectionHeader>

          <TwoColumnGrid className="animate-on-scroll">
            <PriceAlertComponent isDark={isDark} />
            <ExportCSV isDark={isDark} />
          </TwoColumnGrid>
        </SectionInner>
      </Section>
    </PageContainer>
  );
};

export default StakePage;
