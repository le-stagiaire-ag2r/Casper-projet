import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../context/LanguageContext';

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 4px;
`;

const LangButton = styled.button<{ $isActive: boolean; $isDark: boolean }>`
  background: ${props => props.$isActive
    ? 'linear-gradient(135deg, #5856d6, #af52de)'
    : 'transparent'};
  color: ${props => props.$isActive
    ? '#fff'
    : props.$isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'};
  border: none;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: ${props => props.$isActive ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: ${props => props.$isActive
      ? 'linear-gradient(135deg, #5856d6, #af52de)'
      : props.$isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
  }
`;

const Flag = styled.span`
  font-size: 1rem;
`;

interface LanguageSwitcherProps {
  isDark: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ isDark }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <Container>
      <LangButton
        $isActive={language === 'en'}
        $isDark={isDark}
        onClick={() => setLanguage('en')}
      >
        <Flag>🇬🇧</Flag>
        EN
      </LangButton>
      <LangButton
        $isActive={language === 'fr'}
        $isDark={isDark}
        onClick={() => setLanguage('fr')}
      >
        <Flag>🇫🇷</Flag>
        FR
      </LangButton>
    </Container>
  );
};

export default LanguageSwitcher;
