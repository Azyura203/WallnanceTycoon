import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '@/src/constants/Colors';
import Layout from '@/src/constants/Layout';
import { useTradingPairs } from '@/src/hooks/market/useTradingPairs';

type TradingPair = {
  pair: string;
  volume: number;
  change: number;
  price: number;
};

type TradingPairsListProps = {
  pairs: TradingPair[];
};

function TradingPairsList({ pairs }: TradingPairsListProps) {
  return (
    <View style={styles.listWrapper}>
      {pairs.map((pair) => (
        <View key={pair.pair} style={styles.row}>
          <View style={styles.avatar}>
            <Text style={[styles.avatarText, {color: Colors.primary[700]}]}>💹</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.pair}>{pair.pair}</Text>
            <Text style={styles.price}>${pair.price.toFixed(4)}</Text>
          </View>
          <View style={styles.stats}>
            <Text style={styles.volume}>Vol: {pair.volume}</Text>
            <Text style={[styles.change, { color: pair.change >= 0 ? Colors.success[600] : Colors.error[600] }]}>
              {pair.change >= 0 ? '+' : ''}{pair.change.toFixed(2)}%
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export default function CompetitorScreen() {
  const { pairs, loading } = useTradingPairs();
  const [filter, setFilter] = useState<'all' | 'volume' | 'gainers'>('all');

  const filteredPairs = pairs.filter((pair) => {
    if (filter === 'volume') return pair.volume >= 100;
    if (filter === 'gainers') return pair.change > 0;
    return true;
  });

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Competitor Market</Text>
        <Text style={styles.subtitle}>Track live trading pairs like a real exchange</Text>
      </View>
      <View style={styles.tabs}>
        {['all', 'volume', 'gainers'].map((key) => (
          <TouchableOpacity
            key={key}
            onPress={() => setFilter(key as 'all' | 'volume' | 'gainers')}
            style={[styles.tab, filter === key && styles.activeTab]}
          >
            <Text style={[styles.tabText, filter === key && styles.activeTabText]}>
              {key === 'all' ? 'All' : key === 'volume' ? 'High Volume' : 'Top Gainers'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TradingPairsList pairs={filteredPairs} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Layout.spacing.lg,
    paddingHorizontal: Layout.spacing.md,
    paddingTop: Layout.spacing.lg,
  },
  title: {
    fontFamily: 'Nunito-Bold',
    fontSize: 22,
    color: Colors.primary[700],
  },
  subtitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.neutral[500],
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: Layout.borderRadius.md,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: Layout.spacing.sm,
    ...Layout.shadows.small,
  },
  avatar: {
    marginRight: Layout.spacing.sm,
  },
  avatarText: {
    fontSize: 20,
  },
  info: {
    flex: 2,
  },
  pair: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: Colors.primary[700],
  },
  price: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: Colors.neutral[500],
  },
  stats: {
    flex: 1,
    alignItems: 'flex-end',
  },
  volume: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: Colors.neutral[500],
  },
  change: {
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
  },
  tab: {
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.sm,
    backgroundColor: Colors.neutral[200],
  },
  activeTab: {
    backgroundColor: Colors.primary[100],
  },
  tabText: {
    fontFamily: 'Nunito-Regular',
    color: Colors.neutral[600],
  },
  activeTabText: {
    fontFamily: 'Nunito-Bold',
    color: Colors.primary[700],
  },
  listWrapper: {
    paddingHorizontal: Layout.spacing.md,
  },
});