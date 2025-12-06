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

// Better structured FAQ with priority keywords
const FAQ_DATA = [
  {
    keywords: ['hello', 'hi', 'hey', 'bonjour', 'salut', 'coucou'],
    response: 'Hello! 👋 Welcome to StakeVue. I can help you with liquid staking on Casper. What would you like to know?'
  },
  {
    keywords: ['liquid staking', 'what is liquid', 'liquid stake'],
    response: 'Liquid staking lets you stake CSPR and receive stCSPR tokens in return. Unlike traditional staking, you can use stCSPR in DeFi while still earning ~17% APY rewards! 🚀'
  },
  {
    keywords: ['stcspr', 'st cspr', 'staked cspr', 'token'],
    response: 'stCSPR is your liquid staking token. When you stake 1000 CSPR, you get 1000 stCSPR. As rewards accumulate, your stCSPR becomes worth more CSPR over time! 💎'
  },
  {
    keywords: ['apy', 'interest', 'rate', 'percentage', 'yield'],
    response: 'Current APY on StakeVue is approximately 17%. This means staking 1000 CSPR earns you about 170 CSPR per year! Rates vary slightly based on network conditions. 📊'
  },
  {
    keywords: ['earn', 'reward', 'profit', 'gain', 'money', 'much'],
    response: 'With ~17% APY, here are examples:\n• 1,000 CSPR → ~170 CSPR/year\n• 10,000 CSPR → ~1,700 CSPR/year\n• 100,000 CSPR → ~17,000 CSPR/year\nRewards compound automatically! 💰'
  },
  {
    keywords: ['safe', 'secure', 'risk', 'trust', 'audit'],
    response: 'Security is our priority! StakeVue uses audited smart contracts, distributes stake across multiple validators, and your funds remain in your control. The protocol has been tested on testnet. 🛡️'
  },
  {
    keywords: ['unstake', 'withdraw', 'remove', 'exit', 'get back'],
    response: 'To unstake: Go to Stake page → Click "Unstake" tab → Enter stCSPR amount → Confirm transaction. There\'s a short unbonding period, then your CSPR is returned! ⚡'
  },
  {
    keywords: ['start', 'begin', 'how to', 'getting started', 'first'],
    response: 'Getting started is easy!\n1️⃣ Connect your Casper wallet\n2️⃣ Enter CSPR amount to stake\n3️⃣ Click "Stake" and confirm\n4️⃣ Receive stCSPR instantly!\n\nStart with any amount you\'re comfortable with! 🎉'
  },
  {
    keywords: ['minimum', 'min', 'least', 'smallest'],
    response: 'Minimum stake is just 1 CSPR! However, we recommend keeping ~5 CSPR in your wallet for transaction fees. Start small and increase as you get comfortable. 💪'
  },
  {
    keywords: ['validator', 'node', 'delegate'],
    response: 'StakeVue automatically distributes your stake across top-performing validators with 99%+ uptime. This provides better security and consistent rewards compared to picking a single validator. 🌐'
  },
  {
    keywords: ['fee', 'cost', 'charge', 'commission'],
    response: 'StakeVue charges a small protocol fee (included in displayed APY). Network transaction fees are minimal (~0.1 CSPR). What you see as APY is your net return! 💸'
  },
  {
    keywords: ['casper', 'cspr', 'network', 'blockchain'],
    response: 'Casper is a proof-of-stake blockchain known for its security and energy efficiency. CSPR is the native token. Staking helps secure the network while earning you rewards! 🔗'
  },
  {
    keywords: ['time', 'long', 'duration', 'wait', 'period'],
    response: 'Staking is instant! For unstaking, there\'s an unbonding period (typically 7-14 eras, about 14-28 hours) before CSPR returns to your wallet. This is a network security feature. ⏱️'
  },
  {
    keywords: ['wallet', 'connect', 'casper wallet', 'signer'],
    response: 'We support Casper Wallet and Casper Signer! Click the "Connect" button in the top bar, choose your wallet, and approve the connection. Make sure your wallet has CSPR to stake. 👛'
  },
  {
    keywords: ['help', 'support', 'contact', 'problem', 'issue'],
    response: 'Need help? Check our Guide page for detailed tutorials. For technical issues, visit our GitHub or join the Casper community Discord. We\'re here to help! 🤝'
  },
  {
    keywords: ['thank', 'thanks', 'merci', 'thx'],
    response: 'You\'re welcome! Happy staking! If you have more questions, just ask. 😊'
  },
  {
    keywords: ['bye', 'goodbye', 'see you', 'later', 'aurevoir'],
    response: 'Goodbye! Happy staking and may your rewards be plentiful! 🌟'
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
      text: 'Hello! 👋 I\'m the StakeVue assistant. Ask me about liquid staking, rewards, stCSPR, or how to get started!',
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

    // Find the best matching FAQ entry
    let bestMatch: { score: number; response: string } = { score: 0, response: '' };

    for (const faq of FAQ_DATA) {
      let score = 0;

      for (const keyword of faq.keywords) {
        if (normalizedQuery.includes(keyword)) {
          // Longer keyword matches are more specific
          score += keyword.length;

          // Exact match bonus
          if (normalizedQuery === keyword) {
            score += 10;
          }
        }
      }

      if (score > bestMatch.score) {
        bestMatch = { score, response: faq.response };
      }
    }

    // If we found a match
    if (bestMatch.score > 0) {
      return bestMatch.response;
    }

    // Default response with suggestions
    return 'I\'m not sure I understand that question. 🤔 Try asking about:\n• Liquid staking basics\n• APY and rewards\n• How to stake/unstake\n• stCSPR tokens\n• Security';
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

    // Simulate bot thinking
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
      <FloatingButton $isDark={isDark} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '💬'}
      </FloatingButton>

      <ChatWindow $isDark={isDark} $isOpen={isOpen}>
        <ChatHeader>
          <HeaderTitle>
            <BotAvatar>🤖</BotAvatar>
            <HeaderText>
              <h4>StakeVue Assistant</h4>
              <span>Ask me anything!</span>
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
            placeholder="Type your question..."
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
