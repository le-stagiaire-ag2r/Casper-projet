import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.03)'
    : 'rgba(255, 255, 255, 0.8)'};
  border-radius: 24px;
  padding: 32px;
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.08)'};
  box-shadow: ${props => props.$isDark
    ? 'none'
    : '0 4px 20px rgba(0, 0, 0, 0.08)'};
`;

const Title = styled.h2<{ $isDark: boolean }>`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FAQList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FAQItem = styled.div<{ $isDark: boolean; $isOpen: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.03)'
    : 'rgba(0, 0, 0, 0.02)'};
  border-radius: 16px;
  border: 1px solid ${props => props.$isOpen
    ? props.$isDark ? 'rgba(88, 86, 214, 0.3)' : 'rgba(88, 86, 214, 0.2)'
    : props.$isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
  overflow: hidden;
  transition: all 0.3s ease;
`;

const Question = styled.button<{ $isDark: boolean; $isOpen: boolean }>`
  width: 100%;
  padding: 20px;
  background: transparent;
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  text-align: left;
  gap: 16px;

  &:hover {
    background: ${props => props.$isDark
      ? 'rgba(255, 255, 255, 0.02)'
      : 'rgba(0, 0, 0, 0.02)'};
  }
`;

const QuestionText = styled.span<{ $isDark: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  flex: 1;
`;

const Arrow = styled.span<{ $isOpen: boolean; $isDark: boolean }>`
  font-size: 14px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0)'};
  transition: transform 0.3s ease;
`;

const Answer = styled.div<{ $isDark: boolean; $isOpen: boolean }>`
  padding: ${props => props.$isOpen ? '0 20px 20px' : '0 20px'};
  max-height: ${props => props.$isOpen ? '500px' : '0'};
  opacity: ${props => props.$isOpen ? 1 : 0};
  overflow: hidden;
  transition: all 0.3s ease;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.7)'
    : 'rgba(0, 0, 0, 0.7)'};
  font-size: 14px;
  line-height: 1.7;
`;

const Highlight = styled.span`
  color: #5856d6;
  font-weight: 600;
`;

const Badge = styled.span`
  display: inline-block;
  background: linear-gradient(135deg, #30d158 0%, #34c759 100%);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  margin-left: 8px;
  text-transform: uppercase;
`;

interface FAQProps {
  isDark: boolean;
}

interface FAQData {
  question: string;
  answer: React.ReactNode;
  badge?: string;
}

const faqData: FAQData[] = [
  {
    question: "What is liquid staking?",
    answer: (
      <>
        Liquid staking allows you to <Highlight>stake your CSPR</Highlight> tokens while receiving a liquid token (stCSPR) in return.
        This means you can still use your assets in DeFi protocols while earning staking rewards.
        Unlike traditional staking, your tokens aren't locked.
      </>
    ),
    badge: "Popular"
  },
  {
    question: "What is stCSPR?",
    answer: (
      <>
        stCSPR is a <Highlight>liquid staking token</Highlight> that represents your staked CSPR.
        It accrues value over time as staking rewards are earned.
        The exchange rate between stCSPR and CSPR increases as rewards accumulate,
        meaning 1 stCSPR will be worth more CSPR over time.
      </>
    )
  },
  {
    question: "What APY can I expect?",
    answer: (
      <>
        Current APY on the Casper Network ranges from <Highlight>8% to 12%</Highlight> depending on
        network conditions and validator performance. APY is variable and depends on total stake,
        validator uptime, and network participation rate.
      </>
    )
  },
  {
    question: "How long does unstaking take?",
    answer: (
      <>
        On the Casper Network, unstaking has a <Highlight>14 era (~14 hours)</Highlight> unbonding period.
        During this time, your tokens are being released from the validator.
        With liquid staking, you can potentially trade your stCSPR tokens immediately instead of waiting.
      </>
    )
  },
  {
    question: "What are the fees?",
    answer: (
      <>
        StakeVue charges a small fee on staking rewards (not on your principal).
        Additionally, standard <Highlight>Casper Network gas fees</Highlight> apply for each transaction
        (approximately 5 CSPR for staking operations). There are no hidden fees.
      </>
    )
  },
  {
    question: "Is my stake secure?",
    answer: (
      <>
        Your stake is distributed across multiple <Highlight>top-performing validators</Highlight> to minimize risk.
        The protocol uses audited smart contracts and follows industry best practices.
        However, as with any DeFi protocol, there are inherent smart contract risks.
      </>
    )
  },
  {
    question: "What is the minimum stake amount?",
    answer: (
      <>
        The minimum stake amount is <Highlight>1 CSPR</Highlight> (configurable).
        This low minimum makes staking accessible to all users, regardless of portfolio size.
        Remember to keep some CSPR for gas fees when staking.
      </>
    )
  },
  {
    question: "How do I connect my wallet?",
    answer: (
      <>
        Click the <Highlight>"Connect Wallet"</Highlight> button in the top bar.
        StakeVue supports multiple Casper wallets including Casper Wallet, Ledger, and Torus.
        Make sure you're connected to the correct network (Testnet/Mainnet).
      </>
    )
  }
];

export const FAQ: React.FC<FAQProps> = ({ isDark }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Container $isDark={isDark}>
      <Title $isDark={isDark}>
        <span>❓</span> Frequently Asked Questions
      </Title>
      <FAQList>
        {faqData.map((faq, index) => (
          <FAQItem key={index} $isDark={isDark} $isOpen={openIndex === index}>
            <Question
              $isDark={isDark}
              $isOpen={openIndex === index}
              onClick={() => toggleFAQ(index)}
            >
              <QuestionText $isDark={isDark}>
                {faq.question}
                {faq.badge && <Badge>{faq.badge}</Badge>}
              </QuestionText>
              <Arrow $isOpen={openIndex === index} $isDark={isDark}>▼</Arrow>
            </Question>
            <Answer $isDark={isDark} $isOpen={openIndex === index}>
              {faq.answer}
            </Answer>
          </FAQItem>
        ))}
      </FAQList>
    </Container>
  );
};

export default FAQ;
