// hooks/useMarketPrices.ts
import { Key, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMarketNews } from './useMarketNews';

type MarketItem = {
  total_volume?: number;
  current_price: number;
  category: string;
  id: Key | null | 100000;
  emoji: string;
  name: string;
  ticker: string;
  price: number;
  change: number;
  direction: 'up' | 'down' | 'same';
  high24h?: number;
  low24h?: number;
  volume24h?: number;
  priceChangePercentage24h?: number;
};

const getRandomChange = () => {
  const change = Math.random() * 10 - 5; // -5 to +5
  return parseFloat(change.toFixed(2));
};

const defaultPrices: MarketItem[] = [
  {
    id: '1',
    emoji: '🍣',
    name: 'CrypTofu',
    ticker: 'CTF',
    price: 0,
    change: 0,
    direction: 'same',
    category: 'Meme',
    total_volume: 100000,
    current_price: 0
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
    total_volume: 100000,
    current_price: 0
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
    total_volume: 0,
    current_price: 0
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
    total_volume: 100000,
    current_price: 0
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
    total_volume: 100000,
    current_price: 0
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
    total_volume: 100000,
    current_price: 0
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
    total_volume: 100000,
    current_price: 0
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
    total_volume: 100000,
    current_price: 0
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
    total_volume: 100000,
    current_price: 0
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
    total_volume: 100000,
    current_price: 0
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
    total_volume: 100000,
    current_price: 0
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
    total_volume: 100000,
    current_price: 0
  },
  {
    id: '13',
    emoji: '🥷',
    name: 'NinjaSwap',
    ticker: 'NJS',
    price: 880,
    change: 0,
    direction: 'same',
    category: 'DEX',
    total_volume: 100000,
    current_price: 0
  },
  {
    id: '14',
    emoji: '🛸',
    name: 'AlienFi',
    ticker: 'AFI',
    price: 421,
    change: 0,
    direction: 'same',
    category: 'Meme',
    total_volume: 100000,
    current_price: 0
  },
  {
    id: '15',
    emoji: '🎮',
    name: 'PlayVerse',
    ticker: 'PLV',
    price: 350,
    change: 0,
    direction: 'same',
    category: 'GameFi',
    total_volume: 0,
    current_price: 0
  }
];

export function useMarketPrices() {
  const [prices, setPrices] = useState<MarketItem[]>(defaultPrices);

  const { getActiveImpacts } = useMarketNews();

  useEffect(() => {
    const loadOrSimulate = async () => {
      let currentPrices = prices;

      try {
        const saved = await AsyncStorage.getItem('market_prices');
        if (saved) {
          const parsed = JSON.parse(saved);
          const merged = [...parsed];

          defaultPrices.forEach(defToken => {
            if (!parsed.find((p: MarketItem) => p.id === defToken.id)) {
              merged.push(defToken);
            }
          });

          setPrices(merged);
          currentPrices = merged;
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
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,dogecoin,tether,uniswap,solana,binancecoin,wrapped-bitcoin,chainlink,polkadot,shiba-inu,tron,avalanche-2'
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid API response format');
        }
        
        const priceMap: Record<string, any> = {};
        data.forEach((d: any) => {
          priceMap[d.id] = d;
        });

        const tokenMap: Record<string, string> = {
          CrypTofu: 'wrapped-bitcoin',
          SoyETH: 'ethereum',
          BitRice: 'bitcoin',
          DogeBean: 'shiba-inu',
          BobaCoin: 'tether',
          NyanCash: 'solana',
          UniYen: 'uniswap',
          StakeToken: 'chainlink',
          MindCoin: 'binancecoin',
          ToiletPaper: 'tron',
          BooBux: 'avalanche-2',
          PizzaFi: 'polkadot',
          NinjaSwap: 'uniswap',
          AlienFi: 'dogecoin',
          PlayVerse: 'ethereum',
        };

        setPrices((prev) => {
          const updated = prev.map((item) => {
            const realId = tokenMap[item.name];
            const realData = realId ? priceMap[realId] : null;

            if (!realData) return item;

            const change = parseFloat((realData.current_price - item.price).toFixed(2));
            let direction: 'up' | 'down' | 'same' = 'same';
            if (change > 0) direction = 'up';
            else if (change < 0) direction = 'down';

            return {
              ...item,
              price: parseFloat(realData.current_price.toFixed(2)),
              change,
              direction,
              high24h: realData.high_24h,
              low24h: realData.low_24h,
              total_volume: realData.total_volume,
              volume24h: realData.total_volume,
              priceChangePercentage24h: realData.price_change_percentage_24h,
            };
          });
          AsyncStorage.setItem('market_prices', JSON.stringify(updated));
          return updated;
        });
      } catch (error) {
        console.warn('Failed to fetch CoinGecko data, using simulated data instead:', error);
        // Continue with simulated data instead of throwing error
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

export function getMarketItemByName(prices: MarketItem[], name: string): MarketItem | 100000 {
  const found = prices.find(item => item.name === name);
  return found !== undefined ? found : 100000;
}