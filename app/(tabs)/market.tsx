import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput, TouchableOpacity, Animated, useWindowDimensions } from 'react-native';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Newspaper } from 'lucide-react-native';
import SparkLine from '@/src/components/charts/SparkLine';
import Colors from '@/src/constants/Colors';
import Layout from '@/src/constants/Layout';
import GameButton from '@/src/components/buttons/GameButton';
import { useMarketNews } from '@/src/hooks/market/useMarketNews';
import { usePlayerFinances } from '@/src/hooks/finance/usePlayerFinances';
import { saveGameData } from '@/utils/saveGame';
import { useMarketPrices } from '@/src/hooks/market/useMarketPrices';
import { useCompanyShares } from '@/src/hooks/useCompanyShares';

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

// CoinFlipAnimation component for trade confirmation
const CoinFlipAnimation = ({ visible }: { visible: boolean }) => {
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      flipAnim.setValue(0);
      Animated.loop(
        Animated.timing(flipAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        { iterations: 1 }
      ).start();
    }
  }, [visible]);

  const rotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!visible) return null;

  return (
    <View style={{ position: 'absolute', top: '40%', left: '45%', zIndex: 10 }}>
      <Animated.View
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: Colors.primary[500],
          justifyContent: 'center',
          alignItems: 'center',
          transform: [{ rotateY }],
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        }}
      >
        <Text style={{ fontSize: 28, color: 'white', fontWeight: 'bold' }}>W</Text>
      </Animated.View>
    </View>
  );
};

export default function MarketScreen() {
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [activeTab, setActiveTab] = useState<'trading' | 'news'>('trading');
  const [error, setError] = useState<string | null>(null);
  const [showCoinFlip, setShowCoinFlip] = useState(false);
  const [showWLCModal, setShowWLCModal] = useState(false);
  const { news, generateNews } = useMarketNews();
  const { balance, portfolio, buyCoin, sellCoin } = usePlayerFinances();

  const marketPrices = useMarketPrices();
  const companyShares = useCompanyShares();

  // Responsive: get width and isWide at the top
  const { width } = useWindowDimensions();
  const isWide = width >= 600;


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
        await saveGameData({ balance, portfolio });
      } else {
        await sellCoin(selectedCoin.name, amount, selectedCoin.price);
        generateNews(1);
        await saveGameData({ balance, portfolio });
      }
      setShowCoinFlip(true);
      setTimeout(() => {
        setShowCoinFlip(false);
        setSelectedCoin(null);
      }, 1000);
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
    const { width } = useWindowDimensions();
    const isWide = width >= 600;

    // Fade-in animation for percent change
    const fadeAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, [coin.change]);

    // Price history tracking for sparkline
    const [history, setHistory] = useState<number[]>([coin.price]);
    useEffect(() => {
      setHistory((prev) => {
        const updated = [...prev, coin.price];
        return updated.length > 10 ? updated.slice(-10) : updated;
      });
    }, [coin.price]);

    // Flash animation for background color on price change
    const flash = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      flash.setValue(1);
      Animated.timing(flash, { toValue: 0, duration: 500, useNativeDriver: false }).start();
    }, [coin.price]);
    const bgColor = flash.interpolate({
      inputRange: [0, 1],
      outputRange: ['transparent', coin.change >= 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'],
    });

    // Responsive layout for wide vs. narrow screens
    return (
      <Animated.View style={{ backgroundColor: bgColor }}>
        <Pressable
          onPress={() => handleCoinPress(coin)}
          style={[
            styles.coinCardBase,
            isWide ? styles.coinCardWide : styles.coinCardNarrow,
            { backgroundColor: Colors.card }
          ]}
        >
          {isWide ? (
            <>
              {/* Name Column */}
              <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: Layout.spacing.sm }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: coin.change >= 0 ? Colors.success[500] : Colors.error[500] }} />
                <Text style={{ fontSize: 22 }}>{coin.emoji}</Text>
                <View>
                  <Text style={{ fontFamily: 'Nunito-Bold', fontSize: 16, color: Colors.neutral[900] }}>
                    {coin.name}
                  </Text>
                  <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 12, color: Colors.neutral[500] }}>
                    {coin.id.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Price Column */}
              <View style={{ flex: 1, minWidth: 100, alignItems: 'flex-end' }}>
                <Text style={{ fontFamily: 'Nunito-Bold', fontSize: 14, color: Colors.neutral[800] }}>
                  ${coin.price.toFixed(2)}
                </Text>
              </View>

              {/* 24h Change Column */}
              <View style={{ flex: 1, minWidth: 100, alignItems: 'flex-end' }}>
                <Animated.Text style={{
                  fontFamily: 'Nunito-Bold',
                  fontSize: 14,
                  color: coin.change >= 0 ? Colors.success[600] : Colors.error[600],
                  opacity: fadeAnim,
                }}>
                  {coin.change >= 0 ? '+' : ''}{coin.change.toFixed(2)}%
                </Animated.Text>
              </View>

              {/* Volume Column */}
              <View style={{ flex: 1, minWidth: 100, alignItems: 'flex-end' }}>
                <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 13, color: Colors.neutral[600] }}>
                  Volume: ${(coin.price * 10000).toLocaleString()}
                </Text>
              </View>

              {/* Chart Column */}
              <View style={{ flex: 1, minWidth: 100, alignItems: 'flex-end' }}>
                <SparkLine points={history} positive={coin.change >= 0} />
              </View>
            </>
          ) : (
            <>
              {/* Name */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: coin.change >= 0 ? Colors.success[500] : Colors.error[500], marginRight: 6 }} />
                <Text style={{ fontSize: 22 }}>{coin.emoji}</Text>
                <View>
                  <Text style={{ fontFamily: 'Nunito-Bold', fontSize: 16, color: Colors.neutral[900] }}>
                    {coin.name}
                  </Text>
                  <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 12, color: Colors.neutral[500] }}>
                    {coin.id.toUpperCase()}
                  </Text>
                </View>
              </View>
              {/* Responsive stacked info */}
              <View style={{ marginTop: 8, width: '100%' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                  <Text style={{ fontFamily: 'Nunito-Bold', fontSize: 14, color: Colors.neutral[800] }}>
                    ${coin.price.toFixed(2)}
                  </Text>
                  <Text style={{
                    fontFamily: 'Nunito-Regular',
                    fontSize: 13,
                    color: Colors.neutral[600],
                  }}>
                    Volume: ${(coin.price * 10000).toLocaleString()}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{
                    fontFamily: 'Nunito-Bold',
                    fontSize: 13,
                    color: coin.change >= 0 ? Colors.success[600] : Colors.error[600],
                  }}>
                    {coin.change >= 0 ? '+' : ''}{coin.change}%
                  </Text>
                  <SparkLine points={history} positive={coin.change >= 0} />
                </View>
              </View>
            </>
          )}
        </Pressable>
      </Animated.View>
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
      {/* Coin Flip Animation for trade confirmation */}
      <CoinFlipAnimation visible={showCoinFlip} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Market</Text>
          <TouchableOpacity style={{ alignSelf: 'flex-end' }} onPress={() => setShowWLCModal(true)}>
            <Text style={{
              fontFamily: 'Nunito-Bold',
              fontSize: 14,
              color: Colors.primary[600],
              backgroundColor: Colors.primary[50],
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 20,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
            }}>
              🔍 Learn about WLC
            </Text>
          </TouchableOpacity>
          <Text style={styles.subtitle}>Manage Your Crypto Assets & Stay Updated</Text>
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
          <View style={styles.section}>
            {news.length > 0 && (
              <View style={styles.trendingBanner}>
                <TrendingUp size={24} color={Colors.warning[600]} style={styles.trendingIcon} />
                <Text style={styles.trendingText}>
                  Trending: {news[news.length - 1].coin} {news[news.length - 1].impact > 0 ? '+' : ''}{news[news.length - 1].impact}% 🚀
                </Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>💱 Available Tokens</Text>
            {(() => {
              // API-driven categorization
              const categories = {
                Stable: marketPrices.filter(c => c.category === 'Stable'),
                Meme: marketPrices.filter(c => c.category === 'Meme'),
                Meta: marketPrices.filter(c => c.category === 'Meta'),
                Utility: marketPrices.filter(c => c.category === 'Utility'),
                Layer1: marketPrices.filter(c => c.category === 'Layer1'),
              };
              return (
                <>
                  {Object.entries(categories).map(([category, coins]) => (
                    <View key={category} style={{ marginBottom: Layout.spacing.xl }}>
                      <Text style={styles.sectionTitle}>{category} Tokens</Text>
                      {/* Header row for coin list - responsive */}
                      {isWide ? (
                        <View style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingHorizontal: Layout.spacing.lg,
                          marginBottom: 4,
                        }}>
                          <Text style={{ flex: 2, fontFamily: 'Nunito-Bold', fontSize: 14, color: Colors.neutral[600] }}>Name</Text>
                          <Text style={{ flex: 1, fontFamily: 'Nunito-Bold', fontSize: 14, color: Colors.neutral[600], textAlign: 'right' }}>Price</Text>
                          <Text style={{ flex: 1, fontFamily: 'Nunito-Bold', fontSize: 14, color: Colors.neutral[600], textAlign: 'right' }}>24h</Text>
                          <Text style={{ flex: 1, fontFamily: 'Nunito-Bold', fontSize: 14, color: Colors.neutral[600], textAlign: 'right' }}>Volume</Text>
                          <Text style={{ flex: 1, fontFamily: 'Nunito-Bold', fontSize: 14, color: Colors.neutral[600], textAlign: 'right' }}>Chart</Text>
                        </View>
                      ) : (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Layout.spacing.lg, marginBottom: 4 }}>
                          <Text style={{ fontFamily: 'Nunito-Bold', fontSize: 14, color: Colors.neutral[600] }}>Tokens</Text>
                          <Text style={{ fontFamily: 'Nunito-Bold', fontSize: 14, color: Colors.neutral[600] }}>Market</Text>
                        </View>
                      )}
                      <View style={styles.coinList}>
                        {coins
                          .sort((a, b) => b.price - a.price)
                          .map((coin) => (
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
                    </View>
                  ))}
                </>
              );
            })()}

            <View style={{ marginTop: Layout.spacing.xl }}>
              <Text style={styles.sectionTitle}>🏢 Company Shares</Text>
              {/* Header row for company shares - responsive */}
              {isWide ? (
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: Layout.spacing.lg,
                  marginBottom: 4,
                }}>
                  <Text style={{ flex: 2, fontFamily: 'Nunito-Bold', fontSize: 14, color: Colors.neutral[600] }}>Name</Text>
                  <Text style={{ flex: 1, fontFamily: 'Nunito-Bold', fontSize: 14, color: Colors.neutral[600], textAlign: 'right' }}>Price</Text>
                  <Text style={{ flex: 1, fontFamily: 'Nunito-Bold', fontSize: 14, color: Colors.neutral[600], textAlign: 'right' }}>24h</Text>
                  <Text style={{ flex: 1, fontFamily: 'Nunito-Bold', fontSize: 14, color: Colors.neutral[600], textAlign: 'right' }}>Volume</Text>
                  <Text style={{ flex: 1, fontFamily: 'Nunito-Bold', fontSize: 14, color: Colors.neutral[600], textAlign: 'right' }}>Chart</Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Layout.spacing.lg, marginBottom: 4 }}>
                  <Text style={{ fontFamily: 'Nunito-Bold', fontSize: 14, color: Colors.neutral[600] }}>Tokens</Text>
                  <Text style={{ fontFamily: 'Nunito-Bold', fontSize: 14, color: Colors.neutral[600] }}>Market</Text>
                </View>
              )}
              <View style={styles.coinList}>
                {companyShares.map((share) => (
                  <CoinCard
                    key={share.id}
                    coin={{
                      id: String(share.id ?? ''),
                      name: share.name,
                      emoji: share.emoji ?? '🏢',
                      price: share.price,
                      change: share.change,
                    }}
                  />
                ))}
              </View>
            </View>
          </View>
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
              {/* 24h Change summary */}
              <View style={{ marginTop: 8 }}>
                <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 13, textAlign: 'center', color: Colors.neutral[600] }}>
                  24h Change: {selectedCoin.change >= 0 ? '+' : ''}{selectedCoin.change}%
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

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: Colors.success[500],
                    paddingVertical: 14,
                    marginRight: 8,
                    borderRadius: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                  }}
                  onPress={() => handleTrade('buy')}
                >
                  <Text style={{ color: '#fff', fontFamily: 'Nunito-Bold', fontSize: 16, textAlign: 'center' }}>💸 Buy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: Colors.error[500],
                    paddingVertical: 14,
                    marginLeft: 8,
                    borderRadius: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    opacity: getPortfolioQuantity(selectedCoin.name) === 0 ? 0.6 : 1,
                  }}
                  onPress={() => handleTrade('sell')}
                  disabled={getPortfolioQuantity(selectedCoin.name) === 0}
                >
                  <Text style={{ color: '#fff', fontFamily: 'Nunito-Bold', fontSize: 16, textAlign: 'center' }}>📉 Sell</Text>
                </TouchableOpacity>
              </View>

              <GameButton
                title="Cancel"
                onPress={() => setSelectedCoin(null)}
                style={styles.cancelButton}
                textStyle={styles.cancelButtonText}
              />
              {/* Last Updated timestamp */}
              <Text style={{ fontSize: 12, textAlign: 'center', color: Colors.neutral[500] }}>
                Last Updated: {new Date().toLocaleTimeString()}
              </Text>
            </View>
          </View>
        )}
      </Modal>

      {/* WLC Info Modal */}
      <Modal
        visible={showWLCModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowWLCModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.wlcModalContent}>
            <Text style={styles.modalTitle}>🚀 Wallnance Coin (WLC)</Text>
            <Text style={styles.modalSubtitle}>Version 1.0 • June 2025</Text>
            <Text style={styles.modalDescription}>
              🪙 <Text style={{ fontWeight: 'bold' }}>WLC (Wallnance Coin)</Text> is the official digital currency of Wallnance Tycoon — designed to power in-game transactions and reward strategic players.
            </Text>
            <Text style={styles.modalDescription}>
              🔒 <Text style={{ fontWeight: 'bold' }}>Fixed Supply:</Text> 5,000,000 WLC — non-mintable and deflationary, with burn mechanisms applied on premium purchases and upgrades.
            </Text>
            <Text style={styles.modalDescription}>
              🎁 <Text style={{ fontWeight: 'bold' }}>Distribution:</Text> 70% Player Rewards • 20% Game Treasury • 10% Developer Reserve.
            </Text>
            <Text style={styles.modalDescription}>
              🧠 <Text style={{ fontWeight: 'bold' }}>Utility:</Text> WLC can be used to access premium features, unlock game expansions, and participate in exclusive events and community governance.
            </Text>
            <Text style={styles.modalDescription}>
              🚀 <Text style={{ fontWeight: 'bold' }}>Early Access Bonus:</Text> Players who join early receive 1,000 WLC to kickstart their journey.
            </Text>
            <Text style={styles.modalDescription}>
              🏗️ <Text style={{ fontWeight: 'bold' }}>Built by KANEDEV</Text> — Empowering gamers with true economic simulation.
            </Text>
            <GameButton
              title="Close"
              onPress={() => setShowWLCModal(false)}
              style={styles.cancelButton}
              textStyle={styles.cancelButtonText}
            />
          </View>
        </View>
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
  coinCardBase: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderColor: Colors.neutral[200],
  },
  coinCardWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    rowGap: 10,
  },
  coinCardNarrow: {
    flexDirection: 'column',
    alignItems: 'stretch',
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.lg,
    width: '90%',
    padding: Layout.spacing.xl,
    gap: Layout.spacing.lg,
    ...Layout.shadows.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
  },
  modalHeader: {
    alignItems: 'center',
    gap: Layout.spacing.xs,
    marginBottom: Layout.spacing.sm,
    backgroundColor: Colors.neutral[50],
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    ...Layout.shadows.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
  },
  modalTitle: {
  fontFamily: 'Nunito-Bold',
  fontSize: 22,
  color: '#f8fafc', // brighter for visibility
  textAlign: 'center',
},
  modalPrice: {
    fontFamily: 'Nunito-Bold',
    fontSize: 24,
    color: Colors.primary[500],
  },
  portfolioInfo: {
    backgroundColor: Colors.neutral[50],
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
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
    backgroundColor: Colors.neutral[50],
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
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
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
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
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    ...Layout.shadows.small,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Layout.spacing.md,
  },
  buyButton: {
    flex: 1,
    backgroundColor: Colors.success[500],
    paddingVertical: Layout.spacing.sm,
  },
  sellButton: {
    flex: 1,
    backgroundColor: Colors.error[500],
    paddingVertical: Layout.spacing.sm,
  },
  cancelButton: {
    backgroundColor: Colors.neutral[300],
    borderRadius: Layout.borderRadius.md,
    paddingVertical: Layout.spacing.sm,
  },
  cancelButtonText: {
    color: Colors.neutral[700],
    fontSize: 16,
    textAlign: 'center',
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
  section: {
    marginBottom: Layout.spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: Colors.primary[600],
    marginBottom: Layout.spacing.md,
  },
  // --- Futuristic WLC Modal Styles ---
  wlcModalContent: {
    // Gradient background workaround for RN: use two overlays for subtle effect
    backgroundColor: '#16213e', // fallback
    borderRadius: Layout.borderRadius.lg,
    width: '90%',
    padding: Layout.spacing.xl,
    gap: Layout.spacing.md,
    borderWidth: 1.5,
    borderColor: '#38bdf8',
    // Glowing border effect
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    // Simulate gradient with extra overlay via RN LinearGradient if available
    // Otherwise, dark blue fallback
    backgroundImage: undefined, // for web
    // For native, gradient would be via react-native-linear-gradient if available
  },
  modalSubtitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: Layout.spacing.sm,
    letterSpacing: 0.4,
  },
  modalDescription: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: Layout.spacing.sm,
    letterSpacing: 0.1,
  },
});