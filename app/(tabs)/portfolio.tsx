import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Animated } from 'react-native';
import Colors from '@/src/constants/Colors';
import Layout from '@/src/constants/Layout';
import GameButton from '@/src/components/buttons/GameButton';
import { usePlayerFinances } from '@/src/hooks/finance/usePlayerFinances';
import { useMarketPrices } from '@/src/hooks/market/useMarketPrices';
import { useNavigation } from 'expo-router';
import { saveGameData } from '@/utils/saveGame';
import { useEffect, useState } from 'react';
import { useCompanyShares } from '@/src/hooks/useCompanyShares';
import DetailedChart from '@/src/components/charts/DetailedChart';
import PortfolioChart from '@/src/components/charts/PortfolioChart';

export default function PortfolioScreen() {
  const { balance, portfolio } = usePlayerFinances();
  const prices = useMarketPrices();
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 400;
  const isMediumScreen = width < 600;
  const isTablet = width >= 768;

  const shares = useCompanyShares();
  const enrichedPortfolio = Object.entries(portfolio).map(([name, entry]) => {
    const marketItem = [...prices, ...shares].find(p => p.name === name);
    const currentPrice = marketItem?.price ?? entry.avgPrice;
    const totalCost = entry.avgPrice * entry.quantity;
    const totalValue = currentPrice * entry.quantity;
    const gainLoss = totalValue - totalCost;
    const roi = totalCost === 0 ? 0 : (gainLoss / totalCost) * 100;

    return {
      id: name,
      name,
      emoji: marketItem?.emoji || '❓',
      quantity: entry.quantity,
      avgPrice: entry.avgPrice,
      currentPrice,
      totalValue,
      totalCost,
      gainLoss,
      roi,
    };
  });

  const todayPL = enrichedPortfolio.reduce((acc, coin) => {
    const yesterdayPrice = coin.currentPrice / 1.02;
    const dailyChange = coin.currentPrice - yesterdayPrice;
    return acc + dailyChange * coin.quantity;
  }, 0);

  const monthPL = enrichedPortfolio.reduce((acc, coin) => {
    const monthlyChange = coin.currentPrice * 0.1;
    return acc + monthlyChange * coin.quantity;
  }, 0);

  useEffect(() => {
    const saveData = async () => {
      const gameData = {
        balance,
        portfolio,
      };
      await saveGameData(gameData);
    };
    saveData();
  }, [balance, portfolio]);

  const [selectedRange, setSelectedRange] = useState<'1D' | '7D' | '1M' | '3M' | '1Y'>('1D');
  const [sortBy, setSortBy] = useState<'Name' | 'Gain/Loss' | 'Value'>('Name');
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  const badgeAnim = useState(new Animated.Value(0))[0];
  useEffect(() => {
    Animated.timing(badgeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const totalPortfolioValue = enrichedPortfolio.reduce((acc, cur) => acc + cur.totalValue, 0);
  const totalPortfolioChange = enrichedPortfolio.length > 0 
    ? enrichedPortfolio.reduce((acc, cur) => acc + cur.roi, 0) / enrichedPortfolio.length 
    : 0;

  // Prepare data for portfolio chart with responsive sizing
  const portfolioAssets = enrichedPortfolio.map(asset => ({
    name: asset.name,
    value: asset.totalValue,
    quantity: asset.quantity,
    change: asset.roi,
    emoji: asset.emoji,
  }));

  // Generate price history for selected asset
  const generateAssetHistory = (currentPrice: number, range: '1H' | '1D' | '7D' | '1M' | '3M' | '1Y') => {
    const points = range === '1H' ? 12 : range === '1D' ? 24 : range === '7D' ? 7 : range === '1M' ? 30 : range === '3M' ? 90 : 365;
    const data = [];
    let price = currentPrice;
    
    for (let i = points - 1; i >= 0; i--) {
      const volatility = 0.02; // 2% volatility
      const change = (Math.random() - 0.5) * volatility;
      price = price * (1 + change);
      data.push(parseFloat(price.toFixed(2)));
    }
    
    return data.reverse();
  };

  const [assetTimeRange, setAssetTimeRange] = useState<'1H' | '1D' | '7D' | '1M' | '3M' | '1Y'>('1D');

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={[
          styles.header, 
          isSmallScreen && styles.headerSmall,
          isTablet && styles.headerTablet
        ]}>
          <Text style={[
            styles.title, 
            isSmallScreen && styles.titleSmall,
            isTablet && styles.titleTablet
          ]}>
            Portfolio
          </Text>
          <Text style={[
            styles.subtitle, 
            isSmallScreen && styles.subtitleSmall,
            isTablet && styles.subtitleTablet
          ]}>
            Your Current Assets
          </Text>
          <Text style={[
            styles.balance, 
            isSmallScreen && styles.balanceSmall,
            isTablet && styles.balanceTablet
          ]}>
            💰 Balance: ${balance.toLocaleString()}
          </Text>
        </View>

        <View style={[
          styles.portfolioValueSection, 
          isSmallScreen && styles.portfolioValueSectionSmall,
          isTablet && styles.portfolioValueSectionTablet
        ]}>
          <Text style={[
            styles.portfolioValueLabel, 
            isSmallScreen && styles.portfolioValueLabelSmall,
            isTablet && styles.portfolioValueLabelTablet
          ]}>
            📊 Total Portfolio Value:
          </Text>
          <Text style={[
            styles.portfolioValueAmount, 
            isSmallScreen && styles.portfolioValueAmountSmall,
            isTablet && styles.portfolioValueAmountTablet
          ]}>
            ${totalPortfolioValue.toFixed(2)}
          </Text>
          
          <View style={[
            styles.plSnapshotSection, 
            isSmallScreen && styles.plSnapshotSectionSmall,
            isTablet && styles.plSnapshotSectionTablet
          ]}>
            <Text style={[
              styles.plSnapshotLabel, 
              isSmallScreen && styles.plSnapshotLabelSmall,
              isTablet && styles.plSnapshotLabelTablet
            ]}>
              📈 P&L Snapshot:
            </Text>
            <View style={[
              styles.plSnapshotRow, 
              isSmallScreen && styles.plSnapshotRowSmall,
              isTablet && styles.plSnapshotRowTablet
            ]}>
              <Text style={[
                styles.plSnapshotItem, 
                isSmallScreen && styles.plSnapshotItemSmall,
                isTablet && styles.plSnapshotItemTablet
              ]}>
                Today: <Text style={{ color: todayPL >= 0 ? 'green' : 'red' }}>
                  {todayPL >= 0 ? '+' : ''}${todayPL.toFixed(2)}
                </Text>
              </Text>
              <Text style={[
                styles.plSnapshotItem, 
                isSmallScreen && styles.plSnapshotItemSmall,
                isTablet && styles.plSnapshotItemTablet
              ]}>
                30 Days: <Text style={{ color: monthPL >= 0 ? 'green' : 'red' }}>
                  {monthPL >= 0 ? '+' : ''}${monthPL.toFixed(2)}
                </Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Enhanced Portfolio Chart with Responsive Sizing */}
        {enrichedPortfolio.length > 0 && (
          <PortfolioChart
            assets={portfolioAssets}
            totalValue={totalPortfolioValue}
            totalChange={totalPortfolioChange}
            timeRange={selectedRange}
            onTimeRangeChange={setSelectedRange}
            width={width}
            height={height}
            isSmallScreen={isSmallScreen}
            isMediumScreen={isMediumScreen}
            isTablet={isTablet}
          />
        )}

        {/* Individual Asset Detailed Chart */}
        {selectedAsset && enrichedPortfolio.find(asset => asset.name === selectedAsset) && (
          <DetailedChart
            data={generateAssetHistory(
              enrichedPortfolio.find(asset => asset.name === selectedAsset)!.currentPrice,
              assetTimeRange
            )}
            title={`${selectedAsset} Analysis`}
            timeRange={assetTimeRange}
            onTimeRangeChange={setAssetTimeRange}
            currentPrice={enrichedPortfolio.find(asset => asset.name === selectedAsset)!.currentPrice}
            change={enrichedPortfolio.find(asset => asset.name === selectedAsset)!.roi}
            volume={Math.floor(Math.random() * 1000000)}
            marketCap={Math.floor(Math.random() * 10000000)}
            high24h={enrichedPortfolio.find(asset => asset.name === selectedAsset)!.currentPrice * 1.05}
            low24h={enrichedPortfolio.find(asset => asset.name === selectedAsset)!.currentPrice * 0.95}
            showVolume={true}
            showIndicators={true}
          />
        )}

        <View style={styles.portfolioSection}>
          <View style={styles.sectionHeader}>
            <Text style={[
              styles.portfolioTitle, 
              isSmallScreen && styles.portfolioTitleSmall,
              isTablet && styles.portfolioTitleTablet
            ]}>
              Current Holdings
            </Text>
          </View>

          <View style={[
            styles.sortSection, 
            isSmallScreen && styles.sortSectionSmall,
            isTablet && styles.sortSectionTablet
          ]}>
            <Text style={[
              styles.sortLabel, 
              isSmallScreen && styles.sortLabelSmall,
              isTablet && styles.sortLabelTablet
            ]}>
              Sort By:
            </Text>
            <View style={[
              styles.sortButtons, 
              isSmallScreen && styles.sortButtonsSmall,
              isTablet && styles.sortButtonsTablet
            ]}>
              {['Name', 'Gain/Loss', 'Value'].map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setSortBy(option as 'Name' | 'Gain/Loss' | 'Value')}
                  style={[
                    styles.sortButton,
                    sortBy === option && styles.sortButtonActive,
                    isSmallScreen && styles.sortButtonSmall,
                    isTablet && styles.sortButtonTablet
                  ]}
                >
                  <Text style={[
                    styles.sortButtonText,
                    sortBy === option && styles.sortButtonTextActive,
                    isSmallScreen && styles.sortButtonTextSmall,
                    isTablet && styles.sortButtonTextTablet
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {[...enrichedPortfolio]
            .sort((a, b) => {
              switch (sortBy) {
                case 'Name': return a.name.localeCompare(b.name);
                case 'Gain/Loss': return b.gainLoss - a.gainLoss;
                case 'Value': return b.totalValue - a.totalValue;
              }
            })
            .map((coin) => (
            <View key={coin.id} style={[
              styles.assetCard, 
              isSmallScreen && styles.assetCardSmall,
              isTablet && styles.assetCardTablet
            ]}>
              <TouchableOpacity
                style={styles.assetHeader}
                onPress={() => setSelectedAsset(selectedAsset === coin.name ? null : coin.name)}
              >
                <View style={styles.assetHeaderContent}>
                  <Text style={[
                    styles.assetName, 
                    isSmallScreen && styles.assetNameSmall,
                    isTablet && styles.assetNameTablet
                  ]}>
                    {coin.emoji} {coin.name}
                  </Text>
                  <View style={styles.assetHeaderRight}>
                    <Animated.Text style={[
                      styles.assetBadge,
                      {
                        backgroundColor: coin.gainLoss >= 0 ? 'rgba(0, 200, 83, 0.1)' : 'rgba(229, 57, 53, 0.1)',
                        color: coin.gainLoss >= 0 ? 'green' : 'red',
                        opacity: badgeAnim,
                        transform: [{ translateY: badgeAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
                      },
                      isSmallScreen && styles.assetBadgeSmall,
                      isTablet && styles.assetBadgeTablet
                    ]}>
                      {coin.gainLoss >= 0 ? '+' : ''}
                      {coin.totalValue !== 0 ? ((coin.gainLoss / coin.totalValue) * 100).toFixed(2) : '0.00'}%
                    </Animated.Text>
                    <Text style={[
                      styles.expandIcon, 
                      isSmallScreen && styles.expandIconSmall,
                      isTablet && styles.expandIconTablet
                    ]}>
                      {selectedAsset === coin.name ? '📊' : '📈'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              
              <View style={[
                styles.assetDetails, 
                isSmallScreen && styles.assetDetailsSmall,
                isTablet && styles.assetDetailsTablet
              ]}>
                <Text style={[
                  styles.holdingText, 
                  isSmallScreen && styles.holdingTextSmall,
                  isTablet && styles.holdingTextTablet
                ]}>
                  Holdings: {coin.quantity}
                </Text>
                <Text style={[
                  styles.priceText, 
                  isSmallScreen && styles.priceTextSmall,
                  isTablet && styles.priceTextTablet
                ]}>
                  Avg Buy Price: ${coin.avgPrice.toFixed(2)}
                </Text>
                <Text style={[
                  styles.priceText, 
                  isSmallScreen && styles.priceTextSmall,
                  isTablet && styles.priceTextTablet
                ]}>
                  Current Price: ${coin.currentPrice.toFixed(2)}
                </Text>
                <Text style={[
                  styles.priceText,
                  { color: coin.gainLoss >= 0 ? 'green' : 'red' },
                  isSmallScreen && styles.priceTextSmall,
                  isTablet && styles.priceTextTablet
                ]}>
                  {coin.gainLoss >= 0 ? 'Profit' : 'Loss'}: ${coin.gainLoss.toFixed(2)}
                </Text>
                
                <View style={[
                  styles.metricsRow, 
                  isSmallScreen && styles.metricsRowSmall,
                  isTablet && styles.metricsRowTablet
                ]}>
                  <Text style={[
                    styles.metricText, 
                    isSmallScreen && styles.metricTextSmall,
                    isTablet && styles.metricTextTablet
                  ]}>
                    Total Cost: ${coin.avgPrice * coin.quantity === 0 ? '0.00' : (coin.avgPrice * coin.quantity).toFixed(2)}
                  </Text>
                  <Text style={[
                    styles.metricText, 
                    isSmallScreen && styles.metricTextSmall,
                    isTablet && styles.metricTextTablet
                  ]}>
                    Current Value: ${coin.totalValue.toFixed(2)}
                  </Text>
                </View>
              </View>
              
              <View style={[
                styles.buttonContainer, 
                isSmallScreen && styles.buttonContainerSmall,
                isTablet && styles.buttonContainerTablet
              ]}>
                <GameButton
                  title="📈 Buy More"
                  onPress={() => {
                    (navigation as any).navigate('market', {
                      action: 'buy',
                      coin: coin.name,
                    });
                  }}
                  style={[
                    styles.buyButton, 
                    isSmallScreen && styles.actionButtonSmall,
                    isTablet && styles.actionButtonTablet
                  ]}
                  textStyle={[
                    styles.buttonText, 
                    isSmallScreen && styles.buttonTextSmall,
                    isTablet && styles.buttonTextTablet
                  ]}
                />
                <GameButton
                  title="📉 Sell Asset"
                  onPress={() => {
                    (navigation as any).navigate('market', {
                      action: 'sell',
                      coin: coin.name,
                    });
                  }}
                  style={[
                    styles.sellButton, 
                    isSmallScreen && styles.actionButtonSmall,
                    isTablet && styles.actionButtonTablet
                  ]}
                  textStyle={[
                    styles.buttonText, 
                    isSmallScreen && styles.buttonTextSmall,
                    isTablet && styles.buttonTextTablet
                  ]}
                />
                <TouchableOpacity
                  style={[
                    styles.analyzeButton, 
                    isSmallScreen && styles.analyzeButtonSmall,
                    isTablet && styles.analyzeButtonTablet
                  ]}
                  onPress={() => setSelectedAsset(selectedAsset === coin.name ? null : coin.name)}
                >
                  <Text style={[
                    styles.analyzeButtonText, 
                    isSmallScreen && styles.analyzeButtonTextSmall,
                    isTablet && styles.analyzeButtonTextTablet
                  ]}>
                    📊 Analyze
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          {enrichedPortfolio.length === 0 && (
            <View style={[
              styles.emptyPortfolio, 
              isSmallScreen && styles.emptyPortfolioSmall,
              isTablet && styles.emptyPortfolioTablet
            ]}>
              <Text style={[
                styles.emptyPortfolioText, 
                isSmallScreen && styles.emptyPortfolioTextSmall,
                isTablet && styles.emptyPortfolioTextTablet
              ]}>
                No assets yet
              </Text>
              <Text style={[
                styles.emptyPortfolioSubtext, 
                isSmallScreen && styles.emptyPortfolioSubtextSmall,
                isTablet && styles.emptyPortfolioSubtextTablet
              ]}>
                Buy some coins to start building your portfolio!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xxl,
  },
  header: {
    marginBottom: Layout.spacing.xl,
    marginTop: Layout.spacing.xl,
  },
  headerSmall: {
    marginBottom: Layout.spacing.lg,
    marginTop: Layout.spacing.lg,
  },
  headerTablet: {
    marginBottom: Layout.spacing.xxl,
    marginTop: Layout.spacing.xxl,
  },
  title: {
    fontFamily: 'Nunito-Bold',
    fontSize: 32,
    color: Colors.primary[700],
    marginBottom: Layout.spacing.xs,
  },
  titleSmall: {
    fontSize: 24,
  },
  titleTablet: {
    fontSize: 40,
  },
  subtitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: 18,
    color: Colors.neutral[600],
  },
  subtitleSmall: {
    fontSize: 14,
  },
  subtitleTablet: {
    fontSize: 22,
  },
  balance: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: Colors.primary[600],
    marginTop: Layout.spacing.md,
  },
  balanceSmall: {
    fontSize: 16,
    marginTop: Layout.spacing.sm,
  },
  balanceTablet: {
    fontSize: 24,
    marginTop: Layout.spacing.lg,
  },
  portfolioValueSection: {
    marginBottom: Layout.spacing.lg,
  },
  portfolioValueSectionSmall: {
    marginBottom: Layout.spacing.md,
  },
  portfolioValueSectionTablet: {
    marginBottom: Layout.spacing.xl,
  },
  portfolioValueLabel: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.neutral[800],
    marginBottom: 4,
  },
  portfolioValueLabelSmall: {
    fontSize: 14,
  },
  portfolioValueLabelTablet: {
    fontSize: 20,
  },
  portfolioValueAmount: {
    fontFamily: 'Nunito-Bold',
    fontSize: 24,
    color: Colors.primary[700],
  },
  portfolioValueAmountSmall: {
    fontSize: 20,
  },
  portfolioValueAmountTablet: {
    fontSize: 32,
  },
  plSnapshotSection: {
    marginTop: Layout.spacing.sm,
    marginBottom: Layout.spacing.lg,
  },
  plSnapshotSectionSmall: {
    marginTop: Layout.spacing.xs,
    marginBottom: Layout.spacing.md,
  },
  plSnapshotSectionTablet: {
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.xl,
  },
  plSnapshotLabel: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.neutral[800],
    marginBottom: 4,
  },
  plSnapshotLabelSmall: {
    fontSize: 14,
  },
  plSnapshotLabelTablet: {
    fontSize: 20,
  },
  plSnapshotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  plSnapshotRowSmall: {
    flexDirection: 'column',
    gap: 4,
  },
  plSnapshotRowTablet: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  plSnapshotItem: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.neutral[600],
  },
  plSnapshotItemSmall: {
    fontSize: 12,
  },
  plSnapshotItemTablet: {
    fontSize: 18,
  },
  portfolioSection: {
    marginBottom: Layout.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  portfolioTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: Colors.primary[600],
  },
  portfolioTitleSmall: {
    fontSize: 18,
  },
  portfolioTitleTablet: {
    fontSize: 26,
  },
  sortSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  sortSectionSmall: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: Layout.spacing.sm,
  },
  sortSectionTablet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  sortLabel: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.neutral[700],
  },
  sortLabelSmall: {
    fontSize: 14,
  },
  sortLabelTablet: {
    fontSize: 20,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButtonsSmall: {
    gap: 6,
  },
  sortButtonsTablet: {
    gap: 12,
  },
  sortButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.neutral[200],
    borderRadius: 6,
  },
  sortButtonSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  sortButtonTablet: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sortButtonActive: {
    backgroundColor: Colors.primary[500],
  },
  sortButtonText: {
    fontSize: 13,
    fontFamily: 'Nunito-Regular',
    color: '#000',
  },
  sortButtonTextSmall: {
    fontSize: 11,
  },
  sortButtonTextTablet: {
    fontSize: 16,
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  assetCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: Layout.spacing.md,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  assetCardSmall: {
    borderRadius: 12,
    padding: 12,
    marginBottom: Layout.spacing.sm,
  },
  assetCardTablet: {
    borderRadius: 20,
    padding: 24,
    marginBottom: Layout.spacing.lg,
  },
  assetHeader: {
    marginBottom: Layout.spacing.md,
  },
  assetHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assetHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  assetName: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.neutral[800],
  },
  assetNameSmall: {
    fontSize: 14,
  },
  assetNameTablet: {
    fontSize: 20,
  },
  assetBadge: {
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  assetBadgeSmall: {
    fontSize: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  assetBadgeTablet: {
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  expandIcon: {
    fontSize: 16,
  },
  expandIconSmall: {
    fontSize: 14,
  },
  expandIconTablet: {
    fontSize: 20,
  },
  assetDetails: {
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  assetDetailsSmall: {
    gap: Layout.spacing.xs,
    marginBottom: Layout.spacing.sm,
  },
  assetDetailsTablet: {
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  holdingText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: Colors.neutral[700],
  },
  holdingTextSmall: {
    fontSize: 12,
  },
  holdingTextTablet: {
    fontSize: 18,
  },
  priceText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: Colors.primary[600],
  },
  priceTextSmall: {
    fontSize: 12,
  },
  priceTextTablet: {
    fontSize: 18,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metricsRowSmall: {
    flexDirection: 'column',
    gap: 4,
    marginTop: 4,
  },
  metricsRowTablet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  metricText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: Colors.neutral[600],
  },
  metricTextSmall: {
    fontSize: 11,
  },
  metricTextTablet: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    paddingTop: Layout.spacing.md,
    marginTop: Layout.spacing.md,
  },
  buttonContainerSmall: {
    gap: Layout.spacing.sm,
    paddingTop: Layout.spacing.sm,
    marginTop: Layout.spacing.sm,
  },
  buttonContainerTablet: {
    gap: Layout.spacing.lg,
    paddingTop: Layout.spacing.lg,
    marginTop: Layout.spacing.lg,
  },
  buyButton: {
    backgroundColor: Colors.success[500],
    flex: 1,
    borderRadius: 50,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sellButton: {
    backgroundColor: Colors.error[500],
    flex: 1,
    borderRadius: 50,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  analyzeButton: {
    backgroundColor: Colors.primary[500],
    flex: 1,
    borderRadius: 50,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  analyzeButtonSmall: {
    paddingVertical: 8,
    borderRadius: 25,
  },
  analyzeButtonTablet: {
    paddingVertical: 16,
    borderRadius: 60,
  },
  analyzeButtonText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: 'white',
  },
  analyzeButtonTextSmall: {
    fontSize: 12,
  },
  analyzeButtonTextTablet: {
    fontSize: 18,
  },
  actionButtonSmall: {
    paddingVertical: 8,
    borderRadius: 25,
  },
  actionButtonTablet: {
    paddingVertical: 16,
    borderRadius: 60,
  },
  buttonText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: 'white',
  },
  buttonTextSmall: {
    fontSize: 12,
  },
  buttonTextTablet: {
    fontSize: 18,
  },
  emptyPortfolio: {
    alignItems: 'center',
    padding: Layout.spacing.xl,
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    ...Layout.shadows.small,
  },
  emptyPortfolioSmall: {
    padding: Layout.spacing.lg,
  },
  emptyPortfolioTablet: {
    padding: Layout.spacing.xxl,
    borderRadius: Layout.borderRadius.lg,
  },
  emptyPortfolioText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: Colors.neutral[600],
    marginBottom: Layout.spacing.xs,
  },
  emptyPortfolioTextSmall: {
    fontSize: 16,
  },
  emptyPortfolioTextTablet: {
    fontSize: 24,
  },
  emptyPortfolioSubtext: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.neutral[500],
  },
  emptyPortfolioSubtextSmall: {
    fontSize: 12,
  },
  emptyPortfolioSubtextTablet: {
    fontSize: 18,
  },
});