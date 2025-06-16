import { View, Text, StyleSheet } from 'react-native';
import { useCompanyName } from '@/src/hooks/useCompanyName';
import Colors from '@/src/constants/Colors';
import Layout from '@/src/constants/Layout';

export default function DashboardTopBar() {
  const { companyName } = useCompanyName();
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🏦 Wallnance</Text>
      <Text style={styles.company}>{companyName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 20,
    color: Colors.primary[700],
  },
  company: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: Colors.neutral[600],
  },
});