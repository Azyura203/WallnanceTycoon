import React from 'react';
import Svg, { Path as SvgPath, Defs, LinearGradient, Stop, Circle, G } from 'react-native-svg';

interface Props {
  points: number[];          // e.g. [450, 460, 455, 470]
  positive?: boolean;        // optional override for color
  width?: number;
  height?: number;
  strokeWidth?: number;
  colorUp?: string;
  colorDown?: string;
  fill?: boolean;
}

export default function SparkLine({
  points,
  positive,
  width = 120,
  height = 40,
  strokeWidth = 2,
  colorUp = '#22c55e',
  colorDown = '#ef4444',
  fill = true,
}: Props) {
  if (!points || points.length === 0) {
    return null;
  }

  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = Math.max(max - min, 1);

  const len = points.length;
  const step = len > 1 ? (width / (len - 1)) : width;

  // map to svg coords (y inverted)
  const map = (i: number) => {
    const v = points[i];
    const x = i * step;
    const y = height - ((v - min) / range) * height;
    return { x, y };
  };

  // build smooth cubic-bezier path by using midpoints for control handles
  const buildPath = () => {
    if (len === 1) {
      const p = map(0);
      return `M ${p.x} ${p.y} L ${p.x + 0.1} ${p.y}`; // tiny line for single point
    }

    let d = '';
    const p0 = map(0);
    d += `M ${p0.x} ${p0.y}`;

    for (let i = 1; i < len; i++) {
      const prev = map(i - 1);
      const curr = map(i);
      const midX = (prev.x + curr.x) / 2;
      // control points: horizontal midpoint, y controlled by each point
      const cp1x = midX;
      const cp1y = prev.y;
      const cp2x = midX;
      const cp2y = curr.y;
      d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${curr.x} ${curr.y}`;
    }
    return d;
  };

  const linePath = buildPath();

  // filled area path (line + down to bottom + back)
  const areaPath = () => {
    if (len === 1) return '';
    const last = map(len - 1);
    const first = map(0);
    return `${linePath} L ${last.x} ${height} L ${first.x} ${height} Z`;
  };

  const overallDelta = points[len - 1] - points[0];
  const isPositive = typeof positive === 'boolean' ? positive : overallDelta >= 0;
  const stroke = isPositive ? colorUp : colorDown;

  const gradientId = 'sparkGradient';

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={stroke} stopOpacity={0.18} />
          <Stop offset="60%" stopColor={stroke} stopOpacity={0.06} />
          <Stop offset="100%" stopColor={stroke} stopOpacity={0.02} />
        </LinearGradient>
      </Defs>

      <G>
        {fill && len > 1 && (
          <SvgPath d={areaPath()} fill={`url(#${gradientId})`} stroke="none" />
        )}

        <SvgPath
          d={linePath}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* highlight last point */}
        {len > 0 && (() => {
          const p = map(len - 1);
          return (
            <>
              <Circle cx={p.x} cy={p.y} r={strokeWidth * 1.6} fill="#ffffff" />
              <Circle cx={p.x} cy={p.y} r={strokeWidth} fill={stroke} />
            </>
          );
        })()}
      </G>
    </Svg>
  );
}