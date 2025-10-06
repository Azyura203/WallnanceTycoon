import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { useMarketPrices, getMarketItemByName } from '../market/useMarketPrices';
import { useGameEvents } from '../useGameEvents';
import { useAchievements } from '../useAchievements';
import { useLearningSystem } from '../useLearningSystem';
import { saveGameData } from '@/utils/saveGame';

const BALANCE_KEY = '@wallnance_balance';
const PORTFOLIO_KEY = '@wallnance_portfolio';
const LAST_UPDATE_KEY = '@wallnance_last_update';
const PLAYER_STATS_KEY = '@wallnance_player_stats';

interface PortfolioEntry {
  quantity: number;
  avgPrice: number;
}

interface Portfolio {
  [key: string]: PortfolioEntry; // coin name -> { quantity, avgPrice }
}

interface PlayerStats {
  totalTrades: number;
  profitableTrades: number;
  totalProfit: number;
  biggestWin: number;
  biggestLoss: number;
  joinDate: Date;
}

interface FinanceStore {
  balance: number;
  portfolio: Portfolio;
  lastUpdate: Date | null;
  playerStats: PlayerStats;
  setBalance: (balance: number) => void;
  setPortfolio: (portfolio: Portfolio) => void;
  setLastUpdate: (date: Date) => void;
  setPlayerStats: (stats: PlayerStats) => void;
}

// Create a global store for finances
const useFinanceStore = create<FinanceStore>((set) => ({
  balance: 1000000,
  portfolio: {},
  lastUpdate: null,
  playerStats: {
    totalTrades: 0,
    profitableTrades: 0,
    totalProfit: 0,
    biggestWin: 0,
    biggestLoss: 0,
    joinDate: new Date(),
  },
  setBalance: (balance) => set({ balance }),
  setPortfolio: (portfolio) => set({ portfolio }),
  setLastUpdate: (date) => set({ lastUpdate: date }),
  setPlayerStats: (stats) => set({ playerStats: stats }),
}));

export function usePlayerFinances() {
  const { 
    balance, 
    portfolio, 
    lastUpdate, 
    playerStats,
    setBalance, 
    setPortfolio, 
    setLastUpdate,
    setPlayerStats 
  } = useFinanceStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const prices = useMarketPrices();
  const { getEventMultiplier, getTradingFeeDiscount } = useGameEvents();
  const { checkAchievement } = useAchievements();
  const { updateChallengeProgress } = useLearningSystem();

  // Load finances on mount
  useEffect(() => {
    loadFinances();
  }, []);

  const loadFinances = async () => {
    try {
      const [balanceStr, portfolioStr, lastUpdateStr, statsStr] = await Promise.all([
        AsyncStorage.getItem(BALANCE_KEY),
        AsyncStorage.getItem(PORTFOLIO_KEY),
        AsyncStorage.getItem(LAST_UPDATE_KEY),
        AsyncStorage.getItem(PLAYER_STATS_KEY),
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
      if (statsStr) {
        const stats = JSON.parse(statsStr);
        setPlayerStats({
          ...stats,
          joinDate: new Date(stats.joinDate),
        });
      }
    } catch (error) {
      console.error('Error loading finances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFinances = async (newBalance: number, newPortfolio?: Portfolio, newStats?: PlayerStats) => {
    try {
      const now = new Date();
      const updates: Promise<void>[] = [AsyncStorage.setItem(BALANCE_KEY, newBalance.toString())];
      
      setBalance(newBalance);
      setLastUpdate(now);
      
      if (newPortfolio) {
        updates.push(AsyncStorage.setItem(PORTFOLIO_KEY, JSON.stringify(newPortfolio)));
        setPortfolio(newPortfolio);
      }
      
      if (newStats) {
        updates.push(AsyncStorage.setItem(PLAYER_STATS_KEY, JSON.stringify(newStats)));
        setPlayerStats(newStats);
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
    // Apply event multipliers
    const eventMultiplier = getEventMultiplier(coinName);
    const adjustedPrice = price * eventMultiplier;
    
    // Apply trading fee discount
    const feeDiscount = getTradingFeeDiscount();
    const tradingFee = 0.001 * (1 - feeDiscount); // 0.1% fee with discount
    const totalCost = (quantity * adjustedPrice) * (1 + tradingFee);
    
    if (totalCost > balance) {
      throw new Error('Insufficient funds');
    }

    const newBalance = balance - totalCost;
    const existing = portfolio[coinName] || { quantity: 0, avgPrice: 0 };
    const newTotalQuantity = existing.quantity + quantity;
    const newAvgPrice = ((existing.quantity * existing.avgPrice) + (quantity * adjustedPrice)) / newTotalQuantity;

    const newPortfolio = {
      ...portfolio,
      [coinName]: {
        quantity: newTotalQuantity,
        avgPrice: newAvgPrice,
      },
    };

    // Update player stats
    const newStats = {
      ...playerStats,
      totalTrades: playerStats.totalTrades + 1,
    };

    await saveFinances(newBalance, newPortfolio, newStats);

    // Update challenges and check achievements
    await updateChallengeProgress('trade_volume', 1);
    await checkAchievement('trade', newStats.totalTrades);

    // Check portfolio value achievement
    const portfolioValue = Object.entries(newPortfolio).reduce((total, [name, entry]) => {
      const marketItem = getMarketItemByName(prices, name);
      const currentPrice = marketItem && typeof marketItem === 'object' ? marketItem.price : entry.avgPrice;
      return total + (entry.quantity * currentPrice);
    }, 0);
    
    await checkAchievement('portfolio', portfolioValue + newBalance);
  };

  const sellCoin = async (coinName: string, quantity: number, price: number) => {
    const existing = portfolio[coinName];
    if (!existing || quantity > existing.quantity) {
      throw new Error('Insufficient coins');
    }

    // Apply event multipliers
    const eventMultiplier = getEventMultiplier(coinName);
    const adjustedPrice = price * eventMultiplier;
    
    // Apply trading fee discount
    const feeDiscount = getTradingFeeDiscount();
    const tradingFee = 0.001 * (1 - feeDiscount); // 0.1% fee with discount
    const totalEarnings = (quantity * adjustedPrice) * (1 - tradingFee);
    
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

    // Calculate profit/loss for this trade
    const costBasis = quantity * existing.avgPrice;
    const profit = totalEarnings - costBasis;
    const isProfitable = profit > 0;

    // Update player stats
    const newStats = {
      ...playerStats,
      totalTrades: playerStats.totalTrades + 1,
      profitableTrades: isProfitable ? playerStats.profitableTrades + 1 : playerStats.profitableTrades,
      totalProfit: playerStats.totalProfit + profit,
      biggestWin: isProfitable && profit > playerStats.biggestWin ? profit : playerStats.biggestWin,
      biggestLoss: !isProfitable && Math.abs(profit) > Math.abs(playerStats.biggestLoss) ? profit : playerStats.biggestLoss,
    };

    await saveFinances(newBalance, newPortfolio, newStats);

    // Update challenges and check achievements
    await updateChallengeProgress('trade_volume', 1);
    if (isProfitable) {
      await updateChallengeProgress('profit_target', profit);
      await checkAchievement('profit', newStats.totalProfit);
    }
    await checkAchievement('trade', newStats.totalTrades);
  };

  const buyFromMarket = async (name: string, quantity: number) => {
    const marketItem = getMarketItemByName(prices, name);
    if (!marketItem || typeof marketItem !== 'object' || marketItem.price === undefined) {
      throw new Error(`Asset "${name}" not found in market`);
    }

    await buyCoin(name, quantity, marketItem.price);
  };

  return {
    balance,
    portfolio,
    lastUpdate,
    playerStats,
    isLoading,
    updateBalance,
    buyCoin,
    sellCoin,
    buyFromMarket,
  };
}