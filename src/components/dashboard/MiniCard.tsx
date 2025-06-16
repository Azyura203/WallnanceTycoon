import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/src/constants/Colors';
import Layout from '@/src/constants/Layout';

interface Props {
  title: string;
  items: { name: string; price: number; change: number; emoji?: string }[];
}

export default function MiniCard({ title, items }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {items.map((coin) => (
        <View key={coin.name} style={styles.row}>
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
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 160,
    flexBasis: '48%',
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.sm,
    ...Layout.shadows.small,
  },
  title: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: Colors.primary[700],
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
});