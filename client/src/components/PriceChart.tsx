import React, { useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { useCsprPriceHistory, useCsprPrice } from '../hooks/useBalance';

const TIMEFRAMES = [
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '1Y', days: 365 },
  { label: 'ALL', days: 0 }, // 0 means "max" (all time since CSPR creation)
];

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

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
  align-items: flex-start;
  margin-bottom: 20px;
`;

const TitleSection = styled.div``;

const Title = styled.h3<{ $isDark: boolean }>`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 4px 0;
`;

const Subtitle = styled.span<{ $isDark: boolean }>`
  font-size: 12px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
`;

const TimeframeButtons = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 8px;
`;

const TimeframeButton = styled.button<{ $isDark: boolean; $active: boolean }>`
  padding: 6px 12px;
  border-radius: 8px;
  border: none;
  background: ${props => props.$active
    ? 'linear-gradient(135deg, #5856d6, #af52de)'
    : props.$isDark
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.05)'};
  color: ${props => props.$active
    ? '#fff'
    : props.$isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active
      ? 'linear-gradient(135deg, #5856d6, #af52de)'
      : props.$isDark
        ? 'rgba(255, 255, 255, 0.12)'
        : 'rgba(0, 0, 0, 0.08)'};
  }
`;

const PriceSection = styled.div`
  text-align: right;
`;

const CurrentPrice = styled.div<{ $isDark: boolean }>`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
`;

const PriceChange = styled.div<{ $positive: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.$positive ? '#30d158' : '#ff453a'};
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 150px;
  position: relative;
`;

const ChartSVG = styled.svg`
  width: 100%;
  height: 100%;
  overflow: visible;
`;

const ChartPath = styled.path<{ $positive: boolean }>`
  fill: none;
  stroke: ${props => props.$positive ? '#30d158' : '#ff453a'};
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
`;

const AreaPath = styled.path<{ $positive: boolean }>`
  fill: url(#priceGradient);
  opacity: 0.3;
`;

const GridLine = styled.line<{ $isDark: boolean }>`
  stroke: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.08)'};
  stroke-width: 1;
  stroke-dasharray: 4 4;
`;

const DataPoint = styled.circle<{ $positive: boolean }>`
  fill: ${props => props.$positive ? '#30d158' : '#ff453a'};
  stroke: #fff;
  stroke-width: 2;
  opacity: 0;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

const XLabel = styled.text<{ $isDark: boolean }>`
  fill: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  font-size: 10px;
  text-anchor: middle;
`;

const YLabel = styled.text<{ $isDark: boolean }>`
  fill: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  font-size: 10px;
  text-anchor: end;
`;

const StatsRow = styled.div<{ $isDark: boolean }>`
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.08)'};
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatLabel = styled.div<{ $isDark: boolean }>`
  font-size: 11px;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.div<{ $isDark: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
`;

const LoadingContainer = styled.div<{ $isDark: boolean }>`
  height: 150px;
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.03)'};
  border-radius: 12px;
  background-image: linear-gradient(
    90deg,
    transparent,
    ${props => props.$isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'},
    transparent
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

const ErrorMessage = styled.div<{ $isDark: boolean }>`
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)'};
  font-size: 14px;
`;

const Tooltip = styled.div<{ $isDark: boolean; $x: number; $y: number; $visible: boolean }>`
  position: absolute;
  left: ${props => props.$x}px;
  top: ${props => props.$y}px;
  transform: translate(-50%, -120%);
  background: ${props => props.$isDark ? 'rgba(30, 30, 40, 0.95)' : 'rgba(255, 255, 255, 0.98)'};
  border: 1px solid ${props => props.$isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'};
  border-radius: 10px;
  padding: 10px 14px;
  pointer-events: none;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.15s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  z-index: 100;
  white-space: nowrap;
`;

const TooltipDate = styled.div<{ $isDark: boolean }>`
  font-size: 11px;
  color: ${props => props.$isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)'};
  margin-bottom: 4px;
`;

const TooltipPrice = styled.div<{ $isDark: boolean }>`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#fff' : '#1a1a2e'};
`;

const HoverLine = styled.line<{ $isDark: boolean }>`
  stroke: ${props => props.$isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'};
  stroke-width: 1;
  stroke-dasharray: 3 3;
`;

const HoverDot = styled.circle<{ $positive: boolean }>`
  fill: ${props => props.$positive ? '#30d158' : '#ff453a'};
  stroke: #fff;
  stroke-width: 2;
`;

interface PriceChartProps {
  isDark: boolean;
}

export const PriceChart: React.FC<PriceChartProps> = ({ isDark }) => {
  const [selectedDays, setSelectedDays] = useState(7);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; price: number; date: string } | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const { prices, minPrice, maxPrice, priceChangePercent, isLoading, error } = useCsprPriceHistory(selectedDays);
  const { usdPrice } = useCsprPrice();

  const isPositive = priceChangePercent >= 0;
  const selectedTimeframe = TIMEFRAMES.find(t => t.days === selectedDays) || TIMEFRAMES[0];

  // Chart dimensions - using fixed viewBox for consistent scaling
  const viewBoxWidth = 400;
  const viewBoxHeight = 150;
  const padding = { top: 15, right: 15, bottom: 30, left: 55 };
  const chartWidth = viewBoxWidth - padding.left - padding.right;
  const chartHeight = viewBoxHeight - padding.top - padding.bottom;

  // Generate chart path
  const generatePath = () => {
    if (prices.length < 2) return { linePath: '', areaPath: '', points: [] };

    const xStep = chartWidth / (prices.length - 1);
    const priceRange = maxPrice - minPrice || 0.0001;

    const points = prices.map((p, i) => {
      const x = padding.left + i * xStep;
      const y = padding.top + chartHeight - ((p.price - minPrice) / priceRange) * chartHeight;
      return { x, y, ...p };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

    return { linePath, areaPath, points };
  };

  const { linePath, areaPath, points } = generatePath();

  // Handle mouse move on chart to show tooltip
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chartRef.current || points.length < 2) return;

    const rect = chartRef.current.getBoundingClientRect();
    const svgRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const scaleX = viewBoxWidth / svgRect.width;
    const scaledX = mouseX * scaleX;

    // Find closest point
    let closestPoint = points[0];
    let closestDist = Math.abs(scaledX - points[0].x);

    for (const p of points) {
      const dist = Math.abs(scaledX - p.x);
      if (dist < closestDist) {
        closestDist = dist;
        closestPoint = p;
      }
    }

    // Convert SVG coordinates to pixel coordinates for tooltip
    const pixelX = (closestPoint.x / viewBoxWidth) * svgRect.width;
    const pixelY = (closestPoint.y / viewBoxHeight) * svgRect.height;

    setHoveredPoint({
      x: pixelX,
      y: pixelY,
      price: closestPoint.price,
      date: closestPoint.date,
    });
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  // Get X-axis label indices (6 labels evenly distributed)
  const getXLabelIndices = () => {
    if (points.length <= 6) return points.map((_, i) => i);
    const step = (points.length - 1) / 5;
    return [0, 1, 2, 3, 4, 5].map(i => Math.round(i * step));
  };

  return (
    <Container $isDark={isDark}>
      <Header>
        <TitleSection>
          <Title $isDark={isDark}>
            📈 CSPR Price
          </Title>
          <TimeframeButtons>
            {TIMEFRAMES.map(tf => (
              <TimeframeButton
                key={tf.label}
                $isDark={isDark}
                $active={selectedDays === tf.days}
                onClick={() => setSelectedDays(tf.days)}
              >
                {tf.label}
              </TimeframeButton>
            ))}
          </TimeframeButtons>
        </TitleSection>
        <PriceSection>
          <CurrentPrice $isDark={isDark}>
            ${usdPrice.toFixed(4)}
          </CurrentPrice>
          <PriceChange $positive={isPositive}>
            {isPositive ? '↑' : '↓'} {Math.abs(priceChangePercent).toFixed(2)}%
          </PriceChange>
        </PriceSection>
      </Header>

      {isLoading ? (
        <LoadingContainer $isDark={isDark} />
      ) : error ? (
        <ErrorMessage $isDark={isDark}>
          Unable to load price data
        </ErrorMessage>
      ) : (
        <ChartContainer ref={chartRef}>
          <ChartSVG
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            preserveAspectRatio="xMidYMid meet"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: 'crosshair' }}
          >
            <defs>
              <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isPositive ? '#30d158' : '#ff453a'} stopOpacity="0.4" />
                <stop offset="100%" stopColor={isPositive ? '#30d158' : '#ff453a'} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 0.5, 1].map((ratio, i) => (
              <GridLine
                key={i}
                $isDark={isDark}
                x1={padding.left}
                y1={padding.top + chartHeight * (1 - ratio)}
                x2={viewBoxWidth - padding.right}
                y2={padding.top + chartHeight * (1 - ratio)}
              />
            ))}

            {/* Area */}
            {areaPath && <AreaPath d={areaPath} $positive={isPositive} />}

            {/* Line */}
            {linePath && <ChartPath d={linePath} $positive={isPositive} />}

            {/* Data points */}
            {points?.map((p, i) => (
              <DataPoint
                key={i}
                cx={p.x}
                cy={p.y}
                r={4}
                $positive={isPositive}
              />
            ))}

            {/* X-axis labels (6 evenly distributed) */}
            {getXLabelIndices().map((idx) => points[idx] && (
              <XLabel
                key={idx}
                $isDark={isDark}
                x={points[idx].x}
                y={viewBoxHeight - 8}
              >
                {points[idx].date}
              </XLabel>
            ))}

            {/* Y-axis labels */}
            {[minPrice, (minPrice + maxPrice) / 2, maxPrice].map((price, i) => (
              <YLabel
                key={i}
                $isDark={isDark}
                x={padding.left - 8}
                y={padding.top + chartHeight * (1 - i / 2) + 4}
              >
                ${price.toFixed(4)}
              </YLabel>
            ))}

            {/* Hover indicator line and dot */}
            {hoveredPoint && (
              <>
                <HoverLine
                  $isDark={isDark}
                  x1={(hoveredPoint.x / chartRef.current!.getBoundingClientRect().width) * viewBoxWidth}
                  y1={padding.top}
                  x2={(hoveredPoint.x / chartRef.current!.getBoundingClientRect().width) * viewBoxWidth}
                  y2={padding.top + chartHeight}
                />
                <HoverDot
                  cx={(hoveredPoint.x / chartRef.current!.getBoundingClientRect().width) * viewBoxWidth}
                  cy={(hoveredPoint.y / chartRef.current!.getBoundingClientRect().height) * viewBoxHeight}
                  r={6}
                  $positive={isPositive}
                />
              </>
            )}
          </ChartSVG>

          {/* Tooltip */}
          <Tooltip
            $isDark={isDark}
            $x={hoveredPoint?.x || 0}
            $y={hoveredPoint?.y || 0}
            $visible={!!hoveredPoint}
          >
            <TooltipDate $isDark={isDark}>{hoveredPoint?.date}</TooltipDate>
            <TooltipPrice $isDark={isDark}>${hoveredPoint?.price.toFixed(4)}</TooltipPrice>
          </Tooltip>
        </ChartContainer>
      )}

      <StatsRow $isDark={isDark}>
        <StatItem>
          <StatLabel $isDark={isDark}>{selectedTimeframe.label} Low</StatLabel>
          <StatValue $isDark={isDark}>${minPrice.toFixed(4)}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel $isDark={isDark}>{selectedTimeframe.label} High</StatLabel>
          <StatValue $isDark={isDark}>${maxPrice.toFixed(4)}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel $isDark={isDark}>{selectedTimeframe.label} Change</StatLabel>
          <StatValue $isDark={isDark} style={{ color: isPositive ? '#30d158' : '#ff453a' }}>
            {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%
          </StatValue>
        </StatItem>
      </StatsRow>
    </Container>
  );
};

export default PriceChart;
