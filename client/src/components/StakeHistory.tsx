import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { api } from '../services/api';
import { useCsprClick } from '../hooks/useCsprClick';
import { StakeRecord } from '../types';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 24px;
  padding: 32px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
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

const RefreshButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 8px 16px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
`;

const TransactionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TransactionItem = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
  animation: ${fadeIn} 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
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

const TransactionType = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
  text-transform: capitalize;
`;

const TransactionDate = styled.div`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
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

const TransactionHash = styled.a`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  text-decoration: none;
  font-family: 'SF Mono', monospace;
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

const EmptyText = styled.p`
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
  margin-bottom: 8px;
`;

const EmptySubtext = styled.p`
  color: rgba(255, 255, 255, 0.3);
  font-size: 14px;
`;

const LoadingSkeleton = styled.div`
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.03) 0%,
    rgba(255, 255, 255, 0.06) 50%,
    rgba(255, 255, 255, 0.03) 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 16px;
  height: 76px;
`;

export const StakeHistory: React.FC = () => {
  const { activeAccount } = useCsprClick();
  const [stakes, setStakes] = useState<StakeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (!activeAccount) {
      setStakes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await api.getUserStakes(activeAccount.accountHash, 10, 0);
      setStakes(response.data);
    } catch (error) {
      console.log('API unavailable for transaction history');
      setStakes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [activeAccount]);

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
      <Container>
        <Header>
          <Title>
            <TitleIcon>📜</TitleIcon>
            History
          </Title>
        </Header>
        <EmptyState>
          <EmptyIcon>🔐</EmptyIcon>
          <EmptyText>Connect your wallet</EmptyText>
          <EmptySubtext>View your transaction history</EmptySubtext>
        </EmptyState>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>
            <TitleIcon>📜</TitleIcon>
            History
          </Title>
        </Header>
        <TransactionList>
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
        </TransactionList>
      </Container>
    );
  }

  if (stakes.length === 0) {
    return (
      <Container>
        <Header>
          <Title>
            <TitleIcon>📜</TitleIcon>
            History
          </Title>
          <RefreshButton onClick={fetchHistory}>
            🔄 Refresh
          </RefreshButton>
        </Header>
        <EmptyState>
          <EmptyIcon>📭</EmptyIcon>
          <EmptyText>No transactions yet</EmptyText>
          <EmptySubtext>Start staking to see your history</EmptySubtext>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <TitleIcon>📜</TitleIcon>
          History
        </Title>
        <RefreshButton onClick={fetchHistory}>
          🔄 Refresh
        </RefreshButton>
      </Header>
      <TransactionList>
        {stakes.map((stake, index) => (
          <TransactionItem key={stake.id} style={{ animationDelay: `${index * 0.05}s` }}>
            <TransactionLeft>
              <TransactionIcon type={stake.actionType}>
                {getIcon(stake.actionType)}
              </TransactionIcon>
              <TransactionInfo>
                <TransactionType>{stake.actionType}</TransactionType>
                <TransactionDate>{formatDate(stake.timestamp)}</TransactionDate>
              </TransactionInfo>
            </TransactionLeft>
            <TransactionRight>
              <TransactionAmount type={stake.actionType}>
                {stake.actionType === 'stake' ? '+' : '-'}{formatAmount(stake.amount)} {stake.actionType === 'transfer' ? 'stCSPR' : 'CSPR'}
              </TransactionAmount>
              <TransactionHash
                href={`${window.config?.cspr_live_url || 'https://testnet.cspr.live'}/deploy/${stake.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {stake.txHash.substring(0, 8)}...{stake.txHash.substring(stake.txHash.length - 6)}
              </TransactionHash>
            </TransactionRight>
          </TransactionItem>
        ))}
      </TransactionList>
    </Container>
  );
};
