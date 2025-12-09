import React, { useMemo, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useBalanceContext } from '../context/BalanceContext';
import { useCsprPrice } from '../hooks/useBalance';

const Container = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.03)'
    : 'rgba(255, 255, 255, 0.8)'};
  border-radius: 20px;
  padding: 24px;
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.08)'};
  backdrop-filter: blur(20px);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h3<{ $isDark: boolean }>`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
`;

const TotalValue = styled.div`
  text-align: right;
`;

const BalanceRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-bottom: 4px;
`;

const BalanceItem = styled.div<{ $isDark: boolean; $highlight?: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.$highlight ? '#30d158' : (props.$isDark ? '#fff' : '#1a1a2e')};
`;

const BalanceLabel = styled.span<{ $isDark: boolean }>`
  font-size: 11px;
  color: ${props => props.$isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
  margin-right: 4px;
`;

const TotalUsdValue = styled.div<{ $isDark: boolean }>`
  font-size: 12px;
  color: ${props => props.$isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'};
`;

const SVGContainer = styled.div`
  width: 100%;
  height: 180px;
  position: relative;
`;

const ChartSVG = styled.svg`
  width: 100%;
  height: 100%;
`;

const GridLine = styled.line<{ $isDark: boolean }>`
  stroke: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.08)'};
  stroke-width: 1;
`;

const ChartPath = styled.path`
  fill: none;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
`;

const AreaPath = styled.path`
  opacity: 0.2;
`;

const XLabel = styled.text<{ $isDark: boolean }>`
  fill: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  font-size: 11px;
  text-anchor: middle;
`;

const YLabel = styled.text<{ $isDark: boolean }>`
  fill: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  font-size: 10px;
  text-anchor: end;
`;

const Legend = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
`;

const LegendItem = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.7)'
    : 'rgba(0, 0, 0, 0.7)'};
`;

const LegendLine = styled.div<{ color: string }>`
  width: 20px;
  height: 3px;
  background: ${props => props.color};
  border-radius: 2px;
`;

const HISTORY_STORAGE_KEY = 'stakevue_portfolio_history';

interface HistoryPoint {
  timestamp: string;
  csprBalance: number;
  stCsprBalance: number;
  totalUsd: number;
}

interface PortfolioHistoryProps {
  isDark: boolean;
}

export const PortfolioHistory: React.FC<PortfolioHistoryProps> = ({ isDark }) => {
  const { csprBalance, stCsprBalance } = useBalanceContext();
  const { usdPrice } = useCsprPrice();
  const [history, setHistory] = useState<HistoryPoint[]>([]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }, []);

  // Save current state to history every time balances change significantly
  useEffect(() => {
    if (csprBalance <= 0 && stCsprBalance <= 0) return;
    if (usdPrice <= 0) return;

    const totalUsd = (csprBalance + stCsprBalance) * usdPrice;
    const now = new Date();

    // Only add new point if it's been more than 5 minutes since last point
    // or if it's the first point
    const lastPoint = history[history.length - 1];
    if (lastPoint) {
      const lastTime = new Date(lastPoint.timestamp);
      const diffMinutes = (now.getTime() - lastTime.getTime()) / 60000;
      if (diffMinutes < 5) return;
    }

    const newPoint: HistoryPoint = {
      timestamp: now.toISOString(),
      csprBalance,
      stCsprBalance,
      totalUsd
    };

    const newHistory = [...history, newPoint].slice(-50); // Keep last 50 points
    setHistory(newHistory);

    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
    } catch {
      // Ignore
    }
  }, [csprBalance, stCsprBalance, usdPrice, history]);

  // Generate demo data if no history exists
  const chartData = useMemo(() => {
    if (history.length >= 2) {
      return history.map(h => ({
        date: new Date(h.timestamp),
        cspr: h.csprBalance,
        stCspr: h.stCsprBalance
      }));
    }

    // Generate demo data for last 7 days
    const data = [];
    const baseCSPR = csprBalance || 1000;
    const baseStCSPR = stCsprBalance || 0;

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Simulate some variation
      const variation = 1 + (Math.random() - 0.5) * 0.1;
      const csprVal = i === 0 ? baseCSPR : baseCSPR * variation;
      const stCsprVal = i === 0 ? baseStCSPR : Math.max(0, baseStCSPR - i * 2);

      data.push({
        date,
        cspr: csprVal,
        stCspr: stCsprVal
      });
    }

    return data;
  }, [history, csprBalance, stCsprBalance]);

  // Chart dimensions
  const viewBoxWidth = 400;
  const viewBoxHeight = 180;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const chartWidth = viewBoxWidth - padding.left - padding.right;
  const chartHeight = viewBoxHeight - padding.top - padding.bottom;

  // Calculate scales - use max of individual values, not combined total
  const maxValue = Math.max(...chartData.map(d => Math.max(d.cspr, d.stCspr)), 1);
  const xStep = chartWidth / Math.max(chartData.length - 1, 1);

  // Generate paths for CSPR and stCSPR (separate, not combined!)
  const csprPoints = chartData.map((d, i) => ({
    x: padding.left + i * xStep,
    y: padding.top + chartHeight - (d.cspr / maxValue) * chartHeight
  }));

  const stCsprPoints = chartData.map((d, i) => ({
    x: padding.left + i * xStep,
    y: padding.top + chartHeight - (d.stCspr / maxValue) * chartHeight
  }));

  const createPath = (points: { x: number; y: number }[]) =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const createAreaPath = (points: { x: number; y: number }[]) => {
    const line = createPath(points);
    return `${line} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;
  };

  // Calculate USD values (separate, not combined as CSPR!)
  const csprUsd = csprBalance * usdPrice;
  const stCsprUsd = stCsprBalance * usdPrice;
  const totalUsd = csprUsd + stCsprUsd;

  // Format date labels
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Container $isDark={isDark}>
      <Header>
        <Title $isDark={isDark}>
          <span>📊</span> Portfolio History
        </Title>
        <TotalValue>
          <BalanceRow>
            <BalanceItem $isDark={isDark}>
              <BalanceLabel $isDark={isDark}>CSPR</BalanceLabel>
              {csprBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </BalanceItem>
            {stCsprBalance > 0 && (
              <BalanceItem $isDark={isDark} $highlight>
                <BalanceLabel $isDark={isDark}>stCSPR</BalanceLabel>
                {stCsprBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </BalanceItem>
            )}
          </BalanceRow>
          <TotalUsdValue $isDark={isDark}>
            Total: ${totalUsd.toFixed(2)} USD
          </TotalUsdValue>
        </TotalValue>
      </Header>

      <SVGContainer>
        <ChartSVG viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="csprAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff9f0a" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ff9f0a" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <GridLine
              key={i}
              $isDark={isDark}
              x1={padding.left}
              y1={padding.top + chartHeight * (1 - ratio)}
              x2={viewBoxWidth - padding.right}
              y2={padding.top + chartHeight * (1 - ratio)}
            />
          ))}

          {/* Area fills for CSPR */}
          <AreaPath d={createAreaPath(csprPoints)} fill="url(#csprAreaGradient)" />

          {/* Lines - separate for each token */}
          <ChartPath d={createPath(csprPoints)} stroke="#ff9f0a" />
          <ChartPath d={createPath(stCsprPoints)} stroke="#30d158" />

          {/* Data points for CSPR */}
          {csprPoints.map((p, i) => (
            <circle
              key={`cspr-${i}`}
              cx={p.x}
              cy={p.y}
              r={3}
              fill="#ff9f0a"
              stroke="#fff"
              strokeWidth={1.5}
            />
          ))}

          {/* Data points for stCSPR */}
          {stCsprPoints.map((p, i) => (
            <circle
              key={`stcspr-${i}`}
              cx={p.x}
              cy={p.y}
              r={3}
              fill="#30d158"
              stroke="#fff"
              strokeWidth={1.5}
            />
          ))}

          {/* X-axis labels */}
          {chartData.filter((_, i) => i % Math.ceil(chartData.length / 4) === 0 || i === chartData.length - 1).map((d, i, arr) => {
            const idx = chartData.indexOf(d);
            return (
              <XLabel
                key={i}
                $isDark={isDark}
                x={padding.left + idx * xStep}
                y={viewBoxHeight - 8}
              >
                {formatDate(d.date)}
              </XLabel>
            );
          })}

          {/* Y-axis labels */}
          {[0, 0.5, 1].map((ratio, i) => (
            <YLabel
              key={i}
              $isDark={isDark}
              x={padding.left - 8}
              y={padding.top + chartHeight * (1 - ratio) + 4}
            >
              {(maxValue * ratio).toFixed(0)}
            </YLabel>
          ))}
        </ChartSVG>
      </SVGContainer>

      <Legend>
        <LegendItem $isDark={isDark}>
          <LegendLine color="#ff9f0a" />
          CSPR (wallet)
        </LegendItem>
        <LegendItem $isDark={isDark}>
          <LegendLine color="#30d158" />
          stCSPR (staked)
        </LegendItem>
      </Legend>
    </Container>
  );
};

export default PortfolioHistory;
