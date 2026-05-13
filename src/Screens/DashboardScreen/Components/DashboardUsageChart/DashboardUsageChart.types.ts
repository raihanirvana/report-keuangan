import type {
  DashboardChartCategory,
  DashboardSummary,
} from '../../../../Services';

type DashboardUsageChartProps = {
  chartAnimationKey: number;
  dashboardSummary: DashboardSummary | null;
  filterLabel: string;
  isLoading: boolean;
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
