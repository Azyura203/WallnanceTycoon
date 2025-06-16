import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/src/constants/Colors';
import Layout from '@/src/constants/Layout';
import { formatMoney } from '@/utils/number';   // move helper later

interface Props {
  balance: number;
  equity: number;
  trust: number;
}

export default function WalletCard({ balance, equity, trust }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Balance</Text>
      <Text style={styles.value}>💰 {formatMoney(balance)}</Text>
      <Text style={styles.label}>Equity</Text>
      <Text style={styles.value}>🏦 {formatMoney(equity)}</Text>
      <Text style={styles.label}>Trust</Text>
      <Text style={styles.value}>📈 {trust}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    ...Layout.shadows.small,
  },
  label: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: Colors.neutral[600],
  },
  value: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.primary[700],
    marginBottom: 4,
  },
});