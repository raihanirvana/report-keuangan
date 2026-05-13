import type {
  DashboardChartCategory,
  DashboardSummary,
} from '../../../../Services';

type DashboardUsageChartProps = {
  chartAnimationKey: number;
  dashboardSummary: DashboardSummary | null;
  filterLabel: string;
  onOpenUsagePeriod: () => void;
};

type ChartArcSlice = DashboardChartCategory & {
  sliceFraction: number;
  startFraction: number;
};

export type {
  ChartArcSlice,
  DashboardUsageChartProps,
};
