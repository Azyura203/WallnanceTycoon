import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Colors from '@/src/constants/Colors';
import Layout from '@/src/constants/Layout';

interface Props {
  title: string;
  items: { name: string; price: number; change: number; emoji?: string }[];
}

export default function MiniCard({ title, items }: Props) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;

  return (
    <View style={[styles.card, isSmallScreen && styles.cardSmall]}>
      <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>{title}</Text>
      {items.map((coin) => (
        <View key={coin.name} style={[styles.row, isSmallScreen && styles.rowSmall]}>
          <Text style={[styles.coinName, isSmallScreen && styles.coinNameSmall]}>
            {coin.emoji} {coin.name}
          </Text>
          <Text style={[styles.price, isSmallScreen && styles.priceSmall]}>
            ${coin.price.toFixed(2)}
          </Text>
          <Text style={[
            styles.change,
            { color: coin.change >= 0 ? Colors.success[600] : Colors.error[600] },
            isSmallScreen && styles.changeSmall
          ]}>
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
  cardSmall: {
    minWidth: 140,
    padding: Layout.spacing.xs,
  },
  title: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: Colors.primary[700],
    marginBottom: 4,
  },
  titleSmall: {
    fontSize: 12,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  rowSmall: {
    marginVertical: 1,
  },
  coinName: {
    flex: 1,
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: Colors.neutral[700],
  },
  coinNameSmall: {
    fontSize: 10,
  },
  price: {
    width: 80,
    textAlign: 'right',
    fontFamily: 'Nunito-SemiBold',
    fontSize: 12,
    color: Colors.neutral[800],
  },
  priceSmall: {
    width: 60,
    fontSize: 10,
  },
  change: {
    width: 60,
    textAlign: 'right',
    fontFamily: 'Nunito-Bold',
    fontSize: 11,
  },
  changeSmall: {
    width: 45,
    fontSize: 9,
  },
});