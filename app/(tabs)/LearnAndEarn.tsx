import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
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
  { title: 'Diversification', content: 'Don’t put all your eggs in one basket. Spread your investments across different asset types to reduce risk.' },
  { title: 'Compounding Magic', content: 'Reinvesting your profits over time can lead to exponential growth. Patience pays off!' },
];

const tokenomicsLessons = [
  { title: 'What is Tokenomics?', content: 'Tokenomics is the science of a token\'s economy—how supply, demand, and utility shape its value.' },
  { title: 'Total Supply vs Circulating Supply', content: 'Total supply is the max a token can have. Circulating is what’s currently in the market. Circulating supply affects price action heavily.' },
  { title: 'Burning & Inflation', content: 'Burning reduces supply (often bullish). Inflation increases supply (can be bearish). Both shape a token\'s future.' },
];

const cryptoLessons = [
  { title: 'The Birth of Crypto', content: 'In 2008, Satoshi Nakamoto introduced Bitcoin, a decentralized digital currency powered by blockchain.' },
  { title: 'Satoshi Nakamoto', content: 'The mysterious figure behind Bitcoin. Satoshi’s vision was a financial system without intermediaries—trustless and transparent.' },
  { title: 'Genesis Block', content: 'The first block of Bitcoin was mined in 2009. It contained a hidden message referencing a bailout, symbolizing distrust in traditional banking.' },
];

export default function LearnAndEarnScreen() {
  const { balance, portfolio, buyFromMarket } = usePlayerFinances();
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
      <View style={styles.header}>
        <Text style={styles.title}>📚 Learn & Earn 💰</Text>
        <Text style={styles.subtitle}>Discover the chaos of trading. Learn fast. Earn smart.</Text>
      </View>
      <View style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: '#E0E7FF', padding: 12, borderRadius: 10 }}>
        <Text style={{ fontFamily: 'Nunito-Bold', color: '#1E3A8A', fontSize: 13 }}>Tip of the Day 💡</Text>
        <Text style={{ fontFamily: 'Nunito-Regular', color: '#1E40AF', fontSize: 12 }}>
          Markets move fast. Diversify your strategy across all tabs to master the game.
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, selectedTab === 'trading' && styles.activeTab]} onPress={() => setSelectedTab('trading')}>
          <Text style={[styles.tabText, selectedTab === 'trading' && styles.activeTabText]}>Trading</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, selectedTab === 'investing' && styles.activeTab]} onPress={() => setSelectedTab('investing')}>
          <Text style={[styles.tabText, selectedTab === 'investing' && styles.activeTabText]}>Investing</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, selectedTab === 'tokenomics' && styles.activeTab]} onPress={() => setSelectedTab('tokenomics')}>
          <Text style={[styles.tabText, selectedTab === 'tokenomics' && styles.activeTabText]}>Tokenomics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, selectedTab === 'crypto' && styles.activeTab]} onPress={() => setSelectedTab('crypto')}>
          <Text style={[styles.tabText, selectedTab === 'crypto' && styles.activeTabText]}>Crypto 🧑‍💻</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.lessonList}>
        {lessons.map((lesson, index) => (
          <TouchableOpacity
            key={index}
            style={styles.lessonCard}
            onPress={() => setSelectedLesson(lesson)}
          >
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedLesson?.title}</Text>
            <Text style={styles.modalText}>{selectedLesson?.content}</Text>
            <TouchableOpacity onPress={() => setSelectedLesson(null)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Got it!</Text>
            </TouchableOpacity>
            <Text style={{marginTop: 12, textAlign: 'center', color: '#7C3AED', fontFamily: 'Nunito-Bold', fontSize: 13}}>
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
  title: {
    fontFamily: 'Nunito-Bold',
    fontSize: 26,
    color: Colors.primary[800],
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 15,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    marginHorizontal: 8,
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
  activeTabText: {
    color: '#fff',
    fontFamily: 'Nunito-Bold',
  },
  lessonList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
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
  lessonTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 13,
    color: '#111827',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '95%', // Changed from 90% to 95%
    maxWidth: 420, // Changed from 400 to 420
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 17,
    marginBottom: 10,
    color: '#4B5563',
  },
  modalText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13.5,
    color: '#374151',
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#7C3AED',
    padding: 10,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Nunito-Bold',
  },
});