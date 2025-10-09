import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Dimensions, useColorScheme } from 'react-native';
import { PieChart, LineChart } from 'react-native-chart-kit';
import Colors from '@/src/constants/Colors';
import Layout from '@/src/constants/Layout';

interface PortfolioAsset {
  name: string;
  value: number;
  quantity: number;
  change: number;
  emoji: string;
}

interface PortfolioChartProps {
  assets: PortfolioAsset[];
  totalValue: number;
  totalChange: number;
  timeRange: '1D' | '7D' | '1M' | '3M' | '1Y';
  onTimeRangeChange: (range: '1D' | '7D' | '1M' | '3M' | '1Y') => void;
  width?: number;
  height?: number;
  isSmallScreen?: boolean;
  isMediumScreen?: boolean;
  isTablet?: boolean;
}

export default function PortfolioChart({
  assets,
  totalValue,
  totalChange,
  timeRange,
  onTimeRangeChange,
  width: screenWidth = Dimensions.get('window').width,
  height: screenHeight = Dimensions.get('window').height,
  isSmallScreen = false,
  isMediumScreen = false,
  isTablet = false,
}: PortfolioChartProps) {
  // Responsive chart sizing using window dimensions
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const containerPadding = isSmallScreen ? 32 : isTablet ? 64 : 48;
  const maxWidth = isTablet ? 900 : isSmallScreen ? 360 : 600;
  const chartWidth = Math.min(Math.max(320, windowWidth - containerPadding), maxWidth);
  const chartHeight = isSmallScreen
    ? Math.min(220, windowHeight * 0.28)
    : isTablet
    ? Math.min(320, windowHeight * 0.36)
    : Math.min(280, windowHeight * 0.32);

  const [chartType, setChartType] = useState<'pie' | 'line' | 'performance'>('pie');
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  // Enhanced color palette for better visibility with more vibrant colors
  const vibrantColors = [
    '#10B981', // Emerald - Strong green
    '#3B82F6', // Blue - Vibrant blue
    '#F59E0B', // Amber - Bright yellow
    '#EF4444', // Red - Strong red
    '#8B5CF6', // Violet - Rich purple
    '#06B6D4', // Cyan - Bright cyan
    '#84CC16', // Lime - Vivid green
    '#F97316', // Orange - Bright orange
    '#EC4899', // Pink - Vibrant pink
    '#6366F1', // Indigo - Deep blue
    '#14B8A6', // Teal - Strong teal
    '#F472B6', // Rose - Bright rose
    '#A855F7', // Purple - Rich purple
    '#22D3EE', // Sky - Bright sky blue
    '#FB923C', // Orange variant
  ];

  // Generate historical portfolio data
  const generatePortfolioHistory = () => {
    const points = timeRange === '1D' ? 24 : timeRange === '7D' ? 7 : timeRange === '1M' ? 30 : timeRange === '3M' ? 90 : 365;
    const data = [];
    let currentValue = totalValue;
    
    for (let i = points - 1; i >= 0; i--) {
      const volatility = 0.02;
      const change = (Math.random() - 0.5) * volatility;
      currentValue = currentValue * (1 + change);
      data.push(parseFloat(currentValue.toFixed(2)));
    }
    
    return data.reverse();
  };

  const [portfolioHistory] = useState(generatePortfolioHistory());

  // Generate labels for time range
  const generateLabels = () => {
    const labels = [];
    const now = new Date();
    const points = portfolioHistory.length;
    
    for (let i = points - 1; i >= 0; i--) {
      let time: Date;
      switch (timeRange) {
        case '1D':
          time = new Date(now.getTime() - i * 60 * 60000);
          labels.push(time.toLocaleTimeString('en-US', { hour: '2-digit' }));
          break;
        case '7D':
          time = new Date(now.getTime() - i * 24 * 60 * 60000);
          labels.push(time.toLocaleDateString('en-US', { weekday: 'short' }));
          break;
        case '1M':
          time = new Date(now.getTime() - i * 24 * 60 * 60000);
          labels.push(time.getDate().toString());
          break;
        case '3M':
          time = new Date(now.getTime() - i * 7 * 24 * 60 * 60000);
          labels.push(`W${Math.ceil(i / 7)}`);
          break;
        case '1Y':
          time = new Date(now.getTime() - i * 30 * 24 * 60 * 60000);
          labels.push(time.toLocaleDateString('en-US', { month: 'short' }));
          break;
        default:
          labels.push(i.toString());
      }
    }
    return labels;
  };

  const colorScheme = useColorScheme();
  const isAppDark = colorScheme === 'dark';

  // helper to produce rgba from hex + opacity
  const hexToRgba = (hex: string, opacity = 1) => {
    const parsed = hex.replace('#', '');
    const full = parsed.length === 3 ? parsed.split('').map(c => c + c).join('') : parsed;
    const bigint = parseInt(full, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // dynamic colors for light/dark mode
  const chartBg = isAppDark ? Colors.neutral[800] : '#FFFFFF'; // Adjusted dark mode background
  const chartText = isAppDark ? '#E5E7EB' : '#374151'; // Adjusted text color for better contrast
  const chartGrid = isAppDark ? '#4B5563' : '#E5E7EB'; // Adjusted grid color for better visibility

  // Enhanced chart configuration with stronger colors and dark-mode support
  const getChartConfig = () => ({
    backgroundColor: chartBg,
    backgroundGradientFrom: hexToRgba(chartBg, 1),
    backgroundGradientTo: hexToRgba(chartBg, 1),
    decimalPlaces: 0,
    color: (opacity = 1) => totalChange >= 0
      ? hexToRgba('#10B981', opacity)
      : hexToRgba('#EF4444', opacity),
    labelColor: (opacity = 1) => hexToRgba(chartText, opacity * 0.95),
    style: { borderRadius: 12 },
    propsForDots: {
      r: isSmallScreen ? '4' : isTablet ? '6' : '5',
      strokeWidth: isSmallScreen ? '2' : '3',
      stroke: totalChange >= 0 ? '#059669' : '#DC2626',
      fill: totalChange >= 0 ? '#10B981' : '#EF4444',
    },
    propsForBackgroundLines: {
      strokeDasharray: '3,3',
      stroke: chartGrid,
      strokeWidth: 1,
    },
    fillShadowGradient: totalChange >= 0 ? '#10B981' : '#EF4444',
    fillShadowGradientOpacity: 0.12,
    strokeWidth: isSmallScreen ? 2 : isTablet ? 4 : 3,
  });

  // Prepare pie chart data with enhanced visibility
  const pieData = assets
    .filter(asset => asset.value > 0)
    .slice(0, 10) // Limit to top 10 assets for better readability
    .map((asset, index) => ({
      name: isSmallScreen ? asset.name.slice(0, 6) : asset.name,
      population: asset.value,
      color: vibrantColors[index % vibrantColors.length],
      legendFontColor: Colors.neutral[700],
      legendFontSize: isSmallScreen ? 10 : isTablet ? 14 : 12,
    }));

  // Prepare line chart data
  const lineChartData = {
    labels: generateLabels().length > 10
      ? generateLabels().filter((_, i) => i % Math.ceil(generateLabels().length / (isSmallScreen ? 6 : 8)) === 0)
      : generateLabels(),
    datasets: [{
      data: portfolioHistory.length > 10
        ? portfolioHistory.filter((_, i) => i % Math.ceil(portfolioHistory.length / (isSmallScreen ? 6 : 8)) === 0)
        : portfolioHistory,
      color: (opacity = 1) => totalChange >= 0
        ? hexToRgba('#10B981', opacity)
        : hexToRgba('#EF4444', opacity),
      strokeWidth: isSmallScreen ? 2 : isTablet ? 4 : 3,
    }],
  };

  // Performance comparison data
  const performanceData = {
    labels: assets.slice(0, isSmallScreen ? 3 : 5).map(asset => 
      isSmallScreen ? asset.name.slice(0, 4) : asset.name.slice(0, 6)
    ),
    datasets: [{
      data: assets.slice(0, isSmallScreen ? 3 : 5).map(asset => asset.change),
      color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
      strokeWidth: isSmallScreen ? 2 : isTablet ? 4 : 3,
    }],
  };

  const timeRanges: Array<'1D' | '7D' | '1M' | '3M' | '1Y'> = ['1D', '7D', '1M', '3M', '1Y'];

  return (
    <View style={[
      styles.container, 
      isSmallScreen && styles.containerSmall,
      isTablet && styles.containerTablet
    ]}>
      {/* Header */}
      <View style={[
        styles.header, 
        isSmallScreen && styles.headerSmall,
        isTablet && styles.headerTablet
      ]}>
        <View>
          <Text style={[
            styles.title, 
            isSmallScreen && styles.titleSmall,
            isTablet && styles.titleTablet
          ]}>
            Portfolio Overview
          </Text>
          <Text style={[
            styles.totalValue, 
            isSmallScreen && styles.totalValueSmall,
            isTablet && styles.totalValueTablet
          ]}>
            ${totalValue.toLocaleString()}
          </Text>
          <Text style={[
            styles.totalChange,
            { color: totalChange >= 0 ? '#10B981' : '#EF4444' },
            isSmallScreen && styles.totalChangeSmall,
            isTablet && styles.totalChangeTablet
          ]}>
            {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}% ({timeRange})
          </Text>
        </View>
        
        <View style={[
          styles.stats, 
          isSmallScreen && styles.statsSmall,
          isTablet && styles.statsTablet
        ]}>
          <View style={styles.statItem}>
            <Text style={[
              styles.statLabel, 
              isSmallScreen && styles.statLabelSmall,
              isTablet && styles.statLabelTablet
            ]}>
              Assets
            </Text>
            <Text style={[
              styles.statValue, 
              isSmallScreen && styles.statValueSmall,
              isTablet && styles.statValueTablet
            ]}>
              {assets.length}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[
              styles.statLabel, 
              isSmallScreen && styles.statLabelSmall,
              isTablet && styles.statLabelTablet
            ]}>
              Best Performer
            </Text>
            <Text style={[
              styles.statValue, 
              styles.statValuePositive, 
              isSmallScreen && styles.statValueSmall,
              isTablet && styles.statValueTablet
            ]}>
              {assets.length > 0 ? assets.reduce((best, current) => 
                current.change > best.change ? current : best
              ).name.slice(0, isSmallScreen ? 6 : 8) : 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      {/* Chart Type Selector */}
      <View style={[
        styles.chartTypeContainer, 
        isSmallScreen && styles.chartTypeContainerSmall,
        isTablet && styles.chartTypeContainerTablet
      ]}>
        <TouchableOpacity
          style={[
            styles.chartTypeButton,
            chartType === 'pie' && styles.chartTypeButtonActive,
            isSmallScreen && styles.chartTypeButtonSmall,
            isTablet && styles.chartTypeButtonTablet
          ]}
          onPress={() => setChartType('pie')}
        >
          <Text style={[
            styles.chartTypeText,
            chartType === 'pie' && styles.chartTypeTextActive,
            isSmallScreen && styles.chartTypeTextSmall,
            isTablet && styles.chartTypeTextTablet
          ]}>
            🥧 {isSmallScreen ? 'Pie' : 'Distribution'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.chartTypeButton,
            chartType === 'line' && styles.chartTypeButtonActive,
            isSmallScreen && styles.chartTypeButtonSmall,
            isTablet && styles.chartTypeButtonTablet
          ]}
          onPress={() => setChartType('line')}
        >
          <Text style={[
            styles.chartTypeText,
            chartType === 'line' && styles.chartTypeTextActive,
            isSmallScreen && styles.chartTypeTextSmall,
            isTablet && styles.chartTypeTextTablet
          ]}>
            📈 History
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chartTypeButton,
            chartType === 'performance' && styles.chartTypeButtonActive,
            isSmallScreen && styles.chartTypeButtonSmall,
            isTablet && styles.chartTypeButtonTablet
          ]}
          onPress={() => setChartType('performance')}
        >
          <Text style={[
            styles.chartTypeText,
            chartType === 'performance' && styles.chartTypeTextActive,
            isSmallScreen && styles.chartTypeTextSmall,
            isTablet && styles.chartTypeTextTablet
          ]}>
            🏆 {isSmallScreen ? 'Perf' : 'Performance'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Time Range Selector (for line chart) */}
      {chartType === 'line' && (
        <View style={[
          styles.timeRangeContainer, 
          isSmallScreen && styles.timeRangeContainerSmall,
          isTablet && styles.timeRangeContainerTablet
        ]}>
          {timeRanges.map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                timeRange === range && styles.timeRangeButtonActive,
                isSmallScreen && styles.timeRangeButtonSmall,
                isTablet && styles.timeRangeButtonTablet
              ]}
              onPress={() => onTimeRangeChange(range)}
            >
              <Text style={[
                styles.timeRangeText,
                timeRange === range && styles.timeRangeTextActive,
                isSmallScreen && styles.timeRangeTextSmall,
                isTablet && styles.timeRangeTextTablet
              ]}>
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Enhanced Chart Display with Responsive Sizing */}
      <View style={[
        styles.chartContainer, 
        isSmallScreen && styles.chartContainerSmall,
        isTablet && styles.chartContainerTablet
      ]}>
        <View style={[
          styles.chartWrapper,
          isSmallScreen && styles.chartWrapperSmall,
          isTablet && styles.chartWrapperTablet
        ]}>
          {chartType === 'pie' && pieData.length > 0 ? (
            <PieChart
              data={pieData}
              width={chartWidth}
              height={chartHeight}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft={(isSmallScreen ? 10 : isTablet ? 20 : 15).toString()}
              center={[0, 0]}
              absolute
              chartConfig={{ color: (opacity = 1) => hexToRgba(chartText, opacity) }}
              hasLegend={!isSmallScreen}
              avoidFalseZero={true}
            />
          ) : chartType === 'line' ? (
            <LineChart
              data={lineChartData}
              width={chartWidth}
              height={chartHeight}
              chartConfig={getChartConfig()}
              bezier
              style={styles.chart}
              withDots={true}
              withShadow={true}
              withInnerLines={true}
              withOuterLines={false}
              fromZero={false}
              segments={isSmallScreen ? 3 : 4}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              onDataPointClick={(p) => {
                // small interactive feedback — could show a tooltip / selected value
                // keep minimal for now
                console.log('point', p);
              }}
            />
          ) : (
            <LineChart
              data={performanceData}
              width={chartWidth}
              height={chartHeight}
              chartConfig={{
                ...getChartConfig(),
                color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                fillShadowGradient: '#3B82F6',
                fillShadowGradientOpacity: 0.3,
              }}
              style={styles.chart}
              withDots={true}
              withInnerLines={true}
              withOuterLines={false}
              fromZero={true}
              segments={isSmallScreen ? 3 : 4}
            />
          )}
        </View>
      </View>

      {/* Asset Breakdown - Enhanced for small screens */}
      {chartType === 'pie' && (
        <View style={[
          styles.assetBreakdown, 
          isSmallScreen && styles.assetBreakdownSmall,
          isTablet && styles.assetBreakdownTablet
        ]}>
          <Text style={[
            styles.breakdownTitle, 
            isSmallScreen && styles.breakdownTitleSmall,
            isTablet && styles.breakdownTitleTablet
          ]}>
            Asset Breakdown
          </Text>
          {assets.slice(0, isSmallScreen ? 4 : 6).map((asset, index) => (
            <TouchableOpacity
              key={asset.name}
              style={[
                styles.assetItem, 
                isSmallScreen && styles.assetItemSmall,
                isTablet && styles.assetItemTablet
              ]}
              onPress={() => setSelectedAsset(selectedAsset === asset.name ? null : asset.name)}
            >
              <View style={styles.assetInfo}>
                <View style={[
                  styles.assetColorDot,
                  { backgroundColor: vibrantColors[index % vibrantColors.length] },
                  isSmallScreen && styles.assetColorDotSmall,
                  isTablet && styles.assetColorDotTablet
                ]} />
                <Text style={[
                  styles.assetName, 
                  isSmallScreen && styles.assetNameSmall,
                  isTablet && styles.assetNameTablet
                ]}>
                  {asset.emoji} {isSmallScreen ? asset.name.slice(0, 8) : asset.name}
                </Text>
              </View>
              <View style={styles.assetValues}>
                <Text style={[
                  styles.assetValue, 
                  isSmallScreen && styles.assetValueSmall,
                  isTablet && styles.assetValueTablet
                ]}>
                  ${asset.value.toLocaleString()}
                </Text>
                <Text style={[
                  styles.assetPercentage, 
                  isSmallScreen && styles.assetPercentageSmall,
                  isTablet && styles.assetPercentageTablet
                ]}>
                  {((asset.value / totalValue) * 100).toFixed(1)}%
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          {assets.length > (isSmallScreen ? 4 : 6) && (
            <Text style={[
              styles.moreAssetsText,
              isSmallScreen && styles.moreAssetsTextSmall,
              isTablet && styles.moreAssetsTextTablet
            ]}>
              +{assets.length - (isSmallScreen ? 4 : 6)} more assets
            </Text>
          )}
        </View>
      )}

      {/* Performance Insights */}
      {chartType === 'performance' && (
        <View style={[
          styles.performanceInsights, 
          isSmallScreen && styles.performanceInsightsSmall,
          isTablet && styles.performanceInsightsTablet
        ]}>
          <Text style={[
            styles.insightsTitle, 
            isSmallScreen && styles.insightsTitleSmall,
            isTablet && styles.insightsTitleTablet
          ]}>
            Performance Insights
          </Text>
          <View style={[
            styles.insightsGrid, 
            isSmallScreen && styles.insightsGridSmall,
            isTablet && styles.insightsGridTablet
          ]}>
            <View style={styles.insightItem}>
              <Text style={[
                styles.insightLabel, 
                isSmallScreen && styles.insightLabelSmall,
                isTablet && styles.insightLabelTablet
              ]}>
                Best Performer
              </Text>
              <Text style={[
                styles.insightValue, 
                styles.insightValuePositive, 
                isSmallScreen && styles.insightValueSmall,
                isTablet && styles.insightValueTablet
              ]}>
                {assets.length > 0 ? assets.reduce((best, current) => 
                  current.change > best.change ? current : best
                ).name.slice(0, isSmallScreen ? 6 : 10) : 'N/A'}
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={[
                styles.insightLabel, 
                isSmallScreen && styles.insightLabelSmall,
                isTablet && styles.insightLabelTablet
              ]}>
                Worst Performer
              </Text>
              <Text style={[
                styles.insightValue, 
                styles.insightValueNegative, 
                isSmallScreen && styles.insightValueSmall,
                isTablet && styles.insightValueTablet
              ]}>
                {assets.length > 0 ? assets.reduce((worst, current) => 
                  current.change < worst.change ? current : worst
                ).name.slice(0, isSmallScreen ? 6 : 10) : 'N/A'}
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={[
                styles.insightLabel, 
                isSmallScreen && styles.insightLabelSmall,
                isTablet && styles.insightLabelTablet
              ]}>
                Avg. Return
              </Text>
              <Text style={[
                styles.insightValue, 
                isSmallScreen && styles.insightValueSmall,
                isTablet && styles.insightValueTablet
              ]}>
                {assets.length > 0 ? (assets.reduce((sum, asset) => sum + asset.change, 0) / assets.length).toFixed(2) : '0.00'}%
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={[
                styles.insightLabel, 
                isSmallScreen && styles.insightLabelSmall,
                isTablet && styles.insightLabelTablet
              ]}>
                Volatility
              </Text>
              <Text style={[
                styles.insightValue, 
                isSmallScreen && styles.insightValueSmall,
                isTablet && styles.insightValueTablet
              ]}>
                {assets.length > 0 ? Math.sqrt(assets.reduce((sum, asset) => sum + Math.pow(asset.change - totalChange, 2), 0) / assets.length).toFixed(2) : '0.00'}%
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
  containerTablet: {
    padding: Layout.spacing.xl,
    margin: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.xl,
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
  headerTablet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.xl,
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
  titleTablet: {
    fontSize: 28,
  },
  totalValue: {
    fontFamily: 'Nunito-Bold',
    fontSize: 28,
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  totalValueSmall: {
    fontSize: 22,
  },
  totalValueTablet: {
    fontSize: 36,
  },
  totalChange: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
  },
  totalChangeSmall: {
    fontSize: 14,
  },
  totalChangeTablet: {
    fontSize: 20,
  },
  stats: {
    alignItems: 'flex-end',
  },
  statsSmall: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  statsTablet: {
    alignItems: 'flex-end',
    gap: Layout.spacing.md,
  },
  statItem: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  statLabel: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: Colors.neutral[500],
  },
  statLabelSmall: {
    fontSize: 10,
  },
  statLabelTablet: {
    fontSize: 14,
  },
  statValue: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: Colors.neutral[700],
  },
  statValueSmall: {
    fontSize: 12,
  },
  statValueTablet: {
    fontSize: 18,
  },
  statValuePositive: {
    color: '#10B981',
  },
  chartTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Layout.spacing.md,
    // spacing handled per-button via padding/margin to avoid 'gap' usage
  },
  chartTypeContainerSmall: {
    marginBottom: Layout.spacing.sm,
    // spacing handled per-button
  },
  chartTypeContainerTablet: {
    marginBottom: Layout.spacing.lg,
    // spacing handled per-button
  },
  chartTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Layout.borderRadius.sm,
    backgroundColor: Colors.neutral[200],
  },
  chartTypeButtonSmall: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  chartTypeButtonTablet: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: Layout.borderRadius.md,
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
  chartTypeTextTablet: {
    fontSize: 16,
  },
  chartTypeTextActive: {
    color: Colors.card,
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
  timeRangeContainerTablet: {
    marginBottom: Layout.spacing.lg,
    padding: 6,
  },
  timeRangeButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: Layout.borderRadius.sm,
  },
  timeRangeButtonSmall: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  timeRangeButtonTablet: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  timeRangeButtonActive: {
    backgroundColor: Colors.primary[500],
  },
  timeRangeText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 12,
    color: Colors.neutral[600],
  },
  timeRangeTextSmall: {
    fontSize: 10,
  },
  timeRangeTextTablet: {
    fontSize: 16,
  },
  timeRangeTextActive: {
    color: Colors.card,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  chartContainerSmall: {
    marginBottom: Layout.spacing.md,
  },
  chartContainerTablet: {
    marginBottom: Layout.spacing.xl,
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
  chartWrapperSmall: {
    padding: 4,
    borderRadius: Layout.borderRadius.sm,
  },
  chartWrapperTablet: {
    padding: 16,
    borderRadius: Layout.borderRadius.lg,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  chart: {
    borderRadius: Layout.borderRadius.md,
  },
  assetBreakdown: {
    backgroundColor: Colors.neutral[50],
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
  },
  assetBreakdownSmall: {
    padding: Layout.spacing.sm,
  },
  assetBreakdownTablet: {
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
  },
  breakdownTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.neutral[800],
    marginBottom: Layout.spacing.sm,
  },
  breakdownTitleSmall: {
    fontSize: 14,
    marginBottom: Layout.spacing.xs,
  },
  breakdownTitleTablet: {
    fontSize: 20,
    marginBottom: Layout.spacing.md,
  },
  assetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  assetItemSmall: {
    paddingVertical: Layout.spacing.xs,
  },
  assetItemTablet: {
    paddingVertical: Layout.spacing.md,
  },
  assetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assetColorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: Layout.spacing.sm,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  assetColorDotSmall: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
  assetColorDotTablet: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
  },
  assetName: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: Colors.neutral[700],
  },
  assetNameSmall: {
    fontSize: 12,
  },
  assetNameTablet: {
    fontSize: 18,
  },
  assetValues: {
    alignItems: 'flex-end',
  },
  assetValue: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: Colors.neutral[800],
  },
  assetValueSmall: {
    fontSize: 12,
  },
  assetValueTablet: {
    fontSize: 18,
  },
  assetPercentage: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: Colors.neutral[500],
  },
  assetPercentageSmall: {
    fontSize: 10,
  },
  assetPercentageTablet: {
    fontSize: 16,
  },
  moreAssetsText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: Colors.neutral[500],
    textAlign: 'center',
    marginTop: Layout.spacing.sm,
    fontStyle: 'italic',
  },
  moreAssetsTextSmall: {
    fontSize: 10,
    marginTop: Layout.spacing.xs,
  },
  moreAssetsTextTablet: {
    fontSize: 16,
    marginTop: Layout.spacing.md,
  },
  performanceInsights: {
    backgroundColor: Colors.neutral[50],
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
  },
  performanceInsightsSmall: {
    padding: Layout.spacing.sm,
  },
  performanceInsightsTablet: {
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
  },
  insightsTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.neutral[800],
    marginBottom: Layout.spacing.sm,
  },
  insightsTitleSmall: {
    fontSize: 14,
    marginBottom: Layout.spacing.xs,
  },
  insightsTitleTablet: {
    fontSize: 20,
    marginBottom: Layout.spacing.md,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  insightsGridSmall: {
    // gap removed for RN compatibility
  },
  insightsGridTablet: {
    // gap removed for RN compatibility
  },
  insightItem: {
    alignItems: 'center',
    minWidth: '45%',
    marginBottom: Layout.spacing.sm,
  },
  insightLabel: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: Colors.neutral[600],
    marginBottom: 4,
    textAlign: 'center',
  },
  insightLabelSmall: {
    fontSize: 10,
  },
  insightLabelTablet: {
    fontSize: 16,
  },
  insightValue: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: Colors.neutral[800],
    textAlign: 'center',
  },
  insightValueSmall: {
    fontSize: 12,
  },
  insightValueTablet: {
    fontSize: 18,
  },
  insightValuePositive: {
    color: '#10B981',
  },
  insightValueNegative: {
    color: '#EF4444',
  },
});