import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Calendar, Clock, TrendingUp, Gift, Zap, Target } from 'lucide-react-native';
import Colors from '@/src/constants/Colors';
import Layout from '@/src/constants/Layout';
import { useGameEvents } from '@/src/hooks/useGameEvents';
import { useLearningSystem } from '@/src/hooks/useLearningSystem';
import { GameEvent, DailyChallenge } from '@/src/types/game';

export default function EventsScreen() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;
  
  const { events, activeEvents, getEventMultiplier, getBonusRewardMultiplier } = useGameEvents();
  const { dailyChallenges, getCompletedChallenges } = useLearningSystem();
  
  const [selectedTab, setSelectedTab] = useState<'active' | 'upcoming' | 'challenges'>('active');

  const formatTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const getEventTypeIcon = (type: GameEvent['type']) => {
    switch (type) {
      case 'market_crash': return '📉';
      case 'bull_run': return '🚀';
      case 'news_event': return '📰';
      case 'special_offer': return '🎁';
      case 'challenge': return '🎯';
      default: return '⭐';
    }
  };

  const getEventTypeColor = (type: GameEvent['type']) => {
    switch (type) {
      case 'market_crash': return Colors.error[500];
      case 'bull_run': return Colors.success[500];
      case 'news_event': return Colors.primary[500];
      case 'special_offer': return Colors.accent[500];
      case 'challenge': return Colors.warning[500];
      default: return Colors.neutral[500];
    }
  };

  const EventCard = ({ event }: { event: GameEvent }) => (
    <View style={[styles.eventCard, isSmallScreen && styles.eventCardSmall]}>
      <View style={styles.eventHeader}>
        <View style={styles.eventTitleRow}>
          <Text style={[styles.eventIcon, isSmallScreen && styles.eventIconSmall]}>
            {getEventTypeIcon(event.type)}
          </Text>
          <View style={styles.eventTitleContainer}>
            <Text style={[styles.eventTitle, isSmallScreen && styles.eventTitleSmall]}>
              {event.title}
            </Text>
            <View style={[
              styles.eventTypeBadge,
              { backgroundColor: getEventTypeColor(event.type) },
              isSmallScreen && styles.eventTypeBadgeSmall
            ]}>
              <Text style={[styles.eventTypeText, isSmallScreen && styles.eventTypeTextSmall]}>
                {event.type.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.eventTimeContainer}>
          <Clock size={isSmallScreen ? 14 : 16} color={Colors.neutral[500]} />
          <Text style={[styles.eventTime, isSmallScreen && styles.eventTimeSmall]}>
            {formatTimeRemaining(event.endTime)}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.eventDescription, isSmallScreen && styles.eventDescriptionSmall]}>
        {event.description}
      </Text>
      
      {/* Event Effects */}
      <View style={[styles.effectsContainer, isSmallScreen && styles.effectsContainerSmall]}>
        {event.effects.coinMultipliers && (
          <View style={styles.effectItem}>
            <TrendingUp size={isSmallScreen ? 14 : 16} color={Colors.primary[500]} />
            <Text style={[styles.effectText, isSmallScreen && styles.effectTextSmall]}>
              Coin multipliers active
            </Text>
          </View>
        )}
        {event.effects.tradingFeeDiscount && (
          <View style={styles.effectItem}>
            <Gift size={isSmallScreen ? 14 : 16} color={Colors.success[500]} />
            <Text style={[styles.effectText, isSmallScreen && styles.effectTextSmall]}>
              {Math.round(event.effects.tradingFeeDiscount * 100)}% fee discount
            </Text>
          </View>
        )}
        {event.effects.bonusRewards && (
          <View style={styles.effectItem}>
            <Zap size={isSmallScreen ? 14 : 16} color={Colors.warning[500]} />
            <Text style={[styles.effectText, isSmallScreen && styles.effectTextSmall]}>
              {event.effects.bonusRewards}x bonus rewards
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const ChallengeCard = ({ challenge }: { challenge: DailyChallenge }) => (
    <View style={[
      styles.challengeCard,
      challenge.completed && styles.challengeCardCompleted,
      isSmallScreen && styles.challengeCardSmall
    ]}>
      <View style={styles.challengeHeader}>
        <Text style={[styles.challengeEmoji, isSmallScreen && styles.challengeEmojiSmall]}>
          {challenge.emoji}
        </Text>
        <View style={styles.challengeInfo}>
          <Text style={[styles.challengeTitle, isSmallScreen && styles.challengeTitleSmall]}>
            {challenge.title}
          </Text>
          <Text style={[styles.challengeDescription, isSmallScreen && styles.challengeDescriptionSmall]}>
            {challenge.description}
          </Text>
        </View>
        {challenge.completed && (
          <View style={[styles.completedBadge, isSmallScreen && styles.completedBadgeSmall]}>
            <Text style={[styles.completedText, isSmallScreen && styles.completedTextSmall]}>✓</Text>
          </View>
        )}
      </View>
      
      {/* Progress Bar */}
      <View style={[styles.progressContainer, isSmallScreen && styles.progressContainerSmall]}>
        <View style={[styles.progressBar, isSmallScreen && styles.progressBarSmall]}>
          <View 
            style={[
              styles.progressFill,
              { width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%` }
            ]} 
          />
        </View>
        <Text style={[styles.progressText, isSmallScreen && styles.progressTextSmall]}>
          {challenge.progress}/{challenge.target}
        </Text>
      </View>
      
      {/* Rewards */}
      <View style={[styles.rewardContainer, isSmallScreen && styles.rewardContainerSmall]}>
        <Text style={[styles.rewardText, isSmallScreen && styles.rewardTextSmall]}>
          Reward: {challenge.reward.points} points, ${challenge.reward.coins.toLocaleString()}
          {challenge.reward.multiplier && ` (${challenge.reward.multiplier}x multiplier)`}
        </Text>
      </View>
    </View>
  );

  const upcomingEvents = events.filter(event => !event.isActive && new Date() < event.startTime);
  const completedChallenges = getCompletedChallenges();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
          <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>Events & Challenges</Text>
          <Text style={[styles.subtitle, isSmallScreen && styles.subtitleSmall]}>
            Participate in special events and daily challenges
          </Text>
        </View>

        {/* Tab Navigation */}
        <View style={[styles.tabContainer, isSmallScreen && styles.tabContainerSmall]}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'active' && styles.activeTab,
              isSmallScreen && styles.tabSmall
            ]}
            onPress={() => setSelectedTab('active')}
          >
            <Zap size={isSmallScreen ? 16 : 20} color={
              selectedTab === 'active' ? Colors.primary[600] : Colors.neutral[400]
            } />
            <Text style={[
              styles.tabText,
              selectedTab === 'active' && styles.activeTabText,
              isSmallScreen && styles.tabTextSmall
            ]}>
              Active ({activeEvents.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'upcoming' && styles.activeTab,
              isSmallScreen && styles.tabSmall
            ]}
            onPress={() => setSelectedTab('upcoming')}
          >
            <Calendar size={isSmallScreen ? 16 : 20} color={
              selectedTab === 'upcoming' ? Colors.primary[600] : Colors.neutral[400]
            } />
            <Text style={[
              styles.tabText,
              selectedTab === 'upcoming' && styles.activeTabText,
              isSmallScreen && styles.tabTextSmall
            ]}>
              Upcoming ({upcomingEvents.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'challenges' && styles.activeTab,
              isSmallScreen && styles.tabSmall
            ]}
            onPress={() => setSelectedTab('challenges')}
          >
            <Target size={isSmallScreen ? 16 : 20} color={
              selectedTab === 'challenges' ? Colors.primary[600] : Colors.neutral[400]
            } />
            <Text style={[
              styles.tabText,
              selectedTab === 'challenges' && styles.activeTabText,
              isSmallScreen && styles.tabTextSmall
            ]}>
              Daily ({completedChallenges.length}/{dailyChallenges.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {selectedTab === 'active' && (
          <View style={styles.tabContent}>
            {activeEvents.length > 0 ? (
              activeEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <View style={[styles.emptyState, isSmallScreen && styles.emptyStateSmall]}>
                <Text style={[styles.emptyStateText, isSmallScreen && styles.emptyStateTextSmall]}>
                  No active events right now
                </Text>
                <Text style={[styles.emptyStateSubtext, isSmallScreen && styles.emptyStateSubtextSmall]}>
                  Check back later for new events!
                </Text>
              </View>
            )}
          </View>
        )}

        {selectedTab === 'upcoming' && (
          <View style={styles.tabContent}>
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <View style={[styles.emptyState, isSmallScreen && styles.emptyStateSmall]}>
                <Text style={[styles.emptyStateText, isSmallScreen && styles.emptyStateTextSmall]}>
                  No upcoming events scheduled
                </Text>
                <Text style={[styles.emptyStateSubtext, isSmallScreen && styles.emptyStateSubtextSmall]}>
                  New events are added regularly!
                </Text>
              </View>
            )}
          </View>
        )}

        {selectedTab === 'challenges' && (
          <View style={styles.tabContent}>
            <View style={[styles.challengeStats, isSmallScreen && styles.challengeStatsSmall]}>
              <Text style={[styles.challengeStatsText, isSmallScreen && styles.challengeStatsTextSmall]}>
                Today's Progress: {completedChallenges.length}/{dailyChallenges.length} completed
              </Text>
            </View>
            
            {dailyChallenges.map(challenge => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
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
  header: {
    marginBottom: Layout.spacing.xl,
    marginTop: Layout.spacing.xl,
  },
  headerSmall: {
    marginBottom: Layout.spacing.lg,
    marginTop: Layout.spacing.lg,
  },
  title: {
    fontFamily: 'Nunito-Bold',
    fontSize: 32,
    color: Colors.primary[700],
    marginBottom: Layout.spacing.xs,
  },
  titleSmall: {
    fontSize: 24,
  },
  subtitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: 18,
    color: Colors.neutral[600],
  },
  subtitleSmall: {
    fontSize: 14,
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
    fontSize: 12,
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
  eventCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
    ...Layout.shadows.medium,
  },
  eventCardSmall: {
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.md,
  },
  eventTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  eventIcon: {
    fontSize: 24,
    marginRight: Layout.spacing.sm,
  },
  eventIconSmall: {
    fontSize: 20,
  },
  eventTitleContainer: {
    flex: 1,
  },
  eventTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: Colors.neutral[800],
    marginBottom: 4,
  },
  eventTitleSmall: {
    fontSize: 16,
  },
  eventTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  eventTypeBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  eventTypeText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 10,
    color: Colors.card,
  },
  eventTypeTextSmall: {
    fontSize: 8,
  },
  eventTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventTime: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 12,
    color: Colors.neutral[500],
  },
  eventTimeSmall: {
    fontSize: 10,
  },
  eventDescription: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.neutral[600],
    lineHeight: 20,
    marginBottom: Layout.spacing.md,
  },
  eventDescriptionSmall: {
    fontSize: 12,
    lineHeight: 18,
  },
  effectsContainer: {
    gap: Layout.spacing.sm,
  },
  effectsContainerSmall: {
    gap: Layout.spacing.xs,
  },
  effectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  effectText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 12,
    color: Colors.neutral[700],
  },
  effectTextSmall: {
    fontSize: 10,
  },
  challengeCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
    ...Layout.shadows.small,
  },
  challengeCardSmall: {
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
  },
  challengeCardCompleted: {
    backgroundColor: Colors.success[50],
    borderColor: Colors.success[200],
    borderWidth: 1,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  challengeEmoji: {
    fontSize: 32,
    marginRight: Layout.spacing.md,
  },
  challengeEmojiSmall: {
    fontSize: 24,
    marginRight: Layout.spacing.sm,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  challengeTitleSmall: {
    fontSize: 14,
  },
  challengeDescription: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.neutral[600],
  },
  challengeDescriptionSmall: {
    fontSize: 12,
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.success[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadgeSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  completedText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.card,
  },
  completedTextSmall: {
    fontSize: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.sm,
  },
  progressContainerSmall: {
    gap: Layout.spacing.xs,
    marginBottom: Layout.spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.neutral[200],
    borderRadius: 4,
  },
  progressBarSmall: {
    height: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary[500],
    borderRadius: 4,
  },
  progressText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 12,
    color: Colors.neutral[600],
    minWidth: 40,
  },
  progressTextSmall: {
    fontSize: 10,
    minWidth: 30,
  },
  rewardContainer: {
    backgroundColor: Colors.primary[50],
    borderRadius: Layout.borderRadius.sm,
    padding: Layout.spacing.sm,
  },
  rewardContainerSmall: {
    padding: Layout.spacing.xs,
  },
  rewardText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 12,
    color: Colors.primary[700],
  },
  rewardTextSmall: {
    fontSize: 10,
  },
  challengeStats: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
    ...Layout.shadows.small,
  },
  challengeStatsSmall: {
    padding: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  challengeStatsText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.primary[700],
    textAlign: 'center',
  },
  challengeStatsTextSmall: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    padding: Layout.spacing.xl,
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.lg,
    ...Layout.shadows.small,
  },
  emptyStateSmall: {
    padding: Layout.spacing.lg,
  },
  emptyStateText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: Colors.neutral[600],
    marginBottom: Layout.spacing.xs,
  },
  emptyStateTextSmall: {
    fontSize: 16,
  },
  emptyStateSubtext: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.neutral[500],
  },
  emptyStateSubtextSmall: {
    fontSize: 12,
  },
});