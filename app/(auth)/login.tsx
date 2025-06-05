import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import Colors from '@/constants/Colors';
import StartupScreen from '@/components/StartupScreen';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function LoginScreen() {
  const [hasSave, setHasSave] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const checkSavedData = async () => {
        const data = await AsyncStorage.getItem('gameData');
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.playerName) {
            setPlayerName(parsed.playerName);
            setHasSave(true);
          } else {
            setPlayerName('');
            setHasSave(false);
          }
        } else {
          setPlayerName('');
          setHasSave(false);
        }
      };
      checkSavedData();
    }, [])
  );

  const handleLoadGame = async () => {
    const data = await AsyncStorage.getItem('gameData');
    if (data) {
      const parsed = JSON.parse(data);
      console.log('Loaded Game:', parsed);
      router.replace('./tabs');
    }
  };

  const handleNewGame = async () => {
    const defaultData = {
      playerName: '',
      balance: 1000000,
      portfolio: {},
    };
    await AsyncStorage.setItem('gameData', JSON.stringify(defaultData));
    router.replace('./startup');
  };

  return (
    <View style={styles.container}>
      <StartupScreen />
      <View style={styles.buttonContainer}>
        {hasSave ? (
          <>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
              Player - {playerName || 'N/A'}
            </Text>
            <TouchableOpacity style={styles.button} onPress={handleLoadGame}>
              <Text style={styles.buttonText}>LOAD GAME</Text>
            </TouchableOpacity>
          </>
        ) : null}

        <TouchableOpacity
          style={[
            styles.button,
            hasSave ? { backgroundColor: '#666' } : { backgroundColor: '#1E90FF' },
          ]}
          onPress={handleNewGame}
          disabled={hasSave}
        >
          <Text style={styles.buttonText}>NEW GAME</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    rowGap: 10,
  },
  button: {
    backgroundColor: '#1E90FF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    maxWidth: 350,
    width: '85%',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});