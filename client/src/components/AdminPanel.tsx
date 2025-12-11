import React, { useState, useMemo } from 'react';
import styled, { keyframes, useTheme } from 'styled-components';
import { useCsprClick } from '../hooks/useCsprClick';
import { useContractData } from '../hooks/useContractData';
import { useToast } from './Toast';
import { buildAddRewardsTransaction, sendTransaction, csprToMotes, motesToCspr } from '../services/transaction';
import { playSuccessSound, playErrorSound } from '../utils/notificationSound';

// Get config
const config = (window as any).config || {};
const OWNER_ACCOUNT_HASH = config.owner_account_hash || '';
const GAS_FEE_CSPR = parseFloat(config.add_rewards_payment || '10000000000') / 1_000_000_000;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const Container = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, rgba(255, 159, 10, 0.1) 0%, rgba(255, 45, 85, 0.05) 100%)'
    : 'linear-gradient(135deg, rgba(255, 159, 10, 0.15) 0%, rgba(255, 45, 85, 0.08) 100%)'};
  border-radius: 24px;
  padding: 24px;
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 159, 10, 0.3)'
    : 'rgba(255, 159, 10, 0.4)'};
  position: relative;
  overflow: hidden;
`;

const AdminBadge = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background: linear-gradient(135deg, #ff9f0a 0%, #ff2d55 100%);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Title = styled.h3<{ $isDark: boolean }>`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TitleIcon = styled.span`
  font-size: 24px;
`;

const Description = styled.p<{ $isDark: boolean }>`
  font-size: 13px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(0, 0, 0, 0.6)'};
  margin-bottom: 20px;
  line-height: 1.5;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
`;

const StatCard = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.03)'};
  border-radius: 12px;
  padding: 12px;
  text-align: center;
`;

const StatLabel = styled.div<{ $isDark: boolean }>`
  font-size: 11px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const StatValue = styled.div<{ $isDark: boolean; $highlight?: boolean }>`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.$highlight
    ? '#30d158'
    : props.$isDark ? '#fff' : '#1a1a2e'};
`;

const InputGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label<{ $isDark: boolean }>`
  display: block;
  font-size: 12px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(0, 0, 0, 0.6)'};
  margin-bottom: 8px;
  font-weight: 500;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input<{ $isDark: boolean }>`
  width: 100%;
  padding: 14px 60px 14px 16px;
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.03)'};
  border: 2px solid ${props => props.$isDark
    ? 'rgba(255, 159, 10, 0.3)'
    : 'rgba(255, 159, 10, 0.4)'};
  border-radius: 12px;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  font-size: 18px;
  font-weight: 600;
  box-sizing: border-box;

  &::placeholder {
    color: ${props => props.$isDark
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(0, 0, 0, 0.2)'};
    font-weight: 400;
  }

  &:focus {
    outline: none;
    border-color: #ff9f0a;
    box-shadow: 0 0 0 3px rgba(255, 159, 10, 0.2);
  }

  &:disabled {
    opacity: 0.5;
  }
`;

const TokenLabel = styled.div<{ $isDark: boolean }>`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  font-size: 13px;
  font-weight: 600;
`;

const PreviewRow = styled.div<{ $isDark: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 13px;
`;

const PreviewLabel = styled.span<{ $isDark: boolean }>`
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
`;

const PreviewValue = styled.span<{ $isDark: boolean; $highlight?: boolean }>`
  font-weight: 600;
  color: ${props => props.$highlight
    ? '#30d158'
    : props.$isDark ? '#fff' : '#1a1a2e'};
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #ff9f0a 0%, #ff2d55 100%);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 159, 10, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const SuccessMessage = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: rgba(48, 209, 88, 0.1);
  border: 1px solid rgba(48, 209, 88, 0.3);
  border-radius: 10px;
  color: #30d158;
  font-size: 13px;
`;

const ExplorerLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #30d158;
  text-decoration: none;
  font-weight: 600;
  margin-top: 6px;

  &:hover {
    text-decoration: underline;
  }
`;

const NotOwnerMessage = styled.div<{ $isDark: boolean }>`
  text-align: center;
  padding: 24px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  font-size: 14px;
`;

const LiveIndicator = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: #30d158;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    background: #30d158;
    border-radius: 50%;
    animation: ${pulse} 2s ease-in-out infinite;
  }
`;

interface AdminPanelProps {
  isOwner?: boolean; // Can override for demo
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOwner: isOwnerProp }) => {
  const theme = useTheme() as any;
  const isDark = theme?.mode === 'dark';
  const { activeAccount, send } = useCsprClick();
  const {
    exchangeRate,
    totalPool,
    totalStcspr,
    simulateRewards,
    isLive,
    refresh,
  } = useContractData();
  const { success: toastSuccess, error: toastError, ToastComponent } = useToast();

  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [deployHash, setDeployHash] = useState<string | null>(null);

  // Check if connected user is the owner
  const isOwner = useMemo(() => {
    if (isOwnerProp !== undefined) return isOwnerProp;
    if (!activeAccount) return false;

    // Convert public key to account hash and compare
    // For demo, we'll also check if user wants to simulate as owner
    const userAccountHash = activeAccount.accountHash?.replace('account-hash-', '') || '';
    return userAccountHash.toLowerCase() === OWNER_ACCOUNT_HASH.toLowerCase();
  }, [activeAccount, isOwnerProp]);

  // Calculate preview
  const preview = useMemo(() => {
    const numAmount = parseFloat(amount) || 0;
    if (numAmount <= 0) return null;

    const currentPoolCspr = Number(BigInt(totalPool || '0')) / 1_000_000_000;
    const currentSupplyStcspr = Number(BigInt(totalStcspr || '0')) / 1_000_000_000;

    if (currentSupplyStcspr <= 0) {
      return {
        newRate: exchangeRate,
        rateIncrease: 0,
        percentIncrease: 0,
      };
    }

    const newPoolCspr = currentPoolCspr + numAmount;
    const newRate = newPoolCspr / currentSupplyStcspr;
    const rateIncrease = newRate - exchangeRate;
    const percentIncrease = (rateIncrease / exchangeRate) * 100;

    return {
      newRate,
      rateIncrease,
      percentIncrease,
    };
  }, [amount, totalPool, totalStcspr, exchangeRate]);

  // Handle add rewards submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    if (!activeAccount) {
      toastError('Error', 'Please connect your wallet first');
      return;
    }

    setIsProcessing(true);
    setDeployHash(null);

    try {
      // Build the transaction
      const transaction = await buildAddRewardsTransaction(
        activeAccount.publicKey,
        amount
      );

      // Send via CSPR.click
      const result = await send(
        transaction,
        activeAccount.publicKey,
        (status, data) => {
          console.log('Add rewards status:', status, data);
        }
      );

      if (result.success) {
        setDeployHash(result.deployHash || null);
        playSuccessSound();
        toastSuccess('Rewards Added!', `${numAmount} CSPR added to pool`);

        // Update local state to simulate the change
        simulateRewards(numAmount);
        setAmount('');

        // Refresh live data after 5 seconds
        setTimeout(refresh, 5000);
      } else {
        throw new Error(result.error || 'Transaction failed');
      }
    } catch (err: any) {
      playErrorSound();
      toastError('Transaction Failed', err.message || 'Failed to add rewards');
    } finally {
      setIsProcessing(false);
    }
  };

  // Demo mode: allow simulating without real transaction
  const handleDemoSimulate = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    simulateRewards(numAmount);
    playSuccessSound();
    toastSuccess('Rewards Simulated!', `Exchange rate increased (demo mode)`);
    setAmount('');
  };

  // Format numbers
  const formatCspr = (motes: string) => {
    const cspr = Number(BigInt(motes || '0')) / 1_000_000_000;
    return cspr.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  if (!isOwner && !isOwnerProp) {
    return null; // Don't show panel to non-owners
  }

  return (
    <>
      <ToastComponent />
      <Container $isDark={isDark}>
        <AdminBadge>Admin Only</AdminBadge>

        <Title $isDark={isDark}>
          <TitleIcon>🔧</TitleIcon>
          Add Rewards
          <LiveIndicator>V15</LiveIndicator>
        </Title>

        <Description $isDark={isDark}>
          Add CSPR to the staking pool without minting new stCSPR.
          This increases the exchange rate, simulating validator rewards distribution.
        </Description>

        <StatsGrid>
          <StatCard $isDark={isDark}>
            <StatLabel $isDark={isDark}>Exchange Rate</StatLabel>
            <StatValue $isDark={isDark} $highlight>
              {exchangeRate.toFixed(4)}
            </StatValue>
          </StatCard>
          <StatCard $isDark={isDark}>
            <StatLabel $isDark={isDark}>Total Pool</StatLabel>
            <StatValue $isDark={isDark}>
              {formatCspr(totalPool)} CSPR
            </StatValue>
          </StatCard>
          <StatCard $isDark={isDark}>
            <StatLabel $isDark={isDark}>stCSPR Supply</StatLabel>
            <StatValue $isDark={isDark}>
              {formatCspr(totalStcspr)}
            </StatValue>
          </StatCard>
          <StatCard $isDark={isDark}>
            <StatLabel $isDark={isDark}>1 stCSPR =</StatLabel>
            <StatValue $isDark={isDark} $highlight>
              {exchangeRate.toFixed(4)} CSPR
            </StatValue>
          </StatCard>
        </StatsGrid>

        <form onSubmit={handleSubmit}>
          <InputGroup>
            <Label $isDark={isDark}>Reward Amount</Label>
            <InputWrapper>
              <Input
                $isDark={isDark}
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                disabled={isProcessing}
              />
              <TokenLabel $isDark={isDark}>CSPR</TokenLabel>
            </InputWrapper>
          </InputGroup>

          {preview && (
            <>
              <PreviewRow $isDark={isDark}>
                <PreviewLabel $isDark={isDark}>New Exchange Rate</PreviewLabel>
                <PreviewValue $isDark={isDark} $highlight>
                  {preview.newRate.toFixed(6)}
                </PreviewValue>
              </PreviewRow>
              <PreviewRow $isDark={isDark}>
                <PreviewLabel $isDark={isDark}>Rate Increase</PreviewLabel>
                <PreviewValue $isDark={isDark} $highlight>
                  +{preview.percentIncrease.toFixed(2)}%
                </PreviewValue>
              </PreviewRow>
              <PreviewRow $isDark={isDark}>
                <PreviewLabel $isDark={isDark}>Gas Fee</PreviewLabel>
                <PreviewValue $isDark={isDark}>
                  {GAS_FEE_CSPR} CSPR
                </PreviewValue>
              </PreviewRow>
            </>
          )}

          <SubmitButton type="submit" disabled={isProcessing || !amount || parseFloat(amount) <= 0}>
            {isProcessing ? (
              <>
                <Spinner />
                Processing...
              </>
            ) : (
              <>🎁 Add Rewards to Pool</>
            )}
          </SubmitButton>

          {/* Demo simulate button */}
          <SubmitButton
            type="button"
            onClick={handleDemoSimulate}
            disabled={isProcessing || !amount || parseFloat(amount) <= 0}
            style={{ background: 'linear-gradient(135deg, #5856d6 0%, #af52de 100%)', marginTop: '8px' }}
          >
            🧪 Simulate (Demo Mode)
          </SubmitButton>

          {deployHash && (
            <SuccessMessage>
              Rewards added successfully!
              <br />
              <ExplorerLink
                href={`${config.cspr_live_url}/deploy/${deployHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on CSPR.live →
              </ExplorerLink>
            </SuccessMessage>
          )}
        </form>
      </Container>
    </>
  );
};

export default AdminPanel;
