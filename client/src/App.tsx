import React, { useState, useCallback } from 'react';
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
import { Dashboard } from './components/Dashboard';
import { StakingForm } from './components/StakingForm';
import { StakeHistory } from './components/StakeHistory';

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
    transition: background 0.3s ease, color 0.3s ease;
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
  padding: 20px;
  padding-top: 80px; /* Space for CSPR.click top bar */
`;

const Header = styled.header`
  max-width: 1200px;
  margin: 0 auto 40px;
  text-align: center;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const LogoIcon = styled.div`
  font-size: 48px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
`;

const LogoText = styled.h1`
  font-size: 42px;
  font-weight: 800;
  background: linear-gradient(135deg, #ff2d55 0%, #5856d6 50%, #af52de 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -1px;
`;

const Tagline = styled.p<{ $isDark: boolean }>`
  font-size: 18px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(0, 0, 0, 0.5)'};
  font-weight: 500;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const Footer = styled.footer<{ $isDark: boolean }>`
  max-width: 1200px;
  margin: 48px auto 0;
  padding: 32px 0;
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
        <Header>
          <Logo>
            <LogoIcon>💎</LogoIcon>
            <LogoText>StakeVue</LogoText>
          </Logo>
          <Tagline $isDark={isDark}>Liquid Staking on Casper Network</Tagline>
        </Header>

        <MainContent>
          <Dashboard />

          <Grid>
            <StakingForm />
            <StakeHistory />
          </Grid>
        </MainContent>

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
          </FooterLinks>
          <p style={{ marginTop: '16px', fontSize: '12px', opacity: 0.7 }}>
            Powered by CSPR.click | Built for Casper Hackathon
          </p>
        </Footer>
      </AppContainer>
    </>
  );
};

// Main App component with ClickProvider wrapper
const App: React.FC = () => {
  const [themeMode, setThemeMode] = useState<ThemeModeType>(ThemeModeType.dark);

  const csprClickTheme = themeMode === ThemeModeType.dark ? CsprClickThemes.dark : CsprClickThemes.light;

  const handleThemeSwitch = useCallback(() => {
    setThemeMode(prev => prev === ThemeModeType.dark ? ThemeModeType.light : ThemeModeType.dark);
  }, []);

  return (
    <ThemeProvider theme={csprClickTheme}>
      <ClickProvider options={clickOptions}>
        <AppContent
          isDark={themeMode === ThemeModeType.dark}
          themeMode={themeMode}
          onThemeSwitch={handleThemeSwitch}
        />
      </ClickProvider>
    </ThemeProvider>
  );
};

export default App;
