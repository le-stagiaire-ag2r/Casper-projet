import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

const shine = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(2deg); }
`;

const Container = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, rgba(175, 82, 222, 0.15), rgba(88, 86, 214, 0.1))'
    : 'linear-gradient(135deg, rgba(175, 82, 222, 0.08), rgba(88, 86, 214, 0.05))'};
  border-radius: 20px;
  padding: 28px;
  border: 1px solid ${props => props.$isDark
    ? 'rgba(175, 82, 222, 0.3)'
    : 'rgba(175, 82, 222, 0.2)'};
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const Title = styled.h3<{ $isDark: boolean }>`
  margin: 0 0 8px 0;
  font-size: 1.4rem;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const Subtitle = styled.p<{ $isDark: boolean }>`
  margin: 0;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(0, 0, 0, 0.6)'};
  font-size: 0.9rem;
`;

const BadgeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const BadgeCard = styled.div<{ $isDark: boolean; $unlocked: boolean; $rarity: string }>`
  position: relative;
  background: ${props => props.$unlocked
    ? props.$isDark
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(255, 255, 255, 0.9)'
    : props.$isDark
      ? 'rgba(255, 255, 255, 0.03)'
      : 'rgba(0, 0, 0, 0.03)'};
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  border: 2px solid ${props => {
    if (!props.$unlocked) return props.$isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    switch (props.$rarity) {
      case 'legendary': return '#ffcc00';
      case 'epic': return '#af52de';
      case 'rare': return '#5856d6';
      default: return '#30d158';
    }
  }};
  opacity: ${props => props.$unlocked ? 1 : 0.5};
  filter: ${props => props.$unlocked ? 'none' : 'grayscale(80%)'};
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: ${props => props.$unlocked ? 'translateY(-4px)' : 'none'};
    box-shadow: ${props => props.$unlocked ? '0 8px 25px rgba(0, 0, 0, 0.15)' : 'none'};
  }
`;

const BadgeIconWrapper = styled.div<{ $unlocked: boolean; $rarity: string }>`
  width: 80px;
  height: 80px;
  margin: 0 auto 12px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  background: ${props => {
    if (!props.$unlocked) return 'rgba(128, 128, 128, 0.2)';
    switch (props.$rarity) {
      case 'legendary': return 'linear-gradient(135deg, #ffcc00, #ff9500)';
      case 'epic': return 'linear-gradient(135deg, #af52de, #5856d6)';
      case 'rare': return 'linear-gradient(135deg, #5856d6, #007aff)';
      default: return 'linear-gradient(135deg, #30d158, #34c759)';
    }
  }};
  animation: ${props => props.$unlocked ? float : 'none'} 3s ease-in-out infinite;
  box-shadow: ${props => props.$unlocked
    ? '0 4px 15px rgba(0, 0, 0, 0.2)'
    : 'none'};
`;

const BadgeName = styled.div<{ $isDark: boolean }>`
  font-weight: 600;
  font-size: 0.95rem;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  margin-bottom: 4px;
`;

const BadgeDesc = styled.div<{ $isDark: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  margin-bottom: 8px;
`;

const RarityBadge = styled.span<{ $rarity: string }>`
  display: inline-block;
  font-size: 0.65rem;
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch (props.$rarity) {
      case 'legendary': return 'linear-gradient(90deg, #ffcc00, #ff9500, #ffcc00)';
      case 'epic': return 'linear-gradient(90deg, #af52de, #5856d6, #af52de)';
      case 'rare': return 'linear-gradient(90deg, #5856d6, #007aff, #5856d6)';
      default: return '#30d158';
    }
  }};
  background-size: 200% auto;
  color: ${props => props.$rarity === 'legendary' ? '#1a1a2e' : '#fff'};
  animation: ${props => props.$rarity === 'legendary' || props.$rarity === 'epic'
    ? shine
    : 'none'} 3s linear infinite;
`;

const LockedOverlay = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 1.2rem;
`;

const ProgressSection = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.03)'};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
`;

const ProgressTitle = styled.div<{ $isDark: boolean }>`
  font-weight: 600;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ProgressBar = styled.div<{ $isDark: boolean }>`
  height: 8px;
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${props => props.$percent}%;
  background: linear-gradient(90deg, #5856d6, #af52de);
  border-radius: 4px;
  transition: width 0.5s ease;
`;

const ProgressText = styled.div<{ $isDark: boolean }>`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(0, 0, 0, 0.6)'};
`;

const ClaimButton = styled.button<{ $isDark: boolean }>`
  width: 100%;
  padding: 14px 20px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #af52de, #5856d6);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(175, 82, 222, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const Modal = styled.div<{ $isDark: boolean; $isOpen: boolean }>`
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div<{ $isDark: boolean; $rarity: string }>`
  background: ${props => props.$isDark ? '#1a1a2e' : '#fff'};
  border-radius: 24px;
  padding: 32px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  border: 2px solid ${props => {
    switch (props.$rarity) {
      case 'legendary': return '#ffcc00';
      case 'epic': return '#af52de';
      case 'rare': return '#5856d6';
      default: return '#30d158';
    }
  }};
`;

const ModalBadge = styled.div<{ $rarity: string }>`
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  background: ${props => {
    switch (props.$rarity) {
      case 'legendary': return 'linear-gradient(135deg, #ffcc00, #ff9500)';
      case 'epic': return 'linear-gradient(135deg, #af52de, #5856d6)';
      case 'rare': return 'linear-gradient(135deg, #5856d6, #007aff)';
      default: return 'linear-gradient(135deg, #30d158, #34c759)';
    }
  }};
  animation: ${float} 3s ease-in-out infinite;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
`;

const ModalTitle = styled.h3<{ $isDark: boolean }>`
  margin: 0 0 8px;
  font-size: 1.5rem;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
`;

const ModalDesc = styled.p<{ $isDark: boolean }>`
  margin: 0 0 20px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.7)'
    : 'rgba(0, 0, 0, 0.7)'};
  line-height: 1.5;
`;

const CloseButton = styled.button<{ $isDark: boolean }>`
  padding: 12px 32px;
  border-radius: 10px;
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.2)'
    : 'rgba(0, 0, 0, 0.15)'};
  background: transparent;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$isDark
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.03)'};
  }
`;

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  requirement: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
}

interface NFTBadgesProps {
  isDark: boolean;
}

export const NFTBadges: React.FC<NFTBadgesProps> = ({ isDark }) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const badges: Badge[] = [
    {
      id: '1',
      name: 'Early Adopter',
      icon: '',
      description: 'One of the first 1000 users to stake on StakeVue',
      requirement: 'Be among first 1000 stakers',
      rarity: 'legendary',
      unlocked: true,
    },
    {
      id: '2',
      name: 'Whale',
      icon: '🐋',
      description: 'Staked over 100,000 CSPR',
      requirement: 'Stake 100,000+ CSPR',
      rarity: 'epic',
      unlocked: false,
    },
    {
      id: '3',
      name: 'Diamond Hands',
      icon: '',
      description: 'Held stake for over 6 months',
      requirement: 'Stake for 6+ months',
      rarity: 'epic',
      unlocked: true,
    },
    {
      id: '4',
      name: 'Consistent Staker',
      icon: '',
      description: 'Staked for 30 consecutive days',
      requirement: '30 days continuous staking',
      rarity: 'rare',
      unlocked: true,
    },
    {
      id: '5',
      name: 'Validator Friend',
      icon: '🤝',
      description: 'Delegated to 5 different validators',
      requirement: 'Use 5+ validators',
      rarity: 'rare',
      unlocked: false,
    },
    {
      id: '6',
      name: 'Reward Hunter',
      icon: '',
      description: 'Earned over 1,000 CSPR in rewards',
      requirement: 'Earn 1,000+ CSPR rewards',
      rarity: 'common',
      unlocked: true,
    },
    {
      id: '7',
      name: 'First Stake',
      icon: '',
      description: 'Completed your first stake transaction',
      requirement: 'Make first stake',
      rarity: 'common',
      unlocked: true,
    },
    {
      id: '8',
      name: 'OG Staker',
      icon: '👑',
      description: 'Staked during the beta launch period',
      requirement: 'Stake during beta',
      rarity: 'legendary',
      unlocked: false,
    },
  ];

  const unlockedCount = badges.filter(b => b.unlocked).length;
  const progress = (unlockedCount / badges.length) * 100;

  const handleBadgeClick = (badge: Badge) => {
    if (badge.unlocked) {
      setSelectedBadge(badge);
    }
  };

  return (
    <Container $isDark={isDark}>
      <Header>
        <Title $isDark={isDark}>
           Achievement Badges
        </Title>
        <Subtitle $isDark={isDark}>
          Collect exclusive NFT badges for your staking achievements
        </Subtitle>
      </Header>

      <ProgressSection $isDark={isDark}>
        <ProgressTitle $isDark={isDark}>
           Collection Progress
        </ProgressTitle>
        <ProgressBar $isDark={isDark}>
          <ProgressFill $percent={progress} />
        </ProgressBar>
        <ProgressText $isDark={isDark}>
          <span>{unlockedCount} / {badges.length} badges unlocked</span>
          <span>{progress.toFixed(0)}%</span>
        </ProgressText>
      </ProgressSection>

      <BadgeGrid>
        {badges.map(badge => (
          <BadgeCard
            key={badge.id}
            $isDark={isDark}
            $unlocked={badge.unlocked}
            $rarity={badge.rarity}
            onClick={() => handleBadgeClick(badge)}
          >
            {!badge.unlocked && <LockedOverlay></LockedOverlay>}
            <BadgeIconWrapper $unlocked={badge.unlocked} $rarity={badge.rarity}>
              {badge.icon}
            </BadgeIconWrapper>
            <BadgeName $isDark={isDark}>{badge.name}</BadgeName>
            <BadgeDesc $isDark={isDark}>
              {badge.unlocked ? badge.description : badge.requirement}
            </BadgeDesc>
            <RarityBadge $rarity={badge.rarity}>{badge.rarity}</RarityBadge>
          </BadgeCard>
        ))}
      </BadgeGrid>

      <ClaimButton $isDark={isDark} disabled={unlockedCount === 0}>
         Claim Badges as NFTs (Coming Soon)
      </ClaimButton>

      <Modal $isDark={isDark} $isOpen={selectedBadge !== null} onClick={() => setSelectedBadge(null)}>
        {selectedBadge && (
          <ModalContent
            $isDark={isDark}
            $rarity={selectedBadge.rarity}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalBadge $rarity={selectedBadge.rarity}>
              {selectedBadge.icon}
            </ModalBadge>
            <RarityBadge $rarity={selectedBadge.rarity}>{selectedBadge.rarity}</RarityBadge>
            <ModalTitle $isDark={isDark}>{selectedBadge.name}</ModalTitle>
            <ModalDesc $isDark={isDark}>{selectedBadge.description}</ModalDesc>
            <CloseButton $isDark={isDark} onClick={() => setSelectedBadge(null)}>
              Close
            </CloseButton>
          </ModalContent>
        )}
      </Modal>
    </Container>
  );
};

export default NFTBadges;
