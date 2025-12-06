import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import {
  ClickProvider,
  ClickUI,
  CsprClickThemes,
  AccountCardMenuItem,
  CopyHashMenuItem,
  ViewAccountOnExplorerMenuItem,
  BuyCSPRMenuItem,
  ThemeModeType
} from '@make-software/csprclick-ui';
import { CsprClickInitOptions, CONTENT_MODE } from '@make-software/csprclick-core-types';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { StakePage } from './pages/StakePage';
import { GuidePage } from './pages/GuidePage';
import { BalanceProvider } from './context/BalanceContext';
import { LanguageProvider } from './context/LanguageContext';
import { FAQBot } from './components/FAQBot';

// Get runtime config
const config = window.config;

// CSPR.click initialization options
const clickOptions: CsprClickInitOptions = {
  appName: config.cspr_click_app_name,
  appId: config.cspr_click_app_id,
  contentMode: CONTENT_MODE.IFRAME,
  providers: config.cspr_click_providers,
};

// Global styles
const GlobalStyle = createGlobalStyle<{ $isDark: boolean }>`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
      'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: ${props => props.$isDark
      ? 'linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%)'
      : 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)'};
    min-height: 100vh;
    color: ${props => props.$isDark ? '#ffffff' : '#1a1a2e'};
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(128, 128, 128, 0.5);
    border-radius: 4px;
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  padding-top: 60px; /* Space for CSPR.click top bar only */
`;

const MainContent = styled.main`
  padding: 0 20px 20px;
`;

const Footer = styled.footer<{ $isDark: boolean }>`
  max-width: 1200px;
  margin: 48px auto 0;
  padding: 32px 20px;
  text-align: center;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  font-size: 14px;
  border-top: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
`;

const FooterLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
  flex-wrap: wrap;
`;

const FooterLink = styled.a`
  color: inherit;
  text-decoration: none;
  opacity: 0.8;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
    color: #5856d6;
  }
`;

// Inner App component with theme state
const AppContent: React.FC<{
  isDark: boolean;
  themeMode: ThemeModeType;
  onThemeSwitch: () => void;
}> = ({ isDark, themeMode, onThemeSwitch }) => {
  // Top bar settings with account menu items as React elements
  const topBarSettings = {
    onThemeSwitch,
    accountMenuItems: [
      <AccountCardMenuItem key="account" />,
      <CopyHashMenuItem key="copy" />,
      <ViewAccountOnExplorerMenuItem key="explorer" />,
      <BuyCSPRMenuItem key="buy" />,
    ],
  };

  return (
    <>
      <GlobalStyle $isDark={isDark} />
      {/* ClickUI with top bar */}
      <ClickUI
        themeMode={themeMode}
        topBarSettings={topBarSettings}
      />
      <AppContainer>
        {/* Navigation is now inside the container, below CSPR.click bar */}
        <Navigation isDark={isDark} />

        <MainContent>
          <Routes>
            <Route path="/" element={<HomePage isDark={isDark} />} />
            <Route path="/stake" element={<StakePage isDark={isDark} />} />
            <Route path="/guide" element={<GuidePage isDark={isDark} />} />
          </Routes>

          <Footer $isDark={isDark}>
            <p>StakeVue - Secure Liquid Staking Protocol</p>
            <FooterLinks>
              <FooterLink href="https://cspr.live" target="_blank" rel="noopener noreferrer">
                CSPR.live
              </FooterLink>
              <FooterLink href="https://docs.cspr.click" target="_blank" rel="noopener noreferrer">
                CSPR.click Docs
              </FooterLink>
              <FooterLink href="https://casper.network" target="_blank" rel="noopener noreferrer">
                Casper Network
              </FooterLink>
              <FooterLink href="https://github.com/le-stagiaire-ag2r/Casper-projet" target="_blank" rel="noopener noreferrer">
                GitHub
              </FooterLink>
            </FooterLinks>
            <p style={{ marginTop: '16px', fontSize: '12px', opacity: 0.7 }}>
              Powered by CSPR.click | Built for Casper Hackathon 2025
            </p>
          </Footer>
        </MainContent>

        {/* FAQ Bot - Floating chat assistant */}
        <FAQBot isDark={isDark} />
      </AppContainer>
    </>
  );
};

// Main App component with ClickProvider wrapper
const App: React.FC = () => {
  const [themeMode, setThemeMode] = useState<ThemeModeType>(ThemeModeType.dark);

  const csprClickTheme = {
    ...(themeMode === ThemeModeType.dark ? CsprClickThemes.dark : CsprClickThemes.light),
    mode: themeMode === ThemeModeType.dark ? 'dark' : 'light',
  };

  const handleThemeSwitch = useCallback(() => {
    setThemeMode(prev => prev === ThemeModeType.dark ? ThemeModeType.light : ThemeModeType.dark);
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider theme={csprClickTheme}>
        <ClickProvider options={clickOptions}>
          <LanguageProvider>
            <BalanceProvider>
              <AppContent
                isDark={themeMode === ThemeModeType.dark}
                themeMode={themeMode}
                onThemeSwitch={handleThemeSwitch}
              />
            </BalanceProvider>
          </LanguageProvider>
        </ClickProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
