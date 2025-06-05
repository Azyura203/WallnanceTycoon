import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTimeTracking } from './useTimeTracking';

export interface NewsItem {
  id: string;
  timestamp: Date;
  coin: string;
  headline: string;
  emoji: string;
  impact: number;
  type: 'positive' | 'negative' | 'neutral';
  applied?: boolean;
}

const NEWS_STORAGE_KEY = '@wallnance_market_news';
const MAX_NEWS_ITEMS = 5;

const HEADLINE_TEMPLATES = {
  positive: [
    { template: "{coin} hits new ATH after {reason}!", impact: 15 },
    { template: "Elon Musk tweets about {coin}!", impact: 25 },
    { template: "{coin} partners with major tech company!", impact: 20 },
    { template: "Celebrities rush to buy {coin}!", impact: 18 },
    { template: "{coin} trending on social media!", impact: 12 }
  ],
  negative: [
    { template: "{coin} dumps after whale sells!", impact: -15 },
    { template: "FUD spreads about {coin}'s security!", impact: -20 },
    { template: "{coin} faces regulatory scrutiny!", impact: -25 },
    { template: "Major {coin} investor exits position!", impact: -18 },
    { template: "Bug discovered in {coin} smart contract!", impact: -22 }
  ],
  neutral: [
    { template: "{coin} announces platform update", impact: 5 },
    { template: "New {coin} marketing campaign launches", impact: 3 },
    { template: "{coin} community grows steadily", impact: 4 },
    { template: "Analysts review {coin} performance", impact: -3 },
    { template: "{coin} team expands development", impact: 2 }
  ]
};

const REASONS = [
  "viral TikTok trend",
  "celebrity endorsement",
  "mysterious tweet",
  "Reddit hype",
  "meme competition"
];

const COINS = [
  { name: "Kitcoin", emoji: "🐱" },
  { name: "CrypTofu", emoji: "🧄" },
  { name: "BorkChain", emoji: "🐶" },
  { name: "StonxX", emoji: "🪙" }
];

export function useMarketNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const { eventsCount, lastVisit } = useTimeTracking();

  useEffect(() => {
    loadNews();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      generateNews(1); // Generate one news item every interval
    }, 10000); // every 10 seconds, you can adjust this interval

    return () => clearInterval(interval);
  }, []);

  const loadNews = async () => {
    try {
      const storedNews = await AsyncStorage.getItem(NEWS_STORAGE_KEY);
      if (storedNews) {
        const parsedNews = JSON.parse(storedNews).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setNews(parsedNews);
      }
    } catch (error) {
      console.error('Error loading news:', error);
    }
  };

  const saveNews = async (newsItems: NewsItem[]) => {
    try {
      await AsyncStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(newsItems));
    } catch (error) {
      console.error('Error saving news:', error);
    }
  };

  const generateNews = async (count: number) => {
    console.log("Generating market news:", count);
    const newItems: NewsItem[] = [];

    for (let i = 0; i < count; i++) {
      const type = Math.random() > 0.6 ? 'positive' : Math.random() > 0.3 ? 'negative' : 'neutral';
      const coin = COINS[Math.floor(Math.random() * COINS.length)];
      const template = HEADLINE_TEMPLATES[type][Math.floor(Math.random() * HEADLINE_TEMPLATES[type].length)];
      const reason = REASONS[Math.floor(Math.random() * REASONS.length)];

      const headline = template.template
        .replace('{coin}', coin.name)
        .replace('{reason}', reason);

      newItems.push({
        id: Date.now() + i.toString(),
        timestamp: new Date(),
        coin: coin.name,
        headline,
        emoji: coin.emoji,
        impact: template.impact,
        type,
        applied: false
      });
    }

    const updatedNews = [...newItems, ...news].slice(0, MAX_NEWS_ITEMS);
    setNews(updatedNews);
    await saveNews(updatedNews);
  };

  const getActiveImpacts = () => {
    const impacts: Record<string, number> = {};

    const updatedNews = news.map(item => {
      if (!item.applied) {
        if (!impacts[item.coin]) {
          impacts[item.coin] = 0;
        }
        impacts[item.coin] += item.impact / 100;
        return { ...item, applied: true };
      }
      return item;
    });

    setNews(updatedNews);
    saveNews(updatedNews);

    return impacts;
  };

  return {
    news,
    generateNews,
    getActiveImpacts
  };
}