import {
  type ReactNode,
  useEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  Text,
  View,
} from 'react-native';
import Svg, {
  Circle,
  G,
} from 'react-native-svg';

import type {
  DashboardChartCategory,
  DashboardSummary,
} from '../../../../Services';

import styles from './DashboardUsageChart.styles';
import type {
  ChartArcSlice,
  DashboardUsageChartProps,
} from './DashboardUsageChart.types';

const chartGeometry = {
  center: 86,
  circumference: 2 * Math.PI * 72,
  radius: 72,
  size: 172,
  strokeWidth: 28,
} as const;

function DashboardUsageChart(props: DashboardUsageChartProps) {
  const chart = props.dashboardSummary?.chart;
  const categories = getChartCategories(chart);

  return (
    <View style={styles.section}>
      <UsageSectionHeader {...props} />
      <View style={styles.card}>
        {props.isLoading ? (
          <UsageChartLoadingState />
        ) : (
          <>
            <DonutChart animationKey={props.chartAnimationKey} chart={chart} />
            <CategoryBreakdown categories={categories} />
          </>
        )}
      </View>
    </View>
  );
}

function UsageSectionHeader(props: {
  filterLabel: string;
  isLoading: boolean;
  onOpenUsagePeriod: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Penggunaan Dompet Ini</Text>
      <Pressable disabled={props.isLoading} onPress={props.onOpenUsagePeriod}>
        <Text style={[styles.sectionLink, props.isLoading && styles.sectionLinkDisabled]}>
          {props.isLoading ? 'Memuat...' : `${props.filterLabel}⌄`}
        </Text>
      </Pressable>
    </View>
  );
}

function UsageChartLoadingState() {
  return (
    <View style={styles.loadingState}>
      <ActivityIndicator color={styles.loadingSpinner.color} size="large" />
      <Text style={styles.loadingText}>Memuat penggunaan dompet...</Text>
    </View>
  );
}

function DonutChart(props: {
  animationKey: number;
  chart?: DashboardSummary['chart'];
}) {
  const progress = useChartAnimationProgress(props.chart, props.animationKey);
  const categories = getNormalizedChartCategories(getChartCategories(props.chart));

  return (
    <View style={styles.ring}>
      <ChartSlices progress={progress} slices={categories} />
      <ChartCenter value={formatRupiah(getChartExpenseTotal(props.chart))} />
    </View>
  );
}

function ChartCenter({ value }: { value: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.centerLabel}>KELUAR</Text>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.72}
        numberOfLines={2}
        style={styles.centerValue}
      >
        {value}
      </Text>
    </View>
  );
}

function ChartSlices(props: { progress: number; slices: DashboardChartCategory[] }) {
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
  const visibleFraction = getVisibleChartFraction(
    props.progress,
    props.startFraction,
    props.sliceFraction,
  );

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

function CategoryBreakdown(props: { categories: DashboardChartCategory[] }) {
  if (!props.categories.length) {
    return <Text style={styles.emptyText}>Belum ada pengeluaran.</Text>;
  }

  return (
    <View style={styles.categoryList}>
      {props.categories.map(category => (
        <View key={category.categoryId} style={styles.categoryItem}>
          <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
          <Text style={styles.categoryLabel}>
            {category.name} {formatPercentage(category.percentage)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function useChartAnimationProgress(
  chart: DashboardSummary['chart'] | undefined,
  animationKey: number,
) {
  const animatedProgress = useAnimatedProgressValue();
  const progress = useAnimatedProgressListener(animatedProgress);
  const chartSignature = JSON.stringify(chart?.categories ?? []);

  useChartAnimationRunner(
    animatedProgress,
    animationKey,
    chart?.expenseTotal,
    chartSignature,
  );

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
  expenseTotal: number | undefined,
  chartSignature: string,
) {
  useEffect(() => {
    animatedProgress.stopAnimation();
    animatedProgress.setValue(0);
    Animated.timing(animatedProgress, getChartAnimationConfig()).start();
  }, [animatedProgress, animationKey, chartSignature, expenseTotal]);
}

function getChartAnimationConfig() {
  return {
    duration: 1400,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    toValue: 1,
    useNativeDriver: false,
  };
}

function getChartArcSlices(categories: DashboardChartCategory[]) {
  const normalizedCategories = getNormalizedChartCategories(categories);

  return normalizedCategories.reduce<ChartArcSlice[]>((accumulator, category, index) => {
    const usedFraction = getUsedSliceFraction(accumulator);
    const sliceFraction = getSliceFraction(category, index, normalizedCategories, usedFraction);

    accumulator.push({
      ...category,
      sliceFraction,
      startFraction: usedFraction,
    });

    return accumulator;
  }, []);
}

function getUsedSliceFraction(slices: ChartArcSlice[]) {
  return slices.reduce((sum, slice) => sum + slice.sliceFraction, 0);
}

function getSliceFraction(
  category: DashboardChartCategory,
  index: number,
  categories: DashboardChartCategory[],
  usedFraction: number,
) {
  if (index === categories.length - 1) {
    return Math.max(1 - usedFraction, 0);
  }

  return clampPercentage(category.percentage) / 100;
}

function getVisibleChartFraction(
  progress: number,
  startFraction: number,
  sliceFraction: number,
) {
  return Math.max(0, Math.min(progress - startFraction, sliceFraction));
}

function getChartStrokeDasharray(visibleFraction: number) {
  const visibleLength = chartGeometry.circumference * visibleFraction;

  return `${visibleLength} ${chartGeometry.circumference}`;
}

function getChartStrokeDashOffset(startFraction: number) {
  return -chartGeometry.circumference * startFraction;
}

function getNormalizedChartCategories(categories: DashboardChartCategory[]) {
  const totalAmount = categories.reduce(
    (sum, category) => sum + Math.max(category.amount, 0),
    0,
  );

  if (totalAmount > 0) {
    return normalizeCategoriesByAmount(categories, totalAmount);
  }

  return normalizeCategoriesByPercentage(categories);
}

function normalizeCategoriesByAmount(
  categories: DashboardChartCategory[],
  totalAmount: number,
) {
  return categories.map(category => ({
    ...category,
    percentage: (Math.max(category.amount, 0) / totalAmount) * 100,
  }));
}

function normalizeCategoriesByPercentage(categories: DashboardChartCategory[]) {
  const totalPercentage = categories.reduce(
    (sum, category) => sum + clampPercentage(category.percentage),
    0,
  );

  if (totalPercentage <= 0) {
    return categories;
  }

  return categories.map(category => ({
    ...category,
    percentage: (clampPercentage(category.percentage) / totalPercentage) * 100,
  }));
}

function clampPercentage(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

function getChartCategories(chart?: DashboardSummary['chart']) {
  return chart?.categories ?? [];
}

function getChartExpenseTotal(chart?: DashboardSummary['chart']) {
  return chart?.expenseTotal ?? 0;
}

function formatPercentage(value: number) {
  return `${Math.round(value)}%`;
}

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString('id-ID')}`;
}

export default DashboardUsageChart;
