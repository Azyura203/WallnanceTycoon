import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePlayerFinances } from './finance/usePlayerFinances';

const REWARDS_STORAGE_KEY = '@wallnance_rewards_system';
const DAILY_BONUS_KEY = '@wallnance_daily_bonus';

export interface RewardTransaction {
  id: string;
  type: 'lesson_complete' | 'quiz_pass' | 'achievement_unlock' | 'daily_bonus' | 'streak_bonus' | 'challenge_complete' | 'trading_bonus' | 'referral_bonus';
  amount: number;
  currency: 'points' | 'coins' | 'wlc' | 'trading_power';
  description: string;
  timestamp: Date;
  source: string;
  multiplier?: number;
  bonusType?: 'streak' | 'perfect_score' | 'first_time' | 'daily_double';
}

export interface PlayerRewards {
  totalPoints: number;
  totalWLC: number;
  lifetimeEarnings: number;
  currentStreak: number;
  maxStreak: number;
  lastClaimDate: string | null;
  transactions: RewardTransaction[];
  unclaimedRewards: {
    points: number;
    coins: number;
    wlc: number;
    tradingPower: number; // Special currency for premium features
  };
  premiumFeatures: {
    advancedCharts: boolean;
    prioritySupport: boolean;
    exclusiveContent: boolean;
    tradingSignals: boolean;
    portfolioAnalytics: boolean;
  };
  learningMilestones: {
    lessonsCompleted: number;
    perfectQuizzes: number;
    streakRecord: number;
    totalStudyTime: number; // in minutes
  };
}

const POINT_TO_COIN_RATE = 15; // 1 point = 15 coins (increased value)
const POINT_TO_WLC_RATE = 75; // 75 points = 1 WLC (better conversion)
const WLC_TO_TRADING_POWER_RATE = 10; // 1 WLC = 10 Trading Power

export function useRewardsSystem() {
  const [rewards, setRewards] = useState<PlayerRewards>({
    totalPoints: 0,
    totalWLC: 0,
    lifetimeEarnings: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastClaimDate: null,
    transactions: [],
    unclaimedRewards: {
      points: 0,
      coins: 0,
      wlc: 0,
      tradingPower: 0,
    },
    premiumFeatures: {
      advancedCharts: false,
      prioritySupport: false,
      exclusiveContent: false,
      tradingSignals: false,
      portfolioAnalytics: false,
    },
    learningMilestones: {
      lessonsCompleted: 0,
      perfectQuizzes: 0,
      streakRecord: 0,
      totalStudyTime: 0,
    },
  });

  const { updateBalance } = usePlayerFinances();

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const stored = await AsyncStorage.getItem(REWARDS_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setRewards({
          ...data,
          transactions: data.transactions.map((t: any) => ({
            ...t,
            timestamp: new Date(t.timestamp),
          })),
          // Ensure new properties exist
          premiumFeatures: data.premiumFeatures || {
            advancedCharts: false,
            prioritySupport: false,
            exclusiveContent: false,
            tradingSignals: false,
            portfolioAnalytics: false,
          },
          learningMilestones: data.learningMilestones || {
            lessonsCompleted: 0,
            perfectQuizzes: 0,
            streakRecord: 0,
            totalStudyTime: 0,
          },
          unclaimedRewards: {
            ...data.unclaimedRewards,
            tradingPower: data.unclaimedRewards?.tradingPower || 0,
          },
        });
      }
    } catch (error) {
      console.error('Error loading rewards:', error);
    }
  };

  const saveRewards = async (newRewards: PlayerRewards) => {
    try {
      await AsyncStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(newRewards));
      setRewards(newRewards);
    } catch (error) {
      console.error('Error saving rewards:', error);
    }
  };

  const addReward = async (
    type: RewardTransaction['type'],
    points: number,
    description: string,
    source: string,
    bonusMultiplier: number = 1,
    bonusType?: RewardTransaction['bonusType']
  ) => {
    const finalPoints = Math.floor(points * bonusMultiplier);
    const bonusCoins = Math.floor(finalPoints * POINT_TO_COIN_RATE);
    const bonusWLC = Math.floor(finalPoints / POINT_TO_WLC_RATE);
    const tradingPower = Math.floor(bonusWLC * WLC_TO_TRADING_POWER_RATE);
    
    const transaction: RewardTransaction = {
      id: Date.now().toString(),
      type,
      amount: finalPoints,
      currency: 'points',
      description,
      timestamp: new Date(),
      source,
      multiplier: bonusMultiplier,
      bonusType,
    };

    // Update learning milestones
    const updatedMilestones = { ...rewards.learningMilestones };
    if (type === 'lesson_complete') {
      updatedMilestones.lessonsCompleted += 1;
      updatedMilestones.totalStudyTime += Math.floor(points / 10); // Estimate study time
    }
    if (type === 'quiz_pass' && bonusType === 'perfect_score') {
      updatedMilestones.perfectQuizzes += 1;
    }

    const newRewards = {
      ...rewards,
      totalPoints: rewards.totalPoints + finalPoints,
      lifetimeEarnings: rewards.lifetimeEarnings + finalPoints,
      learningMilestones: updatedMilestones,
      unclaimedRewards: {
        points: rewards.unclaimedRewards.points + finalPoints,
        coins: rewards.unclaimedRewards.coins + bonusCoins,
        wlc: rewards.unclaimedRewards.wlc + bonusWLC,
        tradingPower: rewards.unclaimedRewards.tradingPower + tradingPower,
      },
      transactions: [transaction, ...rewards.transactions].slice(0, 100), // Keep last 100 transactions
    };

    await saveRewards(newRewards);
    return transaction;
  };

  const claimRewards = async () => {
    if (rewards.unclaimedRewards.coins > 0) {
      await updateBalance(rewards.unclaimedRewards.coins);
    }

    const claimedRewards = { ...rewards.unclaimedRewards };
    
    // Check for premium feature unlocks
    const updatedPremiumFeatures = { ...rewards.premiumFeatures };
    const newTotalWLC = rewards.totalWLC + rewards.unclaimedRewards.wlc;
    
    // Unlock premium features based on WLC holdings
    if (newTotalWLC >= 5 && !updatedPremiumFeatures.advancedCharts) {
      updatedPremiumFeatures.advancedCharts = true;
    }
    if (newTotalWLC >= 10 && !updatedPremiumFeatures.exclusiveContent) {
      updatedPremiumFeatures.exclusiveContent = true;
    }
    if (newTotalWLC >= 25 && !updatedPremiumFeatures.portfolioAnalytics) {
      updatedPremiumFeatures.portfolioAnalytics = true;
    }
    if (newTotalWLC >= 50 && !updatedPremiumFeatures.tradingSignals) {
      updatedPremiumFeatures.tradingSignals = true;
    }
    if (newTotalWLC >= 100 && !updatedPremiumFeatures.prioritySupport) {
      updatedPremiumFeatures.prioritySupport = true;
    }
    
    const newRewards = {
      ...rewards,
      totalWLC: newTotalWLC,
      premiumFeatures: updatedPremiumFeatures,
      unclaimedRewards: {
        points: 0,
        coins: 0,
        wlc: 0,
        tradingPower: 0,
      },
    };

    await saveRewards(newRewards);
    return {
      ...claimedRewards,
      newFeatures: getNewlyUnlockedFeatures(rewards.premiumFeatures, updatedPremiumFeatures),
    };
  };

  const getNewlyUnlockedFeatures = (oldFeatures: any, newFeatures: any) => {
    const newlyUnlocked = [];
    for (const [key, value] of Object.entries(newFeatures)) {
      if (value && !oldFeatures[key]) {
        newlyUnlocked.push(key);
      }
    }
    return newlyUnlocked;
  };

  const checkDailyBonus = async () => {
    const today = new Date().toDateString();
    const lastClaim = rewards.lastClaimDate;
    
    if (lastClaim !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      let newStreak = 1;
      if (lastClaim === yesterday.toDateString()) {
        newStreak = rewards.currentStreak + 1;
      }

      // Progressive daily bonus with better rewards
      const baseBonusPoints = 75; // Increased base
      const streakBonus = Math.min(newStreak * 25, 500); // Up to 500 bonus points
      const totalBonusPoints = baseBonusPoints + streakBonus;
      
      await addReward(
        'daily_bonus',
        totalBonusPoints,
        `Daily login bonus - Day ${newStreak} streak`,
        'Daily System',
        1,
        'daily_double'
      );

      const updatedMilestones = {
        ...rewards.learningMilestones,
        streakRecord: Math.max(rewards.learningMilestones.streakRecord, newStreak),
      };

      const newRewards = {
        ...rewards,
        currentStreak: newStreak,
        maxStreak: Math.max(rewards.maxStreak, newStreak),
        lastClaimDate: today,
        learningMilestones: updatedMilestones,
      };

      await saveRewards(newRewards);
      return { 
        claimed: true, 
        points: totalBonusPoints, 
        streak: newStreak,
        isNewRecord: newStreak > rewards.maxStreak,
      };
    }

    return { claimed: false, points: 0, streak: rewards.currentStreak, isNewRecord: false };
  };

  const getRewardMultiplier = () => {
    // Enhanced streak bonus multiplier
    if (rewards.currentStreak >= 30) return 3.0; // Monthly streak
    if (rewards.currentStreak >= 14) return 2.5; // Two week streak
    if (rewards.currentStreak >= 7) return 2.0;  // Weekly streak
    if (rewards.currentStreak >= 3) return 1.5;  // Short streak
    return 1.0;
  };

  const getPlayerLevel = () => {
    const baseXP = 1500; // Increased XP requirement
    const level = Math.floor(rewards.totalPoints / baseXP) + 1;
    const currentLevelPoints = rewards.totalPoints % baseXP;
    const nextLevelPoints = baseXP;
    return { level, currentLevelPoints, nextLevelPoints };
  };

  const getRecentTransactions = (limit: number = 10) => {
    return rewards.transactions.slice(0, limit);
  };

  const getTotalEarningsByType = (type: RewardTransaction['type']) => {
    return rewards.transactions
      .filter(t => t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const canAccessPremiumFeature = (feature: keyof PlayerRewards['premiumFeatures']) => {
    return rewards.premiumFeatures[feature];
  };

  const getFeatureUnlockRequirement = (feature: keyof PlayerRewards['premiumFeatures']) => {
    const requirements = {
      advancedCharts: 5,
      exclusiveContent: 10,
      portfolioAnalytics: 25,
      tradingSignals: 50,
      prioritySupport: 100,
    };
    return requirements[feature];
  };

  const getTradingPowerValue = () => {
    // Trading power can be used for:
    // - Reduced trading fees
    // - Access to premium market data
    // - Early access to new features
    // - Exclusive trading competitions
    return rewards.unclaimedRewards.tradingPower + (rewards.totalWLC * WLC_TO_TRADING_POWER_RATE);
  };

  const spendTradingPower = async (amount: number, description: string) => {
    const currentTradingPower = getTradingPowerValue();
    if (currentTradingPower < amount) {
      throw new Error('Insufficient Trading Power');
    }

    // Deduct from unclaimed first, then from WLC if needed
    let remaining = amount;
    let newUnclaimedTP = rewards.unclaimedRewards.tradingPower;
    let newTotalWLC = rewards.totalWLC;

    if (newUnclaimedTP >= remaining) {
      newUnclaimedTP -= remaining;
      remaining = 0;
    } else {
      remaining -= newUnclaimedTP;
      newUnclaimedTP = 0;
      const wlcToSpend = Math.ceil(remaining / WLC_TO_TRADING_POWER_RATE);
      newTotalWLC -= wlcToSpend;
    }

    const transaction: RewardTransaction = {
      id: Date.now().toString(),
      type: 'trading_bonus',
      amount: -amount,
      currency: 'trading_power',
      description: `Spent: ${description}`,
      timestamp: new Date(),
      source: 'Trading Power System',
    };

    const newRewards = {
      ...rewards,
      totalWLC: newTotalWLC,
      unclaimedRewards: {
        ...rewards.unclaimedRewards,
        tradingPower: newUnclaimedTP,
      },
      transactions: [transaction, ...rewards.transactions].slice(0, 100),
    };

    await saveRewards(newRewards);
    return true;
  };

  return {
    rewards,
    addReward,
    claimRewards,
    checkDailyBonus,
    getRewardMultiplier,
    getPlayerLevel,
    getRecentTransactions,
    getTotalEarningsByType,
    canAccessPremiumFeature,
    getFeatureUnlockRequirement,
    getTradingPowerValue,
    spendTradingPower,
    POINT_TO_COIN_RATE,
    POINT_TO_WLC_RATE,
    WLC_TO_TRADING_POWER_RATE,
  };
}