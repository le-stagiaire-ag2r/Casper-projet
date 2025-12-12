import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { colors, typography, spacing, layout, effects } from '../styles/designTokens';
import { TextMarquee } from '../components/ui/Marquee';
import { csprCloudApi, isProxyAvailable, motesToCSPR } from '../services/csprCloud';

gsap.registerPlugin(ScrollTrigger);

// Container
const Container = styled.div`
  max-width: ${layout.maxWidth};
  margin: 0 auto;
  overflow-x: hidden;
`;

const Section = styled.section`
  padding: ${spacing[24]} ${spacing[6]};
  position: relative;

  @media (max-width: 768px) {
    padding: ${spacing[16]} ${spacing[4]};
  }
`;

// Hero Section
const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: ${spacing[20]} ${spacing[6]};
  position: relative;
`;

const HeroContent = styled.div`
  max-width: 1000px;
  z-index: 1;
`;

const HeroLabel = styled.span`
  display: inline-block;
  font-family: ${typography.fontFamily.mono};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.medium};
  color: ${colors.accent.primary};
  text-transform: uppercase;
  letter-spacing: ${typography.letterSpacing.widest};
  margin-bottom: ${spacing[6]};
  padding: ${spacing[2]} ${spacing[4]};
  background: ${colors.accent.muted};
  border-radius: ${layout.borderRadius.full};
`;

const HeroTitle = styled.h1`
  font-family: ${typography.fontFamily.display};
  font-size: clamp(${typography.fontSize['5xl']}, 10vw, ${typography.fontSize['9xl']});
  font-weight: ${typography.fontWeight.black};
  color: ${colors.text.primary};
  line-height: ${typography.lineHeight.none};
  letter-spacing: ${typography.letterSpacing.tighter};
  margin-bottom: ${spacing[6]};

  span {
    display: block;
    color: ${colors.text.tertiary};
    -webkit-text-stroke: 1px ${colors.text.tertiary};
    -webkit-text-fill-color: transparent;
  }
`;

const HeroSubtitle = styled.p`
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.normal};
  color: ${colors.text.secondary};
  max-width: 600px;
  margin: 0 auto ${spacing[10]};
  line-height: ${typography.lineHeight.relaxed};

  @media (max-width: 768px) {
    font-size: ${typography.fontSize.base};
  }
`;

const HeroButtons = styled.div`
  display: flex;
  gap: ${spacing[4]};
  justify-content: center;
  flex-wrap: wrap;
`;

const PrimaryButton = styled.button`
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
  box-shadow: ${effects.shadow.glow};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${effects.shadow.glowStrong};
  }
`;

const SecondaryButton = styled.button`
  padding: ${spacing[4]} ${spacing[8]};
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: ${typography.letterSpacing.wider};
  color: ${colors.text.secondary};
  background: transparent;
  border: 1px solid ${colors.border.default};
  border-radius: ${layout.borderRadius.full};
  cursor: pointer;
  transition: all ${effects.transition.normal};

  &:hover {
    color: ${colors.text.primary};
    border-color: ${colors.text.primary};
  }
`;

const ScrollIndicator = styled.div`
  position: absolute;
  bottom: ${spacing[10]};
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[2]};
  color: ${colors.text.muted};
  font-size: ${typography.fontSize.xs};
  text-transform: uppercase;
  letter-spacing: ${typography.letterSpacing.widest};

  &::after {
    content: '';
    width: 1px;
    height: 40px;
    background: linear-gradient(to bottom, ${colors.text.muted}, transparent);
    animation: scrollLine 2s ease-in-out infinite;
  }

  @keyframes scrollLine {
    0%, 100% { opacity: 0.3; transform: scaleY(0.5); }
    50% { opacity: 1; transform: scaleY(1); }
  }
`;

// Stats Section
const StatsSection = styled(Section)`
  background: ${colors.background.secondary};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${spacing[1]};
  max-width: ${layout.contentWidth};
  margin: 0 auto;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  padding: ${spacing[10]} ${spacing[6]};
  text-align: center;
  background: ${colors.background.tertiary};
  border: 1px solid ${colors.border.default};
  transition: all ${effects.transition.normal};

  &:first-child {
    border-radius: ${layout.borderRadius.xl} 0 0 ${layout.borderRadius.xl};
  }

  &:last-child {
    border-radius: 0 ${layout.borderRadius.xl} ${layout.borderRadius.xl} 0;
  }

  @media (max-width: 1024px) {
    &:first-child {
      border-radius: ${layout.borderRadius.xl} 0 0 0;
    }
    &:nth-child(2) {
      border-radius: 0 ${layout.borderRadius.xl} 0 0;
    }
    &:nth-child(3) {
      border-radius: 0 0 0 ${layout.borderRadius.xl};
    }
    &:last-child {
      border-radius: 0 0 ${layout.borderRadius.xl} 0;
    }
  }

  @media (max-width: 640px) {
    &:first-child {
      border-radius: ${layout.borderRadius.xl} ${layout.borderRadius.xl} 0 0;
    }
    &:nth-child(2), &:nth-child(3) {
      border-radius: 0;
    }
    &:last-child {
      border-radius: 0 0 ${layout.borderRadius.xl} ${layout.borderRadius.xl};
    }
  }

  &:hover {
    background: ${colors.background.elevated};
  }
`;

const StatValue = styled.div`
  font-family: ${typography.fontFamily.display};
  font-size: ${typography.fontSize['4xl']};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.text.primary};
  margin-bottom: ${spacing[2]};

  @media (max-width: 768px) {
    font-size: ${typography.fontSize['3xl']};
  }
`;

const StatLabel = styled.div`
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.medium};
  color: ${colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: ${typography.letterSpacing.wider};
`;

const StatIndicator = styled.span<{ $live?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${spacing[1]};
  font-size: ${typography.fontSize.xs};
  color: ${props => props.$live ? colors.status.success : colors.text.muted};
  margin-left: ${spacing[2]};

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    background: ${props => props.$live ? colors.status.success : colors.text.muted};
    border-radius: 50%;
  }
`;

// Features Section
const FeaturesSection = styled(Section)`
  background: ${colors.background.primary};
`;

const SectionHeader = styled.div`
  text-align: center;
  max-width: 700px;
  margin: 0 auto ${spacing[16]};
`;

const SectionLabel = styled.span`
  display: inline-block;
  font-family: ${typography.fontFamily.mono};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.medium};
  color: ${colors.accent.primary};
  text-transform: uppercase;
  letter-spacing: ${typography.letterSpacing.widest};
  margin-bottom: ${spacing[4]};
`;

const SectionTitle = styled.h2`
  font-family: ${typography.fontFamily.display};
  font-size: clamp(${typography.fontSize['3xl']}, 5vw, ${typography.fontSize['6xl']});
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.text.primary};
  line-height: ${typography.lineHeight.tight};
  letter-spacing: ${typography.letterSpacing.tight};
  margin-bottom: ${spacing[4]};
`;

const SectionSubtitle = styled.p`
  font-size: ${typography.fontSize.lg};
  color: ${colors.text.secondary};
  line-height: ${typography.lineHeight.relaxed};
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${spacing[6]};
  max-width: ${layout.contentWidth};
  margin: 0 auto;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: ${spacing[4]};
  }
`;

const FeatureCard = styled.div`
  padding: ${spacing[10]};
  background: ${colors.background.secondary};
  border: 1px solid ${colors.border.default};
  border-radius: ${layout.borderRadius.xl};
  transition: all ${effects.transition.normal};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${colors.accent.primary};
    transform: scaleX(0);
    transform-origin: left;
    transition: transform ${effects.transition.normal};
  }

  &:hover {
    border-color: ${colors.border.hover};
    transform: translateY(-4px);

    &::before {
      transform: scaleX(1);
    }
  }
`;

const FeatureNumber = styled.span`
  display: block;
  font-family: ${typography.fontFamily.mono};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.medium};
  color: ${colors.accent.primary};
  margin-bottom: ${spacing[6]};
`;

const FeatureTitle = styled.h3`
  font-family: ${typography.fontFamily.display};
  font-size: ${typography.fontSize['2xl']};
  font-weight: ${typography.fontWeight.semibold};
  color: ${colors.text.primary};
  margin-bottom: ${spacing[4]};
`;

const FeatureDescription = styled.p`
  font-size: ${typography.fontSize.base};
  color: ${colors.text.secondary};
  line-height: ${typography.lineHeight.relaxed};
`;

// Benefits Section
const BenefitsSection = styled(Section)`
  background: ${colors.background.secondary};
`;

const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${spacing[6]};
  max-width: ${layout.contentWidth};
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BenefitCard = styled.div`
  display: flex;
  gap: ${spacing[5]};
  padding: ${spacing[8]};
  background: ${colors.background.tertiary};
  border: 1px solid ${colors.border.default};
  border-radius: ${layout.borderRadius.lg};
  transition: all ${effects.transition.normal};

  &:hover {
    border-color: ${colors.accent.primary};
    transform: translateX(8px);
  }
`;

const BenefitIcon = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.accent.muted};
  border-radius: ${layout.borderRadius.md};
  color: ${colors.accent.primary};
  flex-shrink: 0;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const BenefitContent = styled.div``;

const BenefitTitle = styled.h4`
  font-family: ${typography.fontFamily.display};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.semibold};
  color: ${colors.text.primary};
  margin-bottom: ${spacing[2]};
`;

const BenefitDescription = styled.p`
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.secondary};
  line-height: ${typography.lineHeight.relaxed};
`;

// CTA Section
const CTASection = styled(Section)`
  text-align: center;
  padding: ${spacing[32]} ${spacing[6]};
`;

const CTATitle = styled.h2`
  font-family: ${typography.fontFamily.display};
  font-size: clamp(${typography.fontSize['4xl']}, 8vw, ${typography.fontSize['7xl']});
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.text.primary};
  line-height: ${typography.lineHeight.tight};
  letter-spacing: ${typography.letterSpacing.tight};
  margin-bottom: ${spacing[6]};

  span {
    color: ${colors.accent.primary};
  }
`;

const CTASubtitle = styled.p`
  font-size: ${typography.fontSize.lg};
  color: ${colors.text.secondary};
  max-width: 500px;
  margin: 0 auto ${spacing[10]};
  line-height: ${typography.lineHeight.relaxed};
`;

// Marquee Section
const MarqueeSection = styled.div`
  padding: ${spacing[16]} 0;
`;

// Icons as SVG components
const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const TrendingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 6l-9.5 9.5-5-5L1 18" />
    <path d="M17 6h6v6" />
  </svg>
);

const UnlockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);

const ZapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

interface HomePageProps {
  isDark?: boolean;
}

interface NetworkStats {
  totalStaked: number;
  activeValidators: number;
  totalDelegators: number;
  csprPrice: number;
}

const FALLBACK_STATS: NetworkStats = {
  totalStaked: 6_971_726_448,
  activeValidators: 88,
  totalDelegators: 27000,
  csprPrice: 0.0057,
};

export const HomePage: React.FC<HomePageProps> = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  // Refs for GSAP animations
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  // GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.fromTo(
        '.hero-label',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.2 }
      );
      gsap.fromTo(
        '.hero-title',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, delay: 0.4 }
      );
      gsap.fromTo(
        '.hero-subtitle',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.7 }
      );
      gsap.fromTo(
        '.hero-buttons',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.9 }
      );

      // Stats scroll animation
      gsap.fromTo(
        '.stat-card',
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 80%',
          },
        }
      );

      // Features scroll animation
      gsap.fromTo(
        '.feature-card',
        { opacity: 0, y: 80 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.15,
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 75%',
          },
        }
      );

      // Benefits scroll animation
      gsap.fromTo(
        '.benefit-card',
        { opacity: 0, x: -40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.benefits-grid',
            start: 'top 80%',
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  // Fetch stats
  const fetchFromCsprCloud = useCallback(async () => {
    if (!isProxyAvailable()) return null;

    try {
      const metricsResponse = await csprCloudApi.getAuctionMetrics();
      const metrics = metricsResponse.data;

      let csprPrice = FALLBACK_STATS.csprPrice;
      try {
        const rateResponse = await csprCloudApi.getCurrentRate(1);
        csprPrice = rateResponse.data.amount;
      } catch {
        console.log('Price fetch failed');
      }

      let totalDelegators = FALLBACK_STATS.totalDelegators;
      try {
        const validatorsResponse = await csprCloudApi.getValidators(metrics.current_era_id, 100);
        totalDelegators = validatorsResponse.data.reduce(
          (sum, v) => sum + (v.delegators_number || 0),
          0
        );
      } catch {
        console.log('Validators fetch failed');
      }

      return {
        totalStaked: motesToCSPR(metrics.total_active_era_stake),
        activeValidators: metrics.active_validator_number,
        totalDelegators,
        csprPrice,
      };
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      const cloudData = await fetchFromCsprCloud();
      if (cloudData) {
        setStats(cloudData);
        setIsLive(true);
      } else {
        setStats(FALLBACK_STATS);
      }
      setLoading(false);
    };
    fetchStats();
  }, [fetchFromCsprCloud]);

  const formatNumber = (num: number) => {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(0) + 'K';
    return num.toFixed(0);
  };

  return (
    <Container>
      {/* Hero */}
      <HeroSection ref={heroRef}>
        <HeroContent>
          <HeroLabel className="hero-label">Liquid Staking on Casper</HeroLabel>
          <HeroTitle className="hero-title">
            Stake CSPR.
            <span>Earn Rewards.</span>
          </HeroTitle>
          <HeroSubtitle className="hero-subtitle">
            The liquid staking protocol that lets you earn ~17% APY while keeping
            full liquidity. Stake your CSPR, receive stCSPR, and use it anywhere.
          </HeroSubtitle>
          <HeroButtons className="hero-buttons">
            <PrimaryButton onClick={() => navigate('/stake')} data-cursor-hover>
              Start Staking
            </PrimaryButton>
            <SecondaryButton onClick={() => navigate('/guide')} data-cursor-hover>
              Learn More
            </SecondaryButton>
          </HeroButtons>
        </HeroContent>
        <ScrollIndicator>Scroll</ScrollIndicator>
      </HeroSection>

      {/* Stats */}
      <StatsSection ref={statsRef}>
        <StatsGrid>
          <StatCard className="stat-card">
            <StatValue>~17%</StatValue>
            <StatLabel>
              APY Rewards
              <StatIndicator $live>Live</StatIndicator>
            </StatLabel>
          </StatCard>
          <StatCard className="stat-card">
            <StatValue>{loading ? '...' : formatNumber(stats?.totalStaked || 0)}</StatValue>
            <StatLabel>
              Total Staked
              <StatIndicator $live={isLive}>{isLive ? 'Live' : 'Est'}</StatIndicator>
            </StatLabel>
          </StatCard>
          <StatCard className="stat-card">
            <StatValue>{loading ? '...' : stats?.activeValidators || 0}</StatValue>
            <StatLabel>
              Validators
              <StatIndicator $live={isLive}>{isLive ? 'Live' : 'Est'}</StatIndicator>
            </StatLabel>
          </StatCard>
          <StatCard className="stat-card">
            <StatValue>${loading ? '...' : stats?.csprPrice.toFixed(4) || '0.00'}</StatValue>
            <StatLabel>
              CSPR Price
              <StatIndicator $live={isLive}>{isLive ? 'Live' : 'Est'}</StatIndicator>
            </StatLabel>
          </StatCard>
        </StatsGrid>
      </StatsSection>

      {/* How it works */}
      <FeaturesSection ref={featuresRef}>
        <SectionHeader>
          <SectionLabel>How it works</SectionLabel>
          <SectionTitle>Three Steps to Start Earning</SectionTitle>
          <SectionSubtitle>
            Simple, secure, and transparent liquid staking
          </SectionSubtitle>
        </SectionHeader>
        <FeaturesGrid>
          <FeatureCard className="feature-card">
            <FeatureNumber>01</FeatureNumber>
            <FeatureTitle>Connect Wallet</FeatureTitle>
            <FeatureDescription>
              Connect your Casper wallet via CSPR.click. Compatible with
              Casper Wallet, Ledger, and more.
            </FeatureDescription>
          </FeatureCard>
          <FeatureCard className="feature-card">
            <FeatureNumber>02</FeatureNumber>
            <FeatureTitle>Stake CSPR</FeatureTitle>
            <FeatureDescription>
              Deposit any amount of CSPR. Instantly receive stCSPR tokens
              at 1:1 ratio representing your stake.
            </FeatureDescription>
          </FeatureCard>
          <FeatureCard className="feature-card">
            <FeatureNumber>03</FeatureNumber>
            <FeatureTitle>Earn Rewards</FeatureTitle>
            <FeatureDescription>
              Your CSPR earns ~17% APY automatically. Use your stCSPR
              freely in DeFi or unstake anytime.
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>
      </FeaturesSection>

      {/* Marquee */}
      <MarqueeSection>
        <TextMarquee text="StakeVue" outline duration={25} />
      </MarqueeSection>

      {/* Benefits */}
      <BenefitsSection>
        <SectionHeader>
          <SectionLabel>Why StakeVue</SectionLabel>
          <SectionTitle>Built for the Casper Ecosystem</SectionTitle>
          <SectionSubtitle>
            The most advanced liquid staking solution
          </SectionSubtitle>
        </SectionHeader>
        <BenefitsGrid className="benefits-grid">
          <BenefitCard className="benefit-card">
            <BenefitIcon><UnlockIcon /></BenefitIcon>
            <BenefitContent>
              <BenefitTitle>Full Liquidity</BenefitTitle>
              <BenefitDescription>
                Your stCSPR tokens are fully liquid. Trade, transfer, or use in DeFi
                while earning staking rewards.
              </BenefitDescription>
            </BenefitContent>
          </BenefitCard>
          <BenefitCard className="benefit-card">
            <BenefitIcon><TrendingIcon /></BenefitIcon>
            <BenefitContent>
              <BenefitTitle>~17% APY Returns</BenefitTitle>
              <BenefitDescription>
                Earn automatic staking rewards without any effort.
                Watch your balance grow over time.
              </BenefitDescription>
            </BenefitContent>
          </BenefitCard>
          <BenefitCard className="benefit-card">
            <BenefitIcon><ShieldIcon /></BenefitIcon>
            <BenefitContent>
              <BenefitTitle>Secure & Transparent</BenefitTitle>
              <BenefitDescription>
                Smart contract follows Casper security best practices.
                Open source and fully verifiable.
              </BenefitDescription>
            </BenefitContent>
          </BenefitCard>
          <BenefitCard className="benefit-card">
            <BenefitIcon><ZapIcon /></BenefitIcon>
            <BenefitContent>
              <BenefitTitle>Multi-Validator</BenefitTitle>
              <BenefitDescription>
                Automatic distribution across top validators to
                minimize risk and maximize returns.
              </BenefitDescription>
            </BenefitContent>
          </BenefitCard>
        </BenefitsGrid>
      </BenefitsSection>

      {/* CTA */}
      <CTASection>
        <CTATitle>
          Ready to <span>Start Earning</span>?
        </CTATitle>
        <CTASubtitle>
          Join the Casper community earning passive income with StakeVue
        </CTASubtitle>
        <PrimaryButton onClick={() => navigate('/stake')} data-cursor-hover>
          Start Staking Now
        </PrimaryButton>
      </CTASection>

      {/* Footer Marquee */}
      <TextMarquee
        text="Liquid Staking"
        duration={30}
        direction="right"
      />
    </Container>
  );
};

export default HomePage;
