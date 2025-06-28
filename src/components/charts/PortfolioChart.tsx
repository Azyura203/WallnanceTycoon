import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
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
}

export default function PortfolioChart({
  assets,
  totalValue,
  totalChange,
  timeRange,
  onTimeRangeChange,
}: PortfolioChartProps) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;
  const chartWidth = Math.min(width - (isSmallScreen ? 32 : 48), 380);
  
  const [chartType, setChartType] = useState<'pie' | 'line' | 'performance'>('pie');
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  // Generate historical portfolio data
  const generatePortfolioHistory = () => {
    const points = timeRange === '1D' ? 24 : timeRange === '7D' ? 7 : timeRange === '1M' ? 30 : timeRange === '3M' ? 90 : 365;
    const data = [];
    let currentValue = totalValue;
    
    for (let i = points - 1; i >= 0; i--) {
      const volatility = 0.02; // 2% daily volatility
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
          time = new Date(now.getTime() - i * 60 * 60000); // 1 hour intervals
          labels.push(time.toLocaleTimeString('en-US', { hour: '2-digit' }));
          break;
        case '7D':
          time = new Date(now.getTime() - i * 24 * 60 * 60000); // 1 day intervals
          labels.push(time.toLocaleDateString('en-US', { weekday: 'short' }));
          break;
        case '1M':
          time = new Date(now.getTime() - i * 24 * 60 * 60000);
          labels.push(time.getDate().toString());
          break;
        case '3M':
          time = new Date(now.getTime() - i * 7 * 24 * 60 * 60000); // 1 week intervals
          labels.push(`W${Math.ceil(i / 7)}`);
          break;
        case '1Y':
          time = new Date(now.getTime() - i * 30 * 24 * 60 * 60000); // 1 month intervals
          labels.push(time.toLocaleDateString('en-US', { month: 'short' }));
          break;
        default:
          labels.push(i.toString());
      }
    }
    return labels;
  };

  // Prepare pie chart data
  const pieData = assets
    .filter(asset => asset.value > 0)
    .map((asset, index) => ({
      name: asset.name,
      population: asset.value,
      color: [
        Colors.primary[500],
        Colors.success[500],
        Colors.warning[500],
        Colors.error[500],
        Colors.secondary[500],
        Colors.accent[500],
      ][index % 6],
      legendFontColor: Colors.neutral[600],
      legendFontSize: isSmallScreen ? 10 : 12,
    }));

  // Prepare line chart data
  const lineChartData = {
    labels: generateLabels().length > 10 
      ? generateLabels().filter((_, i) => i % Math.ceil(generateLabels().length / 8) === 0)
      : generateLabels(),
    datasets: [{
      data: portfolioHistory.length > 10 
        ? portfolioHistory.filter((_, i) => i % Math.ceil(portfolioHistory.length / 8) === 0)
        : portfolioHistory,
      color: (opacity = 1) => totalChange >= 0 
        ? `rgba(34, 197, 94, ${opacity})` 
        : `rgba(239, 68, 68, ${opacity})`,
      strokeWidth: 2,
    }],
  };

  // Performance comparison data
  const performanceData = {
    labels: assets.slice(0, 5).map(asset => asset.name.slice(0, 6)),
    datasets: [{
      data: assets.slice(0, 5).map(asset => asset.change),
      color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    }],
  };

  const timeRanges: Array<'1D' | '7D' | '1M' | '3M' | '1Y'> = ['1D', '7D', '1M', '3M', '1Y'];

  return (
    <View style={[styles.container, isSmallScreen && styles.containerSmall]}>
      {/* Header */}
      <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
        <View>
          <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>
            Portfolio Overview
          </Text>
          <Text style={[styles.totalValue, isSmallScreen && styles.totalValueSmall]}>
            ${totalValue.toLocaleString()}
          </Text>
          <Text style={[
            styles.totalChange,
            { color: totalChange >= 0 ? Colors.success[600] : Colors.error[600] },
            isSmallScreen && styles.totalChangeSmall
          ]}>
            {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}% ({timeRange})
          </Text>
        </View>
        
        <View style={[styles.stats, isSmallScreen && styles.statsSmall]}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, isSmallScreen && styles.statLabelSmall]}>Assets</Text>
            <Text style={[styles.statValue, isSmallScreen && styles.statValueSmall]}>
              {assets.length}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, isSmallScreen && styles.statLabelSmall]}>Best Performer</Text>
            <Text style={[styles.statValue, styles.statValuePositive, isSmallScreen && styles.statValueSmall]}>
              {assets.length > 0 ? assets.reduce((best, current) => 
                current.change > best.change ? current : best
              ).name.slice(0, 8) : 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      {/* Chart Type Selector */}
      <View style={[styles.chartTypeContainer, isSmallScreen && styles.chartTypeContainerSmall]}>
        <TouchableOpacity
          style={[
            styles.chartTypeButton,
            chartType === 'pie' && styles.chartTypeButtonActive,
            isSmallScreen && styles.chartTypeButtonSmall
          ]}
          onPress={() => setChartType('pie')}
        >
          <Text style={[
            styles.chartTypeText,
            chartType === 'pie' && styles.chartTypeTextActive,
            isSmallScreen && styles.chartTypeTextSmall
          ]}>
            🥧 Distribution
          </Text>
        </TouchableOpacity>
        
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
            📈 History
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chartTypeButton,
            chartType === 'performance' && styles.chartTypeButtonActive,
            isSmallScreen && styles.chartTypeButtonSmall
          ]}
          onPress={() => setChartType('performance')}
        >
          <Text style={[
            styles.chartTypeText,
            chartType === 'performance' && styles.chartTypeTextActive,
            isSmallScreen && styles.chartTypeTextSmall
          ]}>
            🏆 Performance
          </Text>
        </TouchableOpacity>
      </View>

      {/* Time Range Selector (for line chart) */}
      {chartType === 'line' && (
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
      )}

      {/* Chart Display */}
      <View style={[styles.chartContainer, isSmallScreen && styles.chartContainerSmall]}>
        {chartType === 'pie' && pieData.length > 0 ? (
          <PieChart
            data={pieData}
            width={chartWidth}
            height={isSmallScreen ? 180 : 220}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[0, 0]}
            absolute
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
          />
        ) : chartType === 'line' ? (
          <LineChart
            data={lineChartData}
            width={chartWidth}
            height={isSmallScreen ? 180 : 220}
            chartConfig={{
              backgroundColor: Colors.card,
              backgroundGradientFrom: Colors.card,
              backgroundGradientTo: Colors.card,
              decimalPlaces: 0,
              color: (opacity = 1) => totalChange >= 0 
                ? `rgba(34, 197, 94, ${opacity})` 
                : `rgba(239, 68, 68, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: totalChange >= 0 ? Colors.success[500] : Colors.error[500],
              },
              fillShadowGradient: totalChange >= 0 ? Colors.success[500] : Colors.error[500],
              fillShadowGradientOpacity: 0.1,
            }}
            bezier
            style={styles.chart}
            withDots={portfolioHistory.length <= 20}
            withShadow={true}
            withInnerLines={true}
            withOuterLines={false}
            fromZero={false}
          />
        ) : (
          // Performance bar chart using LineChart as bars
          <LineChart
            data={performanceData}
            width={chartWidth}
            height={isSmallScreen ? 180 : 220}
            chartConfig={{
              backgroundColor: Colors.card,
              backgroundGradientFrom: Colors.card,
              backgroundGradientTo: Colors.card,
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: Colors.secondary[500],
              },
            }}
            style={styles.chart}
            withDots={true}
            withInnerLines={true}
            withOuterLines={false}
            fromZero={true}
          />
        )}
      </View>

      {/* Asset Breakdown */}
      {chartType === 'pie' && (
        <View style={[styles.assetBreakdown, isSmallScreen && styles.assetBreakdownSmall]}>
          <Text style={[styles.breakdownTitle, isSmallScreen && styles.breakdownTitleSmall]}>
            Asset Breakdown
          </Text>
          {assets.slice(0, 5).map((asset, index) => (
            <TouchableOpacity
              key={asset.name}
              style={[styles.assetItem, isSmallScreen && styles.assetItemSmall]}
              onPress={() => setSelectedAsset(selectedAsset === asset.name ? null : asset.name)}
            >
              <View style={styles.assetInfo}>
                <View style={[
                  styles.assetColorDot,
                  { backgroundColor: pieData[index]?.color || Colors.neutral[400] }
                ]} />
                <Text style={[styles.assetName, isSmallScreen && styles.assetNameSmall]}>
                  {asset.emoji} {asset.name}
                </Text>
              </View>
              <View style={styles.assetValues}>
                <Text style={[styles.assetValue, isSmallScreen && styles.assetValueSmall]}>
                  ${asset.value.toLocaleString()}
                </Text>
                <Text style={[styles.assetPercentage, isSmallScreen && styles.assetPercentageSmall]}>
                  {((asset.value / totalValue) * 100).toFixed(1)}%
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Performance Insights */}
      {chartType === 'performance' && (
        <View style={[styles.performanceInsights, isSmallScreen && styles.performanceInsightsSmall]}>
          <Text style={[styles.insightsTitle, isSmallScreen && styles.insightsTitleSmall]}>
            Performance Insights
          </Text>
          <View style={[styles.insightsGrid, isSmallScreen && styles.insightsGridSmall]}>
            <View style={styles.insightItem}>
              <Text style={[styles.insightLabel, isSmallScreen && styles.insightLabelSmall]}>
                Best Performer
              </Text>
              <Text style={[styles.insightValue, styles.insightValuePositive, isSmallScreen && styles.insightValueSmall]}>
                {assets.length > 0 ? assets.reduce((best, current) => 
                  current.change > best.change ? current : best
                ).name : 'N/A'}
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={[styles.insightLabel, isSmallScreen && styles.insightLabelSmall]}>
                Worst Performer
              </Text>
              <Text style={[styles.insightValue, styles.insightValueNegative, isSmallScreen && styles.insightValueSmall]}>
                {assets.length > 0 ? assets.reduce((worst, current) => 
                  current.change < worst.change ? current : worst
                ).name : 'N/A'}
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={[styles.insightLabel, isSmallScreen && styles.insightLabelSmall]}>
                Avg. Return
              </Text>
              <Text style={[styles.insightValue, isSmallScreen && styles.insightValueSmall]}>
                {assets.length > 0 ? (assets.reduce((sum, asset) => sum + asset.change, 0) / assets.length).toFixed(2) : '0.00'}%
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={[styles.insightLabel, isSmallScreen && styles.insightLabelSmall]}>
                Volatility
              </Text>
              <Text style={[styles.insightValue, isSmallScreen && styles.insightValueSmall]}>
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
  totalValue: {
    fontFamily: 'Nunito-Bold',
    fontSize: 28,
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  totalValueSmall: {
    fontSize: 22,
  },
  totalChange: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
  },
  totalChangeSmall: {
    fontSize: 14,
  },
  stats: {
    alignItems: 'flex-end',
  },
  statsSmall: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: Layout.spacing.lg,
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
  statValue: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: Colors.neutral[700],
  },
  statValueSmall: {
    fontSize: 12,
  },
  statValuePositive: {
    color: Colors.success[600],
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Layout.borderRadius.sm,
    backgroundColor: Colors.neutral[200],
  },
  chartTypeButtonSmall: {
    paddingVertical: 6,
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
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: Layout.borderRadius.sm,
  },
  timeRangeButtonSmall: {
    paddingVertical: 4,
    paddingHorizontal: 6,
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
  assetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assetColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Layout.spacing.sm,
  },
  assetName: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: Colors.neutral[700],
  },
  assetNameSmall: {
    fontSize: 12,
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
  assetPercentage: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: Colors.neutral[500],
  },
  assetPercentageSmall: {
    fontSize: 10,
  },
  performanceInsights: {
    backgroundColor: Colors.neutral[50],
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
  },
  performanceInsightsSmall: {
    padding: Layout.spacing.sm,
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
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  insightsGridSmall: {
    gap: Layout.spacing.xs,
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
  },
  insightLabelSmall: {
    fontSize: 10,
  },
  insightValue: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: Colors.neutral[800],
  },
  insightValueSmall: {
    fontSize: 12,
  },
  insightValuePositive: {
    color: Colors.success[600],
  },
  insightValueNegative: {
    color: Colors.error[600],
  },
});