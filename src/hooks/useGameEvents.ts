import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameEvent } from '@/src/types/game';

const EVENTS_STORAGE_KEY = '@wallnance_game_events';

const SAMPLE_EVENTS: GameEvent[] = [
  {
    id: 'crypto_winter',
    title: '🥶 Crypto Winter',
    description: 'Market sentiment is bearish. All crypto prices drop by 20%, but trading fees are halved!',
    emoji: '❄️',
    type: 'market_crash',
    startTime: new Date(),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    isActive: true,
    effects: {
      coinMultipliers: {
        'CrypTofu': 0.8,
        'BitRice': 0.8,
        'SoyETH': 0.8,
      },
      tradingFeeDiscount: 0.5,
    },
  },
  {
    id: 'meme_mania',
    title: '🚀 Meme Coin Mania',
    description: 'Meme coins are going viral! 50% bonus on all meme coin trades!',
    emoji: '🎭',
    type: 'bull_run',
    startTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
    isActive: false,
    effects: {
      coinMultipliers: {
        'DogeBean': 1.5,
        'NyanCash': 1.5,
        'ToiletPaper': 1.5,
      },
      bonusRewards: 1.5,
    },
  },
  {
    id: 'learning_week',
    title: '📚 Learning Week',
    description: 'Double points for completing lessons and quizzes!',
    emoji: '🎓',
    type: 'special_offer',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: false,
    effects: {
      bonusRewards: 2.0,
    },
  },
];

export function useGameEvents() {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [activeEvents, setActiveEvents] = useState<GameEvent[]>([]);

  useEffect(() => {
    loadEvents();
    const interval = setInterval(updateEventStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const loadEvents = async () => {
    try {
      const stored = await AsyncStorage.getItem(EVENTS_STORAGE_KEY);
      if (stored) {
        const parsedEvents = JSON.parse(stored).map((event: any) => ({
          ...event,
          startTime: new Date(event.startTime),
          endTime: new Date(event.endTime),
        }));
        setEvents(parsedEvents);
        updateActiveEvents(parsedEvents);
      } else {
        setEvents(SAMPLE_EVENTS);
        updateActiveEvents(SAMPLE_EVENTS);
        await AsyncStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(SAMPLE_EVENTS));
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents(SAMPLE_EVENTS);
      updateActiveEvents(SAMPLE_EVENTS);
    }
  };

  const updateEventStatus = () => {
    const now = new Date();
    const updatedEvents = events.map(event => ({
      ...event,
      isActive: now >= event.startTime && now <= event.endTime,
    }));
    
    setEvents(updatedEvents);
    updateActiveEvents(updatedEvents);
    AsyncStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updatedEvents));
  };

  const updateActiveEvents = (eventList: GameEvent[]) => {
    const active = eventList.filter(event => event.isActive);
    setActiveEvents(active);
  };

  const getEventMultiplier = (coinName: string): number => {
    let multiplier = 1;
    activeEvents.forEach(event => {
      if (event.effects.coinMultipliers?.[coinName]) {
        multiplier *= event.effects.coinMultipliers[coinName];
      }
    });
    return multiplier;
  };

  const getTradingFeeDiscount = (): number => {
    let discount = 0;
    activeEvents.forEach(event => {
      if (event.effects.tradingFeeDiscount) {
        discount = Math.max(discount, event.effects.tradingFeeDiscount);
      }
    });
    return discount;
  };

  const getBonusRewardMultiplier = (): number => {
    let multiplier = 1;
    activeEvents.forEach(event => {
      if (event.effects.bonusRewards) {
        multiplier *= event.effects.bonusRewards;
      }
    });
    return multiplier;
  };

  return {
    events,
    activeEvents,
    getEventMultiplier,
    getTradingFeeDiscount,
    getBonusRewardMultiplier,
    updateEventStatus,
  };
}