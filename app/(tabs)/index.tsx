console.log("Loading: app/(tabs)/index.tsx");

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LineChart as LineChart, Users } from 'lucide-react-native';
import Colors from '@/src/constants/Colors';
import Layout from '@/src/constants/Layout';
import { useCompanyName } from '@/src/hooks/useCompanyName';
import { usePlayerFinances } from '@/src/hooks/finance/usePlayerFinances';
import { useMarketPrices } from '@/src/hooks/market/useMarketPrices';

// TODO: Ensure that '@/src/utils/number' exists and exports 'formatMoney'.
// If the file does not exist, create 'src/utils/number.ts' and export 'formatMoney' from it.
import { formatMoney } from '@/utils/number';
import MiniCard from '@/src/components/dashboard/MiniCard';
import DashboardButton from '@/src/components/dashboard/DashboardButton';
// import DashboardButton from '@/src/components/dashboard/DashboardButton';

export default function DashboardScreen() {
  const { companyName } = useCompanyName();
  const { balance, portfolio } = usePlayerFinances();

  const tokens = useMarketPrices();

  // Helper to get top N items by key, safe for undefined/null/empty arrays
  const topN = (arr: any[] = [], key: string, n = 3, desc = true) =>
    [...(arr || [])]
      .sort((a, b) => desc ? b[key] - a[key] : a[key] - b[key])
      .slice(0, n);

  const generateDummyNews = () => {
    const newsItems = [
      "BitRice rumored to launch new feature",
      "SoyETH hits new volume milestone",
      "NyanCash trending on social media",
      "CrypTofu gets listed on NewExchange",
      "StakeToken announces new staking program"
    ];
    return newsItems[Math.floor(Math.random() * newsItems.length)];
  };

  if (!tokens || tokens.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={{ padding: 20, fontSize: 16 }}>📉 Loading market data...</Text>
      </View>
    );
  }

  const hotCoins = topN(tokens, 'price', 3);
  const topGainers = topN(tokens, 'change', 3);
  const topVolume = topN(tokens, 'volume', 3);

  // Calculate total portfolio value
  const calculateTrust = () => {
    const totalCoins = Object.values(portfolio).reduce((sum, entry) => {
      if (typeof entry === 'object' && entry !== null && 'quantity' in entry) {
        return sum + entry.quantity;
      }
      return sum;
    }, 0);
    return isNaN(totalCoins) ? 0 : Math.min(Math.floor((totalCoins / 100) * 65), 100);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Wallnance Overview</Text>
        <Text style={styles.subtitle}>All your assets & market insights in one place</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Balance</Text>
          <Text style={styles.statValue}>💰 {formatMoney(balance)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Trust</Text>
          <Text style={styles.statValue}>📈 {calculateTrust()}%</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Equity Value</Text>
          <Text style={styles.statValue}>🏦 {formatMoney(balance * 1.2)}</Text>
        </View>
      </View>

      <View style={styles.cardRow}>
        <MiniCard title="Hot Coins" items={hotCoins} />
        <MiniCard title="Top Gainer Coin" items={topGainers} />
        <MiniCard title="Top Volume Coin" items={topVolume} />
      </View>

      <View style={styles.marketPreviewCard}>
        <Text style={styles.marketPreviewTitle}>Market Snapshot</Text>
        <Text style={styles.marketPreviewSubtitle}>
          {topGainers[0] && typeof topGainers[0].change === 'number' &&
           topVolume[0] && typeof topVolume[0].volume === 'number'
            ? `${topGainers[0].name} ${topGainers[0].change >= 0 ? 'up' : 'down'} ${Math.abs(topGainers[0].change).toFixed(1)}% · ${topVolume[0].name} vol $${topVolume[0].volume.toLocaleString()}`
            : '📉 Market data loading...'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📢 News & Events</Text>
        <Text style={styles.marketPreviewSubtitle}>
          BitRice rumored to launch new feature • SoyETH hits new volume milestone • NyanCash trending on social media
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.buttonsGrid}>
          <DashboardButton 
            icon={LineChart} 
            label="💹 View Markets"
            onPress={() => router.push('/market')}
          />
          <DashboardButton 
            icon={Users} 
            label="👛 Portfolio"
            onPress={() => router.push('/portfolio')}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xxl,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.xl,
    gap: Layout.spacing.md,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    alignItems: 'center',
    ...Layout.shadows.small,
  },
  statLabel: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: Colors.neutral[600],
    marginBottom: Layout.spacing.xs,
    textAlign: 'center',
  },
  statValue: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.primary[700],
    textAlign: 'center',
  },
  marketPreviewCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.xl,
    ...Layout.shadows.small,
  },
  marketPreviewTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.primary[700],
    marginBottom: Layout.spacing.xs,
  },
  marketPreviewSubtitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.neutral[600],
  },
  section: {
    marginBottom: Layout.spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: Colors.primary[700],
    marginBottom: Layout.spacing.md,
  },
  buttonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Layout.spacing.lg,
    gap: Layout.spacing.md,
    flexWrap: 'wrap',
    rowGap: Layout.spacing.md,
  },
});