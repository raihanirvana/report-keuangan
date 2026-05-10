import { useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';

import styles from './DottedPattern.styles';

const DOT_SIZE = 6;
const DOT_SPACING = 34;

function createDots(width: number, height: number) {
  const columns = Math.floor(width / DOT_SPACING) + 1;
  const rows = Math.floor(height / DOT_SPACING) + 1;
  const horizontalOffset = (width - (columns - 1) * DOT_SPACING) / 2;
  const verticalOffset = (height - (rows - 1) * DOT_SPACING) / 2;

  return Array.from({ length: columns * rows }, (_, index) => ({
    left: horizontalOffset + (index % columns) * DOT_SPACING,
    top: verticalOffset + Math.floor(index / columns) * DOT_SPACING,
  }));
}

function DottedPattern() {
  const { height, width } = useWindowDimensions();
  const dots = useMemo(() => createDots(width, height), [height, width]);

  return (
    <View pointerEvents="none" style={[styles.pattern, { height, width }]}>
      {dots.map((dot, index) => (
        <View
          key={index}
          style={[styles.dot, { height: DOT_SIZE, width: DOT_SIZE, ...dot }]}
        />
      ))}
    </View>
  );
}

export default DottedPattern;
