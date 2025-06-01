import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_VISIT_KEY = '@wallnance_last_visit';
const EVENTS_COUNT_KEY = '@wallnance_events_count';
const MINUTES_PER_EVENT = 5;
const MAX_EVENTS_PER_DAY = 10;
const MAX_EVENTS_PER_MONTH = 300;

interface TimeTrackingResult {
  missedMinutes: number;
  newEvents: number;
  totalEventsToday: number;
  totalEventsThisMonth: number;
}

export function useTimeTracking() {
  const [lastVisit, setLastVisit] = useState<Date | null>(null);
  const [eventsCount, setEventsCount] = useState({ daily: 0, monthly: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTimeData();
    return () => {
      // Save the current timestamp when component unmounts
      saveLastVisit();
    };
  }, []);

  const loadTimeData = async () => {
    try {
      const [lastVisitStr, eventsCountStr] = await Promise.all([
        AsyncStorage.getItem(LAST_VISIT_KEY),
        AsyncStorage.getItem(EVENTS_COUNT_KEY),
      ]);

      if (lastVisitStr) {
        setLastVisit(new Date(lastVisitStr));
      }

      if (eventsCountStr) {
        setEventsCount(JSON.parse(eventsCountStr));
      }

      // Calculate missed time and events
      if (lastVisitStr) {
        const result = await calculateMissedTime(new Date(lastVisitStr));
        // Update events count with new events
        await updateEventsCount(result.newEvents);
      }
    } catch (error) {
      console.error('Error loading time data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLastVisit = async () => {
    try {
      const now = new Date();
      await AsyncStorage.setItem(LAST_VISIT_KEY, now.toISOString());
      setLastVisit(now);
    } catch (error) {
      console.error('Error saving last visit:', error);
    }
  };

  const updateEventsCount = async (newEvents: number) => {
    try {
      const now = new Date();
      const isNewDay = lastVisit && now.getDate() !== lastVisit.getDate();
      const isNewMonth = lastVisit && now.getMonth() !== lastVisit.getMonth();

      let daily = isNewDay ? newEvents : eventsCount.daily + newEvents;
      let monthly = isNewMonth ? newEvents : eventsCount.monthly + newEvents;

      // Apply limits
      daily = Math.min(daily, MAX_EVENTS_PER_DAY);
      monthly = Math.min(monthly, MAX_EVENTS_PER_MONTH);

      const newEventsCount = { daily, monthly };
      await AsyncStorage.setItem(EVENTS_COUNT_KEY, JSON.stringify(newEventsCount));
      setEventsCount(newEventsCount);
    } catch (error) {
      console.error('Error updating events count:', error);
    }
  };

  const calculateMissedTime = async (lastVisitDate: Date): Promise<TimeTrackingResult> => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastVisitDate.getTime()) / (1000 * 60));
    
    // Calculate new events based on missed minutes
    const newEvents = Math.floor(diffMinutes / MINUTES_PER_EVENT);
    
    return {
      missedMinutes: diffMinutes,
      newEvents: Math.min(newEvents, MAX_EVENTS_PER_DAY),
      totalEventsToday: eventsCount.daily,
      totalEventsThisMonth: eventsCount.monthly,
    };
  };

  return {
    lastVisit,
    eventsCount,
    isLoading,
    calculateMissedTime,
  };
}