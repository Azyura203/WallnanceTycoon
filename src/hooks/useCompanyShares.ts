import { useEffect, useState } from 'react';

interface Share {
  ticker: string;
  id: string;
  name: string;
  emoji: string;
  price: number;
  change: number;
}

const fictionalShares: Share[] = [
  {
    id: '1', name: 'Pokie', emoji: '🎮', price: 120, change: 2.5,
    ticker: 'PK'
  },
  {
    id: '2', name: 'Nykee', emoji: '👟', price: 85, change: -1.2,
    ticker: 'NKEE'
  },
  {
    id: '3', name: 'iPomme', emoji: '🍏', price: 230, change: 0.8,
    ticker: 'IPO'
  },
  {
    id: '4', name: 'FaceLook', emoji: '📘', price: 150, change: -0.5,
    ticker: 'LETA'
  },
  {
    id: '5', name: 'Amazoom', emoji: '📦', price: 310, change: 3.1,
    ticker: 'AMAZ'
  },

  // 🔥 New entries
  {
    id: '6', name: 'Snapture', emoji: '📸', price: 97, change: 1.4,
    ticker: 'SNP'
  },
  {
    id: '7', name: 'Netflux', emoji: '📺', price: 180, change: -0.7,
    ticker: 'NFX'
  },
  {
    id: '8', name: 'Googol', emoji: '🔍', price: 450, change: 2.2,
    ticker: 'GGL'
  },
  {
    id: '9', name: 'MuskX', emoji: '🚀', price: 600, change: 4.9,
    ticker: 'MX'
  },
  {
    id: '10', name: 'Borebucks', emoji: '☕️', price: 65, change: -0.9,
    ticker: 'BBK'
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

  return shares;
}