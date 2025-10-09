import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import Colors from '@/src/constants/Colors';
import Layout from '@/src/constants/Layout';

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
}

interface DetailedChartProps {
  data: number[];
  title: string;
  timeRange: '1H' | '1D' | '7D' | '1M' | '3M' | '1Y';
  onTimeRangeChange: (range: '1H' | '1D' | '7D' | '1M' | '3M' | '1Y') => void;
  currentPrice: number;
  change: number;
  volume?: number;
  marketCap?: number;
  high24h?: number;
  low24h?: number;
  showVolume?: boolean;
  showIndicators?: boolean;
}

export default function DetailedChart({
  data,
  title,
  timeRange,
  onTimeRangeChange,
  currentPrice,
  change,
  volume,
  marketCap,
  high24h,
  low24h,
  showVolume = true,
  showIndicators = true,
}: DetailedChartProps) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 520;
  // allow chart to grow on larger screens but leave padding
  const containerPadding = isSmallScreen ? 32 : 48;
  const maxChartWidth = Math.max(380, Math.min(900, width - containerPadding));
  const chartWidth = Math.min(width - containerPadding, maxChartWidth);
  
  const [chartType, setChartType] = useState<'line' | 'candle' | 'volume'>('line');
  const [showMA, setShowMA] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

  // Enhanced color scheme for better visibility
  const getChartColors = () => {
    const isPositive = change >= 0;
    return {
      primary: isPositive ? '#10B981' : '#EF4444', // Stronger green/red
      secondary: isPositive ? '#059669' : '#DC2626',
      background: '#FFFFFF',
      grid: '#E5E7EB',
      text: '#374151',
      accent: '#3B82F6',
    };
  };

  const colors = getChartColors();
  
  // helper to produce rgba from hex + opacity
  const hexToRgba = (hex: string, opacity = 1) => {
    const parsed = hex.replace('#', '');
    const bigint = parseInt(parsed.length === 3 ? parsed.split('').map(c => c + c).join('') : parsed, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Generate time labels based on range
  const generateLabels = (range: string, dataLength: number) => {
    const labels = [];
    const now = new Date();
    
    switch (range) {
      case '1H':
        for (let i = dataLength - 1; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 5 * 60000);
          labels.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
        }
        break;
      case '1D':
        for (let i = dataLength - 1; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 60 * 60000);
          labels.push(time.toLocaleTimeString('en-US', { hour: '2-digit' }));
        }
        break;
      case '7D':
        for (let i = dataLength - 1; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 24 * 60 * 60000);
          labels.push(time.toLocaleDateString('en-US', { weekday: 'short' }));
        }
        break;
      case '1M':
        for (let i = dataLength - 1; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 24 * 60 * 60000);
          labels.push(time.getDate().toString());
        }
        break;
      case '3M':
        for (let i = dataLength - 1; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 7 * 24 * 60 * 60000);
          labels.push(`W${Math.ceil((now.getTime() - time.getTime()) / (7 * 24 * 60 * 60000))}`);
        }
        break;
      case '1Y':
        for (let i = dataLength - 1; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 30 * 24 * 60 * 60000);
          labels.push(time.toLocaleDateString('en-US', { month: 'short' }));
        }
        break;
      default:
        for (let i = 0; i < dataLength; i++) {
          labels.push(i.toString());
        }
    }
    return labels;
  };

  // Calculate moving average
  const calculateMA = (data: number[], period: number = 7) => {
    const ma = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        ma.push(data[i]);
      } else {
        const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        ma.push(sum / period);
      }
    }
    return ma;
  };

  // Generate volume data (simulated)
  const generateVolumeData = (priceData: number[]) => {
    return priceData.map((price, index) => {
      const baseVolume = volume || 1000000;
      const volatility = Math.abs(priceData[index] - (priceData[index - 1] || price)) / price;
      return Math.floor(baseVolume * (1 + volatility * 5) * (0.5 + Math.random()));
    });
  };

  const labels = generateLabels(timeRange, data.length);
  const movingAverage = showMA ? calculateMA(data) : [];
  const volumeData = generateVolumeData(data);

  const chartData: ChartData = {
    labels: labels.length > 10 ? labels.filter((_, i) => i % Math.ceil(labels.length / 8) === 0) : labels,
    datasets: [
      {
        data,
        color: (opacity = 1) => hexToRgba(colors.primary, opacity),
        strokeWidth: 3, // Increased stroke width for better visibility
      },
      ...(showMA ? [{
        data: movingAverage,
        color: (opacity = 1) => hexToRgba(colors.accent, opacity),
        strokeWidth: 2,
      }] : []),
    ],
  };

  const volumeChartData: ChartData = {
    labels: chartData.labels,
    datasets: [{
      data: volumeData.length > 10 ? volumeData.filter((_, i) => i % Math.ceil(volumeData.length / 8) === 0) : volumeData,
      color: (opacity = 1) => hexToRgba('#9CA3AF', opacity),
    }],
  };

  const timeRanges: Array<'1H' | '1D' | '7D' | '1M' | '3M' | '1Y'> = ['1H', '1D', '7D', '1M', '3M', '1Y'];

  // Enhanced chart config with better visibility
  const getChartConfig = () => ({
    backgroundColor: colors.background,
    backgroundGradientFrom: hexToRgba(colors.background, 1),
    backgroundGradientTo: hexToRgba(colors.background, 1),
    decimalPlaces: 2,
    color: (opacity = 1) => hexToRgba(colors.primary, opacity),
    labelColor: (opacity = 1) => hexToRgba(colors.text, opacity * 0.9),
    style: {
      borderRadius: 12,
    },
    propsForDots: {
      r: isSmallScreen ? '4' : '5',
      strokeWidth: isSmallScreen ? '2' : '3',
      stroke: colors.secondary,
      fill: colors.primary,
    },
    propsForBackgroundLines: {
      strokeDasharray: '3,3',
      stroke: colors.grid,
      strokeWidth: 1,
    },
    fillShadowGradient: colors.primary,
    fillShadowGradientFrom: colors.primary,
    fillShadowGradientTo: colors.primary,
    fillShadowGradientOpacity: 0.12,
    strokeWidth: 3,
    useShadowColorFromDataset: false,
  });

  return (
    <View style={[styles.container, isSmallScreen && styles.containerSmall]}>
      {/* Header with price info */}
      <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
        <View>
          <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>{title}</Text>
          <Text style={[styles.price, isSmallScreen && styles.priceSmall]}>
            ${currentPrice.toFixed(2)}
          </Text>
          <Text style={[
            styles.change,
            { color: colors.primary },
            isSmallScreen && styles.changeSmall
          ]}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)}% ({timeRange})
          </Text>
        </View>
        
        {/* Additional metrics */}
        <View style={[styles.metrics, isSmallScreen && styles.metricsSmall]}>
          {high24h && (
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, isSmallScreen && styles.metricLabelSmall]}>24h High</Text>
              <Text style={[styles.metricValue, styles.metricValuePositive, isSmallScreen && styles.metricValueSmall]}>
                ${high24h.toFixed(2)}
              </Text>
            </View>
          )}
          {low24h && (
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, isSmallScreen && styles.metricLabelSmall]}>24h Low</Text>
              <Text style={[styles.metricValue, styles.metricValueNegative, isSmallScreen && styles.metricValueSmall]}>
                ${low24h.toFixed(2)}
              </Text>
            </View>
          )}
          {volume && (
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, isSmallScreen && styles.metricLabelSmall]}>Volume</Text>
              <Text style={[styles.metricValue, isSmallScreen && styles.metricValueSmall]}>
                ${volume.toLocaleString()}
              </Text>
            </View>
          )}
          {marketCap && (
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, isSmallScreen && styles.metricLabelSmall]}>Market Cap</Text>
              <Text style={[styles.metricValue, isSmallScreen && styles.metricValueSmall]}>
                ${marketCap.toLocaleString()}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Time range selector */}
      <View style={[styles.timeRangeContainer, isSmallScreen && styles.timeRangeContainerSmall]}>
        {timeRanges.map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              timeRange === range && styles.timeRangeButtonActive,
              isSmallScreen && styles.timeRangeButtonSmall
            ]}
            onPress={() => onTimeRangeChange(range)}
          >
            <Text style={[
              styles.timeRangeText,
              timeRange === range && styles.timeRangeTextActive,
              isSmallScreen && styles.timeRangeTextSmall
            ]}>
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart type selector */}
      <View style={[styles.chartTypeContainer, isSmallScreen && styles.chartTypeContainerSmall]}>
        <TouchableOpacity
          style={[
            styles.chartTypeButton,
            chartType === 'line' && styles.chartTypeButtonActive,
            isSmallScreen && styles.chartTypeButtonSmall
          ]}
          onPress={() => setChartType('line')}
        >
          <Text style={[
            styles.chartTypeText,
            chartType === 'line' && styles.chartTypeTextActive,
            isSmallScreen && styles.chartTypeTextSmall
          ]}>
            📈 Line
          </Text>
        </TouchableOpacity>
        
        {showVolume && (
          <TouchableOpacity
            style={[
              styles.chartTypeButton,
              chartType === 'volume' && styles.chartTypeButtonActive,
              isSmallScreen && styles.chartTypeButtonSmall
            ]}
            onPress={() => setChartType('volume')}
          >
            <Text style={[
              styles.chartTypeText,
              chartType === 'volume' && styles.chartTypeTextActive,
              isSmallScreen && styles.chartTypeTextSmall
            ]}>
              📊 Volume
            </Text>
          </TouchableOpacity>
        )}

        {showIndicators && (
          <TouchableOpacity
            style={[
              styles.chartTypeButton,
              showMA && styles.chartTypeButtonActive,
              isSmallScreen && styles.chartTypeButtonSmall
            ]}
            onPress={() => setShowMA(!showMA)}
          >
            <Text style={[
              styles.chartTypeText,
              showMA && styles.chartTypeTextActive,
              isSmallScreen && styles.chartTypeTextSmall
            ]}>
              📉 MA
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Chart with enhanced visibility */}
      <View style={[styles.chartContainer, isSmallScreen && styles.chartContainerSmall]}>
        <View style={styles.chartWrapper}>
          {chartType === 'line' ? (
            <LineChart
              data={chartData}
              width={chartWidth}
              height={isSmallScreen ? 220 : 280}
              chartConfig={getChartConfig()}
              bezier
              style={styles.chart}
              withDots={true}
              withShadow={true}
              withInnerLines={true}
              withOuterLines={false}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              fromZero={false}
              segments={5}
              // interactive: tap points to show details
              onDataPointClick={(point: { index: number; value: number; dataset: any }) => {
                setSelectedPoint(point.index);
              }}
              // decorator to show a small vertical indicator + dot for selected point
              decorator={() => {
                if (selectedPoint === null) return null;
                const total = data.length;
                const step = chartWidth / Math.max(1, total - 1);
                const x = step * selectedPoint;
                const y = 12; // placeholder; LineChart decorator is absolute-positioned inside chart wrapper
                return (
                  <View pointerEvents="none" style={{ position: 'absolute', left: x - 1, top: 0, bottom: 0, width: 2, backgroundColor: hexToRgba(colors.primary, 0.12) }} />
                );
              }}
            />
          ) : (
            <BarChart
              data={volumeChartData}
              width={chartWidth}
              height={isSmallScreen ? 200 : 240}
              chartConfig={{
                ...getChartConfig(),
                color: (opacity = 1) => hexToRgba('#6366F1', opacity),
                fillShadowGradient: '#6366F1',
                fillShadowGradientOpacity: 0.32,
              }}
              style={styles.chart}
              withInnerLines={true}
              withHorizontalLabels={true}
              fromZero={true}
              showValuesOnTopOfBars={true}
              yAxisLabel={''}
              yAxisSuffix={''}
            />
          )}
        </View>
      </View>

      {/* Selected point info */}
      {selectedPoint !== null && (
        <View style={[styles.selectedPointInfo, isSmallScreen && styles.selectedPointInfoSmall]}>
          <Text style={[styles.selectedPointText, isSmallScreen && styles.selectedPointTextSmall]}>
            Point {selectedPoint}: ${data[selectedPoint]?.toFixed(2)}
          </Text>
        </View>
      )}

      {/* Technical indicators */}
      {showIndicators && (
        <View style={[styles.indicatorsContainer, isSmallScreen && styles.indicatorsContainerSmall]}>
          <Text style={[styles.indicatorsTitle, isSmallScreen && styles.indicatorsTitleSmall]}>
            Technical Analysis
          </Text>
          <View style={[styles.indicatorsGrid, isSmallScreen && styles.indicatorsGridSmall]}>
            <View style={styles.indicatorItem}>
              <Text style={[styles.indicatorLabel, isSmallScreen && styles.indicatorLabelSmall]}>RSI</Text>
              <Text style={[styles.indicatorValue, isSmallScreen && styles.indicatorValueSmall]}>
                {(50 + Math.random() * 40).toFixed(1)}
              </Text>
            </View>
            <View style={styles.indicatorItem}>
              <Text style={[styles.indicatorLabel, isSmallScreen && styles.indicatorLabelSmall]}>MACD</Text>
              <Text style={[
                styles.indicatorValue,
                { color: Math.random() > 0.5 ? colors.primary : colors.secondary },
                isSmallScreen && styles.indicatorValueSmall
              ]}>
                {(Math.random() * 2 - 1).toFixed(3)}
              </Text>
            </View>
            <View style={styles.indicatorItem}>
              <Text style={[styles.indicatorLabel, isSmallScreen && styles.indicatorLabelSmall]}>Volatility</Text>
              <Text style={[styles.indicatorValue, isSmallScreen && styles.indicatorValueSmall]}>
                {(Math.random() * 5 + 1).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.indicatorItem}>
              <Text style={[styles.indicatorLabel, isSmallScreen && styles.indicatorLabelSmall]}>Support</Text>
              <Text style={[styles.indicatorValue, isSmallScreen && styles.indicatorValueSmall]}>
                ${(currentPrice * 0.95).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    margin: Layout.spacing.md,
    ...Layout.shadows.medium,
  },
  containerSmall: {
    padding: Layout.spacing.md,
    margin: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.lg,
  },
  headerSmall: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.md,
    gap: Layout.spacing.sm,
  },
  title: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: Colors.primary[700],
    marginBottom: 4,
  },
  titleSmall: {
    fontSize: 16,
  },
  price: {
    fontFamily: 'Nunito-Bold',
    fontSize: 28,
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  priceSmall: {
    fontSize: 22,
  },
  change: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
  },
  changeSmall: {
    fontSize: 14,
  },
  metrics: {
    alignItems: 'flex-end',
  },
  metricsSmall: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.sm,
  },
  metricItem: {
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  metricLabel: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: Colors.neutral[500],
  },
  metricLabelSmall: {
    fontSize: 10,
  },
  metricValue: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: Colors.neutral[700],
  },
  metricValueSmall: {
    fontSize: 12,
  },
  metricValuePositive: {
    color: '#10B981',
  },
  metricValueNegative: {
    color: '#EF4444',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Layout.spacing.md,
    backgroundColor: Colors.neutral[100],
    borderRadius: Layout.borderRadius.md,
    padding: 4,
  },
  timeRangeContainerSmall: {
    marginBottom: Layout.spacing.sm,
    padding: 2,
  },
  timeRangeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Layout.borderRadius.sm,
  },
  timeRangeButtonSmall: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  timeRangeButtonActive: {
    backgroundColor: Colors.primary[500],
  },
  timeRangeText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: Colors.neutral[600],
  },
  timeRangeTextSmall: {
    fontSize: 12,
  },
  timeRangeTextActive: {
    color: Colors.card,
  },
  chartTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Layout.spacing.md,
    gap: Layout.spacing.sm,
  },
  chartTypeContainerSmall: {
    marginBottom: Layout.spacing.sm,
    gap: Layout.spacing.xs,
  },
  chartTypeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Layout.borderRadius.sm,
    backgroundColor: Colors.neutral[200],
  },
  chartTypeButtonSmall: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  chartTypeButtonActive: {
    backgroundColor: Colors.primary[500],
  },
  chartTypeText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 12,
    color: Colors.neutral[700],
  },
  chartTypeTextSmall: {
    fontSize: 10,
  },
  chartTypeTextActive: {
    color: Colors.card,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  chartContainerSmall: {
    marginBottom: Layout.spacing.md,
  },
  chartWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: Layout.borderRadius.md,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    borderRadius: Layout.borderRadius.md,
  },
  selectedPointInfo: {
    backgroundColor: Colors.primary[50],
    padding: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.sm,
    marginBottom: Layout.spacing.md,
  },
  selectedPointInfoSmall: {
    padding: Layout.spacing.xs,
    marginBottom: Layout.spacing.sm,
  },
  selectedPointText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: Colors.primary[700],
    textAlign: 'center',
  },
  selectedPointTextSmall: {
    fontSize: 12,
  },
  indicatorsContainer: {
    backgroundColor: Colors.neutral[50],
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
  },
  indicatorsContainerSmall: {
    padding: Layout.spacing.sm,
  },
  indicatorsTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.neutral[800],
    marginBottom: Layout.spacing.sm,
  },
  indicatorsTitleSmall: {
    fontSize: 14,
    marginBottom: Layout.spacing.xs,
  },
  indicatorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  indicatorsGridSmall: {
    gap: Layout.spacing.xs,
  },
  indicatorItem: {
    alignItems: 'center',
    minWidth: '22%',
  },
  indicatorLabel: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: Colors.neutral[600],
    marginBottom: 2,
  },
  indicatorLabelSmall: {
    fontSize: 10,
  },
  indicatorValue: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: Colors.neutral[800],
  },
  indicatorValueSmall: {
    fontSize: 12,
  },
});