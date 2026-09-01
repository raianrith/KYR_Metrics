import type {
  CadenceType,
  DashboardStats,
  MetricDashboardRow,
  MetricEntry,
  Person,
  Team,
} from "./types";
import { CADENCE_SECTION_ORDER } from "./periods";

export function calcOnTrackPercent(met: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((met / total) * 100);
}

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

  return {
    totalMetrics,
    withData,
    met,
    atRisk,
    notMet,
    pending,
    onTrackPercent: calcOnTrackPercent(met, totalMetrics),
  };
}

function sortGroupsByCatalogOrder(
  groups: [string, MetricDashboardRow[]][]
): [string, MetricDashboardRow[]][] {
  return groups.sort((a, b) => {
    const ao = Math.min(...a[1].map((r) => r.sort_order));
    const bo = Math.min(...b[1].map((r) => r.sort_order));
    return ao - bo;
  });
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

export function groupByRole(rows: MetricDashboardRow[]) {
  const map = new Map<string, MetricDashboardRow[]>();
  for (const row of rows) {
    const key = row.role?.trim() ? row.role : "Unassigned";
    const existing = map.get(key) ?? [];
    existing.push(row);
    map.set(key, existing);
  }
  return sortGroupsByCatalogOrder(Array.from(map.entries()));
}

export function groupByMetricName(rows: MetricDashboardRow[]) {
  const map = new Map<string, MetricDashboardRow[]>();
  for (const row of rows) {
    const existing = map.get(row.metric_name) ?? [];
    existing.push(row);
    map.set(row.metric_name, existing);
  }
  return sortGroupsByCatalogOrder(Array.from(map.entries())).map(
    ([name, metrics]) =>
      [
        name,
        [...metrics].sort((a, b) =>
          (a.owner ?? "").localeCompare(b.owner ?? "")
        ),
      ] as [string, MetricDashboardRow[]]
  );
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

export function getMetricOwners(rows: MetricDashboardRow[]): string[] {
  return [
    ...new Set(
      rows.map((m) => m.department_owner).filter((name): name is string =>
        Boolean(name)
      )
    ),
  ].sort();
}

export function filterMetricsByMetricOwner(
  rows: MetricDashboardRow[],
  owner: string
): MetricDashboardRow[] {
  if (owner === "all") return rows;
  if (owner === "unassigned") return rows.filter((m) => !m.department_owner);
  return rows.filter((m) => m.department_owner === owner);
}

const TIER_ORDER = ["Tier 1", "Tier 2", "Tier 3", "NA", "Unassigned"];

export function normalizeTier(tier: string | null | undefined): string {
  const t = (tier ?? "").trim();
  if (!t) return "Unassigned";
  if (t.toUpperCase() === "NA") return "NA";
  if (t.startsWith("Tier")) return t;
  return `Tier ${t}`;
}

export function getMetricTiers(rows: MetricDashboardRow[]): string[] {
  const tiers = [...new Set(rows.map((m) => normalizeTier(m.tier)))];
  return tiers.sort((a, b) => {
    const ai = TIER_ORDER.indexOf(a);
    const bi = TIER_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export function filterMetricsByTier(
  rows: MetricDashboardRow[],
  tier: string
): MetricDashboardRow[] {
  if (tier === "all") return rows;
  if (tier === "unassigned") {
    return rows.filter((m) => normalizeTier(m.tier) === "Unassigned");
  }
  return rows.filter((m) => normalizeTier(m.tier) === tier);
}

export function isTier3(tier: string | null | undefined): boolean {
  return normalizeTier(tier) === "Tier 3";
}

export function partitionByTier3(rows: MetricDashboardRow[]): {
  primary: MetricDashboardRow[];
  tier3: MetricDashboardRow[];
} {
  const primary: MetricDashboardRow[] = [];
  const tier3: MetricDashboardRow[] = [];
  for (const row of rows) {
    if (isTier3(row.tier)) tier3.push(row);
    else primary.push(row);
  }
  return { primary, tier3 };
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
  onTrackPercent: number;
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
    .map(([label, stats]) => {
      const total = stats.met + stats.atRisk + stats.notMet + stats.pending;
      return {
        label,
        ...stats,
        total,
        onTrackPercent: calcOnTrackPercent(stats.met, total),
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

export type { MetricDashboardRow, MetricEntry, Person, Team };
