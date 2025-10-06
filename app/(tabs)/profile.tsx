import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { User, Trophy, TrendingUp, BookOpen, Calendar, Award, Star, Target } from 'lucide-react-native';
import Colors from '@/src/constants/Colors';
import Layout from '@/src/constants/Layout';
import { usePlayerFinances } from '@/src/hooks/finance/usePlayerFinances';
import { useAchievements } from '@/src/hooks/useAchievements';
import { useLearningSystem } from '@/src/hooks/useLearningSystem';
import { useCompanyName } from '@/src/hooks/useCompanyName';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;
  const isTablet = width >= 768;
  
  const { balance, portfolio } = usePlayerFinances();
  const { achievements, unlockedCount, totalPoints, getProgressPercentage } = useAchievements();
  const { totalLessonsCompleted, streakDays, getCompletedQuests } = useLearningSystem();
  const { companyName } = useCompanyName();
  
  const [playerStats, setPlayerStats] = useState({
    joinDate: new Date(),
    totalTrades: 0,
    profitableTrades: 0,
    totalProfit: 0,
    biggestWin: 0,
    biggestLoss: 0,
    level: 1,
    experience: 0,
  });

  const [selectedTab, setSelectedTab] = useState<'overview' | 'achievements' | 'stats' | 'badges'>('overview');

  useEffect(() => {
    loadPlayerStats();
  }, []);

  const loadPlayerStats = async () => {
    try {
      const stored = await AsyncStorage.getItem('@wallnance_player_stats');
      if (stored) {
        const stats = JSON.parse(stored);
        setPlayerStats({
          ...stats,
          joinDate: new Date(stats.joinDate),
        });
      }
    } catch (error) {
      console.error('Error loading player stats:', error);
    }
  };

  const calculateLevel = () => {
    const baseXP = 1000;
    const level = Math.floor(totalPoints / baseXP) + 1;
    const currentLevelXP = totalPoints % baseXP;
    const nextLevelXP = baseXP;
    return { level, currentLevelXP, nextLevelXP };
  };

  const { level, currentLevelXP, nextLevelXP } = calculateLevel();

  const portfolioValue = Object.entries(portfolio).reduce((total, [name, entry]) => {
    return total + (entry.quantity * entry.avgPrice);
  }, 0);

  const totalAssets = Object.keys(portfolio).length;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return Colors.neutral[500];
      case 'rare': return Colors.primary[500];
      case 'epic': return Colors.accent[500];
      case 'legendary': return Colors.warning[500];
      default: return Colors.neutral[500];
    }
  };

  const StatCard = ({ icon: Icon, label, value, color = Colors.primary[600] }: any) => (
    <View style={[styles.statCard, isSmallScreen && styles.statCardSmall]}>
      <Icon size={isSmallScreen ? 20 : 24} color={color} />
      <Text style={[styles.statValue, isSmallScreen && styles.statValueSmall]}>{value}</Text>
      <Text style={[styles.statLabel, isSmallScreen && styles.statLabelSmall]}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, isSmallScreen && styles.profileHeaderSmall]}>
          <View style={[styles.avatarContainer, isSmallScreen && styles.avatarContainerSmall]}>
            <User size={isSmallScreen ? 40 : 60} color={Colors.primary[600]} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.username, isSmallScreen && styles.usernameSmall]}>
              {companyName || 'Trader'}
            </Text>
            <Text style={[styles.level, isSmallScreen && styles.levelSmall]}>
              Level {level} • {totalPoints} Points
            </Text>
            <View style={[styles.xpBar, isSmallScreen && styles.xpBarSmall]}>
              <View 
                style={[
                  styles.xpFill, 
                  { width: `${(currentLevelXP / nextLevelXP) * 100}%` }
                ]} 
              />
            </View>
            <Text style={[styles.xpText, isSmallScreen && styles.xpTextSmall]}>
              {currentLevelXP}/{nextLevelXP} XP to next level
            </Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={[styles.tabContainer, isSmallScreen && styles.tabContainerSmall]}>
          {[
            { key: 'overview', label: 'Overview', icon: User },
            { key: 'achievements', label: 'Achievements', icon: Trophy },
            { key: 'stats', label: 'Stats', icon: TrendingUp },
            { key: 'badges', label: 'Badges', icon: Award },
          ].map(({ key, label, icon: Icon }) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.tab,
                selectedTab === key && styles.activeTab,
                isSmallScreen && styles.tabSmall
              ]}
              onPress={() => setSelectedTab(key as any)}
            >
              <Icon size={isSmallScreen ? 16 : 20} color={
                selectedTab === key ? Colors.primary[600] : Colors.neutral[400]
              } />
              <Text style={[
                styles.tabText,
                selectedTab === key && styles.activeTabText,
                isSmallScreen && styles.tabTextSmall
              ]}>
                {isSmallScreen ? label.slice(0, 4) : label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <View style={styles.tabContent}>
            {/* Quick Stats */}
            <View style={[styles.statsGrid, isSmallScreen && styles.statsGridSmall]}>
              <StatCard 
                icon={TrendingUp} 
                label="Portfolio Value" 
                value={`$${portfolioValue.toLocaleString()}`}
                color={Colors.success[600]}
              />
              <StatCard 
                icon={Target} 
                label="Total Assets" 
                value={totalAssets}
                color={Colors.primary[600]}
              />
              <StatCard 
                icon={BookOpen} 
                label="Lessons Done" 
                value={totalLessonsCompleted}
                color={Colors.accent[600]}
              />
              <StatCard 
                icon={Calendar} 
                label="Streak Days" 
                value={streakDays}
                color={Colors.warning[600]}
              />
            </View>

            {/* Recent Activity */}
            <View style={[styles.section, isSmallScreen && styles.sectionSmall]}>
              <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>
                📈 Recent Activity
              </Text>
              <View style={[styles.activityCard, isSmallScreen && styles.activityCardSmall]}>
                <Text style={[styles.activityText, isSmallScreen && styles.activityTextSmall]}>
                  • Completed "Crypto Basics" lesson
                </Text>
                <Text style={[styles.activityText, isSmallScreen && styles.activityTextSmall]}>
                  • Earned "First Trade" achievement
                </Text>
                <Text style={[styles.activityText, isSmallScreen && styles.activityTextSmall]}>
                  • Portfolio value increased by 12%
                </Text>
              </View>
            </View>
          </View>
        )}

        {selectedTab === 'achievements' && (
          <View style={styles.tabContent}>
            <View style={[styles.achievementProgress, isSmallScreen && styles.achievementProgressSmall]}>
              <Text style={[styles.progressText, isSmallScreen && styles.progressTextSmall]}>
                {unlockedCount}/{achievements.length} Achievements Unlocked
              </Text>
              <Text style={[styles.progressPercentage, isSmallScreen && styles.progressPercentageSmall]}>
                {getProgressPercentage()}%
              </Text>
            </View>

            <ScrollView style={styles.achievementsList}>
              {achievements.map((achievement) => (
                <View 
                  key={achievement.id} 
                  style={[
                    styles.achievementCard,
                    !achievement.unlocked && styles.achievementCardLocked,
                    isSmallScreen && styles.achievementCardSmall
                  ]}
                >
                  <Text style={[styles.achievementEmoji, isSmallScreen && styles.achievementEmojiSmall]}>
                    {achievement.emoji}
                  </Text>
                  <View style={styles.achievementInfo}>
                    <Text style={[
                      styles.achievementTitle,
                      !achievement.unlocked && styles.achievementTitleLocked,
                      isSmallScreen && styles.achievementTitleSmall
                    ]}>
                      {achievement.title}
                    </Text>
                    <Text style={[
                      styles.achievementDescription,
                      isSmallScreen && styles.achievementDescriptionSmall
                    ]}>
                      {achievement.description}
                    </Text>
                    <Text style={[
                      styles.achievementReward,
                      { color: getRarityColor(achievement.rarity) },
                      isSmallScreen && styles.achievementRewardSmall
                    ]}>
                      {achievement.reward.description} • {achievement.rarity}
                    </Text>
                  </View>
                  {achievement.unlocked && (
                    <View style={[styles.unlockedBadge, isSmallScreen && styles.unlockedBadgeSmall]}>
                      <Trophy size={isSmallScreen ? 16 : 20} color={Colors.warning[600]} />
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {selectedTab === 'stats' && (
          <View style={styles.tabContent}>
            <View style={[styles.statsSection, isSmallScreen && styles.statsSectionSmall]}>
              <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>
                📊 Trading Statistics
              </Text>
              <View style={[styles.statRow, isSmallScreen && styles.statRowSmall]}>
                <Text style={[styles.statRowLabel, isSmallScreen && styles.statRowLabelSmall]}>
                  Total Trades
                </Text>
                <Text style={[styles.statRowValue, isSmallScreen && styles.statRowValueSmall]}>
                  {playerStats.totalTrades}
                </Text>
              </View>
              <View style={[styles.statRow, isSmallScreen && styles.statRowSmall]}>
                <Text style={[styles.statRowLabel, isSmallScreen && styles.statRowLabelSmall]}>
                  Win Rate
                </Text>
                <Text style={[styles.statRowValue, isSmallScreen && styles.statRowValueSmall]}>
                  {playerStats.totalTrades > 0 
                    ? `${Math.round((playerStats.profitableTrades / playerStats.totalTrades) * 100)}%`
                    : '0%'
                  }
                </Text>
              </View>
              <View style={[styles.statRow, isSmallScreen && styles.statRowSmall]}>
                <Text style={[styles.statRowLabel, isSmallScreen && styles.statRowLabelSmall]}>
                  Total Profit
                </Text>
                <Text style={[
                  styles.statRowValue,
                  { color: playerStats.totalProfit >= 0 ? Colors.success[600] : Colors.error[600] },
                  isSmallScreen && styles.statRowValueSmall
                ]}>
                  ${playerStats.totalProfit.toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={[styles.statsSection, isSmallScreen && styles.statsSectionSmall]}>
              <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>
                🎓 Learning Statistics
              </Text>
              <View style={[styles.statRow, isSmallScreen && styles.statRowSmall]}>
                <Text style={[styles.statRowLabel, isSmallScreen && styles.statRowLabelSmall]}>
                  Lessons Completed
                </Text>
                <Text style={[styles.statRowValue, isSmallScreen && styles.statRowValueSmall]}>
                  {totalLessonsCompleted}
                </Text>
              </View>
              <View style={[styles.statRow, isSmallScreen && styles.statRowSmall]}>
                <Text style={[styles.statRowLabel, isSmallScreen && styles.statRowLabelSmall]}>
                  Quests Completed
                </Text>
                <Text style={[styles.statRowValue, isSmallScreen && styles.statRowValueSmall]}>
                  {getCompletedQuests().length}
                </Text>
              </View>
              <View style={[styles.statRow, isSmallScreen && styles.statRowSmall]}>
                <Text style={[styles.statRowLabel, isSmallScreen && styles.statRowLabelSmall]}>
                  Current Streak
                </Text>
                <Text style={[styles.statRowValue, isSmallScreen && styles.statRowValueSmall]}>
                  {streakDays} days
                </Text>
              </View>
            </View>
          </View>
        )}

        {selectedTab === 'badges' && (
          <View style={styles.tabContent}>
            <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>
              🏆 Earned Badges
            </Text>
            <View style={[styles.badgesGrid, isSmallScreen && styles.badgesGridSmall]}>
              {achievements.filter(a => a.unlocked && a.reward.type === 'badge').map((achievement) => (
                <View key={achievement.id} style={[styles.badgeCard, isSmallScreen && styles.badgeCardSmall]}>
                  <Text style={[styles.badgeEmoji, isSmallScreen && styles.badgeEmojiSmall]}>
                    {achievement.emoji}
                  </Text>
                  <Text style={[styles.badgeTitle, isSmallScreen && styles.badgeTitleSmall]}>
                    {achievement.title}
                  </Text>
                  <Text style={[
                    styles.badgeRarity,
                    { color: getRarityColor(achievement.rarity) },
                    isSmallScreen && styles.badgeRaritySmall
                  ]}>
                    {achievement.rarity}
                  </Text>
                </View>
              ))}
              {achievements.filter(a => a.unlocked && a.reward.type === 'badge').length === 0 && (
                <Text style={[styles.noBadgesText, isSmallScreen && styles.noBadgesTextSmall]}>
                  No badges earned yet. Complete achievements to earn badges!
                </Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xxl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
    ...Layout.shadows.medium,
  },
  profileHeaderSmall: {
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Layout.spacing.lg,
  },
  avatarContainerSmall: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: Layout.spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontFamily: 'Nunito-Bold',
    fontSize: 24,
    color: Colors.primary[700],
    marginBottom: 4,
  },
  usernameSmall: {
    fontSize: 18,
  },
  level: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: Colors.neutral[600],
    marginBottom: 8,
  },
  levelSmall: {
    fontSize: 14,
    marginBottom: 6,
  },
  xpBar: {
    height: 8,
    backgroundColor: Colors.neutral[200],
    borderRadius: 4,
    marginBottom: 4,
  },
  xpBarSmall: {
    height: 6,
  },
  xpFill: {
    height: '100%',
    backgroundColor: Colors.primary[500],
    borderRadius: 4,
  },
  xpText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: Colors.neutral[500],
  },
  xpTextSmall: {
    fontSize: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.lg,
    padding: 4,
    marginBottom: Layout.spacing.lg,
    ...Layout.shadows.small,
  },
  tabContainerSmall: {
    marginBottom: Layout.spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: Layout.borderRadius.md,
  },
  tabSmall: {
    paddingVertical: 8,
    gap: 2,
  },
  activeTab: {
    backgroundColor: Colors.primary[50],
  },
  tabText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: Colors.neutral[400],
  },
  tabTextSmall: {
    fontSize: 10,
  },
  activeTabText: {
    color: Colors.primary[600],
  },
  tabContent: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  statsGridSmall: {
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    alignItems: 'center',
    ...Layout.shadows.small,
  },
  statCardSmall: {
    padding: Layout.spacing.sm,
  },
  statValue: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: Colors.neutral[800],
    marginVertical: 4,
  },
  statValueSmall: {
    fontSize: 16,
  },
  statLabel: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  statLabelSmall: {
    fontSize: 10,
  },
  section: {
    marginBottom: Layout.spacing.lg,
  },
  sectionSmall: {
    marginBottom: Layout.spacing.md,
  },
  sectionTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: Colors.primary[700],
    marginBottom: Layout.spacing.md,
  },
  sectionTitleSmall: {
    fontSize: 16,
    marginBottom: Layout.spacing.sm,
  },
  activityCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    ...Layout.shadows.small,
  },
  activityCardSmall: {
    padding: Layout.spacing.sm,
  },
  activityText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.neutral[700],
    marginBottom: 4,
  },
  activityTextSmall: {
    fontSize: 12,
  },
  achievementProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
    ...Layout.shadows.small,
  },
  achievementProgressSmall: {
    padding: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  progressText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: Colors.neutral[700],
  },
  progressTextSmall: {
    fontSize: 14,
  },
  progressPercentage: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: Colors.primary[600],
  },
  progressPercentageSmall: {
    fontSize: 16,
  },
  achievementsList: {
    flex: 1,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
    ...Layout.shadows.small,
  },
  achievementCardSmall: {
    padding: Layout.spacing.sm,
  },
  achievementCardLocked: {
    opacity: 0.6,
  },
  achievementEmoji: {
    fontSize: 32,
    marginRight: Layout.spacing.md,
  },
  achievementEmojiSmall: {
    fontSize: 24,
    marginRight: Layout.spacing.sm,
  },
  achievementInfo: {
    flex: 1,
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
  achievementTitleLocked: {
    color: Colors.neutral[500],
  },
  achievementDescription: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.neutral[600],
    marginBottom: 4,
  },
  achievementDescriptionSmall: {
    fontSize: 12,
  },
  achievementReward: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 12,
  },
  achievementRewardSmall: {
    fontSize: 10,
  },
  unlockedBadge: {
    padding: 8,
  },
  unlockedBadgeSmall: {
    padding: 4,
  },
  statsSection: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
    ...Layout.shadows.small,
  },
  statsSectionSmall: {
    padding: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  statRowSmall: {
    paddingVertical: 6,
  },
  statRowLabel: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.neutral[700],
  },
  statRowLabelSmall: {
    fontSize: 12,
  },
  statRowValue: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: Colors.neutral[800],
  },
  statRowValueSmall: {
    fontSize: 12,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.md,
  },
  badgesGridSmall: {
    gap: Layout.spacing.sm,
  },
  badgeCard: {
    width: '30%',
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    alignItems: 'center',
    ...Layout.shadows.small,
  },
  badgeCardSmall: {
    width: '45%',
    padding: Layout.spacing.sm,
  },
  badgeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeEmojiSmall: {
    fontSize: 24,
    marginBottom: 4,
  },
  badgeTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
    color: Colors.neutral[800],
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeTitleSmall: {
    fontSize: 10,
  },
  badgeRarity: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  badgeRaritySmall: {
    fontSize: 8,
  },
  noBadgesText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.neutral[500],
    textAlign: 'center',
    fontStyle: 'italic',
  },
  noBadgesTextSmall: {
    fontSize: 12,
  },
});