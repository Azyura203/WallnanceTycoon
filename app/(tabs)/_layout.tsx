console.log("Loading: app/(tabs)/_layout.tsx");

import { Tabs } from 'expo-router';
import { StyleSheet, View, Text, useWindowDimensions, Platform } from 'react-native';
import Colors from '@/src/constants/Colors';
import { Chrome as Home, TrendingUp, Users, Trophy, Settings, User, Calendar } from 'lucide-react-native';
import { useTimeTracking } from '@/src/hooks/system/useTimeTracking';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePlayerFinances } from '@/src/hooks/finance/usePlayerFinances';

export default function TabLayout() {
  const { lastVisit } = useTimeTracking();
  const { balance } = usePlayerFinances();
  const { width, height } = useWindowDimensions();
  
  // Enhanced responsive breakpoints
  const isWeb = Platform.OS === 'web';
  const isSmallMobile = width < 400;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const isLargeDesktop = width >= 1440;

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

  // Responsive, range-based config for Tab Bar
  const getTabBarConfig = () => {
    const baseHeight = Math.min(80, Math.max(60, height * 0.1));
    return {
      height: baseHeight,
      iconSize: width >= 1024 ? 24 : width >= 768 ? 22 : width >= 400 ? 20 : 18,
      fontSize: width >= 1024 ? 14 : width >= 768 ? 13 : 12,
      padding: width >= 1024 ? 16 : width >= 768 ? 12 : 8,
      showLabels: width >= 360,
      orientation: 'horizontal',
      maxWidth: width > 1440 ? 1280 : width > 1024 ? 1100 : undefined,
    };
  };

  const config = getTabBarConfig();

  // Tab configuration with responsive labels
  const getTabTitle = (fullTitle: string, shortTitle: string) => {
    if (isDesktop) return shortTitle;
    if (isSmallMobile) return shortTitle;
    if (isMobile && fullTitle.length > 8) return shortTitle;
    return fullTitle;
  };

  const tabScreenOptions = {
    tabBarActiveTintColor: Colors.primary[600],
    tabBarInactiveTintColor: Colors.neutral[400],
    tabBarStyle: StyleSheet.flatten([
      styles.tabBar,
      {
        height: config.height,
        paddingHorizontal: config.padding,
        paddingTop: config.padding / 2,
        paddingBottom: isWeb ? config.padding / 2 : Math.max(config.padding / 2, 6),
        maxWidth: config.maxWidth,
        alignSelf: 'stretch' as const,
        // width: '100%', // Removed to fix type error
        borderTopWidth: isWeb ? 1 : 0.5,
        shadowOpacity: isWeb ? 0.15 : 0.1,
        elevation: isWeb ? 8 : 10,
      },
      isWeb ? styles.tabBarWeb : null,
      isDesktop ? styles.tabBarDesktop : null,
      isTablet ? styles.tabBarTablet : null,
    ]),
    tabBarLabelStyle: StyleSheet.flatten([
      styles.tabBarLabel,
      {
        fontSize: config.fontSize,
        marginTop: config.showLabels ? 2 : 0,
        display: config.showLabels ? 'flex' as const : 'none' as const,
      },
    ]),
    tabBarItemStyle: StyleSheet.flatten([
      styles.tabBarItem,
      {
        paddingVertical: config.padding / 2,
        paddingHorizontal: isDesktop ? 12 : config.padding / 2,
        minHeight: config.height - config.padding,
        flex: isDesktop ? 0 : 1,
        minWidth: isDesktop ? 80 : undefined,
      },
    ]),
    headerShown: false,
    tabBarHideOnKeyboard: true,
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Enhanced Stats Overlay - Responsive positioning */}
      <View style={[
        styles.playTimeOverlay,
        {
          top: isWeb ? 16 : 12,
          right: isWeb ? 16 : 12,
          paddingHorizontal: isDesktop ? 16 : isTablet ? 12 : 8,
          paddingVertical: isDesktop ? 8 : isTablet ? 6 : 4,
          borderRadius: isDesktop ? 16 : 12,
        }
      ]}>
        <Text style={[
          styles.playTimeText,
          {
            fontSize: isDesktop ? 16 : isTablet ? 14 : 12,
          }
        ]}>
          {getFormattedTime()} · {formatMoney(balance)}
        </Text>
      </View>

      <Tabs screenOptions={tabScreenOptions}>
        <Tabs.Screen
          name="index"
          options={{
            title: getTabTitle('Dashboard', 'Home'),
            tabBarIcon: ({ color, focused }) => (
              <View style={[
                styles.tabIconContainer,
                focused && styles.tabIconContainerActive,
                {
                  padding: isDesktop ? 8 : isTablet ? 6 : 4,
                  borderRadius: isDesktop ? 12 : 8,
                  minWidth: isDesktop ? 40 : 32,
                  minHeight: isDesktop ? 40 : 32,
                }
              ]}>
                <Home color={color} size={config.iconSize} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="market"
          options={{
            title: getTabTitle('Market', 'Market'),
            tabBarIcon: ({ color, focused }) => (
              <View style={[
                styles.tabIconContainer,
                focused && styles.tabIconContainerActive,
                {
                  padding: isDesktop ? 8 : isTablet ? 6 : 4,
                  borderRadius: isDesktop ? 12 : 8,
                  minWidth: isDesktop ? 40 : 32,
                  minHeight: isDesktop ? 40 : 32,
                }
              ]}>
                <TrendingUp color={color} size={config.iconSize} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="portfolio"
          options={{
            title: getTabTitle('Portfolio', 'Assets'),
            tabBarIcon: ({ color, focused }) => (
              <View style={[
                styles.tabIconContainer,
                focused && styles.tabIconContainerActive,
                {
                  padding: isDesktop ? 8 : isTablet ? 6 : 4,
                  borderRadius: isDesktop ? 12 : 8,
                  minWidth: isDesktop ? 40 : 32,
                  minHeight: isDesktop ? 40 : 32,
                }
              ]}>
                <Users color={color} size={config.iconSize} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="LearnAndEarn"
          options={{
            title: getTabTitle('Learn & Earn', 'Learn'),
            tabBarIcon: ({ color, focused }) => (
              <View style={[
                styles.tabIconContainer,
                focused && styles.tabIconContainerActive,
                {
                  padding: isDesktop ? 8 : isTablet ? 6 : 4,
                  borderRadius: isDesktop ? 12 : 8,
                  minWidth: isDesktop ? 40 : 32,
                  minHeight: isDesktop ? 40 : 32,
                }
              ]}>
                <Trophy color={color} size={config.iconSize} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: getTabTitle('Events', 'Events'),
            tabBarIcon: ({ color, focused }) => (
              <View style={[
                styles.tabIconContainer,
                focused && styles.tabIconContainerActive,
                {
                  padding: isDesktop ? 8 : isTablet ? 6 : 4,
                  borderRadius: isDesktop ? 12 : 8,
                  minWidth: isDesktop ? 40 : 32,
                  minHeight: isDesktop ? 40 : 32,
                }
              ]}>
                <Calendar color={color} size={config.iconSize} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: getTabTitle('Profile', 'Profile'),
            tabBarIcon: ({ color, focused }) => (
              <View style={[
                styles.tabIconContainer,
                focused && styles.tabIconContainerActive,
                {
                  padding: isDesktop ? 8 : isTablet ? 6 : 4,
                  borderRadius: isDesktop ? 12 : 8,
                  minWidth: isDesktop ? 40 : 32,
                  minHeight: isDesktop ? 40 : 32,
                }
              ]}>
                <User color={color} size={config.iconSize} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: getTabTitle('Settings', 'More'),
            tabBarIcon: ({ color, focused }) => (
              <View style={[
                styles.tabIconContainer,
                focused && styles.tabIconContainerActive,
                {
                  padding: isDesktop ? 8 : isTablet ? 6 : 4,
                  borderRadius: isDesktop ? 12 : 8,
                  minWidth: isDesktop ? 40 : 32,
                  minHeight: isDesktop ? 40 : 32,
                }
              ]}>
                <Settings color={color} size={config.iconSize} />
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
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    position: Platform.OS === 'web' ? 'relative' : 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarWeb: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.15)',
  },
  tabBarDesktop: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
  },
  tabBarTablet: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderTopWidth: 1,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabBarLabel: {
    fontFamily: 'Nunito-SemiBold',
    textAlign: 'center',
    marginBottom: 0,
  },
  tabBarItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  tabIconContainerActive: {
    backgroundColor: Colors.primary[100],
    transform: [{ scale: 1.1 }],
  },
  playTimeOverlay: {
    position: 'absolute',
    backgroundColor: Colors.secondary?.[500] || Colors.accent[500],
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    }),
  },
  playTimeText: {
    fontFamily: 'Nunito-Bold',
    color: 'white',
    textAlign: 'center',
  },
});