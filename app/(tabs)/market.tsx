import { useState } from 'react';
import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput, TouchableOpacity } from 'react-native';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Newspaper } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import GameButton from '@/components/GameButton';
import { useMarketNews } from '@/hooks/useMarketNews';
import { usePlayerFinances } from '@/hooks/usePlayerFinances';

import { useMarketPrices } from '@/hooks/useMarketPrices';

interface Coin {
  id: string;
  name: string;
  emoji: string;
  price: number;
  change: number;
}

const calculateTotalPurchaseValue = (price: number, quantity: number): number => {
  return price * quantity;
};

const formatMoney = (num: number): string => {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
  return `$${num.toFixed(2)}`;
};

export default function MarketScreen() {
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [activeTab, setActiveTab] = useState<'trading' | 'news'>('trading');
  const [error, setError] = useState<string | null>(null);
  const { news, generateNews } = useMarketNews();
  const { balance, portfolio, buyCoin, sellCoin } = usePlayerFinances();

  const marketPrices = useMarketPrices();


  const handleCoinPress = (coin: Coin) => {
    setSelectedCoin(coin);
    setQuantity('1');
    setError(null);
  };

  const handleTrade = async (type: 'buy' | 'sell') => {
    if (!selectedCoin) return;

    const amount = parseInt(quantity, 10);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    const totalCost = calculateTotalPurchaseValue(selectedCoin.price, amount);

    try {
      if (type === 'buy') {
        if (balance < totalCost) {
          setError(`Not enough balance. You need $${totalCost.toFixed(2)}`);
          return;
        }
        await buyCoin(selectedCoin.name, amount, selectedCoin.price);
        generateNews(1);
      } else {
        await sellCoin(selectedCoin.name, amount, selectedCoin.price);
        generateNews(1);
      }
      setSelectedCoin(null);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getPortfolioQuantity = (coinName: string): number => {
    const entry = portfolio[coinName];
    if (entry && typeof entry === 'object' && 'quantity' in entry && typeof entry.quantity === 'number') {
      return entry.quantity;
    }
    return 0;
  };

  // Helper to calculate profit/loss for a coin in portfolio
  const getProfitLoss = (coinName: string, currentPrice: number): number | null => {
    const entry = portfolio[coinName];
    if (!entry || typeof entry !== 'object' || !entry.avgPrice) return null;

    const { avgPrice, quantity } = entry;
    const currentValue = currentPrice * quantity;
    const originalValue = avgPrice * quantity;

    return currentValue - originalValue;
  };

  const getTimeAgo = (timestamp: string | Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (minutes < 1440) {
      return `${Math.floor(minutes / 60)}h ago`;
    } else {
      return `${Math.floor(minutes / 1440)}d ago`;
    }
  };

  const CoinCard = ({ coin }: { coin: Coin }) => {
    const profitLoss = getProfitLoss(coin.name, coin.price);
    return (
      <Pressable
        style={styles.coinCard}
        onPress={() => handleCoinPress(coin)}
      >
        <View style={styles.coinInfo}>
          <Text style={styles.coinEmoji}>{coin.emoji}</Text>
          <View>
            <Text style={styles.coinName}>{coin.name}</Text>
            <Text style={styles.coinPrice}>${coin.price.toFixed(2)}</Text>
            <Text style={styles.portfolioQuantity}>
              Owned: {getPortfolioQuantity(coin.name)}
            </Text>
            {profitLoss !== null && (
              <Text
                style={{
                  fontFamily: 'Nunito-Bold',
                  fontSize: 14,
                  color: profitLoss >= 0 ? Colors.success[600] : Colors.error[600],
                  marginTop: 4,
                }}
              >
                {profitLoss >= 0 ? '+' : '-'}{formatMoney(Math.abs(profitLoss))} {profitLoss >= 0 ? 'Profit' : 'Loss'}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.trendContainer}>
          {coin.change >= 0 ? (
            <ArrowUpRight size={20} color={Colors.success[500]} />
          ) : (
            <ArrowDownRight size={20} color={Colors.error[500]} />
          )}
          <Text
            style={[
              styles.trendText,
              { color: coin.change >= 0 ? Colors.success[500] : Colors.error[500] },
            ]}
          >
            {coin.change > 0 ? '+' : ''}{coin.change}%
          </Text>
        </View>
      </Pressable>
    );
  };

  interface NewsItem {
    id: string;
    emoji: string;
    coin: string;
    headline: string;
    impact: number;
    type: 'positive' | 'negative' | 'neutral';
    timestamp: Date | string;
  }

  const NewsCard = ({ item }: { item: NewsItem }) => {
    const getImpactStyle = () => {
      switch (item.type) {
        case 'positive':
          return styles.positiveImpact;
        case 'negative':
          return styles.negativeImpact;
        default:
          return styles.neutralImpact;
      }
    };

    return (
      <View style={styles.newsCard}>
        <View style={styles.newsHeader}>
          <View style={styles.newsHeaderLeft}>
            <Text style={styles.newsEmoji}>{item.emoji}</Text>
            <Text style={styles.newsCoin}>{item.coin}</Text>
          </View>
          <Text style={styles.newsTimestamp}>{getTimeAgo(item.timestamp)}</Text>
        </View>
        <Text style={[styles.newsHeadline, getImpactStyle()]}>
          {item.headline}
        </Text>
        <Text style={[styles.newsImpact, getImpactStyle()]}>
          {item.impact > 0 ? '+' : ''}{item.impact}% Impact
        </Text>
      </View>
    );
  };


  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Market</Text>
          <Text style={styles.subtitle}>Trade & Track News</Text>
          <Text style={styles.balance}>💰 Balance: {formatMoney(balance)}</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'trading' && styles.activeTab]}
            onPress={() => setActiveTab('trading')}
          >
            <TrendingUp size={20} color={activeTab === 'trading' ? Colors.primary[600] : Colors.neutral[400]} />
            <Text style={[styles.tabText, activeTab === 'trading' && styles.activeTabText]}>Trading</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'news' && styles.activeTab]}
            onPress={() => setActiveTab('news')}
          >
            <Newspaper size={20} color={activeTab === 'news' ? Colors.primary[600] : Colors.neutral[400]} />
            <Text style={[styles.tabText, activeTab === 'news' && styles.activeTabText]}>News</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'trading' ? (
          <>
            <View style={styles.trendingBanner}>
              <TrendingUp size={24} color={Colors.warning[600]} style={styles.trendingIcon} />
              <Text style={styles.trendingText}>
                Trending: CrypTofu +27% 🚀
              </Text>
            </View>

            <View style={styles.coinList}>
              {marketPrices.map((coin) => (
                <CoinCard
                  key={coin.id}
                  coin={{
                    id: String(coin.id ?? ''),
                    name: coin.name,
                    emoji: coin.emoji ?? '🪙',
                    price: coin.price,
                    change: coin.change,
                  }}
                />
              ))}
            </View>
          </>
        ) : (
          <View style={styles.newsList}>
            {news.length > 0 ? (
              news.map(item => <NewsCard key={item.id} item={item} />)
            ) : (
              <View style={styles.emptyNews}>
                <Text style={styles.emptyNewsText}>No market news yet.</Text>
                <Text style={styles.emptyNewsSubtext}>Make some trades to generate news!</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={!!selectedCoin}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedCoin(null)}
      >
        {selectedCoin && (
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedCoin.emoji} {selectedCoin.name}
                </Text>
                <Text style={styles.modalPrice}>
                  ${selectedCoin.price.toFixed(2)}
                </Text>
              </View>

              <View style={styles.portfolioInfo}>
                <Text style={styles.portfolioLabel}>Your Portfolio</Text>
                <Text style={styles.portfolioValue}>
                  {getPortfolioQuantity(selectedCoin.name)} coins
                </Text>
              </View>

              <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>💰 Your Balance</Text>
                <Text style={styles.balanceValue}>{formatMoney(balance)}</Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Quantity</Text>
                <TextInput
                  style={styles.input}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  placeholder="Enter amount"
                />
                {selectedCoin && quantity.trim() !== '' && !isNaN(Number(quantity)) && (
                  <Text style={styles.totalCostText}>
                    Total Cost: {formatMoney(selectedCoin.price * Number(quantity))}
                  </Text>
                )}
              </View>

              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}

              <View style={styles.buttonGroup}>
                <GameButton
                  title="💸 Buy"
                  onPress={() => handleTrade('buy')}
                  style={styles.buyButton}
                />
                <GameButton
                  title="📉 Sell"
                  onPress={() => handleTrade('sell')}
                  style={styles.sellButton}
                  disabled={getPortfolioQuantity(selectedCoin.name) === 0}
                />
              </View>

              <GameButton
                title="Cancel"
                onPress={() => setSelectedCoin(null)}
                style={styles.cancelButton}
                textStyle={styles.cancelButtonText}
              />
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: Layout.spacing.lg,
  },
  header: {
    marginBottom: Layout.spacing.xl,
    marginTop: Layout.spacing.xl,
  },
  title: {
    fontFamily: 'Nunito-Bold',
    fontSize: 32,
    color: Colors.primary[700],
    marginBottom: Layout.spacing.xs,
  },
  subtitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: 18,
    color: Colors.neutral[600],
  },
  balance: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: Colors.primary[600],
    marginTop: Layout.spacing.md,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.xs,
    marginBottom: Layout.spacing.lg,
    ...Layout.shadows.small,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.spacing.sm,
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
  },
  activeTab: {
    backgroundColor: Colors.primary[50],
  },
  tabText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: Colors.neutral[400],
  },
  activeTabText: {
    color: Colors.primary[600],
  },
  trendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning[100],
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.xl,
    ...Layout.shadows.small,
  },
  trendingIcon: {
    marginRight: Layout.spacing.sm,
  },
  trendingText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.warning[700],
  },
  coinList: {
    gap: Layout.spacing.md,
  },
  coinCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.lg,
    ...Layout.shadows.small,
  },
  coinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
  },
  coinEmoji: {
    fontSize: 32,
  },
  coinName: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  coinPrice: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: Colors.neutral[600],
  },
  portfolioQuantity: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
  },
  trendText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
  },
  newsList: {
    gap: Layout.spacing.md,
  },
  newsCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.lg,
    ...Layout.shadows.small,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  newsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  newsEmoji: {
    fontSize: 24,
  },
  newsCoin: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.primary[600],
  },
  newsTimestamp: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: Colors.neutral[500],
  },
  newsHeadline: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: Layout.spacing.xs,
  },
  newsImpact: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
  },
  positiveImpact: {
    color: Colors.success[600],
  },
  negativeImpact: {
    color: Colors.error[600],
  },
  neutralImpact: {
    color: Colors.neutral[600],
  },
  emptyNews: {
    alignItems: 'center',
    padding: Layout.spacing.xl,
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    ...Layout.shadows.small,
  },
  emptyNewsText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: Colors.neutral[600],
    marginBottom: Layout.spacing.xs,
  },
  emptyNewsSubtext: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.neutral[500],
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Layout.borderRadius.xl,
    borderTopRightRadius: Layout.borderRadius.xl,
    padding: Layout.spacing.xl,
    gap: Layout.spacing.lg,
  },
  modalHeader: {
    alignItems: 'center',
    gap: Layout.spacing.xs,
  },
  modalTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 24,
    color: Colors.neutral[800],
  },
  modalPrice: {
    fontFamily: 'Nunito-Bold',
    fontSize: 32,
    color: Colors.primary[600],
  },
  portfolioInfo: {
    backgroundColor: Colors.primary[50],
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  portfolioLabel: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.primary[600],
    marginBottom: Layout.spacing.xs,
  },
  portfolioValue: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: Colors.primary[700],
  },
  balanceContainer: {
    backgroundColor: Colors.primary[50],
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    alignItems: 'center',
  },
  balanceLabel: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: Colors.primary[600],
    marginBottom: Layout.spacing.xs,
  },
  balanceValue: {
    fontFamily: 'Nunito-Bold',
    fontSize: 24,
    color: Colors.primary[700],
  },
  inputContainer: {
    gap: Layout.spacing.xs,
  },
  inputLabel: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: Colors.neutral[600],
  },
  input: {
    fontFamily: 'Nunito-Regular',
    backgroundColor: Colors.neutral[100],
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    fontSize: 18,
    color: Colors.neutral[800],
    borderWidth: 2,
    borderColor: Colors.neutral[200],
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  buyButton: {
    flex: 1,
    backgroundColor: Colors.success[500],
  },
  sellButton: {
    flex: 1,
    backgroundColor: Colors.error[500],
  },
  cancelButton: {
    backgroundColor: Colors.neutral[200],
  },
  cancelButtonText: {
    color: Colors.neutral[600],
  },
  errorText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.error[600],
    textAlign: 'center',
    marginBottom: Layout.spacing.md,
  },
  totalCostText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: Colors.neutral[700],
    textAlign: 'center',
    marginVertical: Layout.spacing.sm,
  },
});