import { useState } from 'react';
import { useCompanyName } from '@/src/hooks/useCompanyName';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, useWindowDimensions, Switch, Alert } from 'react-native';
import Colors from '@/src/constants/Colors';
import Layout from '@/src/constants/Layout';
import { Volume2, Music, Bell, RefreshCw, Shield, FileText, BookOpen, X, Users, Vibrate, Moon, Globe, Save } from 'lucide-react-native';
import GameButton from '@/src/components/buttons/GameButton';
import { useRouter } from 'expo-router';
import { useSettings } from '@/src/hooks/settings/useSettings';

export default function SettingsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;

  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const { companyName: username, setCompanyName: setUsername } = useCompanyName();
  const [editingField, setEditingField] = useState<'profile' | null>(null);
  const [tempInputValue, setTempInputValue] = useState('');
  const { settings, updateSetting, resetSettings } = useSettings();

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset all your game progress? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              const keys = await AsyncStorage.getAllKeys();
              const gameKeys = keys.filter(key =>
                key.startsWith('game') ||
                key.includes('portfolio') ||
                key.includes('market') ||
                key.includes('achievements') ||
                key.includes('rewards') ||
                key.includes('learning')
              );
              await AsyncStorage.multiRemove(gameKeys);
              Alert.alert('Success', 'Game progress has been reset. Please restart the app.');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset progress. Please try again.');
            }
          },
        },
      ]
    );
  };

  const toggleSwitch = (key: keyof typeof settings, value: boolean) => {
    updateSetting(key, value);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
          <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>Settings</Text>
          <Text style={[styles.subtitle, isSmallScreen && styles.subtitleSmall]}>
            Customize your experience
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.howToPlayButton, isSmallScreen && styles.howToPlayButtonSmall]}
          onPress={() => setShowHowToPlay(true)}
        >
          <View style={styles.howToPlayContent}>
            <BookOpen size={isSmallScreen ? 20 : 24} color={Colors.primary[600]} />
            <View style={styles.howToPlayText}>
              <Text style={[styles.howToPlayTitle, isSmallScreen && styles.howToPlayTitleSmall]}>
                How to Play
              </Text>
              <Text style={[styles.howToPlaySubtitle, isSmallScreen && styles.howToPlaySubtitleSmall]}>
                Learn game mechanics and strategies
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={[styles.settingsSection, isSmallScreen && styles.settingsSectionSmall]}>
          <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>
            Audio Settings
          </Text>

          <View style={[styles.settingItem, isSmallScreen && styles.settingItemSmall]}>
            <View style={styles.settingLeft}>
              <Volume2 size={isSmallScreen ? 16 : 20} color={Colors.neutral[600]} />
              <Text style={[styles.settingLabel, isSmallScreen && styles.settingLabelSmall]}>
                Sound Effects
              </Text>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(value) => toggleSwitch('soundEnabled', value)}
              trackColor={{ false: Colors.neutral[300], true: Colors.primary[400] }}
              thumbColor={settings.soundEnabled ? Colors.primary[600] : Colors.neutral[100]}
            />
          </View>

          <View style={[styles.settingItem, isSmallScreen && styles.settingItemSmall]}>
            <View style={styles.settingLeft}>
              <Music size={isSmallScreen ? 16 : 20} color={Colors.neutral[600]} />
              <Text style={[styles.settingLabel, isSmallScreen && styles.settingLabelSmall]}>
                Background Music
              </Text>
            </View>
            <Switch
              value={settings.musicEnabled}
              onValueChange={(value) => toggleSwitch('musicEnabled', value)}
              trackColor={{ false: Colors.neutral[300], true: Colors.primary[400] }}
              thumbColor={settings.musicEnabled ? Colors.primary[600] : Colors.neutral[100]}
            />
          </View>
        </View>

        <View style={[styles.settingsSection, isSmallScreen && styles.settingsSectionSmall]}>
          <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>
            Notifications & Feedback
          </Text>

          <View style={[styles.settingItem, isSmallScreen && styles.settingItemSmall]}>
            <View style={styles.settingLeft}>
              <Bell size={isSmallScreen ? 16 : 20} color={Colors.neutral[600]} />
              <Text style={[styles.settingLabel, isSmallScreen && styles.settingLabelSmall]}>
                Notifications
              </Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={(value) => toggleSwitch('notificationsEnabled', value)}
              trackColor={{ false: Colors.neutral[300], true: Colors.primary[400] }}
              thumbColor={settings.notificationsEnabled ? Colors.primary[600] : Colors.neutral[100]}
            />
          </View>

          <View style={[styles.settingItem, isSmallScreen && styles.settingItemSmall]}>
            <View style={styles.settingLeft}>
              <Vibrate size={isSmallScreen ? 16 : 20} color={Colors.neutral[600]} />
              <Text style={[styles.settingLabel, isSmallScreen && styles.settingLabelSmall]}>
                Haptic Feedback
              </Text>
            </View>
            <Switch
              value={settings.hapticFeedback}
              onValueChange={(value) => toggleSwitch('hapticFeedback', value)}
              trackColor={{ false: Colors.neutral[300], true: Colors.primary[400] }}
              thumbColor={settings.hapticFeedback ? Colors.primary[600] : Colors.neutral[100]}
            />
          </View>
        </View>

        <View style={[styles.settingsSection, isSmallScreen && styles.settingsSectionSmall]}>
          <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>
            Gameplay Settings
          </Text>

          <TouchableOpacity
            style={[styles.settingItem, isSmallScreen && styles.settingItemSmall]}
            onPress={() => {
              const levels: Array<'Low' | 'Medium' | 'High'> = ['Low', 'Medium', 'High'];
              const currentIndex = levels.indexOf(settings.competitorAI);
              const nextLevel = levels[(currentIndex + 1) % levels.length];
              updateSetting('competitorAI', nextLevel);
            }}
          >
            <View style={styles.settingLeft}>
              <Users size={isSmallScreen ? 16 : 20} color={Colors.neutral[600]} />
              <Text style={[styles.settingLabel, isSmallScreen && styles.settingLabelSmall]}>
                Competitor AI Difficulty
              </Text>
            </View>
            <Text style={[styles.settingValue, isSmallScreen && styles.settingValueSmall]}>
              {settings.competitorAI}
            </Text>
          </TouchableOpacity>

          <View style={[styles.settingItem, isSmallScreen && styles.settingItemSmall]}>
            <View style={styles.settingLeft}>
              <Save size={isSmallScreen ? 16 : 20} color={Colors.neutral[600]} />
              <Text style={[styles.settingLabel, isSmallScreen && styles.settingLabelSmall]}>
                Auto-Save Progress
              </Text>
            </View>
            <Switch
              value={settings.autoSave}
              onValueChange={(value) => toggleSwitch('autoSave', value)}
              trackColor={{ false: Colors.neutral[300], true: Colors.primary[400] }}
              thumbColor={settings.autoSave ? Colors.primary[600] : Colors.neutral[100]}
            />
          </View>
        </View>

        <View style={[styles.settingsSection, isSmallScreen && styles.settingsSectionSmall]}>
          <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>
            Display Settings
          </Text>

          <View style={[styles.settingItem, isSmallScreen && styles.settingItemSmall]}>
            <View style={styles.settingLeft}>
              <Moon size={isSmallScreen ? 16 : 20} color={Colors.neutral[600]} />
              <Text style={[styles.settingLabel, isSmallScreen && styles.settingLabelSmall]}>
                Dark Mode
              </Text>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={(value) => toggleSwitch('darkMode', value)}
              trackColor={{ false: Colors.neutral[300], true: Colors.primary[400] }}
              thumbColor={settings.darkMode ? Colors.primary[600] : Colors.neutral[100]}
            />
          </View>

          <TouchableOpacity
            style={[styles.settingItem, isSmallScreen && styles.settingItemSmall]}
            onPress={() => {
              const languages: Array<'en' | 'es' | 'fr'> = ['en', 'es', 'fr'];
              const languageNames = { en: 'English', es: 'Español', fr: 'Français' };
              const currentIndex = languages.indexOf(settings.language);
              const nextLang = languages[(currentIndex + 1) % languages.length];
              updateSetting('language', nextLang);
            }}
          >
            <View style={styles.settingLeft}>
              <Globe size={isSmallScreen ? 16 : 20} color={Colors.neutral[600]} />
              <Text style={[styles.settingLabel, isSmallScreen && styles.settingLabelSmall]}>
                Language
              </Text>
            </View>
            <Text style={[styles.settingValue, isSmallScreen && styles.settingValueSmall]}>
              {settings.language === 'en' ? 'English' : settings.language === 'es' ? 'Español' : 'Français'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.settingsSection, isSmallScreen && styles.settingsSectionSmall]}>
          <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>
            Account
          </Text>

          <TouchableOpacity
            style={[styles.settingItem, isSmallScreen && styles.settingItemSmall]}
            onPress={() => {
              setEditingField('profile');
              setTempInputValue(username ?? '');
            }}
          >
            <View style={styles.settingLeft}>
              <Users size={isSmallScreen ? 16 : 20} color={Colors.neutral[600]} />
              <Text style={[styles.settingLabel, isSmallScreen && styles.settingLabelSmall]}>
                Username
              </Text>
            </View>
            <Text style={[styles.settingValue, isSmallScreen && styles.settingValueSmall]}>
              {username || 'Set name'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, isSmallScreen && styles.settingItemSmall]}
            onPress={handleResetProgress}
          >
            <View style={styles.settingLeft}>
              <RefreshCw size={isSmallScreen ? 16 : 20} color={Colors.error[600]} />
              <Text style={[styles.settingLabel, { color: Colors.error[600] }, isSmallScreen && styles.settingLabelSmall]}>
                Reset Progress
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.settingsSection, isSmallScreen && styles.settingsSectionSmall]}>
          <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>
            Legal
          </Text>

          <TouchableOpacity style={[styles.settingItem, isSmallScreen && styles.settingItemSmall]}>
            <View style={styles.settingLeft}>
              <Shield size={isSmallScreen ? 16 : 20} color={Colors.neutral[600]} />
              <Text style={[styles.settingLabel, isSmallScreen && styles.settingLabelSmall]}>
                Privacy Policy
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, isSmallScreen && styles.settingItemSmall]}>
            <View style={styles.settingLeft}>
              <FileText size={isSmallScreen ? 16 : 20} color={Colors.neutral[600]} />
              <Text style={[styles.settingLabel, isSmallScreen && styles.settingLabelSmall]}>
                Terms of Service
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.settingsSection, isSmallScreen && styles.settingsSectionSmall]}>
          <TouchableOpacity
            style={[styles.settingItem, isSmallScreen && styles.settingItemSmall]}
            onPress={async () => {
              await AsyncStorage.removeItem('profileName');
              await AsyncStorage.removeItem('gameState');
              setUsername('');
              router.replace('/login');
            }}
          >
            <View style={styles.settingLeft}>
              <Text style={[styles.settingLabel, { color: Colors.error[600] }, isSmallScreen && styles.settingLabelSmall]}>
                Logout
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.versionContainer, isSmallScreen && styles.versionContainerSmall]}>
          <Text style={[styles.versionText, isSmallScreen && styles.versionTextSmall]}>
            Version 1.7.1
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={editingField !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setEditingField(null)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, isSmallScreen && styles.modalContentSmall]}>
            <Text style={[styles.modalTitle, isSmallScreen && styles.modalTitleSmall]}>
              {editingField === 'profile' ? 'Edit Username' : ''}
            </Text>
            <View style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}>
              <Users size={isSmallScreen ? 16 : 20} color={Colors.neutral[500]} style={{ alignSelf: 'center', marginBottom: 8 }} />
              <TextInput
                value={tempInputValue}
                onChangeText={setTempInputValue}
                placeholder="Enter your username"
                placeholderTextColor={Colors.neutral[400]}
                style={[styles.input, isSmallScreen && styles.inputSmall]}
              />
            </View>
            <GameButton
              title="Save"
              onPress={() => {
                if (editingField === 'profile') setUsername(tempInputValue);
                setEditingField(null);
              }}
              style={[styles.saveButton, isSmallScreen && styles.saveButtonSmall]}
              textStyle={[styles.saveButtonText, isSmallScreen && styles.saveButtonTextSmall]}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showHowToPlay}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHowToPlay(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.howToPlayModalContent, isSmallScreen && styles.howToPlayModalContentSmall]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isSmallScreen && styles.modalTitleSmall]}>
                How To Play
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowHowToPlay(false)}
              >
                <X size={isSmallScreen ? 20 : 24} color={Colors.neutral[600]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={[styles.tutorialSection, isSmallScreen && styles.tutorialSectionSmall]}>
                <Text style={[styles.tutorialTitle, isSmallScreen && styles.tutorialTitleSmall]}>
                  Getting Started
                </Text>
                <Text style={[styles.tutorialText, isSmallScreen && styles.tutorialTextSmall]}>
                  Welcome to Wallnance Tycoon! Your goal is to become a top meme coin tycoon by trading, investing, and outsmarting AI competitors.
                  Start by collecting coins, making smart decisions in the market, and growing your net worth.
                </Text>
              </View>

              <View style={[styles.tutorialSection, isSmallScreen && styles.tutorialSectionSmall]}>
                <Text style={[styles.tutorialTitle, isSmallScreen && styles.tutorialTitleSmall]}>
                  Making Money
                </Text>
                <Text style={[styles.tutorialText, isSmallScreen && styles.tutorialTextSmall]}>
                  Generate coins through mining operations. The market value fluctuates based on
                  supply and demand. Sell coins at high prices and buy when prices drop to maximize profits.
                </Text>
              </View>

              <View style={[styles.tutorialSection, isSmallScreen && styles.tutorialSectionSmall]}>
                <Text style={[styles.tutorialTitle, isSmallScreen && styles.tutorialTitleSmall]}>
                  Building Your Team
                </Text>
                <Text style={[styles.tutorialText, isSmallScreen && styles.tutorialTextSmall]}>
                  Compete against AI investors and evolve your strategy. Your decisions impact your performance — time your trades, react to news, and dominate the leaderboard.
                </Text>
              </View>

              <View style={[styles.tutorialSection, isSmallScreen && styles.tutorialSectionSmall]}>
                <Text style={[styles.tutorialTitle, isSmallScreen && styles.tutorialTitleSmall]}>
                  Market Strategies
                </Text>
                <Text style={[styles.tutorialText, isSmallScreen && styles.tutorialTextSmall]}>
                  Watch market trends and invest wisely. Participate in special events for bonuses and
                  collaborate with other players for mutual benefits.
                </Text>
              </View>
            </ScrollView>

            <GameButton
              title="Got it!"
              onPress={() => setShowHowToPlay(false)}
              style={[styles.closeModalButton, isSmallScreen && styles.closeModalButtonSmall]}
              textStyle={[styles.closeModalButtonText, isSmallScreen && styles.closeModalButtonTextSmall]}
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
  subtitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: 18,
    color: Colors.neutral[600],
  },
  subtitleSmall: {
    fontSize: 14,
  },
  howToPlayButton: {
    backgroundColor: Colors.primary[50],
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.xl,
    borderWidth: 2,
    borderColor: Colors.primary[200],
    ...Layout.shadows.small,
  },
  howToPlayButtonSmall: {
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  howToPlayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
  },
  howToPlayText: {
    flex: 1,
  },
  howToPlayTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: Colors.primary[700],
    marginBottom: 2,
  },
  howToPlayTitleSmall: {
    fontSize: 16,
  },
  howToPlaySubtitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.primary[600],
  },
  howToPlaySubtitleSmall: {
    fontSize: 12,
  },
  settingsSection: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
    ...Layout.shadows.small,
  },
  settingsSectionSmall: {
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  sectionTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: Colors.primary[600],
    marginBottom: Layout.spacing.md,
  },
  sectionTitleSmall: {
    fontSize: 16,
    marginBottom: Layout.spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  settingItemSmall: {
    paddingVertical: Layout.spacing.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
    flex: 1,
  },
  settingLabel: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: Colors.neutral[700],
  },
  settingLabelSmall: {
    fontSize: 14,
  },
  settingValue: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: Colors.secondary[500],
  },
  settingValueSmall: {
    fontSize: 14,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.xl,
  },
  versionContainerSmall: {
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  versionText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.neutral[400],
  },
  versionTextSmall: {
    fontSize: 12,
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
    maxHeight: '100%',
    width: '90%',
    maxWidth: 450,
    alignSelf: 'center',
    padding: Layout.spacing.lg,
    ...Layout.shadows.large,
  },
  modalContentSmall: {
    width: '95%',
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
  },
  modalTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 24,
    color: Colors.primary[700],
    textAlign: 'center',
    marginBottom: Layout.spacing.lg,
  },
  modalTitleSmall: {
    fontSize: 20,
    marginBottom: Layout.spacing.md,
  },
  inputContainer: {
    backgroundColor: Colors.neutral[100],
    borderRadius: 8,
    padding: 12,
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
    width: '90%',
    alignSelf: 'center',
  },
  inputContainerSmall: {
    padding: 8,
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  input: {
    fontSize: 16,
    color: Colors.neutral[800],
    textAlign: 'center',
    paddingVertical: 6,
  },
  inputSmall: {
    fontSize: 14,
    paddingVertical: 4,
  },
  saveButton: {
    marginTop: Layout.spacing.lg,
    paddingVertical: 10,
    borderRadius: 6,
    width: '100%',
    alignSelf: 'center',
  },
  saveButtonSmall: {
    marginTop: Layout.spacing.md,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: 16,
  },
  saveButtonTextSmall: {
    fontSize: 14,
  },
  howToPlayModalContent: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    width: '95%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingTop: Layout.spacing.xl,
    paddingBottom: Layout.spacing.xl,
    paddingHorizontal: Layout.spacing.lg,
    maxHeight: '90%',
    ...Layout.shadows.medium,
  },
  howToPlayModalContentSmall: {
    width: '98%',
    paddingTop: Layout.spacing.lg,
    paddingBottom: Layout.spacing.lg,
    paddingHorizontal: Layout.spacing.md,
    maxHeight: '95%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  closeButton: {
    padding: Layout.spacing.xs,
  },
  modalScroll: {
    padding: Layout.spacing.lg,
  },
  tutorialSection: {
    marginBottom: Layout.spacing.xl,
  },
  tutorialSectionSmall: {
    marginBottom: Layout.spacing.lg,
  },
  tutorialTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: Colors.primary[600],
    marginBottom: Layout.spacing.md,
  },
  tutorialTitleSmall: {
    fontSize: 16,
    marginBottom: Layout.spacing.sm,
  },
  tutorialText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: Colors.neutral[700],
    lineHeight: 24,
  },
  tutorialTextSmall: {
    fontSize: 14,
    lineHeight: 20,
  },
  closeModalButton: {
    margin: Layout.spacing.lg,
    backgroundColor: Colors.primary[500],
  },
  closeModalButtonSmall: {
    margin: Layout.spacing.md,
  },
  closeModalButtonText: {
    fontSize: 16,
  },
  closeModalButtonTextSmall: {
    fontSize: 14,
  },
});
