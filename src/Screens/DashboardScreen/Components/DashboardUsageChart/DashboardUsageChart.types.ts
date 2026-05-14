import type { CategoryDonutChartItem } from '../../../../Components/CategoryDonutChart';
import type { DashboardSummary } from '../../../../Services';

type DashboardUsageChartProps = {
  apiMonth: string;
  chartAnimationKey: number;
  dashboardSummary: DashboardSummary | null;
  filterLabel: string;
  isLoading: boolean;
  onOpenUsagePeriod: () => void;
};

type IncomeChartState = {
  hide: () => void;
  isHidden: boolean;
  isLoading: boolean;
  items: CategoryDonutChartItem[];
  totalAmount: number;
};

export type {
  DashboardUsageChartProps,
  IncomeChartState,
};
