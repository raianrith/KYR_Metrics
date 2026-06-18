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

export function entryInRange(
  entry: MetricEntry,
  start: string,
  end: string
): boolean {
  return entry.period_end >= start && entry.period_end <= end;
}

export function getEntriesForRange(
  entries: MetricEntry[],
  start: string,
  end: string
): MetricEntry[] {
  return entries
    .filter((e) => entryInRange(e, start, end))
    .sort(
      (a, b) =>
        new Date(a.period_end).getTime() - new Date(b.period_end).getTime()
    );
}

export function countMonthsInRange(start: string, end: string): number {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  return (
    (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1
  );
}

export function countWeeksInRange(start: string, end: string): number {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  const days =
    Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, Math.ceil(days / 7));
}

function periodicPeriodSnapshot(
  relevant: MetricEntry[],
  cadence: "monthly" | "weekly",
  periodsExpected: number
): PeriodSnapshot {
  const unit = cadence === "weekly" ? "Weeks" : "Months";
  const withValues = relevant.filter((e) => e.actual_value !== null);
  const periodsEntered = withValues.length;

  if (withValues.length === 0) {
    return {
      actual: null,
      status: "pending",
      periodEnd: relevant[relevant.length - 1]?.period_end ?? null,
      monthsEntered: 0,
      monthsExpected: periodsExpected,
      entryCount: relevant.length,
      isComplete: false,
      label: `0/${periodsExpected} ${unit}`,
      displayMode: "average",
      valueColumnLabel: cadence === "weekly" ? "Week Avg" : "Month Avg",
    };
  }

  const avg =
    withValues.reduce((s, e) => s + e.actual_value!, 0) / withValues.length;
  const latest = withValues[withValues.length - 1];

  return {
    actual: avg,
    status: latest.status,
    periodEnd: latest.period_end,
    monthsEntered: periodsEntered,
    monthsExpected: periodsExpected,
    entryCount: relevant.length,
    isComplete: periodsEntered >= periodsExpected,
    label: `${periodsEntered}/${periodsExpected} ${unit}`,
    displayMode: "average",
    valueColumnLabel: cadence === "weekly" ? "Week Avg" : "Month Avg",
  };
}

export function formatCustomRangeLabel(start: string, end: string): string {
  const fmt = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  return `${fmt(start)} – ${fmt(end)}`;
}

export type PeriodFilter =
  | { mode: "preset"; year: number; quarter: Quarter | "full" }
  | { mode: "custom"; start: string; end: string };

export function buildPeriodFilter(
  year: number,
  view: Quarter | "full" | "custom",
  customStart: string,
  customEnd: string
): PeriodFilter {
  if (view === "custom") {
    return { mode: "custom", start: customStart, end: customEnd };
  }
  return { mode: "preset", year, quarter: view };
}

export function getPeriodLabel(filter: PeriodFilter): string {
  if (filter.mode === "custom") {
    return formatCustomRangeLabel(filter.start, filter.end);
  }
  if (filter.quarter === "full") {
    return `${filter.year} Full Year (Jan – Dec)`;
  }
  return formatQuarterWithMonths(filter.year, filter.quarter);
}

export function getPeriodSnapshotForFilter(
  entries: MetricEntry[],
  cadence: CadenceType,
  filter: PeriodFilter
): PeriodSnapshot {
  if (filter.mode === "custom") {
    return getPeriodSnapshotForRange(
      entries,
      cadence,
      filter.start,
      filter.end
    );
  }
  return getPeriodSnapshot(
    entries,
    cadence,
    filter.year,
    filter.quarter
  );
}

export function getPeriodSnapshotForRange(
  entries: MetricEntry[],
  cadence: CadenceType,
  start: string,
  end: string
): PeriodSnapshot {
  const relevant = getEntriesForRange(entries, start, end);

  if (relevant.length === 0) {
    return {
      actual: null,
      status: null,
      periodEnd: null,
      entryCount: 0,
      isComplete: false,
      displayMode:
        cadence === "monthly" || cadence === "weekly" ? "average" : "point",
      valueColumnLabel: getCadenceValueColumnLabel(cadence),
    };
  }

  if (cadence === "monthly" || cadence === "weekly") {
    const periodsExpected =
      cadence === "weekly"
        ? countWeeksInRange(start, end)
        : countMonthsInRange(start, end);
    return periodicPeriodSnapshot(
      relevant,
      cadence,
      periodsExpected
    );
  }

  if (cadence === "annual") {
    const year = new Date(end + "T00:00:00").getFullYear();
    return pointPeriodSnapshot(
      relevant,
      "Year",
      `${year} Year`
    );
  }

  if (cadence === "quarterly") {
    const latest = relevant[relevant.length - 1];
    const endDate = new Date(latest.period_end + "T00:00:00");
    const q = getQuarter(endDate);
    return pointPeriodSnapshot(
      relevant,
      "Quarter",
      `Q${q} ${endDate.getFullYear()}`
    );
  }

  return pointPeriodSnapshot(relevant, "Value");
}

export function getChartEntriesForFilter(
  entries: MetricEntry[],
  filter: PeriodFilter
): MetricEntry[] {
  if (filter.mode === "custom") {
    return getEntriesForRange(entries, filter.start, filter.end);
  }
  return getEntriesForYear(entries, filter.year);
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
  displayMode?: "average" | "point";
  valueColumnLabel?: string;
}

export const CADENCE_SECTION_ORDER: CadenceType[] = [
  "weekly",
  "monthly",
  "quarterly",
  "annual",
  "ad_hoc",
];

export function getCadenceValueColumnLabel(cadence: CadenceType): string {
  switch (cadence) {
    case "weekly":
      return "Week Avg";
    case "monthly":
      return "Month Avg";
    case "quarterly":
      return "Quarter";
    case "annual":
      return "Year";
    default:
      return "Value";
  }
}

export function getCadenceSectionDescription(
  cadence: CadenceType,
  filter: PeriodFilter
): string {
  const period = getPeriodLabel(filter);
  switch (cadence) {
    case "weekly":
      return `Average of weekly entries across ${period}. Coverage shows weeks with data entered.`;
    case "monthly":
      return `Average of monthly entries across ${period}. Coverage shows months with data entered.`;
    case "quarterly":
      if (filter.mode === "preset" && filter.quarter === "full") {
        return `Latest quarterly result for ${filter.year}. Coverage shows quarters entered.`;
      }
      return `Single quarterly value for ${period}.`;
    case "annual":
      if (filter.mode === "preset" && filter.quarter !== "full") {
        return `Yearly metric for ${filter.mode === "preset" ? filter.year : period} — shown regardless of quarter selection.`;
      }
      return `Single yearly value for ${period}.`;
    default:
      return `Values reported in ${period}.`;
  }
}

function pointPeriodSnapshot(
  relevant: MetricEntry[],
  valueColumnLabel: string,
  label?: string
): PeriodSnapshot {
  if (relevant.length === 0) {
    return {
      actual: null,
      status: null,
      periodEnd: null,
      entryCount: 0,
      isComplete: false,
      displayMode: "point",
      valueColumnLabel,
      label,
    };
  }

  const latest = relevant[relevant.length - 1];
  return {
    actual: latest.actual_value,
    status: latest.status,
    periodEnd: latest.period_end,
    entryCount: relevant.length,
    isComplete: latest.actual_value !== null,
    displayMode: "point",
    valueColumnLabel,
    label,
  };
}

function quarterlyYearSnapshot(
  relevant: MetricEntry[],
  year: number
): PeriodSnapshot {
  const withValues = relevant.filter((e) => e.actual_value !== null);
  if (withValues.length === 0) {
    return {
      actual: null,
      status: "pending",
      periodEnd: relevant[relevant.length - 1]?.period_end ?? null,
      entryCount: relevant.length,
      isComplete: false,
      displayMode: "point",
      valueColumnLabel: "Quarter",
      label: `0/4 Quarters · ${year}`,
    };
  }

  const latest = withValues[withValues.length - 1];
  return {
    actual: latest.actual_value,
    status: latest.status,
    periodEnd: latest.period_end,
    entryCount: relevant.length,
    isComplete: withValues.length >= 4,
    displayMode: "point",
    valueColumnLabel: "Quarter",
    label: `${withValues.length}/4 Quarters · ${year}`,
  };
}

export function getPeriodSnapshot(
  entries: MetricEntry[],
  cadence: CadenceType,
  year: number,
  quarter: Quarter | "full"
): PeriodSnapshot {
  if (cadence === "annual") {
    const yearEntries = getEntriesForYear(entries, year);
    return pointPeriodSnapshot(
      yearEntries,
      "Year",
      quarter === "full" ? `${year} Full Year` : `${year} Year`
    );
  }

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
      displayMode:
        cadence === "monthly" || cadence === "weekly" ? "average" : "point",
      valueColumnLabel: getCadenceValueColumnLabel(cadence),
    };
  }

  if (cadence === "monthly" && quarter !== "full") {
    return periodicPeriodSnapshot(relevant, "monthly", 3);
  }

  if (cadence === "weekly" && quarter !== "full") {
    return periodicPeriodSnapshot(relevant, "weekly", 13);
  }

  if (cadence === "monthly" && quarter === "full") {
    return periodicPeriodSnapshot(relevant, "monthly", 12);
  }

  if (cadence === "weekly" && quarter === "full") {
    return periodicPeriodSnapshot(relevant, "weekly", 52);
  }

  if (cadence === "quarterly" && quarter === "full") {
    return quarterlyYearSnapshot(relevant, year);
  }

  if (cadence === "quarterly" && quarter !== "full") {
    return pointPeriodSnapshot(
      relevant,
      "Quarter",
      formatQuarterWithMonths(year, quarter)
    );
  }

  return pointPeriodSnapshot(relevant, getCadenceValueColumnLabel(cadence));
}

export function applyPeriodToMetrics(
  metrics: MetricDashboardRow[],
  entriesByMetric: Record<string, MetricEntry[]>,
  year: number,
  quarter: Quarter | "full"
): MetricDashboardRow[] {
  return applyPeriodFilterToMetrics(metrics, entriesByMetric, {
    mode: "preset",
    year,
    quarter,
  });
}

export function applyPeriodFilterToMetrics(
  metrics: MetricDashboardRow[],
  entriesByMetric: Record<string, MetricEntry[]>,
  filter: PeriodFilter
): MetricDashboardRow[] {
  return metrics.map((m) => {
    const entries = entriesByMetric[m.metric_id] ?? [];
    const snap = getPeriodSnapshotForFilter(entries, m.cadence, filter);
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
  return Array.from(years)
    .filter((y) => y !== 2025)
    .sort((a, b) => b - a);
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
