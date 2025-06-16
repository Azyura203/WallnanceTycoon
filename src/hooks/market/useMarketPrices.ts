// hooks/useMarketPrices.ts
import { Key, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMarketNews } from './useMarketNews';

type MarketItem = {
  category: string;
  id: Key | null | undefined;
  emoji: string;
  name: string;
  ticker: string;
  price: number;
  change: number;
  direction: 'up' | 'down' | 'same';
};

const getRandomChange = () => {
  const change = Math.random() * 10 - 5; // -5 to +5
  return parseFloat(change.toFixed(2));
};

export function useMarketPrices() {
  const [prices, setPrices] = useState<MarketItem[]>([
    {
      id: '1',
      emoji: '🍣',
      name: 'CrypTofu',
      ticker: 'CTF',
      price: 1200,
      change: 0,
      direction: 'same',
      category: 'Meme',
    },
    {
      id: '2',
      emoji: '🌱',
      name: 'SoyETH',
      ticker: 'SETH',
      price: 10000,
      change: 0,
      direction: 'same',
      category: 'Layer1',
    },
    {
      id: '3',
      emoji: '🍚',
      name: 'BitRice',
      ticker: 'BRC',
      price: 20000,
      change: 0,
      direction: 'same',
      category: 'Meta',
    },
    {
      id: '4',
      emoji: '🐶',
      name: 'DogeBean',
      ticker: 'DBN',
      price: 300,
      change: 0,
      direction: 'same',
      category: 'Meme',
    },
    {
      id: '5',
      emoji: '🧋',
      name: 'BobaCoin',
      ticker: 'BBC',
      price: 1300,
      change: 0,
      direction: 'same',
      category: 'Stable',
    },
    {
      id: '6',
      emoji: '😺',
      name: 'NyanCash',
      ticker: 'NYC',
      price: 5400,
      change: 0,
      direction: 'same',
      category: 'Meme',
    },
    {
      id: '7',
      emoji: '🦄',
      name: 'UniYen',
      ticker: 'UYN',
      price: 2000,
      change: 0,
      direction: 'same',
      category: 'Utility',
    },
    {
      id: '8',
      emoji: '🥩',
      name: 'StakeToken',
      ticker: 'STK',
      price: 420,
      change: 0,
      direction: 'same',
      category: 'Utility',
    },
    {
      id: '9',
      emoji: '🧠',
      name: 'MindCoin',
      ticker: 'MND',
      price: 1111,
      change: 0,
      direction: 'same',
      category: 'Meta',
    },
    {
      id: '10',
      emoji: '🧻',
      name: 'ToiletPaper',
      ticker: 'TPT',
      price: 69,
      change: 0,
      direction: 'same',
      category: 'Meme',
    },
    {
      id: '11',
      emoji: '👻',
      name: 'BooBux',
      ticker: 'BOO',
      price: 777,
      change: 0,
      direction: 'same',
      category: 'Meta',
    },
    {
      id: '12',
      emoji: '🍕',
      name: 'PizzaFi',
      ticker: 'PZF',
      price: 999,
      change: 0,
      direction: 'same',
      category: 'Utility',
    }
  ]);

  const { getActiveImpacts } = useMarketNews();

  useEffect(() => {
    const loadOrSimulate = async () => {
      let currentPrices = prices;

      try {
        const saved = await AsyncStorage.getItem('market_prices');
        if (saved) {
          const parsed = JSON.parse(saved);
          setPrices(parsed);
          currentPrices = parsed;
        }
      } catch {
        // fallback to existing prices state
      }

      const interval = setInterval(() => {
        setPrices((prev) => {
          const activeImpacts = getActiveImpacts();
          const updated = prev.map((item) => {
            const basePrice = item.price;
            const newsImpact = activeImpacts[item.name] || 0;
            const fluctuation = getRandomChange();
            const impactedPrice = Math.max(1, basePrice * (1 + newsImpact));
            const newPrice = Math.max(1, impactedPrice + fluctuation);
            const change = parseFloat((newPrice - basePrice).toFixed(2));
            let direction: 'up' | 'down' | 'same' = 'same';
            if (change > 0) direction = 'up';
            else if (change < 0) direction = 'down';
            return {
              ...item,
              price: parseFloat(newPrice.toFixed(2)),
              change,
              direction,
            };
          });

          AsyncStorage.setItem('market_prices', JSON.stringify(updated));
          return updated;
        });
      }, 3000);

      return () => clearInterval(interval);
    };

    loadOrSimulate();
  }, []);

  // --- CoinGecko API Integration for Real Prices ---
  useEffect(() => {
    const fetchCoinGeckoData = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,dogecoin'
        );
        const data = await response.json();
        const priceMap: Record<string, number> = {
          bitcoin: data.find((d: any) => d.id === 'bitcoin')?.current_price || 0,
          ethereum: data.find((d: any) => d.id === 'ethereum')?.current_price || 0,
          dogecoin: data.find((d: any) => d.id === 'dogecoin')?.current_price || 0,
        };

        setPrices((prev) => {
          const updated = prev.map((item) => {
            let realPrice = item.price;
            if (item.name === 'CrypTofu') realPrice = priceMap.dogecoin;
            if (item.name === 'SoyETH') realPrice = priceMap.ethereum;
            if (item.name === 'BitRice') realPrice = priceMap.bitcoin;

            if (['CrypTofu', 'SoyETH', 'BitRice'].includes(item.name)) {
              const change = parseFloat((realPrice - item.price).toFixed(2));
              let direction: 'up' | 'down' | 'same' = 'same';
              if (change > 0) direction = 'up';
              else if (change < 0) direction = 'down';

              return {
                ...item,
                price: parseFloat(realPrice.toFixed(2)),
                change,
                direction,
              };
            }
            return item;
          });
          AsyncStorage.setItem('market_prices', JSON.stringify(updated));
          return updated;
        });
      } catch (error) {
        console.error('Failed to fetch CoinGecko data', error);
      }
    };

    const apiInterval = setInterval(() => {
      fetchCoinGeckoData();
    }, 60000); // update every 1 minute

    fetchCoinGeckoData(); // initial fetch

    return () => clearInterval(apiInterval);
  }, []);

  return prices;
}

export function getMarketItemByName(prices: MarketItem[], name: string): MarketItem | undefined {
  return prices.find(item => item.name === name);
}