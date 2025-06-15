console.log("Loading: app/(tabs)/index.tsx");
// Helper to format money values
const formatMoney = (num: number): string => {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
  return `$${num.toFixed(2)}`;
};

import { View, Text, StyleSheet, ScrollView, Pressable, FlatList } from 'react-native';
import { router } from 'expo-router';
import { LineChart as LineChart, TrendingUp, Users, Newspaper } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useCompanyName } from '@/hooks/useCompanyName';
import { usePlayerFinances } from '@/hooks/usePlayerFinances';
import { useMarketPrices } from '@/hooks/useMarketPrices';

const MiniCard = ({ title, items }: any) => (
  <View style={styles.miniCard}>
    <Text style={styles.miniCardTitle}>{title}</Text>
    {items.map((coin: any) => (
      <View key={coin.name} style={styles.miniRow}>
        <Text style={{ flex: 1 }}>{coin.emoji} {coin.name}</Text>
        <Text style={{ width: 80, textAlign: 'right' }}>
          ${coin.price.toFixed(2)} 
        </Text>
        <Text style={{
          width: 60,
          textAlign: 'right',
          color: coin.change >= 0 ? Colors.success[600] : Colors.error[600],
        }}>
          {coin.change >= 0 ? '+' : ''}{coin.change.toFixed(2)}%
        </Text>
      </View>
    ))}
  </View>
);

const DashboardButton = ({ icon: Icon, label, onPress }: any) => (
  <Pressable style={styles.dashboardButton} onPress={onPress}>
    <Icon size={24} color={Colors.primary[600]} />
    <Text style={styles.buttonLabel}>{label}</Text>
  </Pressable>
);

export default function DashboardScreen() {
  const { companyName } = useCompanyName();
  const { balance, portfolio } = usePlayerFinances();

  const tokens = useMarketPrices();

  // Helper to get top N items by key, safe for undefined/null/empty arrays
  const topN = (arr: any[] = [], key: string, n = 3, desc = true) =>
    [...(arr || [])]
      .sort((a, b) => desc ? b[key] - a[key] : a[key] - b[key])
      .slice(0, n);

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
  dashboardButton: {
    flex: 1,
    minWidth: 150,
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    alignItems: 'center',
    gap: Layout.spacing.sm,
    ...Layout.shadows.small,
  },
  buttonLabel: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: Colors.primary[700],
    textAlign: 'center',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.lg,
    gap: Layout.spacing.md,
  },
  miniCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.sm,
    ...Layout.shadows.small,
  },
  miniCardTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: Colors.primary[700],
    marginBottom: 4,
  },
  miniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
});