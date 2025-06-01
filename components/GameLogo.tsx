import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

export default function GameLogo() {
  // Create animated rotation value
  const rotateAnim = new Animated.Value(0);
  
  // Start rotation animation
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  // Map rotation value to degrees
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '5deg'],
  });
  
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { transform: [{ rotate: rotation }] }]}>
        <Text style={styles.logoEmoji}>🌟</Text>
        <Text style={styles.logoText}>WALLNANCE</Text>
        <Text style={styles.logoEmoji}>🌟</Text>
      </Animated.View>
      <Text style={styles.tycoonText}>TYCOON</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 36,
    color: Colors.primary[600],
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginHorizontal: Layout.spacing.xs,
  },
  tycoonText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 28,
    color: Colors.accent[500],
    letterSpacing: 3,
    marginTop: Layout.spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  logoEmoji: {
    fontSize: 30,
  },
});