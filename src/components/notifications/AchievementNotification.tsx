import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { Trophy } from 'lucide-react-native';
import Colors from '@/src/constants/Colors';
import Layout from '@/src/constants/Layout';
import { Achievement } from '@/src/types/game';

interface Props {
  achievement: Achievement;
  visible: boolean;
  onHide: () => void;
}

export default function AchievementNotification({ achievement, visible, onHide }: Props) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;
  
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after 3 seconds
      const timer = setTimeout(() => {
        hideNotification();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return Colors.neutral[500];
      case 'rare': return Colors.primary[500];
      case 'epic': return Colors.accent[500];
      case 'legendary': return Colors.warning[500];
      default: return Colors.neutral[500];
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
        isSmallScreen && styles.containerSmall,
      ]}
    >
      <View style={[styles.notification, { borderLeftColor: getRarityColor(achievement.rarity) }]}>
        <View style={styles.iconContainer}>
          <Trophy size={isSmallScreen ? 20 : 24} color={getRarityColor(achievement.rarity)} />
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>
            Achievement Unlocked!
          </Text>
          <Text style={[styles.achievementTitle, isSmallScreen && styles.achievementTitleSmall]}>
            {achievement.emoji} {achievement.title}
          </Text>
          <Text style={[styles.reward, isSmallScreen && styles.rewardSmall]}>
            {achievement.reward.description}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: Layout.spacing.md,
    right: Layout.spacing.md,
    zIndex: 1000,
  },
  containerSmall: {
    top: 50,
    left: Layout.spacing.sm,
    right: Layout.spacing.sm,
  },
  notification: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    ...Layout.shadows.large,
  },
  iconContainer: {
    marginRight: Layout.spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: Colors.primary[600],
    marginBottom: 2,
  },
  titleSmall: {
    fontSize: 12,
  },
  achievementTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  achievementTitleSmall: {
    fontSize: 14,
  },
  reward: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: Colors.neutral[600],
  },
  rewardSmall: {
    fontSize: 10,
  },
});