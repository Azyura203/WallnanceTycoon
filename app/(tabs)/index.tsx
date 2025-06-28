console.log("Loading: app/(tabs)/index.tsx");

import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { LineChart as LineChart, Users } from 'lucide-react-native';
import Colors from '@/src/constants/Colors';
import Layout from '@/src/constants/Layout';
import { useCompanyName } from '@/src/hooks/useCompanyName';
import { usePlayerFinances } from '@/src/hooks/finance/usePlayerFinances';
import { useMarketPrices } from '@/src/hooks/market/useMarketPrices';
import { formatMoney } from '@/utils/number';
import MiniCard from '@/src/components/dashboard/MiniCard';
import DashboardButton from '@/src/components/dashboard/DashboardButton';

export default function DashboardScreen() {
  const { companyName } = useCompanyName();
  const { balance, portfolio } = usePlayerFinances();
  const tokens = useMarketPrices();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;
  const isMediumScreen = width < 600;

  const topN = (arr: any[] = [], key: string, n = 3, desc = true) =>
    [...(arr || [])]
      .sort((a, b) => desc ? b[key] - a[key] : a[key] - b[key])
      .slice(0, n);

  if (!tokens || tokens.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={[styles.loadingText, isSmallScreen && styles.loadingTextSmall]}>
          📉 Loading market data...
        </Text>
      </View>
    );
  }

  const hotCoins = topN(tokens, 'price', 3);
  const topGainers = topN(tokens, 'change', 3);
  const topVolume = topN(tokens, 'volume', 3);

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
      <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
        <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>Wallnance Overview</Text>
        <Text style={[styles.subtitle, isSmallScreen && styles.subtitleSmall]}>
          All your assets & market insights in one place
        </Text>
      </View>

      <View style={[styles.statsContainer, isSmallScreen && styles.statsContainerSmall]}>
        <View style={[styles.statCard, isSmallScreen && styles.statCardSmall]}>
          <Text style={[styles.statLabel, isSmallScreen && styles.statLabelSmall]}>Balance</Text>
          <Text style={[styles.statValue, isSmallScreen && styles.statValueSmall]}>
            💰 {formatMoney(balance)}
          </Text>
        </View>
        <View style={[styles.statCard, isSmallScreen && styles.statCardSmall]}>
          <Text style={[styles.statLabel, isSmallScreen && styles.statLabelSmall]}>Trust</Text>
          <Text style={[styles.statValue, isSmallScreen && styles.statValueSmall]}>
            📈 {calculateTrust()}%
          </Text>
        </View>
        <View style={[styles.statCard, isSmallScreen && styles.statCardSmall]}>
          <Text style={[styles.statLabel, isSmallScreen && styles.statLabelSmall]}>Equity Value</Text>
          <Text style={[styles.statValue, isSmallScreen && styles.statValueSmall]}>
            🏦 {formatMoney(balance * 1.2)}
          </Text>
        </View>
      </View>

      <View style={[styles.cardRow, isSmallScreen && styles.cardRowSmall]}>
        <MiniCard title="Hot Coins" items={hotCoins} />
        <MiniCard title="Top Gainer Coin" items={topGainers} />
        <MiniCard title="Top Volume Coin" items={topVolume} />
      </View>

      <View style={[styles.marketPreviewCard, isSmallScreen && styles.marketPreviewCardSmall]}>
        <Text style={[styles.marketPreviewTitle, isSmallScreen && styles.marketPreviewTitleSmall]}>
          Market Snapshot
        </Text>
        <Text style={[styles.marketPreviewSubtitle, isSmallScreen && styles.marketPreviewSubtitleSmall]}>
          {topGainers[0] && typeof topGainers[0].change === 'number' &&
           topVolume[0] && typeof topVolume[0].volume === 'number'
            ? `${topGainers[0].name} ${topGainers[0].change >= 0 ? 'up' : 'down'} ${Math.abs(topGainers[0].change).toFixed(1)}% · ${topVolume[0].name} vol $${topVolume[0].volume.toLocaleString()}`
            : '📉 Market data loading...'}
        </Text>
      </View>

      <View style={[styles.section, isSmallScreen && styles.sectionSmall]}>
        <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>📢 News & Events</Text>
        <Text style={[styles.marketPreviewSubtitle, isSmallScreen && styles.marketPreviewSubtitleSmall]}>
          BitRice rumored to launch new feature • SoyETH hits new volume milestone • NyanCash trending on social media
        </Text>
      </View>

      <View style={[styles.section, isSmallScreen && styles.sectionSmall]}>
        <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>Quick Actions</Text>
        <View style={[styles.buttonsGrid, isSmallScreen && styles.buttonsGridSmall]}>
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
  loadingText: {
    padding: 20,
    fontSize: 16,
    textAlign: 'center',
    color: Colors.neutral[600],
  },
  loadingTextSmall: {
    fontSize: 14,
    padding: 16,
  },
  header: {
    marginBottom: Layout.spacing.xl,
    marginTop: Layout.spacing.xl,
  },
  headerSmall: {
    marginBottom: Layout.spacing.lg,
    marginTop: Layout.spacing.lg,
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
  subtitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: 18,
    color: Colors.neutral[600],
  },
  subtitleSmall: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.xl,
    gap: Layout.spacing.md,
    flexWrap: 'wrap',
  },
  statsContainerSmall: {
    marginBottom: Layout.spacing.lg,
    gap: Layout.spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    alignItems: 'center',
    ...Layout.shadows.small,
    minWidth: 100,
  },
  statCardSmall: {
    padding: Layout.spacing.sm,
    minWidth: 80,
  },
  statLabel: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: Colors.neutral[600],
    marginBottom: Layout.spacing.xs,
    textAlign: 'center',
  },
  statLabelSmall: {
    fontSize: 11,
  },
  statValue: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.primary[700],
    textAlign: 'center',
  },
  statValueSmall: {
    fontSize: 14,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Layout.spacing.lg,
    gap: Layout.spacing.md,
    flexWrap: 'wrap',
    rowGap: Layout.spacing.md,
  },
  cardRowSmall: {
    marginBottom: Layout.spacing.md,
    gap: Layout.spacing.sm,
    rowGap: Layout.spacing.sm,
  },
  marketPreviewCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.xl,
    ...Layout.shadows.small,
  },
  marketPreviewCardSmall: {
    padding: Layout.spacing.sm,
    marginBottom: Layout.spacing.lg,
  },
  marketPreviewTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.primary[700],
    marginBottom: Layout.spacing.xs,
  },
  marketPreviewTitleSmall: {
    fontSize: 14,
  },
  marketPreviewSubtitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.neutral[600],
  },
  marketPreviewSubtitleSmall: {
    fontSize: 12,
  },
  section: {
    marginBottom: Layout.spacing.xl,
  },
  sectionSmall: {
    marginBottom: Layout.spacing.lg,
  },
  sectionTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: Colors.primary[700],
    marginBottom: Layout.spacing.md,
  },
  sectionTitleSmall: {
    fontSize: 16,
    marginBottom: Layout.spacing.sm,
  },
  buttonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.md,
  },
  buttonsGridSmall: {
    gap: Layout.spacing.sm,
  },
});