import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveGameData = async (gameData: any) => {
  try {
    await AsyncStorage.setItem('gameData', JSON.stringify(gameData));
    // Optional: log or toast for debug
    console.log('✅ Game saved!');
  } catch (err) {
    console.error('❌ Failed to save game:', err);
  }
};