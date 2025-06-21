import { Key, useEffect, useState } from 'react';

interface Share {
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

const fictionalShares: Share[] = [
  {
    id: '1', name: 'Pokie', emoji: '🎮', price: 120, change: 0,
    ticker: 'PK',
    priceChangePercentage24h: 0,
    total_volume: 0,
    low24h: undefined,
    high24h: undefined,
    current_price: 0,
    category: '',
    direction: 'up'
  },
  {
    id: '2', name: 'Nykee', emoji: '👟', price: 85, change: 0,
    ticker: 'NKEE',
    priceChangePercentage24h: 0,
    total_volume: undefined,
    low24h: undefined,
    high24h: undefined,
    current_price: 0,
    category: '',
    direction: 'up'
  },
  {
    id: '3', name: 'iPomme', emoji: '🍏', price: 230, change: 0,
    ticker: 'IPO',
    priceChangePercentage24h: 0,
    total_volume: undefined,
    low24h: undefined,
    high24h: undefined,
    current_price: 0,
    category: '',
    direction: 'up'
  },
  {
    id: '4', name: 'FaceLook', emoji: '📘', price: 150, change: 0,
    ticker: 'LETA',
    priceChangePercentage24h: 0,
    total_volume: undefined,
    low24h: undefined,
    high24h: undefined,
    current_price: 0,
    category: '',
    direction: 'up'
  },
  {
    id: '5', name: 'Amazoom', emoji: '📦', price: 310, change: 0,
    ticker: 'AMAZ',
    priceChangePercentage24h: 0,
    total_volume: undefined,
    low24h: undefined,
    high24h: undefined,
    current_price: 0,
    category: '',
    direction: 'up'
  },

  // 🔥 New entries
  {
    id: '6', name: 'Snapture', emoji: '📸', price: 97, change: 0,
    ticker: 'SNP',
    priceChangePercentage24h: 0,
    total_volume: undefined,
    low24h: undefined,
    high24h: undefined,
    current_price: 0,
    category: '',
    direction: 'up'
  },
  {
    id: '7', name: 'Netflux', emoji: '📺', price: 180, change: 0,
    ticker: 'NFX',
    priceChangePercentage24h: 0,
    total_volume: undefined,
    low24h: undefined,
    high24h: undefined,
    current_price: 0,
    category: '',
    direction: 'up'
  },
  {
    id: '8', name: 'Googol', emoji: '🔍', price: 450, change: 0,
    ticker: 'GGL',
    priceChangePercentage24h: 0,
    total_volume: undefined,
    low24h: undefined,
    high24h: undefined,
    current_price: 0,
    category: '',
    direction: 'up'
  },
  {
    id: '9', name: 'MuskX', emoji: '🚀', price: 600, change: 0,
    ticker: 'MX',
    priceChangePercentage24h: 0,
    total_volume: undefined,
    low24h: undefined,
    high24h: undefined,
    current_price: 0,
    category: '',
    direction: 'up'
  },
  {
    id: '10', name: 'Borebucks', emoji: '☕️', price: 65, change: 0,
    ticker: 'BBK',
    priceChangePercentage24h: 0,
    total_volume: undefined,
    low24h: undefined,
    high24h: undefined,
    current_price: 0,
    category: '',
    direction: 'up'
  },
];

export function useCompanyShares(): Share[] {
  const [shares, setShares] = useState<Share[]>([]);

  useEffect(() => {
    // Simulate slight market fluctuation every 10 seconds
    const interval = setInterval(() => {
      const updatedShares = fictionalShares.map(share => {
        const fluctuation = (Math.random() - 0.5) * 5; // +/- up to 2.5%
        const newPrice = +(share.price + fluctuation).toFixed(2);
        const newChange = +((fluctuation / share.price) * 100).toFixed(2);
        return {
          ...share,
          price: newPrice,
          change: newChange,
        };
      });
      setShares(updatedShares);
    }, 10000);

    // Initial load
    setShares(fictionalShares);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const realSymbolMap: Record<string, string> = {
      Pokie: 'MSFT',
      Nykee: 'NKE',
      iPomme: 'AAPL',
      FaceLook: 'META',
      Amazoom: 'AMZN',
      Snapture: 'SNAP',
      Netflux: 'NFLX',
      Googol: 'GOOGL',
      MuskX: 'TSLA',
      Borebucks: 'SBUX',
    };

    const fetchRealData = async () => {
      try {
        const symbols = Object.values(realSymbolMap).join(',');
        const res = await fetch(
          `https://financialmodelingprep.com/api/v3/quote/${symbols}?apikey=API_KEY565X10UZ8IFEROWT0YJZ5Q7NHE652NIM`
        );
        const data = await res.json();

        const symbolData: Record<string, any> = {};
        for (const item of data) {
          symbolData[item.symbol] = item;
        }

        const updated = fictionalShares.map(share => {
          const realSymbol = realSymbolMap[share.name];
          const real = symbolData[realSymbol];

          if (!real) return share;

          const newPrice = +(real.price ?? share.price);
          const newChange = +(real.changesPercentage ?? 0).toFixed(2);
          const newDirection: "up" | "down" | "same" = newChange > 0 ? "up" : newChange < 0 ? "down" : "same";

          return {
            ...share,
            price: newPrice,
            current_price: newPrice,
            change: newChange,
            direction: newDirection,
            total_volume: real.volume ?? 100000,
            volume24h: real.volume ?? 100000,
            high24h: real.dayHigh ?? newPrice + 5,
            low24h: real.dayLow ?? newPrice - 5,
            priceChangePercentage24h: newChange,
          };
        });

        setShares(updated as Share[]);
      } catch (error) {
        console.error('Failed to fetch real stock data', error);
      }
    };

    fetchRealData();
    const interval = setInterval(fetchRealData, 60000);
    return () => clearInterval(interval);
  }, []);

  return shares;
}