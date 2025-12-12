import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
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
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
`;

const TitleSection = styled.div``;

const Title = styled.h3<{ $isDark: boolean }>`
  margin: 0 0 4px 0;
  font-size: 1.25rem;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Subtitle = styled.p<{ $isDark: boolean }>`
  margin: 0;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(0, 0, 0, 0.6)'};
  font-size: 0.9rem;
`;

const StatusBadge = styled.div<{ $enabled: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${props => props.$enabled
    ? 'rgba(48, 209, 88, 0.15)'
    : 'rgba(255, 59, 48, 0.15)'};
  color: ${props => props.$enabled ? '#30d158' : '#ff3b30'};
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const StatusDot = styled.span<{ $enabled: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$enabled ? '#30d158' : '#ff3b30'};
  animation: ${props => props.$enabled ? pulse : 'none'} 2s infinite;
`;

const EnableButton = styled.button<{ $isDark: boolean }>`
  width: 100%;
  padding: 14px 20px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #5856d6, #af52de);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s;
  margin-bottom: 24px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(88, 86, 214, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const NotificationTypes = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const NotificationItem = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.03)'
    : 'rgba(0, 0, 0, 0.02)'};
  border-radius: 12px;
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.06)'};
`;

const NotificationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const NotificationIcon = styled.span`
  font-size: 1.5rem;
`;

const NotificationText = styled.div``;

const NotificationTitle = styled.div<{ $isDark: boolean }>`
  font-weight: 600;
  font-size: 0.95rem;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
`;

const NotificationDesc = styled.div<{ $isDark: boolean }>`
  font-size: 0.8rem;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  margin-top: 2px;
`;

const Toggle = styled.label<{ $isDark: boolean }>`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
  cursor: pointer;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background: linear-gradient(135deg, #5856d6, #af52de);
  }

  &:checked + span:before {
    transform: translateX(22px);
  }
`;

const ToggleSlider = styled.span<{ $isDark: boolean }>`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.2)'
    : 'rgba(0, 0, 0, 0.2)'};
  transition: 0.3s;
  border-radius: 28px;

  &:before {
    position: absolute;
    content: "";
    height: 22px;
    width: 22px;
    left: 3px;
    bottom: 3px;
    background: white;
    transition: 0.3s;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const TestButton = styled.button<{ $isDark: boolean }>`
  margin-top: 20px;
  padding: 12px 20px;
  border-radius: 10px;
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.2)'
    : 'rgba(0, 0, 0, 0.15)'};
  background: transparent;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$isDark
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.03)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const InfoBox = styled.div<{ $isDark: boolean }>`
  margin-top: 20px;
  padding: 14px 16px;
  background: ${props => props.$isDark
    ? 'rgba(88, 86, 214, 0.1)'
    : 'rgba(88, 86, 214, 0.05)'};
  border-radius: 10px;
  border: 1px solid rgba(88, 86, 214, 0.2);
  font-size: 0.85rem;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.7)'
    : 'rgba(0, 0, 0, 0.7)'};
  display: flex;
  align-items: flex-start;
  gap: 10px;
  line-height: 1.5;
`;

interface NotificationSettingsProps {
  isDark: boolean;
}

interface NotificationPrefs {
  priceAlerts: boolean;
  stakingRewards: boolean;
  transactionConfirm: boolean;
  weeklyReport: boolean;
  validatorStatus: boolean;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ isDark }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    priceAlerts: true,
    stakingRewards: true,
    transactionConfirm: true,
    weeklyReport: false,
    validatorStatus: true,
  });

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window) {
      setIsSupported(true);
      setIsEnabled(Notification.permission === 'granted');
    }

    // Load saved preferences
    const saved = localStorage.getItem('notificationPrefs');
    if (saved) {
      setPrefs(JSON.parse(saved));
    }
  }, []);

  const handleEnableNotifications = async () => {
    if (!isSupported) return;

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setIsEnabled(true);
        // Show welcome notification
        new Notification('🎉 Notifications Enabled!', {
          body: 'You will now receive updates about your staking activities.',
          icon: '/logo192.png',
        });
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  };

  const handleToggle = (key: keyof NotificationPrefs) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    localStorage.setItem('notificationPrefs', JSON.stringify(newPrefs));
  };

  const handleTestNotification = () => {
    if (!isEnabled) return;

    new Notification('🧪 Test Notification', {
      body: 'This is a test notification from StakeVue. Everything is working correctly!',
      icon: '/logo192.png',
      tag: 'test',
    });
  };

  const notificationTypes = [
    {
      key: 'priceAlerts' as const,
      icon: '💰',
      title: 'Price Alerts',
      desc: 'Get notified when CSPR reaches your target price',
    },
    {
      key: 'stakingRewards' as const,
      icon: '🎁',
      title: 'Staking Rewards',
      desc: 'Daily updates on your accumulated rewards',
    },
    {
      key: 'transactionConfirm' as const,
      icon: '✅',
      title: 'Transaction Confirmations',
      desc: 'Alerts when stake/unstake transactions complete',
    },
    {
      key: 'weeklyReport' as const,
      icon: '📊',
      title: 'Weekly Reports',
      desc: 'Summary of your weekly staking performance',
    },
    {
      key: 'validatorStatus' as const,
      icon: '🔔',
      title: 'Validator Status',
      desc: 'Alerts when validator performance changes',
    },
  ];

  if (!isSupported) {
    return (
      <Container $isDark={isDark}>
        <Header>
          <TitleSection>
            <Title $isDark={isDark}>
              🔔 Push Notifications
            </Title>
            <Subtitle $isDark={isDark}>
              Your browser doesn't support push notifications
            </Subtitle>
          </TitleSection>
        </Header>
        <InfoBox $isDark={isDark}>
          ℹ️ Push notifications require a modern browser with notification support.
          Please try using Chrome, Firefox, Edge, or Safari on macOS.
        </InfoBox>
      </Container>
    );
  }

  return (
    <Container $isDark={isDark}>
      <Header>
        <TitleSection>
          <Title $isDark={isDark}>
            🔔 Push Notifications
          </Title>
          <Subtitle $isDark={isDark}>
            Stay updated on your staking activity
          </Subtitle>
        </TitleSection>
        <StatusBadge $enabled={isEnabled}>
          <StatusDot $enabled={isEnabled} />
          {isEnabled ? 'Enabled' : 'Disabled'}
        </StatusBadge>
      </Header>

      {!isEnabled ? (
        <EnableButton $isDark={isDark} onClick={handleEnableNotifications}>
          🔔 Enable Push Notifications
        </EnableButton>
      ) : (
        <>
          <NotificationTypes>
            {notificationTypes.map(item => (
              <NotificationItem key={item.key} $isDark={isDark}>
                <NotificationInfo>
                  <NotificationIcon>{item.icon}</NotificationIcon>
                  <NotificationText>
                    <NotificationTitle $isDark={isDark}>{item.title}</NotificationTitle>
                    <NotificationDesc $isDark={isDark}>{item.desc}</NotificationDesc>
                  </NotificationText>
                </NotificationInfo>
                <Toggle $isDark={isDark}>
                  <ToggleInput
                    type="checkbox"
                    checked={prefs[item.key]}
                    onChange={() => handleToggle(item.key)}
                  />
                  <ToggleSlider $isDark={isDark} />
                </Toggle>
              </NotificationItem>
            ))}
          </NotificationTypes>

          <TestButton $isDark={isDark} onClick={handleTestNotification}>
            🧪 Send Test Notification
          </TestButton>
        </>
      )}

      <InfoBox $isDark={isDark}>
        💡 Notifications are stored locally and processed in your browser.
        No data is sent to external servers. You can revoke permission anytime in your browser settings.
      </InfoBox>
    </Container>
  );
};

export default NotificationSettings;
