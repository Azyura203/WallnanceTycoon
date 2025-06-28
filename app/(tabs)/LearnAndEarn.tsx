import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, useWindowDimensions } from 'react-native';
import { BookOpen, Trophy, Target, Clock, CheckCircle, Star } from 'lucide-react-native';
import Colors from '@/src/constants/Colors';
import Layout from '@/src/constants/Layout';
import { useLearningSystem } from '@/src/hooks/useLearningSystem';
import { useAchievements } from '@/src/hooks/useAchievements';
import { LearningQuest, LearningLesson } from '@/src/types/game';
import LessonModal from '@/src/components/learning/LessonModal';
import AchievementNotification from '@/src/components/notifications/AchievementNotification';

export default function LearnAndEarnScreen() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;
  
  const {
    quests,
    dailyChallenges,
    streakDays,
    totalLessonsCompleted,
    completeLesson,
    completeQuiz,
    getQuestsByCategory,
    getCompletedQuests,
  } = useLearningSystem();
  
  const { checkAchievement } = useAchievements();
  
  const [selectedTab, setSelectedTab] = useState<'quests' | 'challenges' | 'progress'>('quests');
  const [selectedQuest, setSelectedQuest] = useState<LearningQuest | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<LearningLesson | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState<any>(null);

  const handleLessonPress = (quest: LearningQuest, lesson: LearningLesson) => {
    setSelectedQuest(quest);
    setSelectedLesson(lesson);
    setShowLessonModal(true);
  };

  const handleLessonComplete = async (lessonId: string) => {
    if (!selectedQuest) return;
    
    try {
      await completeLesson(selectedQuest.id, lessonId);
      
      // Check for achievements
      const newAchievements = await checkAchievement('lesson', totalLessonsCompleted + 1);
      if (newAchievements.length > 0) {
        setNewAchievement(newAchievements[0]);
      }
      
      setShowLessonModal(false);
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  const QuestCard = ({ quest }: { quest: LearningQuest }) => (
    <View style={[styles.questCard, isSmallScreen && styles.questCardSmall]}>
      <View style={styles.questHeader}>
        <View style={styles.questTitleRow}>
          <Text style={[styles.questTitle, isSmallScreen && styles.questTitleSmall]}>
            {quest.title}
          </Text>
          <View style={[
            styles.categoryBadge,
            { backgroundColor: getCategoryColor(quest.category) },
            isSmallScreen && styles.categoryBadgeSmall
          ]}>
            <Text style={[styles.categoryText, isSmallScreen && styles.categoryTextSmall]}>
              {quest.category.toUpperCase()}
            </Text>
          </View>
        </View>
        {quest.completed && (
          <View style={[styles.completedBadge, isSmallScreen && styles.completedBadgeSmall]}>
            <CheckCircle size={isSmallScreen ? 16 : 20} color={Colors.success[500]} />
          </View>
        )}
      </View>
      
      <Text style={[styles.questDescription, isSmallScreen && styles.questDescriptionSmall]}>
        {quest.description}
      </Text>
      
      {/* Progress Bar */}
      <View style={[styles.progressContainer, isSmallScreen && styles.progressContainerSmall]}>
        <View style={[styles.progressBar, isSmallScreen && styles.progressBarSmall]}>
          <View 
            style={[
              styles.progressFill,
              { width: `${quest.progress}%` }
            ]} 
          />
        </View>
        <Text style={[styles.progressText, isSmallScreen && styles.progressTextSmall]}>
          {quest.progress}%
        </Text>
      </View>
      
      {/* Lessons */}
      <View style={[styles.lessonsContainer, isSmallScreen && styles.lessonsContainerSmall]}>
        {quest.lessons.map((lesson, index) => (
          <TouchableOpacity
            key={lesson.id}
            style={[
              styles.lessonItem,
              lesson.completed && styles.lessonItemCompleted,
              isSmallScreen && styles.lessonItemSmall
            ]}
            onPress={() => handleLessonPress(quest, lesson)}
          >
            <View style={styles.lessonInfo}>
              <Text style={[
                styles.lessonTitle,
                lesson.completed && styles.lessonTitleCompleted,
                isSmallScreen && styles.lessonTitleSmall
              ]}>
                {index + 1}. {lesson.title}
              </Text>
              <View style={styles.lessonMeta}>
                <Clock size={isSmallScreen ? 12 : 14} color={Colors.neutral[500]} />
                <Text style={[styles.lessonTime, isSmallScreen && styles.lessonTimeSmall]}>
                  {lesson.estimatedTime} min
                </Text>
              </View>
            </View>
            {lesson.completed && (
              <CheckCircle size={isSmallScreen ? 16 : 20} color={Colors.success[500]} />
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Rewards */}
      <View style={[styles.rewardsContainer, isSmallScreen && styles.rewardsContainerSmall]}>
        <Text style={[styles.rewardsTitle, isSmallScreen && styles.rewardsTitleSmall]}>
          Rewards:
        </Text>
        <Text style={[styles.rewardsText, isSmallScreen && styles.rewardsTextSmall]}>
          {quest.rewards.points} points • ${quest.rewards.coins.toLocaleString()}
          {quest.rewards.achievement && ` • ${quest.rewards.achievement} achievement`}
        </Text>
      </View>
    </View>
  );

  const getCategoryColor = (category: LearningQuest['category']) => {
    switch (category) {
      case 'beginner': return Colors.success[500];
      case 'intermediate': return Colors.warning[500];
      case 'advanced': return Colors.error[500];
      default: return Colors.neutral[500];
    }
  };

  const ChallengeCard = ({ challenge }: { challenge: any }) => (
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
            <CheckCircle size={isSmallScreen ? 16 : 20} color={Colors.success[500]} />
          </View>
        )}
      </View>
      
      {/* Progress */}
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
      
      {/* Reward */}
      <View style={[styles.challengeReward, isSmallScreen && styles.challengeRewardSmall]}>
        <Text style={[styles.rewardText, isSmallScreen && styles.rewardTextSmall]}>
          Reward: {challenge.reward.points} points, ${challenge.reward.coins.toLocaleString()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
          <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>Learn & Earn</Text>
          <Text style={[styles.subtitle, isSmallScreen && styles.subtitleSmall]}>
            Master trading skills and earn rewards
          </Text>
          
          {/* Stats */}
          <View style={[styles.statsContainer, isSmallScreen && styles.statsContainerSmall]}>
            <View style={[styles.statItem, isSmallScreen && styles.statItemSmall]}>
              <BookOpen size={isSmallScreen ? 16 : 20} color={Colors.primary[500]} />
              <Text style={[styles.statValue, isSmallScreen && styles.statValueSmall]}>
                {totalLessonsCompleted}
              </Text>
              <Text style={[styles.statLabel, isSmallScreen && styles.statLabelSmall]}>
                Lessons
              </Text>
            </View>
            <View style={[styles.statItem, isSmallScreen && styles.statItemSmall]}>
              <Trophy size={isSmallScreen ? 16 : 20} color={Colors.warning[500]} />
              <Text style={[styles.statValue, isSmallScreen && styles.statValueSmall]}>
                {getCompletedQuests().length}
              </Text>
              <Text style={[styles.statLabel, isSmallScreen && styles.statLabelSmall]}>
                Quests
              </Text>
            </View>
            <View style={[styles.statItem, isSmallScreen && styles.statItemSmall]}>
              <Star size={isSmallScreen ? 16 : 20} color={Colors.accent[500]} />
              <Text style={[styles.statValue, isSmallScreen && styles.statValueSmall]}>
                {streakDays}
              </Text>
              <Text style={[styles.statLabel, isSmallScreen && styles.statLabelSmall]}>
                Streak
              </Text>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={[styles.tabContainer, isSmallScreen && styles.tabContainerSmall]}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'quests' && styles.activeTab,
              isSmallScreen && styles.tabSmall
            ]}
            onPress={() => setSelectedTab('quests')}
          >
            <BookOpen size={isSmallScreen ? 16 : 20} color={
              selectedTab === 'quests' ? Colors.primary[600] : Colors.neutral[400]
            } />
            <Text style={[
              styles.tabText,
              selectedTab === 'quests' && styles.activeTabText,
              isSmallScreen && styles.tabTextSmall
            ]}>
              Quests
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
              Daily
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'progress' && styles.activeTab,
              isSmallScreen && styles.tabSmall
            ]}
            onPress={() => setSelectedTab('progress')}
          >
            <Trophy size={isSmallScreen ? 16 : 20} color={
              selectedTab === 'progress' ? Colors.primary[600] : Colors.neutral[400]
            } />
            <Text style={[
              styles.tabText,
              selectedTab === 'progress' && styles.activeTabText,
              isSmallScreen && styles.tabTextSmall
            ]}>
              Progress
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {selectedTab === 'quests' && (
          <View style={styles.tabContent}>
            {quests.map(quest => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </View>
        )}

        {selectedTab === 'challenges' && (
          <View style={styles.tabContent}>
            <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>
              Daily Challenges
            </Text>
            {dailyChallenges.map(challenge => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </View>
        )}

        {selectedTab === 'progress' && (
          <View style={styles.tabContent}>
            <View style={[styles.progressSection, isSmallScreen && styles.progressSectionSmall]}>
              <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>
                Learning Progress
              </Text>
              
              <View style={[styles.progressCard, isSmallScreen && styles.progressCardSmall]}>
                <Text style={[styles.progressCardTitle, isSmallScreen && styles.progressCardTitleSmall]}>
                  Overall Completion
                </Text>
                <View style={[styles.progressContainer, isSmallScreen && styles.progressContainerSmall]}>
                  <View style={[styles.progressBar, isSmallScreen && styles.progressBarSmall]}>
                    <View 
                      style={[
                        styles.progressFill,
                        { width: `${(getCompletedQuests().length / quests.length) * 100}%` }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.progressText, isSmallScreen && styles.progressTextSmall]}>
                    {Math.round((getCompletedQuests().length / quests.length) * 100)}%
                  </Text>
                </View>
              </View>

              {/* Category Progress */}
              {['beginner', 'intermediate', 'advanced'].map(category => {
                const categoryQuests = getQuestsByCategory(category as any);
                const completedInCategory = categoryQuests.filter(q => q.completed).length;
                const progressPercent = categoryQuests.length > 0 
                  ? (completedInCategory / categoryQuests.length) * 100 
                  : 0;

                return (
                  <View key={category} style={[styles.categoryProgress, isSmallScreen && styles.categoryProgressSmall]}>
                    <Text style={[styles.categoryTitle, isSmallScreen && styles.categoryTitleSmall]}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                    <View style={[styles.progressContainer, isSmallScreen && styles.progressContainerSmall]}>
                      <View style={[styles.progressBar, isSmallScreen && styles.progressBarSmall]}>
                        <View 
                          style={[
                            styles.progressFill,
                            { 
                              width: `${progressPercent}%`,
                              backgroundColor: getCategoryColor(category as any)
                            }
                          ]} 
                        />
                      </View>
                      <Text style={[styles.progressText, isSmallScreen && styles.progressTextSmall]}>
                        {completedInCategory}/{categoryQuests.length}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Lesson Modal */}
      <LessonModal
        lesson={selectedLesson}
        visible={showLessonModal}
        onClose={() => setShowLessonModal(false)}
        onComplete={handleLessonComplete}
      />

      {/* Achievement Notification */}
      <AchievementNotification
        achievement={newAchievement}
        visible={!!newAchievement}
        onHide={() => setNewAchievement(null)}
      />
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
    marginBottom: Layout.spacing.lg,
  },
  subtitleSmall: {
    fontSize: 14,
    marginBottom: Layout.spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    ...Layout.shadows.small,
  },
  statsContainerSmall: {
    padding: Layout.spacing.md,
  },
  statItem: {
    alignItems: 'center',
    gap: Layout.spacing.xs,
  },
  statItemSmall: {
    gap: Layout.spacing.xs / 2,
  },
  statValue: {
    fontFamily: 'Nunito-Bold',
    fontSize: 24,
    color: Colors.neutral[800],
  },
  statValueSmall: {
    fontSize: 18,
  },
  statLabel: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: Colors.neutral[600],
  },
  statLabelSmall: {
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
    fontSize: 12,
  },
  activeTabText: {
    color: Colors.primary[600],
  },
  tabContent: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: Colors.primary[700],
    marginBottom: Layout.spacing.lg,
  },
  sectionTitleSmall: {
    fontSize: 18,
    marginBottom: Layout.spacing.md,
  },
  questCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
    ...Layout.shadows.medium,
  },
  questCardSmall: {
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.md,
  },
  questTitleRow: {
    flex: 1,
  },
  questTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: Colors.neutral[800],
    marginBottom: 4,
  },
  questTitleSmall: {
    fontSize: 16,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  categoryText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 10,
    color: Colors.card,
  },
  categoryTextSmall: {
    fontSize: 8,
  },
  completedBadge: {
    padding: 4,
  },
  completedBadgeSmall: {
    padding: 2,
  },
  questDescription: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.neutral[600],
    lineHeight: 20,
    marginBottom: Layout.spacing.md,
  },
  questDescriptionSmall: {
    fontSize: 12,
    lineHeight: 18,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  progressContainerSmall: {
    gap: Layout.spacing.xs,
    marginBottom: Layout.spacing.sm,
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
  lessonsContainer: {
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  lessonsContainerSmall: {
    gap: Layout.spacing.xs,
    marginBottom: Layout.spacing.sm,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.neutral[50],
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.neutral[300],
  },
  lessonItemSmall: {
    padding: Layout.spacing.sm,
  },
  lessonItemCompleted: {
    backgroundColor: Colors.success[50],
    borderLeftColor: Colors.success[500],
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  lessonTitleSmall: {
    fontSize: 12,
  },
  lessonTitleCompleted: {
    color: Colors.success[700],
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lessonTime: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: Colors.neutral[500],
  },
  lessonTimeSmall: {
    fontSize: 10,
  },
  rewardsContainer: {
    backgroundColor: Colors.primary[50],
    borderRadius: Layout.borderRadius.sm,
    padding: Layout.spacing.sm,
  },
  rewardsContainerSmall: {
    padding: Layout.spacing.xs,
  },
  rewardsTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
    color: Colors.primary[700],
    marginBottom: 2,
  },
  rewardsTitleSmall: {
    fontSize: 10,
  },
  rewardsText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 12,
    color: Colors.primary[600],
  },
  rewardsTextSmall: {
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
  challengeReward: {
    backgroundColor: Colors.primary[50],
    borderRadius: Layout.borderRadius.sm,
    padding: Layout.spacing.sm,
  },
  challengeRewardSmall: {
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
  progressSection: {
    gap: Layout.spacing.lg,
  },
  progressSectionSmall: {
    gap: Layout.spacing.md,
  },
  progressCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    ...Layout.shadows.small,
  },
  progressCardSmall: {
    padding: Layout.spacing.md,
  },
  progressCardTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.neutral[800],
    marginBottom: Layout.spacing.md,
  },
  progressCardTitleSmall: {
    fontSize: 14,
    marginBottom: Layout.spacing.sm,
  },
  categoryProgress: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    ...Layout.shadows.small,
  },
  categoryProgressSmall: {
    padding: Layout.spacing.sm,
  },
  categoryTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: Colors.neutral[700],
    marginBottom: Layout.spacing.sm,
  },
  categoryTitleSmall: {
    fontSize: 12,
    marginBottom: Layout.spacing.xs,
  },
});