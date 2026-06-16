export type CadenceType = "monthly" | "quarterly" | "annual" | "ad_hoc";
export type MetricValueType =
  | "percentage"
  | "currency"
  | "number"
  | "ratio"
  | "days"
  | "score"
  | "boolean";
export type TargetDirection = "higher_is_better" | "lower_is_better" | "equals";
export type EntryStatus =
  | "on_track"
  | "at_risk"
  | "off_track"
  | "met"
  | "not_met"
  | "pending";

export interface Team {
  id: string;
  name: string;
  created_at: string;
}

export interface Role {
  id: string;
  team_id: string;
  name: string;
  created_at: string;
}

export interface Person {
  id: string;
  name: string;
  email: string | null;
  is_supervisor: boolean;
  created_at: string;
}

export interface Metric {
  id: string;
  team_id: string;
  role_id: string;
  name: string;
  definition: string;
  owner_id: string | null;
  department_owner_id: string | null;
  how_to_pull: string | null;
  tier: string;
  cadence: CadenceType;
  cadence_notes: string | null;
  value_type: MetricValueType;
  target_value: number | null;
  target_direction: TargetDirection;
  target_label: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MetricEntry {
  id: string;
  metric_id: string;
  period_start: string;
  period_end: string;
  actual_value: number | null;
  target_value: number | null;
  status: EntryStatus | null;
  notes: string | null;
  entered_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MetricDashboardRow {
  metric_id: string;
  team: string;
  team_id: string;
  role: string;
  role_id: string;
  metric_name: string;
  definition: string;
  owner: string | null;
  owner_id: string | null;
  department_owner: string | null;
  department_owner_id: string | null;
  how_to_pull: string | null;
  tier: string;
  cadence: CadenceType;
  cadence_notes: string | null;
  value_type: MetricValueType;
  target_value: number | null;
  target_direction: TargetDirection;
  target_label: string | null;
  is_active: boolean;
  sort_order: number;
  latest_actual: number | null;
  latest_period_end: string | null;
  latest_status: EntryStatus | null;
}

export interface MetricWithEntries extends MetricDashboardRow {
  entries: MetricEntry[];
}

export interface DashboardStats {
  totalMetrics: number;
  withData: number;
  met: number;
  atRisk: number;
  notMet: number;
  pending: number;
}
