import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { api } from '../services/api';
import { useCsprClick } from '../hooks/useCsprClick';

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const CardTitle = styled.h3`
  font-size: 14px;
  color: #999;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const CardValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
`;

const CardSubtext = styled.div`
  font-size: 14px;
  color: #667eea;
`;

const LoadingText = styled.div`
  color: #999;
  font-size: 14px;
`;

export const Dashboard: React.FC = () => {
  const { activeAccount } = useCsprClick();
  const [totalStaked, setTotalStaked] = useState<string>('0');
  const [userStaked, setUserStaked] = useState<string>('0');
  const [activeValidators, setActiveValidators] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Try to fetch from API, but gracefully handle if API is unavailable
        const tvlData = await api.getTotalStaked();
        setTotalStaked(tvlData.totalStaked);

        if (activeAccount) {
          const userStakedData = await api.getUserTotalStaked(activeAccount.accountHash);
          setUserStaked(userStakedData.totalStaked);
        }

        const validatorsData = await api.getActiveValidators();
        setActiveValidators(validatorsData.data.length);
      } catch (error) {
        // API unavailable - use placeholder values for demo
        console.log('API unavailable, using placeholder values');
        setTotalStaked('0');
        setUserStaked('0');
        setActiveValidators(5);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Only refresh if API is likely available (localhost)
    const isLocalhost = window.location.hostname === 'localhost';
    if (isLocalhost) {
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [activeAccount]);

  const formatAmount = (motes: string): string => {
    const cspr = parseFloat(motes) / 1_000_000_000;
    return cspr.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const calculateAPY = (): string => {
    return '10.00'; // Fixed APY from your contract
  };

  return (
    <Container>
      <Card>
        <CardTitle>Total Value Locked</CardTitle>
        {loading ? (
          <LoadingText>Loading...</LoadingText>
        ) : (
          <>
            <CardValue>{formatAmount(totalStaked)} CSPR</CardValue>
            <CardSubtext>Across all validators</CardSubtext>
          </>
        )}
      </Card>

      <Card>
        <CardTitle>Your Stake</CardTitle>
        {loading ? (
          <LoadingText>Loading...</LoadingText>
        ) : activeAccount ? (
          <>
            <CardValue>{formatAmount(userStaked)} stCSPR</CardValue>
            <CardSubtext>Your liquid staking tokens</CardSubtext>
          </>
        ) : (
          <LoadingText>Connect wallet to view</LoadingText>
        )}
      </Card>

      <Card>
        <CardTitle>APY</CardTitle>
        <CardValue>{calculateAPY()}%</CardValue>
        <CardSubtext>Annual Percentage Yield</CardSubtext>
      </Card>

      <Card>
        <CardTitle>Active Validators</CardTitle>
        {loading ? (
          <LoadingText>Loading...</LoadingText>
        ) : (
          <>
            <CardValue>{activeValidators}</CardValue>
            <CardSubtext>Validators in the pool</CardSubtext>
          </>
        )}
      </Card>
    </Container>
  );
};
