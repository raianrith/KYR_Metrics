import type { CadenceType, MetricDashboardRow, MetricEntry } from "./types";

export type Quarter = 1 | 2 | 3 | 4;

export const QUARTERS: Quarter[] = [1, 2, 3, 4];

export function getQuarter(date: Date | string): Quarter {
  const d = typeof date === "string" ? new Date(date + "T00:00:00") : date;
  return (Math.ceil((d.getMonth() + 1) / 3) as Quarter);
}

export function getQuarterBounds(year: number, quarter: Quarter) {
  const startMonth = (quarter - 1) * 3;
  const start = new Date(year, startMonth, 1);
  const end = new Date(year, startMonth + 3, 0);
  return {
    start: toDateString(start),
    end: toDateString(end),
  };
}

export function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function formatQuarterLabel(year: number, quarter: Quarter): string {
  return `Q${quarter} ${year} (${QUARTER_MONTH_RANGES[quarter]})`;
}

export const QUARTER_MONTH_RANGES: Record<Quarter, string> = {
  1: "Jan – Mar",
  2: "Apr – Jun",
  3: "Jul – Sep",
  4: "Oct – Dec",
};

export function quarterMonthRange(quarter: Quarter): string {
  return QUARTER_MONTH_RANGES[quarter];
}

export function formatQuarterWithMonths(
  year: number,
  quarter: Quarter
): string {
  return `Q${quarter} ${year} (${QUARTER_MONTH_RANGES[quarter]})`;
}

export function formatQuarterButtonLabel(quarter: Quarter): string {
  return `Q${quarter} · ${QUARTER_MONTH_RANGES[quarter]}`;
}

export function getMonthBounds(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return { start: toDateString(start), end: toDateString(end) };
}

export function monthsInQuarter(quarter: Quarter): number[] {
  const start = (quarter - 1) * 3 + 1;
  return [start, start + 1, start + 2];
}

export function monthName(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
  });
}

export function entryInQuarter(
  entry: MetricEntry,
  year: number,
  quarter: Quarter
): boolean {
  const end = new Date(entry.period_end + "T00:00:00");
  return end.getFullYear() === year && getQuarter(end) === quarter;
}

export function entryInYear(entry: MetricEntry, year: number): boolean {
  const end = new Date(entry.period_end + "T00:00:00");
  return end.getFullYear() === year;
}

export function getEntriesForQuarter(
  entries: MetricEntry[],
  year: number,
  quarter: Quarter
): MetricEntry[] {
  return entries
    .filter((e) => entryInQuarter(e, year, quarter))
    .sort(
      (a, b) =>
        new Date(a.period_end).getTime() - new Date(b.period_end).getTime()
    );
}

export function getEntriesForYear(
  entries: MetricEntry[],
  year: number
): MetricEntry[] {
  return entries
    .filter((e) => entryInYear(e, year))
    .sort(
      (a, b) =>
        new Date(a.period_end).getTime() - new Date(b.period_end).getTime()
    );
}

export interface PeriodSnapshot {
  actual: number | null;
  status: string | null;
  periodEnd: string | null;
  monthsEntered?: number;
  monthsExpected?: number;
  entryCount: number;
  isComplete: boolean;
  label?: string;
}

export function getPeriodSnapshot(
  entries: MetricEntry[],
  cadence: CadenceType,
  year: number,
  quarter: Quarter | "full"
): PeriodSnapshot {
  const relevant =
    quarter === "full"
      ? getEntriesForYear(entries, year)
      : getEntriesForQuarter(entries, year, quarter);

  if (relevant.length === 0) {
    return {
      actual: null,
      status: null,
      periodEnd: null,
      entryCount: 0,
      isComplete: false,
    };
  }

  if (cadence === "monthly" && quarter !== "full") {
    const monthsExpected = 3;
    const withValues = relevant.filter((e) => e.actual_value !== null);
    const monthsEntered = withValues.length;
    const isComplete = monthsEntered >= monthsExpected;

    if (withValues.length === 0) {
      return {
        actual: null,
        status: "pending",
        periodEnd: relevant[relevant.length - 1]?.period_end ?? null,
        monthsEntered: 0,
        monthsExpected,
        entryCount: relevant.length,
        isComplete: false,
        label: `0/${monthsExpected} Months`,
      };
    }

    const avg =
      withValues.reduce((s, e) => s + e.actual_value!, 0) / withValues.length;
    const latest = withValues[withValues.length - 1];

    return {
      actual: avg,
      status: latest.status,
      periodEnd: latest.period_end,
      monthsEntered,
      monthsExpected,
      entryCount: relevant.length,
      isComplete,
      label: `${monthsEntered}/${monthsExpected} Months`,
    };
  }

  if (cadence === "monthly" && quarter === "full") {
    const withValues = relevant.filter((e) => e.actual_value !== null);
    if (withValues.length === 0) {
      return {
        actual: null,
        status: "pending",
        periodEnd: null,
        entryCount: 0,
        isComplete: false,
        label: `0/12 Months`,
      };
    }
    const avg =
      withValues.reduce((s, e) => s + e.actual_value!, 0) / withValues.length;
    const latest = withValues[withValues.length - 1];
    return {
      actual: avg,
      status: latest.status,
      periodEnd: latest.period_end,
      monthsEntered: withValues.length,
      monthsExpected: 12,
      entryCount: relevant.length,
      isComplete: withValues.length >= 12,
      label: `${withValues.length}/12 Months`,
    };
  }

  const latest = relevant[relevant.length - 1];
  return {
    actual: latest.actual_value,
    status: latest.status,
    periodEnd: latest.period_end,
    entryCount: relevant.length,
    isComplete: latest.actual_value !== null,
  };
}

export function applyPeriodToMetrics(
  metrics: MetricDashboardRow[],
  entriesByMetric: Record<string, MetricEntry[]>,
  year: number,
  quarter: Quarter | "full"
): MetricDashboardRow[] {
  return metrics.map((m) => {
    const entries = entriesByMetric[m.metric_id] ?? [];
    const snap = getPeriodSnapshot(entries, m.cadence, year, quarter);
    return {
      ...m,
      latest_actual: snap.actual,
      latest_period_end: snap.periodEnd,
      latest_status: snap.status as MetricDashboardRow["latest_status"],
    };
  });
}

export function getAvailableYears(
  entriesByMetric: Record<string, MetricEntry[]>,
  fallbackYear?: number
): number[] {
  const years = new Set<number>();
  for (const entries of Object.values(entriesByMetric)) {
    for (const e of entries) {
      years.add(new Date(e.period_end + "T00:00:00").getFullYear());
    }
  }
  const current = fallbackYear ?? new Date().getFullYear();
  years.add(current);
  years.add(current - 1);
  return Array.from(years).sort((a, b) => b - a);
}

export function getCurrentQuarter(): Quarter {
  return getQuarter(new Date());
}

export interface CoverageCell {
  snapshot: PeriodSnapshot;
  entries: MetricEntry[];
}

export function getCoverageGrid(
  metrics: MetricDashboardRow[],
  entriesByMetric: Record<string, MetricEntry[]>,
  year: number
): Record<string, Record<Quarter, CoverageCell>> {
  const grid: Record<string, Record<Quarter, CoverageCell>> = {};
  for (const m of metrics) {
    grid[m.metric_id] = {} as Record<Quarter, CoverageCell>;
    for (const q of QUARTERS) {
      const entries = entriesByMetric[m.metric_id] ?? [];
      grid[m.metric_id][q] = {
        snapshot: getPeriodSnapshot(entries, m.cadence, year, q),
        entries: getEntriesForQuarter(entries, year, q),
      };
    }
  }
  return grid;
}

export function countCoverage(
  metrics: MetricDashboardRow[],
  entriesByMetric: Record<string, MetricEntry[]>,
  year: number,
  quarter: Quarter
) {
  let filled = 0;
  let partial = 0;
  let missing = 0;

  for (const m of metrics) {
    const snap = getPeriodSnapshot(
      entriesByMetric[m.metric_id] ?? [],
      m.cadence,
      year,
      quarter
    );
    if (!snap.entryCount) missing++;
    else if (snap.isComplete) filled++;
    else partial++;
  }

  return { filled, partial, missing, total: metrics.length };
}
