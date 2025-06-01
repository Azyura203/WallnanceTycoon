import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  StyleProp, 
  ViewStyle, 
  TextStyle,
  Animated,
  Pressable
} from 'react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

interface GameButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

export default function GameButton({ 
  title, 
  onPress, 
  style, 
  textStyle,
  disabled = false
}: GameButtonProps) {
  // Animation for button press effect
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({ pressed }) => [
        { opacity: pressed || disabled ? 0.9 : 1 }
      ]}
    >
      <Animated.View 
        style={[
          styles.button, 
          disabled && styles.disabled,
          { transform: [{ scale: scaleAnim }] },
          style
        ]}
      >
        <Text style={[styles.buttonText, textStyle]}>
          {title}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary[500],
    borderRadius: Layout.borderRadius.lg,
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Layout.shadows.medium,
  },
  buttonText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: 'white',
  },
  disabled: {
    backgroundColor: Colors.neutral[300],
    ...Layout.shadows.small,
  },
});