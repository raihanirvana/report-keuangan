type ApiErrorBody = {
  error?: {
    message?: string;
  } | null;
  message?: string | string[];
};

type ApiEnvelope<TData> = {
  data: TData;
  error: null;
  meta: Record<string, unknown>;
};

export type {
  ApiEnvelope,
  ApiErrorBody,
};
