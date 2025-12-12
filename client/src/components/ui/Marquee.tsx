import React from 'react';
import styled, { keyframes } from 'styled-components';
import { colors, typography } from '../../styles/designTokens';

const scroll = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
`;

const MarqueeWrapper = styled.div<{ $background?: string }>`
  width: 100%;
  overflow: hidden;
  background: ${props => props.$background || 'transparent'};
  padding: 20px 0;
  border-top: 1px solid ${colors.border.default};
  border-bottom: 1px solid ${colors.border.default};
`;

const MarqueeTrack = styled.div<{ $duration?: number; $direction?: 'left' | 'right' }>`
  display: flex;
  width: fit-content;
  animation: ${scroll} ${props => props.$duration || 30}s linear infinite;
  animation-direction: ${props => props.$direction === 'right' ? 'reverse' : 'normal'};

  &:hover {
    animation-play-state: paused;
  }
`;

const MarqueeContent = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const MarqueeItem = styled.span<{ $size?: 'sm' | 'md' | 'lg' | 'xl' }>`
  font-family: ${typography.fontFamily.display};
  font-size: ${props => {
    switch (props.$size) {
      case 'sm': return typography.fontSize['2xl'];
      case 'md': return typography.fontSize['4xl'];
      case 'lg': return typography.fontSize['6xl'];
      case 'xl': return typography.fontSize['8xl'];
      default: return typography.fontSize['4xl'];
    }
  }};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.text.primary};
  text-transform: uppercase;
  letter-spacing: ${typography.letterSpacing.tight};
  white-space: nowrap;
  padding: 0 40px;

  @media (max-width: 768px) {
    font-size: ${props => {
      switch (props.$size) {
        case 'sm': return typography.fontSize.xl;
        case 'md': return typography.fontSize['2xl'];
        case 'lg': return typography.fontSize['4xl'];
        case 'xl': return typography.fontSize['5xl'];
        default: return typography.fontSize['2xl'];
      }
    }};
    padding: 0 20px;
  }
`;

const Separator = styled.span`
  font-size: ${typography.fontSize['3xl']};
  color: ${colors.accent.primary};
  padding: 0 20px;

  @media (max-width: 768px) {
    font-size: ${typography.fontSize.xl};
    padding: 0 10px;
  }
`;

interface MarqueeProps {
  items: string[];
  separator?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  duration?: number;
  direction?: 'left' | 'right';
  background?: string;
  repeat?: number;
}

export const Marquee: React.FC<MarqueeProps> = ({
  items,
  separator = '•',
  size = 'md',
  duration = 30,
  direction = 'left',
  background,
  repeat = 4,
}) => {
  // Repeat the items to create seamless loop
  const repeatedItems = Array(repeat).fill(items).flat();

  return (
    <MarqueeWrapper $background={background}>
      <MarqueeTrack $duration={duration} $direction={direction}>
        {[0, 1].map((_, groupIndex) => (
          <MarqueeContent key={groupIndex}>
            {repeatedItems.map((item, index) => (
              <React.Fragment key={`${groupIndex}-${index}`}>
                <MarqueeItem $size={size}>{item}</MarqueeItem>
                {index < repeatedItems.length - 1 && <Separator>{separator}</Separator>}
              </React.Fragment>
            ))}
          </MarqueeContent>
        ))}
      </MarqueeTrack>
    </MarqueeWrapper>
  );
};

// Simple text marquee
const SimpleMarqueeText = styled.span<{ $outline?: boolean }>`
  font-family: ${typography.fontFamily.display};
  font-size: ${typography.fontSize['7xl']};
  font-weight: ${typography.fontWeight.black};
  letter-spacing: ${typography.letterSpacing.tight};
  text-transform: uppercase;
  white-space: nowrap;
  padding: 0 60px;

  color: ${props => props.$outline ? 'transparent' : colors.text.primary};
  -webkit-text-stroke: ${props => props.$outline ? `2px ${colors.text.tertiary}` : 'none'};

  @media (max-width: 768px) {
    font-size: ${typography.fontSize['4xl']};
    padding: 0 30px;
    -webkit-text-stroke: ${props => props.$outline ? `1px ${colors.text.tertiary}` : 'none'};
  }
`;

interface TextMarqueeProps {
  text: string;
  outline?: boolean;
  duration?: number;
  direction?: 'left' | 'right';
}

export const TextMarquee: React.FC<TextMarqueeProps> = ({
  text,
  outline = false,
  duration = 20,
  direction = 'left',
}) => {
  return (
    <MarqueeWrapper>
      <MarqueeTrack $duration={duration} $direction={direction}>
        {[0, 1].map((groupIndex) => (
          <MarqueeContent key={groupIndex}>
            {Array(6).fill(text).map((item, index) => (
              <SimpleMarqueeText key={`${groupIndex}-${index}`} $outline={outline}>
                {item}
              </SimpleMarqueeText>
            ))}
          </MarqueeContent>
        ))}
      </MarqueeTrack>
    </MarqueeWrapper>
  );
};

export default Marquee;
