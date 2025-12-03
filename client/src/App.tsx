import React, { useState, useCallback } from 'react';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import { ClickProvider, ClickUI, CsprClickThemes } from '@make-software/csprclick-ui';
import { CsprClickInitOptions, CONTENT_MODE } from '@make-software/csprclick-core-types';
import { Dashboard } from './components/Dashboard';
import { StakingForm } from './components/StakingForm';
import { StakeHistory } from './components/StakeHistory';

// Get runtime config
const config = window.config;

// Available networks
const NETWORKS = [
  { title: 'Testnet', key: 'casper-test' },
  { title: 'Mainnet', key: 'casper' },
];

// CSPR.click initialization options
const clickOptions: CsprClickInitOptions = {
  appName: config.cspr_click_app_name,
  appId: config.cspr_click_app_id,
  contentMode: CONTENT_MODE.IFRAME,
  providers: config.cspr_click_providers,
};

// App themes for light/dark mode
const lightTheme = {
  mode: 'light' as const,
  colors: {
    primary: '#ff2d55',
    secondary: '#5856d6',
    background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
    card: 'rgba(255, 255, 255, 0.95)',
    cardBorder: 'rgba(0, 0, 0, 0.08)',
    text: '#1a1a2e',
    textSecondary: '#6c757d',
    success: '#34c759',
    error: '#ff3b30',
    warning: '#ff9500',
    accent: '#af52de',
  },
};

const darkTheme = {
  mode: 'dark' as const,
  colors: {
    primary: '#ff375f',
    secondary: '#5e5ce6',
    background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%)',
    card: 'rgba(30, 30, 50, 0.9)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    text: '#ffffff',
    textSecondary: '#a0a0b0',
    success: '#30d158',
    error: '#ff453a',
    warning: '#ff9f0a',
    accent: '#bf5af2',
  },
};

// Global styles that adapt to theme
const GlobalStyle = createGlobalStyle<{ theme: typeof lightTheme }>`
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
    background: ${props => props.theme.colors.background};
    min-height: 100vh;
    color: ${props => props.theme.colors.text};
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

const Tagline = styled.p<{ theme: typeof lightTheme }>`
  font-size: 18px;
  color: ${props => props.theme.colors.textSecondary};
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

const Footer = styled.footer<{ theme: typeof lightTheme }>`
  max-width: 1200px;
  margin: 48px auto 0;
  padding: 32px 0;
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 14px;
  border-top: 1px solid ${props => props.theme.colors.cardBorder};
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
  }
`;

// Inner App component with theme and network state
const AppContent: React.FC<{
  currentTheme: typeof lightTheme;
  onThemeChange: (theme: 'light' | 'dark') => void;
  currentNetwork: string;
  onNetworkChange: (network: string) => void;
}> = ({ currentTheme, onThemeChange, currentNetwork, onNetworkChange }) => {
  // Top bar settings with account menu items
  const topBarSettings = {
    // Account menu items (from CSPR.click docs)
    accountMenuItems: [
      'AccountCardMenuItem',        // Shows account card with name, public key, balances
      'CopyHashMenuItem',           // Copy public key to clipboard
      'ViewAccountOnExplorerMenuItem', // Open account on CSPR.live
      'BuyCSPRMenuItem',            // Buy CSPR with credit card (Topper by Uphold)
    ],
  };

  // Network settings
  const networkSettings = {
    networks: NETWORKS.map(n => n.title),
    currentNetwork: NETWORKS.find(n => n.key === currentNetwork)?.title || 'Testnet',
    onNetworkSwitch: (networkTitle: string) => {
      const network = NETWORKS.find(n => n.title === networkTitle);
      if (network) {
        onNetworkChange(network.key);
        console.log('Network switched to:', network.key);
      }
    },
  };

  // Theme change handler for CSPR.click top bar
  const handleThemeChanged = (theme: string) => {
    onThemeChange(theme as 'light' | 'dark');
    console.log('Theme switched to:', theme);
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyle theme={currentTheme} />
      {/* ClickUI with full configuration */}
      <ClickUI
        topBarSettings={topBarSettings}
        // @ts-ignore - networkSettings type mismatch
        networkSettings={networkSettings}
        onThemeChanged={handleThemeChanged}
      />
      <AppContainer>
        <Header>
          <Logo>
            <LogoIcon>💎</LogoIcon>
            <LogoText>StakeVue</LogoText>
          </Logo>
          <Tagline theme={currentTheme}>
            Liquid Staking on Casper Network
          </Tagline>
        </Header>

        <MainContent>
          <Dashboard />

          <Grid>
            <StakingForm />
            <StakeHistory />
          </Grid>
        </MainContent>

        <Footer theme={currentTheme}>
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
    </ThemeProvider>
  );
};

// Main App component with ClickProvider wrapper
const App: React.FC = () => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  const [currentNetwork, setCurrentNetwork] = useState(config.chain_name || 'casper-test');

  const currentTheme = themeMode === 'dark' ? darkTheme : lightTheme;
  const csprClickTheme = themeMode === 'dark' ? CsprClickThemes.dark : CsprClickThemes.light;

  const handleThemeChange = useCallback((theme: 'light' | 'dark') => {
    setThemeMode(theme);
  }, []);

  const handleNetworkChange = useCallback((network: string) => {
    setCurrentNetwork(network);
    // Could trigger a reload or update config here
  }, []);

  return (
    <ThemeProvider theme={csprClickTheme}>
      <ClickProvider options={clickOptions}>
        <AppContent
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
          currentNetwork={currentNetwork}
          onNetworkChange={handleNetworkChange}
        />
      </ClickProvider>
    </ThemeProvider>
  );
};

export default App;
