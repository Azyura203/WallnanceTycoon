console.log("Loading: app/(tabs)/_layout.tsx");

import { Tabs } from 'expo-router';
import { StyleSheet, View, Text, useWindowDimensions } from 'react-native';
import Colors from '@/src/constants/Colors';
import { Chrome as Home, TrendingUp, Users, Trophy, Settings, User, Calendar } from 'lucide-react-native';
import { useTimeTracking } from '@/src/hooks/system/useTimeTracking';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePlayerFinances } from '@/src/hooks/finance/usePlayerFinances';

export default function TabLayout() {
  const { lastVisit } = useTimeTracking();
  const { balance } = usePlayerFinances();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;

  const getDaysSinceLastVisit = () => {
    if (!lastVisit) return 0;
    const now = new Date();
    const lastVisitDate = new Date(lastVisit);
    const diffTime = Math.abs(now.getTime() - lastVisitDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const [sessionMinutes, setSessionMinutes] = useState(0);
  const [totalPlayMinutes, setTotalPlayMinutes] = useState(0);

  useEffect(() => {
    const now = new Date();
    const lastVisitDate = lastVisit ? new Date(lastVisit) : now;
    const sessionDuration = Math.floor((now.getTime() - lastVisitDate.getTime()) / (1000 * 60));
    setSessionMinutes(sessionDuration);

    const loadTotal = async () => {
      const stored = await AsyncStorage.getItem('totalPlayMinutes');
      const total = stored ? parseInt(stored) : 0;
      const updated = total + sessionDuration;
      setTotalPlayMinutes(updated);
      await AsyncStorage.setItem('totalPlayMinutes', updated.toString());
    };
    loadTotal();
  }, []);

  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTicks(prev => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getFormattedTime = () => {
    const weeks = (ticks % 4) + 1;
    const months = Math.floor(ticks / 4) % 12 + 1;
    const years = Math.floor(ticks / 48) + 1;
    return `Y${years} M${months} W${weeks}`;
  };

  const formatMoney = (value: number) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.playTimeOverlay, isSmallScreen && styles.playTimeOverlaySmall]}>
        <Text style={[styles.playTimeText, isSmallScreen && styles.playTimeTextSmall]}>
          {getFormattedTime()} · {formatMoney(balance)}
        </Text>
      </View>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primary[600],
          tabBarInactiveTintColor: Colors.neutral[400],
          tabBarStyle: [styles.tabBar, isSmallScreen && styles.tabBarSmall],
          tabBarLabelStyle: [styles.tabBarLabel, isSmallScreen && styles.tabBarLabelSmall],
          tabBarItemStyle: [styles.tabBarItem, isSmallScreen && styles.tabBarItemSmall],
          headerShown: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, focused }) => (
              <View style={[
                styles.tabIconContainer,
                focused && styles.tabIconContainerActive,
                isSmallScreen && styles.tabIconContainerSmall
              ]}>
                <Home color={color} size={isSmallScreen ? 20 : 24} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="market"
          options={{
            title: 'Market',
            tabBarIcon: ({ color, focused }) => (
              <View style={[
                styles.tabIconContainer,
                focused && styles.tabIconContainerActive,
                isSmallScreen && styles.tabIconContainerSmall
              ]}>
                <TrendingUp color={color} size={isSmallScreen ? 20 : 24} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="portfolio"
          options={{
            title: 'Portfolio',
            tabBarIcon: ({ color, focused }) => (
              <View style={[
                styles.tabIconContainer,
                focused && styles.tabIconContainerActive,
                isSmallScreen && styles.tabIconContainerSmall
              ]}>
                <Users color={color} size={isSmallScreen ? 20 : 24} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="LearnAndEarn"
          options={{
            title: isSmallScreen ? 'Learn' : 'Learn & Earn',
            tabBarIcon: ({ color, focused }) => (
              <View style={[
                styles.tabIconContainer,
                focused && styles.tabIconContainerActive,
                isSmallScreen && styles.tabIconContainerSmall
              ]}>
                <Trophy color={color} size={isSmallScreen ? 20 : 24} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: 'Events',
            tabBarIcon: ({ color, focused }) => (
              <View style={[
                styles.tabIconContainer,
                focused && styles.tabIconContainerActive,
                isSmallScreen && styles.tabIconContainerSmall
              ]}>
                <Calendar color={color} size={isSmallScreen ? 20 : 24} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <View style={[
                styles.tabIconContainer,
                focused && styles.tabIconContainerActive,
                isSmallScreen && styles.tabIconContainerSmall
              ]}>
                <User color={color} size={isSmallScreen ? 20 : 24} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, focused }) => (
              <View style={[
                styles.tabIconContainer,
                focused && styles.tabIconContainerActive,
                isSmallScreen && styles.tabIconContainerSmall
              ]}>
                <Settings color={color} size={isSmallScreen ? 20 : 24} />
              </View>
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.card,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 80,
    paddingTop: 6,
    paddingBottom: 4,
    justifyContent: 'space-around',
  },
  tabBarSmall: {
    height: 70,
    paddingTop: 4,
    paddingBottom: 2,
  },
  tabBarLabel: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 0,
  },
  tabBarLabelSmall: {
    fontSize: 10,
    marginTop: 1,
  },
  tabBarItem: {
    minHeight: 56,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarItemSmall: {
    minHeight: 48,
    paddingVertical: 2,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    padding: 8,
  },
  tabIconContainerSmall: {
    padding: 6,
    borderRadius: 16,
  },
  tabIconContainerActive: {
    backgroundColor: Colors.primary[100],
  },
  playTimeOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.secondary?.[500] || Colors.accent[500],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 999,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  playTimeOverlaySmall: {
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 8,
  },
  playTimeText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
  },
  playTimeTextSmall: {
    fontSize: 12,
  },
});