import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { LanguageSwitcher } from './LanguageSwitcher';

const Nav = styled.nav<{ $isDark: boolean }>`
  position: sticky;
  top: 0;
  z-index: 10; /* Lower than CSPR.click (which is ~1000) */
  background: ${props => props.$isDark
    ? 'rgba(10, 10, 26, 0.98)'
    : 'rgba(255, 255, 255, 0.98)'};
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
  margin-bottom: 20px;
`;

const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NavLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  flex: 1;
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
`;

const NavItem = styled(NavLink)<{ $isDark: boolean }>`
  padding: 16px 24px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(0, 0, 0, 0.6)'};
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
    background: ${props => props.$isDark
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.05)'};
  }

  &.active {
    color: #5856d6;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 3px;
      background: linear-gradient(135deg, #ff2d55, #5856d6);
      border-radius: 3px 3px 0 0;
    }
  }
`;

const NavIcon = styled.span`
  font-size: 18px;
`;

interface NavigationProps {
  isDark: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ isDark }) => {
  return (
    <Nav $isDark={isDark}>
      <NavContainer>
        <NavLinks>
          <NavItem to="/" $isDark={isDark} end>
            <NavIcon>🏠</NavIcon>
            Home
          </NavItem>
          <NavItem to="/stake" $isDark={isDark}>
            <NavIcon>💰</NavIcon>
            Stake
          </NavItem>
          <NavItem to="/guide" $isDark={isDark}>
            <NavIcon>📖</NavIcon>
            Guide
          </NavItem>
        </NavLinks>
        <NavRight>
          <LanguageSwitcher isDark={isDark} />
        </NavRight>
      </NavContainer>
    </Nav>
  );
};
