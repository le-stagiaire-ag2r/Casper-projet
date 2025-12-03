import React, { useEffect, useState, useCallback } from 'react';
import styled, { keyframes, useTheme } from 'styled-components';
import { useCsprClick } from '../hooks/useCsprClick';

interface LocalTransaction {
  id: string;
  txHash: string;
  actionType: 'stake' | 'unstake';
  amount: string;
  timestamp: string;
  userAddress: string;
}

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.03)'
    : 'rgba(255, 255, 255, 0.8)'};
  border-radius: 24px;
  padding: 32px;
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.08)'};
  box-shadow: ${props => props.$isDark
    ? 'none'
    : '0 4px 20px rgba(0, 0, 0, 0.08)'};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
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

const RefreshButton = styled.button<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.05)'};
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 10px;
  padding: 8px 16px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(0, 0, 0, 0.6)'};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: ${props => props.$isDark
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)'};
    color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  }
`;

const TransactionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TransactionItem = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.02)'
    : 'rgba(0, 0, 0, 0.02)'};
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.05)'};
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
  animation: ${fadeIn} 0.3s ease;

  &:hover {
    background: ${props => props.$isDark
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.05)'};
    border-color: ${props => props.$isDark
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)'};
  }
`;

const TransactionLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const TransactionIcon = styled.div<{ type: string }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: ${(props) => {
    if (props.type === 'stake') return 'rgba(48, 209, 88, 0.15)';
    if (props.type === 'unstake') return 'rgba(255, 159, 10, 0.15)';
    return 'rgba(88, 86, 214, 0.15)';
  }};
`;

const TransactionInfo = styled.div``;

const TransactionType = styled.div<{ $isDark: boolean }>`
  font-size: 15px;
  font-weight: 600;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  margin-bottom: 4px;
  text-transform: capitalize;
`;

const TransactionDate = styled.div<{ $isDark: boolean }>`
  font-size: 13px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.4)'
    : 'rgba(0, 0, 0, 0.4)'};
`;

const TransactionRight = styled.div`
  text-align: right;
`;

const TransactionAmount = styled.div<{ type: string }>`
  font-size: 16px;
  font-weight: 700;
  color: ${(props) => {
    if (props.type === 'stake') return '#30d158';
    if (props.type === 'unstake') return '#ff9f0a';
    return '#5856d6';
  }};
  margin-bottom: 4px;
`;

const TransactionHash = styled.a<{ $isDark: boolean }>`
  font-size: 12px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.4)'
    : 'rgba(0, 0, 0, 0.4)'};
  text-decoration: none;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  transition: color 0.2s ease;

  &:hover {
    color: #5856d6;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyText = styled.p<{ $isDark: boolean }>`
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  font-size: 16px;
  margin-bottom: 8px;
`;

const EmptySubtext = styled.p<{ $isDark: boolean }>`
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.3)'
    : 'rgba(0, 0, 0, 0.3)'};
  font-size: 14px;
`;

const LoadingSkeleton = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.06) 50%, rgba(255, 255, 255, 0.03) 100%)'
    : 'linear-gradient(90deg, rgba(0, 0, 0, 0.03) 0%, rgba(0, 0, 0, 0.06) 50%, rgba(0, 0, 0, 0.03) 100%)'};
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 16px;
  height: 76px;
`;

export const StakeHistory: React.FC = () => {
  const { activeAccount } = useCsprClick();
  const theme = useTheme() as any;
  const isDark = theme?.mode === 'dark';
  const [transactions, setTransactions] = useState<LocalTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(() => {
    if (!activeAccount) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Read from localStorage
      const stored = localStorage.getItem('stakevue_transactions');
      const allTransactions: LocalTransaction[] = stored ? JSON.parse(stored) : [];

      // Filter by current user
      const userTransactions = allTransactions.filter(
        (tx) => tx.userAddress?.toLowerCase() === activeAccount.publicKey?.toLowerCase()
      );

      setTransactions(userTransactions.slice(0, 10)); // Show last 10
    } catch (error) {
      console.error('Error loading transaction history:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [activeAccount]);

  useEffect(() => {
    fetchHistory();

    // Listen for new transactions
    const handleNewTransaction = () => {
      fetchHistory();
    };

    window.addEventListener('stakevue_transaction_added', handleNewTransaction);
    return () => {
      window.removeEventListener('stakevue_transaction_added', handleNewTransaction);
    };
  }, [fetchHistory]);

  const formatAmount = (motes: string): string => {
    const cspr = parseFloat(motes) / 1_000_000_000;
    return cspr.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getIcon = (type: string) => {
    if (type === 'stake') return '💎';
    if (type === 'unstake') return '🔄';
    return '📤';
  };

  if (!activeAccount) {
    return (
      <Container $isDark={isDark}>
        <Header>
          <Title $isDark={isDark}>
            <TitleIcon>📜</TitleIcon>
            History
          </Title>
        </Header>
        <EmptyState>
          <EmptyIcon>🔐</EmptyIcon>
          <EmptyText $isDark={isDark}>Connect your wallet</EmptyText>
          <EmptySubtext $isDark={isDark}>View your transaction history</EmptySubtext>
        </EmptyState>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container $isDark={isDark}>
        <Header>
          <Title $isDark={isDark}>
            <TitleIcon>📜</TitleIcon>
            History
          </Title>
        </Header>
        <TransactionList>
          <LoadingSkeleton $isDark={isDark} />
          <LoadingSkeleton $isDark={isDark} />
          <LoadingSkeleton $isDark={isDark} />
        </TransactionList>
      </Container>
    );
  }

  if (transactions.length === 0) {
    return (
      <Container $isDark={isDark}>
        <Header>
          <Title $isDark={isDark}>
            <TitleIcon>📜</TitleIcon>
            History
          </Title>
          <RefreshButton $isDark={isDark} onClick={fetchHistory}>
            🔄 Refresh
          </RefreshButton>
        </Header>
        <EmptyState>
          <EmptyIcon>📭</EmptyIcon>
          <EmptyText $isDark={isDark}>No transactions yet</EmptyText>
          <EmptySubtext $isDark={isDark}>Start staking to see your history</EmptySubtext>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container $isDark={isDark}>
      <Header>
        <Title $isDark={isDark}>
          <TitleIcon>📜</TitleIcon>
          History
        </Title>
        <RefreshButton $isDark={isDark} onClick={fetchHistory}>
          🔄 Refresh
        </RefreshButton>
      </Header>
      <TransactionList>
        {transactions.map((tx, index) => (
          <TransactionItem
            key={tx.id}
            $isDark={isDark}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <TransactionLeft>
              <TransactionIcon type={tx.actionType}>
                {getIcon(tx.actionType)}
              </TransactionIcon>
              <TransactionInfo>
                <TransactionType $isDark={isDark}>{tx.actionType}</TransactionType>
                <TransactionDate $isDark={isDark}>{formatDate(tx.timestamp)}</TransactionDate>
              </TransactionInfo>
            </TransactionLeft>
            <TransactionRight>
              <TransactionAmount type={tx.actionType}>
                {tx.actionType === 'stake' ? '+' : '-'}{formatAmount(tx.amount)} CSPR
              </TransactionAmount>
              {tx.txHash && (
                <TransactionHash
                  $isDark={isDark}
                  href={`${window.config?.cspr_live_url || 'https://testnet.cspr.live'}/deploy/${tx.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {tx.txHash.substring(0, 8)}...{tx.txHash.substring(tx.txHash.length - 6)}
                </TransactionHash>
              )}
            </TransactionRight>
          </TransactionItem>
        ))}
      </TransactionList>
    </Container>
  );
};
