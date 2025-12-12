import React, { useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { colors } from '../../styles/designTokens';

// Floating words that will move around
const FLOATING_WORDS = [
  'STAKE', 'CSPR', 'EARN', 'DeFi', 'YIELD', 'REWARDS',
  'stCSPR', 'APY', 'LIQUID', 'CRYPTO', 'CASPER', 'GROW'
];

// Generate random float animation
const float1 = keyframes`
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(100px, -50px) rotate(5deg);
  }
  50% {
    transform: translate(50px, 100px) rotate(-5deg);
  }
  75% {
    transform: translate(-50px, 50px) rotate(3deg);
  }
`;

const float2 = keyframes`
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(-80px, 80px) rotate(-8deg);
  }
  66% {
    transform: translate(60px, -40px) rotate(8deg);
  }
`;

const float3 = keyframes`
  0%, 100% {
    transform: translate(0, 0);
  }
  20% {
    transform: translate(40px, 60px);
  }
  40% {
    transform: translate(-30px, 120px);
  }
  60% {
    transform: translate(80px, 80px);
  }
  80% {
    transform: translate(-60px, 20px);
  }
`;

const drift = keyframes`
  0% {
    transform: translateX(-100%) translateY(0);
    opacity: 0;
  }
  10% {
    opacity: 0.15;
  }
  90% {
    opacity: 0.15;
  }
  100% {
    transform: translateX(100vw) translateY(-50px);
    opacity: 0;
  }
`;

const driftReverse = keyframes`
  0% {
    transform: translateX(100vw) translateY(0);
    opacity: 0;
  }
  10% {
    opacity: 0.1;
  }
  90% {
    opacity: 0.1;
  }
  100% {
    transform: translateX(-100%) translateY(30px);
    opacity: 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 0.03;
    transform: scale(1);
  }
  50% {
    opacity: 0.08;
    transform: scale(1.1);
  }
`;

const twinkle = keyframes`
  0%, 100% {
    opacity: 0.1;
  }
  50% {
    opacity: 0.4;
  }
`;

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
`;

const FloatingWord = styled.span<{
  $x: number;
  $y: number;
  $size: number;
  $duration: number;
  $delay: number;
  $animation: number;
}>`
  position: absolute;
  left: ${props => props.$x}%;
  top: ${props => props.$y}%;
  font-size: ${props => props.$size}px;
  font-weight: 800;
  font-family: 'Inter', sans-serif;
  color: ${colors.text.primary};
  opacity: 0.03;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  animation: ${props => {
    switch(props.$animation % 3) {
      case 0: return float1;
      case 1: return float2;
      default: return float3;
    }
  }} ${props => props.$duration}s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;
  white-space: nowrap;
  user-select: none;
`;

const DriftingWord = styled.span<{
  $y: number;
  $size: number;
  $duration: number;
  $delay: number;
  $reverse?: boolean;
}>`
  position: absolute;
  top: ${props => props.$y}%;
  font-size: ${props => props.$size}px;
  font-weight: 900;
  font-family: 'Inter', sans-serif;
  color: ${colors.accent.primary};
  opacity: 0;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  animation: ${props => props.$reverse ? driftReverse : drift} ${props => props.$duration}s linear infinite;
  animation-delay: ${props => props.$delay}s;
  white-space: nowrap;
  user-select: none;
`;

const Particle = styled.div<{
  $x: number;
  $y: number;
  $size: number;
  $duration: number;
  $delay: number;
}>`
  position: absolute;
  left: ${props => props.$x}%;
  top: ${props => props.$y}%;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  background: ${colors.accent.primary};
  border-radius: 50%;
  opacity: 0.1;
  animation: ${twinkle} ${props => props.$duration}s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;
`;

const GlowOrb = styled.div<{
  $x: number;
  $y: number;
  $size: number;
  $duration: number;
}>`
  position: absolute;
  left: ${props => props.$x}%;
  top: ${props => props.$y}%;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  background: radial-gradient(circle, ${colors.accent.muted} 0%, transparent 70%);
  border-radius: 50%;
  animation: ${pulse} ${props => props.$duration}s ease-in-out infinite;
  filter: blur(40px);
`;

const GridLine = styled.div<{ $horizontal?: boolean; $position: number }>`
  position: absolute;
  ${props => props.$horizontal ? `
    left: 0;
    right: 0;
    top: ${props.$position}%;
    height: 1px;
  ` : `
    top: 0;
    bottom: 0;
    left: ${props.$position}%;
    width: 1px;
  `}
  background: linear-gradient(
    ${props => props.$horizontal ? '90deg' : '180deg'},
    transparent 0%,
    ${colors.border.default} 50%,
    transparent 100%
  );
  opacity: 0.3;
`;

interface FloatingBackgroundProps {
  intensity?: 'low' | 'medium' | 'high';
}

export const FloatingBackground: React.FC<FloatingBackgroundProps> = ({
  intensity = 'medium'
}) => {
  // Generate floating words
  const floatingWords = FLOATING_WORDS.map((word, i) => ({
    word,
    x: Math.random() * 90,
    y: Math.random() * 90,
    size: 12 + Math.random() * 24,
    duration: 20 + Math.random() * 30,
    delay: Math.random() * 10,
    animation: i,
  }));

  // Generate drifting words (horizontal movement)
  const driftingWords = [
    { word: 'STAKE', y: 15, size: 80, duration: 45, delay: 0, reverse: false },
    { word: 'EARN', y: 35, size: 60, duration: 55, delay: 10, reverse: true },
    { word: 'GROW', y: 55, size: 70, duration: 50, delay: 20, reverse: false },
    { word: 'DeFi', y: 75, size: 50, duration: 60, delay: 5, reverse: true },
    { word: 'CSPR', y: 85, size: 90, duration: 65, delay: 15, reverse: false },
  ];

  // Generate particles (small dots)
  const particles = Array.from({ length: intensity === 'high' ? 30 : intensity === 'medium' ? 20 : 10 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 4,
    duration: 3 + Math.random() * 4,
    delay: Math.random() * 5,
  }));

  // Generate glow orbs
  const glowOrbs = [
    { x: 10, y: 20, size: 400, duration: 8 },
    { x: 80, y: 60, size: 300, duration: 10 },
    { x: 50, y: 80, size: 350, duration: 12 },
  ];

  return (
    <Container>
      {/* Subtle grid lines */}
      <GridLine $horizontal $position={25} />
      <GridLine $horizontal $position={50} />
      <GridLine $horizontal $position={75} />
      <GridLine $position={25} />
      <GridLine $position={50} />
      <GridLine $position={75} />

      {/* Glow orbs */}
      {glowOrbs.map((orb, i) => (
        <GlowOrb
          key={`orb-${i}`}
          $x={orb.x}
          $y={orb.y}
          $size={orb.size}
          $duration={orb.duration}
        />
      ))}

      {/* Floating words (snow globe effect) */}
      {floatingWords.slice(0, intensity === 'high' ? 12 : intensity === 'medium' ? 8 : 5).map((item, i) => (
        <FloatingWord
          key={`float-${i}`}
          $x={item.x}
          $y={item.y}
          $size={item.size}
          $duration={item.duration}
          $delay={item.delay}
          $animation={item.animation}
        >
          {item.word}
        </FloatingWord>
      ))}

      {/* Drifting words (horizontal movement) */}
      {driftingWords.map((item, i) => (
        <DriftingWord
          key={`drift-${i}`}
          $y={item.y}
          $size={item.size}
          $duration={item.duration}
          $delay={item.delay}
          $reverse={item.reverse}
        >
          {item.word}
        </DriftingWord>
      ))}

      {/* Twinkling particles */}
      {particles.map((particle, i) => (
        <Particle
          key={`particle-${i}`}
          $x={particle.x}
          $y={particle.y}
          $size={particle.size}
          $duration={particle.duration}
          $delay={particle.delay}
        />
      ))}
    </Container>
  );
};

export default FloatingBackground;
