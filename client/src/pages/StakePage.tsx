import React from 'react';
import styled from 'styled-components';
import { Dashboard } from '../components/Dashboard';
import { StakingForm } from '../components/StakingForm';
import { StakeHistory } from '../components/StakeHistory';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(135deg, #ff2d55 0%, #5856d6 50%, #af52de 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
`;

const Subtitle = styled.p<{ $isDark: boolean }>`
  font-size: 16px;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'};
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

const DemoNotice = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 204, 0, 0.1)'
    : 'rgba(255, 204, 0, 0.15)'};
  border: 1px solid rgba(255, 204, 0, 0.3);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const NoticeIcon = styled.span`
  font-size: 24px;
`;

const NoticeText = styled.p<{ $isDark: boolean }>`
  font-size: 14px;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'};
  line-height: 1.5;

  strong {
    color: ${props => props.$isDark ? '#fff' : '#000'};
  }
`;

interface StakePageProps {
  isDark: boolean;
}

export const StakePage: React.FC<StakePageProps> = ({ isDark }) => {
  return (
    <Container>
      <Header>
        <Title>💰 Stake & Unstake</Title>
        <Subtitle $isDark={isDark}>
          Manage your staked CSPR and stCSPR tokens
        </Subtitle>
      </Header>

      <DemoNotice $isDark={isDark}>
        <NoticeIcon>⚠️</NoticeIcon>
        <NoticeText $isDark={isDark}>
          <strong>Demo Mode:</strong> This version uses a demonstration contract.
          Transactions are recorded on the blockchain, but CSPR is not
          actually transferred. This is a safe test environment.
        </NoticeText>
      </DemoNotice>

      <Dashboard />

      <Grid>
        <StakingForm />
        <StakeHistory />
      </Grid>
    </Container>
  );
};
