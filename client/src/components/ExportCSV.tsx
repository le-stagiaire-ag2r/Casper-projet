import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.02)'};
  border-radius: 16px;
  padding: 24px;
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
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

type ExportType = 'transactions' | 'rewards' | 'portfolio' | 'all';

export const ExportCSV: React.FC<ExportCSVProps> = ({ isDark }) => {
  const [selectedType, setSelectedType] = useState<ExportType>('rewards');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const exportOptions = [
    { type: 'transactions' as ExportType, icon: '📋', title: 'Transactions', desc: 'All stake/unstake transactions' },
    { type: 'rewards' as ExportType, icon: '💰', title: 'Rewards', desc: 'Staking rewards history' },
    { type: 'portfolio' as ExportType, icon: '📊', title: 'Portfolio', desc: 'Balance snapshots over time' },
    { type: 'all' as ExportType, icon: '📦', title: 'Complete Export', desc: 'All data combined' },
  ];

  const generateCSV = () => {
    // Generate mock data based on selected type
    const headers = {
      transactions: ['Date', 'Type', 'Amount (CSPR)', 'stCSPR', 'TX Hash', 'Status'],
      rewards: ['Date', 'Reward (CSPR)', 'APY (%)', 'Staked Amount', 'Cumulative'],
      portfolio: ['Date', 'CSPR Balance', 'stCSPR Balance', 'Total Value (USD)', 'CSPR Price'],
      all: ['Date', 'Type', 'CSPR', 'stCSPR', 'USD Value', 'Details'],
    };

    const mockData = {
      transactions: [
        ['2025-12-01', 'Stake', '1000', '1000', '0x1a2b...3c4d', 'Confirmed'],
        ['2025-12-02', 'Stake', '500', '500', '0x2b3c...4d5e', 'Confirmed'],
        ['2025-12-03', 'Unstake', '200', '200', '0x3c4d...5e6f', 'Confirmed'],
        ['2025-12-04', 'Stake', '750', '750', '0x4d5e...6f7a', 'Confirmed'],
        ['2025-12-05', 'Reward', '14.2', '0', 'Auto-compound', 'Applied'],
      ],
      rewards: [
        ['2025-12-01', '4.52', '17.2', '1000', '4.52'],
        ['2025-12-02', '6.78', '17.1', '1500', '11.30'],
        ['2025-12-03', '5.43', '17.0', '1300', '16.73'],
        ['2025-12-04', '8.67', '17.3', '2050', '25.40'],
        ['2025-12-05', '8.75', '17.2', '2050', '34.15'],
      ],
      portfolio: [
        ['2025-12-01', '5000', '1000', '180.00', '0.030'],
        ['2025-12-02', '4500', '1500', '180.00', '0.030'],
        ['2025-12-03', '4700', '1300', '183.60', '0.031'],
        ['2025-12-04', '3950', '2050', '186.00', '0.031'],
        ['2025-12-05', '3950', '2064', '189.44', '0.032'],
      ],
      all: [
        ['2025-12-01', 'Stake', '1000', '1000', '$30.00', 'Initial stake'],
        ['2025-12-02', 'Stake', '500', '500', '$15.00', 'Additional stake'],
        ['2025-12-03', 'Unstake', '200', '200', '$6.20', 'Partial withdrawal'],
        ['2025-12-04', 'Stake', '750', '750', '$23.25', 'Re-stake'],
        ['2025-12-05', 'Reward', '14.2', '0', '$0.45', 'Daily reward'],
      ],
    };

    const csvHeaders = headers[selectedType].join(',');
    const csvRows = mockData[selectedType].map(row => row.join(',')).join('\n');
    const csvContent = `${csvHeaders}\n${csvRows}`;

    return csvContent;
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
        Export your staking data for tax reporting, portfolio tracking, or personal records.
        Choose a data type and download as CSV.
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

      <DateRange>
        <DateInput $isDark={isDark}>
          <label>Start Date (optional)</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </DateInput>
        <DateInput $isDark={isDark}>
          <label>End Date (optional)</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </DateInput>
      </DateRange>

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
