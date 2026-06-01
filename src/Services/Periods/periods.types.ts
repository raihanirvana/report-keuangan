type PayrollPeriod = {
  endDate: string;
  id: string;
  isCurrent: boolean;
  label: string;
  name: string;
  startDate: string;
};

type CreatePeriodPayload = {
  endDate: string;
  name?: string;
  startDate: string;
};

type UpdatePeriodPayload = Partial<CreatePeriodPayload>;

export type {
  CreatePeriodPayload,
  PayrollPeriod,
  UpdatePeriodPayload,
};
