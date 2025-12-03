import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useStaking } from '../hooks/useStaking';
import { useCsprClick } from '../hooks/useCsprClick';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 24px;
  padding: 32px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #ff2d55, #5856d6, #af52de, #ff2d55);
    background-size: 300% 100%;
    animation: gradient 3s ease infinite;
  }

  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TitleIcon = styled.span`
  font-size: 28px;
`;

const TabContainer = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 10px 24px;
  background: ${(props) => (props.active ? 'linear-gradient(135deg, #ff2d55 0%, #5856d6 100%)' : 'transparent')};
  border: none;
  border-radius: 8px;
  color: ${(props) => (props.active ? '#fff' : 'rgba(255, 255, 255, 0.6)')};
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: #fff;
    background: ${(props) => (props.active ? 'linear-gradient(135deg, #ff2d55 0%, #5856d6 100%)' : 'rgba(255, 255, 255, 0.1)')};
  }
`;

const InputGroup = styled.div`
  margin-bottom: 24px;
`;

const LabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const Label = styled.label`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 500;
`;

const MaxButton = styled.button`
  background: rgba(255, 45, 85, 0.2);
  border: 1px solid rgba(255, 45, 85, 0.3);
  border-radius: 6px;
  padding: 4px 12px;
  color: #ff2d55;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 45, 85, 0.3);
    border-color: #ff2d55;
  }
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 18px 80px 18px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  color: #fff;
  font-size: 24px;
  font-weight: 600;
  box-sizing: border-box;
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.2);
    font-weight: 400;
  }

  &:focus {
    outline: none;
    border-color: #5856d6;
    box-shadow: 0 0 0 4px rgba(88, 86, 214, 0.2);
  }

  &:disabled {
    opacity: 0.5;
  }
`;

const TokenLabel = styled.div`
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  font-weight: 600;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, #ff2d55 0%, #5856d6 100%);
  border: none;
  border-radius: 16px;
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(255, 45, 85, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const Message = styled.div<{ type: 'success' | 'error' | 'info' }>`
  margin-top: 20px;
  padding: 16px;
  background: ${(props) => {
    switch (props.type) {
      case 'success': return 'rgba(48, 209, 88, 0.1)';
      case 'error': return 'rgba(255, 69, 58, 0.1)';
      default: return 'rgba(88, 86, 214, 0.1)';
    }
  }};
  border: 1px solid ${(props) => {
    switch (props.type) {
      case 'success': return 'rgba(48, 209, 88, 0.3)';
      case 'error': return 'rgba(255, 69, 58, 0.3)';
      default: return 'rgba(88, 86, 214, 0.3)';
    }
  }};
  border-radius: 12px;
  color: ${(props) => {
    switch (props.type) {
      case 'success': return '#30d158';
      case 'error': return '#ff453a';
      default: return '#5856d6';
    }
  }};
  font-size: 14px;
  animation: ${slideIn} 0.3s ease;
`;

const ExplorerLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #30d158;
  text-decoration: none;
  font-weight: 600;
  margin-top: 8px;

  &:hover {
    text-decoration: underline;
  }
`;

const InfoBox = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 16px;
  margin-top: 20px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
`;

const InfoLabel = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
`;

const InfoValue = styled.span`
  color: #fff;
  font-size: 14px;
  font-weight: 600;
`;

const ConnectPrompt = styled.div`
  text-align: center;
  padding: 40px 20px;
`;

const ConnectIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const ConnectText = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  margin-bottom: 8px;
`;

const ConnectSubtext = styled.p`
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
`;

export const StakingForm: React.FC = () => {
  const { activeAccount } = useCsprClick();
  const { stake, unstake, isProcessing, deployHash, status, error } = useStaking();
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake');
  const [amount, setAmount] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    if (activeTab === 'stake') {
      await stake(amount);
    } else {
      await unstake(amount);
    }

    if (!error) {
      setAmount('');
    }
  };

  const handleMaxClick = () => {
    // In a real app, this would fetch the user's balance
    setAmount('1000');
  };

  if (!activeAccount) {
    return (
      <Container>
        <ConnectPrompt>
          <ConnectIcon>🔐</ConnectIcon>
          <ConnectText>Connect your wallet to start staking</ConnectText>
          <ConnectSubtext>Use the connect button in the top bar</ConnectSubtext>
        </ConnectPrompt>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <TitleIcon>{activeTab === 'stake' ? '💎' : '🔄'}</TitleIcon>
          {activeTab === 'stake' ? 'Stake' : 'Unstake'}
        </Title>
        <TabContainer>
          <Tab active={activeTab === 'stake'} onClick={() => setActiveTab('stake')}>
            Stake
          </Tab>
          <Tab active={activeTab === 'unstake'} onClick={() => setActiveTab('unstake')}>
            Unstake
          </Tab>
        </TabContainer>
      </Header>

      <form onSubmit={handleSubmit}>
        <InputGroup>
          <LabelRow>
            <Label>{activeTab === 'stake' ? 'Amount to stake' : 'Amount to unstake'}</Label>
            <MaxButton type="button" onClick={handleMaxClick}>MAX</MaxButton>
          </LabelRow>
          <InputWrapper>
            <Input
              type="number"
              step="0.000000001"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={isProcessing}
            />
            <TokenLabel>{activeTab === 'stake' ? 'CSPR' : 'stCSPR'}</TokenLabel>
          </InputWrapper>
        </InputGroup>

        <SubmitButton type="submit" disabled={isProcessing || !amount}>
          {isProcessing ? (
            <>
              <Spinner />
              Processing...
            </>
          ) : (
            <>
              {activeTab === 'stake' ? '💎 Stake CSPR' : '🔄 Unstake stCSPR'}
            </>
          )}
        </SubmitButton>

        {status && !error && !deployHash && (
          <Message type="info">{status}</Message>
        )}

        {deployHash && (
          <Message type="success">
            Transaction successful!
            <ExplorerLink
              href={`${window.config.cspr_live_url}/deploy/${deployHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on CSPR.live →
            </ExplorerLink>
          </Message>
        )}

        {error && <Message type="error">{error}</Message>}

        <InfoBox>
          <InfoRow>
            <InfoLabel>Exchange Rate</InfoLabel>
            <InfoValue>1 CSPR = 1 stCSPR</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>APY</InfoLabel>
            <InfoValue style={{ color: '#30d158' }}>10.00%</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Gas Fee</InfoLabel>
            <InfoValue>~5 CSPR</InfoValue>
          </InfoRow>
        </InfoBox>
      </form>
    </Container>
  );
};
