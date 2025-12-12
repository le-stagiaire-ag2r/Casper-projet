import React, { useEffect, useRef } from 'react';
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
import { SettingsPanel } from '../components/SettingsPanel';
import { V15StatsCard } from '../components/V15StatsCard';
import { AdminPanel } from '../components/AdminPanel';
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

const Header = styled.header`
  text-align: center;
  margin-bottom: ${spacing[12]};
`;

const Title = styled.h1`
  font-family: ${typography.fontFamily.display};
  font-size: clamp(${typography.fontSize['4xl']}, 6vw, ${typography.fontSize['6xl']});
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.text.primary};
  letter-spacing: ${typography.letterSpacing.tight};
  margin-bottom: ${spacing[3]};
`;

const Subtitle = styled.p`
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.lg};
  color: ${colors.text.secondary};
  max-width: 500px;
  margin: 0 auto;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing[6]};
  margin-bottom: ${spacing[8]};

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const ChartsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing[6]};
  margin-bottom: ${spacing[8]};

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const FullWidthSection = styled.div`
  margin-bottom: ${spacing[8]};
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

const SectionTitle = styled.h2`
  font-family: ${typography.fontFamily.display};
  font-size: ${typography.fontSize['2xl']};
  font-weight: ${typography.fontWeight.semibold};
  color: ${colors.text.primary};
  margin-bottom: ${spacing[6]};
  padding-bottom: ${spacing[4]};
  border-bottom: 1px solid ${colors.border.default};
`;

// Icon component
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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate header
      gsap.fromTo(
        '.stake-header',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );

      // Animate info banner
      gsap.fromTo(
        '.info-banner',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.2 }
      );

      // Animate sections on scroll
      gsap.utils.toArray('.animate-section').forEach((el: any, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <Container ref={containerRef}>
      <Header className="stake-header">
        <Title>Stake & Unstake</Title>
        <Subtitle>
          Manage your staked CSPR and stCSPR tokens
        </Subtitle>
      </Header>

      <InfoBanner className="info-banner">
        <InfoIcon>
          <InfoSvgIcon />
        </InfoIcon>
        <InfoContent>
          <InfoTitle>V15 Exchange Rate</InfoTitle>
          <InfoText>
            This version features the exchange rate mechanism.
            Rewards added to the pool increase the rate, making stCSPR appreciate over time.
          </InfoText>
        </InfoContent>
      </InfoBanner>

      {/* V15 Stats Card - Exchange Rate & TVL */}
      <FullWidthSection className="animate-section">
        <V15StatsCard />
      </FullWidthSection>

      <div className="animate-section">
        <Dashboard />
      </div>

      <Grid className="animate-section">
        <StakingForm />
        <StakeHistory />
      </Grid>

      {/* Admin Panel - For owner to add rewards */}
      <FullWidthSection className="animate-section">
        <AdminPanel isOwner={true} />
      </FullWidthSection>

      <FullWidthSection className="animate-section">
        <SectionTitle>Staking Calculator</SectionTitle>
        <StakingCalculator />
      </FullWidthSection>

      <FullWidthSection className="animate-section">
        <SectionTitle>Validator Network</SectionTitle>
        <ValidatorRanking isDark={isDark} />
      </FullWidthSection>

      <FullWidthSection className="animate-section">
        <ValidatorComparator isDark={isDark} />
      </FullWidthSection>

      <FullWidthSection className="animate-section">
        <SectionTitle>Network Statistics</SectionTitle>
        <GlobalStats isDark={isDark} />
      </FullWidthSection>

      <FullWidthSection className="animate-section">
        <SectionTitle>Leaderboard</SectionTitle>
        <Leaderboard isDark={isDark} />
      </FullWidthSection>

      <ChartsSection className="animate-section">
        <TVLChart isDark={isDark} />
        <ExportCSV isDark={isDark} />
      </ChartsSection>

      <ChartsSection className="animate-section">
        <PortfolioHistory isDark={isDark} />
        <PriceAlertComponent isDark={isDark} />
      </ChartsSection>

      <div className="animate-section">
        <SettingsPanel isDark={isDark} />
      </div>
    </Container>
  );
};

export default StakePage;
