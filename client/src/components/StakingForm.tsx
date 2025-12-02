import React, { useState } from 'react';
import styled from 'styled-components';
import { useStaking } from '../hooks/useStaking';
import { useCsprClick } from '../hooks/useCsprClick';

const Container = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 32px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h2`
  font-size: 24px;
  margin-bottom: 24px;
  color: #fff;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 12px;
  background: ${(props) => (props.active ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255, 255, 255, 0.05)')};
  border: 1px solid ${(props) => (props.active ? '#667eea' : 'rgba(255, 255, 255, 0.1)')};
  border-radius: 8px;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.2);
  }
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #ccc;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 16px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
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

const Message = styled.div<{ type: 'success' | 'error' }>`
  margin-top: 16px;
  padding: 12px;
  background: ${(props) => (props.type === 'success' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)')};
  border: 1px solid ${(props) => (props.type === 'success' ? '#4caf50' : '#f44336')};
  border-radius: 8px;
  color: ${(props) => (props.type === 'success' ? '#4caf50' : '#f44336')};
  font-size: 14px;
`;

const InfoText = styled.p`
  color: #999;
  font-size: 14px;
  margin-top: 12px;
`;

export const StakingForm: React.FC = () => {
  const { activeAccount } = useCsprClick();
  const { stake, unstake, isProcessing, txHash, error } = useStaking();
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

    // Reset form on success
    if (!error) {
      setAmount('');
    }
  };

  if (!activeAccount) {
    return (
      <Container>
        <Title>Stake Your CSPR</Title>
        <InfoText>Please connect your wallet to start staking.</InfoText>
      </Container>
    );
  }

  return (
    <Container>
      <Title>{activeTab === 'stake' ? 'Stake CSPR' : 'Unstake stCSPR'}</Title>

      <TabContainer>
        <Tab active={activeTab === 'stake'} onClick={() => setActiveTab('stake')}>
          Stake
        </Tab>
        <Tab active={activeTab === 'unstake'} onClick={() => setActiveTab('unstake')}>
          Unstake
        </Tab>
      </TabContainer>

      <form onSubmit={handleSubmit}>
        <InputGroup>
          <Label>{activeTab === 'stake' ? 'Amount (CSPR)' : 'Amount (stCSPR)'}</Label>
          <Input
            type="number"
            step="0.000000001"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            disabled={isProcessing}
          />
        </InputGroup>

        <SubmitButton type="submit" disabled={isProcessing || !amount}>
          {isProcessing ? 'Processing...' : activeTab === 'stake' ? 'Stake CSPR' : 'Unstake stCSPR'}
        </SubmitButton>

        {txHash && (
          <Message type="success">
            Transaction submitted! Hash: {txHash.substring(0, 16)}...
          </Message>
        )}

        {error && <Message type="error">{error}</Message>}

        <InfoText>
          {activeTab === 'stake'
            ? 'Stake CSPR to receive liquid stCSPR tokens. You earn rewards while maintaining liquidity.'
            : 'Burn your stCSPR tokens to unstake and receive your CSPR back.'}
        </InfoText>
      </form>
    </Container>
  );
};
