import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { WalletConnect } from './components/WalletConnect';
import { Dashboard } from './components/Dashboard';
import { StakingForm } from './components/StakingForm';
import { StakeHistory } from './components/StakeHistory';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%);
    min-height: 100vh;
    color: white;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  padding: 40px 20px;
`;

const Header = styled.header`
  max-width: 1200px;
  margin: 0 auto 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LogoIcon = styled.div`
  font-size: 32px;
`;

const LogoText = styled.h1`
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const Footer = styled.footer`
  max-width: 1200px;
  margin: 48px auto 0;
  padding: 24px 0;
  text-align: center;
  color: #999;
  font-size: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const App: React.FC = () => {
  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <Header>
          <Logo>
            <LogoIcon>💎</LogoIcon>
            <LogoText>StakeVue</LogoText>
          </Logo>
          <WalletConnect />
        </Header>

        <MainContent>
          <Dashboard />

          <Grid>
            <StakingForm />
            <div>
              {/* Placeholder for additional info or charts */}
              <StakeHistory />
            </div>
          </Grid>
        </MainContent>

        <Footer>
          <p>StakeVue - Liquid Staking on Casper Network</p>
          <p style={{ marginTop: '8px', fontSize: '12px' }}>
            Powered by CSPR.click | Built for Casper Hackathon 2026
          </p>
        </Footer>
      </AppContainer>
    </>
  );
};

export default App;
