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
import { FAQBot } from './components/FAQBot';
import { CustomCursor } from './components/ui/CustomCursor';
import { FloatingBackground } from './components/ui/FloatingBackground';
import { colors, typography, effects } from './styles/designTokens';

// Get runtime config
const config = window.config;

// CSPR.click initialization options
const clickOptions: CsprClickInitOptions = {
  appName: config.cspr_click_app_name,
  appId: config.cspr_click_app_id,
  contentMode: CONTENT_MODE.IFRAME,
  providers: config.cspr_click_providers,
};

// Global styles with new design system
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    scroll-behavior: auto;
  }

  body {
    font-family: ${typography.fontFamily.body};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: ${colors.background.primary};
    color: ${colors.text.primary};
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Selection */
  ::selection {
    background: ${colors.accent.primary};
    color: ${colors.text.primary};
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${colors.background.secondary};
  }

  ::-webkit-scrollbar-thumb {
    background: ${colors.border.hover};
    border-radius: 4px;

    &:hover {
      background: ${colors.text.muted};
    }
  }

  /* Links */
  a {
    color: inherit;
    text-decoration: none;
  }

  /* Buttons reset */
  button {
    font-family: inherit;
    cursor: pointer;
  }

  /* Focus styles */
  :focus-visible {
    outline: 2px solid ${colors.accent.primary};
    outline-offset: 2px;
  }

  /* Smooth animations for reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
`;

const MainContent = styled.main`
  position: relative;
`;

const Footer = styled.footer`
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid ${colors.border.default};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 24px;
    text-align: center;
  }
`;

const FooterBrand = styled.div`
  font-family: ${typography.fontFamily.display};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  color: ${colors.text.secondary};
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  justify-content: center;
`;

const FooterLink = styled.a`
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.tertiary};
  transition: color ${effects.transition.fast};

  &:hover {
    color: ${colors.text.primary};
  }
`;

const FooterMeta = styled.div`
  font-size: ${typography.fontSize.xs};
  color: ${colors.text.muted};
  text-transform: uppercase;
  letter-spacing: ${typography.letterSpacing.wider};
`;

// Inner App component with theme state
const AppContent: React.FC<{
  isDark: boolean;
  themeMode: ThemeModeType;
  onThemeSwitch: () => void;
}> = ({ isDark, themeMode, onThemeSwitch }) => {
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
      <GlobalStyle />
      <CustomCursor />
      <FloatingBackground intensity="medium" />

      <ClickUI
        themeMode={themeMode}
        topBarSettings={topBarSettings}
      />

      <AppContainer>
        <Navigation isDark={isDark} />

        <MainContent>
          <Routes>
            <Route path="/" element={<HomePage isDark={isDark} />} />
            <Route path="/stake" element={<StakePage isDark={isDark} />} />
            <Route path="/guide" element={<GuidePage isDark={isDark} />} />
          </Routes>

          <Footer>
            <FooterBrand>StakeVue</FooterBrand>
            <FooterLinks>
              <FooterLink href="https://cspr.live" target="_blank" rel="noopener noreferrer">
                Explorer
              </FooterLink>
              <FooterLink href="https://docs.cspr.click" target="_blank" rel="noopener noreferrer">
                Docs
              </FooterLink>
              <FooterLink href="https://casper.network" target="_blank" rel="noopener noreferrer">
                Casper
              </FooterLink>
              <FooterLink href="https://github.com/le-stagiaire-ag2r/Casper-projet" target="_blank" rel="noopener noreferrer">
                GitHub
              </FooterLink>
            </FooterLinks>
            <FooterMeta>Casper Hackathon 2025</FooterMeta>
          </Footer>
        </MainContent>

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
          <BalanceProvider>
            <AppContent
              isDark={themeMode === ThemeModeType.dark}
              themeMode={themeMode}
              onThemeSwitch={handleThemeSwitch}
            />
          </BalanceProvider>
        </ClickProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
