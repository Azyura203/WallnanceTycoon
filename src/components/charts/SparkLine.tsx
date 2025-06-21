import React from 'react';
import Svg, { Path as SvgPath } from 'react-native-svg';

interface Props {
  points: number[];          // e.g. [450, 460, 455, 470]
  positive: boolean;         // price went up?
}

export default function SparkLine({ points }: Props) {
  // quick ‘poor-man’s’ normalisation into SVG coords 0-30
  const max = Math.max(...points);
  const min = Math.min(...points);
  const mapY = (v: number) =>
    30 - ((v - min) / Math.max(max - min || 1, 1)) * 30;

  const segments = points.slice(1).map((point, i) => {
    const x1 = i * 15;
    const y1 = mapY(points[i]);
    const x2 = (i + 1) * 15;
    const y2 = mapY(point);
    const color = point >= points[i] ? "#22c55e" : "#ef4444";
    return { x1, y1, x2, y2, color };
  });

  return (
    <Svg width={60} height={30}>
      {segments.map((seg, index) => (
        <SvgPath
          key={index}
          d={`M${seg.x1},${seg.y1} L${seg.x2},${seg.y2}`}
          stroke={seg.color}
          strokeWidth={2}
          fill="none"
        />
      ))}
    </Svg>
  );
}