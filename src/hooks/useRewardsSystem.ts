import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePlayerFinances } from './finance/usePlayerFinances';

const REWARDS_STORAGE_KEY = '@wallnance_rewards_system';
const DAILY_BONUS_KEY = '@wallnance_daily_bonus';

export interface RewardTransaction {
  id: string;
  type: 'lesson_complete' | 'quiz_pass' | 'achievement_unlock' | 'daily_bonus' | 'streak_bonus' | 'challenge_complete';
  amount: number;
  currency: 'points' | 'coins' | 'wlc';
  description: string;
  timestamp: Date;
  source: string;
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
  };
}

const POINT_TO_COIN_RATE = 10; // 1 point = 10 coins
const POINT_TO_WLC_RATE = 100; // 100 points = 1 WLC

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
    bonusMultiplier: number = 1
  ) => {
    const finalPoints = Math.floor(points * bonusMultiplier);
    const bonusCoins = Math.floor(finalPoints * POINT_TO_COIN_RATE * 0.1); // 10% bonus coins
    
    const transaction: RewardTransaction = {
      id: Date.now().toString(),
      type,
      amount: finalPoints,
      currency: 'points',
      description,
      timestamp: new Date(),
      source,
    };

    const newRewards = {
      ...rewards,
      totalPoints: rewards.totalPoints + finalPoints,
      lifetimeEarnings: rewards.lifetimeEarnings + finalPoints,
      unclaimedRewards: {
        points: rewards.unclaimedRewards.points + finalPoints,
        coins: rewards.unclaimedRewards.coins + bonusCoins,
        wlc: rewards.unclaimedRewards.wlc + Math.floor(finalPoints / POINT_TO_WLC_RATE),
      },
      transactions: [transaction, ...rewards.transactions].slice(0, 50), // Keep last 50 transactions
    };

    await saveRewards(newRewards);
    return transaction;
  };

  const claimRewards = async () => {
    if (rewards.unclaimedRewards.coins > 0) {
      await updateBalance(rewards.unclaimedRewards.coins);
    }

    const claimedRewards = { ...rewards.unclaimedRewards };
    
    const newRewards = {
      ...rewards,
      totalWLC: rewards.totalWLC + rewards.unclaimedRewards.wlc,
      unclaimedRewards: {
        points: 0,
        coins: 0,
        wlc: 0,
      },
    };

    await saveRewards(newRewards);
    return claimedRewards;
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

      const bonusPoints = Math.min(50 + (newStreak * 10), 200); // Max 200 points
      
      await addReward(
        'daily_bonus',
        bonusPoints,
        `Daily login bonus - Day ${newStreak}`,
        'Daily System',
        1
      );

      const newRewards = {
        ...rewards,
        currentStreak: newStreak,
        maxStreak: Math.max(rewards.maxStreak, newStreak),
        lastClaimDate: today,
      };

      await saveRewards(newRewards);
      return { claimed: true, points: bonusPoints, streak: newStreak };
    }

    return { claimed: false, points: 0, streak: rewards.currentStreak };
  };

  const getRewardMultiplier = () => {
    // Streak bonus multiplier
    if (rewards.currentStreak >= 7) return 2.0;
    if (rewards.currentStreak >= 3) return 1.5;
    return 1.0;
  };

  const getPlayerLevel = () => {
    const level = Math.floor(rewards.totalPoints / 1000) + 1;
    const currentLevelPoints = rewards.totalPoints % 1000;
    const nextLevelPoints = 1000;
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

  return {
    rewards,
    addReward,
    claimRewards,
    checkDailyBonus,
    getRewardMultiplier,
    getPlayerLevel,
    getRecentTransactions,
    getTotalEarningsByType,
    POINT_TO_COIN_RATE,
    POINT_TO_WLC_RATE,
  };
}