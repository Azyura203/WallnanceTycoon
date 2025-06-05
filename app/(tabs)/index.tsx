
console.log("Loading: app/(tabs)/index.tsx");
// Helper to format money values
const formatMoney = (num: number): string => {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
  return `$${num.toFixed(2)}`;
};

import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { LineChart as LineChart, TrendingUp, Users, Newspaper } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useCompanyName } from '@/hooks/useCompanyName';
import { usePlayerFinances } from '@/hooks/usePlayerFinances';

type StaffStatus = 'active' | 'idle' | 'stressed';

const statusStyleMap: Record<StaffStatus, keyof typeof styles> = {
  active: 'statusActive',
  idle: 'statusIdle',
  stressed: 'statusStressed',
};

const StaffMember = ({ name, role, status }: { name: string; role: string; status: StaffStatus }) => {
  const statusEmoji = {
    active: '🟢',
    idle: '🟡',
    stressed: '🔴'
  };

  return (
    <View style={styles.staffMember}>
      <View style={styles.staffInfo}>
        <Text style={styles.staffName}>{name}</Text>
        <Text style={styles.staffRole}>{role}</Text>
      </View>
      <Text style={[styles.staffStatus, styles[statusStyleMap[status] as keyof typeof styles]]}>
        {statusEmoji[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
};

const DashboardButton = ({ icon: Icon, label, onPress }: any) => (
  <Pressable style={styles.dashboardButton} onPress={onPress}>
    <Icon size={24} color={Colors.primary[600]} />
    <Text style={styles.buttonLabel}>{label}</Text>
  </Pressable>
);

export default function DashboardScreen() {
  const { companyName } = useCompanyName();
  const { balance, portfolio } = usePlayerFinances();

  // Calculate total portfolio value
  const calculateTrust = () => {
    const totalCoins = Object.values(portfolio).reduce((sum, entry) => {
      if (typeof entry === 'object' && entry !== null && 'quantity' in entry) {
        return sum + entry.quantity;
      }
      return sum;
    }, 0);
    return isNaN(totalCoins) ? 0 : Math.min(Math.floor((totalCoins / 100) * 65), 100);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{companyName || 'Company'} HQ</Text>
        <Text style={styles.subtitle}>CEO Dashboard</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Balance</Text>
          <Text style={styles.statValue}>💰 {formatMoney(balance)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Trust</Text>
          <Text style={styles.statValue}>📈 {calculateTrust()}%</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Market Stress</Text>
          <Text style={styles.statValue}>😰 Medium</Text>
        </View>
      </View>

      <View style={styles.newsTickerContainer}>
        <Text style={styles.newsTickerLabel}>BREAKING NEWS</Text>
        <Text style={styles.newsTickerContent}>
          New trend: CrypTofu is exploding! 🚀
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Staff</Text>
        <View style={styles.staffContainer}>
          <StaffMember name="Sarah Chen" role="Senior Analyst 📊" status="active" />
          <StaffMember name="Mike Johnson" role="PR Manager 🎯" status="idle" />
          <StaffMember name="Alex Kim" role="Dev Intern 💻" status="stressed" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.buttonsGrid}>
          <DashboardButton 
            icon={LineChart} 
            label="📊 Trade Room"
            onPress={() => router.push('/market')}
          />
          <DashboardButton 
            icon={Newspaper} 
            label="📰 Market News"
            onPress={() => {}}
          />
          <DashboardButton 
            icon={Users} 
            label="🏢 Hire Staff"
            onPress={() => router.push('/portfolio')}
          />
          <DashboardButton 
            icon={TrendingUp} 
            label="⚔️ Competitors"
            onPress={() => router.push('/competitors')}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xxl,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.xl,
    gap: Layout.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    alignItems: 'center',
    ...Layout.shadows.small,
  },
  statLabel: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: Colors.neutral[600],
    marginBottom: Layout.spacing.xs,
    textAlign: 'center',
  },
  statValue: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.primary[700],
    textAlign: 'center',
  },
  newsTickerContainer: {
    backgroundColor: Colors.accent[100],
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent[400],
    ...Layout.shadows.small,
  },
  newsTickerLabel: {
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
    color: Colors.accent[700],
    marginBottom: Layout.spacing.xs,
  },
  newsTickerContent: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: Colors.accent[800],
  },
  section: {
    marginBottom: Layout.spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: Colors.primary[700],
    marginBottom: Layout.spacing.md,
  },
  staffContainer: {
    gap: Layout.spacing.md,
  },
  staffMember: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    ...Layout.shadows.small,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  staffRole: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.neutral[600],
  },
  staffStatus: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 13,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  statusActive: {
    backgroundColor: Colors.success[50],
    color: Colors.success[700],
  },
  statusIdle: {
    backgroundColor: Colors.warning[50],
    color: Colors.warning[700],
  },
  statusStressed: {
    backgroundColor: Colors.error[50],
    color: Colors.error[700],
  },
  buttonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.md,
  },
  dashboardButton: {
    flex: 1,
    minWidth: 150,
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    alignItems: 'center',
    gap: Layout.spacing.sm,
    ...Layout.shadows.small,
  },
  buttonLabel: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: Colors.primary[700],
    textAlign: 'center',
  },
});