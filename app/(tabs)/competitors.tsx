import { View, Text, StyleSheet, ScrollView } from 'react-native';
import SparkLine from '@/components/SparkLine';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

interface TradingPair {
  pair: string;
  price: number;
  change: number;    // percent
  volume: number;    // in base currency
  history: number[];
}

const initialPairs: TradingPair[] = [
  { pair: 'WLC/ETH', price: 0.0123, change: 3.4, volume: 120, history: [0.011,0.0115,0.012,0.0123] },
  { pair: 'WLC/BTC', price: 0.00004, change: -1.2, volume: 0.8, history: [0.000042,0.00004,0.000039,0.00004] },
  { pair: 'WLC/USDT', price: 1.3, change: 0.0, volume: 300, history: [1.25,1.28,1.3,1.3] },
];

export default function TradingPairsScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Trading Pairs</Text>
        <View style={styles.headerRow}>
          <Text style={[styles.col, styles.colPair]}>Pair</Text>
          <Text style={[styles.col, styles.colPrice]}>Price</Text>
          <Text style={[styles.col, styles.colChange]}>24h %</Text>
          <Text style={[styles.col, styles.colVolume]}>24h Vol</Text>
          <Text style={[styles.col, styles.colChart]}>Chart</Text>
        </View>
        {initialPairs.map((p) => (
          <View key={p.pair} style={styles.row}>
            <Text style={[styles.col, styles.colPair]}>{p.pair}</Text>
            <Text style={[styles.col, styles.colPrice]}>${p.price.toFixed(4)}</Text>
            <Text style={[
                styles.col,
                styles.colChange,
                { color: p.change >= 0 ? Colors.success[600] : Colors.error[600] }
              ]}>
              {p.change >= 0 ? '+' : ''}{p.change.toFixed(2)}%
            </Text>
            <Text style={[styles.col, styles.colVolume]}>
              {p.volume.toLocaleString()}
            </Text>
            <View style={styles.colChart}>
              <SparkLine points={p.history} positive={p.change >= 0} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  contentContainer: { padding: Layout.spacing.lg },
  title: {
    fontFamily: 'Nunito-Bold',
    fontSize: 24,
    color: Colors.primary[700],
    marginBottom: Layout.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    paddingBottom: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderColor: Colors.neutral[300],
    marginBottom: Layout.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
  },
  col: { fontFamily: 'Nunito-Regular', fontSize: 14 },
  colPair: { flex: 2 },
  colPrice: { flex: 1, textAlign: 'right' },
  colChange: { flex: 1, textAlign: 'right' },
  colVolume: { flex: 1, textAlign: 'right' },
  colChart: { flex: 1, alignItems: 'flex-end' },
});