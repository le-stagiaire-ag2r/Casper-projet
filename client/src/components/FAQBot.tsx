import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { colors, typography, spacing, layout, effects } from '../styles/designTokens';

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

// SVG Icons
const ChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const BotIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" />
    <line x1="16" y1="16" x2="16" y2="16" />
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const FloatingButton = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${colors.background.elevated};
  border: 1px solid ${colors.border.default};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.accent.primary};
  z-index: 1000;
  transition: all ${effects.transition.normal};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

  &:hover {
    transform: scale(1.1);
    border-color: ${colors.accent.primary};
    box-shadow: ${effects.shadow.glow};
  }
`;

const ChatWindow = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  bottom: 96px;
  right: 24px;
  width: 380px;
  height: 500px;
  background: ${colors.background.secondary};
  border-radius: ${layout.borderRadius.xl};
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  flex-direction: column;
  overflow: hidden;
  z-index: 1001;
  animation: ${slideUp} 0.3s ease-out;
  border: 1px solid ${colors.border.default};

  @media (max-width: 420px) {
    width: calc(100vw - 48px);
    right: 24px;
    left: 24px;
  }
`;

const ChatHeader = styled.div`
  background: ${colors.background.tertiary};
  padding: ${spacing[4]} ${spacing[5]};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${colors.border.default};
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing[3]};
  color: ${colors.text.primary};
`;

const BotAvatar = styled.div`
  width: 36px;
  height: 36px;
  background: ${colors.accent.muted};
  border-radius: ${layout.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.accent.primary};
`;

const HeaderText = styled.div`
  h4 {
    margin: 0;
    font-family: ${typography.fontFamily.display};
    font-size: ${typography.fontSize.sm};
    font-weight: ${typography.fontWeight.semibold};
    color: ${colors.text.primary};
  }
  span {
    font-size: ${typography.fontSize.xs};
    color: ${colors.text.tertiary};
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${colors.text.tertiary};
  width: 32px;
  height: 32px;
  border-radius: ${layout.borderRadius.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${effects.transition.fast};

  &:hover {
    background: ${colors.background.elevated};
    color: ${colors.text.primary};
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${spacing[4]};
  display: flex;
  flex-direction: column;
  gap: ${spacing[3]};

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${colors.border.default};
    border-radius: 2px;
  }
`;

const Message = styled.div<{ $isBot: boolean }>`
  max-width: 85%;
  padding: ${spacing[3]} ${spacing[4]};
  border-radius: ${props => props.$isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px'};
  background: ${props => props.$isBot
    ? colors.background.tertiary
    : colors.accent.primary};
  color: ${colors.text.primary};
  align-self: ${props => props.$isBot ? 'flex-start' : 'flex-end'};
  font-size: ${typography.fontSize.sm};
  line-height: ${typography.lineHeight.relaxed};
  animation: ${slideUp} 0.2s ease-out;
  border: 1px solid ${props => props.$isBot ? colors.border.default : 'transparent'};
  white-space: pre-line;
`;

const TypingIndicator = styled.div`
  display: flex;
  gap: 4px;
  padding: ${spacing[3]} ${spacing[4]};
  background: ${colors.background.tertiary};
  border-radius: 16px 16px 16px 4px;
  width: fit-content;
  border: 1px solid ${colors.border.default};

  span {
    width: 6px;
    height: 6px;
    background: ${colors.text.tertiary};
    border-radius: 50%;
    animation: ${pulse} 1s infinite;

    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
`;

const QuickReplies = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing[2]};
  padding: ${spacing[3]} ${spacing[4]};
  border-top: 1px solid ${colors.border.default};
`;

const QuickReply = styled.button`
  background: transparent;
  border: 1px solid ${colors.border.default};
  color: ${colors.text.secondary};
  padding: ${spacing[2]} ${spacing[3]};
  border-radius: ${layout.borderRadius.full};
  font-size: ${typography.fontSize.xs};
  cursor: pointer;
  transition: all ${effects.transition.fast};

  &:hover {
    border-color: ${colors.accent.primary};
    color: ${colors.accent.primary};
  }
`;

const InputContainer = styled.div`
  padding: ${spacing[3]} ${spacing[4]};
  border-top: 1px solid ${colors.border.default};
  display: flex;
  gap: ${spacing[2]};
`;

const Input = styled.input`
  flex: 1;
  padding: ${spacing[3]} ${spacing[4]};
  border-radius: ${layout.borderRadius.full};
  border: 1px solid ${colors.border.default};
  background: ${colors.background.tertiary};
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.sm};
  font-family: ${typography.fontFamily.body};

  &:focus {
    outline: none;
    border-color: ${colors.accent.primary};
  }

  &::placeholder {
    color: ${colors.text.muted};
  }
`;

const SendButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${colors.accent.primary};
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${effects.transition.fast};

  &:hover {
    transform: scale(1.05);
    box-shadow: ${effects.shadow.glow};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
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

// FAQ data without emojis
const FAQ_DATA = [
  {
    keywords: ['hello', 'hi', 'hey', 'bonjour', 'salut', 'coucou'],
    response: 'Hello! Welcome to StakeVue. I can help you with liquid staking on Casper. What would you like to know?'
  },
  {
    keywords: ['liquid staking', 'what is liquid', 'liquid stake'],
    response: 'Liquid staking lets you stake CSPR and receive stCSPR tokens in return. Unlike traditional staking, you can use stCSPR in DeFi while still earning ~17% APY rewards!'
  },
  {
    keywords: ['stcspr', 'st cspr', 'staked cspr', 'token'],
    response: 'stCSPR is your liquid staking token. When you stake 1000 CSPR, you get 1000 stCSPR. As rewards accumulate, your stCSPR becomes worth more CSPR over time!'
  },
  {
    keywords: ['apy', 'interest', 'rate', 'percentage', 'yield'],
    response: 'Current APY on StakeVue is approximately 17%. This means staking 1000 CSPR earns you about 170 CSPR per year! Rates vary slightly based on network conditions.'
  },
  {
    keywords: ['earn', 'reward', 'profit', 'gain', 'money', 'much'],
    response: 'With ~17% APY, here are examples:\n\n• 1,000 CSPR → ~170 CSPR/year\n• 10,000 CSPR → ~1,700 CSPR/year\n• 100,000 CSPR → ~17,000 CSPR/year\n\nRewards compound automatically!'
  },
  {
    keywords: ['safe', 'secure', 'risk', 'trust', 'audit'],
    response: 'Security is our priority! StakeVue uses audited smart contracts, distributes stake across multiple validators, and your funds remain in your control. The protocol has been tested on testnet.'
  },
  {
    keywords: ['unstake', 'withdraw', 'remove', 'exit', 'get back'],
    response: 'To unstake:\n\n1. Go to Stake page\n2. Click "Unstake" tab\n3. Enter stCSPR amount\n4. Confirm transaction\n\nThere\'s a short unbonding period, then your CSPR is returned!'
  },
  {
    keywords: ['start', 'begin', 'how to', 'getting started', 'first'],
    response: 'Getting started is easy!\n\n1. Connect your Casper wallet\n2. Enter CSPR amount to stake\n3. Click "Stake" and confirm\n4. Receive stCSPR instantly!\n\nStart with any amount you\'re comfortable with!'
  },
  {
    keywords: ['minimum', 'min', 'least', 'smallest'],
    response: 'Minimum stake is just 1 CSPR! However, we recommend keeping ~5 CSPR in your wallet for transaction fees. Start small and increase as you get comfortable.'
  },
  {
    keywords: ['validator', 'node', 'delegate'],
    response: 'StakeVue automatically distributes your stake across top-performing validators with 99%+ uptime. This provides better security and consistent rewards compared to picking a single validator.'
  },
  {
    keywords: ['fee', 'cost', 'charge', 'commission'],
    response: 'StakeVue charges a small protocol fee (included in displayed APY). Network transaction fees are minimal (~0.1 CSPR). What you see as APY is your net return!'
  },
  {
    keywords: ['casper', 'cspr', 'network', 'blockchain'],
    response: 'Casper is a proof-of-stake blockchain known for its security and energy efficiency. CSPR is the native token. Staking helps secure the network while earning you rewards!'
  },
  {
    keywords: ['time', 'long', 'duration', 'wait', 'period'],
    response: 'Staking is instant! For unstaking, there\'s an unbonding period (typically 7-14 eras, about 14-28 hours) before CSPR returns to your wallet. This is a network security feature.'
  },
  {
    keywords: ['wallet', 'connect', 'casper wallet', 'signer'],
    response: 'We support Casper Wallet and Casper Signer! Click the "Connect" button in the top bar, choose your wallet, and approve the connection. Make sure your wallet has CSPR to stake.'
  },
  {
    keywords: ['help', 'support', 'contact', 'problem', 'issue'],
    response: 'Need help? Check our Guide page for detailed tutorials. For technical issues, visit our GitHub or join the Casper community Discord. We\'re here to help!'
  },
  {
    keywords: ['thank', 'thanks', 'merci', 'thx'],
    response: 'You\'re welcome! Happy staking! If you have more questions, just ask.'
  },
  {
    keywords: ['bye', 'goodbye', 'see you', 'later', 'aurevoir'],
    response: 'Goodbye! Happy staking and may your rewards be plentiful!'
  }
];

const QUICK_REPLIES = [
  'What is liquid staking?',
  'How much can I earn?',
  'How to start?',
  'Is it safe?',
  'What is stCSPR?',
];

export const FAQBot: React.FC<FAQBotProps> = ({ isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! I\'m the StakeVue assistant. Ask me about liquid staking, rewards, stCSPR, or how to get started!',
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
    const normalizedQuery = query.toLowerCase().trim();
    let bestMatch: { score: number; response: string } = { score: 0, response: '' };

    for (const faq of FAQ_DATA) {
      let score = 0;

      for (const keyword of faq.keywords) {
        if (normalizedQuery.includes(keyword)) {
          score += keyword.length;
          if (normalizedQuery === keyword) {
            score += 10;
          }
        }
      }

      if (score > bestMatch.score) {
        bestMatch = { score, response: faq.response };
      }
    }

    if (bestMatch.score > 0) {
      return bestMatch.response;
    }

    return 'I\'m not sure I understand that question. Try asking about:\n\n• Liquid staking basics\n• APY and rewards\n• How to stake/unstake\n• stCSPR tokens\n• Security';
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      isBot: false,
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = findResponse(userInput);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isBot: true,
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 400);
  };

  const handleQuickReply = (reply: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: reply,
      isBot: false,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const response = findResponse(reply);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isBot: true,
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 400);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      <FloatingButton onClick={() => setIsOpen(!isOpen)} data-cursor-hover>
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </FloatingButton>

      <ChatWindow $isOpen={isOpen}>
        <ChatHeader>
          <HeaderTitle>
            <BotAvatar><BotIcon /></BotAvatar>
            <HeaderText>
              <h4>StakeVue Assistant</h4>
              <span>Ask me anything</span>
            </HeaderText>
          </HeaderTitle>
          <CloseButton onClick={() => setIsOpen(false)}>
            <CloseIcon />
          </CloseButton>
        </ChatHeader>

        <MessagesContainer>
          {messages.map(msg => (
            <Message key={msg.id} $isBot={msg.isBot}>
              {msg.text}
            </Message>
          ))}
          {isTyping && (
            <TypingIndicator>
              <span /><span /><span />
            </TypingIndicator>
          )}
          <div ref={messagesEndRef} />
        </MessagesContainer>

        <QuickReplies>
          {QUICK_REPLIES.map(reply => (
            <QuickReply
              key={reply}
              onClick={() => handleQuickReply(reply)}
            >
              {reply}
            </QuickReply>
          ))}
        </QuickReplies>

        <InputContainer>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your question..."
          />
          <SendButton onClick={handleSend} disabled={!input.trim()}>
            <SendIcon />
          </SendButton>
        </InputContainer>
      </ChatWindow>
    </>
  );
};

export default FAQBot;
