import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import Svg, { Path as SvgPath } from 'react-native-svg';

interface Props {
  points: number[];          // e.g. [450, 460, 455, 470]
  positive: boolean;         // price went up?
}

const AnimatedPath = Animated.createAnimatedComponent(SvgPath);

export default function SparkLine({ points, positive }: Props) {
  // animate the stroke‐dashoffset so the line “draws” itself
  const dash = useRef(new Animated.Value(1000)).current;
  useEffect(() => {
    dash.setValue(1000);
    Animated.timing(dash, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [points]);

  // quick ‘poor-man’s’ normalisation into SVG coords 0-30
  const max = Math.max(...points);
  const min = Math.min(...points);
  const mapY = (v: number) =>
    30 - ((v - min) / Math.max(max - min || 1, 1)) * 30;

  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${i * 15},${mapY(p)}`)
    .join(' ');

  return (
    <Svg width={60} height={30}>
      <AnimatedPath
        d={d}
        stroke={positive ? '#22c55e' : '#ef4444'}
        strokeWidth={2}
        fill="none"
        strokeDasharray="1000"
        strokeDashoffset={dash}
      />
    </Svg>
  );
}