import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { colors, typography, spacing } from '../../styles/designTokens';

gsap.registerPlugin(ScrollTrigger);

const RevealContainer = styled.section`
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const BackgroundText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 0;
  white-space: nowrap;
  pointer-events: none;
`;

const BackgroundWord = styled.span`
  display: block;
  font-family: ${typography.fontFamily.display};
  font-size: clamp(80px, 15vw, 200px);
  font-weight: ${typography.fontWeight.black};
  line-height: 0.85;
  letter-spacing: ${typography.letterSpacing.tighter};
  text-transform: uppercase;
  -webkit-text-stroke: 1px ${colors.border.hover};
  -webkit-text-fill-color: transparent;
  opacity: 0;

  &:nth-child(even) {
    margin-left: 10%;
  }
`;

const ForegroundContent = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[8]};
  padding: ${spacing[6]};
`;

const ContentCard = styled.div`
  background: ${colors.background.primary};
  border: 1px solid ${colors.border.default};
  border-radius: 24px;
  padding: ${spacing[12]};
  max-width: 600px;
  text-align: center;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);
`;

const ContentLabel = styled.span`
  display: inline-block;
  font-family: ${typography.fontFamily.mono};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.medium};
  color: ${colors.accent.primary};
  text-transform: uppercase;
  letter-spacing: ${typography.letterSpacing.widest};
  margin-bottom: ${spacing[4]};
`;

const ContentTitle = styled.h2`
  font-family: ${typography.fontFamily.display};
  font-size: clamp(${typography.fontSize['3xl']}, 5vw, ${typography.fontSize['5xl']});
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.text.primary};
  line-height: ${typography.lineHeight.tight};
  margin-bottom: ${spacing[4]};
`;

const ContentDescription = styled.p`
  font-size: ${typography.fontSize.lg};
  color: ${colors.text.secondary};
  line-height: ${typography.lineHeight.relaxed};
`;

interface ParallaxRevealProps {
  backgroundWords?: string[];
  label?: string;
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export const ParallaxReveal: React.FC<ParallaxRevealProps> = ({
  backgroundWords = ['STAKE', 'EARN', 'GROW'],
  label,
  title,
  description,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const words = wordsRef.current;
    const content = contentRef.current;

    if (!container || !words || !content) return;

    const wordElements = words.querySelectorAll('.bg-word');

    const ctx = gsap.context(() => {
      // Animate background words appearing
      wordElements.forEach((word, i) => {
        gsap.fromTo(
          word,
          {
            opacity: 0,
            y: 100,
            rotateX: -90,
          },
          {
            opacity: 0.15,
            y: 0,
            rotateX: 0,
            duration: 1.2,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: container,
              start: `top+=${i * 100} 80%`,
              end: `top+=${i * 100 + 200} 30%`,
              scrub: 1,
            },
          }
        );
      });

      // Parallax effect on words
      gsap.to(words, {
        y: -150,
        scrollTrigger: {
          trigger: container,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      });

      // Content card animation
      gsap.fromTo(
        content,
        { y: 80, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 60%',
          },
        }
      );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <RevealContainer ref={containerRef}>
      <BackgroundText ref={wordsRef}>
        {backgroundWords.map((word, i) => (
          <BackgroundWord key={i} className="bg-word">
            {word}
          </BackgroundWord>
        ))}
      </BackgroundText>

      <ForegroundContent ref={contentRef}>
        {children ? (
          children
        ) : (
          <ContentCard>
            {label && <ContentLabel>{label}</ContentLabel>}
            {title && <ContentTitle>{title}</ContentTitle>}
            {description && <ContentDescription>{description}</ContentDescription>}
          </ContentCard>
        )}
      </ForegroundContent>
    </RevealContainer>
  );
};

export default ParallaxReveal;
