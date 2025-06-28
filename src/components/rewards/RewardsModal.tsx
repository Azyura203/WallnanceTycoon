import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Gift, Coins, Star, X, TrendingUp, Calendar } from 'lucide-react-native';
import Colors from '@/src/constants/Colors';
import Layout from '@/src/constants/Layout';
import GameButton from '@/src/components/buttons/GameButton';
import { useRewardsSystem } from '@/src/hooks/useRewardsSystem';

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
    POINT_TO_COIN_RATE,
    POINT_TO_WLC_RATE 
  } = useRewardsSystem();
  
  const [isClaiming, setIsClaiming] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [claimedAmount, setClaimedAmount] = useState({ points: 0, coins: 0, wlc: 0 });

  const { level, currentLevelPoints, nextLevelPoints } = getPlayerLevel();
  const recentTransactions = getRecentTransactions(5);

  const handleClaimRewards = async () => {
    if (rewards.unclaimedRewards.points === 0 && 
        rewards.unclaimedRewards.coins === 0 && 
        rewards.unclaimedRewards.wlc === 0) {
      return;
    }

    setIsClaiming(true);
    try {
      const claimed = await claimRewards();
      setClaimedAmount(claimed);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error claiming rewards:', error);
    } finally {
      setIsClaiming(false);
    }
  };

  const hasUnclaimedRewards = rewards.unclaimedRewards.points > 0 || 
                             rewards.unclaimedRewards.coins > 0 || 
                             rewards.unclaimedRewards.wlc > 0;

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

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Success Message */}
            {showSuccess && (
              <View style={[styles.successBanner, isSmallScreen && styles.successBannerSmall]}>
                <Text style={[styles.successText, isSmallScreen && styles.successTextSmall]}>
                  🎉 Rewards Claimed Successfully!
                </Text>
                <Text style={[styles.successDetails, isSmallScreen && styles.successDetailsSmall]}>
                  +{claimedAmount.coins.toLocaleString()} coins, +{claimedAmount.wlc} WLC
                </Text>
              </View>
            )}

            {/* Player Level & Progress */}
            <View style={[styles.levelCard, isSmallScreen && styles.levelCardSmall]}>
              <View style={styles.levelHeader}>
                <Star size={isSmallScreen ? 20 : 24} color={Colors.warning[500]} />
                <Text style={[styles.levelTitle, isSmallScreen && styles.levelTitleSmall]}>
                  Level {level} Trader
                </Text>
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
                  {currentLevelPoints}/{nextLevelPoints} points to Level {level + 1}
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
                      <Text style={[styles.transactionDate, isSmallScreen && styles.transactionDateSmall]}>
                        {transaction.timestamp.toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={[
                      styles.transactionAmount,
                      { color: Colors.success[600] },
                      isSmallScreen && styles.transactionAmountSmall
                    ]}>
                      +{transaction.amount} pts
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={[styles.noTransactions, isSmallScreen && styles.noTransactionsSmall]}>
                  No recent transactions
                </Text>
              )}
            </View>

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
  },
  successDetailsSmall: {
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
  },
  levelTitleSmall: {
    fontSize: 16,
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
    justifyContent: 'space-around',
    marginBottom: Layout.spacing.lg,
  },
  rewardsGridSmall: {
    marginBottom: Layout.spacing.md,
  },
  rewardItem: {
    alignItems: 'center',
    gap: 4,
  },
  rewardItemSmall: {
    gap: 2,
  },
  rewardIcon: {
    fontSize: 24,
  },
  rewardIconSmall: {
    fontSize: 20,
  },
  rewardAmount: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: Colors.neutral[800],
  },
  rewardAmountSmall: {
    fontSize: 16,
  },
  rewardLabel: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: Colors.neutral[600],
  },
  rewardLabelSmall: {
    fontSize: 10,
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
  transactionDate: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: Colors.neutral[500],
  },
  transactionDateSmall: {
    fontSize: 10,
  },
  transactionAmount: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
  },
  transactionAmountSmall: {
    fontSize: 12,
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