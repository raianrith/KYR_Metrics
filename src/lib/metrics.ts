import type {
  DashboardStats,
  MetricDashboardRow,
  MetricEntry,
  Person,
  Team,
} from "./types";

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

export function groupByOwner(rows: MetricDashboardRow[]) {
  const map = new Map<string, MetricDashboardRow[]>();
  for (const row of rows) {
    const key = row.owner ?? row.department_owner ?? "Unassigned";
    const existing = map.get(key) ?? [];
    existing.push(row);
    map.set(key, existing);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
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

export function groupByTier(rows: MetricDashboardRow[]) {
  const map = new Map<string, MetricDashboardRow[]>();
  for (const row of rows) {
    const existing = map.get(row.tier) ?? [];
    existing.push(row);
    map.set(row.tier, existing);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
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
  "Web Dev": "#5c6b66",
};

export function getTeamColor(team: string): string {
  return TEAM_COLORS[team] ?? "#a0a9a6";
}

export type { MetricDashboardRow, MetricEntry, Person, Team };
