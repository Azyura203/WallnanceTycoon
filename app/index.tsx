console.log("Loading: app/index.tsx");

import { useEffect } from 'react';
import { router } from 'expo-router';
import { useCompanyName } from '@/src/hooks/useCompanyName';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/src/constants/Colors';

export default function IndexPage() {
  const { companyName, isLoading, error } = useCompanyName();
  
  useEffect(() => {
    if (!isLoading) {
      try {
        if (companyName) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Navigation error:', error);
      }
    }
  }, [companyName, isLoading]);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Return loading state while redirecting
  return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: Colors.neutral[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  errorText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: Colors.error[600],
    textAlign: 'center',
  },
});