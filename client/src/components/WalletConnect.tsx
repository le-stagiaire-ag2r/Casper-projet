import React from 'react';
import { useCsprClick } from '../hooks/useCsprClick';
import styled from 'styled-components';

const Button = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const DisconnectButton = styled(Button)`
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
`;

const AccountInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
`;

const AccountText = styled.span`
  font-family: monospace;
  font-size: 14px;
  color: #fff;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  font-size: 14px;
  margin-top: 8px;
`;

export const WalletConnect: React.FC = () => {
  const { activeAccount, isReady, error, connect, disconnect } = useCsprClick();

  if (activeAccount) {
    return (
      <Container>
        <AccountInfo>
          <span>🔗</span>
          <AccountText>
            {activeAccount.publicKey.substring(0, 8)}...
            {activeAccount.publicKey.substring(activeAccount.publicKey.length - 6)}
          </AccountText>
        </AccountInfo>
        <DisconnectButton onClick={disconnect}>Disconnect</DisconnectButton>
      </Container>
    );
  }

  return (
    <Container>
      <Button onClick={connect} disabled={!isReady}>
        {!isReady ? 'Loading...' : 'Connect Wallet'}
      </Button>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Container>
  );
};
