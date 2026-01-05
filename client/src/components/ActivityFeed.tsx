import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { useCsprClick } from '../hooks/useCsprClick';
import { csprCloudApi, motesToCSPR } from '../services/csprCloud';

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

const Container = styled.div<{ $isDark: boolean }>`
  background: rgba(20, 10, 30, 0.6);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h3<{ $isDark: boolean }>`
  margin: 0;
  font-size: 1.1rem;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LiveDot = styled.span`
  width: 8px;
  height: 8px;
  background: #30d158;
  border-radius: 50%;
  animation: ${pulse} 2s infinite;
`;

const LiveBadge = styled.span<{ $isLive: boolean }>`
  background: ${props => props.$isLive
    ? 'rgba(48, 209, 88, 0.2)'
    : 'rgba(255, 159, 10, 0.2)'};
  color: ${props => props.$isLive ? '#30d158' : '#ff9f0a'};
  font-size: 0.7rem;
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: 600;
`;

const FeedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 350px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(139, 92, 246, 0.3);
    border-radius: 2px;
  }
`;

const FeedItem = styled.div<{ $isDark: boolean; $isNew?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.03)'
    : 'rgba(0, 0, 0, 0.02)'};
  border-radius: 12px;
  animation: ${props => props.$isNew ? slideIn : 'none'} 0.4s ease;
  transition: background 0.2s;

  &:hover {
    background: ${props => props.$isDark
      ? 'rgba(255, 255, 255, 0.06)'
      : 'rgba(0, 0, 0, 0.04)'};
  }
`;

const IconWrapper = styled.div<{ $type: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  background: ${props => {
    switch (props.$type) {
      case 'stake': return 'rgba(48, 209, 88, 0.15)';
      case 'unstake': return 'rgba(255, 159, 10, 0.15)';
      case 'claim': return 'rgba(88, 86, 214, 0.15)';
      case 'reward': return 'rgba(255, 45, 85, 0.15)';
      default: return 'rgba(139, 92, 246, 0.15)';
    }
  }};
`;

const FeedContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const FeedText = styled.div<{ $isDark: boolean }>`
  font-size: 0.85rem;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
`;

const Address = styled.span`
  font-family: 'SF Mono', monospace;
  color: #8b5cf6;
  font-size: 0.8rem;
`;

const Amount = styled.span<{ $type: string }>`
  font-weight: 600;
  color: ${props => {
    switch (props.$type) {
      case 'stake': return '#30d158';
      case 'unstake': return '#ff9f0a';
      case 'claim': return '#5856d6';
      case 'reward': return '#ff2d55';
      default: return '#8b5cf6';
    }
  }};
`;

const TimeAgo = styled.div<{ $isDark: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.4)'
    : 'rgba(0, 0, 0, 0.4)'};
  margin-top: 2px;
`;

const EmptyState = styled.div<{ $isDark: boolean }>`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.4)'
    : 'rgba(0, 0, 0, 0.4)'};
`;

interface ActivityItem {
  id: string;
  type: 'stake' | 'unstake' | 'claim' | 'reward';
  address: string;
  amount: number;
  timestamp: Date;
  isNew?: boolean;
}

interface ActivityFeedProps {
  isDark?: boolean;
  maxItems?: number;
}

// Generate simulated pool activity
const generateSimulatedActivity = (): ActivityItem[] => {
  const types: ('stake' | 'unstake' | 'claim' | 'reward')[] = ['stake', 'unstake', 'claim', 'reward'];
  const activities: ActivityItem[] = [];
  const now = Date.now();

  // Generate random activities for the last hour
  for (let i = 0; i < 15; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const minutesAgo = Math.floor(Math.random() * 120); // Last 2 hours

    // Generate random address
    const addressBytes = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');

    let amount: number;
    switch (type) {
      case 'stake':
        amount = 500 + Math.random() * 10000;
        break;
      case 'unstake':
        amount = 200 + Math.random() * 5000;
        break;
      case 'claim':
        amount = 100 + Math.random() * 2000;
        break;
      case 'reward':
        amount = 50 + Math.random() * 500;
        break;
    }

    activities.push({
      id: `sim-${i}-${Date.now()}`,
      type,
      address: addressBytes,
      amount: Math.round(amount * 100) / 100,
      timestamp: new Date(now - minutesAgo * 60 * 1000),
    });
  }

  // Sort by timestamp (newest first)
  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Format time ago in French
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  return `Il y a ${diffDays}j`;
};

// Shorten address for display
const shortenAddress = (address: string): string => {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Get icon for activity type
const getIcon = (type: string): string => {
  switch (type) {
    case 'stake': return '↑';
    case 'unstake': return '↓';
    case 'claim': return '✓';
    case 'reward': return '★';
    default: return '•';
  }
};

// Get action text for activity type
const getActionText = (type: string): string => {
  switch (type) {
    case 'stake': return 'a staké';
    case 'unstake': return 'a demandé unstake';
    case 'claim': return 'a claim';
    case 'reward': return 'rewards distribués';
    default: return '';
  }
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ isDark = true, maxItems = 10 }) => {
  const { activeAccount } = useCsprClick();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load activity data
  useEffect(() => {
    const loadActivity = async () => {
      setLoading(true);

      // Try to get real data if wallet is connected
      if (activeAccount) {
        try {
          // Get transfers for the connected account
          const response = await csprCloudApi.getAccountTransfers(activeAccount.publicKey, 20);

          if (response.data && response.data.length > 0) {
            const realActivities: ActivityItem[] = response.data.map((transfer, index) => ({
              id: `real-${transfer.id}`,
              type: transfer.amount && parseFloat(transfer.amount) > 0 ? 'stake' : 'unstake',
              address: transfer.initiator_account_hash || transfer.to_account_hash || '',
              amount: motesToCSPR(transfer.amount || '0'),
              timestamp: new Date(transfer.timestamp),
            }));

            setActivities(realActivities);
            setIsLive(true);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.log('Could not fetch real activity, using simulated data');
        }
      }

      // Fall back to simulated data
      setActivities(generateSimulatedActivity());
      setIsLive(false);
      setLoading(false);
    };

    loadActivity();

    // Refresh every 30 seconds
    const interval = setInterval(loadActivity, 30000);
    return () => clearInterval(interval);
  }, [activeAccount]);

  // Add new simulated activity periodically (for demo effect)
  useEffect(() => {
    if (isLive) return; // Don't add fake data if we have real data

    const addNewActivity = () => {
      const types: ('stake' | 'unstake' | 'claim')[] = ['stake', 'unstake', 'claim'];
      const type = types[Math.floor(Math.random() * types.length)];

      const addressBytes = Array.from({ length: 32 }, () =>
        Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
      ).join('');

      let amount: number;
      switch (type) {
        case 'stake': amount = 500 + Math.random() * 5000; break;
        case 'unstake': amount = 200 + Math.random() * 3000; break;
        case 'claim': amount = 100 + Math.random() * 1500; break;
      }

      const newActivity: ActivityItem = {
        id: `new-${Date.now()}`,
        type,
        address: addressBytes,
        amount: Math.round(amount * 100) / 100,
        timestamp: new Date(),
        isNew: true,
      };

      setActivities(prev => {
        // Remove isNew from old items
        const updated = prev.map(a => ({ ...a, isNew: false }));
        // Add new item at the beginning and limit to maxItems
        return [newActivity, ...updated].slice(0, maxItems + 5);
      });
    };

    // Add new activity every 15-45 seconds (random)
    const scheduleNext = () => {
      const delay = 15000 + Math.random() * 30000;
      return setTimeout(() => {
        addNewActivity();
        scheduleNext();
      }, delay);
    };

    const timeout = scheduleNext();
    return () => clearTimeout(timeout);
  }, [isLive, maxItems]);

  const displayedActivities = useMemo(() => {
    return activities.slice(0, maxItems);
  }, [activities, maxItems]);

  return (
    <Container $isDark={isDark}>
      <Header>
        <Title $isDark={isDark}>
          <LiveDot />
          Pool Activity
        </Title>
        <LiveBadge $isLive={isLive}>
          {isLive ? 'LIVE' : 'DEMO'}
        </LiveBadge>
      </Header>

      {loading ? (
        <EmptyState $isDark={isDark}>Chargement...</EmptyState>
      ) : displayedActivities.length === 0 ? (
        <EmptyState $isDark={isDark}>
          Aucune activité récente
        </EmptyState>
      ) : (
        <FeedList>
          {displayedActivities.map((activity) => (
            <FeedItem
              key={activity.id}
              $isDark={isDark}
              $isNew={activity.isNew}
            >
              <IconWrapper $type={activity.type}>
                {getIcon(activity.type)}
              </IconWrapper>
              <FeedContent>
                <FeedText $isDark={isDark}>
                  {activity.type === 'reward' ? (
                    <>
                      <Amount $type={activity.type}>
                        +{activity.amount.toLocaleString()} CSPR
                      </Amount>
                      {' '}{getActionText(activity.type)}
                    </>
                  ) : (
                    <>
                      <Address>{shortenAddress(activity.address)}</Address>
                      {' '}{getActionText(activity.type)}{' '}
                      <Amount $type={activity.type}>
                        {activity.amount.toLocaleString()} {activity.type === 'unstake' ? 'stCSPR' : 'CSPR'}
                      </Amount>
                    </>
                  )}
                </FeedText>
                <TimeAgo $isDark={isDark}>
                  {formatTimeAgo(activity.timestamp)}
                </TimeAgo>
              </FeedContent>
            </FeedItem>
          ))}
        </FeedList>
      )}
    </Container>
  );
};

export default ActivityFeed;
