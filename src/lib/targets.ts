import type { CadenceType, MetricDashboardRow, MetricPeriodTarget } from "./types";
import {
  getMonthBounds,
  getQuarterBounds,
  monthName,
  monthsInQuarter,
  formatQuarterWithMonths,
  type PeriodFilter,
  QUARTERS,
} from "./periods";

export interface TargetPeriodSlot {
  key: string;
  label: string;
  period_start: string;
  period_end: string;
}

export function groupPeriodTargetsByMetric(
  targets: MetricPeriodTarget[]
): Record<string, MetricPeriodTarget[]> {
  const map: Record<string, MetricPeriodTarget[]> = {};
  for (const target of targets) {
    if (!map[target.metric_id]) map[target.metric_id] = [];
    map[target.metric_id].push(target);
  }
  return map;
}

export function getTargetPeriodSlots(
  cadence: CadenceType,
  year: number
): TargetPeriodSlot[] {
  if (cadence === "monthly") {
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const bounds = getMonthBounds(year, month);
      return {
        key: bounds.start,
        label: monthName(month),
        period_start: bounds.start,
        period_end: bounds.end,
      };
    });
  }

  if (cadence === "quarterly") {
    return QUARTERS.map((q) => {
      const bounds = getQuarterBounds(year, q);
      return {
        key: bounds.start,
        label: formatQuarterWithMonths(year, q),
        period_start: bounds.start,
        period_end: bounds.end,
      };
    });
  }

  if (cadence === "annual") {
    return [
      {
        key: `${year}-01-01`,
        label: String(year),
        period_start: `${year}-01-01`,
        period_end: `${year}-12-31`,
      },
    ];
  }

  return [];
}

export function findPeriodTarget(
  targets: MetricPeriodTarget[],
  periodStart: string,
  periodEnd: string
): number | null {
  const match = targets.find(
    (t) => t.period_start === periodStart && t.period_end === periodEnd
  );
  return match?.target_value ?? null;
}

export function resolveTargetValue(
  metric: Pick<MetricDashboardRow, "target_value">,
  periodStart: string,
  periodEnd: string,
  periodTargets: MetricPeriodTarget[] | undefined,
  entryTarget?: number | null
): number | null {
  if (entryTarget != null) return entryTarget;
  const periodTarget = findPeriodTarget(
    periodTargets ?? [],
    periodStart,
    periodEnd
  );
  if (periodTarget != null) return periodTarget;
  return metric.target_value;
}

function collectTargetValues(
  targets: MetricPeriodTarget[],
  year: number,
  months: number[]
): number[] {
  return months
    .map((m) => {
      const bounds = getMonthBounds(year, m);
      return findPeriodTarget(targets, bounds.start, bounds.end);
    })
    .filter((v): v is number => v !== null);
}

export function resolveDisplayTargetForFilter(
  metric: MetricDashboardRow,
  periodTargets: MetricPeriodTarget[] | undefined,
  filter: PeriodFilter
): number | null {
  const targets = periodTargets ?? [];

  if (filter.mode === "custom") {
    if (metric.cadence === "monthly") {
      const values: number[] = [];
      const start = new Date(filter.start + "T00:00:00");
      const end = new Date(filter.end + "T00:00:00");
      const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
      while (cursor <= end) {
        const bounds = getMonthBounds(
          cursor.getFullYear(),
          cursor.getMonth() + 1
        );
        const value = findPeriodTarget(
          targets,
          bounds.start,
          bounds.end
        );
        if (value !== null) values.push(value);
        cursor.setMonth(cursor.getMonth() + 1);
      }
      if (values.length === 0) return metric.target_value;
      return values.reduce((sum, v) => sum + v, 0) / values.length;
    }
    return metric.target_value;
  }

  const { year, quarter } = filter;

  if (metric.cadence === "monthly") {
    const months =
      quarter === "full"
        ? Array.from({ length: 12 }, (_, i) => i + 1)
        : monthsInQuarter(quarter);
    const values = collectTargetValues(targets, year, months);
    if (values.length === 0) return metric.target_value;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  if (metric.cadence === "quarterly") {
    if (quarter === "full") {
      const values = QUARTERS.map((q) => {
        const bounds = getQuarterBounds(year, q);
        return findPeriodTarget(targets, bounds.start, bounds.end);
      }).filter((v): v is number => v !== null);
      if (values.length === 0) return metric.target_value;
      return values[values.length - 1];
    }
    const bounds = getQuarterBounds(year, quarter);
    return (
      findPeriodTarget(targets, bounds.start, bounds.end) ??
      metric.target_value
    );
  }

  if (metric.cadence === "annual") {
    return (
      findPeriodTarget(targets, `${year}-01-01`, `${year}-12-31`) ??
      metric.target_value
    );
  }

  return metric.target_value;
}

export function periodTargetsForYear(
  targets: MetricPeriodTarget[],
  year: number
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const target of targets) {
    const y = new Date(target.period_start + "T00:00:00").getFullYear();
    if (y !== year) continue;
    if (target.target_value !== null) {
      map[target.period_start] = String(target.target_value);
    }
  }
  return map;
}

export function targetSummaryForMetric(
  metric: MetricDashboardRow,
  periodTargets?: MetricPeriodTarget[]
): string {
  if (metric.target_label) return metric.target_label;

  const targets = periodTargets ?? [];
  const currentYear = new Date().getFullYear();
  const slots = getTargetPeriodSlots(
    metric.cadence === "ad_hoc" ? "monthly" : metric.cadence,
    currentYear
  );
  const values = slots
    .map((slot) => findPeriodTarget(targets, slot.period_start, slot.period_end))
    .filter((v): v is number => v !== null);

  if (values.length > 1) {
    const unique = [...new Set(values)];
    if (unique.length === 1) return String(unique[0]);
    return `${Math.min(...values)}–${Math.max(...values)}`;
  }
  if (values.length === 1) return String(values[0]);
  if (metric.target_value !== null) return String(metric.target_value);
  return "—";
}
