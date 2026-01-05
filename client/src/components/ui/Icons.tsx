/**
 * SVG Icons for StakeVue
 * Consistent design language across the application
 */

import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

// Stake icon (arrow up with line)
export const StakeIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 19V5" />
    <path d="M5 12l7-7 7 7" />
  </svg>
);

// Unstake icon (arrow down with line)
export const UnstakeIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 5v14" />
    <path d="M19 12l-7 7-7-7" />
  </svg>
);

// Warning icon (triangle with exclamation)
export const WarningIcon: React.FC<IconProps> = ({ size = 16, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// Info icon (circle with i)
export const InfoIcon: React.FC<IconProps> = ({ size = 16, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

// Lightbulb icon (tip/suggestion)
export const TipIcon: React.FC<IconProps> = ({ size = 16, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14" />
  </svg>
);

// Sparkle icon (for rewards/receive)
export const SparkleIcon: React.FC<IconProps> = ({ size = 16, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
    <path d="M5 19l.5 1.5L7 21l-1.5.5L5 23l-.5-1.5L3 21l1.5-.5L5 19z" />
    <path d="M19 5l.5 1.5L21 7l-1.5.5L19 9l-.5-1.5L17 7l1.5-.5L19 5z" />
  </svg>
);

// Coins icon (for money/receive back)
export const CoinsIcon: React.FC<IconProps> = ({ size = 16, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1110.34 18" />
    <path d="M7 6h1v4" />
    <path d="M16.71 13.88l.7.71-2.82 2.82" />
  </svg>
);

// Rocket icon (for launch/stake action)
export const RocketIcon: React.FC<IconProps> = ({ size = 16, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

// Send icon (for unstake action)
export const SendIcon: React.FC<IconProps> = ({ size = 16, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

// Medal icons for rankings
export const GoldMedalIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="14" r="7" fill="#FFD700" stroke="#DAA520" strokeWidth="1.5" />
    <path d="M8 2L12 8L16 2" fill="#FF6B6B" stroke="#E53935" strokeWidth="1" />
    <text x="12" y="17" textAnchor="middle" fill="#8B6914" fontSize="8" fontWeight="bold">1</text>
  </svg>
);

export const SilverMedalIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="14" r="7" fill="#C0C0C0" stroke="#A8A8A8" strokeWidth="1.5" />
    <path d="M8 2L12 8L16 2" fill="#5C6BC0" stroke="#3F51B5" strokeWidth="1" />
    <text x="12" y="17" textAnchor="middle" fill="#666" fontSize="8" fontWeight="bold">2</text>
  </svg>
);

export const BronzeMedalIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="14" r="7" fill="#CD7F32" stroke="#A0522D" strokeWidth="1.5" />
    <path d="M8 2L12 8L16 2" fill="#66BB6A" stroke="#43A047" strokeWidth="1" />
    <text x="12" y="17" textAnchor="middle" fill="#5D3A1A" fontSize="8" fontWeight="bold">3</text>
  </svg>
);

// Copy icon
export const CopyIcon: React.FC<IconProps> = ({ size = 14, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

// Check icon
export const CheckIcon: React.FC<IconProps> = ({ size = 14, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Chart up icon (trending)
export const ChartUpIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

// Chart down icon
export const ChartDownIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);

export default {
  StakeIcon,
  UnstakeIcon,
  WarningIcon,
  InfoIcon,
  TipIcon,
  SparkleIcon,
  CoinsIcon,
  RocketIcon,
  SendIcon,
  GoldMedalIcon,
  SilverMedalIcon,
  BronzeMedalIcon,
  CopyIcon,
  CheckIcon,
  ChartUpIcon,
  ChartDownIcon,
};
