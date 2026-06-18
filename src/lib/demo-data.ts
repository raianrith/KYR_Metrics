import type { MetricDashboardRow, MetricEntry } from "./types";
import { METRICS_CATALOG } from "./metrics-catalog";
import { generateDemoEntries } from "./generate-demo-entries";

const id = (n: number) => `00000000-0000-0000-0000-${String(n).padStart(12, "0")}`;

const teamIds = new Map<string, string>();
const roleIds = new Map<string, string>();
const personIds = new Map<string, string>();

let teamCounter = 100;
let roleCounter = 200;
let personCounter = 300;

function teamId(name: string): string {
  if (!teamIds.has(name)) {
    teamIds.set(name, id(teamCounter++));
  }
  return teamIds.get(name)!;
}

function roleId(team: string, role: string): string {
  const key = `${team}::${role}`;
  if (!roleIds.has(key)) {
    roleIds.set(key, id(roleCounter++));
  }
  return roleIds.get(key)!;
}

function personId(name: string): string {
  if (!personIds.has(name)) {
    personIds.set(name, id(personCounter++));
  }
  return personIds.get(name)!;
}

export const DEMO_METRICS: MetricDashboardRow[] = METRICS_CATALOG.map((row) => ({
  metric_id: id(row.sortOrder),
  team: row.team,
  team_id: teamId(row.team),
  role: row.role,
  role_id: roleId(row.team, row.role),
  metric_name: row.metric,
  definition: row.definition,
  owner: row.employee,
  owner_id: row.employee ? personId(row.employee) : null,
  department_owner: row.departmentOwner,
  department_owner_id: personId(row.departmentOwner),
  how_to_pull: null,
  tier: row.tier,
  cadence: row.cadence,
  cadence_notes: null,
  value_type: row.valueType,
  target_value: row.targetValue,
  target_direction: row.targetDirection,
  target_label: row.targetLabel,
  is_active: true,
  sort_order: row.sortOrder,
  latest_actual: null,
  latest_period_end: null,
  latest_status: "pending" as const,
}));

function applyLatestFromEntries(
  metrics: MetricDashboardRow[],
  entries: MetricEntry[]
): MetricDashboardRow[] {
  const byMetric = new Map<string, MetricEntry[]>();
  for (const e of entries) {
    const list = byMetric.get(e.metric_id) ?? [];
    list.push(e);
    byMetric.set(e.metric_id, list);
  }

  return metrics.map((m) => {
    const list = byMetric.get(m.metric_id);
    if (!list?.length) return m;
    const latest = [...list].sort(
      (a, b) =>
        new Date(b.period_end).getTime() - new Date(a.period_end).getTime()
    )[0];
    return {
      ...m,
      latest_actual: latest.actual_value,
      latest_period_end: latest.period_end,
      latest_status: latest.status,
    };
  });
}

export const DEMO_ENTRIES: MetricEntry[] = generateDemoEntries();

export const DEMO_METRICS_WITH_LATEST = applyLatestFromEntries(
  DEMO_METRICS,
  DEMO_ENTRIES
);
