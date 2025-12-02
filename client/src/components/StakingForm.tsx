import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
// import { useStaking } from '../hooks/useStaking'; // Will be used when real transactions are enabled
import { useCsprClick } from '../hooks/useCsprClick';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

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

// Will be used when real transactions are enabled
// const Message = styled.div<{ type: 'success' | 'error' }>`
//   margin-top: 16px;
//   padding: 12px;
//   background: ${(props) => (props.type === 'success' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)')};
//   border: 1px solid ${(props) => (props.type === 'success' ? '#4caf50' : '#f44336')};
//   border-radius: 8px;
//   color: ${(props) => (props.type === 'success' ? '#4caf50' : '#f44336')};
//   font-size: 14px;
// `;

const InfoText = styled.p`
  color: #999;
  font-size: 14px;
  margin-top: 12px;
`;

const DemoOverlay = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: ${(props) => (props.show ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  animation: ${fadeIn} 0.3s ease-out;
`;

const DemoModalContainer = styled.div`
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%);
  border-radius: 20px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.1);
  animation: ${slideUp} 0.4s ease-out;
  text-align: center;
`;

const DemoIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
`;

const DemoTitle = styled.h3`
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin-bottom: 16px;
`;

const DemoText = styled.p`
  font-size: 16px;
  color: #ccc;
  line-height: 1.6;
  margin-bottom: 24px;
`;

const DemoFeature = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  text-align: left;
`;

const DemoFeatureTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
`;

const DemoFeatureText = styled.div`
  font-size: 13px;
  color: #999;
`;

const CloseButton = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);
  }
`;

export const StakingForm: React.FC = () => {
  const { activeAccount } = useCsprClick();
  // const { stake, unstake, isProcessing, txHash, error } = useStaking(); // Will be used when real transactions are enabled
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake');
  const [amount, setAmount] = useState('');
  const [showDemoModal, setShowDemoModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    // DEMO MODE: Show modal instead of real transaction
    setShowDemoModal(true);

    // Commented out for demo - will be enabled soon
    // if (activeTab === 'stake') {
    //   await stake(amount);
    // } else {
    //   await unstake(amount);
    // }
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
          />
        </InputGroup>

        <SubmitButton type="submit" disabled={!amount}>
          {activeTab === 'stake' ? 'Stake CSPR 🚀' : 'Unstake stCSPR 🔓'}
        </SubmitButton>

        <InfoText>
          {activeTab === 'stake'
            ? 'Stake CSPR to receive liquid stCSPR tokens. You earn rewards while maintaining liquidity.'
            : 'Burn your stCSPR tokens to unstake and receive your CSPR back.'}
        </InfoText>
      </form>

      {/* Demo Modal */}
      <DemoOverlay show={showDemoModal} onClick={() => setShowDemoModal(false)}>
        <DemoModalContainer onClick={(e) => e.stopPropagation()}>
          <DemoIcon>🚀</DemoIcon>
          <DemoTitle>Transactions Bientôt Disponibles!</DemoTitle>
          <DemoText>
            Vous explorez actuellement une démo interactive de StakeVue. Les transactions réelles
            seront activées très prochainement.
          </DemoText>

          <DemoFeature>
            <DemoFeatureTitle>✅ Contrat Déployé</DemoFeatureTitle>
            <DemoFeatureText>
              Smart contract V5.0 déjà déployé sur Casper Testnet et audité (Grade A+)
            </DemoFeatureText>
          </DemoFeature>

          <DemoFeature>
            <DemoFeatureTitle>🔜 Intégration Finale</DemoFeatureTitle>
            <DemoFeatureText>
              Connexion wallet CSPR.click et signature de transactions en cours de finalisation
            </DemoFeatureText>
          </DemoFeature>

          <DemoFeature>
            <DemoFeatureTitle>💎 Votre Transaction</DemoFeatureTitle>
            <DemoFeatureText>
              {activeTab === 'stake' ? 'Stake' : 'Unstake'} de {amount} {activeTab === 'stake' ? 'CSPR' : 'stCSPR'}
            </DemoFeatureText>
          </DemoFeature>

          <CloseButton onClick={() => setShowDemoModal(false)}>Compris ! 👍</CloseButton>
        </DemoModalContainer>
      </DemoOverlay>
    </Container>
  );
};
