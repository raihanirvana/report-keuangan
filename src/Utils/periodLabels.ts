type PeriodLabelSource = {
  endDate?: string | null;
  label?: string;
  startDate?: string | null;
};

function formatPayrollPeriodLabel(period?: PeriodLabelSource | null) {
  if (!period) {
    return '';
  }

  const start = parsePeriodDate(period.startDate);
  const end = parsePeriodDate(period.endDate);

  if (!start || !end) {
    return removeTimeFromPeriodLabel(period.label ?? '');
  }

  return `${formatPeriodDate(start)} - ${formatPeriodDate(end, true)}`;
}

function parsePeriodDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatPeriodDate(date: Date, withYear = false) {
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Jakarta',
    ...(withYear ? { year: 'numeric' as const } : {}),
  });
}

function removeTimeFromPeriodLabel(label: string) {
  return label
    .replace(/,\s*\d{1,2}[.:]\d{2}/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export { formatPayrollPeriodLabel };
