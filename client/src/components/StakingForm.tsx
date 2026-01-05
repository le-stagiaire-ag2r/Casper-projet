import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes, useTheme } from 'styled-components';
import { useStaking } from '../hooks/useStaking';
import { useCsprClick } from '../hooks/useCsprClick';
import { useContractData } from '../hooks/useContractData';
import { useToast } from './Toast';
import { useBalanceContext } from '../context/BalanceContext';
import { playSuccessSound, playErrorSound } from '../utils/notificationSound';
import { useConfetti } from './Confetti';
import ValidatorSelector from './stake/ValidatorSelector';
import './stake/ValidatorSelector.css';
import { getNextRequestId } from '../services/contractReader';
import { TransactionTracker, TrackedTransaction } from './TransactionTracker';
import {
  ChartUpIcon,
  ChartDownIcon,
  WarningIcon,
  TipIcon,
  InfoIcon,
  SparkleIcon,
  CoinsIcon,
  RocketIcon,
  SendIcon
} from './ui/Icons';

// Get config values
const config = (window as any).config || {};
// V17: Min stake 500 CSPR for first delegation
const MIN_STAKE_CSPR = parseFloat(config.min_stake_amount || '500000000000') / 1_000_000_000;
// V17: Gas fee 15 CSPR for delegation
const GAS_FEE_CSPR = parseFloat(config.transaction_payment || '15000000000') / 1_000_000_000;
// V17: Approved validators from config
const APPROVED_VALIDATORS: string[] = config.approved_validators || [];

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div<{ $isDark: boolean }>`
  background: rgba(20, 10, 30, 0.6);
  border-radius: 24px;
  padding: 32px;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(139, 92, 246, 0.2);
  position: relative;
  overflow: hidden;

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

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
`;

const Title = styled.h2<{ $isDark: boolean }>`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TitleIcon = styled.span`
  font-size: 28px;
`;

const TabContainer = styled.div<{ $isDark: boolean }>`
  display: flex;
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.05)'};
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
`;

const Tab = styled.button<{ active: boolean; $isDark: boolean }>`
  padding: 10px 24px;
  background: ${(props) => (props.active ? 'linear-gradient(135deg, #ff2d55 0%, #5856d6 100%)' : 'transparent')};
  border: none;
  border-radius: 8px;
  color: ${(props) => {
    if (props.active) return '#fff';
    return props.$isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';
  }};
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: ${props => props.active ? '#fff' : (props.$isDark ? '#fff' : '#1a1a2e')};
    background: ${(props) => (props.active
      ? 'linear-gradient(135deg, #ff2d55 0%, #5856d6 100%)'
      : props.$isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')};
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

const Label = styled.label<{ $isDark: boolean }>`
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(0, 0, 0, 0.6)'};
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

const Input = styled.input<{ $isDark: boolean }>`
  width: 100%;
  padding: 18px 80px 18px 20px;
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.03)'};
  border: 2px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 16px;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  font-size: 24px;
  font-weight: 600;
  box-sizing: border-box;
  transition: all 0.3s ease;

  &::placeholder {
    color: ${props => props.$isDark
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(0, 0, 0, 0.2)'};
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

const TokenLabel = styled.div<{ $isDark: boolean }>`
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
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

const SuccessBanner = styled.div`
  background: linear-gradient(135deg, rgba(48, 209, 88, 0.15) 0%, rgba(52, 199, 89, 0.1) 100%);
  border: 2px solid rgba(48, 209, 88, 0.4);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  animation: ${slideIn} 0.4s ease;
`;

const SuccessHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const SuccessIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #30d158, #34c759);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

const SuccessTitle = styled.h3`
  color: #30d158;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
`;

const SuccessSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin: 4px 0 0 0;
`;

const SuccessDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
`;

const SuccessDetailBox = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 12px;
`;

const SuccessDetailLabel = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const SuccessDetailValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #fff;
`;

const SuccessActions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const SuccessButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: rgba(48, 209, 88, 0.2);
  border: 1px solid rgba(48, 209, 88, 0.3);
  border-radius: 8px;
  color: #30d158;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(48, 209, 88, 0.3);
  }
`;

const DismissButton = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 10px 16px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: rgba(255, 255, 255, 0.4);
    color: rgba(255, 255, 255, 0.8);
  }
`;

const InfoBox = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.03)'
    : 'rgba(0, 0, 0, 0.02)'};
  border-radius: 12px;
  padding: 16px;
  margin-top: 20px;
`;

const InfoRow = styled.div<{ $isDark: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;

  &:not(:last-child) {
    border-bottom: 1px solid ${props => props.$isDark
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.05)'};
  }
`;

const InfoLabel = styled.span<{ $isDark: boolean }>`
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  font-size: 14px;
`;

const InfoValue = styled.span<{ $isDark: boolean }>`
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
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

const ConnectText = styled.p<{ $isDark: boolean }>`
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(0, 0, 0, 0.6)'};
  font-size: 16px;
  margin-bottom: 8px;
`;

const ConnectSubtext = styled.p<{ $isDark: boolean }>`
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.4)'
    : 'rgba(0, 0, 0, 0.4)'};
  font-size: 14px;
`;

const BalanceDisplay = styled.div<{ $isDark: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: ${props => props.$isDark
    ? 'rgba(88, 86, 214, 0.1)'
    : 'rgba(88, 86, 214, 0.08)'};
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid ${props => props.$isDark
    ? 'rgba(88, 86, 214, 0.2)'
    : 'rgba(88, 86, 214, 0.15)'};
`;

const BalanceLabel = styled.span<{ $isDark: boolean }>`
  font-size: 13px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(0, 0, 0, 0.6)'};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const BalanceValue = styled.span<{ $isDark: boolean }>`
  font-size: 15px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
`;

const ValidationMessage = styled.div<{ $type: 'error' | 'warning' | 'info' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: ${props => {
    switch (props.$type) {
      case 'error': return 'rgba(255, 69, 58, 0.1)';
      case 'warning': return 'rgba(255, 159, 10, 0.1)';
      default: return 'rgba(88, 86, 214, 0.1)';
    }
  }};
  color: ${props => {
    switch (props.$type) {
      case 'error': return '#ff453a';
      case 'warning': return '#ff9f0a';
      default: return '#5856d6';
    }
  }};
`;

const DemoTag = styled.span`
  display: inline-block;
  background: rgba(255, 159, 10, 0.2);
  color: #ff9f0a;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 6px;
  text-transform: uppercase;
`;

const FaucetBanner = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(88, 86, 214, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 12px;
  margin-bottom: 16px;
  color: #a78bfa;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    background: linear-gradient(135deg, rgba(88, 86, 214, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%);
    border-color: rgba(139, 92, 246, 0.5);
    color: #c4b5fd;
  }
`;

const FaucetIcon = styled.span`
  font-size: 18px;
`;

const AddressWidget = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 14px;
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.03)'
    : 'rgba(0, 0, 0, 0.02)'};
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.06)'};
  border-radius: 10px;
  margin-bottom: 16px;
`;

const AddressText = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'SF Mono', 'Monaco', monospace;
  font-size: 12px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(0, 0, 0, 0.6)'};
`;

const AddressLabel = styled.span`
  color: #8b5cf6;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
`;

const CopyAddressButton = styled.button<{ $isDark: boolean; $copied: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: ${props => props.$copied
    ? 'rgba(48, 209, 88, 0.15)'
    : props.$isDark
      ? 'rgba(139, 92, 246, 0.15)'
      : 'rgba(139, 92, 246, 0.1)'};
  border: 1px solid ${props => props.$copied
    ? 'rgba(48, 209, 88, 0.3)'
    : 'rgba(139, 92, 246, 0.2)'};
  border-radius: 6px;
  color: ${props => props.$copied ? '#30d158' : '#8b5cf6'};
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$copied
      ? 'rgba(48, 209, 88, 0.2)'
      : 'rgba(139, 92, 246, 0.25)'};
  }
`;

const PreviewBox = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, rgba(48, 209, 88, 0.1) 0%, rgba(88, 86, 214, 0.1) 100%)'
    : 'linear-gradient(135deg, rgba(48, 209, 88, 0.08) 0%, rgba(88, 86, 214, 0.08) 100%)'};
  border: 1px solid ${props => props.$isDark
    ? 'rgba(48, 209, 88, 0.2)'
    : 'rgba(48, 209, 88, 0.15)'};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;

const PreviewTitle = styled.div<{ $isDark: boolean }>`
  font-size: 12px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PreviewRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const PreviewLabel = styled.span<{ $isDark: boolean }>`
  font-size: 13px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(0, 0, 0, 0.6)'};
`;

const PreviewValue = styled.span<{ $isDark: boolean; $highlight?: boolean }>`
  font-size: 14px;
  font-weight: 700;
  color: ${props => props.$highlight
    ? '#30d158'
    : props.$isDark ? '#fff' : '#1a1a2e'};
`;

// APY constants for calculations
const APY_MIN = 0.15; // 15%
const APY_MAX = 0.18; // 18%
const APY_AVG = (APY_MIN + APY_MAX) / 2; // ~17%

export const StakingForm: React.FC = () => {
  const { activeAccount } = useCsprClick();
  const { stake, unstake, isProcessing, deployHash, status, error } = useStaking();
  const { exchangeRate, csprToStcspr, stcsprToCspr, updateAfterStake: updateContractAfterStake, updateAfterUnstake: updateContractAfterUnstake } = useContractData();
  const theme = useTheme() as any;
  const isDark = theme?.mode === 'dark';
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake');
  const [amount, setAmount] = useState('');
  const { success: toastSuccess, error: toastError, ToastComponent } = useToast();
  const { triggerConfetti, ConfettiComponent } = useConfetti();

  // V17: Validator selection
  const [selectedValidator, setSelectedValidator] = useState<string | null>(null);

  // Use shared balance context
  const {
    csprBalance,
    stCsprBalance,
    isLoading: balanceLoading,
    isRealBalance,
    updateAfterStake,
    updateAfterUnstake
  } = useBalanceContext();

  // Track last error for toast
  const [lastError, setLastError] = useState<string | null>(null);

  // Track successful transaction for banner
  const [successTx, setSuccessTx] = useState<{
    type: 'stake' | 'unstake';
    amount: number;
    received: number;
    deployHash: string;
  } | null>(null);

  // Track transaction for TransactionTracker
  const [trackedTx, setTrackedTx] = useState<TrackedTransaction | null>(null);

  // Copy address state
  const [addressCopied, setAddressCopied] = useState(false);

  const copyAddress = async () => {
    if (activeAccount?.publicKey) {
      try {
        await navigator.clipboard.writeText(activeAccount.publicKey);
        setAddressCopied(true);
        setTimeout(() => setAddressCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const shortenAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  // Show error toast
  useEffect(() => {
    if (error && error !== lastError) {
      playErrorSound();
      toastError('Transaction Failed', error);
      setLastError(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  // Get current balance based on active tab
  const currentBalance = activeTab === 'stake' ? csprBalance : stCsprBalance;
  const tokenSymbol = activeTab === 'stake' ? 'CSPR' : 'stCSPR';

  // Validation logic
  const validation = useMemo(() => {
    const numAmount = parseFloat(amount) || 0;

    if (!amount || numAmount === 0) {
      return { valid: true, message: null, type: 'info' as const };
    }

    if (numAmount < 0) {
      return { valid: false, message: 'Amount must be positive', type: 'error' as const };
    }

    if (activeTab === 'stake') {
      // V17: Must select a validator
      if (!selectedValidator) {
        return {
          valid: false,
          message: 'Please select a validator below',
          type: 'error' as const
        };
      }

      if (numAmount < MIN_STAKE_CSPR) {
        return {
          valid: false,
          message: `Minimum stake is ${MIN_STAKE_CSPR} CSPR`,
          type: 'error' as const
        };
      }

      const totalNeeded = numAmount + GAS_FEE_CSPR;
      if (totalNeeded > csprBalance) {
        return {
          valid: false,
          message: `Insufficient balance (need ${totalNeeded.toFixed(2)} CSPR including gas)`,
          type: 'error' as const
        };
      }

      if (numAmount > csprBalance * 0.9) {
        return {
          valid: true,
          message: `Consider keeping some CSPR for future gas fees`,
          type: 'warning' as const
        };
      }
    } else {
      // V17: Must select a validator to unstake from
      if (!selectedValidator) {
        return {
          valid: false,
          message: 'Please select a validator to unstake from',
          type: 'error' as const
        };
      }

      if (numAmount > stCsprBalance) {
        return {
          valid: false,
          message: `Insufficient stCSPR balance`,
          type: 'error' as const
        };
      }

      if (GAS_FEE_CSPR > csprBalance) {
        return {
          valid: false,
          message: `Insufficient CSPR for gas fee (need ${GAS_FEE_CSPR} CSPR)`,
          type: 'error' as const
        };
      }
    }

    return { valid: true, message: null, type: 'info' as const };
  }, [amount, activeTab, csprBalance, stCsprBalance, selectedValidator]);

  // Calculate preview values using V15 exchange rate
  const preview = useMemo(() => {
    const numAmount = parseFloat(amount) || 0;
    if (numAmount <= 0) return null;

    if (activeTab === 'stake') {
      // V15: stCSPR received = CSPR / exchange_rate
      const stCsprReceived = csprToStcspr(numAmount);
      const yearlyEarningsMin = numAmount * APY_MIN;
      const yearlyEarningsMax = numAmount * APY_MAX;
      const monthlyEarnings = (numAmount * APY_AVG) / 12;

      return {
        receive: stCsprReceived,
        receiveToken: 'stCSPR',
        yearlyMin: yearlyEarningsMin,
        yearlyMax: yearlyEarningsMax,
        monthly: monthlyEarnings,
      };
    } else {
      // V15: CSPR received = stCSPR * exchange_rate
      const csprReceived = stcsprToCspr(numAmount);
      return {
        receive: csprReceived,
        receiveToken: 'CSPR',
        yearlyMin: 0,
        yearlyMax: 0,
        monthly: 0,
      };
    }
  }, [amount, activeTab, csprToStcspr, stcsprToCspr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0 || !validation.valid) {
      return;
    }

    // V17: Require validator selection
    if (!selectedValidator) {
      toastError('Validator Required', 'Please select a validator');
      return;
    }

    const txAmount = parseFloat(amount);

    if (activeTab === 'stake') {
      // V17: Pass validator to stake function
      const result = await stake(amount, selectedValidator);
      // Update balance immediately on success (demo mode support)
      if (result.success || result.deployHash) {
        const stcsprReceived = csprToStcspr(txAmount);
        updateAfterStake(txAmount);
        updateContractAfterStake(txAmount); // Update contract pool data
        playSuccessSound();
        triggerConfetti();
        toastSuccess('Stake Successful!', `${txAmount} CSPR staked → ${stcsprReceived.toFixed(4)} stCSPR received`);
        setAmount('');
        // Show success banner
        setSuccessTx({
          type: 'stake',
          amount: txAmount,
          received: stcsprReceived,
          deployHash: result.deployHash || '',
        });
        // Track transaction for tracker
        if (result.deployHash) {
          setTrackedTx({
            deployHash: result.deployHash,
            type: 'stake',
            amount: (txAmount * 1_000_000_000).toString(),
            timestamp: new Date(),
          });
        }
      }
    } else {
      // V22: Read the REAL next_request_id from contract BEFORE unstaking
      // The contract will assign this ID to our withdrawal request
      let realRequestId = 1;
      try {
        realRequestId = await getNextRequestId();
        console.log('Contract next_request_id:', realRequestId);
      } catch (e) {
        console.warn('Failed to read next_request_id, using fallback:', e);
      }

      // V17: Pass validator to unstake function (request_unstake)
      const result = await unstake(amount, selectedValidator);
      // Update balance immediately on success (demo mode support)
      if (result.success || result.deployHash) {
        const csprReceived = stcsprToCspr(txAmount);
        updateAfterUnstake(txAmount);
        updateContractAfterUnstake(txAmount); // Update contract pool data
        playSuccessSound();
        toastSuccess('Withdrawal Queued!', `${txAmount} stCSPR → ${csprReceived.toFixed(4)} CSPR (available after ~7 eras)`);
        setAmount('');
        // Show success banner
        setSuccessTx({
          type: 'unstake',
          amount: txAmount,
          received: csprReceived,
          deployHash: result.deployHash || '',
        });
        // Track transaction for tracker
        if (result.deployHash) {
          setTrackedTx({
            deployHash: result.deployHash,
            type: 'unstake',
            amount: (txAmount * 1_000_000_000).toString(),
            timestamp: new Date(),
          });
        }

        // Save withdrawal to localStorage for WithdrawalStatus component
        // V22 FIX: Use the REAL request_id from the contract, not a local counter
        // V22 FIX: Store userAccount to filter by connected wallet
        try {
          const stored = localStorage.getItem('pendingWithdrawals');
          const withdrawals = stored ? JSON.parse(stored) : [];
          withdrawals.push({
            requestId: realRequestId,
            csprAmount: csprReceived,
            isReady: false,
            isClaimed: false,
            requestTime: new Date().toISOString(),
            userAccount: activeAccount?.publicKey, // V22: Track which account made this withdrawal
          });
          localStorage.setItem('pendingWithdrawals', JSON.stringify(withdrawals));
          console.log('Saved withdrawal with request_id:', realRequestId, 'for account:', activeAccount?.publicKey);
        } catch (e) {
          console.warn('Failed to save withdrawal to localStorage', e);
        }
      }
    }
  };

  const handleMaxClick = () => {
    if (activeTab === 'stake') {
      // Leave enough for gas fee
      const maxStake = Math.max(0, csprBalance - GAS_FEE_CSPR - 1);
      setAmount(maxStake > 0 ? maxStake.toFixed(2) : '0');
    } else {
      // For unstake, use full stCSPR balance
      setAmount(stCsprBalance > 0 ? stCsprBalance.toFixed(2) : '0');
    }
  };

  if (!activeAccount) {
    return (
      <Container $isDark={isDark}>
        <ConnectPrompt>
          <ConnectIcon></ConnectIcon>
          <ConnectText $isDark={isDark}>Connect your wallet to start staking</ConnectText>
          <ConnectSubtext $isDark={isDark}>Use the connect button in the top bar</ConnectSubtext>
        </ConnectPrompt>
      </Container>
    );
  }

  return (
    <>
      <ToastComponent />
      <ConfettiComponent />

      {/* Transaction Tracker */}
      <TransactionTracker
        transaction={trackedTx}
        onClose={() => setTrackedTx(null)}
        onRetry={() => {
          setTrackedTx(null);
          // User can retry manually
        }}
      />

      {/* Success Banner */}
      {successTx && (
        <SuccessBanner>
          <SuccessHeader>
            <SuccessIcon>{successTx.type === 'stake' ? '✓' : '⏳'}</SuccessIcon>
            <div>
              <SuccessTitle>
                {successTx.type === 'stake' ? 'Stake Successful!' : 'Unstake Queued!'}
              </SuccessTitle>
              <SuccessSubtitle>
                {successTx.type === 'stake'
                  ? 'Your CSPR has been staked and is earning rewards'
                  : 'Your withdrawal will be ready in ~14 hours (7 eras)'}
              </SuccessSubtitle>
            </div>
          </SuccessHeader>

          <SuccessDetails>
            <SuccessDetailBox>
              <SuccessDetailLabel>
                {successTx.type === 'stake' ? 'Staked' : 'Unstaked'}
              </SuccessDetailLabel>
              <SuccessDetailValue>
                {successTx.amount.toLocaleString()} {successTx.type === 'stake' ? 'CSPR' : 'stCSPR'}
              </SuccessDetailValue>
            </SuccessDetailBox>
            <SuccessDetailBox>
              <SuccessDetailLabel>
                {successTx.type === 'stake' ? 'Received' : 'Will receive'}
              </SuccessDetailLabel>
              <SuccessDetailValue>
                {successTx.received.toLocaleString(undefined, { maximumFractionDigits: 4 })} {successTx.type === 'stake' ? 'stCSPR' : 'CSPR'}
              </SuccessDetailValue>
            </SuccessDetailBox>
          </SuccessDetails>

          <SuccessActions>
            <SuccessButton
              href={`${window.config?.cspr_live_url || 'https://testnet.cspr.live'}/deploy/${successTx.deployHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Explorer →
            </SuccessButton>
            <DismissButton onClick={() => setSuccessTx(null)}>
              Dismiss
            </DismissButton>
          </SuccessActions>
        </SuccessBanner>
      )}

      <Container $isDark={isDark}>
        <Header>
        <Title $isDark={isDark}>
          <TitleIcon>{activeTab === 'stake' ? <ChartUpIcon size={24} color="#30d158" /> : <ChartDownIcon size={24} color="#ff9f0a" />}</TitleIcon>
          {activeTab === 'stake' ? 'Stake' : 'Unstake'}
        </Title>
        <TabContainer $isDark={isDark}>
          <Tab
            active={activeTab === 'stake'}
            $isDark={isDark}
            onClick={() => setActiveTab('stake')}
          >
            Stake
          </Tab>
          <Tab
            active={activeTab === 'unstake'}
            $isDark={isDark}
            onClick={() => setActiveTab('unstake')}
          >
            Unstake
          </Tab>
        </TabContainer>
      </Header>

      {/* Connected Address Widget */}
      {activeAccount?.publicKey && (
        <AddressWidget $isDark={isDark}>
          <AddressText $isDark={isDark}>
            <AddressLabel>Connected</AddressLabel>
            {shortenAddress(activeAccount.publicKey)}
          </AddressText>
          <CopyAddressButton
            $isDark={isDark}
            $copied={addressCopied}
            onClick={copyAddress}
            type="button"
          >
            {addressCopied ? '✓ Copied' : '📋 Copy'}
          </CopyAddressButton>
        </AddressWidget>
      )}

      {/* Balance Display */}
      <BalanceDisplay $isDark={isDark}>
        <BalanceLabel $isDark={isDark}>
           Available {tokenSymbol}
          {!isRealBalance && <DemoTag>DEMO</DemoTag>}
          {isRealBalance && <DemoTag style={{ background: 'rgba(48, 209, 88, 0.2)', color: '#30d158' }}>LIVE</DemoTag>}
          {balanceLoading && <DemoTag style={{ background: 'rgba(88, 86, 214, 0.2)', color: '#5856d6' }}>...</DemoTag>}
        </BalanceLabel>
        <BalanceValue $isDark={isDark}>
          {currentBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} {tokenSymbol}
        </BalanceValue>
      </BalanceDisplay>

      {/* Faucet Banner - Show when balance is low */}
      {activeTab === 'stake' && csprBalance < MIN_STAKE_CSPR && (
        <FaucetBanner
          href="https://testnet.cspr.live/tools/faucet"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaucetIcon>🚰</FaucetIcon>
          Need testnet CSPR? Get free tokens from the Faucet →
        </FaucetBanner>
      )}

      <form onSubmit={handleSubmit}>
        <InputGroup>
          <LabelRow>
            <Label $isDark={isDark}>
              {activeTab === 'stake' ? 'Amount to stake' : 'Amount to unstake'}
            </Label>
            <MaxButton type="button" onClick={handleMaxClick} disabled={isProcessing}>
              MAX
            </MaxButton>
          </LabelRow>
          <InputWrapper>
            <Input
              $isDark={isDark}
              type="number"
              step="0.01"
              min={activeTab === 'stake' ? MIN_STAKE_CSPR : 0}
              max={currentBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={activeTab === 'stake' ? `Min ${MIN_STAKE_CSPR} CSPR` : '0.00'}
              disabled={isProcessing}
            />
            <TokenLabel $isDark={isDark}>
              {tokenSymbol}
            </TokenLabel>
          </InputWrapper>
          {validation.message && (
            <ValidationMessage $type={validation.type}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                {validation.type === 'error' ? <WarningIcon size={14} /> : validation.type === 'warning' ? <TipIcon size={14} /> : <InfoIcon size={14} />}
                {validation.message}
              </span>
            </ValidationMessage>
          )}
        </InputGroup>

        {/* Preview Box */}
        {preview && selectedValidator && (
          <PreviewBox $isDark={isDark}>
            <PreviewTitle $isDark={isDark}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                {activeTab === 'stake' ? <SparkleIcon size={14} color="#30d158" /> : <CoinsIcon size={14} color="#ff9f0a" />}
                {activeTab === 'stake' ? 'You will receive' : 'You will get back'}
              </span>
            </PreviewTitle>
            <PreviewRow>
              <PreviewLabel $isDark={isDark}>Amount</PreviewLabel>
              <PreviewValue $isDark={isDark}>
                {preview.receive.toLocaleString(undefined, { maximumFractionDigits: 2 })} {preview.receiveToken}
              </PreviewValue>
            </PreviewRow>
            {activeTab === 'stake' && (
              <>
                <PreviewRow>
                  <PreviewLabel $isDark={isDark}>Est. yearly earnings</PreviewLabel>
                  <PreviewValue $isDark={isDark} $highlight>
                    +{preview.yearlyMin.toFixed(1)} - {preview.yearlyMax.toFixed(1)} CSPR
                  </PreviewValue>
                </PreviewRow>
                <PreviewRow>
                  <PreviewLabel $isDark={isDark}>Est. monthly earnings</PreviewLabel>
                  <PreviewValue $isDark={isDark} $highlight>
                    +{preview.monthly.toFixed(2)} CSPR
                  </PreviewValue>
                </PreviewRow>
              </>
            )}
            {activeTab === 'unstake' && (
              <PreviewRow>
                <PreviewLabel $isDark={isDark}>Unbonding period</PreviewLabel>
                <PreviewValue $isDark={isDark}>~7 eras (~14h on testnet)</PreviewValue>
              </PreviewRow>
            )}
          </PreviewBox>
        )}

        {/* V17: Validator Selector */}
        <div style={{ marginBottom: '20px' }}>
          <ValidatorSelector
            approvedPublicKeys={APPROVED_VALIDATORS}
            selectedValidator={selectedValidator}
            onSelect={setSelectedValidator}
            baseAPY={17}
            disabled={isProcessing}
          />
        </div>

        <SubmitButton type="submit" disabled={isProcessing || !amount || !validation.valid || !selectedValidator}>
          {isProcessing ? (
            <>
              <Spinner />
              Processing...
            </>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              {activeTab === 'stake' ? <RocketIcon size={18} /> : <SendIcon size={18} />}
              {activeTab === 'stake' ? 'Stake CSPR' : 'Unstake stCSPR'}
            </span>
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

        <InfoBox $isDark={isDark}>
          <InfoRow $isDark={isDark}>
            <InfoLabel $isDark={isDark}>Exchange Rate (V17)</InfoLabel>
            <InfoValue $isDark={isDark} style={{ color: exchangeRate > 1 ? '#30d158' : undefined }}>
              1 stCSPR = {exchangeRate.toFixed(4)} CSPR
            </InfoValue>
          </InfoRow>
          <InfoRow $isDark={isDark}>
            <InfoLabel $isDark={isDark}>APY (estimated)</InfoLabel>
            <InfoValue $isDark={isDark} style={{ color: '#30d158' }}>~15-18%</InfoValue>
          </InfoRow>
          <InfoRow $isDark={isDark}>
            <InfoLabel $isDark={isDark}>Gas Fee</InfoLabel>
            <InfoValue $isDark={isDark}>{GAS_FEE_CSPR} CSPR</InfoValue>
          </InfoRow>
          <InfoRow $isDark={isDark}>
            <InfoLabel $isDark={isDark}>Min. Stake</InfoLabel>
            <InfoValue $isDark={isDark}>{MIN_STAKE_CSPR} CSPR</InfoValue>
          </InfoRow>
          <InfoRow $isDark={isDark}>
            <InfoLabel $isDark={isDark}>Unbonding Period</InfoLabel>
            <InfoValue $isDark={isDark}>~7 eras</InfoValue>
          </InfoRow>
        </InfoBox>
      </form>
      </Container>
    </>
  );
};
