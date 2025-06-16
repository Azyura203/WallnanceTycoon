import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

export default function GameLogo() {
  return (
    <View style={styles.container}>
      <Text style={styles.logoTitle}>🚀 WALLNANCE</Text>
      <Text style={styles.logoSubtitle}>TYCOON 💼</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.md,
  },
  logoTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 34,
    color: Colors.primary[600],
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  logoSubtitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 22,
    color: Colors.accent[500],
    letterSpacing: 1.2,
    textAlign: 'center',
    marginTop: Layout.spacing.xs,
  },
});