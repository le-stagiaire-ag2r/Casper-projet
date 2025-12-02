import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
// import { api } from '../services/api'; // Will be used when real API is enabled
import { useCsprClick } from '../hooks/useCsprClick';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const Card = styled.div<{ delay?: number }>`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  animation: ${fadeInUp} 0.6s ease-out ${(props) => props.delay || 0}s both;

  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(102, 126, 234, 0.5);
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.2);
  }
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
  background: linear-gradient(135deg, #ffffff 0%, #667eea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${pulse} 3s ease-in-out infinite;
`;

const CardSubtext = styled.div`
  font-size: 14px;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const DemoBadge = styled.span`
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LoadingText = styled.div`
  color: #999;
  font-size: 14px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite linear;
  border-radius: 4px;
  height: 20px;
  width: 120px;
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

      // Simulate loading delay for smooth UX
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // DEMO MODE: Use realistic fake data
      // Real API integration coming soon
      try {
        // Simulated TVL: ~2.5M CSPR staked
        const demoTVL = (2_547_892_123_456_789).toString();
        setTotalStaked(demoTVL);

        // Simulated user stake if connected
        if (activeAccount) {
          // Random stake between 1000-10000 CSPR
          const randomStake = Math.floor(Math.random() * 9000 + 1000) * 1_000_000_000;
          setUserStaked(randomStake.toString());
        } else {
          setUserStaked('0');
        }

        // Simulated 7 active validators (matches V4.0 contract)
        setActiveValidators(7);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Fallback to demo data
        setTotalStaked('2547892123456789');
        setUserStaked('0');
        setActiveValidators(7);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 30 seconds to simulate real-time updates
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
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
      <Card delay={0}>
        <CardTitle>Total Value Locked</CardTitle>
        {loading ? (
          <LoadingText />
        ) : (
          <>
            <CardValue>{formatAmount(totalStaked)} CSPR</CardValue>
            <CardSubtext>
              Across all validators <DemoBadge>Démo</DemoBadge>
            </CardSubtext>
          </>
        )}
      </Card>

      <Card delay={0.1}>
        <CardTitle>Your Stake</CardTitle>
        {loading ? (
          <LoadingText />
        ) : activeAccount ? (
          <>
            <CardValue>{formatAmount(userStaked)} stCSPR</CardValue>
            <CardSubtext>
              Your liquid staking tokens <DemoBadge>Démo</DemoBadge>
            </CardSubtext>
          </>
        ) : (
          <CardSubtext style={{ marginTop: '12px' }}>Connect wallet to view</CardSubtext>
        )}
      </Card>

      <Card delay={0.2}>
        <CardTitle>APY</CardTitle>
        <CardValue>{calculateAPY()}%</CardValue>
        <CardSubtext>Annual Percentage Yield ✨</CardSubtext>
      </Card>

      <Card delay={0.3}>
        <CardTitle>Active Validators</CardTitle>
        {loading ? (
          <LoadingText />
        ) : (
          <>
            <CardValue>{activeValidators}</CardValue>
            <CardSubtext>
              Multi-validator distribution 🎯
            </CardSubtext>
          </>
        )}
      </Card>
    </Container>
  );
};
