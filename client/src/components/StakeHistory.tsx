import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { api } from '../services/api';
import { useCsprClick } from '../hooks/useCsprClick';
import { StakeRecord } from '../types';

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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px;
  color: #999;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Td = styled.td`
  padding: 16px 12px;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const Badge = styled.span<{ type: string }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${(props) => {
    if (props.type === 'stake') return 'rgba(76, 175, 80, 0.2)';
    if (props.type === 'unstake') return 'rgba(255, 152, 0, 0.2)';
    return 'rgba(33, 150, 243, 0.2)';
  }};
  color: ${(props) => {
    if (props.type === 'stake') return '#4caf50';
    if (props.type === 'unstake') return '#ff9800';
    return '#2196f3';
  }};
`;

const TxHash = styled.a`
  color: #667eea;
  text-decoration: none;
  font-family: monospace;
  font-size: 14px;

  &:hover {
    text-decoration: underline;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  color: #999;
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 48px;
  color: #999;
`;

export const StakeHistory: React.FC = () => {
  const { activeAccount } = useCsprClick();
  const [stakes, setStakes] = useState<StakeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        // API unavailable - show empty state
        console.log('API unavailable for transaction history');
        setStakes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [activeAccount]);

  const formatAmount = (motes: string): string => {
    const cspr = parseFloat(motes) / 1_000_000_000;
    return cspr.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  const formatDate = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  if (!activeAccount) {
    return (
      <Container>
        <Title>Transaction History</Title>
        <EmptyState>Connect your wallet to view transaction history</EmptyState>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Title>Transaction History</Title>
        <LoadingText>Loading...</LoadingText>
      </Container>
    );
  }

  if (stakes.length === 0) {
    return (
      <Container>
        <Title>Transaction History</Title>
        <EmptyState>No transactions yet. Start staking to see your history!</EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Transaction History</Title>
      <Table>
        <thead>
          <tr>
            <Th>Type</Th>
            <Th>Amount</Th>
            <Th>Date</Th>
            <Th>Transaction</Th>
          </tr>
        </thead>
        <tbody>
          {stakes.map((stake) => (
            <tr key={stake.id}>
              <Td>
                <Badge type={stake.actionType}>{stake.actionType.toUpperCase()}</Badge>
              </Td>
              <Td>
                {formatAmount(stake.amount)} {stake.actionType === 'transfer' ? 'stCSPR' : 'CSPR'}
              </Td>
              <Td>{formatDate(stake.timestamp)}</Td>
              <Td>
                <TxHash
                  href={`${window.config?.cspr_live_url || 'https://testnet.cspr.live'}/deploy/${stake.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {stake.txHash.substring(0, 16)}...
                </TxHash>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};
