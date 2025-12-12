import React, { useState, useMemo } from 'react';
import styled, { keyframes, useTheme } from 'styled-components';
import { useCsprClick } from '../hooks/useCsprClick';
import { useContractData } from '../hooks/useContractData';
import { useToast } from './Toast';
import { buildAddRewardsTransaction, sendTransaction, csprToMotes, motesToCspr } from '../services/transaction';
import { playSuccessSound, playErrorSound } from '../utils/notificationSound';
import { colors, typography, spacing, layout, effects } from '../styles/designTokens';

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

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const Container = styled.div`
  background: rgba(20, 10, 30, 0.6);
  border-radius: ${layout.borderRadius.xl};
  padding: ${spacing[6]};
  border: 1px solid rgba(139, 92, 246, 0.2);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(12px);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #8b5cf6, #a78bfa);
  }
`;

const AdminBadge = styled.div`
  position: absolute;
  top: ${spacing[4]};
  right: ${spacing[4]};
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  color: white;
  font-family: ${typography.fontFamily.mono};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.bold};
  padding: ${spacing[1]} ${spacing[3]};
  border-radius: ${layout.borderRadius.full};
  text-transform: uppercase;
  letter-spacing: ${typography.letterSpacing.wider};
`;

const Title = styled.h3`
  font-family: ${typography.fontFamily.display};
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.text.primary};
  margin-bottom: ${spacing[4]};
  display: flex;
  align-items: center;
  gap: ${spacing[3]};
`;

// SVG Icons
const WrenchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const GiftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);

const BeakerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 3h15" />
    <path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3" />
    <path d="M6 14h12" />
  </svg>
);

const TitleIcon = styled.span`
  display: flex;
  align-items: center;
  color: ${colors.accent.primary};
`;

const Description = styled.p`
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.secondary};
  margin-bottom: ${spacing[6]};
  line-height: ${typography.lineHeight.relaxed};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${spacing[3]};
  margin-bottom: ${spacing[6]};
`;

const StatCard = styled.div`
  background: rgba(20, 10, 30, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: ${layout.borderRadius.lg};
  padding: ${spacing[4]};
  text-align: center;
  backdrop-filter: blur(8px);
  transition: all ${effects.transition.fast};

  &:hover {
    border-color: ${colors.accent.primary};
    transform: translateY(-2px);
  }
`;

const StatLabel = styled.div`
  font-family: ${typography.fontFamily.mono};
  font-size: ${typography.fontSize.xs};
  color: ${colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: ${typography.letterSpacing.wider};
  margin-bottom: ${spacing[2]};
`;

const StatValue = styled.div<{ $highlight?: boolean }>`
  font-family: ${typography.fontFamily.display};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.bold};
  color: ${props => props.$highlight ? colors.status.success : colors.text.primary};
`;

const InputGroup = styled.div`
  margin-bottom: ${spacing[4]};
`;

const Label = styled.label`
  display: block;
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.secondary};
  margin-bottom: ${spacing[2]};
  font-weight: ${typography.fontWeight.medium};
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: ${spacing[4]} ${spacing[16]} ${spacing[4]} ${spacing[4]};
  background: ${colors.background.elevated};
  border: 2px solid ${colors.border.default};
  border-radius: ${layout.borderRadius.lg};
  color: ${colors.text.primary};
  font-family: ${typography.fontFamily.display};
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.semibold};
  box-sizing: border-box;
  transition: all ${effects.transition.fast};

  &::placeholder {
    color: ${colors.text.muted};
    font-weight: ${typography.fontWeight.normal};
  }

  &:focus {
    outline: none;
    border-color: ${colors.accent.primary};
    box-shadow: ${effects.shadow.glow};
  }

  &:disabled {
    opacity: 0.5;
  }
`;

const TokenLabel = styled.div`
  position: absolute;
  right: ${spacing[4]};
  top: 50%;
  transform: translateY(-50%);
  color: ${colors.text.tertiary};
  font-family: ${typography.fontFamily.mono};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
`;

const PreviewRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing[2]} 0;
  font-size: ${typography.fontSize.sm};
`;

const PreviewLabel = styled.span`
  color: ${colors.text.tertiary};
`;

const PreviewValue = styled.span<{ $highlight?: boolean }>`
  font-weight: ${typography.fontWeight.semibold};
  color: ${props => props.$highlight ? colors.status.success : colors.text.primary};
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: ${spacing[4]};
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  border: none;
  border-radius: ${layout.borderRadius.lg};
  color: #fff;
  font-family: ${typography.fontFamily.body};
  font-weight: ${typography.fontWeight.bold};
  font-size: ${typography.fontSize.sm};
  cursor: pointer;
  transition: all ${effects.transition.normal};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing[2]};
  margin-top: ${spacing[4]};
  text-transform: uppercase;
  letter-spacing: ${typography.letterSpacing.wider};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
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
  margin-top: ${spacing[4]};
  padding: ${spacing[3]};
  background: rgba(48, 209, 88, 0.1);
  border: 1px solid rgba(48, 209, 88, 0.3);
  border-radius: ${layout.borderRadius.md};
  color: ${colors.status.success};
  font-size: ${typography.fontSize.sm};
`;

const ExplorerLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: ${spacing[1]};
  color: ${colors.status.success};
  text-decoration: none;
  font-weight: ${typography.fontWeight.semibold};
  margin-top: ${spacing[2]};

  &:hover {
    text-decoration: underline;
  }
`;

const NotOwnerMessage = styled.div`
  text-align: center;
  padding: ${spacing[6]};
  color: ${colors.text.tertiary};
  font-size: ${typography.fontSize.sm};
`;

const LiveIndicator = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${spacing[2]};
  font-family: ${typography.fontFamily.mono};
  font-size: ${typography.fontSize.xs};
  color: ${colors.status.success};
  text-transform: uppercase;
  letter-spacing: ${typography.letterSpacing.wider};

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    background: ${colors.status.success};
    border-radius: 50%;
    animation: ${pulse} 2s ease-in-out infinite;
  }
`;

// Password protection styles
const LockedOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 5, 15, 0.95);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: ${layout.borderRadius.xl};
`;

const LockIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const LockIconWrapper = styled.div`
  color: ${colors.accent.primary};
  margin-bottom: ${spacing[4]};
  opacity: 0.8;
`;

const LockedTitle = styled.h4`
  font-family: ${typography.fontFamily.display};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.semibold};
  color: ${colors.text.primary};
  margin-bottom: ${spacing[2]};
`;

const LockedText = styled.p`
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.tertiary};
  margin-bottom: ${spacing[5]};
  text-align: center;
  max-width: 280px;
`;

const PasswordInput = styled.input`
  width: 200px;
  padding: ${spacing[3]} ${spacing[4]};
  background: rgba(20, 10, 30, 0.8);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: ${layout.borderRadius.md};
  color: ${colors.text.primary};
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.sm};
  text-align: center;
  margin-bottom: ${spacing[3]};
  transition: all ${effects.transition.fast};

  &::placeholder {
    color: ${colors.text.muted};
  }

  &:focus {
    outline: none;
    border-color: ${colors.accent.primary};
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
  }
`;

const UnlockButton = styled.button`
  padding: ${spacing[2]} ${spacing[5]};
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  border: none;
  border-radius: ${layout.borderRadius.full};
  color: white;
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${effects.transition.fast};

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.p`
  font-size: ${typography.fontSize.xs};
  color: ${colors.status.error};
  margin-top: ${spacing[2]};
`;

// Admin password from environment variable (set on Vercel)
const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'stakevue2024';
const ADMIN_UNLOCK_KEY = 'stakevue_admin_unlocked';

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

  // Password protection state
  const [isUnlocked, setIsUnlocked] = useState(() => {
    // Check localStorage on initial load
    return localStorage.getItem(ADMIN_UNLOCK_KEY) === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleUnlock = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsUnlocked(true);
      localStorage.setItem(ADMIN_UNLOCK_KEY, 'true');
      setPasswordError('');
      setPasswordInput('');
    } else {
      setPasswordError('Incorrect password');
      setPasswordInput('');
    }
  };

  const handlePasswordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUnlock();
    }
  };

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
      <Container>
        <AdminBadge>Admin Only</AdminBadge>

        {/* Password protection overlay */}
        {!isUnlocked && (
          <LockedOverlay>
            <LockIconWrapper>
              <LockIcon />
            </LockIconWrapper>
            <LockedTitle>Admin Access Required</LockedTitle>
            <LockedText>
              This section is restricted to administrators. Enter the password to unlock.
            </LockedText>
            <PasswordInput
              type="password"
              placeholder="Enter password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyPress={handlePasswordKeyPress}
            />
            <UnlockButton onClick={handleUnlock} disabled={!passwordInput}>
              Unlock
            </UnlockButton>
            {passwordError && <ErrorText>{passwordError}</ErrorText>}
          </LockedOverlay>
        )}

        <Title>
          <TitleIcon><WrenchIcon /></TitleIcon>
          Add Rewards
          <LiveIndicator>V15</LiveIndicator>
        </Title>

        <Description>
          Add CSPR to the staking pool without minting new stCSPR.
          This increases the exchange rate, simulating validator rewards distribution.
        </Description>

        <StatsGrid>
          <StatCard>
            <StatLabel>Exchange Rate</StatLabel>
            <StatValue $highlight>
              {exchangeRate.toFixed(4)}
            </StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Total Pool</StatLabel>
            <StatValue>
              {formatCspr(totalPool)} CSPR
            </StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>stCSPR Supply</StatLabel>
            <StatValue>
              {formatCspr(totalStcspr)}
            </StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>1 stCSPR =</StatLabel>
            <StatValue $highlight>
              {exchangeRate.toFixed(4)} CSPR
            </StatValue>
          </StatCard>
        </StatsGrid>

        <form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>Reward Amount</Label>
            <InputWrapper>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                disabled={isProcessing}
              />
              <TokenLabel>CSPR</TokenLabel>
            </InputWrapper>
          </InputGroup>

          {preview && (
            <>
              <PreviewRow>
                <PreviewLabel>New Exchange Rate</PreviewLabel>
                <PreviewValue $highlight>
                  {preview.newRate.toFixed(6)}
                </PreviewValue>
              </PreviewRow>
              <PreviewRow>
                <PreviewLabel>Rate Increase</PreviewLabel>
                <PreviewValue $highlight>
                  +{preview.percentIncrease.toFixed(2)}%
                </PreviewValue>
              </PreviewRow>
              <PreviewRow>
                <PreviewLabel>Gas Fee</PreviewLabel>
                <PreviewValue>
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
              <><GiftIcon /> Add Rewards to Pool</>
            )}
          </SubmitButton>

          {/* Demo simulate button */}
          <SubmitButton
            type="button"
            onClick={handleDemoSimulate}
            disabled={isProcessing || !amount || parseFloat(amount) <= 0}
            style={{ background: 'linear-gradient(135deg, #5856d6 0%, #af52de 100%)', marginTop: '8px' }}
          >
            <BeakerIcon /> Simulate (Demo Mode)
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
