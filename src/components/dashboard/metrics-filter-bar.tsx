"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CadenceType, MetricDashboardRow } from "@/lib/types";
import { cadenceLabel, cn, titleCase } from "@/lib/utils";
import { Filter } from "lucide-react";

export type MetricsGroupBy = "team" | "employee" | "supervisor" | "all";
export type MetricsCadenceFilter = "all" | CadenceType;

const GROUP_LABELS: Record<MetricsGroupBy, string> = {
  team: "Team",
  employee: "Employee",
  supervisor: "Supervisor",
  all: "All Metrics",
};

interface MetricsFilterBarProps {
  groupBy: MetricsGroupBy;
  scope: string;
  cadence: MetricsCadenceFilter;
  metrics: MetricDashboardRow[];
  onGroupByChange: (value: MetricsGroupBy) => void;
  onScopeChange: (value: string) => void;
  onCadenceChange: (value: MetricsCadenceFilter) => void;
  className?: string;
}

function scopeOptions(
  groupBy: MetricsGroupBy,
  metrics: MetricDashboardRow[]
): { value: string; label: string }[] {
  const all = { value: "all", label: `All ${GROUP_LABELS[groupBy]}s` };

  if (groupBy === "all") {
    const teams = [...new Set(metrics.map((m) => m.team))].sort();
    return [
      { value: "all", label: "All Metrics" },
      ...teams.map((t) => ({ value: `team:${t}`, label: titleCase(t) })),
    ];
  }

  if (groupBy === "team") {
    const teams = [...new Set(metrics.map((m) => m.team))].sort();
    return [all, ...teams.map((t) => ({ value: t, label: titleCase(t) }))];
  }

  if (groupBy === "employee") {
    const employees = [
      ...new Set(metrics.map((m) => m.owner).filter(Boolean) as string[]),
    ].sort();
    return [all, ...employees.map((e) => ({ value: e, label: titleCase(e) }))];
  }

  if (groupBy === "supervisor") {
    const supervisors = [
      ...new Set(
        metrics.map((m) => m.department_owner).filter(Boolean) as string[]
      ),
    ].sort();
    return [
      all,
      ...supervisors.map((s) => ({ value: s, label: titleCase(s) })),
    ];
  }

  return [all];
}

export function MetricsFilterBar({
  groupBy,
  scope,
  cadence,
  metrics,
  onGroupByChange,
  onScopeChange,
  onCadenceChange,
  className,
}: MetricsFilterBarProps) {
  const options = scopeOptions(groupBy, metrics);
  const scopeLabel =
    groupBy === "all"
      ? "Team"
      : GROUP_LABELS[groupBy];

  const cadenceOptions: { value: MetricsCadenceFilter; label: string }[] = [
    { value: "all", label: "All Cadences" },
    ...(["monthly", "quarterly", "annual"] as const).map((c) => ({
      value: c,
      label: cadenceLabel(c),
    })),
  ];

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 p-4 rounded-sm bg-white border border-black/5",
        className
      )}
    >
      <Filter className="w-4 h-4 text-wg-muted shrink-0" />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium text-wg-muted shrink-0">
          Group By
        </span>
        <Select
          value={groupBy}
          onValueChange={(v) => onGroupByChange(v as MetricsGroupBy)}
        >
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="team">Team</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
            <SelectItem value="supervisor">Supervisor</SelectItem>
            <SelectItem value="all">All Metrics</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-px h-6 bg-black/10 hidden sm:block" />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium text-wg-muted shrink-0">
          {scopeLabel}
        </span>
        <Select value={scope} onValueChange={onScopeChange}>
          <SelectTrigger className="w-[200px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-px h-6 bg-black/10 hidden sm:block" />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium text-wg-muted shrink-0">
          Cadence
        </span>
        <Select
          value={cadence}
          onValueChange={(v) => onCadenceChange(v as MetricsCadenceFilter)}
        >
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {cadenceOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function filterMetricsByScope(
  metrics: MetricDashboardRow[],
  groupBy: MetricsGroupBy,
  scope: string
): MetricDashboardRow[] {
  if (scope === "all") return metrics;

  if (groupBy === "all" && scope.startsWith("team:")) {
    return metrics.filter((m) => m.team === scope.slice(5));
  }

  switch (groupBy) {
    case "team":
      return metrics.filter((m) => m.team === scope);
    case "employee":
      return metrics.filter((m) => m.owner === scope);
    case "supervisor":
      return metrics.filter((m) => m.department_owner === scope);
    default:
      return metrics;
  }
}
