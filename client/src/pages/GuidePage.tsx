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
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'};
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
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'};
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
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'};
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
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'};
  line-height: 1.6;
`;

interface GuidePageProps {
  isDark: boolean;
}

export const GuidePage: React.FC<GuidePageProps> = ({ isDark }) => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const faqs = [
    {
      question: "What is liquid staking?",
      answer: "Liquid staking allows you to stake your tokens while keeping their liquidity. You receive a representative token (stCSPR) that you can use, trade, or transfer, while your original CSPR generates rewards."
    },
    {
      question: "Are my CSPR safe?",
      answer: "The StakeVue contract has been audited by CasperSecure with an A+ grade. All arithmetic operations are secured to prevent overflow/underflow attacks. The code is open source and verifiable."
    },
    {
      question: "How much can I earn with StakeVue?",
      answer: "The current rate is 10% APY (Annual Percentage Yield). For example, if you stake 1000 CSPR, you earn approximately 100 CSPR per year in rewards."
    },
    {
      question: "Can I unstake at any time?",
      answer: "Yes! You can unstake your CSPR at any time by burning your stCSPR tokens. There is no mandatory lock-up period."
    },
    {
      question: "What's the difference with traditional staking?",
      answer: "With traditional staking, your tokens are locked and unusable during the staking period. With liquid staking, you receive stCSPR that you can use freely while still earning rewards."
    }
  ];

  return (
    <Container>
      <Title $isDark={isDark}>📖 StakeVue Guide</Title>
      <Subtitle $isDark={isDark}>
        Everything you need to know about liquid staking
      </Subtitle>

      <Section>
        <SectionTitle $isDark={isDark}>
          <SectionIcon>💡</SectionIcon>
          What is Liquid Staking?
        </SectionTitle>
        <ExplanationCard $isDark={isDark}>
          <Paragraph $isDark={isDark}>
            <Highlight>Liquid staking</Highlight> is a DeFi innovation that solves
            the biggest problem of traditional staking: <Highlight>loss of liquidity</Highlight>.
          </Paragraph>
          <Paragraph $isDark={isDark}>
            Normally, when you stake your tokens, they are locked. You cannot use them,
            sell them, or transfer them. With liquid staking, you receive a
            <Highlight> representative token</Highlight> (stCSPR) that you can
            use freely, while your CSPR generates rewards.
          </Paragraph>

          <ComparisonTable $isDark={isDark}>
            <ComparisonCard $isDark={isDark} $type="bad">
              <ComparisonTitle $isDark={isDark}>❌ Traditional Staking</ComparisonTitle>
              <ComparisonList $isDark={isDark}>
                <ComparisonItem $isDark={isDark}>🔒 Tokens locked</ComparisonItem>
                <ComparisonItem $isDark={isDark}>⏳ Long unbonding period</ComparisonItem>
                <ComparisonItem $isDark={isDark}>🚫 Cannot transfer</ComparisonItem>
                <ComparisonItem $isDark={isDark}>📉 Missed opportunities</ComparisonItem>
              </ComparisonList>
            </ComparisonCard>

            <ComparisonCard $isDark={isDark} $type="good">
              <ComparisonTitle $isDark={isDark}>✅ Liquid Staking (StakeVue)</ComparisonTitle>
              <ComparisonList $isDark={isDark}>
                <ComparisonItem $isDark={isDark}>🔓 Liquid tokens (stCSPR)</ComparisonItem>
                <ComparisonItem $isDark={isDark}>⚡ Unstake anytime</ComparisonItem>
                <ComparisonItem $isDark={isDark}>🔄 Transferable & tradeable</ComparisonItem>
                <ComparisonItem $isDark={isDark}>📈 Usable in DeFi</ComparisonItem>
              </ComparisonList>
            </ComparisonCard>
          </ComparisonTable>
        </ExplanationCard>
      </Section>

      <Section>
        <SectionTitle $isDark={isDark}>
          <SectionIcon>👥</SectionIcon>
          Who Uses StakeVue?
        </SectionTitle>
        <PersonaGrid>
          <PersonaCard $isDark={isDark}>
            <PersonaHeader>
              <PersonaAvatar>👨‍💼</PersonaAvatar>
              <PersonaInfo>
                <PersonaName $isDark={isDark}>Thomas</PersonaName>
                <PersonaRole $isDark={isDark}>Long-term investor</PersonaRole>
              </PersonaInfo>
            </PersonaHeader>
            <PersonaQuote $isDark={isDark}>
              "I want to earn rewards on my CSPR without losing the ability
              to react to market opportunities."
            </PersonaQuote>
            <PersonaAction $isDark={isDark}>
              ✅ Thomas stakes 5000 CSPR, receives 5000 stCSPR, and earns 500 CSPR/year
              while keeping the ability to sell if needed.
            </PersonaAction>
          </PersonaCard>

          <PersonaCard $isDark={isDark}>
            <PersonaHeader>
              <PersonaAvatar>👩‍🎓</PersonaAvatar>
              <PersonaInfo>
                <PersonaName $isDark={isDark}>Sarah</PersonaName>
                <PersonaRole $isDark={isDark}>Crypto beginner</PersonaRole>
              </PersonaInfo>
            </PersonaHeader>
            <PersonaQuote $isDark={isDark}>
              "I want simple passive income without having to manage validators
              or understand complicated technical concepts."
            </PersonaQuote>
            <PersonaAction $isDark={isDark}>
              ✅ Sarah connects her wallet, stakes 100 CSPR in 2 clicks, and starts
              earning rewards automatically.
            </PersonaAction>
          </PersonaCard>

          <PersonaCard $isDark={isDark}>
            <PersonaHeader>
              <PersonaAvatar>👨‍💻</PersonaAvatar>
              <PersonaInfo>
                <PersonaName $isDark={isDark}>Alex</PersonaName>
                <PersonaRole $isDark={isDark}>DeFi trader</PersonaRole>
              </PersonaInfo>
            </PersonaHeader>
            <PersonaQuote $isDark={isDark}>
              "I want to use my stCSPR as collateral in other protocols
              to maximize my yields."
            </PersonaQuote>
            <PersonaAction $isDark={isDark}>
              ✅ Alex stakes his CSPR, uses his stCSPR in other DeFi protocols,
              and stacks yields.
            </PersonaAction>
          </PersonaCard>
        </PersonaGrid>
      </Section>

      <Section>
        <SectionTitle $isDark={isDark}>
          <SectionIcon>📝</SectionIcon>
          Step-by-Step Tutorial
        </SectionTitle>
        <TutorialSteps>
          <TutorialStep $isDark={isDark}>
            <StepNumber>1</StepNumber>
            <StepContent>
              <StepTitle $isDark={isDark}>Install a Casper Wallet</StepTitle>
              <StepDescription $isDark={isDark}>
                Download Casper Wallet from the Chrome Web Store or use
                a Ledger. Create an account and save your recovery phrase
                in a safe place.
              </StepDescription>
            </StepContent>
          </TutorialStep>

          <TutorialStep $isDark={isDark}>
            <StepNumber>2</StepNumber>
            <StepContent>
              <StepTitle $isDark={isDark}>Get Some CSPR</StepTitle>
              <StepDescription $isDark={isDark}>
                Buy CSPR on an exchange (Binance, Coinbase, etc.) and
                transfer them to your Casper wallet. For testnet, use
                the free faucet.
              </StepDescription>
            </StepContent>
          </TutorialStep>

          <TutorialStep $isDark={isDark}>
            <StepNumber>3</StepNumber>
            <StepContent>
              <StepTitle $isDark={isDark}>Connect to StakeVue</StepTitle>
              <StepDescription $isDark={isDark}>
                Click the "Connect" button at the top of the page. Select
                your wallet from the list and approve the connection.
              </StepDescription>
            </StepContent>
          </TutorialStep>

          <TutorialStep $isDark={isDark}>
            <StepNumber>4</StepNumber>
            <StepContent>
              <StepTitle $isDark={isDark}>Stake Your CSPR</StepTitle>
              <StepDescription $isDark={isDark}>
                Enter the amount of CSPR you want to stake and click
                "Stake". Sign the transaction in your wallet. You will
                instantly receive your stCSPR tokens.
              </StepDescription>
            </StepContent>
          </TutorialStep>

          <TutorialStep $isDark={isDark}>
            <StepNumber>5</StepNumber>
            <StepContent>
              <StepTitle $isDark={isDark}>Enjoy!</StepTitle>
              <StepDescription $isDark={isDark}>
                That's it! Your CSPR is now generating rewards (10% APY).
                You can use, transfer, or trade your stCSPR freely.
                To get your CSPR back, use the Unstake function.
              </StepDescription>
            </StepContent>
          </TutorialStep>
        </TutorialSteps>
      </Section>

      <Section>
        <SectionTitle $isDark={isDark}>
          <SectionIcon>❓</SectionIcon>
          Frequently Asked Questions
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
