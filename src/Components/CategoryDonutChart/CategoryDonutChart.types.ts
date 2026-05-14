type CategoryDonutChartItem = {
  amount: number;
  categoryId: string;
  color: string;
  name: string;
  percentage: number;
};

type CategoryDonutChartProps = {
  animationKey: number;
  centerLabel: string;
  emptyText: string;
  items: CategoryDonutChartItem[];
  totalAmount: number;
};

type CategoryDonutArcSlice = CategoryDonutChartItem & {
  sliceFraction: number;
  startFraction: number;
};

export type {
  CategoryDonutArcSlice,
  CategoryDonutChartItem,
  CategoryDonutChartProps,
};
