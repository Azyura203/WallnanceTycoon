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
  const [activeTab, setActiveTab] = useState<'trading' | 'news' | 'stocks'>('trading');
  const [error, setError] = useState<string | null>(null);
  const [showCoinFlip, setShowCoinFlip] = useState(false);
  const [showWLCModal, setShowWLCModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { news, generateNews } = useMarketNews();
  const { balance, portfolio, buyCoin, sellCoin } = usePlayerFinances();

  const marketPrices = useMarketPrices();
  const companyShares = useCompanyShares();

  const { width } = useWindowDimensions();
  const isWide = width >= 600;
  const isSmallScreen = width < 400;

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
    return (
      <Pressable
        onPress={() => handleCoinPress(coin)}
        style={[
          styles.coinCardBase,
          isWide ? styles.coinCardWide : styles.coinCardNarrow,
          { backgroundColor: Colors.card },
          isSmallScreen && styles.coinCardSmall
        ]}
      >
        {isWide ? (
          <>
            {/* Name Column - Enhanced with better spacing */}
            <View style={styles.nameColumn}>
              <View style={styles.statusIndicator}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: coin.change >= 0 ? Colors.success[500] : Colors.error[500] }
                ]} />
              </View>
              <Text style={[styles.coinEmoji, isSmallScreen && styles.coinEmojiSmall]}>
                {coin.emoji}
              </Text>
              <View style={styles.coinNameContainer}>
                <Text style={[styles.coinName, isSmallScreen && styles.coinNameSmall]}>
                  {coin.name}
                </Text>
              </View>
            </View>

            {/* Symbol Column - Centered */}
            <View style={styles.symbolColumn}>
              <Text style={[styles.symbolText, isSmallScreen && styles.symbolTextSmall]}>
                {coin.ticker ? coin.ticker.toUpperCase() : coin.id?.slice(0, 4).toUpperCase() || 'N/A'}
              </Text>
            </View>

            {/* Price Column - Centered */}
            <View style={styles.priceColumn}>
              <Text style={[styles.priceText, isSmallScreen && styles.priceTextSmall]}>
                ${coin.price.toFixed(2)}
              </Text>
            </View>

            {/* 24h Change Column - Centered */}
            <View style={styles.changeColumn}>
              <View style={[
                styles.changeContainer,
                { backgroundColor: coin.change >= 0 ? Colors.success[100] : Colors.error[100] }
              ]}>
                <Text style={[
                  styles.changeText,
                  { color: coin.change >= 0 ? Colors.success[700] : Colors.error[700] },
                  isSmallScreen && styles.changeTextSmall
                ]}>
                  {coin.change >= 0 ? '+' : ''}{coin.change.toFixed(2)}%
                </Text>
              </View>
            </View>

            {/* Volume Column - Centered */}
            <View style={styles.volumeColumn}>
              <Text style={[styles.volumeText, isSmallScreen && styles.volumeTextSmall]}>
                {formatMoney(coin.price * 10000)}
              </Text>
            </View>
          </>
        ) : (
          <>
            {/* Mobile Layout - Enhanced */}
            <View style={styles.mobileHeader}>
              <View style={[
                styles.statusDot,
                { backgroundColor: coin.change >= 0 ? Colors.success[500] : Colors.error[500] }
              ]} />
              <Text style={[styles.coinEmoji, isSmallScreen && styles.coinEmojiSmall]}>
                {coin.emoji}
              </Text>
              <View style={styles.mobileNameContainer}>
                <Text style={[styles.coinName, isSmallScreen && styles.coinNameSmall]}>
                  {coin.name}
                </Text>
                <Text style={[styles.mobileSymbol, isSmallScreen && styles.mobileSymbolSmall]}>
                  {coin.ticker ? coin.ticker.toUpperCase() : coin.id?.slice(0, 4).toUpperCase() || 'N/A'}
                </Text>
              </View>
            </View>
            
            <View style={styles.mobileDetails}>
              <View style={styles.mobileRow}>
                <Text style={[styles.priceText, isSmallScreen && styles.priceTextSmall]}>
                  ${coin.price.toFixed(2)}
                </Text>
                <Text style={[styles.volumeText, isSmallScreen && styles.volumeTextSmall]}>
                  {formatMoney(coin.price * 10000)}
                </Text>
              </View>
              <View style={styles.mobileRow}>
                <View style={[
                  styles.changeContainer,
                  { backgroundColor: coin.change >= 0 ? Colors.success[100] : Colors.error[100] }
                ]}>
                  <Text style={[
                    styles.changeText,
                    { color: coin.change >= 0 ? Colors.success[700] : Colors.error[700] },
                    isSmallScreen && styles.changeTextSmall
                  ]}>
                    {coin.change >= 0 ? '+' : ''}{coin.change.toFixed(2)}%
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
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
            <Text style={[styles.newsEmoji, isSmallScreen && styles.newsEmojiSmall]}>
              {item.emoji}
            </Text>
            <Text style={[styles.newsCoin, isSmallScreen && styles.newsCoinSmall]}>
              {item.coin}
            </Text>
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
          <TouchableOpacity style={styles.wlcButton} onPress={() => setShowWLCModal(true)}>
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
            style={[styles.tab, activeTab === 'trading' && styles.activeTab]}
            onPress={() => setActiveTab('trading')}
          >
            <TrendingUp size={isSmallScreen ? 16 : 20} color={activeTab === 'trading' ? Colors.primary[600] : Colors.neutral[400]} />
            <Text style={[styles.tabText, activeTab === 'trading' && styles.activeTabText, isSmallScreen && styles.tabTextSmall]}>
              Trading
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'news' && styles.activeTab]}
            onPress={() => setActiveTab('news')}
          >
            <Newspaper size={isSmallScreen ? 16 : 20} color={activeTab === 'news' ? Colors.primary[600] : Colors.neutral[400]} />
            <Text style={[styles.tabText, activeTab === 'news' && styles.activeTabText, isSmallScreen && styles.tabTextSmall]}>
              News
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'stocks' && styles.activeTab]}
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

            <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>
              💱 Available Tokens
            </Text>

            {/* Category Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
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

            {/* Enhanced Table Header - Only show on wide screens */}
            {isWide && (
              <View style={styles.tableHeader}>
                <View style={styles.nameColumn}>
                  <Text style={[styles.headerText, isSmallScreen && styles.headerTextSmall]}>Name</Text>
                </View>
                <View style={styles.symbolColumn}>
                  <Text style={[styles.headerText, isSmallScreen && styles.headerTextSmall]}>Symbol</Text>
                </View>
                <View style={styles.priceColumn}>
                  <Text style={[styles.headerText, isSmallScreen && styles.headerTextSmall]}>Price</Text>
                </View>
                <View style={styles.changeColumn}>
                  <Text style={[styles.headerText, isSmallScreen && styles.headerTextSmall]}>24h Change</Text>
                </View>
                <View style={styles.volumeColumn}>
                  <Text style={[styles.headerText, isSmallScreen && styles.headerTextSmall]}>Volume</Text>
                </View>
              </View>
            )}
            
            {/* Mobile Header */}
            {!isWide && (
              <View style={styles.mobileTableHeader}>
                <Text style={[styles.headerText, isSmallScreen && styles.headerTextSmall]}>Tokens</Text>
                <Text style={[styles.headerText, isSmallScreen && styles.headerTextSmall]}>Market Cap</Text>
              </View>
            )}
            
            <View style={styles.coinList}>
              {(() => {
                const filteredTokens = marketPrices.filter(
                  coin => selectedCategory === 'All' || (coin.category === selectedCategory)
                );
                return filteredTokens
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
                  ));
              })()}
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
            <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>
              📊 Market Stocks
            </Text>
            
            {/* Stock Table Header */}
            {isWide && (
              <View style={styles.tableHeader}>
                <View style={styles.nameColumn}>
                  <Text style={[styles.headerText, isSmallScreen && styles.headerTextSmall]}>Name</Text>
                </View>
                <View style={styles.symbolColumn}>
                  <Text style={[styles.headerText, isSmallScreen && styles.headerTextSmall]}>Symbol</Text>
                </View>
                <View style={styles.priceColumn}>
                  <Text style={[styles.headerText, isSmallScreen && styles.headerTextSmall]}>Price</Text>
                </View>
                <View style={styles.changeColumn}>
                  <Text style={[styles.headerText, isSmallScreen && styles.headerTextSmall]}>24h Change</Text>
                </View>
                <View style={styles.volumeColumn}>
                  <Text style={[styles.headerText, isSmallScreen && styles.headerTextSmall]}>Volume</Text>
                </View>
              </View>
            )}
            
            {!isWide && (
              <View style={styles.mobileTableHeader}>
                <Text style={[styles.headerText, isSmallScreen && styles.headerTextSmall]}>Stocks</Text>
                <Text style={[styles.headerText, isSmallScreen && styles.headerTextSmall]}>Market Cap</Text>
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
              ) : companyShares ? (
                <Text style={[styles.noDataText, isSmallScreen && styles.noDataTextSmall]}>
                  No stock data available.
                </Text>
              ) : (
                <Text style={[styles.loadingText, isSmallScreen && styles.loadingTextSmall]}>
                  Loading stock data...
                </Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>

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
                <View style={styles.modalTokenInfo}>
                  <Text style={[styles.modalEmoji, isSmallScreen && styles.modalEmojiSmall]}>
                    {selectedCoin.emoji || '🪙'}
                  </Text>
                  <Text style={[styles.modalTokenName, isSmallScreen && styles.modalTokenNameSmall]}>
                    {selectedCoin.name}
                  </Text>
                  <Text style={[styles.modalTokenSymbol, isSmallScreen && styles.modalTokenSymbolSmall]}>
                    ({selectedCoin.ticker ? selectedCoin.ticker.toUpperCase() : ''})
                  </Text>
                </View>
              </View>
              
              <View style={[styles.modalStatsCard, isSmallScreen && styles.modalStatsCardSmall]}>
                <Text style={[styles.modalPrice, isSmallScreen && styles.modalPriceSmall]}>
                  ${selectedCoin.price.toFixed(2)}
                </Text>
                
                <View style={[styles.modalStatsGrid, isSmallScreen && styles.modalStatsGridSmall]}>
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
                
                <View style={[styles.modalChartPlaceholder, isSmallScreen && styles.modalChartPlaceholderSmall]}>
                  <Text style={[styles.modalChartText, isSmallScreen && styles.modalChartTextSmall]}>
                    [Chart coming soon]
                  </Text>
                </View>
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
              
              <View style={[styles.modalButtonRow, isSmallScreen && styles.modalButtonRowSmall]}>
                <TouchableOpacity
                  style={[styles.modalBuyButton, isSmallScreen && styles.modalBuyButtonSmall]}
                  onPress={() => handleTrade('buy')}
                >
                  <Text style={[styles.modalButtonText, isSmallScreen && styles.modalButtonTextSmall]}>
                    💸 Buy
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalSellButton,
                    getPortfolioQuantity(selectedCoin.name) === 0 && styles.modalButtonDisabled,
                    isSmallScreen && styles.modalSellButtonSmall
                  ]}
                  onPress={() => handleTrade('sell')}
                  disabled={getPortfolioQuantity(selectedCoin.name) === 0}
                >
                  <Text style={[styles.modalButtonText, isSmallScreen && styles.modalButtonTextSmall]}>
                    📉 Sell
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={[styles.modalSummary, isSmallScreen && styles.modalSummarySmall]}>
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
                  <Text style={[styles.modalSummaryValue, isSmallScreen && styles.modalSummaryValueSmall]}>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
  activeTab: {
    backgroundColor: Colors.primary[50],
  },
  tabText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: Colors.neutral[400],
  },
  tabTextSmall: {
    fontSize: 14,
  },
  activeTabText: {
    color: Colors.primary[600],
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
    fontSize: 18,
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
  },
  trendingTextSmall: {
    fontSize: 14,
  },
  categoryScroll: {
    marginVertical: 12,
    paddingHorizontal: 16,
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
  // Enhanced table header with better styling
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary[200],
    backgroundColor: Colors.primary[50],
    borderTopLeftRadius: Layout.borderRadius.md,
    borderTopRightRadius: Layout.borderRadius.md,
    marginBottom: 2,
  },
  mobileTableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary[200],
    backgroundColor: Colors.primary[50],
    borderTopLeftRadius: Layout.borderRadius.md,
    borderTopRightRadius: Layout.borderRadius.md,
    marginBottom: 2,
  },
  headerText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: Colors.primary[700],
    textAlign: 'center',
  },
  headerTextSmall: {
    fontSize: 12,
  },
  // Enhanced column definitions with perfect centering
  nameColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 180,
    paddingRight: 8,
  },
  symbolColumn: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceColumn: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeColumn: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeColumn: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinList: {
    gap: 2,
    backgroundColor: Colors.card,
    borderBottomLeftRadius: Layout.borderRadius.md,
    borderBottomRightRadius: Layout.borderRadius.md,
    overflow: 'hidden',
    ...Layout.shadows.small,
  },
  coinCardBase: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: Colors.neutral[100],
  },
  coinCardSmall: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  coinCardWide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinCardNarrow: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  // Status indicator
  statusIndicator: {
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Coin display elements
  coinEmoji: {
    fontSize: 22,
    marginRight: 8,
  },
  coinEmojiSmall: {
    fontSize: 18,
  },
  coinNameContainer: {
    flex: 1,
  },
  coinName: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.neutral[900],
  },
  coinNameSmall: {
    fontSize: 14,
  },
  symbolText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  symbolTextSmall: {
    fontSize: 12,
  },
  priceText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: Colors.neutral[800],
    textAlign: 'center',
  },
  priceTextSmall: {
    fontSize: 12,
  },
  // Enhanced change display with background
  changeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  changeText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
    textAlign: 'center',
  },
  changeTextSmall: {
    fontSize: 10,
  },
  volumeText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 13,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  volumeTextSmall: {
    fontSize: 11,
  },
  // Mobile layout styles
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  mobileNameContainer: {
    flex: 1,
  },
  mobileSymbol: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.neutral[600],
  },
  mobileSymbolSmall: {
    fontSize: 12,
  },
  mobileDetails: {
    width: '100%',
  },
  mobileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  // News styles
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
  noDataText: {
    textAlign: 'center',
    color: Colors.neutral[500],
    marginTop: 12,
    fontSize: 14,
  },
  noDataTextSmall: {
    fontSize: 12,
  },
  loadingText: {
    textAlign: 'center',
    color: Colors.neutral[400],
    marginTop: 12,
    fontSize: 14,
  },
  loadingTextSmall: {
    fontSize: 12,
  },
  // Modal styles
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
    maxWidth: 450,
    padding: Layout.spacing.xl,
    ...Layout.shadows.large,
  },
  modalContentSmall: {
    width: '95%',
    padding: Layout.spacing.lg,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  modalTokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalEmoji: {
    fontSize: 32,
  },
  modalEmojiSmall: {
    fontSize: 28,
  },
  modalTokenName: {
    fontFamily: 'Nunito-Bold',
    fontSize: 22,
    color: Colors.primary[700],
  },
  modalTokenNameSmall: {
    fontSize: 18,
  },
  modalTokenSymbol: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: Colors.neutral[600],
  },
  modalTokenSymbolSmall: {
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
    marginBottom: 14,
  },
  modalPrice: {
    fontFamily: 'Nunito-Bold',
    fontSize: 26,
    color: Colors.primary[500],
    marginBottom: 6,
    textAlign: 'center',
  },
  modalPriceSmall: {
    fontSize: 22,
  },
  modalStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  modalStatsGridSmall: {
    gap: 8,
  },
  modalStatItem: {
    alignItems: 'center',
    minWidth: '45%',
    marginBottom: 8,
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
  modalChartPlaceholder: {
    width: '100%',
    height: 60,
    marginTop: 8,
    backgroundColor: Colors.neutral[100],
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalChartPlaceholderSmall: {
    height: 50,
  },
  modalChartText: {
    color: Colors.neutral[400],
    fontSize: 13,
    fontFamily: 'Nunito-Regular',
  },
  modalChartTextSmall: {
    fontSize: 11,
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
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  modalButtonRowSmall: {
    gap: 6,
  },
  modalBuyButton: {
    flex: 1,
    backgroundColor: Colors.success[500],
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalBuyButtonSmall: {
    paddingVertical: 12,
  },
  modalSellButton: {
    flex: 1,
    backgroundColor: Colors.error[500],
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalSellButtonSmall: {
    paddingVertical: 12,
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
  modalButtonText: {
    color: '#fff',
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    textAlign: 'center',
  },
  modalButtonTextSmall: {
    fontSize: 14,
  },
  modalSummary: {
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
  modalSummarySmall: {
    flexDirection: 'column',
    gap: 8,
    paddingVertical: 8,
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
  cancelButton: {
    backgroundColor: Colors.neutral[300],
    borderRadius: Layout.borderRadius.md,
    paddingVertical: Layout.spacing.sm,
    marginTop: Layout.spacing.md,
  },
  cancelButtonSmall: {
    paddingVertical: Layout.spacing.xs,
  },
  cancelButtonText: {
    color: Colors.neutral[700],
    fontSize: 16,
    textAlign: 'center',
  },
  cancelButtonTextSmall: {
    fontSize: 14,
  },
  // WLC Modal styles
  wlcModalContent: {
    backgroundColor: '#16213e',
    borderRadius: Layout.borderRadius.lg,
    width: '90%',
    maxWidth: 450,
    padding: Layout.spacing.xl,
    gap: Layout.spacing.md,
    borderWidth: 1.5,
    borderColor: '#38bdf8',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 10,
  },
  wlcModalContentSmall: {
    width: '95%',
    padding: Layout.spacing.lg,
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