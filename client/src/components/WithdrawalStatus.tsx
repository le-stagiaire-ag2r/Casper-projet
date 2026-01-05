import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useCsprClick } from '../hooks/useCsprClick';
import { useStaking } from '../hooks/useStaking';

// Get config
const config = (window as any).config || {};
const CSPR_LIVE_URL = config.cspr_live_url || 'https://testnet.cspr.live';

// Testnet: ~2 hours per era, 7 eras = ~14 hours
// Mainnet: ~2 hours per era, 7 eras = ~14 hours
const UNBONDING_HOURS = 14;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Container = styled.div`
  background: rgba(20, 10, 30, 0.6);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(139, 92, 246, 0.2);
  margin-bottom: 24px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Badge = styled.span<{ $count: number }>`
  background: ${props => props.$count > 0 ? 'rgba(255, 159, 10, 0.2)' : 'rgba(48, 209, 88, 0.2)'};
  color: ${props => props.$count > 0 ? '#ff9f0a' : '#30d158'};
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
`;

const WithdrawalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const WithdrawalCard = styled.div<{ $status: 'pending' | 'ready' | 'claimed' | 'confirming' }>`
  background: ${props => {
    switch (props.$status) {
      case 'confirming': return 'rgba(94, 92, 230, 0.1)';
      case 'pending': return 'rgba(255, 159, 10, 0.1)';
      case 'ready': return 'rgba(48, 209, 88, 0.1)';
      case 'claimed': return 'rgba(255, 255, 255, 0.05)';
    }
  }};
  border: 1px solid ${props => {
    switch (props.$status) {
      case 'confirming': return 'rgba(94, 92, 230, 0.3)';
      case 'pending': return 'rgba(255, 159, 10, 0.3)';
      case 'ready': return 'rgba(48, 209, 88, 0.3)';
      case 'claimed': return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  border-radius: 12px;
  padding: 16px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const Amount = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #fff;
`;

const StatusBadge = styled.span<{ $status: 'pending' | 'ready' | 'claimed' | 'confirming' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
  background: ${props => {
    switch (props.$status) {
      case 'confirming': return 'rgba(94, 92, 230, 0.2)';
      case 'pending': return 'rgba(255, 159, 10, 0.2)';
      case 'ready': return 'rgba(48, 209, 88, 0.2)';
      case 'claimed': return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'confirming': return '#5e5ce6';
      case 'pending': return '#ff9f0a';
      case 'ready': return '#30d158';
      case 'claimed': return 'rgba(255, 255, 255, 0.5)';
    }
  }};
`;

const StatusIcon = styled.span<{ $status: 'pending' | 'ready' | 'claimed' | 'confirming' }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  ${props => (props.$status === 'pending' || props.$status === 'confirming') && css`animation: ${pulse} 1.5s infinite;`}
`;

const ProgressSection = styled.div`
  margin-top: 12px;
`;

const ProgressBar = styled.div`
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${props => props.$progress}%;
  background: linear-gradient(90deg, #ff9f0a, #30d158);
  border-radius: 3px;
  transition: width 0.5s ease;
`;

const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
`;

const TimeRemaining = styled.span`
  color: #ff9f0a;
  font-weight: 600;
`;

const InfoNote = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 14px;
  background: rgba(48, 209, 88, 0.1);
  border-radius: 8px;
  font-size: 12px;
  color: #30d158;
`;

const ClaimButton = styled.button<{ $disabled?: boolean }>`
  width: 100%;
  margin-top: 12px;
  padding: 14px 20px;
  background: ${props => props.$disabled
    ? 'rgba(255, 255, 255, 0.1)'
    : 'linear-gradient(135deg, #30d158 0%, #34c759 100%)'};
  border: none;
  border-radius: 12px;
  color: ${props => props.$disabled ? 'rgba(255, 255, 255, 0.4)' : '#fff'};
  font-weight: 700;
  font-size: 14px;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(48, 209, 88, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const Spinner = styled.span`
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px;
  color: rgba(255, 255, 255, 0.5);
`;

const SuccessMessage = styled.div`
  margin-top: 12px;
  padding: 12px 16px;
  background: rgba(48, 209, 88, 0.1);
  border: 1px solid rgba(48, 209, 88, 0.3);
  border-radius: 8px;
  color: #30d158;
  font-size: 13px;
`;

const ExplorerLink = styled.a`
  color: #30d158;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

interface Withdrawal {
  requestId: number | string; // Can be temp string while waiting for confirmation
  csprAmount: number;
  isReady: boolean;
  isClaimed: boolean;
  requestTime: Date;
  userAccount?: string; // V22: Track which account made this withdrawal
  pendingRequestId?: boolean; // V23: True if waiting for request_id confirmation
  deployHash?: string; // V23: Deploy hash for tracking
}

// Get withdrawals from localStorage, filtered by account
const getWithdrawals = (accountPublicKey?: string): Withdrawal[] => {
  const stored = localStorage.getItem('pendingWithdrawals');
  if (stored) {
    try {
      const data = JSON.parse(stored);
      // V22: Filter by current account (if userAccount is stored)
      const filtered = accountPublicKey
        ? data.filter((w: any) => !w.userAccount || w.userAccount === accountPublicKey)
        : data;
      return filtered.map((w: any) => ({
        ...w,
        requestTime: new Date(w.requestTime),
      }));
    } catch {
      return [];
    }
  }
  return [];
};

// Update withdrawal in localStorage
const updateWithdrawal = (requestId: number, updates: Partial<Withdrawal>) => {
  const stored = localStorage.getItem('pendingWithdrawals');
  if (stored) {
    try {
      const data = JSON.parse(stored);
      const updated = data.map((w: any) =>
        w.requestId === requestId ? { ...w, ...updates } : w
      );
      localStorage.setItem('pendingWithdrawals', JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
};

export const WithdrawalStatus: React.FC = () => {
  const { activeAccount } = useCsprClick();
  const { claim, isProcessing, deployHash, error } = useStaking();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<{ requestId: number; deployHash: string } | null>(null);

  useEffect(() => {
    if (!activeAccount) {
      setWithdrawals([]);
      setLoading(false);
      return;
    }

    const loadWithdrawals = async () => {
      setLoading(true);
      try {
        // V22: Get ALL withdrawals from storage
        const stored = localStorage.getItem('pendingWithdrawals');
        const allData = stored ? JSON.parse(stored) : [];

        // Check if any withdrawals are now ready based on time
        const now = new Date();
        let hasChanges = false;
        const allUpdated = allData.map((w: any) => {
          // V23: Don't mark as ready if still waiting for request_id confirmation
          if (!w.isClaimed && !w.isReady && !w.pendingRequestId) {
            const elapsed = (now.getTime() - new Date(w.requestTime).getTime()) / (1000 * 60 * 60);
            if (elapsed >= UNBONDING_HOURS) {
              hasChanges = true;
              return { ...w, isReady: true };
            }
          }
          return w;
        });

        // Only update localStorage if something changed
        if (hasChanges) {
          localStorage.setItem('pendingWithdrawals', JSON.stringify(allUpdated));
        }

        // V22: Filter by current account for display
        const myWithdrawals = allUpdated
          .filter((w: any) => !w.userAccount || w.userAccount === activeAccount?.publicKey)
          .map((w: any) => ({
            ...w,
            requestTime: new Date(w.requestTime),
            pendingRequestId: w.pendingRequestId || false,
          }));

        setWithdrawals(myWithdrawals);
      } catch (err) {
        console.error('Failed to load withdrawals:', err);
      }
      setLoading(false);
    };

    loadWithdrawals();

    // Refresh every 30 seconds
    const interval = setInterval(loadWithdrawals, 30000);

    // V23: Listen for withdrawal_updated event (when request_id is confirmed)
    const handleWithdrawalUpdate = () => {
      console.log('Withdrawal updated, refreshing...');
      loadWithdrawals();
    };
    window.addEventListener('withdrawal_updated', handleWithdrawalUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('withdrawal_updated', handleWithdrawalUpdate);
    };
  }, [activeAccount]);

  // Update time remaining every minute
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const getTimeRemaining = (requestTime: Date): { hours: number; minutes: number; progress: number } => {
    const now = new Date();
    const elapsed = (now.getTime() - requestTime.getTime()) / (1000 * 60 * 60);
    const remaining = Math.max(0, UNBONDING_HOURS - elapsed);
    const progress = Math.min(100, (elapsed / UNBONDING_HOURS) * 100);

    return {
      hours: Math.floor(remaining),
      minutes: Math.floor((remaining % 1) * 60),
      progress,
    };
  };

  const getStatus = (w: Withdrawal): 'pending' | 'ready' | 'claimed' | 'confirming' => {
    if (w.isClaimed) return 'claimed';

    // V23: Check if still waiting for request_id confirmation
    if (w.pendingRequestId) return 'confirming';

    // Check if enough time has passed
    const now = new Date();
    const elapsed = (now.getTime() - new Date(w.requestTime).getTime()) / (1000 * 60 * 60);
    if (elapsed >= UNBONDING_HOURS || w.isReady) return 'ready';

    return 'pending';
  };

  const getStatusText = (status: 'pending' | 'ready' | 'claimed' | 'confirming'): string => {
    switch (status) {
      case 'confirming': return 'Confirming...';
      case 'pending': return 'Unbonding...';
      case 'ready': return 'Ready to claim';
      case 'claimed': return 'Completed';
    }
  };

  const handleClaim = async (w: Withdrawal) => {
    // V23: Don't allow claiming if request_id is pending or not a number
    if (w.pendingRequestId || typeof w.requestId !== 'number') {
      console.warn('Cannot claim: request_id not confirmed yet');
      return;
    }

    setClaimingId(w.requestId);
    setClaimSuccess(null);

    const result = await claim(w.requestId);

    if (result.success) {
      // Update withdrawal as claimed
      updateWithdrawal(w.requestId, { isClaimed: true });
      setWithdrawals(prev =>
        prev.map(withdrawal =>
          withdrawal.requestId === w.requestId
            ? { ...withdrawal, isClaimed: true }
            : withdrawal
        )
      );
      setClaimSuccess({ requestId: w.requestId, deployHash: result.deployHash || '' });
    }

    setClaimingId(null);
  };

  if (!activeAccount) return null;

  const pendingCount = withdrawals.filter(w => !w.isClaimed).length;

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>Withdrawal Status</Title>
        </Header>
        <EmptyState>
          <Spinner style={{ width: 24, height: 24 }} />
        </EmptyState>
      </Container>
    );
  }

  if (withdrawals.length === 0) {
    return null; // Don't show if no withdrawals
  }

  return (
    <Container>
      <Header>
        <Title>
          Withdrawal Status
        </Title>
        <Badge $count={pendingCount}>
          {pendingCount > 0 ? `${pendingCount} pending` : 'All complete'}
        </Badge>
      </Header>

      <WithdrawalList>
        {withdrawals.map((w) => {
          const status = getStatus(w);
          const time = getTimeRemaining(w.requestTime);
          const isClaiming = claimingId === w.requestId;
          const wasJustClaimed = claimSuccess?.requestId === w.requestId;

          return (
            <WithdrawalCard key={w.requestId} $status={status}>
              <CardHeader>
                <Amount>{w.csprAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} CSPR</Amount>
                <StatusBadge $status={status}>
                  <StatusIcon $status={status} />
                  {getStatusText(status)}
                </StatusBadge>
              </CardHeader>

              {status === 'confirming' && (
                <InfoNote style={{ background: 'rgba(94, 92, 230, 0.1)', color: '#5e5ce6' }}>
                  <Spinner style={{ width: 12, height: 12, borderTopColor: '#5e5ce6', borderColor: 'rgba(94, 92, 230, 0.3)' }} />
                  Waiting for transaction confirmation...
                </InfoNote>
              )}

              {status === 'pending' && (
                <ProgressSection>
                  <ProgressBar>
                    <ProgressFill $progress={time.progress} />
                  </ProgressBar>
                  <ProgressInfo>
                    <span>~7 eras unbonding</span>
                    <TimeRemaining>
                      {time.hours}h {time.minutes}m remaining
                    </TimeRemaining>
                  </ProgressInfo>
                </ProgressSection>
              )}

              {status === 'ready' && !w.isClaimed && (
                <>
                  <ClaimButton
                    onClick={() => handleClaim(w)}
                    $disabled={isClaiming}
                    disabled={isClaiming}
                  >
                    {isClaiming ? (
                      <>
                        <Spinner />
                        Claiming...
                      </>
                    ) : (
                      <>
                        Claim {w.csprAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} CSPR
                      </>
                    )}
                  </ClaimButton>
                  {wasJustClaimed && claimSuccess.deployHash && (
                    <SuccessMessage>
                      Claim successful!{' '}
                      <ExplorerLink
                        href={`${CSPR_LIVE_URL}/deploy/${claimSuccess.deployHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on explorer
                      </ExplorerLink>
                    </SuccessMessage>
                  )}
                </>
              )}

              {status === 'claimed' && (
                <InfoNote style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.5)' }}>
                  CSPR sent to your wallet
                </InfoNote>
              )}
            </WithdrawalCard>
          );
        })}
      </WithdrawalList>

      {error && (
        <InfoNote style={{ background: 'rgba(255, 69, 58, 0.1)', color: '#ff453a', marginTop: 16 }}>
          Error: {error}
        </InfoNote>
      )}
    </Container>
  );
};

export default WithdrawalStatus;
