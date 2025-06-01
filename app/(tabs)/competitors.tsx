import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Trophy } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useEffect, useState } from 'react';

interface Competitor {
  id: string;
  rank: number;
  name: string;
  netWorth: number;
  trend: string;
  isPlayer?: boolean;
}

const initialCompetitors: Competitor[] = [
  { id: '1', rank: 1, name: 'MemeDaddy Corp', netWorth: 760000, trend: '🚀' },
  { id: '2', rank: 2, name: 'ToTheMoon Bros', netWorth: 550000, trend: '📈' },
  { id: '3', rank: 3, name: 'Wallnance Inc.', netWorth: 488000, trend: '📉', isPlayer: true },
  { id: '4', rank: 4, name: 'Bork & Sons', netWorth: 422000, trend: '😬' },
  { id: '5', rank: 5, name: 'CrypTofu Mafia', netWorth: 390000, trend: '🔻' },
];

const CompetitorCard = ({ competitor }: { competitor: Competitor }) => (
  <View style={[
    styles.competitorCard,
    competitor.isPlayer && styles.playerCard
  ]}>
    <View style={styles.rankContainer}>
      <Text style={styles.rankText}>#{competitor.rank}</Text>
      {competitor.rank === 1 && <Trophy size={20} color={Colors.warning[500]} />}
    </View>
    
    <View style={styles.infoContainer}>
      <Text style={styles.companyName}>
        {competitor.isPlayer ? 'YOU: ' : ''}{competitor.name}
      </Text>
      <Text style={styles.netWorth}>
        💰 ${competitor.netWorth.toLocaleString()}
      </Text>
    </View>
    
    <Text style={styles.trendEmoji}>{competitor.trend}</Text>
  </View>
);

export default function CompetitorsScreen() {
  const [competitorsData, setCompetitorsData] = useState<Competitor[]>(initialCompetitors);

  useEffect(() => {
    const interval = setInterval(() => {
      setCompetitorsData(prev => {
        const shuffled = [...prev].sort(() => Math.random() - 0.5);
        return shuffled.map((comp, index) => ({ ...comp, rank: index + 1 }));
      });
    }, 8000); // Every 8 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Rankings</Text>
          <Text style={styles.subtitle}>Top Trading Companies</Text>
        </View>

        <View style={styles.rankingsContainer}>
          {competitorsData.map(competitor => (
            <CompetitorCard key={competitor.id} competitor={competitor} />
          ))}
        </View>

        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>
            "The only way up... is through the competition."
          </Text>
        </View>
      </ScrollView>
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
  rankingsContainer: {
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.xl,
  },
  competitorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.lg,
    ...Layout.shadows.small,
  },
  playerCard: {
    backgroundColor: Colors.primary[50],
    borderWidth: 2,
    borderColor: Colors.primary[200],
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
    minWidth: 50,
  },
  rankText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: Colors.neutral[600],
  },
  infoContainer: {
    flex: 1,
    marginLeft: Layout.spacing.md,
  },
  companyName: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  netWorth: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: Colors.neutral[600],
  },
  trendEmoji: {
    fontSize: 24,
    marginLeft: Layout.spacing.md,
  },
  quoteContainer: {
    alignItems: 'center',
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.xxl,
  },
  quoteText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: Colors.neutral[500],
    fontStyle: 'italic',
  },
});