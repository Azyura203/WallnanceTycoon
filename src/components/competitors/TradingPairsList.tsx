import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { useTradingPairs } from '@/src/hooks/market/useTradingPairs';

type SortKey = 'volume' | 'change' | 'price';

const TradingPairsList: React.FC = () => {
  const router = useRouter();
  const { pairs: tradingPairs, loading: isLoading } = useTradingPairs();
  const [sortedPairs, setSortedPairs] = useState<any[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('volume');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (tradingPairs) {
      const pairsCopy = [...tradingPairs];
      pairsCopy.sort((a, b) => {
        let aVal = a[sortKey] as number;
        let bVal = b[sortKey] as number;

        if (sortOrder === 'asc') {
          return aVal - bVal;
        } else {
          return bVal - aVal;
        }
      });
      setSortedPairs(pairsCopy);
    }
  }, [tradingPairs, sortKey, sortOrder]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  if (isLoading) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 10 }}>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => toggleSort('volume')}>
          <Text style={{ fontWeight: sortKey === 'volume' ? 'bold' : 'normal' }}>
            Volume {sortKey === 'volume' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => toggleSort('change')}>
          <Text style={{ fontWeight: sortKey === 'change' ? 'bold' : 'normal' }}>
            Change {sortKey === 'change' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => toggleSort('price')}>
          <Text style={{ fontWeight: sortKey === 'price' ? 'bold' : 'normal' }}>
            Price {sortKey === 'price' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {sortedPairs.map((pair, index) => (
        <Animatable.View
          key={pair.pair}
          animation="fadeInUp"
          delay={index * 50}
          style={{
            flexDirection: 'row',
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderColor: '#ccc',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => router.push({ pathname: '/pair/[pair]', params: { pair: pair.pair } })}
          >
            <Text style={{ color: 'blue' }}>{pair.pair}</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text>{pair.volume}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text>{pair.change}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text>{pair.price}</Text>
          </View>
        </Animatable.View>
      ))}
    </ScrollView>
  );
};

export default TradingPairsList;
