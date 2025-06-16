import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useWindowDimensions } from 'react-native';
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
import { VictoryLine, VictoryChart, VictoryTheme } from 'victory-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

// TODO: Replace getChartData with real historical price data from API
const getChartData = (price: number, range: '1D' | '7D' | '1M') => {
  const points = range === '1D' ? 10 : range === '7D' ? 20 : 30;
  const step = range === '1D' ? 0.01 : range === '7D' ? 0.05 : 0.1;
  const data = Array.from({ length: points }, (_, i) =>
    parseFloat((price * (1 + i * step * (Math.random() > 0.5 ? 1 : -1))).toFixed(2))
  );
  return {
    labels: Array.from({ length: points }, (_, i) => `${i + 1}`),
    datasets: [
      {
        data,
        color: () => price > 0 ? 'rgba(0, 200, 83, 1)' : 'rgba(229, 57, 53, 1)',
        strokeWidth: 2,
      },
    ],
  };
};
export default function PortfolioScreen() {
  const { balance, portfolio } = usePlayerFinances();
  const prices = useMarketPrices();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isMobile = width < 420;

  const shares = useCompanyShares();
  const enrichedPortfolio = Object.entries(portfolio).map(([name, entry]) => {
    const marketItem = [...prices, ...shares].find(p => p.name === name);
    const currentPrice = marketItem?.price ?? entry.avgPrice;

    const totalValue = currentPrice * entry.quantity;
    const totalCost = entry.avgPrice * entry.quantity;
    const gainLoss = totalValue - totalCost;

    return {
      id: name,
      name,
      emoji: marketItem?.emoji || '❓',
      quantity: entry.quantity,
      avgPrice: entry.avgPrice,
      currentPrice,
      totalValue,
      gainLoss,
    };
  });

  const todayPL = enrichedPortfolio.reduce((acc, coin) => {
    const dailyChange = coin.currentPrice * 0.02; // simulate a 2% move for today
    return acc + dailyChange * coin.quantity;
  }, 0);

  const monthPL = enrichedPortfolio.reduce((acc, coin) => {
    const monthlyChange = coin.currentPrice * 0.1; // simulate a 10% move over 30 days
    return acc + monthlyChange * coin.quantity;
  }, 0);

  // Auto-save portfolio and balance when enrichedPortfolio changes
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

  const [selectedRange, setSelectedRange] = useState<'1D' | '7D' | '1M'>('1D');

  // Sorting state
  const [sortBy, setSortBy] = useState<'Name' | 'Gain/Loss' | 'Value'>('Name');

  // Animation for badge
  const badgeAnim = useState(new Animated.Value(0))[0];
  useEffect(() => {
    Animated.timing(badgeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Portfolio</Text>
          <Text style={styles.subtitle}>Your Current Assets</Text>
          <Text style={styles.balance}>💰 Balance: ${balance.toLocaleString()}</Text>
        </View>

        {/* Total Portfolio Value Section */}
        <View style={{ marginBottom: Layout.spacing.lg }}>
          <Text style={{ fontFamily: 'Nunito-Bold', fontSize: 16, color: Colors.neutral[800], marginBottom: 4 }}>
            📊 Total Portfolio Value:
          </Text>
          <Text style={{ fontFamily: 'Nunito-Bold', fontSize: 24, color: Colors.primary[700] }}>
            ${enrichedPortfolio.reduce((acc, cur) => acc + cur.totalValue, 0).toFixed(2)}
          </Text>
          {/* P&L Snapshot Section */}
          <View style={{ marginTop: Layout.spacing.sm, marginBottom: Layout.spacing.lg }}>
            <Text style={{ fontFamily: 'Nunito-Bold', fontSize: 16, color: Colors.neutral[800], marginBottom: 4 }}>
              📈 P&amp;L Snapshot:
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 14, color: Colors.neutral[600] }}>
                Today: <Text style={{ color: todayPL >= 0 ? 'green' : 'red' }}>
                  {todayPL >= 0 ? '+' : ''}${todayPL.toFixed(2)}
                </Text>
              </Text>
              <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 14, color: Colors.neutral[600] }}>
                30 Days: <Text style={{ color: monthPL >= 0 ? 'green' : 'red' }}>
                  {monthPL >= 0 ? '+' : ''}${monthPL.toFixed(2)}
                </Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Pie Chart Section */}
        {enrichedPortfolio.length > 0 && (
          <View style={{
            padding: Layout.spacing.md,
            marginBottom: Layout.spacing.lg,
            backgroundColor: Colors.card,
            borderRadius: Layout.borderRadius.md,
            alignItems: 'center',
            ...Layout.shadows.small
          }}>
            <Text style={{ fontFamily: 'Nunito-Bold', fontSize: 18, color: Colors.primary[700], marginBottom: 12 }}>
              🧁 Asset Distribution
            </Text>
            <PieChart
              data={enrichedPortfolio.map((coin, index) => ({
                name: coin.name,
                population: parseFloat(coin.totalValue.toFixed(2)),
                color: ['#4CAF50', '#F44336', '#2196F3', '#FF9800', '#9C27B0', '#00BCD4'][index % 6],
                legendFontColor: '#555',
                legendFontSize: 12,
              }))}
              width={Dimensions.get('window').width - Layout.spacing.lg * 2}
              height={160}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="10"
              center={[0, 0]}
              absolute
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: () => '#333',
              }}
            />
          </View>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: Layout.spacing.lg }}>
          {['1D', '7D', '1M'].map((range) => (
            <TouchableOpacity
              key={range}
              onPress={() => setSelectedRange(range as '1D' | '7D' | '1M')}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 12,
                backgroundColor: selectedRange === range ? Colors.primary[500] : Colors.neutral[300],
                borderRadius: 6,
                marginHorizontal: 4,
              }}
            >
              <Text style={{
                color: selectedRange === range ? '#fff' : '#333',
                fontFamily: 'Nunito-Bold',
                fontSize: 14,
              }}>
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.portfolioSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.portfolioTitle}>Current Holdings</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Layout.spacing.md }}>
            <Text style={{ fontFamily: 'Nunito-Bold', fontSize: 16, color: Colors.neutral[700] }}>Sort By:</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {['Name', 'Gain/Loss', 'Value'].map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => setSortBy(option as 'Name' | 'Gain/Loss' | 'Value')}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  backgroundColor: sortBy === option ? Colors.primary[500] : Colors.neutral[200],
                  borderRadius: 6,
                }}
              >
                <Text style={{
                  fontSize: 13,
                  fontFamily: 'Nunito-Regular',
                  color: sortBy === option ? '#fff' : '#000',
                }}>{option}</Text>
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
            <View key={coin.id} style={styles.assetCard}>
              <View style={styles.assetHeader}>
                <View style={styles.buttonContainer}>
                  <Text style={styles.assetName}>
                    {coin.emoji} {coin.name}
                  </Text>
                  <Animated.Text style={{
                    fontSize: 12,
                    fontFamily: 'Nunito-Bold',
                    color: coin.gainLoss >= 0 ? 'green' : 'red',
                    backgroundColor: coin.gainLoss >= 0 ? 'rgba(0, 200, 83, 0.1)' : 'rgba(229, 57, 53, 0.1)',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 6,
                    opacity: badgeAnim,
                    transform: [{ translateY: badgeAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
                  }}>
                    {coin.gainLoss >= 0 ? '+' : ''}
                    {coin.totalValue !== 0 ? ((coin.gainLoss / coin.totalValue) * 100).toFixed(2) : '0.00'}%
                  </Animated.Text>
                </View>
              </View>
              <View style={styles.assetDetails}>
                <Text style={styles.holdingText}>Holdings: {coin.quantity}</Text>
                <Text style={styles.priceText}>Avg Buy Price: ${coin.avgPrice.toFixed(2)}</Text>
                <Text style={styles.priceText}>Current Price: ${coin.currentPrice.toFixed(2)}</Text>
                <Text style={[styles.priceText, { color: coin.gainLoss >= 0 ? 'green' : 'red' }]}>
                  {coin.gainLoss >= 0 ? 'Profit' : 'Loss'}: ${coin.gainLoss.toFixed(2)}
                </Text>
                {/* Advanced Metrics Section */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 13, color: Colors.neutral[600] }}>
                    Total Cost: ${coin.avgPrice * coin.quantity === 0 ? '0.00' : (coin.avgPrice * coin.quantity).toFixed(2)}
                  </Text>
                  <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 13, color: Colors.neutral[600] }}>
                    Current Value: ${coin.totalValue.toFixed(2)}
                  </Text>
                </View>
                <View style={{ marginVertical: 8 }}>
                  <LineChart
                    data={getChartData(coin.currentPrice, selectedRange)}
                    width={Math.max(240, Dimensions.get('window').width - Layout.spacing.lg * 2 - 32)}
                    height={120}
                    withDots={false}
                    withShadow={true}
                    withInnerLines={true}
                    withOuterLines={false}
                    withVerticalLabels={false}
                    withHorizontalLabels={true}
                    chartConfig={{
                      backgroundColor: '#ffffff',
                      backgroundGradientFrom: '#ffffff',
                      backgroundGradientTo: '#ffffff',
                      decimalPlaces: 2,
                      color: (opacity = 1) =>
                        coin.gainLoss >= 0
                          ? `rgba(0, 200, 83, ${opacity})`
                          : `rgba(229, 57, 53, ${opacity})`,
                      labelColor: () => '#999',
                      strokeWidth: 2,
                      propsForDots: {
                        r: '0',
                      },
                      propsForBackgroundLines: {
                        stroke: '#eee',
                      },
                      propsForLabels: {
                        fontSize: 10,
                        fontFamily: 'Nunito-Regular',
                      },
                    }}
                    bezier
                    style={{
                      borderRadius: 8,
                      marginTop: 4,
                      alignSelf: 'center',
                    }}
                  />
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: Layout.spacing.md }}>
                <GameButton
                  title="📈 Buy More"
                  onPress={() => {
                    (navigation as any).navigate('market', {
                      action: 'buy',
                      coin: coin.name,
                    });
                  }}
                  style={[styles.buyButton, isMobile && { paddingVertical: 10 }]}
                />
                <GameButton
                  title="📉 Sell Asset"
                  onPress={() => {
                    (navigation as any).navigate('market', {
                      action: 'sell',
                      coin: coin.name,
                    });
                  }}
                  style={[styles.sellButton, isMobile && { paddingVertical: 10 }]}
                />
              </View>
            </View>
          ))}
          {enrichedPortfolio.length === 0 && (
            <View style={styles.emptyPortfolio}>
              <Text style={styles.emptyPortfolioText}>No assets yet</Text>
              <Text style={styles.emptyPortfolioSubtext}>Buy some coins to start building your portfolio!</Text>
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
  },
  header: {
    marginBottom: Layout.spacing.xl,
    marginTop: Layout.spacing.xl,
  },
  title: {
    fontFamily: 'Nunito-Bold',
    fontSize: 32,
    color: Colors.primary[700],
    marginBottom: Layout.spacing.xs,
  },
  subtitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: 18,
    color: Colors.neutral[600],
  },
  balance: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: Colors.primary[600],
    marginTop: Layout.spacing.md,
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
buttonContainer: {
  flexDirection: 'row',
  gap: Layout.spacing.md,
  borderTopWidth: 1,
  borderTopColor: Colors.neutral[200],
  paddingTop: Layout.spacing.md,
  marginTop: Layout.spacing.md,
},
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  assetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
  },
  assetName: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.neutral[800],
  },
  assetDetails: {
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  holdingText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: Colors.neutral[700],
  },
  priceText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: Colors.primary[600],
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
  emptyPortfolio: {
    alignItems: 'center',
    padding: Layout.spacing.xl,
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    ...Layout.shadows.small,
  },
  emptyPortfolioText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: Colors.neutral[600],
    marginBottom: Layout.spacing.xs,
  },
  emptyPortfolioSubtext: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.neutral[500],
  },
});