import {
  type ReactNode,
  useEffect,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  Text,
  View,
} from 'react-native';
import Svg, {
  Circle,
  G,
} from 'react-native-svg';

import styles from './CategoryDonutChart.styles';
import type {
  CategoryDonutArcSlice,
  CategoryDonutChartItem,
  CategoryDonutChartProps,
} from './CategoryDonutChart.types';

const chartGeometry = {
  center: 86,
  circumference: 2 * Math.PI * 72,
  radius: 72,
  size: 172,
  strokeWidth: 28,
} as const;

function CategoryDonutChart(props: CategoryDonutChartProps) {
  return (
    <>
      <DonutRing {...props} />
      <CategoryBreakdown emptyText={props.emptyText} items={props.items} />
    </>
  );
}

function DonutRing(props: CategoryDonutChartProps) {
  const progress = useChartAnimationProgress(props);
  const items = getNormalizedChartItems(props.items);

  return (
    <View style={styles.ring}>
      <ChartSlices progress={progress} slices={items} />
      <ChartCenter label={props.centerLabel} value={formatRupiah(props.totalAmount)} />
    </View>
  );
}

function ChartCenter(props: { label: string; value: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.centerLabel}>{props.label}</Text>
      <Text adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={2} style={styles.centerValue}>
        {props.value}
      </Text>
    </View>
  );
}

function ChartSlices(props: { progress: number; slices: CategoryDonutChartItem[] }) {
  const arcSlices = getChartArcSlices(props.slices);

  return (
    <ChartSvg>
      <ChartTrack />
      {arcSlices.map(slice => (
        <ChartSliceArc
          color={slice.color}
          key={slice.categoryId}
          progress={props.progress}
          sliceFraction={slice.sliceFraction}
          startFraction={slice.startFraction}
        />
      ))}
    </ChartSvg>
  );
}

function ChartSvg({ children }: { children: ReactNode }) {
  return (
    <Svg height={chartGeometry.size} viewBox={`0 0 ${chartGeometry.size} ${chartGeometry.size}`} width={chartGeometry.size}>
      <G originX={chartGeometry.center} originY={chartGeometry.center} rotation="-90">
        {children}
      </G>
    </Svg>
  );
}

function ChartTrack() {
  return (
    <Circle
      cx={chartGeometry.center}
      cy={chartGeometry.center}
      fill="none"
      r={chartGeometry.radius}
      stroke="#E8EEF7"
      strokeWidth={chartGeometry.strokeWidth}
    />
  );
}

function ChartSliceArc(props: {
  color: string;
  progress: number;
  sliceFraction: number;
  startFraction: number;
}) {
  const visibleFraction = getVisibleChartFraction(props);

  if (visibleFraction <= 0) {
    return null;
  }

  return <ChartSliceCircle color={props.color} startFraction={props.startFraction} visibleFraction={visibleFraction} />;
}

function ChartSliceCircle(props: {
  color: string;
  startFraction: number;
  visibleFraction: number;
}) {
  return (
    <Circle
      cx={chartGeometry.center}
      cy={chartGeometry.center}
      fill="none"
      r={chartGeometry.radius}
      stroke={props.color}
      strokeDasharray={getChartStrokeDasharray(props.visibleFraction)}
      strokeDashoffset={getChartStrokeDashOffset(props.startFraction)}
      strokeLinecap="butt"
      strokeWidth={chartGeometry.strokeWidth}
    />
  );
}

function CategoryBreakdown(props: {
  emptyText: string;
  items: CategoryDonutChartItem[];
}) {
  if (!props.items.length) {
    return <Text style={styles.emptyText}>{props.emptyText}</Text>;
  }

  return (
    <View style={styles.categoryList}>
      {props.items.map(item => <CategoryBreakdownItem item={item} key={item.categoryId} />)}
    </View>
  );
}

function CategoryBreakdownItem(props: { item: CategoryDonutChartItem }) {
  return (
    <View style={styles.categoryItem}>
      <View style={[styles.categoryDot, { backgroundColor: props.item.color }]} />
      <Text style={styles.categoryLabel}>
        {props.item.name} {formatPercentage(props.item.percentage)}
      </Text>
    </View>
  );
}

function useChartAnimationProgress(props: CategoryDonutChartProps) {
  const animatedProgress = useAnimatedProgressValue();
  const progress = useAnimatedProgressListener(animatedProgress);
  const chartSignature = JSON.stringify(props.items);

  useChartAnimationRunner(animatedProgress, props.animationKey, props.totalAmount, chartSignature);

  return progress;
}

function useAnimatedProgressValue() {
  const [animatedProgress] = useState(() => new Animated.Value(0));

  return animatedProgress;
}

function useAnimatedProgressListener(animatedProgress: Animated.Value) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const listenerId = animatedProgress.addListener(({ value }) => setProgress(value));

    return () => animatedProgress.removeListener(listenerId);
  }, [animatedProgress]);

  return progress;
}

function useChartAnimationRunner(
  animatedProgress: Animated.Value,
  animationKey: number,
  totalAmount: number,
  chartSignature: string,
) {
  useEffect(() => {
    animatedProgress.stopAnimation();
    animatedProgress.setValue(0);
    Animated.timing(animatedProgress, getChartAnimationConfig()).start();
  }, [animatedProgress, animationKey, chartSignature, totalAmount]);
}

function getChartAnimationConfig() {
  return {
    duration: 1400,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    toValue: 1,
    useNativeDriver: false,
  };
}

function getChartArcSlices(items: CategoryDonutChartItem[]) {
  const normalizedItems = getNormalizedChartItems(items);

  return normalizedItems.reduce<CategoryDonutArcSlice[]>((accumulator, item, index) => {
    const usedFraction = getUsedSliceFraction(accumulator);
    const sliceFraction = getSliceFraction(item, index, normalizedItems, usedFraction);

    accumulator.push({ ...item, sliceFraction, startFraction: usedFraction });

    return accumulator;
  }, []);
}

function getUsedSliceFraction(slices: CategoryDonutArcSlice[]) {
  return slices.reduce((sum, slice) => sum + slice.sliceFraction, 0);
}

function getSliceFraction(
  item: CategoryDonutChartItem,
  index: number,
  items: CategoryDonutChartItem[],
  usedFraction: number,
) {
  if (index === items.length - 1) {
    return Math.max(1 - usedFraction, 0);
  }

  return clampPercentage(item.percentage) / 100;
}

function getVisibleChartFraction(props: {
  progress: number;
  sliceFraction: number;
  startFraction: number;
}) {
  return Math.max(0, Math.min(props.progress - props.startFraction, props.sliceFraction));
}

function getChartStrokeDasharray(visibleFraction: number) {
  const visibleLength = chartGeometry.circumference * visibleFraction;

  return `${visibleLength} ${chartGeometry.circumference}`;
}

function getChartStrokeDashOffset(startFraction: number) {
  return -chartGeometry.circumference * startFraction;
}

function getNormalizedChartItems(items: CategoryDonutChartItem[]) {
  const totalAmount = items.reduce((sum, item) => sum + Math.max(item.amount, 0), 0);

  if (totalAmount > 0) {
    return normalizeItemsByAmount(items, totalAmount);
  }

  return normalizeItemsByPercentage(items);
}

function normalizeItemsByAmount(items: CategoryDonutChartItem[], totalAmount: number) {
  return items.map(item => ({
    ...item,
    percentage: (Math.max(item.amount, 0) / totalAmount) * 100,
  }));
}

function normalizeItemsByPercentage(items: CategoryDonutChartItem[]) {
  const totalPercentage = items.reduce((sum, item) => sum + clampPercentage(item.percentage), 0);

  if (totalPercentage <= 0) {
    return items;
  }

  return items.map(item => ({
    ...item,
    percentage: (clampPercentage(item.percentage) / totalPercentage) * 100,
  }));
}

function clampPercentage(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

function formatPercentage(value: number) {
  return `${Math.round(value)}%`;
}

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString('id-ID')}`;
}

export default CategoryDonutChart;
