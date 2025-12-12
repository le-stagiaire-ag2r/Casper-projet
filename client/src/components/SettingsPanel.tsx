import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { NotificationSettings } from './NotificationSettings';
import { NFTBadges } from './NFTBadges';
import { colors, typography, spacing, layout, effects } from '../styles/designTokens';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`;

// SVG Icons
const SettingsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const AwardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

const SettingsButton = styled.button`
  position: fixed;
  bottom: 24px;
  right: 96px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${colors.background.elevated};
  border: 1px solid ${colors.border.default};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.text.secondary};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all ${effects.transition.normal};
  z-index: 999;

  &:hover {
    transform: scale(1.1) rotate(30deg);
    border-color: ${colors.accent.primary};
    color: ${colors.accent.primary};
    box-shadow: ${effects.shadow.glow};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  animation: ${fadeIn} 0.2s ease;
`;

const Panel = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  max-width: 500px;
  height: 100vh;
  background: ${colors.background.primary};
  z-index: 201;
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  flex-direction: column;
  animation: ${slideIn} 0.3s ease;
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.4);
  border-left: 1px solid ${colors.border.default};

  @media (max-width: 520px) {
    max-width: 100%;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing[5]} ${spacing[6]};
  border-bottom: 1px solid ${colors.border.default};
  background: ${colors.background.secondary};
`;

const PanelTitle = styled.h2`
  font-family: ${typography.fontFamily.display};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.semibold};
  color: ${colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${spacing[3]};
  margin: 0;
`;

const TitleIcon = styled.div`
  width: 36px;
  height: 36px;
  background: ${colors.accent.muted};
  border-radius: ${layout.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.accent.primary};
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  border-radius: ${layout.borderRadius.md};
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${colors.text.tertiary};
  transition: all ${effects.transition.fast};

  &:hover {
    background: ${colors.background.elevated};
    color: ${colors.text.primary};
  }
`;

const PanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${spacing[6]};
  display: flex;
  flex-direction: column;
  gap: ${spacing[8]};

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${colors.border.default};
    border-radius: 2px;
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[4]};
`;

const SectionTitle = styled.h3`
  font-family: ${typography.fontFamily.mono};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.medium};
  color: ${colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: ${typography.letterSpacing.wider};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${spacing[2]};
`;

const SectionIcon = styled.span`
  color: ${colors.accent.primary};
`;

interface SettingsPanelProps {
  isDark: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isDark }) => {
  const [isOpen, setIsOpen] = useState(false);

  const togglePanel = () => setIsOpen(!isOpen);
  const closePanel = () => setIsOpen(false);

  return (
    <>
      <SettingsButton onClick={togglePanel} title="Settings" data-cursor-hover>
        <SettingsIcon />
      </SettingsButton>

      <Overlay $isOpen={isOpen} onClick={closePanel} />

      <Panel $isOpen={isOpen}>
        <PanelHeader>
          <PanelTitle>
            <TitleIcon><SettingsIcon /></TitleIcon>
            Settings & Extras
          </PanelTitle>
          <CloseButton onClick={closePanel}>
            <CloseIcon />
          </CloseButton>
        </PanelHeader>

        <PanelContent>
          <Section>
            <SectionTitle>
              <SectionIcon><BellIcon /></SectionIcon>
              Notifications
            </SectionTitle>
            <NotificationSettings isDark={isDark} />
          </Section>

          <Section>
            <SectionTitle>
              <SectionIcon><AwardIcon /></SectionIcon>
              Achievements & Badges
            </SectionTitle>
            <NFTBadges isDark={isDark} />
          </Section>
        </PanelContent>
      </Panel>
    </>
  );
};

export default SettingsPanel;
