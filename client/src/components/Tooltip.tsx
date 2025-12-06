import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`;

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  z-index: 100;
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

const TooltipContent = styled.div<{ $isDark: boolean; $position: 'top' | 'bottom' }>`
  position: absolute;
  ${props => props.$position === 'top' ? 'bottom: 100%' : 'top: 100%'};
  left: 50%;
  transform: translateX(-50%);
  ${props => props.$position === 'top' ? 'margin-bottom: 8px' : 'margin-top: 8px'};
  padding: 12px 16px;
  background: ${props => props.$isDark
    ? 'rgba(30, 30, 46, 0.98)'
    : 'rgba(255, 255, 255, 0.98)'};
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.15)'
    : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 99999;
  min-width: 200px;
  max-width: 300px;
  animation: ${fadeIn} 0.2s ease;

  &::before {
    content: '';
    position: absolute;
    ${props => props.$position === 'top' ? 'bottom: -6px' : 'top: -6px'};
    left: 50%;
    transform: translateX(-50%) ${props => props.$position === 'top' ? 'rotate(45deg)' : 'rotate(-135deg)'};
    width: 12px;
    height: 12px;
    background: ${props => props.$isDark
      ? 'rgba(30, 30, 46, 0.98)'
      : 'rgba(255, 255, 255, 0.98)'};
    border-right: 1px solid ${props => props.$isDark
      ? 'rgba(255, 255, 255, 0.15)'
      : 'rgba(0, 0, 0, 0.1)'};
    border-bottom: 1px solid ${props => props.$isDark
      ? 'rgba(255, 255, 255, 0.15)'
      : 'rgba(0, 0, 0, 0.1)'};
  }
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
  position?: 'top' | 'bottom';
  children?: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({
  title,
  content,
  isDark,
  position = 'top',
  children
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TooltipWrapper
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children || (
        <TooltipTrigger>
          <InfoIcon $isDark={isDark}>?</InfoIcon>
        </TooltipTrigger>
      )}
      {isVisible && (
        <TooltipContent $isDark={isDark} $position={position}>
          {title && <TooltipTitle $isDark={isDark}>{title}</TooltipTitle>}
          <TooltipText $isDark={isDark}>{content}</TooltipText>
        </TooltipContent>
      )}
    </TooltipWrapper>
  );
};

export default Tooltip;
