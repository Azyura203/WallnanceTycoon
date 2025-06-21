import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import Colors from '@/src/constants/Colors';
import Layout from '@/src/constants/Layout';
import { Settings as SettingsIcon, Volume2, Music, Bell, RefreshCw, Shield, FileText, BookOpen, X, TrendingUp, Users, Smile } from 'lucide-react-native';
import GameButton from '@/src/components/buttons/GameButton';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  // v1.5.0 Feature Flags and Settings Enhancements

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [marketSpeed, setMarketSpeed] = useState<'Normal' | 'Fast' | 'Slow'>('Normal');
  const [coinVolatility, setCoinVolatility] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [competitorAI, setCompetitorAI] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [emojiMode, setEmojiMode] = useState(true);

  const [profileName, setProfileName] = useState('');
  const [companyName, setCompanyName] = useState('');

  const [editingField, setEditingField] = useState<'profile' | 'company' | null>(null);
  const [tempInputValue, setTempInputValue] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      const sound = await AsyncStorage.getItem('soundEnabled');
      const music = await AsyncStorage.getItem('musicEnabled');
      const notifications = await AsyncStorage.getItem('notificationsEnabled');
      const ms = await AsyncStorage.getItem('marketSpeed');
      const cv = await AsyncStorage.getItem('coinVolatility');
      const ai = await AsyncStorage.getItem('competitorAI');
      const emoji = await AsyncStorage.getItem('emojiMode');
      if (sound !== null) setSoundEnabled(sound === 'true');
      if (music !== null) setMusicEnabled(music === 'true');
      if (notifications !== null) setNotificationsEnabled(notifications === 'true');
      if (ms === 'Normal' || ms === 'Fast' || ms === 'Slow') setMarketSpeed(ms);
      if (cv === 'Low' || cv === 'Medium' || cv === 'High') setCoinVolatility(cv);
      if (ai === 'Low' || ai === 'Medium' || ai === 'High') setCompetitorAI(ai);
      if (emoji !== null) setEmojiMode(emoji === 'true');
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      const storedProfileName = await AsyncStorage.getItem('profileName');
      const storedCompanyName = await AsyncStorage.getItem('companyName');
      if (storedProfileName) setProfileName(storedProfileName);
      if (storedCompanyName) setCompanyName(storedCompanyName);
    };
    loadUserData();
  }, []);

  // Save profileName to AsyncStorage when changed
  useEffect(() => {
    AsyncStorage.setItem('profileName', profileName);
  }, [profileName]);

  // Save companyName to AsyncStorage when changed
  useEffect(() => {
    AsyncStorage.setItem('companyName', companyName);
  }, [companyName]);

  const toggleSetting = async (key: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value);
    await AsyncStorage.setItem(key, value.toString());
  };

  // Helper to persist gameplay settings
  const persistSetting = async (key: string, value: string | boolean) => {
    await AsyncStorage.setItem(key, value.toString());
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your experience</Text>
        </View>
        
        <TouchableOpacity style={styles.howToPlayButton} onPress={() => setShowHowToPlay(true)}>
          <View style={styles.howToPlayContent}>
            <BookOpen size={24} color={Colors.primary[600]} />
            <View style={styles.howToPlayText}>
              <Text style={styles.howToPlayTitle}>📘 How to Play</Text>
              <Text style={styles.howToPlaySubtitle}>Learn game mechanics and strategies</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Game Options</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => toggleSetting('soundEnabled', !soundEnabled, setSoundEnabled)}
          >
            <View style={styles.settingLeft}>
              <Volume2 size={20} color={Colors.neutral[600]} />
              <Text style={styles.settingLabel}>Sound Effects</Text>
            </View>
            <Text style={styles.settingValue}>{soundEnabled ? 'On' : 'Off'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => toggleSetting('musicEnabled', !musicEnabled, setMusicEnabled)}
          >
            <View style={styles.settingLeft}>
              <Music size={20} color={Colors.neutral[600]} />
              <Text style={styles.settingLabel}>Music</Text>
            </View>
            <Text style={styles.settingValue}>{musicEnabled ? 'On' : 'Off'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => toggleSetting('notificationsEnabled', !notificationsEnabled, setNotificationsEnabled)}
          >
            <View style={styles.settingLeft}>
              <Bell size={20} color={Colors.neutral[600]} />
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Text style={styles.settingValue}>{notificationsEnabled ? 'On' : 'Off'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Gameplay Settings</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              const next =
                marketSpeed === 'Normal'
                  ? 'Fast'
                  : marketSpeed === 'Fast'
                  ? 'Slow'
                  : 'Normal';
              setMarketSpeed(next);
              persistSetting('marketSpeed', next);
            }}
          >
            <View style={styles.settingLeft}>
              <RefreshCw size={20} color={Colors.neutral[600]} />
              <Text style={styles.settingLabel}>Market Speed</Text>
            </View>
            <Text style={styles.settingValue}>{marketSpeed}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              const next =
                coinVolatility === 'Low'
                  ? 'Medium'
                  : coinVolatility === 'Medium'
                  ? 'High'
                  : 'Low';
              setCoinVolatility(next);
              persistSetting('coinVolatility', next);
            }}
          >
            <View style={styles.settingLeft}>
              <TrendingUp size={20} color={Colors.neutral[600]} />
              <Text style={styles.settingLabel}>Coin Volatility</Text>
            </View>
            <Text style={styles.settingValue}>{coinVolatility}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              const next =
                competitorAI === 'Low'
                  ? 'Medium'
                  : competitorAI === 'Medium'
                  ? 'High'
                  : 'Low';
              setCompetitorAI(next);
              persistSetting('competitorAI', next);
            }}
          >
            <View style={styles.settingLeft}>
              <Users size={20} color={Colors.neutral[600]} />
              <Text style={styles.settingLabel}>Competitor AI</Text>
            </View>
            <Text style={styles.settingValue}>{competitorAI}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              setEmojiMode(!emojiMode);
              persistSetting('emojiMode', !emojiMode);
            }}
          >
            <View style={styles.settingLeft}>
              <Smile size={20} color={Colors.neutral[600]} />
              <Text style={styles.settingLabel}>Emoji Mode</Text>
            </View>
            <Text style={styles.settingValue}>{emojiMode ? 'On' : 'Off'}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Account</Text>

          {/* Editable Profile Name */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              setEditingField('profile');
              setTempInputValue(profileName);
            }}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Profile Name</Text>
            </View>
            <Text style={styles.settingValue}>{profileName || 'Set name'}</Text>
          </TouchableOpacity>

          {/* Editable Company Name */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              setEditingField('company');
              setTempInputValue(companyName);
            }}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Company Name</Text>
            </View>
            <Text style={styles.settingValue}>{companyName || 'Set company'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <RefreshCw size={20} color={Colors.neutral[600]} />
              <Text style={styles.settingLabel}>Reset Progress</Text>
            </View>
            <SettingsIcon size={20} color={Colors.neutral[500]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Shield size={20} color={Colors.neutral[600]} />
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
            <SettingsIcon size={20} color={Colors.neutral[500]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <FileText size={20} color={Colors.neutral[600]} />
              <Text style={styles.settingLabel}>Terms of Service</Text>
            </View>
            <SettingsIcon size={20} color={Colors.neutral[500]} />
          </TouchableOpacity>
        </View>
        
        {/* Logout Section */}
        <View style={styles.settingsSection}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={async () => {
              await AsyncStorage.removeItem('profileName');
             
              await AsyncStorage.removeItem('gameState');
              setProfileName('');
             
              router.replace('/login');
            }}
          >
            <View style={styles.settingLeft}>
              <Shield size={20} color={Colors.neutral[600]} />
              <Text style={[styles.settingLabel, { color: 'red' }]}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.5.0</Text>
        </View>
      </ScrollView>

      {/* Modal for editing profile/company name */}
      <Modal
        visible={editingField !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setEditingField(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingField === 'profile' ? 'Edit Profile Name' : 'Edit Company Name'}
            </Text>
            <TextInput
              value={tempInputValue}
              onChangeText={setTempInputValue}
              style={{
                backgroundColor: '#fff',
                padding: 12,
                borderRadius: 8,
                fontSize: 16,
                marginTop: 12,
                marginBottom: 20,
              }}
            />
            <GameButton
              title="Save"
              onPress={() => {
                if (editingField === 'profile') setProfileName(tempInputValue);
                if (editingField === 'company') setCompanyName(tempInputValue);
                setEditingField(null);
              }}
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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>How To Play</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setShowHowToPlay(false)}
              >
                <X size={24} color={Colors.neutral[600]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.tutorialSection}>
                <Text style={styles.tutorialTitle}>🚀 Getting Started</Text>
                <Text style={styles.tutorialText}>
                  Welcome to Wallnance Tycoon! Your goal is to build a successful meme coin company.
                  Start by purchasing miners to generate coins, then expand your operations as you grow.
                </Text>
              </View>

              <View style={styles.tutorialSection}>
                <Text style={styles.tutorialTitle}>💰 Making Money</Text>
                <Text style={styles.tutorialText}>
                  Generate coins through mining operations. The market value fluctuates based on
                  supply and demand. Sell coins at high prices and buy when prices drop to maximize profits.
                </Text>
              </View>

              <View style={styles.tutorialSection}>
                <Text style={styles.tutorialTitle}>👥 Building Your Team</Text>
                <Text style={styles.tutorialText}>
                  Hire talented individuals to improve your operations. Developers increase mining efficiency,
                  marketers boost coin value, and managers reduce costs.
                </Text>
              </View>

              <View style={styles.tutorialSection}>
                <Text style={styles.tutorialTitle}>📈 Market Strategies</Text>
                <Text style={styles.tutorialText}>
                  Watch market trends and invest wisely. Participate in special events for bonuses and
                  collaborate with other players for mutual benefits.
                </Text>
              </View>
            </ScrollView>

            <GameButton
              title="Got it! 👍"
              onPress={() => setShowHowToPlay(false)}
              style={styles.closeModalButton}
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
  howToPlayButton: {
    backgroundColor: Colors.primary[50],
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.xl,
    borderWidth: 2,
    borderColor: Colors.primary[200],
    ...Layout.shadows.small,
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
  howToPlaySubtitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.primary[600],
  },
  settingsSection: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
    ...Layout.shadows.small,
  },
  sectionTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: Colors.primary[600],
    marginBottom: Layout.spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
  },
  settingLabel: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: Colors.neutral[700],
  },
  settingValue: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: Colors.secondary[500],
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.xl,
  },
  versionText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.neutral[400],
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
  modalScroll: {
    padding: Layout.spacing.lg,
  },
  tutorialSection: {
    marginBottom: Layout.spacing.xl,
  },
  tutorialTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: Colors.primary[600],
    marginBottom: Layout.spacing.md,
  },
  tutorialText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: Colors.neutral[700],
    lineHeight: 24,
  },
  closeModalButton: {
    margin: Layout.spacing.lg,
    backgroundColor: Colors.primary[500],
  },
});