"use client";

import type { ReactNode } from "react";
import { MetricRow } from "@/components/dashboard/metric-row";
import type { MetricsGroupBy } from "@/components/dashboard/metrics-filter-bar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  groupByCadence,
  groupByDepartmentOwner,
  groupByEmployee,
  groupByTeam,
} from "@/lib/metrics";
import {
  getCadenceSectionDescription,
  getPeriodSnapshotForFilter,
  type PeriodFilter,
} from "@/lib/periods";
import type { CadenceType, MetricDashboardRow, MetricEntry } from "@/lib/types";
import { cadenceLabel, titleCase } from "@/lib/utils";
import { Calendar, Users } from "lucide-react";

interface MetricsListProps {
  metrics: MetricDashboardRow[];
  groupBy: MetricsGroupBy;
  scope: string;
  periodLabel: string;
  periodFilter: PeriodFilter;
  entriesByMetric: Record<string, MetricEntry[]>;
  chartEntriesByMetric: Record<string, MetricEntry[]>;
}

const CADENCE_ACCENT: Record<CadenceType, string> = {
  monthly: "border-l-wg-orange",
  quarterly: "border-l-violet-500",
  annual: "border-l-emerald-600",
  ad_hoc: "border-l-wg-muted",
};

function MetricRows({
  items,
  periodFilter,
  entriesByMetric,
  chartEntriesByMetric,
  showTeam = true,
  showEmployee = true,
  showCadence = false,
}: {
  items: MetricDashboardRow[];
  periodFilter: PeriodFilter;
  entriesByMetric: Record<string, MetricEntry[]>;
  chartEntriesByMetric: Record<string, MetricEntry[]>;
  showTeam?: boolean;
  showEmployee?: boolean;
  showCadence?: boolean;
}) {
  const chartYear =
    periodFilter.mode === "preset" ? periodFilter.year : undefined;

  return (
    <>
      {items.map((m) => {
        const snap = getPeriodSnapshotForFilter(
          entriesByMetric[m.metric_id] ?? [],
          m.cadence,
          periodFilter
        );
        return (
          <MetricRow
            key={m.metric_id}
            metric={m}
            entries={chartEntriesByMetric[m.metric_id] ?? []}
            showTeam={showTeam}
            showEmployee={showEmployee}
            showCadence={showCadence}
            valueColumnLabel={snap.valueColumnLabel}
            periodDetail={snap.label}
            chartYear={chartYear}
          />
        );
      })}
    </>
  );
}

function CadenceSections({
  metrics,
  periodFilter,
  entriesByMetric,
  chartEntriesByMetric,
  showTeam,
  showEmployee,
}: {
  metrics: MetricDashboardRow[];
  periodFilter: PeriodFilter;
  entriesByMetric: Record<string, MetricEntry[]>;
  chartEntriesByMetric: Record<string, MetricEntry[]>;
  showTeam?: boolean;
  showEmployee?: boolean;
}) {
  const cadenceGroups = groupByCadence(metrics);

  return (
    <div className="space-y-5">
      {cadenceGroups.map(([cadence, cadenceMetrics]) => (
        <section
          key={cadence}
          className={`rounded-sm border border-black/5 border-l-4 ${CADENCE_ACCENT[cadence]} bg-wg-light/30`}
        >
          <div className="px-4 py-3 border-b border-black/5 bg-white/80">
            <div className="flex flex-wrap items-center gap-2">
              <Calendar className="w-4 h-4 text-wg-orange shrink-0" />
              <h4 className="text-sm font-semibold text-wg-suede font-body tracking-normal">
                {cadenceLabel(cadence)} Metrics
              </h4>
              <span className="text-xs text-wg-muted">
                {cadenceMetrics.length} metric
                {cadenceMetrics.length === 1 ? "" : "s"}
              </span>
            </div>
            <p className="text-xs text-wg-muted mt-1 font-body normal-case">
              {getCadenceSectionDescription(cadence, periodFilter)}
            </p>
          </div>
          <div className="p-3 space-y-2">
            <MetricRows
              items={cadenceMetrics}
              periodFilter={periodFilter}
              entriesByMetric={entriesByMetric}
              chartEntriesByMetric={chartEntriesByMetric}
              showTeam={showTeam}
              showEmployee={showEmployee}
            />
          </div>
        </section>
      ))}
    </div>
  );
}

function MetricsGroupCard({
  title,
  description,
  metrics,
  periodFilter,
  entriesByMetric,
  chartEntriesByMetric,
  showTeam,
  showEmployee,
  headerExtra,
}: {
  title: string;
  description: string;
  metrics: MetricDashboardRow[];
  periodFilter: PeriodFilter;
  entriesByMetric: Record<string, MetricEntry[]>;
  chartEntriesByMetric: Record<string, MetricEntry[]>;
  showTeam?: boolean;
  showEmployee?: boolean;
  headerExtra?: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {headerExtra}
          <CardTitle className="text-base">{title}</CardTitle>
          {headerExtra && (
            <span className="text-xs text-wg-muted ml-auto">
              {metrics.length} metrics
            </span>
          )}
        </div>
        {!headerExtra && (
          <CardDescription>{description}</CardDescription>
        )}
        {headerExtra && (
          <CardDescription className="mt-1">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <CadenceSections
          metrics={metrics}
          periodFilter={periodFilter}
          entriesByMetric={entriesByMetric}
          chartEntriesByMetric={chartEntriesByMetric}
          showTeam={showTeam}
          showEmployee={showEmployee}
        />
      </CardContent>
    </Card>
  );
}

export function MetricsList({
  metrics,
  groupBy,
  scope,
  periodLabel,
  periodFilter,
  entriesByMetric,
  chartEntriesByMetric,
}: MetricsListProps) {
  if (metrics.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-wg-muted font-body normal-case">
          No metrics match the current filters.
        </CardContent>
      </Card>
    );
  }

  if (groupBy === "all") {
    return (
      <MetricsGroupCard
        title={
          scope === "all"
            ? "All KYR Metrics"
            : titleCase(scope.startsWith("team:") ? scope.slice(5) : scope)
        }
        description={`${metrics.length} metrics · ${periodLabel}`}
        metrics={metrics}
        periodFilter={periodFilter}
        entriesByMetric={entriesByMetric}
        chartEntriesByMetric={chartEntriesByMetric}
      />
    );
  }

  if (groupBy === "team") {
    const groups = groupByTeam(metrics);
    return (
      <div className="space-y-4">
        {groups.map(([team, teamMetrics]) => (
          <MetricsGroupCard
            key={team}
            title={titleCase(team)}
            description={`${teamMetrics.length} metrics · ${periodLabel}`}
            metrics={teamMetrics}
            periodFilter={periodFilter}
            entriesByMetric={entriesByMetric}
            chartEntriesByMetric={chartEntriesByMetric}
            showTeam={false}
          />
        ))}
      </div>
    );
  }

  if (groupBy === "employee") {
    const groups = groupByEmployee(metrics);
    return (
      <div className="space-y-4">
        {groups.map(([employee, employeeMetrics]) => (
          <MetricsGroupCard
            key={employee}
            title={titleCase(employee)}
            description={periodLabel}
            metrics={employeeMetrics}
            periodFilter={periodFilter}
            entriesByMetric={entriesByMetric}
            chartEntriesByMetric={chartEntriesByMetric}
            showTeam
            showEmployee={false}
            headerExtra={<Users className="w-4 h-4 text-wg-orange" />}
          />
        ))}
      </div>
    );
  }

  if (groupBy === "metric_owner") {
    const groups = groupByDepartmentOwner(metrics);
    return (
      <div className="space-y-4">
        {groups.map(([owner, ownerMetrics]) => (
          <MetricsGroupCard
            key={owner}
            title={titleCase(owner)}
            description={`Metric Owner · ${periodLabel}`}
            metrics={ownerMetrics}
            periodFilter={periodFilter}
            entriesByMetric={entriesByMetric}
            chartEntriesByMetric={chartEntriesByMetric}
            headerExtra={<Users className="w-4 h-4 text-wg-orange" />}
          />
        ))}
      </div>
    );
  }

  return null;
}
