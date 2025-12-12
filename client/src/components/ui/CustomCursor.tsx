import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { gsap } from 'gsap';
import { colors, zIndex } from '../../styles/designTokens';

const CursorOuter = styled.div<{ $isHovering: boolean; $isClicking: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: ${props => props.$isHovering ? '60px' : '40px'};
  height: ${props => props.$isHovering ? '60px' : '40px'};
  border: 1px solid ${props => props.$isHovering ? colors.accent.primary : 'rgba(255, 255, 255, 0.3)'};
  border-radius: 50%;
  pointer-events: none;
  z-index: ${zIndex.cursor};
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease, border-color 0.3s ease, opacity 0.3s ease;
  opacity: ${props => props.$isClicking ? 0.5 : 1};
  mix-blend-mode: difference;

  @media (max-width: 768px) {
    display: none;
  }
`;

const CursorInner = styled.div<{ $isHovering: boolean; $isClicking: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: ${props => props.$isClicking ? '12px' : props.$isHovering ? '8px' : '6px'};
  height: ${props => props.$isClicking ? '12px' : props.$isHovering ? '8px' : '6px'};
  background: ${props => props.$isHovering ? colors.accent.primary : '#ffffff'};
  border-radius: 50%;
  pointer-events: none;
  z-index: ${zIndex.cursor + 1};
  transform: translate(-50%, -50%);
  transition: width 0.15s ease, height 0.15s ease, background 0.15s ease;

  @media (max-width: 768px) {
    display: none;
  }
`;

const CursorText = styled.div<{ $visible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  padding: 8px 16px;
  background: ${colors.accent.primary};
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border-radius: 20px;
  pointer-events: none;
  z-index: ${zIndex.cursor + 2};
  transform: translate(-50%, -50%);
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.2s ease;

  @media (max-width: 768px) {
    display: none;
  }
`;

interface CustomCursorProps {
  enabled?: boolean;
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ enabled = true }) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [cursorText, setCursorText] = useState('');

  useEffect(() => {
    if (!enabled) return;

    const outer = outerRef.current;
    const inner = innerRef.current;
    const text = textRef.current;

    if (!outer || !inner || !text) return;

    let mouseX = 0;
    let mouseY = 0;
    let outerX = 0;
    let outerY = 0;
    let innerX = 0;
    let innerY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check for interactive elements
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.dataset.cursorHover
      ) {
        setIsHovering(true);

        // Check for custom cursor text
        const cursorTextAttr = target.dataset.cursorText ||
          target.closest('[data-cursor-text]')?.getAttribute('data-cursor-text');
        if (cursorTextAttr) {
          setCursorText(cursorTextAttr);
        }
      }
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      setCursorText('');
    };

    // Animation loop
    const animate = () => {
      // Outer cursor - follows with delay
      outerX += (mouseX - outerX) * 0.12;
      outerY += (mouseY - outerY) * 0.12;

      // Inner cursor - follows quickly
      innerX += (mouseX - innerX) * 0.25;
      innerY += (mouseY - innerY) * 0.25;

      gsap.set(outer, { x: outerX, y: outerY });
      gsap.set(inner, { x: innerX, y: innerY });
      gsap.set(text, { x: innerX + 30, y: innerY - 20 });

      requestAnimationFrame(animate);
    };

    // Event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseout', handleMouseLeave);

    // Start animation
    const animationId = requestAnimationFrame(animate);

    // Hide default cursor
    document.body.style.cursor = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseLeave);
      cancelAnimationFrame(animationId);
      document.body.style.cursor = 'auto';
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <CursorOuter ref={outerRef} $isHovering={isHovering} $isClicking={isClicking} />
      <CursorInner ref={innerRef} $isHovering={isHovering} $isClicking={isClicking} />
      <CursorText ref={textRef} $visible={!!cursorText}>{cursorText}</CursorText>
    </>
  );
};

export default CustomCursor;
