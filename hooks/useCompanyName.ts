import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COMPANY_NAME_KEY = '@wallnance_company_name';

export function useCompanyName() {
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompanyName();
  }, []);

  const loadCompanyName = async () => {
    try {
      const storedName = await AsyncStorage.getItem(COMPANY_NAME_KEY);
      setCompanyName(storedName);
      setError(null);
    } catch (error) {
      console.error('Error loading company name:', error);
      setError('Failed to load company name');
    } finally {
      setIsLoading(false);
    }
  };

  const saveCompanyName = async (name: string) => {
    try {
      if (!name || name.trim().length < 3) {
        throw new Error('Company name must be at least 3 characters');
      }
      await AsyncStorage.setItem(COMPANY_NAME_KEY, name);
      setCompanyName(name);
      setError(null);
    } catch (error) {
      console.error('Error saving company name:', error);
      setError(error instanceof Error ? error.message : 'Failed to save company name');
      throw error;
    }
  };

  return {
    companyName,
    setCompanyName: saveCompanyName,
    isLoading,
    error,
  };
}