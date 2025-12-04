import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useCsprPrice } from '../hooks/useBalance';
import { playSuccessSound } from '../utils/notificationSound';

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

const Container = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.03)'
    : 'rgba(255, 255, 255, 0.8)'};
  border-radius: 20px;
  padding: 24px;
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.08)'};
  backdrop-filter: blur(20px);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h3<{ $isDark: boolean }>`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
`;

const CurrentPrice = styled.div<{ $isDark: boolean }>`
  font-size: 14px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(0, 0, 0, 0.6)'};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PriceValue = styled.span`
  font-weight: 700;
  color: #5856d6;
`;

const LiveDot = styled.span`
  width: 6px;
  height: 6px;
  background: #30d158;
  border-radius: 50%;
  animation: ${pulse} 1.5s infinite;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 500px) {
    flex-direction: column;
  }
`;

const InputWrapper = styled.div`
  flex: 1;
`;

const Label = styled.label<{ $isDark: boolean }>`
  display: block;
  font-size: 12px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input<{ $isDark: boolean }>`
  width: 100%;
  padding: 12px 16px;
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.03)'};
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 12px;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  font-size: 16px;
  font-weight: 600;
  box-sizing: border-box;

  &::placeholder {
    color: ${props => props.$isDark
      ? 'rgba(255, 255, 255, 0.3)'
      : 'rgba(0, 0, 0, 0.3)'};
  }

  &:focus {
    outline: none;
    border-color: #5856d6;
  }
`;

const Select = styled.select<{ $isDark: boolean }>`
  width: 100%;
  padding: 12px 16px;
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.03)'};
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 12px;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #5856d6;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  background: ${props => props.$variant === 'secondary'
    ? 'transparent'
    : 'linear-gradient(135deg, #ff2d55 0%, #5856d6 100%)'};
  border: ${props => props.$variant === 'secondary'
    ? '1px solid rgba(255, 45, 85, 0.3)'
    : 'none'};
  border-radius: 12px;
  color: ${props => props.$variant === 'secondary' ? '#ff2d55' : '#fff'};
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 45, 85, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const AlertsList = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const AlertItem = styled.div<{ $isDark: boolean; $triggered?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: ${props => props.$triggered
    ? 'rgba(48, 209, 88, 0.1)'
    : props.$isDark
      ? 'rgba(255, 255, 255, 0.03)'
      : 'rgba(0, 0, 0, 0.02)'};
  border: 1px solid ${props => props.$triggered
    ? 'rgba(48, 209, 88, 0.3)'
    : props.$isDark
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.05)'};
  border-radius: 12px;
`;

const AlertInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AlertIcon = styled.span<{ $type: 'above' | 'below' }>`
  font-size: 20px;
`;

const AlertDetails = styled.div``;

const AlertPrice = styled.div<{ $isDark: boolean }>`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
`;

const AlertType = styled.div<{ $isDark: boolean }>`
  font-size: 12px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
`;

const DeleteButton = styled.button<{ $isDark: boolean }>`
  padding: 8px;
  background: transparent;
  border: none;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.4)'
    : 'rgba(0, 0, 0, 0.4)'};
  cursor: pointer;
  font-size: 16px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 69, 58, 0.1);
    color: #ff453a;
  }
`;

const EmptyState = styled.div<{ $isDark: boolean }>`
  text-align: center;
  padding: 24px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.4)'
    : 'rgba(0, 0, 0, 0.4)'};
  font-size: 14px;
`;

const TriggeredBadge = styled.span`
  background: rgba(48, 209, 88, 0.2);
  color: #30d158;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  text-transform: uppercase;
`;

interface PriceAlert {
  id: string;
  targetPrice: number;
  type: 'above' | 'below';
  triggered: boolean;
  createdAt: string;
}

interface PriceAlertProps {
  isDark: boolean;
}

const ALERTS_STORAGE_KEY = 'stakevue_price_alerts';

export const PriceAlertComponent: React.FC<PriceAlertProps> = ({ isDark }) => {
  const { usdPrice } = useCsprPrice();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [targetPrice, setTargetPrice] = useState('');
  const [alertType, setAlertType] = useState<'above' | 'below'>('above');

  // Load alerts from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ALERTS_STORAGE_KEY);
      if (stored) {
        setAlerts(JSON.parse(stored));
      }
    } catch {
      // Ignore errors
    }
  }, []);

  // Save alerts to localStorage
  const saveAlerts = useCallback((newAlerts: PriceAlert[]) => {
    setAlerts(newAlerts);
    try {
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(newAlerts));
    } catch {
      // Ignore errors
    }
  }, []);

  // Check alerts against current price
  useEffect(() => {
    if (usdPrice <= 0) return;

    const updatedAlerts = alerts.map(alert => {
      if (alert.triggered) return alert;

      const shouldTrigger = alert.type === 'above'
        ? usdPrice >= alert.targetPrice
        : usdPrice <= alert.targetPrice;

      if (shouldTrigger) {
        // Play sound and show browser notification
        playSuccessSound();

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('StakeVue Price Alert', {
            body: `CSPR ${alert.type === 'above' ? 'reached' : 'dropped to'} $${alert.targetPrice.toFixed(4)}!`,
            icon: '/favicon.ico'
          });
        }

        return { ...alert, triggered: true };
      }

      return alert;
    });

    // Only update if something changed
    if (JSON.stringify(updatedAlerts) !== JSON.stringify(alerts)) {
      saveAlerts(updatedAlerts);
    }
  }, [usdPrice, alerts, saveAlerts]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) return;

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      targetPrice: price,
      type: alertType,
      triggered: false,
      createdAt: new Date().toISOString()
    };

    saveAlerts([...alerts, newAlert]);
    setTargetPrice('');
  };

  const handleDelete = (id: string) => {
    saveAlerts(alerts.filter(a => a.id !== id));
  };

  const activeAlerts = alerts.filter(a => !a.triggered);
  const triggeredAlerts = alerts.filter(a => a.triggered);

  return (
    <Container $isDark={isDark}>
      <Header>
        <Title $isDark={isDark}>
          <span>🔔</span> Price Alerts
        </Title>
        <CurrentPrice $isDark={isDark}>
          <LiveDot />
          Current: <PriceValue>${usdPrice.toFixed(4)}</PriceValue>
        </CurrentPrice>
      </Header>

      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <InputWrapper>
            <Label $isDark={isDark}>Target Price (USD)</Label>
            <Input
              $isDark={isDark}
              type="number"
              step="0.0001"
              min="0"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="0.0100"
            />
          </InputWrapper>
          <InputWrapper>
            <Label $isDark={isDark}>Alert When</Label>
            <Select
              $isDark={isDark}
              value={alertType}
              onChange={(e) => setAlertType(e.target.value as 'above' | 'below')}
            >
              <option value="above">Price goes above ↑</option>
              <option value="below">Price goes below ↓</option>
            </Select>
          </InputWrapper>
        </InputGroup>
        <Button type="submit" disabled={!targetPrice || parseFloat(targetPrice) <= 0}>
          + Create Alert
        </Button>
      </Form>

      <AlertsList>
        {activeAlerts.length === 0 && triggeredAlerts.length === 0 && (
          <EmptyState $isDark={isDark}>
            No alerts yet. Create one to get notified when CSPR reaches your target price!
          </EmptyState>
        )}

        {activeAlerts.map(alert => (
          <AlertItem key={alert.id} $isDark={isDark}>
            <AlertInfo>
              <AlertIcon $type={alert.type}>
                {alert.type === 'above' ? '📈' : '📉'}
              </AlertIcon>
              <AlertDetails>
                <AlertPrice $isDark={isDark}>${alert.targetPrice.toFixed(4)}</AlertPrice>
                <AlertType $isDark={isDark}>
                  Alert when price goes {alert.type}
                </AlertType>
              </AlertDetails>
            </AlertInfo>
            <DeleteButton $isDark={isDark} onClick={() => handleDelete(alert.id)}>
              ✕
            </DeleteButton>
          </AlertItem>
        ))}

        {triggeredAlerts.map(alert => (
          <AlertItem key={alert.id} $isDark={isDark} $triggered>
            <AlertInfo>
              <AlertIcon $type={alert.type}>✅</AlertIcon>
              <AlertDetails>
                <AlertPrice $isDark={isDark}>
                  ${alert.targetPrice.toFixed(4)}
                  <TriggeredBadge style={{ marginLeft: '8px' }}>Triggered</TriggeredBadge>
                </AlertPrice>
                <AlertType $isDark={isDark}>
                  Price went {alert.type} target
                </AlertType>
              </AlertDetails>
            </AlertInfo>
            <DeleteButton $isDark={isDark} onClick={() => handleDelete(alert.id)}>
              ✕
            </DeleteButton>
          </AlertItem>
        ))}
      </AlertsList>
    </Container>
  );
};

export default PriceAlertComponent;
