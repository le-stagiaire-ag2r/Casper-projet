import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const FloatingButton = styled.button<{ $isDark: boolean }>`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #5856d6, #af52de);
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(88, 86, 214, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  z-index: 1000;
  transition: all 0.3s;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 30px rgba(88, 86, 214, 0.5);
  }
`;

const ChatWindow = styled.div<{ $isDark: boolean; $isOpen: boolean }>`
  position: fixed;
  bottom: 100px;
  right: 24px;
  width: 380px;
  height: 500px;
  background: ${props => props.$isDark ? '#1a1a2e' : '#fff'};
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  flex-direction: column;
  overflow: hidden;
  z-index: 1001;
  animation: ${slideUp} 0.3s ease-out;
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};

  @media (max-width: 420px) {
    width: calc(100vw - 48px);
    right: 24px;
    left: 24px;
  }
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, #5856d6, #af52de);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
`;

const BotAvatar = styled.div`
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
`;

const HeaderText = styled.div`
  h4 {
    margin: 0;
    font-size: 1rem;
  }
  span {
    font-size: 0.75rem;
    opacity: 0.8;
  }
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const MessagesContainer = styled.div<{ $isDark: boolean }>`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Message = styled.div<{ $isBot: boolean; $isDark: boolean }>`
  max-width: 85%;
  padding: 12px 16px;
  border-radius: ${props => props.$isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px'};
  background: ${props => props.$isBot
    ? props.$isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'
    : 'linear-gradient(135deg, #5856d6, #af52de)'};
  color: ${props => props.$isBot
    ? props.$isDark ? '#fff' : '#1a1a2e'
    : '#fff'};
  align-self: ${props => props.$isBot ? 'flex-start' : 'flex-end'};
  font-size: 0.9rem;
  line-height: 1.5;
  animation: ${slideUp} 0.2s ease-out;
`;

const TypingIndicator = styled.div<{ $isDark: boolean }>`
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: ${props => props.$isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'};
  border-radius: 16px 16px 16px 4px;
  width: fit-content;

  span {
    width: 8px;
    height: 8px;
    background: ${props => props.$isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)'};
    border-radius: 50%;
    animation: ${pulse} 1s infinite;

    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
`;

const QuickReplies = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid ${props => props.$isDark
    ? 'rgba(255,255,255,0.1)'
    : 'rgba(0,0,0,0.1)'};
`;

const QuickReply = styled.button<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255,255,255,0.08)'
    : 'rgba(88, 86, 214, 0.1)'};
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255,255,255,0.2)'
    : 'rgba(88, 86, 214, 0.3)'};
  color: ${props => props.$isDark ? '#fff' : '#5856d6'};
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$isDark
      ? 'rgba(255,255,255,0.15)'
      : 'rgba(88, 86, 214, 0.2)'};
  }
`;

const InputContainer = styled.div<{ $isDark: boolean }>`
  padding: 12px 16px;
  border-top: 1px solid ${props => props.$isDark
    ? 'rgba(255,255,255,0.1)'
    : 'rgba(0,0,0,0.1)'};
  display: flex;
  gap: 8px;
`;

const Input = styled.input<{ $isDark: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border-radius: 24px;
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255,255,255,0.2)'
    : 'rgba(0,0,0,0.1)'};
  background: ${props => props.$isDark
    ? 'rgba(255,255,255,0.05)'
    : 'rgba(0,0,0,0.02)'};
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #5856d6;
  }

  &::placeholder {
    color: ${props => props.$isDark
      ? 'rgba(255,255,255,0.4)'
      : 'rgba(0,0,0,0.4)'};
  }
`;

const SendButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #5856d6, #af52de);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface FAQBotProps {
  isDark: boolean;
}

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
}

const FAQ_RESPONSES: Record<string, string> = {
  'what is liquid staking': 'Liquid staking allows you to stake your CSPR while receiving stCSPR tokens in return. These tokens represent your stake and can be freely traded or used in DeFi, all while earning ~17% APY! 🚀',
  'what is stcspr': 'stCSPR is a liquid staking token that represents your staked CSPR. When you stake 1000 CSPR, you receive 1000 stCSPR at a 1:1 ratio. Over time, as you earn rewards, your stCSPR becomes worth more CSPR! 💰',
  'how much can i earn': 'Current APY is approximately 15-18% depending on network conditions. For example, staking 1000 CSPR would earn you about 170 CSPR per year in rewards! 📈',
  'is it safe': 'Yes! StakeVue uses audited smart contracts and distributes your stake across multiple validators for security. Your funds are protected by multi-validator distribution. 🛡️',
  'how to unstake': 'To unstake, simply go to the Stake page, switch to the "Unstake" tab, enter the amount of stCSPR you want to convert back to CSPR, and confirm the transaction. It\'s that easy! ⚡',
  'minimum stake': 'You can stake as little as 1 CSPR. However, we recommend keeping about 5 CSPR for transaction fees. Start small and stake more as you get comfortable! 💪',
  'what is apy': 'APY stands for Annual Percentage Yield. It represents your yearly earnings from staking. Our current APY is ~17%, meaning 1000 CSPR would earn about 170 CSPR per year! 📊',
  'how to start': 'Getting started is easy! 1) Connect your Casper wallet, 2) Enter the amount you want to stake, 3) Click "Stake" and confirm the transaction. You\'ll receive stCSPR tokens instantly! 🎉',
  'price alerts': 'You can set custom price alerts in the Stake page. Choose a target price for CSPR, select "above" or "below", and you\'ll get notified when the price reaches your target! 🔔',
  'validators': 'StakeVue automatically distributes your stake across top-performing validators. This provides better security and decentralization compared to staking with a single validator. 🌐',
};

const QUICK_REPLIES = [
  'What is liquid staking?',
  'How much can I earn?',
  'Is it safe?',
  'How to start?',
  'What is stCSPR?',
];

export const FAQBot: React.FC<FAQBotProps> = ({ isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hi there! 👋 I\'m the StakeVue assistant. Ask me anything about liquid staking, stCSPR, rewards, or how to get started!',
      isBot: true,
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findResponse = (query: string): string => {
    const normalizedQuery = query.toLowerCase();

    // Check for keyword matches
    for (const [key, response] of Object.entries(FAQ_RESPONSES)) {
      if (normalizedQuery.includes(key) || key.split(' ').some(word => normalizedQuery.includes(word))) {
        return response;
      }
    }

    // Check for specific keywords
    if (normalizedQuery.includes('stake') && normalizedQuery.includes('how')) {
      return FAQ_RESPONSES['how to start'];
    }
    if (normalizedQuery.includes('earn') || normalizedQuery.includes('reward') || normalizedQuery.includes('profit')) {
      return FAQ_RESPONSES['how much can i earn'];
    }
    if (normalizedQuery.includes('safe') || normalizedQuery.includes('secure') || normalizedQuery.includes('risk')) {
      return FAQ_RESPONSES['is it safe'];
    }

    // Default response
    return 'I\'m not sure about that specific question, but I\'d be happy to help with topics like liquid staking, stCSPR tokens, APY rewards, or how to get started. Try asking about one of these! 🤔';
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      isBot: false,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot thinking
    setTimeout(() => {
      const response = findResponse(input);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isBot: true,
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  };

  const handleQuickReply = (reply: string) => {
    setInput(reply);
    setTimeout(() => handleSend(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      <FloatingButton $isDark={isDark} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '🤖'}
      </FloatingButton>

      <ChatWindow $isDark={isDark} $isOpen={isOpen}>
        <ChatHeader>
          <HeaderTitle>
            <BotAvatar>🤖</BotAvatar>
            <HeaderText>
              <h4>StakeVue Assistant</h4>
              <span>Always here to help</span>
            </HeaderText>
          </HeaderTitle>
          <CloseButton onClick={() => setIsOpen(false)}>✕</CloseButton>
        </ChatHeader>

        <MessagesContainer $isDark={isDark}>
          {messages.map(msg => (
            <Message key={msg.id} $isBot={msg.isBot} $isDark={isDark}>
              {msg.text}
            </Message>
          ))}
          {isTyping && (
            <TypingIndicator $isDark={isDark}>
              <span /><span /><span />
            </TypingIndicator>
          )}
          <div ref={messagesEndRef} />
        </MessagesContainer>

        <QuickReplies $isDark={isDark}>
          {QUICK_REPLIES.map(reply => (
            <QuickReply
              key={reply}
              $isDark={isDark}
              onClick={() => handleQuickReply(reply)}
            >
              {reply}
            </QuickReply>
          ))}
        </QuickReplies>

        <InputContainer $isDark={isDark}>
          <Input
            $isDark={isDark}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
          />
          <SendButton onClick={handleSend} disabled={!input.trim()}>
            ➤
          </SendButton>
        </InputContainer>
      </ChatWindow>
    </>
  );
};

export default FAQBot;
