import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { colors, typography, effects, layout } from '../styles/designTokens';

const Nav = styled.nav`
  position: relative;
  z-index: 50;
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
  z-index: 101;

  &:hover {
    color: ${colors.accent.primary};
  }
`;

// Desktop Navigation Links
const NavLinks = styled.div`
  display: none;
  align-items: center;
  gap: 4px;

  @media (min-width: 769px) {
    display: flex;
  }
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
`;

const StatusIndicator = styled.div`
  display: none;
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

  @media (min-width: 769px) {
    display: flex;
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

// Mobile Menu Button
const MobileMenuButton = styled.button<{ $isOpen: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 101;
  padding: 8px;

  @media (min-width: 769px) {
    display: none;
  }

  span {
    display: block;
    width: 24px;
    height: 2px;
    background: ${colors.text.primary};
    border-radius: 2px;
    transition: all 0.3s ease;

    &:nth-child(1) {
      transform: ${props => props.$isOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'};
    }

    &:nth-child(2) {
      opacity: ${props => props.$isOpen ? 0 : 1};
      margin: 6px 0;
    }

    &:nth-child(3) {
      transform: ${props => props.$isOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none'};
    }
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Mobile Menu Overlay
const MobileMenu = styled.div<{ $isOpen: boolean }>`
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(10, 5, 20, 0.98);
  backdrop-filter: blur(20px);
  flex-direction: column;
  padding: 16px 0;
  border-bottom: 1px solid ${colors.border.default};
  animation: ${slideIn} 0.3s ease;
  z-index: 99;

  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileNavItem = styled(NavLink)`
  padding: 16px 24px;
  text-decoration: none;
  font-family: ${typography.fontFamily.body};
  font-weight: ${typography.fontWeight.medium};
  font-size: ${typography.fontSize.base};
  color: ${colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: ${typography.letterSpacing.wider};
  transition: all ${effects.transition.fast};
  border-left: 3px solid transparent;

  &:hover {
    color: ${colors.text.primary};
    background: rgba(139, 92, 246, 0.1);
    border-left-color: ${colors.accent.primary};
  }

  &.active {
    color: ${colors.text.primary};
    background: rgba(139, 92, 246, 0.15);
    border-left-color: ${colors.accent.primary};
  }
`;

const MobileStatusIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 24px;
  margin-top: 8px;
  border-top: 1px solid ${colors.border.default};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.medium};
  color: ${colors.status.success};
  text-transform: uppercase;
  letter-spacing: ${typography.letterSpacing.wider};
`;

interface NavigationProps {
  isDark?: boolean;
}

export const Navigation: React.FC<NavigationProps> = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <Nav>
      <NavContainer>
        <Logo to="/" onClick={closeMobileMenu}>StakeVue</Logo>

        {/* Desktop Navigation */}
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

        {/* Mobile Menu Button */}
        <MobileMenuButton
          $isOpen={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </MobileMenuButton>
      </NavContainer>

      {/* Mobile Menu */}
      <MobileMenu $isOpen={mobileMenuOpen}>
        <MobileNavItem to="/" end onClick={closeMobileMenu}>Home</MobileNavItem>
        <MobileNavItem to="/stake" onClick={closeMobileMenu}>Stake</MobileNavItem>
        <MobileNavItem to="/analytics" onClick={closeMobileMenu}>Analytics</MobileNavItem>
        <MobileNavItem to="/validators" onClick={closeMobileMenu}>Validators</MobileNavItem>
        <MobileNavItem to="/guide" onClick={closeMobileMenu}>Guide</MobileNavItem>
        <MobileStatusIndicator>
          <StatusDot />
          Testnet
        </MobileStatusIndicator>
      </MobileMenu>
    </Nav>
  );
};

export default Navigation;
