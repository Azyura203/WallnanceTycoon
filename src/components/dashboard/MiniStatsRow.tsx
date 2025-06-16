import { View, StyleSheet } from 'react-native';
import MiniCard from '../dashboard/MiniCard';
import Layout from '@/src/constants/Layout';

interface Props {
  hot: any[];
  gainers: any[];
  volume: any[];
}

export default function MiniStatsRow({ hot, gainers, volume }: Props) {
  return (
    <View style={styles.row}>
      <MiniCard title="Hot Coins" items={hot} />
      <MiniCard title="Top Gainers" items={gainers} />
      <MiniCard title="Top Volume" items={volume} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
});