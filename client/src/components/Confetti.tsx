import React, { useEffect, useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';

const fall = keyframes`
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
`;

const ConfettiContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
`;

const ConfettiPiece = styled.div<{
  $color: string;
  $left: number;
  $delay: number;
  $duration: number;
  $size: number;
}>`
  position: absolute;
  top: -20px;
  left: ${props => props.$left}%;
  width: ${props => props.$size}px;
  height: ${props => props.$size * 0.6}px;
  background: ${props => props.$color};
  animation: ${fall} ${props => props.$duration}s ease-in ${props => props.$delay}s forwards;
  border-radius: 2px;
`;

const COLORS = [
  '#ff2d55', // Pink
  '#5856d6', // Purple
  '#30d158', // Green
  '#ff9f0a', // Orange
  '#af52de', // Magenta
  '#007aff', // Blue
  '#ffcc00', // Yellow
  '#00c7be', // Teal
];

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

interface Piece {
  id: number;
  color: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

export const Confetti: React.FC<ConfettiProps> = ({ active, onComplete }) => {
  const [pieces, setPieces] = useState<Piece[]>([]);

  const generatePieces = useCallback(() => {
    const newPieces: Piece[] = [];
    const count = 100;

    for (let i = 0; i < count; i++) {
      newPieces.push({
        id: i,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        size: 8 + Math.random() * 8,
      });
    }

    return newPieces;
  }, []);

  useEffect(() => {
    if (active) {
      setPieces(generatePieces());

      // Clear confetti after animation
      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [active, generatePieces, onComplete]);

  if (!active && pieces.length === 0) return null;

  return (
    <ConfettiContainer>
      {pieces.map(piece => (
        <ConfettiPiece
          key={piece.id}
          $color={piece.color}
          $left={piece.left}
          $delay={piece.delay}
          $duration={piece.duration}
          $size={piece.size}
        />
      ))}
    </ConfettiContainer>
  );
};

// Hook to trigger confetti
export const useConfetti = () => {
  const [showConfetti, setShowConfetti] = useState(false);

  const triggerConfetti = useCallback(() => {
    setShowConfetti(true);
  }, []);

  const handleComplete = useCallback(() => {
    setShowConfetti(false);
  }, []);

  const ConfettiComponent = () => (
    <Confetti active={showConfetti} onComplete={handleComplete} />
  );

  return { triggerConfetti, ConfettiComponent };
};

export default Confetti;
