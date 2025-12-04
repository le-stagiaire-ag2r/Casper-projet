import React, { useMemo } from 'react';
import styled from 'styled-components';

const ChartContainer = styled.div<{ $isDark: boolean }>`
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

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ChartTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
`;

const ChartSubtitle = styled.span<{ $isDark: boolean }>`
  font-size: 12px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
`;

const SVGContainer = styled.div`
  width: 100%;
  height: 200px;
  position: relative;
`;

const ChartSVG = styled.svg`
  width: 100%;
  height: 100%;
`;

const GridLine = styled.line<{ $isDark: boolean }>`
  stroke: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
  stroke-width: 1;
`;

const ChartPath = styled.path`
  fill: none;
  stroke: url(#gradient);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
`;

const AreaPath = styled.path`
  fill: url(#areaGradient);
  opacity: 0.3;
`;

const DataPoint = styled.circle`
  fill: #5856d6;
  stroke: #fff;
  stroke-width: 2;
  cursor: pointer;
  transition: r 0.2s ease;

  &:hover {
    r: 8;
  }
`;

const XLabel = styled.text<{ $isDark: boolean }>`
  fill: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(0, 0, 0, 0.6)'};
  font-size: 12px;
  font-weight: 500;
  text-anchor: middle;
`;

const YLabel = styled.text<{ $isDark: boolean }>`
  fill: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(0, 0, 0, 0.6)'};
  font-size: 11px;
  font-weight: 500;
  text-anchor: end;
`;

const TotalRewards = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

const TotalValue = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: #30d158;
`;

const TotalLabel = styled.span<{ $isDark: boolean }>`
  font-size: 14px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(0, 0, 0, 0.6)'};
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

const LegendDot = styled.div<{ color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.color};
`;

interface RewardsChartProps {
  isDark: boolean;
  stakedAmount: number;
  apy?: number;
}

/**
 * Rewards evolution chart showing projected staking rewards over 12 months
 */
export const RewardsChart: React.FC<RewardsChartProps> = ({
  isDark,
  stakedAmount,
  apy = 0.10,
}) => {
  // Generate projected rewards data for 12 months
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const data: { month: string; rewards: number; cumulative: number }[] = [];

    let cumulative = 0;
    const monthlyRate = apy / 12;

    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentMonth + i) % 12;
      const monthlyReward = stakedAmount * monthlyRate;
      cumulative += monthlyReward;

      data.push({
        month: months[monthIndex],
        rewards: monthlyReward,
        cumulative: cumulative,
      });
    }

    return data;
  }, [stakedAmount, apy]);

  // Calculate chart dimensions - use larger viewBox for better text rendering
  const viewBoxWidth = 400;
  const viewBoxHeight = 200;
  const padding = { top: 20, right: 20, bottom: 35, left: 45 };
  const chartWidth = viewBoxWidth - padding.left - padding.right;
  const chartHeight = viewBoxHeight - padding.top - padding.bottom;

  // Calculate scales
  const maxValue = Math.max(...chartData.map(d => d.cumulative), 1);
  const xStep = chartWidth / (chartData.length - 1);

  // Generate path
  const points = chartData.map((d, i) => {
    const x = padding.left + i * xStep;
    const y = padding.top + chartHeight - (d.cumulative / maxValue) * chartHeight;
    return { x, y, data: d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  const totalRewards = chartData[chartData.length - 1]?.cumulative || 0;

  if (stakedAmount <= 0) {
    return (
      <ChartContainer $isDark={isDark}>
        <ChartHeader>
          <ChartTitle $isDark={isDark}>
            📈 Rewards Projection
          </ChartTitle>
        </ChartHeader>
        <SVGContainer>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
            fontSize: '14px',
          }}>
            Stake CSPR to see projected rewards
          </div>
        </SVGContainer>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer $isDark={isDark}>
      <ChartHeader>
        <div>
          <ChartTitle $isDark={isDark}>
            📈 Rewards Projection
          </ChartTitle>
          <ChartSubtitle $isDark={isDark}>
            Based on {(apy * 100).toFixed(0)}% APY over 12 months
          </ChartSubtitle>
        </div>
        <TotalRewards $isDark={isDark}>
          <TotalValue>+{totalRewards.toFixed(2)}</TotalValue>
          <TotalLabel $isDark={isDark}>CSPR/year</TotalLabel>
        </TotalRewards>
      </ChartHeader>

      <SVGContainer>
        <ChartSVG viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="rewardsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff2d55" />
              <stop offset="100%" stopColor="#5856d6" />
            </linearGradient>
            <linearGradient id="rewardsAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5856d6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#5856d6" stopOpacity="0" />
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

          {/* Area under curve */}
          <AreaPath d={areaPath} style={{ fill: 'url(#rewardsAreaGradient)' }} />

          {/* Line */}
          <ChartPath d={linePath} style={{ stroke: 'url(#rewardsGradient)' }} />

          {/* Data points */}
          {points.map((p, i) => (
            <DataPoint
              key={i}
              cx={p.x}
              cy={p.y}
              r={6}
            />
          ))}

          {/* X-axis labels - show every other month */}
          {points.filter((_, i) => i % 2 === 0).map((p, i) => (
            <XLabel
              key={i}
              $isDark={isDark}
              x={p.x}
              y={viewBoxHeight - 8}
            >
              {p.data.month}
            </XLabel>
          ))}

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
          <LegendDot color="#5856d6" />
          Cumulative Rewards
        </LegendItem>
        <LegendItem $isDark={isDark}>
          <LegendDot color="#30d158" />
          ~{(stakedAmount * apy / 12).toFixed(2)} CSPR/month
        </LegendItem>
      </Legend>
    </ChartContainer>
  );
};

export default RewardsChart;
