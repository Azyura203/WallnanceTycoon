import { Text, View } from 'react-native';
import { useGlobalSearchParams } from 'expo-router';

export default function PairDetail() {
  const { pair } = useGlobalSearchParams<{ pair: string }>();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Pair detail: {pair}</Text>
    </View>
  );
}