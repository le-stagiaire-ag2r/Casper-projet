import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`;

const TooltipTrigger = styled.span`
  cursor: help;
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
`;

const InfoIcon = styled.span<{ $isDark: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.08)'};
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.4)'};
  font-size: 10px;
  font-weight: 700;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$isDark
      ? 'rgba(88, 86, 214, 0.3)'
      : 'rgba(88, 86, 214, 0.2)'};
    color: #5856d6;
  }
`;

const TooltipContent = styled.div<{ $isDark: boolean; $x: number; $y: number }>`
  position: fixed;
  left: ${props => props.$x}px;
  top: ${props => props.$y}px;
  transform: translateX(-50%);
  padding: 12px 16px;
  background: ${props => props.$isDark
    ? 'rgba(20, 20, 35, 0.98)'
    : 'rgba(255, 255, 255, 0.98)'};
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.15)'
    : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  z-index: 999999;
  min-width: 200px;
  max-width: 300px;
  animation: ${fadeIn} 0.15s ease;
  pointer-events: none;
`;

const TooltipTitle = styled.div<{ $isDark: boolean }>`
  font-size: 13px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  margin-bottom: 6px;
`;

const TooltipText = styled.div<{ $isDark: boolean }>`
  font-size: 12px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.7)'
    : 'rgba(0, 0, 0, 0.6)'};
  line-height: 1.5;
`;

interface TooltipProps {
  title?: string;
  content: string;
  isDark: boolean;
  children?: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({
  title,
  content,
  isDark,
  children
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
    }
  }, [isVisible]);

  const tooltipPortal = isVisible ? ReactDOM.createPortal(
    <TooltipContent $isDark={isDark} $x={position.x} $y={position.y}>
      {title && <TooltipTitle $isDark={isDark}>{title}</TooltipTitle>}
      <TooltipText $isDark={isDark}>{content}</TooltipText>
    </TooltipContent>,
    document.body
  ) : null;

  return (
    <>
      <TooltipTrigger
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children || <InfoIcon $isDark={isDark}>?</InfoIcon>}
      </TooltipTrigger>
      {tooltipPortal}
    </>
  );
};

export default Tooltip;
