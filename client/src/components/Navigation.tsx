import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { colors, typography, effects, layout, zIndex } from '../styles/designTokens';

const Nav = styled.nav`
  position: relative;
  z-index: 10;
  background: ${colors.background.primary};
  border-bottom: 1px solid ${colors.border.default};
`;

const NavContainer = styled.div`
  max-width: ${layout.contentWidth};
  margin: 0 auto;
  padding: 0 ${layout.container.padding.mobile};
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (min-width: 768px) {
    padding: 0 ${layout.container.padding.tablet};
  }
`;

const Logo = styled(NavLink)`
  font-family: ${typography.fontFamily.display};
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.text.primary};
  text-decoration: none;
  letter-spacing: ${typography.letterSpacing.tight};
  transition: color ${effects.transition.fast};

  &:hover {
    color: ${colors.accent.primary};
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const NavItem = styled(NavLink)`
  position: relative;
  padding: 20px 24px;
  text-decoration: none;
  font-family: ${typography.fontFamily.body};
  font-weight: ${typography.fontWeight.medium};
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: ${typography.letterSpacing.wider};
  transition: color ${effects.transition.fast};

  &::after {
    content: '';
    position: absolute;
    bottom: 16px;
    left: 24px;
    right: 24px;
    height: 1px;
    background: ${colors.accent.primary};
    transform: scaleX(0);
    transform-origin: right;
    transition: transform ${effects.transition.normal};
  }

  &:hover {
    color: ${colors.text.primary};

    &::after {
      transform: scaleX(1);
      transform-origin: left;
    }
  }

  &.active {
    color: ${colors.text.primary};

    &::after {
      transform: scaleX(1);
    }
  }

  @media (max-width: 768px) {
    padding: 16px 12px;
    font-size: ${typography.fontSize.xs};

    &::after {
      bottom: 12px;
      left: 12px;
      right: 12px;
    }
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${colors.status.successMuted};
  border-radius: ${layout.borderRadius.full};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.medium};
  color: ${colors.status.success};
  text-transform: uppercase;
  letter-spacing: ${typography.letterSpacing.wider};

  @media (max-width: 640px) {
    display: none;
  }
`;

const StatusDot = styled.span`
  width: 6px;
  height: 6px;
  background: ${colors.status.success};
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }
`;

interface NavigationProps {
  isDark?: boolean;
}

export const Navigation: React.FC<NavigationProps> = () => {
  return (
    <Nav>
      <NavContainer>
        <Logo to="/">StakeVue</Logo>

        <NavLinks>
          <NavItem to="/" end>Home</NavItem>
          <NavItem to="/stake">Stake</NavItem>
          <NavItem to="/analytics">Analytics</NavItem>
          <NavItem to="/validators">Validators</NavItem>
          <NavItem to="/guide">Guide</NavItem>
        </NavLinks>

        <StatusIndicator>
          <StatusDot />
          Testnet
        </StatusIndicator>
      </NavContainer>
    </Nav>
  );
};

export default Navigation;
