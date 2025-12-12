import React, { useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';

// Animation de flottement
const float = keyframes`
  0%, 100% {
    transform: translateY(0) rotate(-5deg);
  }
  25% {
    transform: translateY(-20px) rotate(5deg);
  }
  50% {
    transform: translateY(-10px) rotate(-3deg);
  }
  75% {
    transform: translateY(-25px) rotate(3deg);
  }
`;

// Animation de déplacement horizontal
const moveLeft = keyframes`
  0% {
    transform: translateX(100vw);
  }
  100% {
    transform: translateX(-150px);
  }
`;

const moveRight = keyframes`
  0% {
    transform: translateX(-150px);
  }
  100% {
    transform: translateX(100vw);
  }
`;

// Animation de pulsation douce - Couleurs violet/purple
const glow = keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 12px rgba(167, 139, 250, 0.6));
    opacity: 0.7;
  }
  50% {
    filter: drop-shadow(0 0 30px rgba(139, 92, 246, 0.9));
    opacity: 0.95;
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
  z-index: 2;
`;

interface GhostProps {
  $size: number;
  $top: number;
  $duration: number;
  $delay: number;
  $direction: 'left' | 'right';
  $floatDuration: number;
}

const Ghost = styled.div<GhostProps>`
  position: absolute;
  top: ${props => props.$top}%;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  animation:
    ${props => props.$direction === 'left' ? moveLeft : moveRight} ${props => props.$duration}s linear infinite,
    ${float} ${props => props.$floatDuration}s ease-in-out infinite,
    ${glow} 3s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;
  opacity: 0.85;

  ${props => props.$direction === 'left' ? css`
    right: -150px;
  ` : css`
    left: -150px;
  `}
`;

// SVG du fantôme Casper
const CasperGhost: React.FC<{ size: number; color?: string }> = ({ size, color = '#a855f7' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Corps du fantôme */}
    <path
      d="M50 10C30 10 15 25 15 45V70C15 72 16 74 18 74C20 74 22 72 22 70V68C22 66 24 64 26 64C28 64 30 66 30 68V72C30 74 32 76 34 76C36 76 38 74 38 72V68C38 66 40 64 42 64C44 64 46 66 46 68V74C46 76 48 78 50 78C52 78 54 76 54 74V68C54 66 56 64 58 64C60 64 62 66 62 68V72C62 74 64 76 66 76C68 76 70 74 70 72V68C70 66 72 64 74 64C76 64 78 66 78 68V70C78 72 80 74 82 74C84 74 85 72 85 70V45C85 25 70 10 50 10Z"
      fill={color}
      fillOpacity="0.9"
    />
    {/* Yeux */}
    <ellipse cx="38" cy="42" rx="8" ry="10" fill="#1a1a2e" />
    <ellipse cx="62" cy="42" rx="8" ry="10" fill="#1a1a2e" />
    {/* Reflets des yeux */}
    <ellipse cx="35" cy="39" rx="3" ry="4" fill="white" fillOpacity="0.8" />
    <ellipse cx="59" cy="39" rx="3" ry="4" fill="white" fillOpacity="0.8" />
    {/* Bouche souriante */}
    <path
      d="M40 55C40 55 45 62 50 62C55 62 60 55 60 55"
      stroke="#1a1a2e"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
    {/* Joues - couleur assortie violet */}
    <ellipse cx="28" cy="50" rx="5" ry="3" fill="#c4b5fd" fillOpacity="0.4" />
    <ellipse cx="72" cy="50" rx="5" ry="3" fill="#c4b5fd" fillOpacity="0.4" />
  </svg>
);

interface GhostData {
  id: number;
  size: number;
  top: number;
  duration: number;
  delay: number;
  direction: 'left' | 'right';
  floatDuration: number;
  color: string;
}

interface FloatingGhostsProps {
  count?: number;
}

export const FloatingGhosts: React.FC<FloatingGhostsProps> = ({ count = 8 }) => {
  const ghosts = useMemo<GhostData[]>(() => {
    // Couleurs violet/purple pour le thème
    const colors = ['#a78bfa', '#8b5cf6', '#c4b5fd', '#9333ea', '#a855f7'];

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: 30 + Math.random() * 40,
      top: 15 + Math.random() * 60,
      duration: 25 + Math.random() * 30,
      delay: Math.random() * 20,
      direction: i % 2 === 0 ? 'left' as const : 'right' as const,
      floatDuration: 3 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }, [count]);

  return (
    <Container>
      {ghosts.map((ghost) => (
        <Ghost
          key={ghost.id}
          $size={ghost.size}
          $top={ghost.top}
          $duration={ghost.duration}
          $delay={ghost.delay}
          $direction={ghost.direction}
          $floatDuration={ghost.floatDuration}
        >
          <CasperGhost size={ghost.size} color={ghost.color} />
        </Ghost>
      ))}
    </Container>
  );
};

export default FloatingGhosts;
