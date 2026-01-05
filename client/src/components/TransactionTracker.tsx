import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div<{ $isDark: boolean; $isVisible: boolean }>`
  position: fixed;
  bottom: 100px;
  right: 24px;
  width: 340px;
  max-width: calc(100vw - 48px);
  background: rgba(20, 10, 30, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(139, 92, 246, 0.3);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  display: ${props => props.$isVisible ? 'block' : 'none'};
  animation: ${slideIn} 0.3s ease;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: #fff;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const Content = styled.div`
  padding: 16px;
`;

const StatusSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const StatusIcon = styled.div<{ $status: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    switch (props.$status) {
      case 'pending': return 'rgba(255, 159, 10, 0.2)';
      case 'success': return 'rgba(48, 209, 88, 0.2)';
      case 'failed': return 'rgba(255, 59, 48, 0.2)';
      default: return 'rgba(139, 92, 246, 0.2)';
    }
  }};

  svg {
    width: 24px;
    height: 24px;
    color: ${props => {
      switch (props.$status) {
        case 'pending': return '#ff9f0a';
        case 'success': return '#30d158';
        case 'failed': return '#ff3b30';
        default: return '#8b5cf6';
      }
    }};
    ${props => props.$status === 'pending' && `animation: ${spin} 1s linear infinite;`}
  }
`;

const StatusInfo = styled.div`
  flex: 1;
`;

const StatusText = styled.div<{ $status: string }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => {
    switch (props.$status) {
      case 'pending': return '#ff9f0a';
      case 'success': return '#30d158';
      case 'failed': return '#ff3b30';
      default: return '#fff';
    }
  }};
  margin-bottom: 4px;
`;

const StatusSubtext = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
`;

const ProgressBar = styled.div`
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 16px;
`;

const ProgressFill = styled.div<{ $progress: number; $status: string }>`
  height: 100%;
  width: ${props => props.$progress}%;
  background: ${props => {
    switch (props.$status) {
      case 'pending': return 'linear-gradient(90deg, #ff9f0a, #ffaa00)';
      case 'success': return 'linear-gradient(90deg, #30d158, #28a745)';
      case 'failed': return 'linear-gradient(90deg, #ff3b30, #ff453a)';
      default: return 'linear-gradient(90deg, #8b5cf6, #a78bfa)';
    }
  }};
  transition: width 0.5s ease;
  ${props => props.$status === 'pending' && `animation: ${pulse} 1s ease-in-out infinite;`}
`;

const DeployInfo = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
`;

const DeployRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const DeployLabel = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
`;

const DeployValue = styled.span`
  font-size: 12px;
  color: #fff;
  font-family: 'JetBrains Mono', monospace;
`;

const DeployLink = styled.a`
  font-size: 12px;
  color: #8b5cf6;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    text-decoration: underline;
  }

  svg {
    width: 12px;
    height: 12px;
  }
`;

const RetryButton = styled.button`
  width: 100%;
  margin-top: 12px;
  padding: 10px;
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 8px;
  color: #8b5cf6;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(139, 92, 246, 0.3);
  }
`;

// Icons
const SpinnerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ErrorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export interface TrackedTransaction {
  deployHash: string;
  type: 'stake' | 'unstake' | 'claim';
  amount?: string;
  timestamp: Date;
}

interface TransactionTrackerProps {
  isDark?: boolean;
  transaction: TrackedTransaction | null;
  onClose: () => void;
  onRetry?: () => void;
}

type TransactionStatus = 'pending' | 'success' | 'failed';

export const TransactionTracker: React.FC<TransactionTrackerProps> = ({
  isDark = true,
  transaction,
  onClose,
  onRetry
}) => {
  const [status, setStatus] = useState<TransactionStatus>('pending');
  const [progress, setProgress] = useState(10);
  const [checkCount, setCheckCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const config = (window as any).config;
  const explorerUrl = config?.cspr_live_url || 'https://testnet.cspr.live';

  const checkDeployStatus = useCallback(async (deployHash: string) => {
    try {
      // Try to check deploy status via RPC
      const rpcUrl = config?.rpc_url || 'https://rpc.testnet.casperlabs.io/rpc';

      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'info_get_deploy',
          params: { deploy_hash: deployHash }
        })
      });

      const data = await response.json();

      if (data.result?.deploy?.header) {
        // Deploy exists
        const executionResults = data.result.execution_results;

        if (executionResults && executionResults.length > 0) {
          const result = executionResults[0].result;

          if (result.Success) {
            setStatus('success');
            setProgress(100);
            return true;
          } else if (result.Failure) {
            setStatus('failed');
            setProgress(100);
            setErrorMessage(result.Failure.error_message || 'Transaction failed');
            return true;
          }
        }

        // Still pending execution
        setProgress(prev => Math.min(prev + 10, 90));
        return false;
      }

      // Deploy not found yet
      setProgress(prev => Math.min(prev + 5, 50));
      return false;
    } catch (error) {
      console.error('Error checking deploy status:', error);
      // Continue checking on network errors
      return false;
    }
  }, [config?.rpc_url]);

  useEffect(() => {
    if (!transaction?.deployHash) return;

    setStatus('pending');
    setProgress(10);
    setCheckCount(0);
    setErrorMessage(null);

    const maxChecks = 60; // Check for up to 5 minutes (60 * 5 seconds)
    let checks = 0;

    const checkStatus = async () => {
      if (checks >= maxChecks) {
        setStatus('failed');
        setErrorMessage('Transaction timed out. Please check explorer.');
        return;
      }

      const isComplete = await checkDeployStatus(transaction.deployHash);
      checks++;
      setCheckCount(checks);

      if (!isComplete && status === 'pending') {
        setTimeout(checkStatus, 5000); // Check every 5 seconds
      }
    };

    // Start checking after a short delay
    const initialTimeout = setTimeout(checkStatus, 2000);

    return () => {
      clearTimeout(initialTimeout);
    };
  }, [transaction?.deployHash, checkDeployStatus]);

  if (!transaction) return null;

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Processing Transaction...';
      case 'success':
        return 'Transaction Successful!';
      case 'failed':
        return 'Transaction Failed';
      default:
        return 'Unknown Status';
    }
  };

  const getStatusSubtext = () => {
    switch (status) {
      case 'pending':
        return `Checking status... (${checkCount} checks)`;
      case 'success':
        return 'Your transaction has been confirmed on-chain';
      case 'failed':
        return errorMessage || 'Something went wrong';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <SpinnerIcon />;
      case 'success':
        return <CheckIcon />;
      case 'failed':
        return <ErrorIcon />;
      default:
        return <SpinnerIcon />;
    }
  };

  const formatAmount = (amount?: string) => {
    if (!amount) return '-';
    const cspr = parseFloat(amount) / 1_000_000_000;
    return `${cspr.toLocaleString(undefined, { maximumFractionDigits: 2 })} CSPR`;
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  return (
    <Container $isDark={isDark} $isVisible={true}>
      <Header>
        <Title>
          {transaction.type === 'stake' && '⬆️'}
          {transaction.type === 'unstake' && '⬇️'}
          {transaction.type === 'claim' && '💰'}
          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} Transaction
        </Title>
        <CloseButton onClick={onClose}>
          <CloseIcon />
        </CloseButton>
      </Header>

      <Content>
        <StatusSection>
          <StatusIcon $status={status}>
            {getStatusIcon()}
          </StatusIcon>
          <StatusInfo>
            <StatusText $status={status}>{getStatusText()}</StatusText>
            <StatusSubtext>{getStatusSubtext()}</StatusSubtext>
          </StatusInfo>
        </StatusSection>

        <ProgressBar>
          <ProgressFill $progress={progress} $status={status} />
        </ProgressBar>

        <DeployInfo>
          <DeployRow>
            <DeployLabel>Deploy Hash</DeployLabel>
            <DeployLink
              href={`${explorerUrl}/deploy/${transaction.deployHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {truncateHash(transaction.deployHash)}
              <ExternalLinkIcon />
            </DeployLink>
          </DeployRow>
          {transaction.amount && (
            <DeployRow>
              <DeployLabel>Amount</DeployLabel>
              <DeployValue>{formatAmount(transaction.amount)}</DeployValue>
            </DeployRow>
          )}
          <DeployRow>
            <DeployLabel>Time</DeployLabel>
            <DeployValue>
              {transaction.timestamp.toLocaleTimeString()}
            </DeployValue>
          </DeployRow>
        </DeployInfo>

        {status === 'failed' && onRetry && (
          <RetryButton onClick={onRetry}>
            Retry Transaction
          </RetryButton>
        )}
      </Content>
    </Container>
  );
};

export default TransactionTracker;
