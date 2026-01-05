import React, { useEffect } from 'react';
import styled from 'styled-components';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ValidatorRanking } from '../components/ValidatorRanking';
import { ValidatorComparator } from '../components/ValidatorComparator';
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
  max-width: 550px;
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

const FullWidth = styled.div`
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

const InfoSvgIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

interface ValidatorsPageProps {
  isDark?: boolean;
}

export const ValidatorsPage: React.FC<ValidatorsPageProps> = ({ isDark = true }) => {
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
        <HeroLabel>Validators</HeroLabel>
        <HeroTitle className="hero-title">
          Validator Network
          <span>Choose the best validator for your stake</span>
        </HeroTitle>
        <HeroSubtitle className="hero-subtitle">
          Explore the Casper validator ecosystem, compare performance metrics, and find the perfect validator for your needs
        </HeroSubtitle>
      </HeroHeader>

      {/* Info Banner */}
      <Section>
        <SectionInner>
          <InfoBanner className="animate-on-scroll">
            <InfoIcon>
              <InfoSvgIcon />
            </InfoIcon>
            <InfoContent>
              <InfoTitle>Why Validator Selection Matters</InfoTitle>
              <InfoText>
                Different validators offer different commission rates and performance levels.
                Choosing the right validator can maximize your staking rewards while supporting
                network decentralization. StakeVue is the only liquid staking protocol that lets
                you choose your validator!
              </InfoText>
            </InfoContent>
          </InfoBanner>
        </SectionInner>
      </Section>

      {/* Ranking Section */}
      <Section>
        <SectionInner>
          <SectionHeader className="animate-on-scroll">
            <SectionLabel>01 / Ranking</SectionLabel>
            <SectionTitle>Top Validators</SectionTitle>
            <SectionDescription>
              Validators ranked by performance, stake, and reliability
            </SectionDescription>
          </SectionHeader>

          <FullWidth className="animate-on-scroll">
            <ValidatorRanking isDark={isDark} />
          </FullWidth>
        </SectionInner>
      </Section>

      {/* Comparator Section */}
      <Section>
        <SectionInner>
          <SectionHeader className="animate-on-scroll">
            <SectionLabel>02 / Compare</SectionLabel>
            <SectionTitle>Validator Comparator</SectionTitle>
            <SectionDescription>
              Compare validators side by side to make an informed decision
            </SectionDescription>
          </SectionHeader>

          <FullWidth className="animate-on-scroll">
            <ValidatorComparator isDark={isDark} />
          </FullWidth>
        </SectionInner>
      </Section>
    </PageContainer>
  );
};

export default ValidatorsPage;
