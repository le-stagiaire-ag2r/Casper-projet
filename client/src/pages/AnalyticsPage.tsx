import React, { useEffect } from 'react';
import styled from 'styled-components';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { StakingCalculator } from '../components/StakingCalculator';
import { GlobalStats } from '../components/GlobalStats';
import { TVLChart } from '../components/TVLChart';
import { PortfolioHistory } from '../components/PortfolioHistory';
import { Leaderboard } from '../components/Leaderboard';
import { ExchangeRateChart } from '../components/ExchangeRateChart';
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

interface AnalyticsPageProps {
  isDark?: boolean;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ isDark = true }) => {
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
        <HeroLabel>Analytics</HeroLabel>
        <HeroTitle className="hero-title">
          Portfolio & Stats
          <span>Track your staking performance</span>
        </HeroTitle>
        <HeroSubtitle className="hero-subtitle">
          Monitor network statistics, analyze trends, and optimize your staking strategy
        </HeroSubtitle>
      </HeroHeader>

      {/* Calculator Section */}
      <Section>
        <SectionInner>
          <SectionHeader className="animate-on-scroll">
            <SectionLabel>01 / Calculator</SectionLabel>
            <SectionTitle>Estimate Your Rewards</SectionTitle>
            <SectionDescription>
              Calculate potential earnings based on your staking amount and duration
            </SectionDescription>
          </SectionHeader>

          <FullWidth className="animate-on-scroll">
            <StakingCalculator />
          </FullWidth>
        </SectionInner>
      </Section>

      {/* Network Stats Section */}
      <Section>
        <SectionInner>
          <SectionHeader className="animate-on-scroll">
            <SectionLabel>02 / Network</SectionLabel>
            <SectionTitle>Casper Network Statistics</SectionTitle>
            <SectionDescription>
              Live data from the Casper blockchain
            </SectionDescription>
          </SectionHeader>

          <FullWidth className="animate-on-scroll">
            <GlobalStats isDark={isDark} />
          </FullWidth>
        </SectionInner>
      </Section>

      {/* Exchange Rate Section */}
      <Section>
        <SectionInner>
          <SectionHeader className="animate-on-scroll">
            <SectionLabel>03 / Exchange Rate</SectionLabel>
            <SectionTitle>stCSPR Exchange Rate</SectionTitle>
            <SectionDescription>
              Track how your stCSPR grows in value over time as rewards accrue
            </SectionDescription>
          </SectionHeader>

          <FullWidth className="animate-on-scroll">
            <ExchangeRateChart isDark={isDark} />
          </FullWidth>
        </SectionInner>
      </Section>

      {/* Charts Section */}
      <Section>
        <SectionInner>
          <SectionHeader className="animate-on-scroll">
            <SectionLabel>04 / Charts</SectionLabel>
            <SectionTitle>TVL & Portfolio History</SectionTitle>
            <SectionDescription>
              Visualize trends and track your portfolio over time
            </SectionDescription>
          </SectionHeader>

          <TwoColumnGrid className="animate-on-scroll">
            <TVLChart isDark={isDark} />
            <PortfolioHistory isDark={isDark} />
          </TwoColumnGrid>
        </SectionInner>
      </Section>

      {/* Leaderboard Section */}
      <Section>
        <SectionInner>
          <SectionHeader className="animate-on-scroll">
            <SectionLabel>05 / Community</SectionLabel>
            <SectionTitle>Top Stakers</SectionTitle>
            <SectionDescription>
              See the top stakers in the StakeVue community
            </SectionDescription>
          </SectionHeader>

          <FullWidth className="animate-on-scroll">
            <Leaderboard isDark={isDark} />
          </FullWidth>
        </SectionInner>
      </Section>
    </PageContainer>
  );
};

export default AnalyticsPage;
