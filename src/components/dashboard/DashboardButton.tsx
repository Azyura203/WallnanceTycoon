import React from 'react';
import { Pressable, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Colors from '@/src/constants/Colors';
import Layout from '@/src/constants/Layout';

interface Props {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  onPress: () => void;
}

export default function DashboardButton({ icon: Icon, label, onPress }: Props) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;

  return (
    <Pressable style={[styles.button, isSmallScreen && styles.buttonSmall]} onPress={onPress}>
      <Icon size={isSmallScreen ? 20 : 24} color={Colors.primary[600]} />
      <Text style={[styles.label, isSmallScreen && styles.labelSmall]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    minWidth: 140,
    flexBasis: '48%',
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    alignItems: 'center',
    gap: Layout.spacing.sm,
    ...Layout.shadows.small,
  },
  buttonSmall: {
    minWidth: 120,
    padding: Layout.spacing.sm,
    gap: Layout.spacing.xs,
  },
  label: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: Colors.primary[700],
    textAlign: 'center',
  },
  labelSmall: {
    fontSize: 12,
  },
});