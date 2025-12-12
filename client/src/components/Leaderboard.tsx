import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const Container = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.02)'};
  border-radius: 16px;
  padding: 24px;
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h3<{ $isDark: boolean }>`
  margin: 0;
  font-size: 1.25rem;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Badge = styled.span<{ $isLive?: boolean }>`
  background: ${props => props.$isLive
    ? 'linear-gradient(135deg, #a78bfa, #8b5cf6)'
    : 'linear-gradient(135deg, #c4b5fd, #ffaa00)'};
  color: ${props => props.$isLive ? '#fff' : '#1a1a2e'};
  font-size: 0.7rem;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
`;

const RefreshButton = styled.button<{ $isDark: boolean }>`
  background: transparent;
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.2)'
    : 'rgba(0, 0, 0, 0.2)'};
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$isDark
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.05)'};
  }
`;

const Table = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TableHeader = styled.div<{ $isDark: boolean }>`
  display: grid;
  grid-template-columns: 50px 1fr 120px 100px;
  padding: 12px 16px;
  font-size: 0.8rem;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Row = styled.div<{ $isDark: boolean; $rank: number; $isCurrentUser?: boolean }>`
  display: grid;
  grid-template-columns: 50px 1fr 120px 100px;
  padding: 14px 16px;
  border-radius: 12px;
  align-items: center;
  background: ${props => {
    if (props.$isCurrentUser) return props.$isDark
      ? 'rgba(88, 86, 214, 0.2)'
      : 'rgba(88, 86, 214, 0.1)';
    if (props.$rank === 1) return props.$isDark
      ? 'rgba(255, 215, 0, 0.15)'
      : 'rgba(255, 215, 0, 0.1)';
    if (props.$rank === 2) return props.$isDark
      ? 'rgba(192, 192, 192, 0.1)'
      : 'rgba(192, 192, 192, 0.08)';
    if (props.$rank === 3) return props.$isDark
      ? 'rgba(205, 127, 50, 0.1)'
      : 'rgba(205, 127, 50, 0.08)';
    return props.$isDark
      ? 'rgba(255, 255, 255, 0.03)'
      : 'rgba(0, 0, 0, 0.02)';
  }};
  border: 1px solid ${props => props.$isCurrentUser
    ? 'rgba(88, 86, 214, 0.3)'
    : 'transparent'};
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$isDark
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.04)'};
  }
`;

const RankCell = styled.div<{ $rank: number }>`
  font-weight: 700;
  font-size: 1.1rem;
  color: ${props => {
    if (props.$rank === 1) return '#ffd700';
    if (props.$rank === 2) return '#c0c0c0';
    if (props.$rank === 3) return '#cd7f32';
    return '#888';
  }};
`;

const RankMedal = styled.span`
  font-size: 1.3rem;
`;

const AddressCell = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Avatar = styled.div<{ $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
`;

const AddressText = styled.div<{ $isDark: boolean }>`
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9rem;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
`;

const YouBadge = styled.span`
  background: linear-gradient(135deg, #5856d6, #7a78e6);
  color: white;
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
`;

const AmountCell = styled.div<{ $isDark: boolean }>`
  font-weight: 600;
  color: ${props => props.$isDark ? '#a78bfa' : '#8b5cf6'};
  text-align: right;
`;

const RewardsCell = styled.div<{ $isDark: boolean }>`
  font-size: 0.85rem;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(0, 0, 0, 0.6)'};
  text-align: right;
`;

const LoadingRow = styled.div<{ $isDark: boolean }>`
  height: 60px;
  border-radius: 12px;
  background: ${props => props.$isDark
    ? 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)'
    : 'linear-gradient(90deg, rgba(0,0,0,0.03) 25%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.03) 75%)'};
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

const Footer = styled.div<{ $isDark: boolean }>`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
`;

interface Staker {
  address: string;
  stakedAmount: number;
  rewards: number;
  rank: number;
}

interface LeaderboardProps {
  isDark: boolean;
  currentUserAddress?: string;
}

// Generate avatar color from address
const getAvatarColor = (address: string): string => {
  const colors = [
    'linear-gradient(135deg, #ff6b6b, #ee5a5a)',
    'linear-gradient(135deg, #4ecdc4, #3dbdb5)',
    'linear-gradient(135deg, #45b7d1, #3aa7c1)',
    'linear-gradient(135deg, #96c93d, #86b92d)',
    'linear-gradient(135deg, #f7dc6f, #f4d03f)',
    'linear-gradient(135deg, #bb8fce, #a569bd)',
    'linear-gradient(135deg, #5dade2, #3498db)',
    'linear-gradient(135deg, #f1948a, #e74c3c)',
  ];
  const index = address.charCodeAt(2) % colors.length;
  return colors[index];
};

// Mock data - in production, fetch from API
const MOCK_STAKERS: Staker[] = [
  { address: '01a5c7d8e9f0...3b2c', stakedAmount: 2500000, rewards: 425000, rank: 1 },
  { address: '01b8e2f4a6c1...8d4e', stakedAmount: 1850000, rewards: 314500, rank: 2 },
  { address: '01c3f9d7b2e5...1a6f', stakedAmount: 1420000, rewards: 241400, rank: 3 },
  { address: '01d6a4c8e1b3...9c2d', stakedAmount: 980000, rewards: 166600, rank: 4 },
  { address: '01e9b5d2f7a4...4e8a', stakedAmount: 750000, rewards: 127500, rank: 5 },
  { address: '01f2c8e6d4a9...7b1c', stakedAmount: 620000, rewards: 105400, rank: 6 },
  { address: '01a7d3b9e5f2...2d6e', stakedAmount: 485000, rewards: 82450, rank: 7 },
  { address: '01b4e8c2a6d1...5f9a', stakedAmount: 320000, rewards: 54400, rank: 8 },
  { address: '01c1f5d9b3e7...8a4c', stakedAmount: 215000, rewards: 36550, rank: 9 },
  { address: '01d8a2c6e4b9...1c7d', stakedAmount: 150000, rewards: 25500, rank: 10 },
];

export const Leaderboard: React.FC<LeaderboardProps> = ({ isDark, currentUserAddress }) => {
  const [stakers, setStakers] = useState<Staker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setStakers(MOCK_STAKERS);
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const formatAmount = (amount: number): string => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(2) + 'M';
    }
    if (amount >= 1000) {
      return (amount / 1000).toFixed(1) + 'K';
    }
    return amount.toLocaleString();
  };

  const getRankDisplay = (rank: number): React.ReactNode => {
    if (rank === 1) return <RankMedal>🥇</RankMedal>;
    if (rank === 2) return <RankMedal>🥈</RankMedal>;
    if (rank === 3) return <RankMedal>🥉</RankMedal>;
    return <RankCell $rank={rank}>#{rank}</RankCell>;
  };

  const totalStaked = stakers.reduce((acc, s) => acc + s.stakedAmount, 0);

  return (
    <Container $isDark={isDark}>
      <Header>
        <Title $isDark={isDark}>
          🏆 Top Stakers
          <Badge $isLive={false}>DEMO</Badge>
        </Title>
        <RefreshButton $isDark={isDark} onClick={fetchLeaderboard}>
          🔄 Refresh
        </RefreshButton>
      </Header>

      <TableHeader $isDark={isDark}>
        <div>Rank</div>
        <div>Address</div>
        <div style={{ textAlign: 'right' }}>Staked</div>
        <div style={{ textAlign: 'right' }}>Rewards</div>
      </TableHeader>

      <Table>
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <LoadingRow key={i} $isDark={isDark} />
          ))
        ) : (
          stakers.map((staker) => (
            <Row
              key={staker.address}
              $isDark={isDark}
              $rank={staker.rank}
              $isCurrentUser={staker.address === currentUserAddress}
            >
              <div>{getRankDisplay(staker.rank)}</div>
              <AddressCell $isDark={isDark}>
                <Avatar $color={getAvatarColor(staker.address)}>
                  {staker.address.charAt(2).toUpperCase()}
                </Avatar>
                <AddressText $isDark={isDark}>
                  {staker.address}
                  {staker.address === currentUserAddress && <YouBadge>YOU</YouBadge>}
                </AddressText>
              </AddressCell>
              <AmountCell $isDark={isDark}>
                {formatAmount(staker.stakedAmount)} CSPR
              </AmountCell>
              <RewardsCell $isDark={isDark}>
                +{formatAmount(staker.rewards)}
              </RewardsCell>
            </Row>
          ))
        )}
      </Table>

      <Footer $isDark={isDark}>
        <span>
          Total Staked: {formatAmount(totalStaked)} CSPR
        </span>
        <span>
          {lastUpdated && `Updated: ${lastUpdated.toLocaleTimeString()}`}
        </span>
      </Footer>
    </Container>
  );
};

export default Leaderboard;
