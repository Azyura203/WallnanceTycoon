import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Achievement } from '@/src/types/game';

const ACHIEVEMENTS_STORAGE_KEY = '@wallnance_achievements';

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  // Trading Achievements
  {
    id: 'first_trade',
    title: 'First Steps',
    description: 'Complete your first trade',
    emoji: '👶',
    category: 'trading',
    requirement: { type: 'trade_count', target: 1 },
    reward: { type: 'points', amount: 100, description: '100 points' },
    unlocked: false,
    rarity: 'common',
  },
  {
    id: 'day_trader',
    title: 'Day Trader',
    description: 'Complete 10 trades in a single day',
    emoji: '📈',
    category: 'trading',
    requirement: { type: 'trade_count', target: 10 },
    reward: { type: 'coins', amount: 50000, description: '50K coins' },
    unlocked: false,
    rarity: 'rare',
  },
  {
    id: 'profit_master',
    title: 'Profit Master',
    description: 'Earn $100K in total profits',
    emoji: '💰',
    category: 'trading',
    requirement: { type: 'profit_amount', target: 100000 },
    reward: { type: 'badge', amount: 1, description: 'Golden Bull Badge' },
    unlocked: false,
    rarity: 'epic',
  },
  
  // Learning Achievements
  {
    id: 'student',
    title: 'Eager Student',
    description: 'Complete your first lesson',
    emoji: '📚',
    category: 'learning',
    requirement: { type: 'lesson_complete', target: 1 },
    reward: { type: 'points', amount: 50, description: '50 points' },
    unlocked: false,
    rarity: 'common',
  },
  {
    id: 'scholar',
    title: 'Scholar',
    description: 'Complete 20 lessons',
    emoji: '🎓',
    category: 'learning',
    requirement: { type: 'lesson_complete', target: 20 },
    reward: { type: 'unlock', amount: 1, description: 'Advanced Trading Course' },
    unlocked: false,
    rarity: 'rare',
  },
  {
    id: 'streak_master',
    title: 'Streak Master',
    description: 'Maintain a 7-day learning streak',
    emoji: '🔥',
    category: 'learning',
    requirement: { type: 'streak_days', target: 7 },
    reward: { type: 'coins', amount: 25000, description: '25K coins' },
    unlocked: false,
    rarity: 'epic',
  },
  
  // Portfolio Achievements
  {
    id: 'millionaire',
    title: 'Millionaire',
    description: 'Reach $1M portfolio value',
    emoji: '💎',
    category: 'portfolio',
    requirement: { type: 'portfolio_value', target: 1000000 },
    reward: { type: 'badge', amount: 1, description: 'Diamond Hands Badge' },
    unlocked: false,
    rarity: 'legendary',
  },
  {
    id: 'diversified',
    title: 'Diversified Investor',
    description: 'Own 10 different assets',
    emoji: '🌈',
    category: 'portfolio',
    requirement: { type: 'special', target: 10 },
    reward: { type: 'points', amount: 500, description: '500 points' },
    unlocked: false,
    rarity: 'rare',
  },
  
  // Milestone Achievements
  {
    id: 'veteran',
    title: 'Market Veteran',
    description: 'Play for 30 days',
    emoji: '🏆',
    category: 'milestone',
    requirement: { type: 'special', target: 30 },
    reward: { type: 'badge', amount: 1, description: 'Veteran Trader Badge' },
    unlocked: false,
    rarity: 'epic',
  },
];

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const stored = await AsyncStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
      if (stored) {
        const parsedAchievements = JSON.parse(stored).map((achievement: any) => ({
          ...achievement,
          unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined,
        }));
        setAchievements(parsedAchievements);
        updateStats(parsedAchievements);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const saveAchievements = async (updatedAchievements: Achievement[]) => {
    try {
      await AsyncStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(updatedAchievements));
      setAchievements(updatedAchievements);
      updateStats(updatedAchievements);
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  };

  const updateStats = (achievementList: Achievement[]) => {
    const unlocked = achievementList.filter(a => a.unlocked);
    setUnlockedCount(unlocked.length);
    
    const points = unlocked.reduce((total, achievement) => {
      return total + (achievement.reward.type === 'points' ? achievement.reward.amount : 0);
    }, 0);
    setTotalPoints(points);
  };

  const checkAchievement = async (type: string, value: number, additionalData?: any) => {
    const updatedAchievements = achievements.map(achievement => {
      if (achievement.unlocked) return achievement;
      
      let shouldUnlock = false;
      
      switch (achievement.requirement.type) {
        case 'trade_count':
          if (type === 'trade' && value >= achievement.requirement.target) {
            shouldUnlock = true;
          }
          break;
        case 'profit_amount':
          if (type === 'profit' && value >= achievement.requirement.target) {
            shouldUnlock = true;
          }
          break;
        case 'lesson_complete':
          if (type === 'lesson' && value >= achievement.requirement.target) {
            shouldUnlock = true;
          }
          break;
        case 'portfolio_value':
          if (type === 'portfolio' && value >= achievement.requirement.target) {
            shouldUnlock = true;
          }
          break;
        case 'streak_days':
          if (type === 'streak' && value >= achievement.requirement.target) {
            shouldUnlock = true;
          }
          break;
        case 'special':
          if (type === achievement.id && value >= achievement.requirement.target) {
            shouldUnlock = true;
          }
          break;
      }
      
      if (shouldUnlock) {
        return {
          ...achievement,
          unlocked: true,
          unlockedAt: new Date(),
        };
      }
      
      return achievement;
    });
    
    await saveAchievements(updatedAchievements);
    
    // Return newly unlocked achievements for notification
    const newlyUnlocked = updatedAchievements.filter((achievement, index) => 
      achievement.unlocked && !achievements[index].unlocked
    );
    
    return newlyUnlocked;
  };

  const getAchievementsByCategory = (category: Achievement['category']) => {
    return achievements.filter(a => a.category === category);
  };

  const getUnlockedAchievements = () => {
    return achievements.filter(a => a.unlocked);
  };

  const getProgressPercentage = () => {
    return Math.round((unlockedCount / achievements.length) * 100);
  };

  return {
    achievements,
    unlockedCount,
    totalPoints,
    checkAchievement,
    getAchievementsByCategory,
    getUnlockedAchievements,
    getProgressPercentage,
  };
}