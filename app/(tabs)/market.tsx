import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput, TouchableOpacity, Animated, useWindowDimensions } from 'react-native';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Newspaper } from 'lucide-react-native';
import Colors from '@/src/constants/Colors';
import Layout from '@/src/constants/Layout';
import GameButton from '@/src/components/buttons/GameButton';
import { useMarketNews } from '@/src/hooks/market/useMarketNews';
import { usePlayerFinances } from '@/src/hooks/finance/usePlayerFinances';
import { saveGameData } from '@/utils/saveGame';
import { useMarketPrices } from '@/src/hooks/market/useMarketPrices';
import { useCompanyShares } from '@/src/hooks/useCompanyShares';
import DetailedChart from '@/src/components/charts/DetailedChart';

interface Coin {
  id: string;
  name: string;
  emoji: string;
  price: number;
  change: number;
  ticker: string;
  current_price?: number;
  high_24h?: number;
  low_24h?: number;
  total_volume?: number;
  price_change_percentage_24h?: number;
  category?: string;
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
    <View style={styles.coinFlipContainer}>
      <Animated.View
        style={[
          styles.coinFlipAnimation,
          {
            transform: [{ rotateY }],
          }
        ]}
      >
        <Text style={styles.coinFlipText}>W</Text>
      </Animated.View>
    </View>
  );
};

export default function MarketScreen() {
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [activeTab, setActiveTab] = useState<'trading' | 'news' | 'stocks'>('trading');
  const [error, setError] = useState<string | null>(null);
  const [showCoinFlip, setShowCoinFlip] = useState(false);
  const [showWLCModal, setShowWLCModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showDetailedChart, setShowDetailedChart] = useState<string | null>(null);
  const [chartTimeRange, setChartTimeRange] = useState<'1H' | '1D' | '7D' | '1M' | '3M' | '1Y'>('1D');
  
  const { news, generateNews } = useMarketNews();
  const { balance, portfolio, buyCoin, sellCoin } = usePlayerFinances();

  const marketPrices = useMarketPrices();
  const companyShares = useCompanyShares();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;

  // Generate price history for detailed chart
  const generatePriceHistory = (currentPrice: number, range: '1H' | '1D' | '7D' | '1M' | '3M' | '1Y') => {
    const points = range === '1H' ? 12 : range === '1D' ? 24 : range === '7D' ? 7 : range === '1M' ? 30 : range === '3M' ? 90 : 365;
    const data = [];
    let price = currentPrice;
    
    for (let i = points - 1; i >= 0; i--) {
      const volatility = 0.02; // 2% volatility
      const change = (Math.random() - 0.5) * volatility;
      price = price * (1 + change);
      data.push(parseFloat(price.toFixed(2)));
    }
    
    return data.reverse();
  };

  const handleCoinPress = (coin: Coin) => {
    setSelectedCoin(coin);
    setQuantity('1');
    setError(null);
  };

  const handleTrade = async (type: 'buy' | 'sell') => {
    if (!selectedCoin) return;

    const inputQuantity = quantity;
    const amount = parseFloat(inputQuantity);
    if (inputQuantity.includes('.') && inputQuantity.split('.')[1].length > 8) {
      alert("Too many decimal places (max 8)");
      return;
    }
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

  const CoinCard = ({ coin, index }: { coin: Coin, index: number }) => {
    const [history, setHistory] = useState<number[]>([coin.price]);
    
    useEffect(() => {
      setHistory((prev) => {
        const updated = [...prev, coin.price];
        return updated.length > 10 ? updated.slice(-10) : updated;
      });
    }, [coin.price]);

    return (
      <Pressable
        onPress={() => handleCoinPress(coin)}
        style={[
          styles.coinCard,
          isSmallScreen && styles.coinCardSmall
        ]}
      >
        <View style={[
          styles.coinCardContent,
          isSmallScreen ? styles.coinCardContentSmall : styles.coinCardContentLarge
        ]}>
          {/* Mobile Layout */}
          {isSmallScreen ? (
            <>
              <View style={styles.coinHeaderMobile}>
                <View style={styles.coinInfoMobile}>
                  <View style={[styles.statusDot, { backgroundColor: coin.change >= 0 ? Colors.success[500] : Colors.error[500] }]} />
                  <Text style={styles.coinEmoji}>{coin.emoji}</Text>
                  <View style={styles.coinNameContainer}>
                    <Text style={styles.coinNameMobile}>{coin.name}</Text>
                    <Text style={styles.coinTickerMobile}>
                      {coin.ticker ? coin.ticker.toUpperCase() : coin.id?.slice(0, 4).toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.coinPriceMobile}>
                  <Text style={styles.priceTextMobile}>${coin.price.toFixed(2)}</Text>
                  <Text style={[
                    styles.changeTextMobile,
                    { color: coin.change >= 0 ? Colors.success[600] : Colors.error[600] }
                  ]}>
                    {coin.change >= 0 ? '+' : ''}{coin.change.toFixed(2)}%
                  </Text>
                </View>
              </View>
              <View style={styles.coinFooterMobile}>
                <Text style={styles.volumeTextMobile}>
                  Vol: ${(coin.price * 10000).toLocaleString()}
                </Text>
                <TouchableOpacity
                  style={styles.chartButtonMobile}
                  onPress={(e) => {
                    e.stopPropagation();
                    setShowDetailedChart(coin.name);
                  }}
                >
                  <Text style={styles.chartButtonText}>📊</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            /* Desktop/Tablet Layout */
            <>
              <View style={styles.coinNameSection}>
                <View style={[styles.statusDot, { backgroundColor: coin.change >= 0 ? Colors.success[500] : Colors.error[500] }]} />
                <Text style={styles.coinEmoji}>{coin.emoji}</Text>
                <View>
                  <Text style={styles.coinName}>{coin.name}</Text>
                </View>
              </View>
              
              <View style={styles.coinTickerSection}>
                <Text style={styles.coinTicker}>
                  {coin.ticker ? coin.ticker.toUpperCase() : ''}
                </Text>
              </View>
              
              <View style={styles.coinPriceSection}>
                <Text style={styles.priceText}>${coin.price.toFixed(2)}</Text>
              </View>

              <View style={styles.coinChangeSection}>
                <Text style={[
                  styles.changeText,
                  { color: coin.change >= 0 ? Colors.success[600] : Colors.error[600] }
                ]}>
                  {coin.change >= 0 ? '+' : ''}{coin.change.toFixed(2)}%
                </Text>
              </View>

              <View style={styles.coinVolumeSection}>
                <Text style={styles.volumeText}>
                  {(coin.price * 10000).toLocaleString()}
                </Text>
              </View>

              <View style={styles.coinActionsSection}>
                <TouchableOpacity
                  style={styles.chartButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    setShowDetailedChart(coin.name);
                  }}
                >
                  <Text style={styles.chartButtonText}>📊</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
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
      <View style={[styles.newsCard, isSmallScreen && styles.newsCardSmall]}>
        <View style={styles.newsHeader}>
          <View style={styles.newsHeaderLeft}>
            <Text style={[styles.newsEmoji, isSmallScreen && styles.newsEmojiSmall]}>{item.emoji}</Text>
            <Text style={[styles.newsCoin, isSmallScreen && styles.newsCoinSmall]}>{item.coin}</Text>
          </View>
          <Text style={[styles.newsTimestamp, isSmallScreen && styles.newsTimestampSmall]}>
            {getTimeAgo(item.timestamp)}
          </Text>
        </View>
        <Text style={[styles.newsHeadline, getImpactStyle(), isSmallScreen && styles.newsHeadlineSmall]}>
          {item.headline}
        </Text>
        <Text style={[styles.newsImpact, getImpactStyle(), isSmallScreen && styles.newsImpactSmall]}>
          {item.impact > 0 ? '+' : ''}{item.impact}% Impact
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CoinFlipAnimation visible={showCoinFlip} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
          <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>Market</Text>
          <TouchableOpacity 
            style={[styles.wlcButton, isSmallScreen && styles.wlcButtonSmall]} 
            onPress={() => setShowWLCModal(true)}
          >
            <Text style={[styles.wlcButtonText, isSmallScreen && styles.wlcButtonTextSmall]}>
              🔍 Learn about WLC
            </Text>
          </TouchableOpacity>
          <Text style={[styles.subtitle, isSmallScreen && styles.subtitleSmall]}>
            Manage Your Crypto Assets & Stay Updated
          </Text>
          <Text style={[styles.balance, isSmallScreen && styles.balanceSmall]}>
            💰 Balance: {formatMoney(balance)}
          </Text>
        </View>

        <View style={[styles.tabContainer, isSmallScreen && styles.tabContainerSmall]}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'trading' && styles.activeTab, isSmallScreen && styles.tabSmall]}
            onPress={() => setActiveTab('trading')}
          >
            <TrendingUp size={isSmallScreen ? 16 : 20} color={activeTab === 'trading' ? Colors.primary[600] : Colors.neutral[400]} />
            <Text style={[styles.tabText, activeTab === 'trading' && styles.activeTabText, isSmallScreen && styles.tabTextSmall]}>
              Trading
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'news' && styles.activeTab, isSmallScreen && styles.tabSmall]}
            onPress={() => setActiveTab('news')}
          >
            <Newspaper size={isSmallScreen ? 16 : 20} color={activeTab === 'news' ? Colors.primary[600] : Colors.neutral[400]} />
            <Text style={[styles.tabText, activeTab === 'news' && styles.activeTabText, isSmallScreen && styles.tabTextSmall]}>
              News
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'stocks' && styles.activeTab, isSmallScreen && styles.tabSmall]}
            onPress={() => setActiveTab('stocks')}
          >
            <ArrowUpRight size={isSmallScreen ? 16 : 20} color={activeTab === 'stocks' ? Colors.primary[600] : Colors.neutral[400]} />
            <Text style={[styles.tabText, activeTab === 'stocks' && styles.activeTabText, isSmallScreen && styles.tabTextSmall]}>
              Stocks
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'trading' ? (
          <View style={styles.section}>
            {news.length > 0 && (
              <View style={[styles.trendingBanner, isSmallScreen && styles.trendingBannerSmall]}>
                <TrendingUp size={isSmallScreen ? 20 : 24} color={Colors.warning[600]} style={styles.trendingIcon} />
                <Text style={[styles.trendingText, isSmallScreen && styles.trendingTextSmall]}>
                  Trending: {news[news.length - 1].coin} {news[news.length - 1].impact > 0 ? '+' : ''}{news[news.length - 1].impact}% 🚀
                </Text>
              </View>
            )}

            <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>💱 Available Tokens</Text>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={[styles.categoryScroll, isSmallScreen && styles.categoryScrollSmall]}
            >
              {['All', 'Meme', 'Stable', 'Utility', 'Meta', 'Layer1', 'DEX', 'GameFi'].map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.categoryButtonActive,
                    isSmallScreen && styles.categoryButtonSmall
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    selectedCategory === category && styles.categoryButtonTextActive,
                    isSmallScreen && styles.categoryButtonTextSmall
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {!isSmallScreen && (
              <View style={styles.headerRow}>
                <Text style={styles.headerText}>Name</Text>
                <Text style={styles.headerText}>Symbol</Text>
                <Text style={styles.headerText}>Price</Text>
                <Text style={styles.headerText}>24h</Text>
                <Text style={styles.headerText}>Volume</Text>
                <Text style={styles.headerText}>Chart</Text>
              </View>
            )}
            
            <View style={styles.coinList}>
              {marketPrices
                .filter(coin => selectedCategory === 'All' || coin.category === selectedCategory)
                .sort((a, b) => b.price - a.price)
                .map((coin, idx) => (
                  <CoinCard
                    key={coin.id}
                    coin={{
                      id: String(coin.id ?? ''),
                      name: coin.name,
                      emoji: coin.emoji ?? '🪙',
                      price: coin.price,
                      change: coin.change,
                      ticker: coin.ticker ?? coin.id ?? '',
                      current_price: coin.current_price ?? coin.price,
                      high_24h: coin.high24h,
                      low_24h: coin.low24h,
                      total_volume: coin.total_volume,
                      price_change_percentage_24h: coin.priceChangePercentage24h ?? coin.change,
                    }}
                    index={idx}
                  />
                ))}
            </View>
          </View>
        ) : activeTab === 'news' ? (
          <View style={styles.newsList}>
            {news.length > 0 ? (
              news.map(item => <NewsCard key={item.id} item={item} />)
            ) : (
              <View style={[styles.emptyNews, isSmallScreen && styles.emptyNewsSmall]}>
                <Text style={[styles.emptyNewsText, isSmallScreen && styles.emptyNewsTextSmall]}>
                  No market news yet.
                </Text>
                <Text style={[styles.emptyNewsSubtext, isSmallScreen && styles.emptyNewsSubtextSmall]}>
                  Make some trades to generate news!
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>📊 Market Stocks</Text>
            
            {!isSmallScreen && (
              <View style={styles.headerRow}>
                <Text style={styles.headerText}>Name</Text>
                <Text style={styles.headerText}>Symbol</Text>
                <Text style={styles.headerText}>Price</Text>
                <Text style={styles.headerText}>24h</Text>
                <Text style={styles.headerText}>Volume</Text>
                <Text style={styles.headerText}>Chart</Text>
              </View>
            )}
            
            <View style={styles.coinList}>
              {companyShares && companyShares.length > 0 ? (
                companyShares.map((share, idx) => (
                  <CoinCard
                    key={share.id}
                    coin={{
                      id: String(share.id ?? ''),
                      name: share.name,
                      ticker: share.ticker ?? '',
                      emoji: share.emoji ?? '🏢',
                      price: share.price,
                      change: share.change,
                      current_price: share.current_price ?? share.price,
                      high_24h: share.high24h,
                      low_24h: share.low24h,
                      total_volume: share.total_volume,
                      price_change_percentage_24h: share.priceChangePercentage24h ?? share.change,
                    }}
                    index={idx}
                  />
                ))
              ) : (
                <Text style={[styles.emptyText, isSmallScreen && styles.emptyTextSmall]}>
                  {companyShares ? 'No stock data available.' : 'Loading stock data...'}
                </Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Detailed Chart Modal */}
      <Modal
        visible={!!showDetailedChart}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowDetailedChart(null)}
      >
        {showDetailedChart && (
          <View style={styles.chartModalContainer}>
            <View style={styles.chartModalHeader}>
              <Text style={styles.chartModalTitle}>
                {showDetailedChart} Analysis
              </Text>
              <TouchableOpacity
                style={styles.chartModalCloseButton}
                onPress={() => setShowDetailedChart(null)}
              >
                <Text style={styles.chartModalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.chartModalContent}>
              {(() => {
                const coin = [...marketPrices, ...companyShares].find(c => c.name === showDetailedChart);
                if (!coin) return null;
                
                return (
                  <DetailedChart
                    data={generatePriceHistory(coin.price, chartTimeRange)}
                    title={coin.name}
                    timeRange={chartTimeRange}
                    onTimeRangeChange={setChartTimeRange}
                    currentPrice={coin.price}
                    change={coin.change}
                    volume={coin.total_volume || Math.floor(Math.random() * 1000000)}
                    marketCap={Math.floor(coin.price * 1000000)}
                    high24h={coin.high24h || coin.price * 1.05}
                    low24h={coin.low24h || coin.price * 0.95}
                    showVolume={true}
                    showIndicators={true}
                  />
                );
              })()}
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* Trade Modal */}
      <Modal
        visible={!!selectedCoin}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedCoin(null)}
      >
        {selectedCoin && (
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, isSmallScreen && styles.modalContentSmall]}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <Text style={[styles.modalEmoji, isSmallScreen && styles.modalEmojiSmall]}>
                    {selectedCoin.emoji || '🪙'}
                  </Text>
                  <Text style={[styles.modalTitle, isSmallScreen && styles.modalTitleSmall]}>
                    {selectedCoin.name}
                  </Text>
                  <Text style={[styles.modalTicker, isSmallScreen && styles.modalTickerSmall]}>
                    ({selectedCoin.ticker ? selectedCoin.ticker.toUpperCase() : ''})
                  </Text>
                </View>
              </View>

              <View style={[styles.modalStatsCard, isSmallScreen && styles.modalStatsCardSmall]}>
                <Text style={[styles.modalPrice, isSmallScreen && styles.modalPriceSmall]}>
                  ${selectedCoin.price.toFixed(2)}
                </Text>
                
                <View style={[styles.modalStatsRow, isSmallScreen && styles.modalStatsRowSmall]}>
                  <View style={styles.modalStatItem}>
                    <Text style={[styles.modalStatLabel, isSmallScreen && styles.modalStatLabelSmall]}>
                      24h High
                    </Text>
                    <Text style={[styles.modalStatValue, styles.modalStatValuePositive, isSmallScreen && styles.modalStatValueSmall]}>
                      {selectedCoin.high_24h !== undefined ? `$${selectedCoin.high_24h}` : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Text style={[styles.modalStatLabel, isSmallScreen && styles.modalStatLabelSmall]}>
                      24h Low
                    </Text>
                    <Text style={[styles.modalStatValue, styles.modalStatValueNegative, isSmallScreen && styles.modalStatValueSmall]}>
                      {selectedCoin.low_24h !== undefined ? `$${selectedCoin.low_24h}` : 'N/A'}
                    </Text>
                  </View>
                </View>

                <View style={[styles.modalStatsRow, isSmallScreen && styles.modalStatsRowSmall]}>
                  <View style={styles.modalStatItem}>
                    <Text style={[styles.modalStatLabel, isSmallScreen && styles.modalStatLabelSmall]}>
                      24h Volume
                    </Text>
                    <Text style={[styles.modalStatValue, isSmallScreen && styles.modalStatValueSmall]}>
                      {selectedCoin.total_volume !== undefined ? selectedCoin.total_volume.toLocaleString() : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Text style={[styles.modalStatLabel, isSmallScreen && styles.modalStatLabelSmall]}>
                      24h Change
                    </Text>
                    <Text style={[
                      styles.modalStatValue,
                      selectedCoin.change >= 0 ? styles.modalStatValuePositive : styles.modalStatValueNegative,
                      isSmallScreen && styles.modalStatValueSmall
                    ]}>
                      {selectedCoin.change >= 0 ? '+' : ''}{selectedCoin.change}%
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.viewChartButton, isSmallScreen && styles.viewChartButtonSmall]}
                  onPress={() => {
                    setSelectedCoin(null);
                    setShowDetailedChart(selectedCoin.name);
                  }}
                >
                  <Text style={[styles.viewChartButtonText, isSmallScreen && styles.viewChartButtonTextSmall]}>
                    📊 View Detailed Chart
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}>
                <Text style={[styles.inputLabel, isSmallScreen && styles.inputLabelSmall]}>Quantity</Text>
                <TextInput
                  style={[styles.input, isSmallScreen && styles.inputSmall]}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  placeholder="Enter amount"
                />
                {selectedCoin && quantity.trim() !== '' && !isNaN(parseFloat(quantity)) && (
                  <Text style={[styles.totalCostText, isSmallScreen && styles.totalCostTextSmall]}>
                    Total Cost: {formatMoney(selectedCoin.price * parseFloat(quantity))}
                  </Text>
                )}
              </View>

              {error && (
                <Text style={[styles.errorText, isSmallScreen && styles.errorTextSmall]}>{error}</Text>
              )}

              <View style={[styles.buttonRow, isSmallScreen && styles.buttonRowSmall]}>
                <TouchableOpacity
                  style={[styles.buyButton, isSmallScreen && styles.tradeButtonSmall]}
                  onPress={() => handleTrade('buy')}
                >
                  <Text style={[styles.tradeButtonText, isSmallScreen && styles.tradeButtonTextSmall]}>
                    💸 Buy
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sellButton,
                    isSmallScreen && styles.tradeButtonSmall,
                    getPortfolioQuantity(selectedCoin.name) === 0 && styles.disabledButton
                  ]}
                  onPress={() => handleTrade('sell')}
                  disabled={getPortfolioQuantity(selectedCoin.name) === 0}
                >
                  <Text style={[styles.tradeButtonText, isSmallScreen && styles.tradeButtonTextSmall]}>
                    📉 Sell
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.modalSummaryRow, isSmallScreen && styles.modalSummaryRowSmall]}>
                <View style={styles.modalSummaryItem}>
                  <Text style={[styles.modalSummaryLabel, isSmallScreen && styles.modalSummaryLabelSmall]}>
                    Portfolio Holdings
                  </Text>
                  <Text style={[styles.modalSummaryValue, isSmallScreen && styles.modalSummaryValueSmall]}>
                    {getPortfolioQuantity(selectedCoin.name)}
                  </Text>
                </View>
                <View style={styles.modalSummaryItem}>
                  <Text style={[styles.modalSummaryLabel, isSmallScreen && styles.modalSummaryLabelSmall]}>
                    Your Balance
                  </Text>
                  <Text style={[styles.modalSummaryValue, isSmallScreen && styles.modalSummaryValueSmall]}>
                    {formatMoney(balance)}
                  </Text>
                </View>
                <View style={styles.modalSummaryItem}>
                  <Text style={[styles.modalSummaryLabel, isSmallScreen && styles.modalSummaryLabelSmall]}>
                    Last Update
                  </Text>
                  <Text style={[styles.modalSummaryTime, isSmallScreen && styles.modalSummaryTimeSmall]}>
                    {new Date().toLocaleTimeString()}
                  </Text>
                </View>
              </View>

              <GameButton
                title="Cancel"
                onPress={() => setSelectedCoin(null)}
                style={[styles.cancelButton, isSmallScreen && styles.cancelButtonSmall]}
                textStyle={[styles.cancelButtonText, isSmallScreen && styles.cancelButtonTextSmall]}
              />
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
          <View style={[styles.wlcModalContent, isSmallScreen && styles.wlcModalContentSmall]}>
            <Text style={[styles.wlcModalTitle, isSmallScreen && styles.wlcModalTitleSmall]}>
              🚀 Wallnance Coin (WLC)
            </Text>
            <Text style={[styles.wlcModalSubtitle, isSmallScreen && styles.wlcModalSubtitleSmall]}>
              Version 1.0 • June 2025
            </Text>
            
            <ScrollView style={styles.wlcModalScroll} showsVerticalScrollIndicator={false}>
              <Text style={[styles.wlcModalDescription, isSmallScreen && styles.wlcModalDescriptionSmall]}>
                🪙 <Text style={{ fontWeight: 'bold' }}>WLC (Wallnance Coin)</Text> is the official digital currency of Wallnance Tycoon — designed to power in-game transactions and reward strategic players.
              </Text>
              <Text style={[styles.wlcModalDescription, isSmallScreen && styles.wlcModalDescriptionSmall]}>
                🔒 <Text style={{ fontWeight: 'bold' }}>Fixed Supply:</Text> 5,000,000 WLC — non-mintable and deflationary, with burn mechanisms applied on premium purchases and upgrades.
              </Text>
              <Text style={[styles.wlcModalDescription, isSmallScreen && styles.wlcModalDescriptionSmall]}>
                🎁 <Text style={{ fontWeight: 'bold' }}>Distribution:</Text> 70% Player Rewards • 20% Game Treasury • 10% Developer Reserve.
              </Text>
              <Text style={[styles.wlcModalDescription, isSmallScreen && styles.wlcModalDescriptionSmall]}>
                🧠 <Text style={{ fontWeight: 'bold' }}>Utility:</Text> WLC can be used to access premium features, unlock game expansions, and participate in exclusive events and community governance.
              </Text>
              <Text style={[styles.wlcModalDescription, isSmallScreen && styles.wlcModalDescriptionSmall]}>
                🚀 <Text style={{ fontWeight: 'bold' }}>Early Access Bonus:</Text> Players who join early receive 1,000 WLC to kickstart their journey.
              </Text>
              <Text style={[styles.wlcModalDescription, isSmallScreen && styles.wlcModalDescriptionSmall]}>
                🏗️ <Text style={{ fontWeight: 'bold' }}>Built by KANEDEV</Text> — Empowering gamers with true economic simulation.
              </Text>
            </ScrollView>
            
            <GameButton
              title="Close"
              onPress={() => setShowWLCModal(false)}
              style={[styles.cancelButton, isSmallScreen && styles.cancelButtonSmall]}
              textStyle={[styles.cancelButtonText, isSmallScreen && styles.cancelButtonTextSmall]}
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
    paddingBottom: Layout.spacing.xxl,
  },
  header: {
    marginBottom: Layout.spacing.xl,
    marginTop: Layout.spacing.xl,
  },
  headerSmall: {
    marginBottom: Layout.spacing.lg,
    marginTop: Layout.spacing.lg,
  },
  title: {
    fontFamily: 'Nunito-Bold',
    fontSize: 32,
    color: Colors.primary[700],
    marginBottom: Layout.spacing.xs,
  },
  titleSmall: {
    fontSize: 24,
  },
  wlcButton: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary[50],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: Layout.spacing.sm,
  },
  wlcButtonSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  wlcButtonText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: Colors.primary[600],
  },
  wlcButtonTextSmall: {
    fontSize: 12,
  },
  subtitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: 18,
    color: Colors.neutral[600],
  },
  subtitleSmall: {
    fontSize: 14,
  },
  balance: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: Colors.primary[600],
    marginTop: Layout.spacing.md,
  },
  balanceSmall: {
    fontSize: 16,
    marginTop: Layout.spacing.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.xs,
    marginBottom: Layout.spacing.lg,
    ...Layout.shadows.small,
  },
  tabContainerSmall: {
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.xs / 2,
    marginBottom: Layout.spacing.md,
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
  tabSmall: {
    paddingVertical: Layout.spacing.sm,
    gap: Layout.spacing.xs,
  },
  activeTab: {
    backgroundColor: Colors.primary[50],
  },
  tabText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: Colors.neutral[400],
  },
  tabTextSmall: {
    fontSize: 12,
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
  trendingBannerSmall: {
    padding: Layout.spacing.sm,
    marginBottom: Layout.spacing.lg,
  },
  trendingIcon: {
    marginRight: Layout.spacing.sm,
  },
  trendingText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.warning[700],
    flex: 1,
  },
  trendingTextSmall: {
    fontSize: 12,
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
  sectionTitleSmall: {
    fontSize: 16,
    marginBottom: Layout.spacing.sm,
  },
  categoryScroll: {
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  categoryScrollSmall: {
    marginVertical: 8,
    paddingHorizontal: 8,
  },
  categoryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: Colors.neutral[200],
    marginRight: 8,
  },
  categoryButtonSmall: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginRight: 6,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary[600],
  },
  categoryButtonText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: Colors.neutral[800],
  },
  categoryButtonTextSmall: {
    fontSize: 12,
  },
  categoryButtonTextActive: {
    color: Colors.primary[50],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: 4,
  },
  headerText: {
    flex: 1,
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  coinList: {
    gap: Layout.spacing.md,
  },
  coinCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderColor: Colors.neutral[200],
    ...Layout.shadows.small,
  },
  coinCardSmall: {
    borderRadius: 8,
    marginBottom: 6,
  },
  coinCardContent: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  coinCardContentSmall: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  coinCardContentLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coinHeaderMobile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  coinInfoMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  coinNameContainer: {
    marginLeft: 8,
  },
  coinNameMobile: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: Colors.neutral[900],
  },
  coinTickerMobile: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: Colors.neutral[600],
    marginTop: 2,
  },
  coinPriceMobile: {
    alignItems: 'flex-end',
  },
  priceTextMobile: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: Colors.neutral[800],
  },
  changeTextMobile: {
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
    marginTop: 2,
  },
  coinFooterMobile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  volumeTextMobile: {
    fontFamily: 'Nunito-Regular',
    fontSize: 11,
    color: Colors.neutral[600],
  },
  chartButtonMobile: {
    backgroundColor: Colors.primary[100],
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chartButtonText: {
    fontSize: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  coinEmoji: {
    fontSize: 22,
    marginRight: 8,
  },
  coinNameSection: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinName: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.neutral[900],
  },
  coinTickerSection: {
    flex: 1,
    alignItems: 'center',
  },
  coinTicker: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: Colors.neutral[600],
  },
  coinPriceSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  priceText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: Colors.neutral[800],
  },
  coinChangeSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  changeText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
  },
  coinVolumeSection: {
    flex:  1,
    alignItems: 'flex-end',
  },
  volumeText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 13,
    color: Colors.neutral[600],
  },
  coinActionsSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  chartButton: {
    backgroundColor: Colors.primary[100],
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  newsCardSmall: {
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.sm,
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
  newsEmojiSmall: {
    fontSize: 20,
  },
  newsCoin: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.primary[600],
  },
  newsCoinSmall: {
    fontSize: 14,
  },
  newsTimestamp: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: Colors.neutral[500],
  },
  newsTimestampSmall: {
    fontSize: 10,
  },
  newsHeadline: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: Layout.spacing.xs,
  },
  newsHeadlineSmall: {
    fontSize: 14,
    lineHeight: 18,
  },
  newsImpact: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
  },
  newsImpactSmall: {
    fontSize: 12,
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
  emptyNewsSmall: {
    padding: Layout.spacing.lg,
  },
  emptyNewsText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: Colors.neutral[600],
    marginBottom: Layout.spacing.xs,
  },
  emptyNewsTextSmall: {
    fontSize: 16,
  },
  emptyNewsSubtext: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.neutral[500],
  },
  emptyNewsSubtextSmall: {
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.neutral[500],
    marginTop: 12,
    fontSize: 14,
  },
  emptyTextSmall: {
    fontSize: 12,
  },
  coinFlipContainer: {
    position: 'absolute',
    top: '40%',
    left: '45%',
    zIndex: 10,
  },
  coinFlipAnimation: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  coinFlipText: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
  },
  chartModalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  chartModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  chartModalTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: Colors.primary[700],
  },
  chartModalCloseButton: {
    backgroundColor: Colors.neutral[200],
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartModalCloseText: {
    fontSize: 18,
    color: Colors.neutral[600],
  },
  chartModalContent: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: Layout.spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.lg,
    width: '90%',
    maxWidth: 500,
    padding: Layout.spacing.xl,
    ...Layout.shadows.medium,
    maxHeight: '90%',
  },
  modalContentSmall: {
    width: '95%',
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.md,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  modalEmoji: {
    fontSize: 32,
  },
  modalEmojiSmall: {
    fontSize: 24,
  },
  modalTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 22,
    color: Colors.primary[700],
  },
  modalTitleSmall: {
    fontSize: 18,
  },
  modalTicker: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: Colors.neutral[600],
  },
  modalTickerSmall: {
    fontSize: 14,
  },
  modalStatsCard: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    ...Layout.shadows.small,
    alignItems: 'center',
  },
  modalStatsCardSmall: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
  },
  modalPrice: {
    fontFamily: 'Nunito-Bold',
    fontSize: 26,
    color: Colors.primary[500],
    marginBottom: 6,
    textAlign: 'center',
  },
  modalPriceSmall: {
    fontSize: 20,
    marginBottom: 4,
  },
  modalStatsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    gap: 22,
  },
  modalStatsRowSmall: {
    gap: 16,
    marginBottom: 2,
  },
  modalStatItem: {
    alignItems: 'center',
  },
  modalStatLabel: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: Colors.neutral[700],
    textAlign: 'center',
  },
  modalStatLabelSmall: {
    fontSize: 11,
  },
  modalStatValue: {
    fontFamily: 'Nunito-Bold',
    fontSize: 15,
    textAlign: 'center',
  },
  modalStatValueSmall: {
    fontSize: 13,
  },
  modalStatValuePositive: {
    color: Colors.success[600],
  },
  modalStatValueNegative: {
    color: Colors.error[600],
  },
  viewChartButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  viewChartButtonSmall: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  viewChartButtonText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
  },
  viewChartButtonTextSmall: {
    fontSize: 12,
  },
  inputContainer: {
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  inputContainerSmall: {
    gap: Layout.spacing.xs,
    marginBottom: Layout.spacing.sm,
  },
  inputLabel: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: Colors.neutral[600],
  },
  inputLabelSmall: {
    fontSize: 14,
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
  inputSmall: {
    padding: Layout.spacing.sm,
    fontSize: 16,
    borderRadius: Layout.borderRadius.sm,
  },
  totalCostText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: Colors.neutral[700],
    textAlign: 'center',
    marginVertical: Layout.spacing.sm,
  },
  totalCostTextSmall: {
    fontSize: 14,
    marginVertical: Layout.spacing.xs,
  },
  errorText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.error[600],
    textAlign: 'center',
    marginBottom: Layout.spacing.md,
  },
  errorTextSmall: {
    fontSize: 12,
    marginBottom: Layout.spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  buttonRowSmall: {
    marginTop: 8,
    gap: 6,
  },
  buyButton: {
    flex: 1,
    backgroundColor: Colors.success[500],
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sellButton: {
    flex: 1,
    backgroundColor: Colors.error[500],
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tradeButtonSmall: {
    paddingVertical: 10,
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  tradeButtonText: {
    color: '#fff',
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    textAlign: 'center',
  },
  tradeButtonTextSmall: {
    fontSize: 14,
  },
  modalSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 2,
    backgroundColor: Colors.neutral[50],
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    gap: 6,
  },
  modalSummaryRowSmall: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 6,
    gap: 4,
  },
  modalSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  modalSummaryLabel: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  modalSummaryLabelSmall: {
    fontSize: 11,
  },
  modalSummaryValue: {
    fontFamily: 'Nunito-Bold',
    fontSize: 15,
    color: Colors.primary[700],
    textAlign: 'center',
  },
  modalSummaryValueSmall: {
    fontSize: 13,
  },
  modalSummaryTime: {
    fontFamily: 'Nunito-Bold',
    fontSize: 13,
    color: Colors.neutral[500],
    textAlign: 'center',
  },
  modalSummaryTimeSmall: {
    fontSize: 11,
  },
  cancelButton: {
    backgroundColor: Colors.neutral[300],
    borderRadius: Layout.borderRadius.md,
    paddingVertical: Layout.spacing.sm,
    marginTop: Layout.spacing.md,
  },
  cancelButtonSmall: {
    paddingVertical: Layout.spacing.xs,
    marginTop: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.sm,
  },
  cancelButtonText: {
    color: Colors.neutral[700],
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Nunito-Bold',
  },
  cancelButtonTextSmall: {
    fontSize: 14,
  },
  wlcModalContent: {
    backgroundColor: '#16213e',
    borderRadius: Layout.borderRadius.lg,
    width: '90%',
    maxWidth: 500,
    padding: Layout.spacing.xl,
    gap: Layout.spacing.md,
    borderWidth: 1.5,
    borderColor: '#38bdf8',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    maxHeight: '80%',
  },
  wlcModalContentSmall: {
    width: '95%',
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.md,
    maxHeight: '85%',
  },
  wlcModalTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 22,
    color: '#f8fafc',
    textAlign: 'center',
  },
  wlcModalTitleSmall: {
    fontSize: 18,
  },
  wlcModalSubtitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: Layout.spacing.sm,
    letterSpacing: 0.4,
  },
  wlcModalSubtitleSmall: {
    fontSize: 14,
  },
  wlcModalScroll: {
    maxHeight: 300,
  },
  wlcModalDescription: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: Layout.spacing.sm,
    letterSpacing: 0.1,
  },
  wlcModalDescriptionSmall: {
    fontSize: 12,
    lineHeight: 18,
  },
});