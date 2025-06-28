export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: 'trading' | 'learning' | 'portfolio' | 'social' | 'milestone';
  requirement: {
    type: 'trade_count' | 'profit_amount' | 'lesson_complete' | 'portfolio_value' | 'streak_days' | 'special';
    target: number;
    current?: number;
  };
  reward: {
    type: 'coins' | 'points' | 'badge' | 'unlock';
    amount: number;
    description: string;
  };
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  emoji: string;
  type: 'market_crash' | 'bull_run' | 'news_event' | 'special_offer' | 'challenge';
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  effects: {
    coinMultipliers?: Record<string, number>;
    tradingFeeDiscount?: number;
    bonusRewards?: number;
    specialUnlocks?: string[];
  };
  requirements?: {
    minLevel?: number;
    minPortfolioValue?: number;
    completedAchievements?: string[];
  };
}

export interface PlayerProfile {
  id: string;
  username: string;
  level: number;
  experience: number;
  experienceToNext: number;
  totalPoints: number;
  joinDate: Date;
  lastActive: Date;
  
  // Trading Stats
  totalTrades: number;
  profitableTrades: number;
  totalProfit: number;
  biggestWin: number;
  biggestLoss: number;
  favoriteAsset: string;
  
  // Learning Stats
  lessonsCompleted: number;
  quizzesCompleted: number;
  streakDays: number;
  maxStreak: number;
  
  // Achievements
  achievements: Achievement[];
  badges: string[];
  
  // Preferences
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
}

export interface LearningQuest {
  id: string;
  title: string;
  description: string;
  category: 'beginner' | 'intermediate' | 'advanced';
  lessons: LearningLesson[];
  quiz: QuizQuestion[];
  rewards: {
    points: number;
    coins: number;
    achievement?: string;
  };
  completed: boolean;
  progress: number;
}

export interface LearningLesson {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'interactive' | 'simulation';
  estimatedTime: number; // minutes
  completed: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  type: 'trade_volume' | 'profit_target' | 'lesson_complete' | 'quiz_score';
  target: number;
  progress: number;
  reward: {
    points: number;
    coins: number;
    multiplier?: number;
  };
  expiresAt: Date;
  completed: boolean;
}

export interface RewardSystem {
  dailyBonus: {
    day: number;
    claimed: boolean;
    reward: number;
  };
  weeklyBonus: {
    week: number;
    claimed: boolean;
    reward: number;
  };
  referralRewards: {
    code: string;
    referrals: number;
    totalRewards: number;
  };
}