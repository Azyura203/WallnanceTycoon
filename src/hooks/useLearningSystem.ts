import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LearningQuest, DailyChallenge, QuizQuestion } from '@/src/types/game';
import { useRewardsSystem } from './useRewardsSystem';

const LEARNING_STORAGE_KEY = '@wallnance_learning';
const CHALLENGES_STORAGE_KEY = '@wallnance_daily_challenges';

const SAMPLE_QUESTS: LearningQuest[] = [
  {
    id: 'crypto_basics',
    title: 'Cryptocurrency Fundamentals',
    description: 'Learn the basics of cryptocurrency and blockchain technology',
    category: 'beginner',
    lessons: [
      {
        id: 'what_is_crypto',
        title: 'What is Cryptocurrency?',
        content: 'Cryptocurrency is a digital or virtual currency secured by cryptography. Unlike traditional currencies, cryptocurrencies operate on decentralized networks based on blockchain technology. This means no single authority controls them, making them resistant to government interference or manipulation.',
        type: 'text',
        estimatedTime: 5,
        completed: false,
      },
      {
        id: 'blockchain_basics',
        title: 'Understanding Blockchain',
        content: 'Blockchain is a distributed ledger technology that maintains a continuously growing list of records, called blocks, which are linked and secured using cryptography. Each block contains a cryptographic hash of the previous block, a timestamp, and transaction data.',
        type: 'interactive',
        estimatedTime: 8,
        completed: false,
      },
      {
        id: 'crypto_wallets',
        title: 'Cryptocurrency Wallets',
        content: 'A cryptocurrency wallet is a digital tool that allows you to store, send, and receive cryptocurrencies. Wallets can be software-based (hot wallets) or hardware-based (cold wallets). Understanding wallet security is crucial for protecting your digital assets.',
        type: 'text',
        estimatedTime: 6,
        completed: false,
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What makes cryptocurrency secure?',
        options: ['Cryptography', 'Banks', 'Government', 'Magic'],
        correctAnswer: 0,
        explanation: 'Cryptography provides the security foundation for cryptocurrencies.',
        difficulty: 'easy',
      },
      {
        id: 'q2',
        question: 'What is a blockchain?',
        options: ['A type of wallet', 'A distributed ledger', 'A cryptocurrency', 'A trading platform'],
        correctAnswer: 1,
        explanation: 'Blockchain is a distributed ledger technology that records transactions across multiple computers.',
        difficulty: 'easy',
      },
    ],
    rewards: {
      points: 300,
      coins: 15000,
      achievement: 'crypto_student',
    },
    completed: false,
    progress: 0,
  },
  {
    id: 'trading_basics',
    title: 'Trading Fundamentals',
    description: 'Master the basics of cryptocurrency trading',
    category: 'intermediate',
    lessons: [
      {
        id: 'market_analysis',
        title: 'Market Analysis Basics',
        content: 'Market analysis involves studying price movements, trading volumes, and market trends to make informed trading decisions. There are two main types: technical analysis (studying charts and patterns) and fundamental analysis (evaluating the underlying value).',
        type: 'interactive',
        estimatedTime: 12,
        completed: false,
      },
      {
        id: 'order_types',
        title: 'Understanding Order Types',
        content: 'Different order types serve different trading strategies. Market orders execute immediately at current prices, while limit orders execute only at specified prices. Stop-loss orders help manage risk by automatically selling when prices fall below a certain level.',
        type: 'text',
        estimatedTime: 8,
        completed: false,
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What is the main purpose of a stop-loss order?',
        options: ['To buy at a lower price', 'To limit potential losses', 'To maximize profits', 'To trade automatically'],
        correctAnswer: 1,
        explanation: 'Stop-loss orders are designed to limit potential losses by automatically selling when the price drops to a specified level.',
        difficulty: 'medium',
      },
    ],
    rewards: {
      points: 500,
      coins: 25000,
      achievement: 'trading_student',
    },
    completed: false,
    progress: 0,
  },
  {
    id: 'advanced_strategies',
    title: 'Advanced Trading Strategies',
    description: 'Learn professional trading techniques and risk management',
    category: 'advanced',
    lessons: [
      {
        id: 'technical_analysis',
        title: 'Technical Analysis Deep Dive',
        content: 'Advanced technical analysis involves understanding complex chart patterns, indicators like RSI, MACD, and Bollinger Bands. Learn to identify support and resistance levels, trend lines, and reversal patterns to make better trading decisions.',
        type: 'simulation',
        estimatedTime: 20,
        completed: false,
      },
      {
        id: 'risk_management',
        title: 'Professional Risk Management',
        content: 'Professional traders never risk more than 1-2% of their capital per trade. Learn about position sizing, portfolio diversification, and how to calculate risk-reward ratios. Understand the psychology of trading and how emotions can impact decisions.',
        type: 'interactive',
        estimatedTime: 15,
        completed: false,
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What percentage of capital should professional traders risk per trade?',
        options: ['1-2%', '5-10%', '20-30%', '50%+'],
        correctAnswer: 0,
        explanation: 'Professional traders typically risk only 1-2% of their capital per trade to preserve their trading account.',
        difficulty: 'hard',
      },
    ],
    rewards: {
      points: 800,
      coins: 50000,
      achievement: 'trading_master',
    },
    completed: false,
    progress: 0,
  },
];

const generateDailyChallenges = (): DailyChallenge[] => {
  const challenges = [
    {
      id: 'daily_trader',
      title: 'Daily Trader',
      description: 'Complete 5 trades today',
      emoji: '📊',
      type: 'trade_volume' as const,
      target: 5,
      progress: 0,
      reward: { points: 150, coins: 8000 },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      completed: false,
    },
    {
      id: 'profit_hunter',
      title: 'Profit Hunter',
      description: 'Make $15K profit today',
      emoji: '💰',
      type: 'profit_target' as const,
      target: 15000,
      progress: 0,
      reward: { points: 300, coins: 20000, multiplier: 1.5 },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      completed: false,
    },
    {
      id: 'knowledge_seeker',
      title: 'Knowledge Seeker',
      description: 'Complete 2 lessons today',
      emoji: '📚',
      type: 'lesson_complete' as const,
      target: 2,
      progress: 0,
      reward: { points: 200, coins: 12000 },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      completed: false,
    },
    {
      id: 'quiz_master',
      title: 'Quiz Master',
      description: 'Score 90%+ on any quiz',
      emoji: '🧠',
      type: 'quiz_score' as const,
      target: 90,
      progress: 0,
      reward: { points: 250, coins: 15000 },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      completed: false,
    },
  ];
  
  // Randomly select 2-3 challenges for the day
  const shuffled = challenges.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 2) + 2);
};

export function useLearningSystem() {
  const [quests, setQuests] = useState<LearningQuest[]>(SAMPLE_QUESTS);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [streakDays, setStreakDays] = useState(0);
  const [totalLessonsCompleted, setTotalLessonsCompleted] = useState(0);
  const [lastLessonDate, setLastLessonDate] = useState<string | null>(null);

  const { addReward, getRewardMultiplier } = useRewardsSystem();

  useEffect(() => {
    loadLearningData();
    loadDailyChallenges();
  }, []);

  const loadLearningData = async () => {
    try {
      const stored = await AsyncStorage.getItem(LEARNING_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setQuests(data.quests || SAMPLE_QUESTS);
        setStreakDays(data.streakDays || 0);
        setTotalLessonsCompleted(data.totalLessonsCompleted || 0);
        setLastLessonDate(data.lastLessonDate || null);
      }
    } catch (error) {
      console.error('Error loading learning data:', error);
    }
  };

  const loadDailyChallenges = async () => {
    try {
      const stored = await AsyncStorage.getItem(CHALLENGES_STORAGE_KEY);
      const today = new Date().toDateString();
      
      if (stored) {
        const data = JSON.parse(stored);
        if (data.date === today) {
          setDailyChallenges(data.challenges.map((c: any) => ({
            ...c,
            expiresAt: new Date(c.expiresAt),
          })));
          return;
        }
      }
      
      // Generate new challenges for today
      const newChallenges = generateDailyChallenges();
      setDailyChallenges(newChallenges);
      await AsyncStorage.setItem(CHALLENGES_STORAGE_KEY, JSON.stringify({
        date: today,
        challenges: newChallenges,
      }));
    } catch (error) {
      console.error('Error loading daily challenges:', error);
    }
  };

  const completeLesson = async (questId: string, lessonId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return null;

    const lesson = quest.lessons.find(l => l.id === lessonId);
    if (!lesson || lesson.completed) return null;

    // Calculate base points based on lesson difficulty and time
    const basePoints = Math.floor(lesson.estimatedTime * 10); // 10 points per minute
    const difficultyMultiplier = quest.category === 'beginner' ? 1 : quest.category === 'intermediate' ? 1.5 : 2;
    const rewardMultiplier = getRewardMultiplier();
    
    const finalPoints = Math.floor(basePoints * difficultyMultiplier * rewardMultiplier);

    // Add reward transaction
    await addReward(
      'lesson_complete',
      finalPoints,
      `Completed "${lesson.title}"`,
      `Quest: ${quest.title}`,
      rewardMultiplier
    );

    // Update streak
    const today = new Date().toDateString();
    let newStreakDays = streakDays;
    
    if (lastLessonDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastLessonDate === yesterday.toDateString()) {
        newStreakDays = streakDays + 1;
      } else {
        newStreakDays = 1;
      }
      setLastLessonDate(today);
      setStreakDays(newStreakDays);
    }

    const updatedQuests = quests.map(q => {
      if (q.id === questId) {
        const updatedLessons = q.lessons.map(l => 
          l.id === lessonId ? { ...l, completed: true } : l
        );
        const completedLessons = updatedLessons.filter(l => l.completed).length;
        const progress = Math.round((completedLessons / updatedLessons.length) * 100);
        
        return {
          ...q,
          lessons: updatedLessons,
          progress,
          completed: progress === 100,
        };
      }
      return q;
    });
    
    setQuests(updatedQuests);
    setTotalLessonsCompleted(prev => prev + 1);
    
    // Update daily challenges
    await updateChallengeProgress('lesson_complete', 1);
    
    // Save data
    await AsyncStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify({
      quests: updatedQuests,
      streakDays: newStreakDays,
      totalLessonsCompleted: totalLessonsCompleted + 1,
      lastLessonDate: today,
    }));
    
    return {
      quest: updatedQuests.find(q => q.id === questId),
      pointsEarned: finalPoints,
      streakBonus: rewardMultiplier > 1,
    };
  };

  const completeQuiz = async (questId: string, score: number) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return null;
    
    const passed = score >= 70; // 70% passing grade
    
    if (passed) {
      // Calculate quiz reward points
      const basePoints = quest.rewards.points;
      const scoreBonus = score >= 90 ? 1.5 : score >= 80 ? 1.2 : 1;
      const rewardMultiplier = getRewardMultiplier();
      const finalPoints = Math.floor(basePoints * scoreBonus * rewardMultiplier);

      // Add reward transaction
      await addReward(
        'quiz_pass',
        finalPoints,
        `Passed "${quest.title}" quiz with ${score}%`,
        `Quest: ${quest.title}`,
        rewardMultiplier
      );

      const updatedQuests = quests.map(q => 
        q.id === questId ? { ...q, completed: true, progress: 100 } : q
      );
      setQuests(updatedQuests);
      
      // Update daily challenges
      await updateChallengeProgress('quiz_score', score);
      
      await AsyncStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify({
        quests: updatedQuests,
        streakDays,
        totalLessonsCompleted,
        lastLessonDate,
      }));
      
      return {
        rewards: quest.rewards,
        pointsEarned: finalPoints,
        scoreBonus: scoreBonus > 1,
      };
    }
    
    return null;
  };

  const updateChallengeProgress = async (type: DailyChallenge['type'], amount: number) => {
    const updatedChallenges = dailyChallenges.map(challenge => {
      if (challenge.type === type && !challenge.completed) {
        const newProgress = Math.min(challenge.progress + amount, challenge.target);
        const wasCompleted = challenge.completed;
        const isNowCompleted = newProgress >= challenge.target;
        
        // Award points if challenge just completed
        if (!wasCompleted && isNowCompleted) {
          addReward(
            'challenge_complete',
            challenge.reward.points,
            `Completed daily challenge: ${challenge.title}`,
            'Daily Challenges',
            challenge.reward.multiplier || 1
          );
        }
        
        return {
          ...challenge,
          progress: newProgress,
          completed: isNowCompleted,
        };
      }
      return challenge;
    });
    
    setDailyChallenges(updatedChallenges);
    
    const today = new Date().toDateString();
    await AsyncStorage.setItem(CHALLENGES_STORAGE_KEY, JSON.stringify({
      date: today,
      challenges: updatedChallenges,
    }));
  };

  const getQuestsByCategory = (category: LearningQuest['category']) => {
    return quests.filter(q => q.category === category);
  };

  const getCompletedQuests = () => {
    return quests.filter(q => q.completed);
  };

  const getAvailableQuests = () => {
    return quests.filter(q => !q.completed);
  };

  const getCompletedChallenges = () => {
    return dailyChallenges.filter(c => c.completed);
  };

  const getTotalPointsEarned = () => {
    return getCompletedQuests().reduce((total, quest) => total + quest.rewards.points, 0) +
           getCompletedChallenges().reduce((total, challenge) => total + challenge.reward.points, 0);
  };

  return {
    quests,
    dailyChallenges,
    streakDays,
    totalLessonsCompleted,
    completeLesson,
    completeQuiz,
    updateChallengeProgress,
    getQuestsByCategory,
    getCompletedQuests,
    getAvailableQuests,
    getCompletedChallenges,
    getTotalPointsEarned,
  };
}