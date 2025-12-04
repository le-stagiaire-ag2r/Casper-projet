import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const Nav = styled.nav<{ $isDark: boolean }>`
  position: fixed;
  top: 60px; /* Below CSPR.click bar */
  left: 0;
  right: 0;
  z-index: 100;
  background: ${props => props.$isDark
    ? 'rgba(10, 10, 26, 0.95)'
    : 'rgba(255, 255, 255, 0.95)'};
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
`;

const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: center;
  gap: 8px;
`;

const NavItem = styled(NavLink)<{ $isDark: boolean }>`
  padding: 16px 24px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(0, 0, 0, 0.5)'};
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    color: ${props => props.$isDark ? '#fff' : '#000'};
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
        <NavItem to="/" $isDark={isDark} end>
          <NavIcon>🏠</NavIcon>
          Accueil
        </NavItem>
        <NavItem to="/stake" $isDark={isDark}>
          <NavIcon>💰</NavIcon>
          Stake
        </NavItem>
        <NavItem to="/guide" $isDark={isDark}>
          <NavIcon>📖</NavIcon>
          Guide
        </NavItem>
      </NavContainer>
    </Nav>
  );
};
