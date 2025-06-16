import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TradingPair {
  pair: string;
  price: number;
  change: number;
  volume: number;
  history: number[];
}

const tokenMapping: Record<string, string> = {
  BitRice: 'bitcoin',
  SoyETH: 'ethereum',
  CrypTofu: 'solana',
  BobaCoin: 'tether',
  StakeToken: 'binancecoin',
  MindCoin: 'matic-network',
};

const fictionalTokens = Object.keys(tokenMapping);

function getRandomVolume() {
  return Math.floor(Math.random() * 500) + 50;
}

function getRandomChange() {
  return parseFloat(((Math.random() - 0.5) * 4).toFixed(2)); // -2% to +2%
}

export function useTradingPairs() {
  const [pairs, setPairs] = useState<TradingPair[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    const STORAGE_KEY = 'market_pairs';

    async function fetchPrices() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        let baseData: TradingPair[] = [];

        if (saved) {
          baseData = JSON.parse(saved);
        } else {
          const ids = Object.values(tokenMapping).join(',');
          const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
          );
          const data = await response.json();
          baseData = fictionalTokens.map((token) => {
            const coinId = tokenMapping[token];
            const price = data[coinId]?.usd || 1;
            return {
              pair: `WLC/${token}`,
              price: parseFloat(price.toFixed(6)),
              change: 0,
              volume: getRandomVolume(),
              history: Array(4).fill(parseFloat(price.toFixed(6))),
            };
          });
        }

        const updatedPairs = baseData.map((pair) => {
          const change = getRandomChange();
          const newPrice = parseFloat((pair.price * (1 + change / 100)).toFixed(6));
          const volume = getRandomVolume();
          const history = [...pair.history.slice(1), newPrice];

          return {
            ...pair,
            price: newPrice,
            change,
            volume,
            history,
          };
        });

        setPairs(updatedPairs);
        setLoading(false);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPairs));
      } catch {
        const fallbackPairs = fictionalTokens.map((token) => ({
          pair: `WLC/${token}`,
          price: 1,
          change: 0,
          volume: getRandomVolume(),
          history: [1, 1, 1, 1],
        }));
        setPairs(fallbackPairs);
        setLoading(false);
      }
    }

    fetchPrices();

    intervalId = setInterval(() => {
      fetchPrices();
    }, 15000); // update every 15 seconds

    return () => clearInterval(intervalId);
  }, []);

  return { pairs, loading };
}