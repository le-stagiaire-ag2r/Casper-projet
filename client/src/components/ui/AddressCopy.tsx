/**
 * AddressCopy Component
 * Displays a shortened address with a copy button
 * Reusable across the entire site
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { CopyIcon, CheckIcon } from './Icons';

interface AddressCopyProps {
  address: string;
  label?: string;
  showFull?: boolean;
  size?: 'small' | 'medium' | 'large';
  isDark?: boolean;
}

const Container = styled.div<{ $size: string }>`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.$size === 'small' ? '4px' : props.$size === 'large' ? '10px' : '6px'};
`;

const Label = styled.span<{ $isDark: boolean; $size: string }>`
  color: #8b5cf6;
  font-size: ${props => props.$size === 'small' ? '10px' : props.$size === 'large' ? '13px' : '11px'};
  font-weight: 600;
  text-transform: uppercase;
`;

const AddressText = styled.span<{ $isDark: boolean; $size: string }>`
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  font-size: ${props => props.$size === 'small' ? '11px' : props.$size === 'large' ? '14px' : '12px'};
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.7)'
    : 'rgba(0, 0, 0, 0.7)'};
`;

const CopyButton = styled.button<{ $isDark: boolean; $copied: boolean; $size: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: ${props => props.$size === 'small' ? '4px 8px' : props.$size === 'large' ? '6px 12px' : '5px 10px'};
  background: ${props => props.$copied
    ? 'rgba(48, 209, 88, 0.2)'
    : props.$isDark
      ? 'rgba(139, 92, 246, 0.15)'
      : 'rgba(139, 92, 246, 0.1)'};
  border: 1px solid ${props => props.$copied
    ? 'rgba(48, 209, 88, 0.4)'
    : 'rgba(139, 92, 246, 0.25)'};
  border-radius: 6px;
  color: ${props => props.$copied ? '#30d158' : '#8b5cf6'};
  font-size: ${props => props.$size === 'small' ? '10px' : props.$size === 'large' ? '12px' : '11px'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${props => props.$copied
      ? 'rgba(48, 209, 88, 0.3)'
      : 'rgba(139, 92, 246, 0.25)'};
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.98);
  }

  svg {
    flex-shrink: 0;
  }
`;

// Shorten address for display
const shortenAddress = (address: string, prefixLength = 6, suffixLength = 4): string => {
  if (!address) return '';
  if (address.length <= prefixLength + suffixLength + 3) return address;
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
};

export const AddressCopy: React.FC<AddressCopyProps> = ({
  address,
  label,
  showFull = false,
  size = 'medium',
  isDark = true,
}) => {
  const [copied, setCopied] = useState(false);

  const iconSize = size === 'small' ? 10 : size === 'large' ? 14 : 12;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  if (!address) return null;

  const displayAddress = showFull ? address : shortenAddress(address);

  return (
    <Container $size={size}>
      {label && <Label $isDark={isDark} $size={size}>{label}</Label>}
      <AddressText $isDark={isDark} $size={size}>{displayAddress}</AddressText>
      <CopyButton
        $isDark={isDark}
        $copied={copied}
        $size={size}
        onClick={handleCopy}
        title={copied ? 'Copied!' : 'Copy address'}
        type="button"
      >
        {copied ? (
          <>
            <CheckIcon size={iconSize} />
            <span>Copied</span>
          </>
        ) : (
          <>
            <CopyIcon size={iconSize} />
            <span>Copy</span>
          </>
        )}
      </CopyButton>
    </Container>
  );
};

export default AddressCopy;
