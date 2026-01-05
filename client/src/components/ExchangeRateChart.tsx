import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { useContractData } from '../hooks/useContractData';

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

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
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
`;

const TitleSection = styled.div``;

const Title = styled.h3<{ $isDark: boolean }>`
  margin: 0 0 4px 0;
  font-size: 1.25rem;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LiveBadge = styled.span<{ $isLive?: boolean }>`
  background: ${props => props.$isLive
    ? 'linear-gradient(135deg, #30d158, #28a745)'
    : 'linear-gradient(135deg, #ff9f0a, #ffaa00)'};
  color: ${props => props.$isLive ? 'white' : '#1a1a2e'};
  font-size: 0.65rem;
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: 600;
  animation: ${pulse} 2s infinite;
`;

const RateValue = styled.div<{ $isDark: boolean }>`
  font-size: 2rem;
  font-weight: 700;
  color: #30d158;
`;

const RateChange = styled.span<{ $positive: boolean }>`
  font-size: 0.9rem;
  color: ${props => props.$positive ? '#30d158' : '#ff3b30'};
  margin-left: 8px;
`;

const RateSubtext = styled.div<{ $isDark: boolean }>`
  font-size: 0.85rem;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'};
  margin-top: 4px;
`;

const TimeFilters = styled.div`
  display: flex;
  gap: 6px;
`;

const TimeButton = styled.button<{ $isDark: boolean; $isActive: boolean }>`
  background: ${props => props.$isActive
    ? 'linear-gradient(135deg, #5856d6, #af52de)'
    : props.$isDark
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.03)'};
  color: ${props => props.$isActive
    ? '#fff'
    : props.$isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'};
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$isActive
      ? 'linear-gradient(135deg, #5856d6, #af52de)'
      : props.$isDark
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.06)'};
  }
`;

const ChartContainer = styled.div`
  position: relative;
  height: 220px;
  margin-top: 20px;
`;

const SVGChart = styled.svg`
  width: 100%;
  height: 100%;
`;

const StatsRow = styled.div<{ $isDark: boolean }>`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const StatItem = styled.div<{ $isDark: boolean }>`
  text-align: center;
`;

const StatLabel = styled.div<{ $isDark: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  margin-bottom: 4px;
  text-transform: uppercase;
`;

const StatValue = styled.div<{ $isDark: boolean; $highlight?: boolean }>`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => props.$highlight ? '#30d158' : (props.$isDark ? '#fff' : '#1a1a2e')};
`;

const InfoText = styled.div<{ $isDark: boolean }>`
  font-size: 0.8rem;
  color: ${props => props.$isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'};
  margin-top: 16px;
  text-align: center;
  line-height: 1.5;
`;

interface ExchangeRateChartProps {
  isDark: boolean;
}

type TimeRange = '24h' | '7d' | '30d' | '90d' | '1y';

interface DataPoint {
  timestamp: Date;
  rate: number;
}

const STORAGE_KEY = 'stakevue_exchange_rate_history';

export const ExchangeRateChart: React.FC<ExchangeRateChartProps> = ({ isDark }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [data, setData] = useState<DataPoint[]>([]);
  const { exchangeRate, isLive } = useContractData();

  // Load historical data from localStorage and generate simulated history
  useEffect(() => {
    // Try to load existing history
    const stored = localStorage.getItem(STORAGE_KEY);
    let history: DataPoint[] = [];

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        history = parsed.map((p: any) => ({
          timestamp: new Date(p.timestamp),
          rate: p.rate
        }));
      } catch (e) {
        console.error('Failed to parse rate history');
      }
    }

    // Add current rate to history if it's different from the last one
    if (exchangeRate > 0) {
      const lastRate = history.length > 0 ? history[history.length - 1].rate : 0;
      if (Math.abs(exchangeRate - lastRate) > 0.0001 || history.length === 0) {
        history.push({
          timestamp: new Date(),
          rate: exchangeRate
        });

        // Keep only last 365 entries
        if (history.length > 365) {
          history = history.slice(-365);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      }
    }

    setData(history);
  }, [exchangeRate]);

  // Generate chart data based on time range
  const chartData = useMemo(() => {
    if (data.length === 0 && exchangeRate > 0) {
      // Generate simulated historical data if we don't have real data
      const points: DataPoint[] = [];
      const now = new Date();
      let numPoints: number;
      let interval: number;

      switch (timeRange) {
        case '24h':
          numPoints = 24;
          interval = 60 * 60 * 1000; // 1 hour
          break;
        case '7d':
          numPoints = 28;
          interval = 6 * 60 * 60 * 1000; // 6 hours
          break;
        case '30d':
          numPoints = 30;
          interval = 24 * 60 * 60 * 1000; // 1 day
          break;
        case '90d':
          numPoints = 90;
          interval = 24 * 60 * 60 * 1000; // 1 day
          break;
        case '1y':
          numPoints = 52;
          interval = 7 * 24 * 60 * 60 * 1000; // 1 week
          break;
        default:
          numPoints = 30;
          interval = 24 * 60 * 60 * 1000;
      }

      // Start from a lower rate and grow to current
      const startRate = 1.0;
      const rateGrowth = (exchangeRate - startRate) / numPoints;

      for (let i = numPoints - 1; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * interval);
        // Add some realistic fluctuation
        const baseRate = startRate + rateGrowth * (numPoints - i);
        const fluctuation = (Math.random() - 0.5) * 0.002;
        const rate = Math.max(1.0, baseRate + fluctuation);
        points.push({ timestamp, rate });
      }

      // Last point is the actual current rate
      points[points.length - 1].rate = exchangeRate;

      return points;
    }

    // Filter real data based on time range
    const now = new Date();
    let cutoff: Date;

    switch (timeRange) {
      case '24h':
        cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return data.filter(d => d.timestamp >= cutoff);
  }, [data, timeRange, exchangeRate]);

  // Chart dimensions - shared across calculations
  const chartDimensions = useMemo(() => {
    const width = 400;
    const height = 200;
    const padding = { top: 15, right: 15, bottom: 35, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const rates = chartData.length > 0 ? chartData.map(d => d.rate) : [1, exchangeRate];
    const minRate = Math.min(...rates) * 0.999;
    const maxRate = Math.max(...rates) * 1.001;

    return { width, height, padding, chartWidth, chartHeight, minRate, maxRate };
  }, [chartData, exchangeRate]);

  const chartPath = useMemo(() => {
    if (chartData.length === 0) return '';

    const { padding, chartWidth, chartHeight, minRate, maxRate } = chartDimensions;

    const xScale = (i: number) => padding.left + (i / (chartData.length - 1)) * chartWidth;
    const yScale = (rate: number) => padding.top + chartHeight - ((rate - minRate) / (maxRate - minRate)) * chartHeight;

    let path = `M ${xScale(0)} ${yScale(chartData[0].rate)}`;
    for (let i = 1; i < chartData.length; i++) {
      const x = xScale(i);
      const y = yScale(chartData[i].rate);
      path += ` L ${x} ${y}`;
    }

    return path;
  }, [chartData, chartDimensions]);

  const areaPath = useMemo(() => {
    if (!chartPath) return '';
    const { padding, chartWidth, chartHeight } = chartDimensions;

    return `${chartPath} L ${padding.left + chartWidth} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;
  }, [chartPath, chartDimensions]);

  // Y-axis labels (rate values)
  const yAxisLabels = useMemo(() => {
    const { padding, chartHeight, minRate, maxRate } = chartDimensions;
    const numLabels = 5;
    const labels = [];

    for (let i = 0; i < numLabels; i++) {
      const rate = minRate + ((maxRate - minRate) * (numLabels - 1 - i)) / (numLabels - 1);
      const y = padding.top + (i / (numLabels - 1)) * chartHeight;
      labels.push({ rate, y });
    }

    return labels;
  }, [chartDimensions]);

  // X-axis labels (dates)
  const xAxisLabels = useMemo(() => {
    if (chartData.length === 0) return [];

    const { padding, chartWidth, chartHeight } = chartDimensions;
    const numLabels = Math.min(5, chartData.length);
    const labels = [];

    for (let i = 0; i < numLabels; i++) {
      const dataIndex = Math.floor((i / (numLabels - 1)) * (chartData.length - 1));
      const x = padding.left + (dataIndex / (chartData.length - 1)) * chartWidth;
      const date = chartData[dataIndex].timestamp;

      let label: string;
      if (timeRange === '24h') {
        label = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      } else if (timeRange === '7d') {
        label = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
      } else {
        label = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      }

      labels.push({ label, x, y: padding.top + chartHeight + 20 });
    }

    return labels;
  }, [chartData, chartDimensions, timeRange]);

  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return { startRate: 1, currentRate: exchangeRate, growth: 0, growthPercent: 0 };
    }

    const startRate = chartData[0].rate;
    const currentRate = chartData[chartData.length - 1].rate;
    const growth = currentRate - startRate;
    const growthPercent = ((currentRate - startRate) / startRate) * 100;

    return { startRate, currentRate, growth, growthPercent };
  }, [chartData, exchangeRate]);

  return (
    <Container $isDark={isDark}>
      <Header>
        <TitleSection>
          <Title $isDark={isDark}>
            Exchange Rate
            <LiveBadge $isLive={isLive}>{isLive ? 'LIVE' : 'DEMO'}</LiveBadge>
          </Title>
          <RateValue $isDark={isDark}>
            {exchangeRate.toFixed(4)}
            {stats.growthPercent > 0 && (
              <RateChange $positive={stats.growthPercent > 0}>
                +{stats.growthPercent.toFixed(2)}%
              </RateChange>
            )}
          </RateValue>
          <RateSubtext $isDark={isDark}>
            1 stCSPR = {exchangeRate.toFixed(4)} CSPR
          </RateSubtext>
        </TitleSection>

        <TimeFilters>
          {(['24h', '7d', '30d', '90d', '1y'] as TimeRange[]).map(range => (
            <TimeButton
              key={range}
              $isDark={isDark}
              $isActive={timeRange === range}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </TimeButton>
          ))}
        </TimeFilters>
      </Header>

      <ChartContainer>
        <SVGChart viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="rateGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#30d158" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#30d158" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Y-axis labels */}
          {yAxisLabels.map((item, i) => (
            <g key={`y-${i}`}>
              <text
                x={chartDimensions.padding.left - 8}
                y={item.y + 4}
                textAnchor="end"
                fill={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
                fontSize="10"
                fontFamily="sans-serif"
              >
                {item.rate.toFixed(3)}
              </text>
              {/* Horizontal grid line */}
              <line
                x1={chartDimensions.padding.left}
                y1={item.y}
                x2={chartDimensions.padding.left + chartDimensions.chartWidth}
                y2={item.y}
                stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                strokeDasharray="4,4"
              />
            </g>
          ))}

          {/* X-axis labels */}
          {xAxisLabels.map((item, i) => (
            <text
              key={`x-${i}`}
              x={item.x}
              y={item.y}
              textAnchor="middle"
              fill={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
              fontSize="9"
              fontFamily="sans-serif"
            >
              {item.label}
            </text>
          ))}

          {/* Area fill */}
          <path
            d={areaPath}
            fill="url(#rateGradient)"
          />

          {/* Line */}
          <path
            d={chartPath}
            fill="none"
            stroke="#30d158"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Current value dot */}
          {chartData.length > 0 && (
            <circle
              cx={chartDimensions.padding.left + chartDimensions.chartWidth}
              cy={chartDimensions.padding.top + chartDimensions.chartHeight - ((stats.currentRate - chartDimensions.minRate) / (chartDimensions.maxRate - chartDimensions.minRate)) * chartDimensions.chartHeight}
              r="5"
              fill="#30d158"
              stroke="#fff"
              strokeWidth="2"
            />
          )}
        </SVGChart>
      </ChartContainer>

      <StatsRow $isDark={isDark}>
        <StatItem $isDark={isDark}>
          <StatLabel $isDark={isDark}>Start Rate</StatLabel>
          <StatValue $isDark={isDark}>{stats.startRate.toFixed(4)}</StatValue>
        </StatItem>
        <StatItem $isDark={isDark}>
          <StatLabel $isDark={isDark}>Current Rate</StatLabel>
          <StatValue $isDark={isDark} $highlight>{stats.currentRate.toFixed(4)}</StatValue>
        </StatItem>
        <StatItem $isDark={isDark}>
          <StatLabel $isDark={isDark}>Growth</StatLabel>
          <StatValue $isDark={isDark} $highlight>+{stats.growth.toFixed(4)}</StatValue>
        </StatItem>
      </StatsRow>

      <InfoText $isDark={isDark}>
        The exchange rate increases as staking rewards are added to the pool.
        Your stCSPR tokens automatically appreciate in value over time.
      </InfoText>
    </Container>
  );
};

export default ExchangeRateChart;
