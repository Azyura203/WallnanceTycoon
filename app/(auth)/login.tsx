import { StyleSheet, View } from 'react-native';
import Colors from '@/constants/Colors';
import StartupScreen from '@/components/StartupScreen';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <StartupScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});