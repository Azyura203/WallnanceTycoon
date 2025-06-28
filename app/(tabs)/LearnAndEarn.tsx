import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, useWindowDimensions } from 'react-native';
import Colors from '@/src/constants/Colors';
import Layout from '@/src/constants/Layout';
import { usePlayerFinances } from '@/src/hooks/finance/usePlayerFinances';

const tradingLessons = [
  { title: 'What is Trading?', content: 'Trading is the act of buying and selling assets to make a profit. Prices can change rapidly, so timing and strategy are key.' },
  { title: 'Bull vs Bear Markets', content: 'A bull market means prices are rising. A bear market means prices are falling. Both have opportunities for gain!' },
  { title: 'Day Trading Tips', content: 'Day trading is fast-paced. Set stop-losses, follow trends, and never invest more than you can afford to lose.' },
];

const investingLessons = [
  { title: 'What is Investing?', content: 'Investing is about holding assets long-term. It focuses on gradual growth and compounding returns.' },
  { title: 'Diversification', content: 'Don\'t put all your eggs in one basket. Spread your investments across different asset types to reduce risk.' },
  { title: 'Compounding Magic', content: 'Reinvesting your profits over time can lead to exponential growth. Patience pays off!' },
];

const tokenomicsLessons = [
  { title: 'What is Tokenomics?', content: 'Tokenomics is the science of a token\'s economy—how supply, demand, and utility shape its value.' },
  { title: 'Total Supply vs Circulating Supply', content: 'Total supply is the max a token can have. Circulating is what\'s currently in the market. Circulating supply affects price action heavily.' },
  { title: 'Burning & Inflation', content: 'Burning reduces supply (often bullish). Inflation increases supply (can be bearish). Both shape a token\'s future.' },
];

const cryptoLessons = [
  { title: 'The Birth of Crypto', content: 'In 2008, Satoshi Nakamoto introduced Bitcoin, a decentralized digital currency powered by blockchain.' },
  { title: 'Satoshi Nakamoto', content: 'The mysterious figure behind Bitcoin. Satoshi\'s vision was a financial system without intermediaries—trustless and transparent.' },
  { title: 'Genesis Block', content: 'The first block of Bitcoin was mined in 2009. It contained a hidden message referencing a bailout, symbolizing distrust in traditional banking.' },
];

export default function LearnAndEarnScreen() {
  const { balance, portfolio, buyFromMarket } = usePlayerFinances();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;
  
  const [selectedTab, setSelectedTab] = useState<'trading' | 'investing' | 'tokenomics' | 'crypto'>('trading');
  const [selectedLesson, setSelectedLesson] = useState<{ title: string, content: string } | null>(null);

  const lessons = selectedTab === 'trading'
    ? tradingLessons
    : selectedTab === 'investing'
    ? investingLessons
    : selectedTab === 'tokenomics'
    ? tokenomicsLessons
    : cryptoLessons;

  return (
    <View style={{ flex: 1, backgroundColor: '#F6F3FF' }}>
      <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
        <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>📚 Learn & Earn 💰</Text>
        <Text style={[styles.subtitle, isSmallScreen && styles.subtitleSmall]}>
          Discover the chaos of trading. Learn fast. Earn smart.
        </Text>
      </View>
      
      <View style={[styles.tipContainer, isSmallScreen && styles.tipContainerSmall]}>
        <Text style={[styles.tipTitle, isSmallScreen && styles.tipTitleSmall]}>Tip of the Day 💡</Text>
        <Text style={[styles.tipText, isSmallScreen && styles.tipTextSmall]}>
          Markets move fast. Diversify your strategy across all tabs to master the game.
        </Text>
      </View>

      <View style={[styles.tabContainer, isSmallScreen && styles.tabContainerSmall]}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'trading' && styles.activeTab, isSmallScreen && styles.tabSmall]} 
          onPress={() => setSelectedTab('trading')}
        >
          <Text style={[styles.tabText, selectedTab === 'trading' && styles.activeTabText, isSmallScreen && styles.tabTextSmall]}>
            Trading
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'investing' && styles.activeTab, isSmallScreen && styles.tabSmall]} 
          onPress={() => setSelectedTab('investing')}
        >
          <Text style={[styles.tabText, selectedTab === 'investing' && styles.activeTabText, isSmallScreen && styles.tabTextSmall]}>
            Investing
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'tokenomics' && styles.activeTab, isSmallScreen && styles.tabSmall]} 
          onPress={() => setSelectedTab('tokenomics')}
        >
          <Text style={[styles.tabText, selectedTab === 'tokenomics' && styles.activeTabText, isSmallScreen && styles.tabTextSmall]}>
            {isSmallScreen ? 'Token' : 'Tokenomics'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'crypto' && styles.activeTab, isSmallScreen && styles.tabSmall]} 
          onPress={() => setSelectedTab('crypto')}
        >
          <Text style={[styles.tabText, selectedTab === 'crypto' && styles.activeTabText, isSmallScreen && styles.tabTextSmall]}>
            Crypto 🧑‍💻
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.lessonList, isSmallScreen && styles.lessonListSmall]}>
        {lessons.map((lesson, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.lessonCard, isSmallScreen && styles.lessonCardSmall]}
            onPress={() => setSelectedLesson(lesson)}
          >
            <Text style={[styles.lessonTitle, isSmallScreen && styles.lessonTitleSmall]}>
              {lesson.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        visible={!!selectedLesson}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedLesson(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isSmallScreen && styles.modalContentSmall]}>
            <Text style={[styles.modalTitle, isSmallScreen && styles.modalTitleSmall]}>
              {selectedLesson?.title}
            </Text>
            <Text style={[styles.modalText, isSmallScreen && styles.modalTextSmall]}>
              {selectedLesson?.content}
            </Text>
            <TouchableOpacity 
              onPress={() => setSelectedLesson(null)} 
              style={[styles.closeButton, isSmallScreen && styles.closeButtonSmall]}
            >
              <Text style={[styles.closeButtonText, isSmallScreen && styles.closeButtonTextSmall]}>
                Got it!
              </Text>
            </TouchableOpacity>
            <Text style={[styles.tributeText, isSmallScreen && styles.tributeTextSmall]}>
              🚀 Tribute to Satoshi: Keep learning. The future is decentralized!
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Layout.spacing.lg,
    paddingHorizontal: Layout.spacing.md,
    paddingTop: Layout.spacing.lg,
  },
  headerSmall: {
    marginBottom: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.sm,
    paddingTop: Layout.spacing.md,
  },
  title: {
    fontFamily: 'Nunito-Bold',
    fontSize: 26,
    color: Colors.primary[800],
    textAlign: 'center',
    marginBottom: 6,
  },
  titleSmall: {
    fontSize: 20,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 15,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  subtitleSmall: {
    fontSize: 12,
  },
  tipContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#E0E7FF',
    padding: 12,
    borderRadius: 10,
  },
  tipContainerSmall: {
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 8,
    borderRadius: 8,
  },
  tipTitle: {
    fontFamily: 'Nunito-Bold',
    color: '#1E3A8A',
    fontSize: 13,
  },
  tipTitleSmall: {
    fontSize: 11,
  },
  tipText: {
    fontFamily: 'Nunito-Regular',
    color: '#1E40AF',
    fontSize: 12,
  },
  tipTextSmall: {
    fontSize: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  tabContainerSmall: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    marginHorizontal: 8,
  },
  tabSmall: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#7C3AED',
  },
  tabText: {
    fontFamily: 'Nunito-Regular',
    color: '#1E3A8A',
    textAlign: 'center',
    fontSize: 13,
  },
  tabTextSmall: {
    fontSize: 11,
  },
  activeTabText: {
    color: '#fff',
    fontFamily: 'Nunito-Bold',
  },
  lessonList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  lessonListSmall: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  lessonCard: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    flexShrink: 1,
  },
  lessonCardSmall: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  lessonTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 13,
    color: '#111827',
  },
  lessonTitleSmall: {
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '95%',
    maxWidth: 420,
    padding: 20,
    borderRadius: 12,
  },
  modalContentSmall: {
    width: '98%',
    maxWidth: 350,
    padding: 16,
    borderRadius: 10,
  },
  modalTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 17,
    marginBottom: 10,
    color: '#4B5563',
  },
  modalTitleSmall: {
    fontSize: 15,
    marginBottom: 8,
  },
  modalText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13.5,
    color: '#374151',
    lineHeight: 20,
  },
  modalTextSmall: {
    fontSize: 12,
    lineHeight: 18,
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#7C3AED',
    padding: 10,
    borderRadius: 8,
  },
  closeButtonSmall: {
    marginTop: 12,
    padding: 8,
    borderRadius: 6,
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
  },
  closeButtonTextSmall: {
    fontSize: 12,
  },
  tributeText: {
    marginTop: 12,
    textAlign: 'center',
    color: '#7C3AED',
    fontFamily: 'Nunito-Bold',
    fontSize: 13,
  },
  tributeTextSmall: {
    marginTop: 8,
    fontSize: 11,
  },
});