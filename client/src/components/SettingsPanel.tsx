import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { NotificationSettings } from './NotificationSettings';
import { NFTBadges } from './NFTBadges';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`;

const SettingsButton = styled.button<{ $isDark: boolean }>`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #5856d6 0%, #af52de 100%);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 20px rgba(88, 86, 214, 0.4);
  transition: all 0.3s ease;
  z-index: 100;

  &:hover {
    transform: scale(1.1) rotate(30deg);
    box-shadow: 0 6px 30px rgba(88, 86, 214, 0.5);
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
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  animation: ${fadeIn} 0.2s ease;
`;

const Panel = styled.div<{ $isDark: boolean; $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  max-width: 500px;
  height: 100vh;
  background: ${props => props.$isDark
    ? 'linear-gradient(180deg, #1a1a2e 0%, #0a0a1a 100%)'
    : 'linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%)'};
  z-index: 201;
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  flex-direction: column;
  animation: ${slideIn} 0.3s ease;
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.3);

  @media (max-width: 520px) {
    max-width: 100%;
  }
`;

const PanelHeader = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
`;

const PanelTitle = styled.h2<{ $isDark: boolean }>`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
`;

const CloseButton = styled.button<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.05)'};
  border: none;
  border-radius: 10px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$isDark
      ? 'rgba(255, 255, 255, 0.15)'
      : 'rgba(0, 0, 0, 0.1)'};
    transform: rotate(90deg);
  }
`;

const PanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(88, 86, 214, 0.3);
    border-radius: 3px;
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
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
      <SettingsButton $isDark={isDark} onClick={togglePanel} title="Settings">
        <span role="img" aria-label="settings">⚙️</span>
      </SettingsButton>

      <Overlay $isOpen={isOpen} onClick={closePanel} />

      <Panel $isDark={isDark} $isOpen={isOpen}>
        <PanelHeader $isDark={isDark}>
          <PanelTitle $isDark={isDark}>
            <span>⚙️</span>
            Settings & Extras
          </PanelTitle>
          <CloseButton $isDark={isDark} onClick={closePanel}>
            ✕
          </CloseButton>
        </PanelHeader>

        <PanelContent>
          <Section>
            <SectionTitle $isDark={isDark}>
              <span>🔔</span>
              Notifications
            </SectionTitle>
            <NotificationSettings isDark={isDark} />
          </Section>

          <Section>
            <SectionTitle $isDark={isDark}>
              <span>🏅</span>
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
