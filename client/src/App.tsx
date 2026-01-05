import React, { useState, useCallback, useEffect } from 'react';
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
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ValidatorsPage } from './pages/ValidatorsPage';
import { GuidePage } from './pages/GuidePage';
import { BalanceProvider } from './context/BalanceContext';
import { FAQBot } from './components/FAQBot';
import { CustomCursor } from './components/ui/CustomCursor';
import { GalaxyBackground } from './components/ui/GalaxyBackground';
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

  /* ===========================================
     FIX: CSPR Click dropdown - FORCE on top of everything
     =========================================== */

  /* CRITICAL: Force ALL CSPR Click dropdowns to be on top with fixed positioning */
  [data-radix-popper-content-wrapper] {
    z-index: 2147483647 !important; /* Max z-index value */
    position: fixed !important;
    isolation: isolate !important;
  }

  /* Force ClickUI topbar to be above navigation */
  #cspr-click-topbar,
  [class*="TopBar"],
  [class*="click-ui"],
  #cspr-click-ui {
    z-index: 1000 !important;
    position: relative !important;
    isolation: isolate !important;
  }

  /* Force ALL dropdowns, popovers, menus to max z-index */
  [class*="Popover"],
  [class*="popover"],
  [class*="AccountMenu"],
  [class*="ProductsMenu"],
  [role="menu"],
  [role="listbox"],
  [role="dialog"],
  [data-radix-menu-content],
  [data-radix-dropdown-menu-content],
  [data-radix-popper-content-wrapper] * {
    z-index: 2147483647 !important;
  }

  /* Ensure menu items are clickable and visible */
  [class*="AccountMenu"],
  [class*="Menu"],
  [class*="MenuItem"],
  [class*="click-ui"] ul,
  [class*="click-ui"] li,
  [class*="click-ui"] button,
  [class*="click-ui"] a,
  [data-radix-popper-content-wrapper] button,
  [data-radix-popper-content-wrapper] a {
    pointer-events: auto !important;
    position: relative !important;
  }

  /* FIX: Create large invisible bridge between trigger button and dropdown */
  [data-radix-popper-content-wrapper] {
    padding-top: 15px !important;
    margin-top: -15px !important;
    padding-left: 15px !important;
    padding-right: 15px !important;
    margin-left: -15px !important;
    margin-right: -15px !important;
  }

  /* FIX: Keep dropdown open */
  [data-state="open"],
  [data-state="open"] + [data-radix-popper-content-wrapper],
  [data-radix-popper-content-wrapper]:hover,
  [data-radix-popper-content-wrapper]:focus-within {
    visibility: visible !important;
    opacity: 1 !important;
    pointer-events: auto !important;
    display: block !important;
  }

  /* FIX: Extended hover zone */
  [role="menu"] {
    padding: 12px !important;
    margin: -12px !important;
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

  // FIX: Prevent CSPR Click dropdown from closing too quickly
  useEffect(() => {
    let hoverTimeout: NodeJS.Timeout | null = null;
    let isHoveringMenu = false;

    const handleDropdownBehavior = () => {
      // Find the dropdown wrapper
      const dropdownWrapper = document.querySelector('[data-radix-popper-content-wrapper]');
      const triggerButton = document.querySelector('[class*="click-ui"] button[aria-expanded="true"]');

      if (!dropdownWrapper) return;

      const keepOpen = () => {
        isHoveringMenu = true;
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
          hoverTimeout = null;
        }
        // Force dropdown to stay visible
        (dropdownWrapper as HTMLElement).style.pointerEvents = 'auto';
        (dropdownWrapper as HTMLElement).style.opacity = '1';
        (dropdownWrapper as HTMLElement).style.visibility = 'visible';
      };

      const scheduleClose = () => {
        isHoveringMenu = false;
        // Give user 300ms to re-enter the dropdown
        hoverTimeout = setTimeout(() => {
          if (!isHoveringMenu) {
            // Click outside to close properly
            const backdrop = document.querySelector('[data-radix-dismissable-layer]');
            if (backdrop) {
              document.body.click();
            }
          }
        }, 300);
      };

      // Add listeners to dropdown
      dropdownWrapper.addEventListener('mouseenter', keepOpen);
      dropdownWrapper.addEventListener('mouseleave', scheduleClose);

      // Also add listeners to trigger button
      if (triggerButton) {
        triggerButton.addEventListener('mouseenter', keepOpen);
        triggerButton.addEventListener('mouseleave', scheduleClose);
      }
    };

    // Watch for dropdown appearing
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              if (node.querySelector('[data-radix-popper-content-wrapper]') ||
                  node.matches('[data-radix-popper-content-wrapper]')) {
                setTimeout(handleDropdownBehavior, 50);
              }
            }
          });
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, []);

  return (
    <>
      <GlobalStyle />
      <CustomCursor />
      <GalaxyBackground />

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
            <Route path="/analytics" element={<AnalyticsPage isDark={isDark} />} />
            <Route path="/validators" element={<ValidatorsPage isDark={isDark} />} />
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
