import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useCsprPriceHistory } from '../hooks/useBalance';
import { useBalanceContext } from '../context/BalanceContext';
import { useCsprClick } from '../hooks/useCsprClick';
import { api } from '../services/api';
import { StakeRecord } from '../types';

const Container = styled.div<{ $isDark: boolean }>`
  background: rgba(20, 10, 30, 0.6);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h3<{ $isDark: boolean }>`
  margin: 0;
  font-size: 1.25rem;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Description = styled.p<{ $isDark: boolean }>`
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(0, 0, 0, 0.6)'};
  font-size: 0.9rem;
  margin-bottom: 20px;
  line-height: 1.5;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const OptionCard = styled.button<{ $isDark: boolean; $isSelected: boolean }>`
  background: ${props => props.$isSelected
    ? props.$isDark
      ? 'rgba(88, 86, 214, 0.2)'
      : 'rgba(88, 86, 214, 0.1)'
    : props.$isDark
      ? 'rgba(255, 255, 255, 0.03)'
      : 'rgba(0, 0, 0, 0.02)'};
  border: 2px solid ${props => props.$isSelected
    ? '#5856d6'
    : props.$isDark
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;

  &:hover {
    border-color: #5856d6;
  }
`;

const OptionIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 8px;
`;

const OptionTitle = styled.div<{ $isDark: boolean }>`
  font-weight: 600;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  margin-bottom: 4px;
`;

const OptionDesc = styled.div<{ $isDark: boolean }>`
  font-size: 0.8rem;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
`;

const DateRange = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 500px) {
    flex-direction: column;
  }
`;

const DateInput = styled.div<{ $isDark: boolean }>`
  flex: 1;

  label {
    display: block;
    font-size: 0.85rem;
    color: ${props => props.$isDark
      ? 'rgba(255, 255, 255, 0.6)'
      : 'rgba(0, 0, 0, 0.6)'};
    margin-bottom: 6px;
  }

  input {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid ${props => props.$isDark
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(0, 0, 0, 0.2)'};
    background: ${props => props.$isDark
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.02)'};
    color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
    font-size: 0.9rem;

    &:focus {
      outline: none;
      border-color: #5856d6;
    }
  }
`;

const ExportButton = styled.button<{ $isDark: boolean }>`
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #5856d6, #af52de);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(88, 86, 214, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const SuccessMessage = styled.div`
  background: rgba(48, 209, 88, 0.1);
  border: 1px solid rgba(48, 209, 88, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #30d158;
  font-size: 0.9rem;
`;

interface ExportCSVProps {
  isDark: boolean;
}

type ExportType = 'price_history' | 'transactions' | 'rewards' | 'portfolio';

export const ExportCSV: React.FC<ExportCSVProps> = ({ isDark }) => {
  const [selectedType, setSelectedType] = useState<ExportType>('transactions');
  const [selectedDays, setSelectedDays] = useState<number>(365);
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userStakes, setUserStakes] = useState<StakeRecord[]>([]);
  const [isLoadingStakes, setIsLoadingStakes] = useState(false);

  // Get wallet data
  const { activeAccount } = useCsprClick();
  const { csprBalance, stCsprBalance, isRealBalance } = useBalanceContext();

  // Fetch real price history data
  const { prices: priceHistory } = useCsprPriceHistory(selectedDays);

  // Fetch user's real transactions when wallet is connected
  useEffect(() => {
    const fetchStakes = async () => {
      if (!activeAccount?.publicKey) {
        setUserStakes([]);
        return;
      }

      setIsLoadingStakes(true);
      try {
        // Convert public key to account hash format if needed
        const accountHash = activeAccount.publicKey.startsWith('account-hash-')
          ? activeAccount.publicKey
          : `account-hash-${activeAccount.publicKey}`;

        const response = await api.getUserStakes(accountHash, 100, 0);
        setUserStakes(response.data || []);
      } catch (error) {
        console.error('Failed to fetch user stakes:', error);
        setUserStakes([]);
      } finally {
        setIsLoadingStakes(false);
      }
    };

    fetchStakes();
  }, [activeAccount?.publicKey]);

  const isWalletConnected = !!activeAccount?.publicKey;

  const exportOptions = [
    { type: 'transactions' as ExportType, icon: '', title: 'Transactions', desc: isWalletConnected ? `${userStakes.length} real transactions` : 'Connect wallet' },
    { type: 'portfolio' as ExportType, icon: '', title: 'Portfolio', desc: isWalletConnected ? 'Your real balances' : 'Connect wallet' },
    { type: 'price_history' as ExportType, icon: '', title: 'Price History', desc: 'CSPR price data' },
    { type: 'rewards' as ExportType, icon: '', title: 'Rewards', desc: 'Estimated rewards' },
  ];

  const daysOptions = [
    { label: '7 Days', value: 7 },
    { label: '30 Days', value: 30 },
    { label: '90 Days', value: 90 },
    { label: '1 Year', value: 365 },
    { label: 'All Time', value: 0 },
  ];

  const generateCSV = () => {
    if (selectedType === 'price_history') {
      // Export real price history data
      const headers = ['Date', 'Timestamp', 'Price (USD)', 'Price Change %'];

      if (priceHistory.length === 0) {
        return 'No price data available. Please try again later.';
      }

      const rows = priceHistory.map((p, i) => {
        const prevPrice = i > 0 ? priceHistory[i - 1].price : p.price;
        const changePercent = prevPrice > 0 ? ((p.price - prevPrice) / prevPrice * 100).toFixed(4) : '0';
        const fullDate = new Date(p.timestamp).toISOString().split('T')[0];
        return [fullDate, p.timestamp, p.price.toFixed(6), changePercent];
      });

      const csvHeaders = headers.join(',');
      const csvRows = rows.map(row => row.join(',')).join('\n');
      return `${csvHeaders}\n${csvRows}`;
    }

    // TRANSACTIONS - Use real wallet data
    if (selectedType === 'transactions') {
      const headers = ['Date', 'Time', 'Type', 'Amount (CSPR)', 'stCSPR', 'TX Hash', 'Block Height'];

      if (!isWalletConnected) {
        return '# Please connect your wallet to export real transaction data';
      }

      if (userStakes.length === 0) {
        return '# No transactions found for this wallet';
      }

      const rows = userStakes.map(stake => {
        const date = new Date(stake.timestamp);
        return [
          date.toISOString().split('T')[0],
          date.toTimeString().split(' ')[0],
          stake.actionType.toUpperCase(),
          (parseFloat(stake.amount) / 1_000_000_000).toFixed(4),
          stake.stCsprAmount ? (parseFloat(stake.stCsprAmount) / 1_000_000_000).toFixed(4) : '0',
          stake.txHash,
          stake.blockHeight.toString(),
        ];
      });

      const csvHeaders = headers.join(',');
      const csvRows = rows.map(row => row.join(',')).join('\n');
      return `# Wallet: ${activeAccount?.publicKey}\n# Export Date: ${new Date().toISOString()}\n${csvHeaders}\n${csvRows}`;
    }

    // PORTFOLIO - Use real balance data
    if (selectedType === 'portfolio') {
      const headers = ['Date', 'CSPR Balance', 'stCSPR Balance', 'Data Source'];

      if (!isWalletConnected) {
        return '# Please connect your wallet to export portfolio data';
      }

      const rows = [[
        new Date().toISOString().split('T')[0],
        csprBalance.toFixed(4),
        stCsprBalance.toFixed(4),
        isRealBalance ? 'Blockchain' : 'Local',
      ]];

      const csvHeaders = headers.join(',');
      const csvRows = rows.map(row => row.join(',')).join('\n');
      return `# Wallet: ${activeAccount?.publicKey}\n# Export Date: ${new Date().toISOString()}\n${csvHeaders}\n${csvRows}`;
    }

    // REWARDS - Estimated based on staking
    if (selectedType === 'rewards') {
      const headers = ['Date', 'Estimated Daily Reward (CSPR)', 'APY (%)', 'Staked Amount (stCSPR)'];

      if (!isWalletConnected || stCsprBalance === 0) {
        return '# Please connect your wallet and have staked CSPR to see rewards';
      }

      // Calculate estimated rewards based on 17% APY
      const apy = 0.17;
      const dailyRate = apy / 365;
      const dailyReward = stCsprBalance * dailyRate;

      const rows = [[
        new Date().toISOString().split('T')[0],
        dailyReward.toFixed(6),
        '17.0',
        stCsprBalance.toFixed(4),
      ]];

      const csvHeaders = headers.join(',');
      const csvRows = rows.map(row => row.join(',')).join('\n');
      return `# Wallet: ${activeAccount?.publicKey}\n# Note: Rewards are estimated based on 17% APY\n${csvHeaders}\n${csvRows}`;
    }

    return '# Unknown export type';
  };

  const handleExport = async () => {
    setIsExporting(true);
    setShowSuccess(false);

    // Simulate export delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const filename = `stakevue_${selectedType}_${new Date().toISOString().split('T')[0]}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExporting(false);
    setShowSuccess(true);

    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <Container $isDark={isDark}>
      <Header>
        <Title $isDark={isDark}>
          📥 Export Data
        </Title>
      </Header>

      <Description $isDark={isDark}>
        {isWalletConnected ? (
          <>Export your real staking data. Wallet: <strong>{activeAccount?.publicKey?.slice(0, 8)}...{activeAccount?.publicKey?.slice(-6)}</strong></>
        ) : (
          <>Connect your wallet to export real transaction data, or export price history without wallet.</>
        )}
      </Description>

      <OptionsGrid>
        {exportOptions.map(option => (
          <OptionCard
            key={option.type}
            $isDark={isDark}
            $isSelected={selectedType === option.type}
            onClick={() => setSelectedType(option.type)}
          >
            <OptionIcon>{option.icon}</OptionIcon>
            <OptionTitle $isDark={isDark}>{option.title}</OptionTitle>
            <OptionDesc $isDark={isDark}>{option.desc}</OptionDesc>
          </OptionCard>
        ))}
      </OptionsGrid>

      {selectedType === 'price_history' && (
        <DateRange>
          <DateInput $isDark={isDark}>
            <label>Time Period</label>
            <select
              value={selectedDays}
              onChange={(e) => setSelectedDays(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                color: isDark ? '#fff' : '#1a1a2e',
                fontSize: '0.9rem',
              }}
            >
              {daysOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </DateInput>
          <DateInput $isDark={isDark}>
            <label>Data Points</label>
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              background: isDark ? 'rgba(48, 209, 88, 0.1)' : 'rgba(48, 209, 88, 0.1)',
              color: '#30d158',
              fontWeight: 600,
            }}>
              {priceHistory.length} entries
            </div>
          </DateInput>
        </DateRange>
      )}

      <ExportButton
        $isDark={isDark}
        onClick={handleExport}
        disabled={isExporting}
      >
        {isExporting ? (
          <>⏳ Generating...</>
        ) : (
          <>📥 Download CSV</>
        )}
      </ExportButton>

      {showSuccess && (
        <SuccessMessage>
          ✅ Export complete! Check your downloads folder.
        </SuccessMessage>
      )}
    </Container>
  );
};

export default ExportCSV;
