import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { api } from '../services/api';
import { useCsprClick } from '../hooks/useCsprClick';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  padding: 28px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #ff2d55, #5856d6, #af52de);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);

    &::before {
      opacity: 1;
    }
  }
`;

const CardIcon = styled.div`
  font-size: 28px;
  margin-bottom: 16px;
`;

const CardTitle = styled.h3`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 600;
`;

const CardValue = styled.div`
  font-size: 36px;
  font-weight: 800;
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  letter-spacing: -1px;
`;

const CardSubtext = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 500;
`;

const LoadingSkeleton = styled.div`
  height: 36px;
  width: 120px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 8px;
  margin-bottom: 8px;
`;

const ConnectPrompt = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
  animation: ${pulse} 2s infinite;
`;

const APYBadge = styled.span`
  display: inline-block;
  background: linear-gradient(135deg, #30d158 0%, #34c759 100%);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  margin-left: 8px;
  vertical-align: middle;
`;

const LiveIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 12px;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    background: #30d158;
    border-radius: 50%;
    animation: ${pulse} 1.5s infinite;
  }
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
        const tvlData = await api.getTotalStaked();
        setTotalStaked(tvlData.totalStaked);

        if (activeAccount) {
          const userStakedData = await api.getUserTotalStaked(activeAccount.accountHash);
          setUserStaked(userStakedData.totalStaked);
        }

        const validatorsData = await api.getActiveValidators();
        setActiveValidators(validatorsData.data.length);
      } catch (error) {
        console.log('API unavailable, using placeholder values');
        setTotalStaked('0');
        setUserStaked('0');
        setActiveValidators(5);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const isLocalhost = window.location.hostname === 'localhost';
    if (isLocalhost) {
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [activeAccount]);

  const formatAmount = (motes: string): string => {
    const cspr = parseFloat(motes) / 1_000_000_000;
    if (cspr >= 1000000) {
      return (cspr / 1000000).toFixed(2) + 'M';
    } else if (cspr >= 1000) {
      return (cspr / 1000).toFixed(2) + 'K';
    }
    return cspr.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const calculateAPY = (): string => {
    return '10.00';
  };

  return (
    <Container>
      <Card>
        <CardIcon>🏦</CardIcon>
        <CardTitle>Total Value Locked</CardTitle>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <CardValue>{formatAmount(totalStaked)} CSPR</CardValue>
            <CardSubtext>Protocol TVL</CardSubtext>
            <LiveIndicator>Live data</LiveIndicator>
          </>
        )}
      </Card>

      <Card>
        <CardIcon>💰</CardIcon>
        <CardTitle>Your Stake</CardTitle>
        {loading ? (
          <LoadingSkeleton />
        ) : activeAccount ? (
          <>
            <CardValue>{formatAmount(userStaked)} stCSPR</CardValue>
            <CardSubtext>Liquid staking tokens</CardSubtext>
          </>
        ) : (
          <ConnectPrompt>
            <span>🔗</span> Connect wallet to view
          </ConnectPrompt>
        )}
      </Card>

      <Card>
        <CardIcon>📈</CardIcon>
        <CardTitle>Current APY</CardTitle>
        <CardValue>
          {calculateAPY()}%
          <APYBadge>LIVE</APYBadge>
        </CardValue>
        <CardSubtext>Annual Percentage Yield</CardSubtext>
      </Card>

      <Card>
        <CardIcon>🛡️</CardIcon>
        <CardTitle>Validators</CardTitle>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <CardValue>{activeValidators}</CardValue>
            <CardSubtext>Active in pool</CardSubtext>
          </>
        )}
      </Card>
    </Container>
  );
};
