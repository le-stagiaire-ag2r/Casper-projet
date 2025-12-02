import React from 'react';
import styled, { keyframes } from 'styled-components';

const slideDown = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
`;

const BannerContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  animation: ${slideDown} 0.6s ease-out;
`;

const Badge = styled.span`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const DemoIcon = styled.span`
  animation: ${pulse} 2s ease-in-out infinite;
  font-size: 18px;
`;

const Message = styled.p`
  color: white;
  font-size: 14px;
  font-weight: 500;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const Highlight = styled.span`
  font-weight: 700;
  text-decoration: underline;
`;

export const DemoBanner: React.FC = () => {
  return (
    <BannerContainer>
      <DemoIcon>🎭</DemoIcon>
      <Badge>Site Vitrine</Badge>
      <Message>
        <Highlight>Démo interactive</Highlight> - Les transactions réelles seront activées prochainement
      </Message>
    </BannerContainer>
  );
};
