import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { useMarketPrices, getMarketItemByName } from '../market/useMarketPrices';
import { saveGameData } from '@/utils/saveGame';
const BALANCE_KEY = '@wallnance_balance';
const PORTFOLIO_KEY = '@wallnance_portfolio';
const LAST_UPDATE_KEY = '@wallnance_last_update';

interface PortfolioEntry {
  quantity: number;
  avgPrice: number;
}

interface Portfolio {
  [key: string]: PortfolioEntry; // coin name -> { quantity, avgPrice }
}

interface FinanceStore {
  balance: number;
  portfolio: Portfolio;
  lastUpdate: Date | null;
  setBalance: (balance: number) => void;
  setPortfolio: (portfolio: Portfolio) => void;
  setLastUpdate: (date: Date) => void;
}

// Create a global store for finances
const useFinanceStore = create<FinanceStore>((set) => ({
  balance: 1000000,
  portfolio: {},
  lastUpdate: null,
  setBalance: (balance) => set({ balance }),
  setPortfolio: (portfolio) => set({ portfolio }),
  setLastUpdate: (date) => set({ lastUpdate: date }),
}));

export function usePlayerFinances() {
  const { balance, portfolio, lastUpdate, setBalance, setPortfolio, setLastUpdate } = useFinanceStore();
  const [isLoading, setIsLoading] = useState(true);
  const prices = useMarketPrices();

  // Load finances on mount
  useEffect(() => {
    loadFinances();
  }, []);

  const loadFinances = async () => {
    try {
      const [balanceStr, portfolioStr, lastUpdateStr] = await Promise.all([
        AsyncStorage.getItem(BALANCE_KEY),
        AsyncStorage.getItem(PORTFOLIO_KEY),
        AsyncStorage.getItem(LAST_UPDATE_KEY),
      ]);

      if (balanceStr) {
        setBalance(parseFloat(balanceStr));
      }
      if (portfolioStr) {
        setPortfolio(JSON.parse(portfolioStr));
      }
      if (lastUpdateStr) {
        setLastUpdate(new Date(lastUpdateStr));
      }
    } catch (error) {
      console.error('Error loading finances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFinances = async (newBalance: number, newPortfolio?: Portfolio) => {
    try {
      const now = new Date();
      const updates: Promise<void>[] = [AsyncStorage.setItem(BALANCE_KEY, newBalance.toString())];
      
      setBalance(newBalance);
      setLastUpdate(now);
      
      if (newPortfolio) {
        updates.push(AsyncStorage.setItem(PORTFOLIO_KEY, JSON.stringify(newPortfolio)));
        setPortfolio(newPortfolio);
      }
      
      updates.push(AsyncStorage.setItem(LAST_UPDATE_KEY, now.toISOString()));
      
      await Promise.all(updates);
    } catch (error) {
      console.error('Error saving finances:', error);
      throw error;
    }
  };

  const updateBalance = useCallback(async (amount: number) => {
    const newBalance = balance + amount;
    if (newBalance < 0) {
      throw new Error('Insufficient funds');
    }
    await saveFinances(newBalance);
    return newBalance;
  }, [balance]);

  const buyCoin = async (coinName: string, quantity: number, price: number) => {
    const totalCost = quantity * price;
    
    if (totalCost > balance) {
      throw new Error('Insufficient funds');
    }

    const newBalance = balance - totalCost;
    const existing = portfolio[coinName] || { quantity: 0, avgPrice: 0 };
    const newTotalQuantity = existing.quantity + quantity;
    const newAvgPrice = ((existing.quantity * existing.avgPrice) + (quantity * price)) / newTotalQuantity;

    const newPortfolio = {
      ...portfolio,
      [coinName]: {
        quantity: newTotalQuantity,
        avgPrice: newAvgPrice,
      },
    };

    await saveFinances(newBalance, newPortfolio);
  };

  const sellCoin = async (coinName: string, quantity: number, price: number) => {
    const existing = portfolio[coinName];
    if (!existing || quantity > existing.quantity) {
      throw new Error('Insufficient coins');
    }

    const totalEarnings = quantity * price;
    const newBalance = balance + totalEarnings;
    const newQuantity = existing.quantity - quantity;

    const newPortfolio = { ...portfolio };
    if (newQuantity === 0) {
      delete newPortfolio[coinName];
    } else {
      newPortfolio[coinName] = {
        quantity: newQuantity,
        avgPrice: existing.avgPrice,
      };
    }

    await saveFinances(newBalance, newPortfolio);
  };

  const buyFromMarket = async (name: string, quantity: number) => {
    const marketItem = getMarketItemByName(prices, name);
    if (!marketItem) {
      throw new Error(`Asset "${name}" not found in market`);
    }

    await buyCoin(name, quantity, marketItem.price);
  };

  return {
    balance,
    portfolio,
    lastUpdate,
    isLoading,
    updateBalance,
    buyCoin,
    sellCoin,
    buyFromMarket,
  };
}