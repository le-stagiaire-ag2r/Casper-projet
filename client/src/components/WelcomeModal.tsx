import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const Overlay = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: ${(props) => (props.show ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalContainer = styled.div`
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%);
  border-radius: 24px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.1);
  animation: ${slideUp} 0.5s ease-out;
  position: relative;

  @media (max-width: 768px) {
    padding: 30px 20px;
  }
`;

const IconContainer = styled.div`
  text-align: center;
  font-size: 80px;
  margin-bottom: 20px;
  animation: ${slideUp} 0.6s ease-out 0.2s both;
`;

const Title = styled.h2`
  font-size: 32px;
  font-weight: 700;
  color: white;
  text-align: center;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${slideUp} 0.6s ease-out 0.3s both;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: #ccc;
  text-align: center;
  margin-bottom: 32px;
  line-height: 1.6;
  animation: ${slideUp} 0.6s ease-out 0.4s both;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const FeaturesList = styled.div`
  margin-bottom: 32px;
  animation: ${slideUp} 0.6s ease-out 0.5s both;
`;

const Feature = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateX(4px);
  }
`;

const FeatureIcon = styled.span`
  font-size: 24px;
  flex-shrink: 0;
`;

const FeatureText = styled.div`
  flex: 1;
`;

const FeatureTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
`;

const FeatureDescription = styled.div`
  font-size: 14px;
  color: #999;
`;

const Button = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: ${slideUp} 0.6s ease-out 0.6s both;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ComingSoonBadge = styled.div`
  display: inline-block;
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  border: 1px solid rgba(255, 215, 0, 0.3);
  margin-left: 8px;
`;

export const WelcomeModal: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has seen the modal before
    const hasSeenModal = localStorage.getItem('stakevue_welcome_seen');
    if (!hasSeenModal) {
      // Show modal after a short delay
      setTimeout(() => {
        setShow(true);
      }, 500);
    }
  }, []);

  const handleClose = () => {
    setShow(false);
    localStorage.setItem('stakevue_welcome_seen', 'true');
  };

  return (
    <Overlay show={show} onClick={handleClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <IconContainer>💎</IconContainer>
        <Title>Bienvenue sur StakeVue</Title>
        <Subtitle>
          Plateforme de liquid staking nouvelle génération sur Casper Network
        </Subtitle>

        <FeaturesList>
          <Feature>
            <FeatureIcon>🎭</FeatureIcon>
            <FeatureText>
              <FeatureTitle>
                Site Vitrine Interactif
                <ComingSoonBadge>Démo</ComingSoonBadge>
              </FeatureTitle>
              <FeatureDescription>
                Découvrez l'interface et les fonctionnalités en mode démo avec des données simulées
              </FeatureDescription>
            </FeatureText>
          </Feature>

          <Feature>
            <FeatureIcon>🚀</FeatureIcon>
            <FeatureText>
              <FeatureTitle>Transactions Réelles Bientôt Disponibles</FeatureTitle>
              <FeatureDescription>
                Le contrat V5.0 est déployé sur Casper Testnet - l'intégration complète arrive prochainement
              </FeatureDescription>
            </FeatureText>
          </Feature>

          <Feature>
            <FeatureIcon>🛡️</FeatureIcon>
            <FeatureText>
              <FeatureTitle>Smart Contract Audité</FeatureTitle>
              <FeatureDescription>
                Grade A+ par CasperSecure - 10 vulnérabilités critiques corrigées
              </FeatureDescription>
            </FeatureText>
          </Feature>

          <Feature>
            <FeatureIcon>💰</FeatureIcon>
            <FeatureText>
              <FeatureTitle>10% APY + Liquidité</FeatureTitle>
              <FeatureDescription>
                Stakez vos CSPR, recevez des stCSPR liquides et maintenez votre liberté financière
              </FeatureDescription>
            </FeatureText>
          </Feature>
        </FeaturesList>

        <Button onClick={handleClose}>Découvrir l'interface 🎨</Button>
      </ModalContainer>
    </Overlay>
  );
};
