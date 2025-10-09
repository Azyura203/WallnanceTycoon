import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  notificationsEnabled: boolean;
  competitorAI: 'Low' | 'Medium' | 'High';
  autoSave: boolean;
  hapticFeedback: boolean;
  darkMode: boolean;
  language: 'en' | 'es' | 'fr';
}

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  notificationsEnabled: true,
  competitorAI: 'Medium',
  autoSave: true,
  hapticFeedback: true,
  darkMode: false,
  language: 'en',
};

const SETTINGS_KEY = 'game_settings_v2';

export function useSettings() {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = useCallback(
    async <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
      try {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      } catch (error) {
        console.error(`Failed to update setting ${String(key)}:`, error);
      }
    },
    [settings]
  );

  const resetSettings = useCallback(async () => {
    try {
      setSettings(DEFAULT_SETTINGS);
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  }, []);

  return {
    settings,
    isLoading,
    updateSetting,
    resetSettings,
  };
}
