import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import GameButton from '@/components/GameButton';
import { usePlayerFinances } from '@/hooks/usePlayerFinances';
import { useMarketPrices } from '@/hooks/useMarketPrices';
import { useNavigation } from 'expo-router';
import { saveGameData } from '@/utils/saveGame';
import { useEffect } from 'react';
import { useCompanyShares } from '@/hooks/useCompanyShares';
export default function PortfolioScreen() {
  const { balance, portfolio } = usePlayerFinances();
  const prices = useMarketPrices();
  const navigation = useNavigation();

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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Portfolio</Text>
          <Text style={styles.subtitle}>Your Current Assets</Text>
          <Text style={styles.balance}>💰 Balance: ${balance.toLocaleString()}</Text>
        </View>

        <View style={styles.portfolioSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.portfolioTitle}>Current Holdings</Text>
          </View>

          {enrichedPortfolio.map((coin) => (
            <View key={coin.id} style={styles.assetCard}>
              <View style={styles.assetHeader}>
                <View style={styles.assetInfo}>
                  <Text style={styles.assetName}>
                    {coin.emoji} {coin.name}
                  </Text>
                </View>
              </View>
              <View style={styles.assetDetails}>
                <Text style={styles.holdingText}>Holdings: {coin.quantity}</Text>
                <Text style={styles.priceText}>Avg Buy Price: ${coin.avgPrice.toFixed(2)}</Text>
                <Text style={styles.priceText}>Current Price: ${coin.currentPrice.toFixed(2)}</Text>
                <Text style={[styles.priceText, { color: coin.gainLoss >= 0 ? 'green' : 'red' }]}>
                  {coin.gainLoss >= 0 ? 'Profit' : 'Loss'}: ${coin.gainLoss.toFixed(2)}
                </Text>
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
                  style={styles.buyButton}
                />
                <GameButton
                  title="📉 Sell Asset"
                  onPress={() => {
                    (navigation as any).navigate('market', {
                      action: 'sell',
                      coin: coin.name,
                    });
                  }}
                  style={styles.sellButton}
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
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
    ...Layout.shadows.small,
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
  },
  sellButton: {
    backgroundColor: Colors.error[500],
    flex: 1,
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