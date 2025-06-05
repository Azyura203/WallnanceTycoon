import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PORTFOLIO_KEY = '@wallnance_portfolio';

export interface CoinAsset {
  id: string;
  name: string;
  emoji: string;
  symbol: string;
  amount: number;
  buyPrice: number;
  currentPrice: number;
  acquiredAt: Date;
}

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<CoinAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      const data = await AsyncStorage.getItem(PORTFOLIO_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        setPortfolio(parsed.map((asset: any) => ({
          ...asset,
          acquiredAt: new Date(asset.acquiredAt),
        })));
      }
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePortfolio = async (newPortfolio: CoinAsset[]) => {
    try {
      await AsyncStorage.setItem(PORTFOLIO_KEY, JSON.stringify(newPortfolio));
      setPortfolio(newPortfolio);
    } catch (error) {
      console.error('Error saving portfolio:', error);
      throw error;
    }
  };

  const addAsset = async (asset: CoinAsset) => {
    const existing = portfolio.find(a => a.id === asset.id);
    let updated;

    if (existing) {
      const totalAmount = existing.amount + asset.amount;
      const avgBuyPrice =
        (existing.amount * existing.buyPrice + asset.amount * asset.buyPrice) / totalAmount;

      updated = portfolio.map(a =>
        a.id === asset.id
          ? { ...a, amount: totalAmount, buyPrice: avgBuyPrice }
          : a
      );
    } else {
      updated = [...portfolio, asset];
    }

    await savePortfolio(updated);
  };

  const sellAsset = async (assetId: string, amountToSell: number) => {
    const updated = portfolio
      .map(a => {
        if (a.id === assetId) {
          const remainingAmount = a.amount - amountToSell;
          if (remainingAmount > 0) {
            return { ...a, amount: remainingAmount };
          }
          return null; // fully sold
        }
        return a;
      })
      .filter(Boolean) as CoinAsset[];

    await savePortfolio(updated);
  };

  const updatePrice = async (assetId: string, newPrice: number) => {
    const updated = portfolio.map(a => a.id === assetId ? { ...a, currentPrice: newPrice } : a);
    await savePortfolio(updated);
  };

  return {
    portfolio,
    isLoading,
    addAsset,
    sellAsset,
    updatePrice,
  };
}