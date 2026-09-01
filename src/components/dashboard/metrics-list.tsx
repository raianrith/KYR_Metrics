"use client";

import type { ReactNode } from "react";
import { MetricRow } from "@/components/dashboard/metric-row";
import type { MetricsGroupBy } from "@/components/dashboard/metrics-filter-bar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  groupByCadence,
  groupByDepartmentOwner,
  groupByEmployee,
  groupByMetricName,
  groupByRole,
  groupByTeam,
  normalizeTier,
} from "@/lib/metrics";
import {
  getCadenceSectionDescription,
  getPeriodSnapshotForFilter,
  type PeriodFilter,
} from "@/lib/periods";
import type { CadenceType, MetricDashboardRow, MetricEntry, MetricPeriodTarget } from "@/lib/types";
import { cadenceLabel, titleCase } from "@/lib/utils";
import { Briefcase, Calendar, Users } from "lucide-react";

interface MetricsListProps {
  metrics: MetricDashboardRow[];
  groupBy: MetricsGroupBy;
  scope: string;
  periodLabel: string;
  periodFilter: PeriodFilter;
  entriesByMetric: Record<string, MetricEntry[]>;
  chartEntriesByMetric: Record<string, MetricEntry[]>;
  periodTargetsByMetric: Record<string, MetricPeriodTarget[]>;
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
  showRole = true,
  showDefinition = true,
  titleAs = "metric",
  periodTargetsByMetric,
}: {
  items: MetricDashboardRow[];
  periodFilter: PeriodFilter;
  entriesByMetric: Record<string, MetricEntry[]>;
  chartEntriesByMetric: Record<string, MetricEntry[]>;
  showTeam?: boolean;
  showEmployee?: boolean;
  showCadence?: boolean;
  showRole?: boolean;
  showDefinition?: boolean;
  titleAs?: "metric" | "member";
  periodTargetsByMetric: Record<string, MetricPeriodTarget[]>;
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
            showRole={showRole}
            showDefinition={showDefinition}
            titleAs={titleAs}
            valueColumnLabel={snap.valueColumnLabel}
            periodDetail={snap.label}
            chartYear={chartYear}
            periodTargets={periodTargetsByMetric[m.metric_id]}
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
  periodTargetsByMetric,
}: {
  metrics: MetricDashboardRow[];
  periodFilter: PeriodFilter;
  entriesByMetric: Record<string, MetricEntry[]>;
  chartEntriesByMetric: Record<string, MetricEntry[]>;
  showTeam?: boolean;
  showEmployee?: boolean;
  periodTargetsByMetric: Record<string, MetricPeriodTarget[]>;
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
              periodTargetsByMetric={periodTargetsByMetric}
            />
          </div>
        </section>
      ))}
    </div>
  );
}

function MetricMemberGroups({
  metrics,
  periodFilter,
  entriesByMetric,
  chartEntriesByMetric,
  showTeam,
  periodTargetsByMetric,
}: {
  metrics: MetricDashboardRow[];
  periodFilter: PeriodFilter;
  entriesByMetric: Record<string, MetricEntry[]>;
  chartEntriesByMetric: Record<string, MetricEntry[]>;
  showTeam?: boolean;
  periodTargetsByMetric: Record<string, MetricPeriodTarget[]>;
}) {
  const metricGroups = groupByMetricName(metrics);

  return (
    <div className="space-y-4">
      {metricGroups.map(([name, rows]) => {
        const sample = rows[0];
        const tier = normalizeTier(sample.tier);
        const memberCount = rows.length;

        return (
          <section key={name} className="space-y-2">
            <div className="px-1">
              <div className="flex flex-wrap items-center gap-2">
                <h5 className="text-sm font-semibold text-wg-suede font-body tracking-normal">
                  {titleCase(name)}
                </h5>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-wg-light text-wg-charcoal border border-black/10">
                  {cadenceLabel(sample.cadence)}
                </span>
                {tier !== "Unassigned" && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-wg-gold/10 text-wg-gold border border-wg-gold/20">
                    {tier}
                  </span>
                )}
                <span className="text-xs text-wg-muted">
                  {memberCount} team member{memberCount === 1 ? "" : "s"}
                </span>
              </div>
              <p className="text-xs text-wg-muted mt-1 font-body normal-case">
                {sample.definition}
              </p>
            </div>
            <div className="space-y-2">
              <MetricRows
                items={rows}
                periodFilter={periodFilter}
                entriesByMetric={entriesByMetric}
                chartEntriesByMetric={chartEntriesByMetric}
                showTeam={showTeam}
                showEmployee={false}
                showRole={false}
                showDefinition={false}
                titleAs="member"
                periodTargetsByMetric={periodTargetsByMetric}
              />
            </div>
          </section>
        );
      })}
    </div>
  );
}

function RoleSections({
  metrics,
  periodFilter,
  entriesByMetric,
  chartEntriesByMetric,
  showTeam,
  periodTargetsByMetric,
}: {
  metrics: MetricDashboardRow[];
  periodFilter: PeriodFilter;
  entriesByMetric: Record<string, MetricEntry[]>;
  chartEntriesByMetric: Record<string, MetricEntry[]>;
  showTeam?: boolean;
  periodTargetsByMetric: Record<string, MetricPeriodTarget[]>;
}) {
  const roleGroups = groupByRole(metrics);

  return (
    <div className="space-y-5">
      {roleGroups.map(([role, roleMetrics]) => (
        <section
          key={role}
          className="rounded-sm border border-black/5 border-l-4 border-l-wg-suede bg-wg-light/30"
        >
          <div className="px-4 py-3 border-b border-black/5 bg-white/80">
            <div className="flex flex-wrap items-center gap-2">
              <Briefcase className="w-4 h-4 text-wg-orange shrink-0" />
              <h4 className="text-sm font-semibold text-wg-suede font-body tracking-normal">
                {titleCase(role)}
              </h4>
              <span className="text-xs text-wg-muted">
                {roleMetrics.length} metric
                {roleMetrics.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>
          <div className="p-3">
            <MetricMemberGroups
              metrics={roleMetrics}
              periodFilter={periodFilter}
              entriesByMetric={entriesByMetric}
              chartEntriesByMetric={chartEntriesByMetric}
              showTeam={showTeam}
              periodTargetsByMetric={periodTargetsByMetric}
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
  periodTargetsByMetric,
  nesting = "cadence",
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
  periodTargetsByMetric: Record<string, MetricPeriodTarget[]>;
  nesting?: "cadence" | "role" | "metric";
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
        {nesting === "role" ? (
          <RoleSections
            metrics={metrics}
            periodFilter={periodFilter}
            entriesByMetric={entriesByMetric}
            chartEntriesByMetric={chartEntriesByMetric}
            showTeam={showTeam}
            periodTargetsByMetric={periodTargetsByMetric}
          />
        ) : nesting === "metric" ? (
          <MetricMemberGroups
            metrics={metrics}
            periodFilter={periodFilter}
            entriesByMetric={entriesByMetric}
            chartEntriesByMetric={chartEntriesByMetric}
            showTeam={showTeam}
            periodTargetsByMetric={periodTargetsByMetric}
          />
        ) : (
          <CadenceSections
            metrics={metrics}
            periodFilter={periodFilter}
            entriesByMetric={entriesByMetric}
            chartEntriesByMetric={chartEntriesByMetric}
            showTeam={showTeam}
            showEmployee={showEmployee}
            periodTargetsByMetric={periodTargetsByMetric}
          />
        )}
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
  periodTargetsByMetric,
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

  return (
    <MetricsListGroups
      metrics={metrics}
      groupBy={groupBy}
      scope={scope}
      periodLabel={periodLabel}
      periodFilter={periodFilter}
      entriesByMetric={entriesByMetric}
      chartEntriesByMetric={chartEntriesByMetric}
      periodTargetsByMetric={periodTargetsByMetric}
    />
  );
}

function MetricsListGroups({
  metrics,
  groupBy,
  scope,
  periodLabel,
  periodFilter,
  entriesByMetric,
  chartEntriesByMetric,
  periodTargetsByMetric,
}: MetricsListProps) {
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
        periodTargetsByMetric={periodTargetsByMetric}
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
            nesting="role"
            periodTargetsByMetric={periodTargetsByMetric}
          />
        ))}
      </div>
    );
  }

  if (groupBy === "role") {
    const groups = groupByRole(metrics);
    return (
      <div className="space-y-4">
        {groups.map(([role, roleMetrics]) => (
          <MetricsGroupCard
            key={role}
            title={titleCase(role)}
            description={`${roleMetrics.length} metrics · ${periodLabel}`}
            metrics={roleMetrics}
            periodFilter={periodFilter}
            entriesByMetric={entriesByMetric}
            chartEntriesByMetric={chartEntriesByMetric}
            headerExtra={<Briefcase className="w-4 h-4 text-wg-orange" />}
            nesting="metric"
            periodTargetsByMetric={periodTargetsByMetric}
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
            periodTargetsByMetric={periodTargetsByMetric}
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
            periodTargetsByMetric={periodTargetsByMetric}
          />
        ))}
      </div>
    );
  }

  return null;
}
