import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { router } from 'expo-router';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import GameLogo from './GameLogo';
import GameButton from '../buttons/GameButton';
import { useCompanyName } from '../../hooks/useCompanyName';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PLAYER_NAMES_KEY = '@wallnance_player_names';

export default function StartupScreen() {
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [nameError, setNameError] = useState('');
  const [previousPlayers, setPreviousPlayers] = useState<string[]>([]);
  const { setCompanyName: setPlayerName } = useCompanyName();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  useEffect(() => {
    loadPreviousPlayers();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadPreviousPlayers = async () => {
    try {
      const names = await AsyncStorage.getItem(PLAYER_NAMES_KEY);
      if (names) {
        setPreviousPlayers(JSON.parse(names));
      }
    } catch (error) {
      console.error('Error loading previous names:', error);
    }
  };

  const savePreviousPlayer = async (name: string) => {
    try {
      const updatedPlayers = [...new Set([name, ...previousPlayers])].slice(0, 5);
      await AsyncStorage.setItem(PLAYER_NAMES_KEY, JSON.stringify(updatedPlayers));
      setPreviousPlayers(updatedPlayers);
    } catch (error) {
      console.error('Error saving previous names:', error);
    }
  };
  
  const handleStartGame = async () => {
    const name = playerNameInput.trim();
    if (!name) {
      setNameError('Please enter a player name');
      return;
    }

    if (name.length < 3) {
      setNameError('Player name must be at least 3 characters');
      return;
    }

    setNameError('');
    try {
      // Removed await AsyncStorage.clear(); to prevent wiping all app state
      await setPlayerName(name);
      await savePreviousPlayer(name);
      const newGameData = {
        coins: 1000000,
        playerName: name,
      };
      await AsyncStorage.setItem('gameData', JSON.stringify(newGameData));
      router.replace('/(tabs)');
    } catch (error) {
      setNameError('Failed to save player name. Please try again.');
    }
  };

  const handleSelectPreviousPlayer = async (name: string) => {
    try {
      await setPlayerName(name);
      await savePreviousPlayer(name);
      const existingGameData = await AsyncStorage.getItem('gameData');
      if (!existingGameData) {
        const defaultData = {
          coins: 1000000,
          playerName: name,
          portfolio: {},
        };
        await AsyncStorage.setItem('gameData', JSON.stringify(defaultData));
      }
      router.replace('/(tabs)');
    } catch (error) {
      setNameError('Failed to select player. Please try again.');
    }
  };
  
  const handlePlayerNameChange = (text: string) => {
    setPlayerNameInput(text);
    if (nameError && text.trim().length >= 3) {
      setNameError('');
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View 
          style={[
            styles.content,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={styles.logoTitle}>🚀 WALLNANCE</Text>
            <Text style={styles.logoSubtitle}>TYCOON 💼</Text>
          </View>
          
          <Text style={styles.subtitle}>Build a coin company. Rule the memeverse!</Text>
          
          {previousPlayers.length > 0 && (
            <View style={styles.previousNamesContainer}>
              <Text style={styles.previousNamesTitle}>Previous Players</Text>
              {previousPlayers.map((name, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.previousNameButton}
                  onPress={() => handleSelectPreviousPlayer(name)}
                >
                  <Text style={styles.previousNameText}>{name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {previousPlayers.length === 0 && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Create New Player</Text>
                <TextInput
                  style={[styles.input, nameError ? styles.inputError : null]}
                  placeholder="e.g. ToTheMoon Player 🚀"
                  placeholderTextColor={Colors.neutral[400]}
                  value={playerNameInput}
                  onChangeText={handlePlayerNameChange}
                  maxLength={25}
                  autoCapitalize="words"
                />
                {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
              </View>

              <View style={styles.buttonContainer}>
                <GameButton
                  title="🎮 Start Game"
                  onPress={handleStartGame}
                  style={styles.startButton}
                  textStyle={styles.startButtonText}
                />
              </View>
            </>
          )}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Layout.spacing.lg,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
  },
  subtitle: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 18,
    color: Colors.primary[700],
    textAlign: 'center',
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.xl,
  },
  previousNamesContainer: {
    width: '100%',
    marginBottom: Layout.spacing.xl,
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    ...Layout.shadows.small,
  },
  previousNamesTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.primary[600],
    marginBottom: Layout.spacing.md,
    textAlign: 'center',
  },
  previousNameButton: {
    backgroundColor: Colors.primary[50],
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
    borderWidth: 2,
    borderColor: Colors.primary[200],
  },
  previousNameText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: Colors.primary[700],
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: Layout.spacing.xl,
  },
  inputLabel: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: Colors.primary[700],
    marginBottom: Layout.spacing.sm,
  },
  input: {
    fontFamily: 'Nunito-Regular',
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 2,
    borderColor: Colors.primary[200],
    padding: Layout.spacing.md,
    fontSize: 16,
    color: Colors.neutral[800],
    ...Layout.shadows.small,
  },
  inputError: {
    borderColor: Colors.error[400],
  },
  errorText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.error[600],
    marginTop: Layout.spacing.xs,
  },
  buttonContainer: {
    width: '100%',
    gap: Layout.spacing.md,
  },
  startButton: {
    backgroundColor: Colors.buttons.start,
  },
  startButtonText: {
    color: Colors.neutral[800],
  },
  logoTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#6A5ACD',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  logoSubtitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FF6347',
    letterSpacing: 1.2,
    textAlign: 'center',
    marginTop: 4,
  }
});