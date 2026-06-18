import type {
  CadenceType,
  DashboardStats,
  EntryStatus,
  MetricDashboardRow,
  MetricEntry,
  Person,
  Team,
} from "./types";
import {
  CADENCE_SECTION_ORDER,
  getAnnualBucketsForYearComparison,
  getMonthlyBucketsInRange,
  getQuarterlyBucketsForYear,
  resolveFilterRange,
  type PeriodFilter,
} from "./periods";

export function computeStats(rows: MetricDashboardRow[]): DashboardStats {
  const totalMetrics = rows.length;
  const withData = rows.filter((r) => r.latest_actual !== null).length;
  const met = rows.filter(
    (r) => r.latest_status === "met" || r.latest_status === "on_track"
  ).length;
  const atRisk = rows.filter((r) => r.latest_status === "at_risk").length;
  const notMet = rows.filter(
    (r) => r.latest_status === "not_met" || r.latest_status === "off_track"
  ).length;
  const pending = rows.filter(
    (r) => !r.latest_status || r.latest_status === "pending"
  ).length;

  return { totalMetrics, withData, met, atRisk, notMet, pending };
}

export function groupByTeam(rows: MetricDashboardRow[]) {
  const map = new Map<string, MetricDashboardRow[]>();
  for (const row of rows) {
    const existing = map.get(row.team) ?? [];
    existing.push(row);
    map.set(row.team, existing);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export function groupByEmployee(rows: MetricDashboardRow[]) {
  const map = new Map<string, MetricDashboardRow[]>();
  for (const row of rows) {
    const key = row.owner ?? "Unassigned";
    const existing = map.get(key) ?? [];
    existing.push(row);
    map.set(key, existing);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export function groupByOwner(rows: MetricDashboardRow[]) {
  return groupByEmployee(rows);
}

export function groupByDepartmentOwner(rows: MetricDashboardRow[]) {
  const map = new Map<string, MetricDashboardRow[]>();
  for (const row of rows) {
    const key = row.department_owner ?? "Unassigned";
    const existing = map.get(key) ?? [];
    existing.push(row);
    map.set(key, existing);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export function groupByCadence(rows: MetricDashboardRow[]) {
  const map = new Map<CadenceType, MetricDashboardRow[]>();
  for (const row of rows) {
    const existing = map.get(row.cadence) ?? [];
    existing.push(row);
    map.set(row.cadence, existing);
  }
  return CADENCE_SECTION_ORDER.filter((c) => map.has(c)).map((cadence) => [
    cadence,
    map.get(cadence)!,
  ] as const);
}

export function filterMetricsByCadence(
  rows: MetricDashboardRow[],
  cadence: CadenceType | "all"
): MetricDashboardRow[] {
  if (cadence === "all") return rows;
  return rows.filter((r) => r.cadence === cadence);
}

export function computeEntryStatus(
  actual: number,
  target: number | null,
  direction: string
): string {
  if (target === null) return "on_track";
  switch (direction) {
    case "lower_is_better":
      return actual <= target ? "met" : "not_met";
    case "equals":
      return actual === target ? "met" : "not_met";
    default:
      return actual >= target ? "met" : "not_met";
  }
}

export function buildTrendData(
  entries: MetricEntry[],
  valueType: string
): { period: string; actual: number; target: number | null }[] {
  return entries
    .filter((e) => e.actual_value !== null)
    .sort(
      (a, b) =>
        new Date(a.period_end).getTime() - new Date(b.period_end).getTime()
    )
    .map((e) => ({
      period: new Date(e.period_end).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }),
      actual: e.actual_value!,
      target: e.target_value,
    }));
}

export const TEAM_COLORS: Record<string, string> = {
  Pinnacle: "#112721",
  Administration: "#a86a40",
  "Marketing Solutions": "#ff6700",
  "Business Development": "#1a3d32",
  "Client Services": "#cca92c",
  "Creative Services": "#8b5a3c",
  Operations: "#4a6741",
  Design: "#6b4c9a",
  "Web Dev": "#5c6b66",
  "Paid Ads": "#c45c26",
};

export function getTeamColor(team: string): string {
  return TEAM_COLORS[team] ?? "#a0a9a6";
}

export interface StatusBreakdownRow {
  label: string;
  met: number;
  atRisk: number;
  notMet: number;
  pending: number;
  total: number;
}

export type PeriodStatusGranularity = "monthly" | "quarterly" | "yearly";

export interface PeriodStatusRow {
  label: string;
  met: number;
  onTrack: number;
  atRisk: number;
  notMet: number;
  missing: number;
  total: number;
}

const GRANULARITY_CADENCE: Record<PeriodStatusGranularity, CadenceType> = {
  monthly: "monthly",
  quarterly: "quarterly",
  yearly: "annual",
};

function classifyEntryStatus(status: EntryStatus | null | undefined) {
  if (!status || status === "pending") return "missing" as const;
  switch (status) {
    case "met":
      return "met" as const;
    case "on_track":
      return "onTrack" as const;
    case "at_risk":
      return "atRisk" as const;
    case "not_met":
    case "off_track":
      return "notMet" as const;
    default:
      return "missing" as const;
  }
}

export function buildCadencePeriodStatus(
  metrics: MetricDashboardRow[],
  entriesByMetric: Record<string, MetricEntry[]>,
  filter: PeriodFilter,
  granularity: PeriodStatusGranularity
): PeriodStatusRow[] {
  const cadence = GRANULARITY_CADENCE[granularity];
  const relevantMetrics = metrics.filter((m) => m.cadence === cadence);
  const range = resolveFilterRange(filter);

  const buckets =
    granularity === "monthly"
      ? getMonthlyBucketsInRange(range.start, range.end)
      : granularity === "quarterly"
        ? getQuarterlyBucketsForYear(range.year)
        : getAnnualBucketsForYearComparison(range.year);

  return buckets.map((bucket) => {
    const counts = {
      met: 0,
      onTrack: 0,
      atRisk: 0,
      notMet: 0,
      missing: 0,
    };

    for (const metric of relevantMetrics) {
      const entries = entriesByMetric[metric.metric_id] ?? [];
      const entry = entries.find(
        (e) => e.period_end >= bucket.start && e.period_end <= bucket.end
      );

      if (!entry || entry.actual_value === null) {
        counts.missing++;
        continue;
      }

      const statusKey = classifyEntryStatus(entry.status);
      counts[statusKey]++;
    }

    return {
      label: bucket.label,
      ...counts,
      total: relevantMetrics.length,
    };
  });
}

export function countMetricsByCadence(
  metrics: MetricDashboardRow[],
  granularity: PeriodStatusGranularity
): number {
  return metrics.filter((m) => m.cadence === GRANULARITY_CADENCE[granularity])
    .length;
}

export function buildStatusBreakdown(
  rows: MetricDashboardRow[],
  getGroup: (row: MetricDashboardRow) => string
): StatusBreakdownRow[] {
  const map = new Map<
    string,
    { met: number; atRisk: number; notMet: number; pending: number }
  >();

  for (const row of rows) {
    const key = getGroup(row);
    if (!map.has(key)) {
      map.set(key, { met: 0, atRisk: 0, notMet: 0, pending: 0 });
    }
    const bucket = map.get(key)!;
    const s = row.latest_status;
    if (s === "met" || s === "on_track") bucket.met++;
    else if (s === "at_risk") bucket.atRisk++;
    else if (s === "not_met" || s === "off_track") bucket.notMet++;
    else bucket.pending++;
  }

  return Array.from(map.entries())
    .map(([label, stats]) => ({
      label,
      ...stats,
      total: stats.met + stats.atRisk + stats.notMet + stats.pending,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export type { MetricDashboardRow, MetricEntry, Person, Team };
