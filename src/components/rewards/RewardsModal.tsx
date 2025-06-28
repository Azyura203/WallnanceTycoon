import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Gift, Coins, Star, X, TrendingUp, Calendar, Zap, Crown, Lock } from 'lucide-react-native';
import Colors from '@/src/constants/Colors';
import Layout from '@/src/constants/Layout';
import GameButton from '@/src/components/buttons/GameButton';
import { useRewardsSystem } from '@/src/hooks/useRewardsSystem';
import { usePlayerFinances } from '@/src/hooks/finance/usePlayerFinances';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function RewardsModal({ visible, onClose }: Props) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;
  
  const { 
    rewards, 
    claimRewards, 
    getPlayerLevel, 
    getRecentTransactions,
    canAccessPremiumFeature,
    getFeatureUnlockRequirement,
    getTradingPowerValue,
    POINT_TO_COIN_RATE,
    POINT_TO_WLC_RATE,
    WLC_TO_TRADING_POWER_RATE 
  } = useRewardsSystem();
  
  const { updateBalance } = usePlayerFinances();
  
  const [isClaiming, setIsClaiming] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [claimedAmount, setClaimedAmount] = useState({ 
    points: 0, 
    coins: 0, 
    wlc: 0, 
    tradingPower: 0,
    newFeatures: [] as string[]
  });
  const [selectedTab, setSelectedTab] = useState<'rewards' | 'premium' | 'history'>('rewards');

  const { level, currentLevelPoints, nextLevelPoints } = getPlayerLevel();
  const recentTransactions = getRecentTransactions(8);
  const tradingPowerValue = getTradingPowerValue();

  const handleClaimRewards = async () => {
    if (rewards.unclaimedRewards.points === 0 && 
        rewards.unclaimedRewards.coins === 0 && 
        rewards.unclaimedRewards.wlc === 0 &&
        rewards.unclaimedRewards.tradingPower === 0) {
      return;
    }

    setIsClaiming(true);
    try {
      const claimed = await claimRewards();
      
      // Update player balance with claimed coins
      if (claimed.claimedCoins > 0) {
        await updateBalance(claimed.claimedCoins);
      }
      
      setClaimedAmount(claimed);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 4000);
    } catch (error) {
      console.error('Error claiming rewards:', error);
    } finally {
      setIsClaiming(false);
    }
  };

  const hasUnclaimedRewards = rewards.unclaimedRewards.points > 0 || 
                             rewards.unclaimedRewards.coins > 0 || 
                             rewards.unclaimedRewards.wlc > 0 ||
                             rewards.unclaimedRewards.tradingPower > 0;

  const getPremiumFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'advancedCharts': return '📊';
      case 'exclusiveContent': return '🎓';
      case 'portfolioAnalytics': return '📈';
      case 'tradingSignals': return '🔔';
      case 'prioritySupport': return '👑';
      default: return '⭐';
    }
  };

  const getPremiumFeatureName = (feature: string) => {
    switch (feature) {
      case 'advancedCharts': return 'Advanced Charts';
      case 'exclusiveContent': return 'Exclusive Content';
      case 'portfolioAnalytics': return 'Portfolio Analytics';
      case 'tradingSignals': return 'Trading Signals';
      case 'prioritySupport': return 'Priority Support';
      default: return feature;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, isSmallScreen && styles.modalContentSmall]}>
          {/* Header */}
          <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
            <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>
              🎁 Rewards Center
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={isSmallScreen ? 20 : 24} color={Colors.neutral[600]} />
            </TouchableOpacity>
          </View>

          {/* Tab Navigation */}
          <View style={[styles.tabContainer, isSmallScreen && styles.tabContainerSmall]}>
            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === 'rewards' && styles.activeTab,
                isSmallScreen && styles.tabSmall
              ]}
              onPress={() => setSelectedTab('rewards')}
            >
              <Gift size={isSmallScreen ? 16 : 20} color={
                selectedTab === 'rewards' ? Colors.primary[600] : Colors.neutral[400]
              } />
              <Text style={[
                styles.tabText,
                selectedTab === 'rewards' && styles.activeTabText,
                isSmallScreen && styles.tabTextSmall
              ]}>
                Rewards
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === 'premium' && styles.activeTab,
                isSmallScreen && styles.tabSmall
              ]}
              onPress={() => setSelectedTab('premium')}
            >
              <Crown size={isSmallScreen ? 16 : 20} color={
                selectedTab === 'premium' ? Colors.primary[600] : Colors.neutral[400]
              } />
              <Text style={[
                styles.tabText,
                selectedTab === 'premium' && styles.activeTabText,
                isSmallScreen && styles.tabTextSmall
              ]}>
                Premium
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === 'history' && styles.activeTab,
                isSmallScreen && styles.tabSmall
              ]}
              onPress={() => setSelectedTab('history')}
            >
              <Calendar size={isSmallScreen ? 16 : 20} color={
                selectedTab === 'history' ? Colors.primary[600] : Colors.neutral[400]
              } />
              <Text style={[
                styles.tabText,
                selectedTab === 'history' && styles.activeTabText,
                isSmallScreen && styles.tabTextSmall
              ]}>
                History
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Success Message */}
            {showSuccess && (
              <View style={[styles.successBanner, isSmallScreen && styles.successBannerSmall]}>
                <Text style={[styles.successText, isSmallScreen && styles.successTextSmall]}>
                  🎉 Rewards Claimed Successfully!
                </Text>
                <Text style={[styles.successDetails, isSmallScreen && styles.successDetailsSmall]}>
                  +{claimedAmount.coins.toLocaleString()} coins, +{claimedAmount.wlc} WLC
                  {claimedAmount.tradingPower > 0 && `, +${claimedAmount.tradingPower} Trading Power`}
                </Text>
                {claimedAmount.newFeatures.length > 0 && (
                  <Text style={[styles.newFeaturesText, isSmallScreen && styles.newFeaturesTextSmall]}>
                    🔓 New features unlocked: {claimedAmount.newFeatures.map(getPremiumFeatureName).join(', ')}
                  </Text>
                )}
              </View>
            )}

            {selectedTab === 'rewards' && (
              <>
                {/* Player Level & Progress */}
                <View style={[styles.levelCard, isSmallScreen && styles.levelCardSmall]}>
                  <View style={styles.levelHeader}>
                    <Star size={isSmallScreen ? 20 : 24} color={Colors.warning[500]} />
                    <Text style={[styles.levelTitle, isSmallScreen && styles.levelTitleSmall]}>
                      Level {level} Trader
                    </Text>
                    <View style={[styles.tradingPowerBadge, isSmallScreen && styles.tradingPowerBadgeSmall]}>
                      <Zap size={isSmallScreen ? 12 : 14} color={Colors.accent[600]} />
                      <Text style={[styles.tradingPowerText, isSmallScreen && styles.tradingPowerTextSmall]}>
                        {tradingPowerValue} TP
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.progressContainer, isSmallScreen && styles.progressContainerSmall]}>
                    <View style={[styles.progressBar, isSmallScreen && styles.progressBarSmall]}>
                      <View 
                        style={[
                          styles.progressFill,
                          { width: `${(currentLevelPoints / nextLevelPoints) * 100}%` }
                        ]} 
                      />
                    </View>
                    <Text style={[styles.progressText, isSmallScreen && styles.progressTextSmall]}>
                      {currentLevelPoints.toLocaleString()}/{nextLevelPoints.toLocaleString()} points to Level {level + 1}
                    </Text>
                  </View>
                </View>

                {/* Unclaimed Rewards */}
                <View style={[styles.rewardsCard, isSmallScreen && styles.rewardsCardSmall]}>
                  <Text style={[styles.cardTitle, isSmallScreen && styles.cardTitleSmall]}>
                    💰 Unclaimed Rewards
                  </Text>
                  
                  <View style={[styles.rewardsGrid, isSmallScreen && styles.rewardsGridSmall]}>
                    <View style={[styles.rewardItem, isSmallScreen && styles.rewardItemSmall]}>
                      <Text style={[styles.rewardIcon, isSmallScreen && styles.rewardIconSmall]}>⭐</Text>
                      <Text style={[styles.rewardAmount, isSmallScreen && styles.rewardAmountSmall]}>
                        {rewards.unclaimedRewards.points.toLocaleString()}
                      </Text>
                      <Text style={[styles.rewardLabel, isSmallScreen && styles.rewardLabelSmall]}>
                        Points
                      </Text>
                    </View>
                    
                    <View style={[styles.rewardItem, isSmallScreen && styles.rewardItemSmall]}>
                      <Text style={[styles.rewardIcon, isSmallScreen && styles.rewardIconSmall]}>💰</Text>
                      <Text style={[styles.rewardAmount, isSmallScreen && styles.rewardAmountSmall]}>
                        {rewards.unclaimedRewards.coins.toLocaleString()}
                      </Text>
                      <Text style={[styles.rewardLabel, isSmallScreen && styles.rewardLabelSmall]}>
                        Coins
                      </Text>
                    </View>
                    
                    <View style={[styles.rewardItem, isSmallScreen && styles.rewardItemSmall]}>
                      <Text style={[styles.rewardIcon, isSmallScreen && styles.rewardIconSmall]}>🪙</Text>
                      <Text style={[styles.rewardAmount, isSmallScreen && styles.rewardAmountSmall]}>
                        {rewards.unclaimedRewards.wlc}
                      </Text>
                      <Text style={[styles.rewardLabel, isSmallScreen && styles.rewardLabelSmall]}>
                        WLC
                      </Text>
                    </View>

                    <View style={[styles.rewardItem, isSmallScreen && styles.rewardItemSmall]}>
                      <Text style={[styles.rewardIcon, isSmallScreen && styles.rewardIconSmall]}>⚡</Text>
                      <Text style={[styles.rewardAmount, isSmallScreen && styles.rewardAmountSmall]}>
                        {rewards.unclaimedRewards.tradingPower}
                      </Text>
                      <Text style={[styles.rewardLabel, isSmallScreen && styles.rewardLabelSmall]}>
                        Trading Power
                      </Text>
                    </View>
                  </View>

                  <GameButton
                    title={isClaiming ? "Claiming..." : "Claim All Rewards"}
                    onPress={handleClaimRewards}
                    disabled={!hasUnclaimedRewards || isClaiming}
                    style={[
                      styles.claimButton,
                      !hasUnclaimedRewards && styles.claimButtonDisabled,
                      isSmallScreen && styles.claimButtonSmall
                    ]}
                    textStyle={[styles.claimButtonText, isSmallScreen && styles.claimButtonTextSmall]}
                  />
                </View>

                {/* Learning Milestones */}
                <View style={[styles.milestonesCard, isSmallScreen && styles.milestonesCardSmall]}>
                  <Text style={[styles.cardTitle, isSmallScreen && styles.cardTitleSmall]}>
                    🎓 Learning Milestones
                  </Text>
                  
                  <View style={[styles.milestonesGrid, isSmallScreen && styles.milestonesGridSmall]}>
                    <View style={[styles.milestoneItem, isSmallScreen && styles.milestoneItemSmall]}>
                      <Text style={[styles.milestoneValue, isSmallScreen && styles.milestoneValueSmall]}>
                        {rewards.learningMilestones.lessonsCompleted}
                      </Text>
                      <Text style={[styles.milestoneLabel, isSmallScreen && styles.milestoneLabelSmall]}>
                        Lessons Completed
                      </Text>
                    </View>
                    
                    <View style={[styles.milestoneItem, isSmallScreen && styles.milestoneItemSmall]}>
                      <Text style={[styles.milestoneValue, isSmallScreen && styles.milestoneValueSmall]}>
                        {rewards.learningMilestones.perfectQuizzes}
                      </Text>
                      <Text style={[styles.milestoneLabel, isSmallScreen && styles.milestoneLabelSmall]}>
                        Perfect Quizzes
                      </Text>
                    </View>
                    
                    <View style={[styles.milestoneItem, isSmallScreen && styles.milestoneItemSmall]}>
                      <Text style={[styles.milestoneValue, isSmallScreen && styles.milestoneValueSmall]}>
                        {Math.floor(rewards.learningMilestones.totalStudyTime / 60)}h
                      </Text>
                      <Text style={[styles.milestoneLabel, isSmallScreen && styles.milestoneLabelSmall]}>
                        Study Time
                      </Text>
                    </View>
                    
                    <View style={[styles.milestoneItem, isSmallScreen && styles.milestoneItemSmall]}>
                      <Text style={[styles.milestoneValue, isSmallScreen && styles.milestoneValueSmall]}>
                        {rewards.learningMilestones.streakRecord}
                      </Text>
                      <Text style={[styles.milestoneLabel, isSmallScreen && styles.milestoneLabelSmall]}>
                        Best Streak
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            {selectedTab === 'premium' && (
              <>
                {/* Premium Features */}
                <View style={[styles.premiumCard, isSmallScreen && styles.premiumCardSmall]}>
                  <Text style={[styles.cardTitle, isSmallScreen && styles.cardTitleSmall]}>
                    👑 Premium Features
                  </Text>
                  <Text style={[styles.premiumSubtitle, isSmallScreen && styles.premiumSubtitleSmall]}>
                    Unlock exclusive features with WLC tokens
                  </Text>
                  
                  {Object.entries(rewards.premiumFeatures).map(([feature, unlocked]) => (
                    <View key={feature} style={[styles.featureItem, isSmallScreen && styles.featureItemSmall]}>
                      <View style={styles.featureInfo}>
                        <Text style={[styles.featureIcon, isSmallScreen && styles.featureIconSmall]}>
                          {getPremiumFeatureIcon(feature)}
                        </Text>
                        <View style={styles.featureText}>
                          <Text style={[
                            styles.featureName,
                            unlocked && styles.featureNameUnlocked,
                            isSmallScreen && styles.featureNameSmall
                          ]}>
                            {getPremiumFeatureName(feature)}
                          </Text>
                          <Text style={[styles.featureRequirement, isSmallScreen && styles.featureRequirementSmall]}>
                            Requires {getFeatureUnlockRequirement(feature as any)} WLC
                          </Text>
                        </View>
                      </View>
                      <View style={styles.featureStatus}>
                        {unlocked ? (
                          <View style={[styles.unlockedBadge, isSmallScreen && styles.unlockedBadgeSmall]}>
                            <Text style={[styles.unlockedText, isSmallScreen && styles.unlockedTextSmall]}>
                              ✓ Unlocked
                            </Text>
                          </View>
                        ) : (
                          <View style={[styles.lockedBadge, isSmallScreen && styles.lockedBadgeSmall]}>
                            <Lock size={isSmallScreen ? 12 : 14} color={Colors.neutral[400]} />
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>

                {/* Trading Power Usage */}
                <View style={[styles.tradingPowerCard, isSmallScreen && styles.tradingPowerCardSmall]}>
                  <Text style={[styles.cardTitle, isSmallScreen && styles.cardTitleSmall]}>
                    ⚡ Trading Power Benefits
                  </Text>
                  <Text style={[styles.tradingPowerBalance, isSmallScreen && styles.tradingPowerBalanceSmall]}>
                    Available: {tradingPowerValue} TP
                  </Text>
                  
                  <View style={[styles.benefitsList, isSmallScreen && styles.benefitsListSmall]}>
                    <Text style={[styles.benefitItem, isSmallScreen && styles.benefitItemSmall]}>
                      • 50% reduced trading fees (10 TP per trade)
                    </Text>
                    <Text style={[styles.benefitItem, isSmallScreen && styles.benefitItemSmall]}>
                      • Access to premium market data (25 TP per day)
                    </Text>
                    <Text style={[styles.benefitItem, isSmallScreen && styles.benefitItemSmall]}>
                      • Early access to new features (100 TP)
                    </Text>
                    <Text style={[styles.benefitItem, isSmallScreen && styles.benefitItemSmall]}>
                      • Exclusive trading competitions (50 TP entry)
                    </Text>
                  </View>
                </View>
              </>
            )}

            {selectedTab === 'history' && (
              <>
                {/* Lifetime Stats */}
                <View style={[styles.statsCard, isSmallScreen && styles.statsCardSmall]}>
                  <Text style={[styles.cardTitle, isSmallScreen && styles.cardTitleSmall]}>
                    📊 Lifetime Stats
                  </Text>
                  
                  <View style={[styles.statsGrid, isSmallScreen && styles.statsGridSmall]}>
                    <View style={[styles.statItem, isSmallScreen && styles.statItemSmall]}>
                      <TrendingUp size={isSmallScreen ? 16 : 20} color={Colors.primary[500]} />
                      <Text style={[styles.statValue, isSmallScreen && styles.statValueSmall]}>
                        {rewards.totalPoints.toLocaleString()}
                      </Text>
                      <Text style={[styles.statLabel, isSmallScreen && styles.statLabelSmall]}>
                        Total Points
                      </Text>
                    </View>
                    
                    <View style={[styles.statItem, isSmallScreen && styles.statItemSmall]}>
                      <Coins size={isSmallScreen ? 16 : 20} color={Colors.warning[500]} />
                      <Text style={[styles.statValue, isSmallScreen && styles.statValueSmall]}>
                        {rewards.totalWLC}
                      </Text>
                      <Text style={[styles.statLabel, isSmallScreen && styles.statLabelSmall]}>
                        Total WLC
                      </Text>
                    </View>
                    
                    <View style={[styles.statItem, isSmallScreen && styles.statItemSmall]}>
                      <Calendar size={isSmallScreen ? 16 : 20} color={Colors.success[500]} />
                      <Text style={[styles.statValue, isSmallScreen && styles.statValueSmall]}>
                        {rewards.currentStreak}
                      </Text>
                      <Text style={[styles.statLabel, isSmallScreen && styles.statLabelSmall]}>
                        Current Streak
                      </Text>
                    </View>
                    
                    <View style={[styles.statItem, isSmallScreen && styles.statItemSmall]}>
                      <Star size={isSmallScreen ? 16 : 20} color={Colors.accent[500]} />
                      <Text style={[styles.statValue, isSmallScreen && styles.statValueSmall]}>
                        {rewards.maxStreak}
                      </Text>
                      <Text style={[styles.statLabel, isSmallScreen && styles.statLabelSmall]}>
                        Max Streak
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Recent Transactions */}
                <View style={[styles.transactionsCard, isSmallScreen && styles.transactionsCardSmall]}>
                  <Text style={[styles.cardTitle, isSmallScreen && styles.cardTitleSmall]}>
                    📝 Recent Earnings
                  </Text>
                  
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((transaction) => (
                      <View key={transaction.id} style={[styles.transactionItem, isSmallScreen && styles.transactionItemSmall]}>
                        <View style={styles.transactionInfo}>
                          <Text style={[styles.transactionDescription, isSmallScreen && styles.transactionDescriptionSmall]}>
                            {transaction.description}
                          </Text>
                          <View style={styles.transactionMeta}>
                            <Text style={[styles.transactionDate, isSmallScreen && styles.transactionDateSmall]}>
                              {transaction.timestamp.toLocaleDateString()}
                            </Text>
                            {transaction.bonusType && (
                              <View style={[styles.bonusTypeBadge, isSmallScreen && styles.bonusTypeBadgeSmall]}>
                                <Text style={[styles.bonusTypeText, isSmallScreen && styles.bonusTypeTextSmall]}>
                                  {transaction.bonusType}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                        <View style={styles.transactionAmount}>
                          <Text style={[
                            styles.transactionAmountText,
                            { color: transaction.amount >= 0 ? Colors.success[600] : Colors.error[600] },
                            isSmallScreen && styles.transactionAmountTextSmall
                          ]}>
                            {transaction.amount >= 0 ? '+' : ''}{transaction.amount} {transaction.currency}
                          </Text>
                          {transaction.multiplier && transaction.multiplier > 1 && (
                            <Text style={[styles.multiplierText, isSmallScreen && styles.multiplierTextSmall]}>
                              {transaction.multiplier}x
                            </Text>
                          )}
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={[styles.noTransactions, isSmallScreen && styles.noTransactionsSmall]}>
                      No recent transactions
                    </Text>
                  )}
                </View>
              </>
            )}

            {/* Exchange Rates */}
            <View style={[styles.exchangeCard, isSmallScreen && styles.exchangeCardSmall]}>
              <Text style={[styles.cardTitle, isSmallScreen && styles.cardTitleSmall]}>
                💱 Exchange Rates
              </Text>
              <Text style={[styles.exchangeRate, isSmallScreen && styles.exchangeRateSmall]}>
                1 Point = {POINT_TO_COIN_RATE} Coins
              </Text>
              <Text style={[styles.exchangeRate, isSmallScreen && styles.exchangeRateSmall]}>
                {POINT_TO_WLC_RATE} Points = 1 WLC
              </Text>
              <Text style={[styles.exchangeRate, isSmallScreen && styles.exchangeRateSmall]}>
                1 WLC = {WLC_TO_TRADING_POWER_RATE} Trading Power
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: Layout.spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.lg,
    maxHeight: '90%',
    ...Layout.shadows.large,
  },
  modalContentSmall: {
    maxHeight: '95%',
    borderRadius: Layout.borderRadius.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  headerSmall: {
    padding: Layout.spacing.md,
  },
  title: {
    fontFamily: 'Nunito-Bold',
    fontSize: 24,
    color: Colors.primary[700],
  },
  titleSmall: {
    fontSize: 20,
  },
  closeButton: {
    padding: Layout.spacing.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[100],
    margin: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    padding: 4,
  },
  tabContainerSmall: {
    margin: Layout.spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: Layout.borderRadius.sm,
  },
  tabSmall: {
    paddingVertical: 6,
    gap: 2,
  },
  activeTab: {
    backgroundColor: Colors.card,
    ...Layout.shadows.small,
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
  content: {
    flex: 1,
    padding: Layout.spacing.lg,
  },
  successBanner: {
    backgroundColor: Colors.success[100],
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success[500],
  },
  successBannerSmall: {
    padding: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  successText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.success[700],
    marginBottom: 4,
  },
  successTextSmall: {
    fontSize: 14,
  },
  successDetails: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.success[600],
    marginBottom: 4,
  },
  successDetailsSmall: {
    fontSize: 12,
  },
  newFeaturesText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: Colors.warning[700],
  },
  newFeaturesTextSmall: {
    fontSize: 12,
  },
  levelCard: {
    backgroundColor: Colors.warning[50],
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  levelCardSmall: {
    padding: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.sm,
  },
  levelTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: Colors.warning[700],
    flex: 1,
  },
  levelTitleSmall: {
    fontSize: 16,
  },
  tradingPowerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accent[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tradingPowerBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 2,
  },
  tradingPowerText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
    color: Colors.accent[700],
  },
  tradingPowerTextSmall: {
    fontSize: 10,
  },
  progressContainer: {
    gap: 4,
  },
  progressContainerSmall: {
    gap: 2,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.warning[200],
    borderRadius: 4,
  },
  progressBarSmall: {
    height: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.warning[500],
    borderRadius: 4,
  },
  progressText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: Colors.warning[600],
  },
  progressTextSmall: {
    fontSize: 10,
  },
  rewardsCard: {
    backgroundColor: Colors.primary[50],
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  rewardsCardSmall: {
    padding: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  cardTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.neutral[800],
    marginBottom: Layout.spacing.md,
  },
  cardTitleSmall: {
    fontSize: 14,
    marginBottom: Layout.spacing.sm,
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.lg,
    gap: Layout.spacing.sm,
  },
  rewardsGridSmall: {
    marginBottom: Layout.spacing.md,
    gap: Layout.spacing.xs,
  },
  rewardItem: {
    alignItems: 'center',
    gap: 4,
    minWidth: '22%',
  },
  rewardItemSmall: {
    gap: 2,
    minWidth: '20%',
  },
  rewardIcon: {
    fontSize: 20,
  },
  rewardIconSmall: {
    fontSize: 16,
  },
  rewardAmount: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.neutral[800],
  },
  rewardAmountSmall: {
    fontSize: 14,
  },
  rewardLabel: {
    fontFamily: 'Nunito-Regular',
    fontSize: 10,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  rewardLabelSmall: {
    fontSize: 8,
  },
  claimButton: {
    backgroundColor: Colors.success[500],
  },
  claimButtonSmall: {
    paddingVertical: Layout.spacing.sm,
  },
  claimButtonDisabled: {
    backgroundColor: Colors.neutral[300],
  },
  claimButtonText: {
    fontSize: 16,
  },
  claimButtonTextSmall: {
    fontSize: 14,
  },
  milestonesCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
    ...Layout.shadows.small,
  },
  milestonesCardSmall: {
    padding: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  milestonesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Layout.spacing.sm,
  },
  milestonesGridSmall: {
    gap: Layout.spacing.xs,
  },
  milestoneItem: {
    alignItems: 'center',
    minWidth: '22%',
    gap: 4,
  },
  milestoneItemSmall: {
    gap: 2,
    minWidth: '20%',
  },
  milestoneValue: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: Colors.primary[600],
  },
  milestoneValueSmall: {
    fontSize: 16,
  },
  milestoneLabel: {
    fontFamily: 'Nunito-Regular',
    fontSize: 10,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  milestoneLabelSmall: {
    fontSize: 8,
  },
  premiumCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
    ...Layout.shadows.small,
  },
  premiumCardSmall: {
    padding: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  premiumSubtitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.neutral[600],
    marginBottom: Layout.spacing.md,
  },
  premiumSubtitleSmall: {
    fontSize: 12,
    marginBottom: Layout.spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  featureItemSmall: {
    paddingVertical: Layout.spacing.xs,
  },
  featureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Layout.spacing.sm,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureIconSmall: {
    fontSize: 16,
  },
  featureText: {
    flex: 1,
  },
  featureName: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: Colors.neutral[600],
    marginBottom: 2,
  },
  featureNameSmall: {
    fontSize: 12,
  },
  featureNameUnlocked: {
    color: Colors.success[600],
  },
  featureRequirement: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: Colors.neutral[500],
  },
  featureRequirementSmall: {
    fontSize: 10,
  },
  featureStatus: {
    alignItems: 'center',
  },
  unlockedBadge: {
    backgroundColor: Colors.success[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unlockedBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unlockedText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 10,
    color: Colors.success[600],
  },
  unlockedTextSmall: {
    fontSize: 8,
  },
  lockedBadge: {
    padding: 4,
  },
  lockedBadgeSmall: {
    padding: 2,
  },
  tradingPowerCard: {
    backgroundColor: Colors.accent[50],
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  tradingPowerCardSmall: {
    padding: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  tradingPowerBalance: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.accent[700],
    marginBottom: Layout.spacing.md,
  },
  tradingPowerBalanceSmall: {
    fontSize: 14,
    marginBottom: Layout.spacing.sm,
  },
  benefitsList: {
    gap: Layout.spacing.xs,
  },
  benefitsListSmall: {
    gap: Layout.spacing.xs / 2,
  },
  benefitItem: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: Colors.accent[600],
    lineHeight: 18,
  },
  benefitItemSmall: {
    fontSize: 10,
    lineHeight: 16,
  },
  statsCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
    ...Layout.shadows.small,
  },
  statsCardSmall: {
    padding: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.md,
  },
  statsGridSmall: {
    gap: Layout.spacing.sm,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    gap: 4,
  },
  statItemSmall: {
    gap: 2,
  },
  statValue: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.neutral[800],
  },
  statValueSmall: {
    fontSize: 14,
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
  transactionsCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
    ...Layout.shadows.small,
  },
  transactionsCardSmall: {
    padding: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  transactionItemSmall: {
    paddingVertical: Layout.spacing.xs,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  transactionDescriptionSmall: {
    fontSize: 12,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  transactionDate: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: Colors.neutral[500],
  },
  transactionDateSmall: {
    fontSize: 10,
  },
  bonusTypeBadge: {
    backgroundColor: Colors.warning[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bonusTypeBadgeSmall: {
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  bonusTypeText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 8,
    color: Colors.warning[700],
    textTransform: 'uppercase',
  },
  bonusTypeTextSmall: {
    fontSize: 6,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
  },
  transactionAmountTextSmall: {
    fontSize: 12,
  },
  multiplierText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 10,
    color: Colors.warning[600],
  },
  multiplierTextSmall: {
    fontSize: 8,
  },
  noTransactions: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.neutral[500],
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: Layout.spacing.lg,
  },
  noTransactionsSmall: {
    fontSize: 12,
    paddingVertical: Layout.spacing.md,
  },
  exchangeCard: {
    backgroundColor: Colors.accent[50],
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
  },
  exchangeCardSmall: {
    padding: Layout.spacing.sm,
  },
  exchangeRate: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: Colors.accent[700],
    marginBottom: 4,
  },
  exchangeRateSmall: {
    fontSize: 12,
  },
});