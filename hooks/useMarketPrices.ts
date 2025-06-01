// hooks/useMarketPrices.ts
import { Key, useEffect, useState } from 'react';

type MarketItem = {
  id: Key | null | undefined;
  emoji: string;
  name: string;
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
      price: 1200,
      change: 0,
      direction: 'same',
    },
    {
      id: '2',
      emoji: '🌱',
      name: 'SoyETH',
      price: 850,
      change: 0,
      direction: 'same',
    },
    {
      id: '3',
      emoji: '🍚',
      name: 'BitRice',
      price: 500,
      change: 0,
      direction: 'same',
    },
    {
      id: '4',
      emoji: '🐶',
      name: 'DogeBean',
      price: 300,
      change: 0,
      direction: 'same',
    },
    {
      id: '5',
      emoji: '🧋',
      name: 'BobaCoin',
      price: 1300,
      change: 0,
      direction: 'same',
    },
    {
      id: '6',
      emoji: '😺',
      name: 'NyanCash',
      price: 5400,
      change: 0,
      direction: 'same',
    },
    {
      id: '7',
      emoji: '🦄',
      name: 'UniYen',
      price: 2000,
      change: 0,
      direction: 'same',
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices((prev) =>
        prev.map((item) => {
          const fluctuation = getRandomChange();
          const newPrice = Math.max(1, item.price + fluctuation); // avoid negative prices
          const change = parseFloat(fluctuation.toFixed(2));
          let direction: 'up' | 'down' | 'same' = 'same';
          if (change > 0) direction = 'up';
          else if (change < 0) direction = 'down';
          return {
            ...item,
            price: parseFloat(newPrice.toFixed(2)),
            change,
            direction,
          };
        })
      );
    }, 3000); // update every 3 sec

    return () => clearInterval(interval);
  }, []);

  return prices;
}