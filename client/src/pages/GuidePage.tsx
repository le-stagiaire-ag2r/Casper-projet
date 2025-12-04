import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Title = styled.h1<{ $isDark: boolean }>`
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
`;

const Subtitle = styled.p<{ $isDark: boolean }>`
  font-size: 18px;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'};
  margin-bottom: 48px;
`;

const Section = styled.section`
  margin-bottom: 64px;
`;

const SectionTitle = styled.h2<{ $isDark: boolean }>`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SectionIcon = styled.span`
  font-size: 28px;
`;

// What is Liquid Staking
const ExplanationCard = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.02)'};
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.08)'};
  border-radius: 16px;
  padding: 32px;
`;

const Paragraph = styled.p<{ $isDark: boolean }>`
  font-size: 16px;
  line-height: 1.8;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'};
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Highlight = styled.span`
  color: #5856d6;
  font-weight: 600;
`;

// Comparison Table
const ComparisonTable = styled.div<{ $isDark: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 24px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ComparisonCard = styled.div<{ $isDark: boolean; $type: 'bad' | 'good' }>`
  background: ${props => props.$type === 'bad'
    ? (props.$isDark ? 'rgba(255, 59, 48, 0.1)' : 'rgba(255, 59, 48, 0.05)')
    : (props.$isDark ? 'rgba(52, 199, 89, 0.1)' : 'rgba(52, 199, 89, 0.05)')};
  border: 1px solid ${props => props.$type === 'bad'
    ? 'rgba(255, 59, 48, 0.3)'
    : 'rgba(52, 199, 89, 0.3)'};
  border-radius: 12px;
  padding: 24px;
`;

const ComparisonTitle = styled.h4<{ $isDark: boolean }>`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
`;

const ComparisonList = styled.ul<{ $isDark: boolean }>`
  list-style: none;
  padding: 0;
`;

const ComparisonItem = styled.li<{ $isDark: boolean }>`
  font-size: 14px;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'};
  padding: 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Personas
const PersonaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
`;

const PersonaCard = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.02)'};
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.08)'};
  border-radius: 16px;
  padding: 24px;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

const PersonaHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const PersonaAvatar = styled.div`
  font-size: 48px;
`;

const PersonaInfo = styled.div``;

const PersonaName = styled.h4<{ $isDark: boolean }>`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
`;

const PersonaRole = styled.span<{ $isDark: boolean }>`
  font-size: 13px;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'};
`;

const PersonaQuote = styled.p<{ $isDark: boolean }>`
  font-size: 14px;
  font-style: italic;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'};
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 3px solid #5856d6;
`;

const PersonaAction = styled.div<{ $isDark: boolean }>`
  font-size: 13px;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'};
  background: ${props => props.$isDark
    ? 'rgba(88, 86, 214, 0.2)'
    : 'rgba(88, 86, 214, 0.1)'};
  padding: 12px;
  border-radius: 8px;
`;

// FAQ
const FAQList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FAQItem = styled.div<{ $isDark: boolean; $isOpen: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.02)'};
  border: 1px solid ${props => props.$isOpen
    ? '#5856d6'
    : (props.$isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)')};
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s;
`;

const FAQQuestion = styled.button<{ $isDark: boolean }>`
  width: 100%;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};

  &:hover {
    background: ${props => props.$isDark
      ? 'rgba(255, 255, 255, 0.03)'
      : 'rgba(0, 0, 0, 0.02)'};
  }
`;

const FAQIcon = styled.span<{ $isOpen: boolean }>`
  font-size: 20px;
  transition: transform 0.2s;
  transform: rotate(${props => props.$isOpen ? '180deg' : '0deg'});
`;

const FAQAnswer = styled.div<{ $isDark: boolean; $isOpen: boolean }>`
  padding: ${props => props.$isOpen ? '0 24px 20px' : '0 24px'};
  max-height: ${props => props.$isOpen ? '500px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
  font-size: 15px;
  line-height: 1.7;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'};
`;

// Tutorial Steps
const TutorialSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const TutorialStep = styled.div<{ $isDark: boolean }>`
  display: flex;
  gap: 20px;
  padding: 24px;
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.03)'
    : 'rgba(0, 0, 0, 0.02)'};
  border-radius: 12px;
`;

const StepNumber = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ff2d55, #5856d6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
`;

const StepContent = styled.div``;

const StepTitle = styled.h4<{ $isDark: boolean }>`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
`;

const StepDescription = styled.p<{ $isDark: boolean }>`
  font-size: 14px;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'};
  line-height: 1.6;
`;

interface GuidePageProps {
  isDark: boolean;
}

export const GuidePage: React.FC<GuidePageProps> = ({ isDark }) => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const faqs = [
    {
      question: "Qu'est-ce que le liquid staking ?",
      answer: "Le liquid staking permet de staker vos tokens tout en conservant leur liquidité. Vous recevez un token représentatif (stCSPR) que vous pouvez utiliser, échanger ou transférer, pendant que vos CSPR originaux génèrent des récompenses."
    },
    {
      question: "Est-ce que mes CSPR sont en sécurité ?",
      answer: "Le contrat StakeVue a été audité par CasperSecure avec une note A+. Toutes les opérations arithmétiques sont sécurisées pour éviter les attaques par overflow/underflow. Le code est open source et vérifiable."
    },
    {
      question: "Combien puis-je gagner avec StakeVue ?",
      answer: "Le taux actuel est de 10% APY (Annual Percentage Yield). Par exemple, si vous stakez 1000 CSPR, vous gagnez environ 100 CSPR par an en récompenses."
    },
    {
      question: "Puis-je unstaker à tout moment ?",
      answer: "Oui ! Vous pouvez unstaker vos CSPR à tout moment en brûlant vos tokens stCSPR. Il n'y a pas de période de blocage obligatoire."
    },
    {
      question: "Quelle est la différence avec le staking classique ?",
      answer: "Avec le staking classique, vos tokens sont bloqués et inutilisables pendant la durée du staking. Avec le liquid staking, vous recevez des stCSPR que vous pouvez utiliser librement tout en continuant à gagner des récompenses."
    }
  ];

  return (
    <Container>
      <Title $isDark={isDark}>📖 Guide StakeVue</Title>
      <Subtitle $isDark={isDark}>
        Tout ce que vous devez savoir sur le liquid staking
      </Subtitle>

      <Section>
        <SectionTitle $isDark={isDark}>
          <SectionIcon>💡</SectionIcon>
          Qu'est-ce que le Liquid Staking ?
        </SectionTitle>
        <ExplanationCard $isDark={isDark}>
          <Paragraph $isDark={isDark}>
            Le <Highlight>liquid staking</Highlight> est une innovation DeFi qui résout
            le plus gros problème du staking traditionnel : <Highlight>la perte de liquidité</Highlight>.
          </Paragraph>
          <Paragraph $isDark={isDark}>
            Normalement, quand vous stakez vos tokens, ils sont bloqués. Vous ne pouvez
            pas les utiliser, les vendre, ou les transférer. Avec le liquid staking,
            vous recevez un <Highlight>token représentatif</Highlight> (stCSPR) que vous
            pouvez utiliser librement, pendant que vos CSPR génèrent des récompenses.
          </Paragraph>

          <ComparisonTable $isDark={isDark}>
            <ComparisonCard $isDark={isDark} $type="bad">
              <ComparisonTitle $isDark={isDark}>❌ Staking Classique</ComparisonTitle>
              <ComparisonList $isDark={isDark}>
                <ComparisonItem $isDark={isDark}>🔒 Tokens bloqués</ComparisonItem>
                <ComparisonItem $isDark={isDark}>⏳ Période d'unbonding longue</ComparisonItem>
                <ComparisonItem $isDark={isDark}>🚫 Impossible de transférer</ComparisonItem>
                <ComparisonItem $isDark={isDark}>📉 Opportunités manquées</ComparisonItem>
              </ComparisonList>
            </ComparisonCard>

            <ComparisonCard $isDark={isDark} $type="good">
              <ComparisonTitle $isDark={isDark}>✅ Liquid Staking (StakeVue)</ComparisonTitle>
              <ComparisonList $isDark={isDark}>
                <ComparisonItem $isDark={isDark}>🔓 Tokens liquides (stCSPR)</ComparisonItem>
                <ComparisonItem $isDark={isDark}>⚡ Unstake quand vous voulez</ComparisonItem>
                <ComparisonItem $isDark={isDark}>🔄 Transférable et tradeable</ComparisonItem>
                <ComparisonItem $isDark={isDark}>📈 Utilisable en DeFi</ComparisonItem>
              </ComparisonList>
            </ComparisonCard>
          </ComparisonTable>
        </ExplanationCard>
      </Section>

      <Section>
        <SectionTitle $isDark={isDark}>
          <SectionIcon>👥</SectionIcon>
          Qui utilise StakeVue ?
        </SectionTitle>
        <PersonaGrid>
          <PersonaCard $isDark={isDark}>
            <PersonaHeader>
              <PersonaAvatar>👨‍💼</PersonaAvatar>
              <PersonaInfo>
                <PersonaName $isDark={isDark}>Thomas</PersonaName>
                <PersonaRole $isDark={isDark}>Investisseur long-terme</PersonaRole>
              </PersonaInfo>
            </PersonaHeader>
            <PersonaQuote $isDark={isDark}>
              "Je veux gagner des récompenses sur mes CSPR sans perdre la possibilité
              de réagir aux opportunités du marché."
            </PersonaQuote>
            <PersonaAction $isDark={isDark}>
              ✅ Thomas stake 5000 CSPR, reçoit 5000 stCSPR, et gagne 500 CSPR/an
              tout en gardant la possibilité de vendre si nécessaire.
            </PersonaAction>
          </PersonaCard>

          <PersonaCard $isDark={isDark}>
            <PersonaHeader>
              <PersonaAvatar>👩‍🎓</PersonaAvatar>
              <PersonaInfo>
                <PersonaName $isDark={isDark}>Marie</PersonaName>
                <PersonaRole $isDark={isDark}>Nouvelle en crypto</PersonaRole>
              </PersonaInfo>
            </PersonaHeader>
            <PersonaQuote $isDark={isDark}>
              "Je veux un revenu passif simple, sans devoir gérer des validateurs
              ou comprendre des concepts techniques compliqués."
            </PersonaQuote>
            <PersonaAction $isDark={isDark}>
              ✅ Marie connecte son wallet, stake 100 CSPR en 2 clics, et commence
              à gagner des récompenses automatiquement.
            </PersonaAction>
          </PersonaCard>

          <PersonaCard $isDark={isDark}>
            <PersonaHeader>
              <PersonaAvatar>👨‍💻</PersonaAvatar>
              <PersonaInfo>
                <PersonaName $isDark={isDark}>Alex</PersonaName>
                <PersonaRole $isDark={isDark}>Trader DeFi</PersonaRole>
              </PersonaInfo>
            </PersonaHeader>
            <PersonaQuote $isDark={isDark}>
              "Je veux utiliser mes stCSPR comme collatéral dans d'autres protocoles
              pour maximiser mes rendements."
            </PersonaQuote>
            <PersonaAction $isDark={isDark}>
              ✅ Alex stake ses CSPR, utilise ses stCSPR dans d'autres protocoles DeFi,
              et cumule les rendements.
            </PersonaAction>
          </PersonaCard>
        </PersonaGrid>
      </Section>

      <Section>
        <SectionTitle $isDark={isDark}>
          <SectionIcon>📝</SectionIcon>
          Tutoriel pas-à-pas
        </SectionTitle>
        <TutorialSteps>
          <TutorialStep $isDark={isDark}>
            <StepNumber>1</StepNumber>
            <StepContent>
              <StepTitle $isDark={isDark}>Installez un wallet Casper</StepTitle>
              <StepDescription $isDark={isDark}>
                Téléchargez Casper Wallet depuis le Chrome Web Store ou utilisez
                un Ledger. Créez un compte et sauvegardez votre phrase de récupération
                dans un endroit sûr.
              </StepDescription>
            </StepContent>
          </TutorialStep>

          <TutorialStep $isDark={isDark}>
            <StepNumber>2</StepNumber>
            <StepContent>
              <StepTitle $isDark={isDark}>Obtenez des CSPR</StepTitle>
              <StepDescription $isDark={isDark}>
                Achetez des CSPR sur un exchange (Binance, Coinbase, etc.) et
                transférez-les vers votre wallet Casper. Pour le testnet, utilisez
                le faucet gratuit.
              </StepDescription>
            </StepContent>
          </TutorialStep>

          <TutorialStep $isDark={isDark}>
            <StepNumber>3</StepNumber>
            <StepContent>
              <StepTitle $isDark={isDark}>Connectez-vous à StakeVue</StepTitle>
              <StepDescription $isDark={isDark}>
                Cliquez sur le bouton "Connect" en haut de la page. Sélectionnez
                votre wallet dans la liste et approuvez la connexion.
              </StepDescription>
            </StepContent>
          </TutorialStep>

          <TutorialStep $isDark={isDark}>
            <StepNumber>4</StepNumber>
            <StepContent>
              <StepTitle $isDark={isDark}>Stakez vos CSPR</StepTitle>
              <StepDescription $isDark={isDark}>
                Entrez le montant de CSPR que vous souhaitez staker et cliquez
                sur "Stake". Signez la transaction dans votre wallet. Vous recevrez
                instantanément vos tokens stCSPR.
              </StepDescription>
            </StepContent>
          </TutorialStep>

          <TutorialStep $isDark={isDark}>
            <StepNumber>5</StepNumber>
            <StepContent>
              <StepTitle $isDark={isDark}>Profitez !</StepTitle>
              <StepDescription $isDark={isDark}>
                C'est tout ! Vos CSPR génèrent maintenant des récompenses (10% APY).
                Vous pouvez utiliser, transférer ou trader vos stCSPR librement.
                Pour récupérer vos CSPR, utilisez la fonction Unstake.
              </StepDescription>
            </StepContent>
          </TutorialStep>
        </TutorialSteps>
      </Section>

      <Section>
        <SectionTitle $isDark={isDark}>
          <SectionIcon>❓</SectionIcon>
          Questions fréquentes
        </SectionTitle>
        <FAQList>
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              $isDark={isDark}
              $isOpen={openFAQ === index}
            >
              <FAQQuestion
                $isDark={isDark}
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              >
                {faq.question}
                <FAQIcon $isOpen={openFAQ === index}>▼</FAQIcon>
              </FAQQuestion>
              <FAQAnswer $isDark={isDark} $isOpen={openFAQ === index}>
                {faq.answer}
              </FAQAnswer>
            </FAQItem>
          ))}
        </FAQList>
      </Section>
    </Container>
  );
};
