import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LearningQuest, DailyChallenge, QuizQuestion } from '@/src/types/game';

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
        content: 'Cryptocurrency is a digital or virtual currency secured by cryptography...',
        type: 'text',
        estimatedTime: 5,
        completed: false,
      },
      {
        id: 'blockchain_basics',
        title: 'Understanding Blockchain',
        content: 'Blockchain is a distributed ledger technology...',
        type: 'interactive',
        estimatedTime: 8,
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
    ],
    rewards: {
      points: 200,
      coins: 10000,
      achievement: 'crypto_student',
    },
    completed: false,
    progress: 0,
  },
  {
    id: 'trading_strategies',
    title: 'Advanced Trading Strategies',
    description: 'Master professional trading techniques and risk management',
    category: 'advanced',
    lessons: [
      {
        id: 'technical_analysis',
        title: 'Technical Analysis Fundamentals',
        content: 'Learn to read charts and identify patterns...',
        type: 'interactive',
        estimatedTime: 15,
        completed: false,
      },
      {
        id: 'risk_management',
        title: 'Risk Management Strategies',
        content: 'Protect your capital with proper risk management...',
        type: 'simulation',
        estimatedTime: 20,
        completed: false,
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What is the recommended risk per trade?',
        options: ['1-2%', '10%', '50%', 'All in'],
        correctAnswer: 0,
        explanation: 'Professional traders typically risk 1-2% of their capital per trade.',
        difficulty: 'medium',
      },
    ],
    rewards: {
      points: 500,
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
      reward: { points: 100, coins: 5000 },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      completed: false,
    },
    {
      id: 'profit_hunter',
      title: 'Profit Hunter',
      description: 'Make $10K profit today',
      emoji: '💰',
      type: 'profit_target' as const,
      target: 10000,
      progress: 0,
      reward: { points: 200, coins: 15000, multiplier: 1.5 },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      completed: false,
    },
    {
      id: 'knowledge_seeker',
      title: 'Knowledge Seeker',
      description: 'Complete 3 lessons today',
      emoji: '📚',
      type: 'lesson_complete' as const,
      target: 3,
      progress: 0,
      reward: { points: 150, coins: 8000 },
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
    const updatedQuests = quests.map(quest => {
      if (quest.id === questId) {
        const updatedLessons = quest.lessons.map(lesson => 
          lesson.id === lessonId ? { ...lesson, completed: true } : lesson
        );
        const completedLessons = updatedLessons.filter(l => l.completed).length;
        const progress = Math.round((completedLessons / updatedLessons.length) * 100);
        
        return {
          ...quest,
          lessons: updatedLessons,
          progress,
          completed: progress === 100,
        };
      }
      return quest;
    });
    
    setQuests(updatedQuests);
    setTotalLessonsCompleted(prev => prev + 1);
    
    // Update daily challenges
    updateChallengeProgress('lesson_complete', 1);
    
    // Save data
    await AsyncStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify({
      quests: updatedQuests,
      streakDays,
      totalLessonsCompleted: totalLessonsCompleted + 1,
    }));
    
    return updatedQuests.find(q => q.id === questId);
  };

  const completeQuiz = async (questId: string, score: number) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return null;
    
    const passed = score >= 70; // 70% passing grade
    
    if (passed) {
      const updatedQuests = quests.map(q => 
        q.id === questId ? { ...q, completed: true, progress: 100 } : q
      );
      setQuests(updatedQuests);
      
      // Update daily challenges
      updateChallengeProgress('quiz_score', score);
      
      await AsyncStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify({
        quests: updatedQuests,
        streakDays,
        totalLessonsCompleted,
      }));
      
      return quest.rewards;
    }
    
    return null;
  };

  const updateChallengeProgress = async (type: DailyChallenge['type'], amount: number) => {
    const updatedChallenges = dailyChallenges.map(challenge => {
      if (challenge.type === type && !challenge.completed) {
        const newProgress = Math.min(challenge.progress + amount, challenge.target);
        return {
          ...challenge,
          progress: newProgress,
          completed: newProgress >= challenge.target,
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
  };
}