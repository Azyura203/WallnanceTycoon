import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Users, TrendingUp, BrainCircuit, MessageCircle, AlertTriangle as AlertTriangle, X } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import GameButton from '@/components/GameButton';
import { useTeamManagement, Employee } from '@/hooks/useTeamManagement';
import { usePlayerFinances } from '@/hooks/usePlayerFinances';

// Add new Personality and Perk types for Employee
type Personality = 'Chill' | 'Workaholic' | 'Chaotic' | 'Genius' | 'Slacker';
type Perk = {
  name: string;
  effect: string;
};

// Updated Employee type
// (For typechecking only; the actual Employee type should be updated in useTeamManagement as well)
// export type Employee = {
//   id: string;
//   name: string;
//   emoji: string;
//   role: string;
//   personality: Personality;
//   bio: string;
//   skill: { name: string; level: number };
//   salary: number;
//   stress: 'Low' | 'Medium' | 'High';
//   effect: string;
//   perks: Perk[];
//   hired: Date;
// };

const applicants: Employee[] = [
  {
    id: '1',
    name: '🚀 Chad Bitlord',
    emoji: '🚀',
    role: 'Analyst',
    personality: 'Genius',
    bio: 'Ex-Wall Street prodigy who day-trades memes.',
    salary: 12000,
    skill: { name: 'Market Prediction', level: 3 },
    stress: 'Low',
    effect: 'Predicts market trends with 75% accuracy',
    perks: [
      { name: 'Hype Vision', effect: 'Sees potential in dead coins.' }
    ],
    hired: new Date(),
  },
  {
    id: '2',
    name: '💻 Sarah Haxxor',
    emoji: '💻',
    role: 'Developer',
    personality: 'Workaholic',
    bio: 'Codes in dreams. Can debug blindfolded.',
    salary: 14000,
    skill: { name: 'Algorithm Design', level: 4 },
    stress: 'Medium',
    effect: 'Automates trading with smart algorithms',
    perks: [
      { name: 'Overclocked Brain', effect: 'Reduces cooldown of AI bots.' }
    ],
    hired: new Date(),
  },
  {
    id: '3',
    name: '📢 Mike Viralwave',
    emoji: '📢',
    role: 'PR Manager',
    personality: 'Chaotic',
    bio: 'Once made a llama coin go viral.',
    salary: 10000,
    skill: { name: 'Viral Marketing', level: 3 },
    stress: 'Low',
    effect: 'Increases company trust by 15%',
    perks: [
      { name: 'Trend Surfer', effect: 'Boosts visibility during coin spikes.' }
    ],
    hired: new Date(),
  },
];

const roleIcons = {
  'Analyst': TrendingUp,
  'Developer': BrainCircuit,
  'PR Manager': MessageCircle,
};

export default function TeamScreen() {
  const [showHireModal, setShowHireModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Employee | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { team, hireEmployee, fireEmployee, paySalaries, lastSalaryPayment } = useTeamManagement();
  const { balance } = usePlayerFinances();

  const handleHire = async () => {
    if (!selectedApplicant) return;
    
    try {
      await hireEmployee(selectedApplicant);
      setShowHireModal(false);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleFire = async (employeeId: string) => {
    try {
      await fireEmployee(employeeId);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePaySalaries = async () => {
    try {
      const totalPaid = await paySalaries();
      // Show success message or update UI
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStressColor = (stress: string) => {
    switch (stress) {
      case 'Low':
        return Colors.success[500];
      case 'Medium':
        return Colors.warning[500];
      case 'High':
        return Colors.error[500];
      default:
        return Colors.neutral[500];
    }
  };

  const renderSkillLevel = (level: number) => {
    return '⭐'.repeat(level);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Team</Text>
          <Text style={styles.subtitle}>Build Your Dream Team</Text>
          <Text style={styles.balance}>💰 Balance: ${balance.toLocaleString()}</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <AlertTriangle color={Colors.error[500]} size={20} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.teamSection}>
          <View style={styles.sectionHeader}>
            <Users size={24} color={Colors.primary[600]} />
            <Text style={styles.sectionTitle}>Current Team ({team.length}/6)</Text>
          </View>

          {team.map((employee) => {
            const Icon = roleIcons[employee.role as keyof typeof roleIcons];
            return (
              <View key={employee.id} style={styles.employeeCard}>
                <View style={styles.employeeHeader}>
                  <View style={styles.employeeInfo}>
                    <Icon size={20} color={Colors.primary[600]} />
                    <View>
                      <Text style={styles.employeeName}>
                        {employee.emoji ? `${employee.emoji} ` : ''}
                        {employee.name.replace(/^[^\w] /, '')}
                      </Text>
                      <Text style={styles.employeeRole}>{employee.role}</Text>
                    </View>
                  </View>
                  <Text style={[styles.stressLevel, { color: getStressColor(employee.stress) }]}>
                    {employee.stress === 'Low' ? '😊' : employee.stress === 'Medium' ? '😐' : '😫'}
                  </Text>
                </View>

                <View style={styles.employeeDetails}>
                  <Text style={styles.skillText}>
                    {employee.skill.name}: {renderSkillLevel(employee.skill.level)}
                  </Text>
                  <Text style={styles.salaryText}>💰 ${employee.salary.toLocaleString()}/month</Text>
                  <Text style={styles.effectText}>{employee.effect}</Text>
                  {/* Display bio, personality, and perks if present */}
                  {'bio' in employee && (
                    <Text style={styles.effectText}>Bio: {employee.bio}</Text>
                  )}
                  {'personality' in employee && (
                    <Text style={styles.effectText}>Personality: {employee.personality}</Text>
                  )}
                  {'perks' in employee && Array.isArray(employee.perks) && employee.perks.length > 0 && (
                    <View>
                      <Text style={styles.effectText}>Perks:</Text>
                      {employee.perks.map((perk, idx) => (
                        <Text style={styles.effectText} key={perk.name + idx}>
                          - {perk.name}: {perk.effect}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>

                <GameButton
                  title="🔥 Fire"
                  onPress={() => handleFire(employee.id)}
                  style={styles.fireButton}
                />
              </View>
            );
          })}

          {team.length === 0 && (
            <View style={styles.emptyTeam}>
              <Text style={styles.emptyTeamText}>No team members yet</Text>
              <Text style={styles.emptyTeamSubtext}>Hire some talented people!</Text>
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <GameButton
            title="👥 Hire New Staff"
            onPress={() => setShowHireModal(true)}
            style={styles.hireButton}
            disabled={team.length >= 6}
          />
          <GameButton
            title="💰 Pay Salaries"
            onPress={handlePaySalaries}
            style={styles.payButton}
            disabled={team.length === 0}
          />
        </View>
      </ScrollView>

      <Modal
        visible={showHireModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHireModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Available Applicants</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setShowHireModal(false)}
              >
                <X size={24} color={Colors.neutral[600]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.applicantsList}>
              {applicants.map((applicant) => {
                const Icon = roleIcons[applicant.role as keyof typeof roleIcons];
                return (
                  <TouchableOpacity
                    key={applicant.id}
                    style={[
                      styles.applicantCard,
                      selectedApplicant?.id === applicant.id && styles.selectedApplicant
                    ]}
                    onPress={() => setSelectedApplicant(applicant)}
                  >
                    <View style={styles.applicantHeader}>
                      <Icon size={20} color={Colors.primary[600]} />
                      <View style={styles.applicantInfo}>
                        <Text style={styles.applicantName}>
                          {applicant.emoji ? `${applicant.emoji} ` : ''}
                          {applicant.name.replace(/^[^\w] /, '')}
                        </Text>
                        <Text style={styles.applicantRole}>{applicant.role}</Text>
                      </View>
                    </View>

                    <View style={styles.applicantDetails}>
                      <Text style={styles.skillText}>
                        {applicant.skill.name}: {renderSkillLevel(applicant.skill.level)}
                      </Text>
                      <Text style={styles.salaryText}>
                        💰 ${applicant.salary.toLocaleString()}/month
                      </Text>
                      <Text style={styles.effectText}>{applicant.effect}</Text>
                      {/* Show bio, personality, and perks */}
                      <Text style={styles.effectText}>Bio: {applicant.bio}</Text>
                      <Text style={styles.effectText}>Personality: {applicant.personality}</Text>
                      {applicant.perks && applicant.perks.length > 0 && (
                        <View>
                          <Text style={styles.effectText}>Perks:</Text>
                          {applicant.perks.map((perk, idx) => (
                            <Text style={styles.effectText} key={perk.name + idx}>
                              - {perk.name}: {perk.effect}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <GameButton
              title="✅ Hire Selected"
              onPress={handleHire}
              style={styles.hireSelectedButton}
              disabled={!selectedApplicant}
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error[50],
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.lg,
    gap: Layout.spacing.sm,
  },
  errorText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.error[600],
    flex: 1,
  },
  teamSection: {
    marginBottom: Layout.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  sectionTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: Colors.primary[600],
  },
  employeeCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
    ...Layout.shadows.small,
  },
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
  },
  employeeName: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.neutral[800],
  },
  employeeRole: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.neutral[600],
  },
  employeeDetails: {
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  stressLevel: {
    fontSize: 20,
  },
  skillText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: Colors.neutral[700],
  },
  salaryText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: Colors.primary[600],
  },
  effectText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.neutral[600],
    fontStyle: 'italic',
  },
  fireButton: {
    backgroundColor: Colors.error[500],
  },
  emptyTeam: {
    alignItems: 'center',
    padding: Layout.spacing.xl,
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    ...Layout.shadows.small,
  },
  emptyTeamText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: Colors.neutral[600],
    marginBottom: Layout.spacing.xs,
  },
  emptyTeamSubtext: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.neutral[500],
  },
  actionButtons: {
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.xxl,
  },
  hireButton: {
    backgroundColor: Colors.success[500],
  },
  payButton: {
    backgroundColor: Colors.primary[500],
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: Layout.spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.lg,
    maxHeight: '80%',
    ...Layout.shadows.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  modalTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 24,
    color: Colors.primary[700],
  },
  closeButton: {
    padding: Layout.spacing.xs,
  },
  applicantsList: {
    padding: Layout.spacing.lg,
  },
  applicantCard: {
    backgroundColor: Colors.neutral[50],
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedApplicant: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[200],
  },
  applicantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  applicantInfo: {
    flex: 1,
  },
  applicantName: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.neutral[800],
  },
  applicantRole: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.neutral[600],
  },
  applicantDetails: {
    gap: Layout.spacing.sm,
  },
  hireSelectedButton: {
    margin: Layout.spacing.lg,
    backgroundColor: Colors.success[500],
  },
});