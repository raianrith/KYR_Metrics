"use client";

import { PeriodSelector, type PeriodView } from "@/components/dashboard/period-selector";
import { ChartLegend, CadencePeriodStatusCharts, StatusSummary, TeamMemberOverviewChart, TeamOverviewChart } from "@/components/dashboard/charts";
import {
  filterMetricsByScope,
  MetricsFilterBar,
  type MetricsCadenceFilter,
  type MetricsGroupBy,
} from "@/components/dashboard/metrics-filter-bar";
import { MetricsList } from "@/components/dashboard/metrics-list";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  applyPeriodFilterToMetrics,
  buildPeriodFilter,
  getChartEntriesForFilter,
  getCurrentQuarter,
  getPeriodLabel,
  getQuarterBounds,
} from "@/lib/periods";
import { computeStats, filterMetricsByCadence, filterMetricsByMetricOwner, filterMetricsByTier } from "@/lib/metrics";
import type { MetricDashboardRow, MetricEntry, MetricPeriodTarget } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Target,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

interface DashboardViewProps {
  metrics: MetricDashboardRow[];
  entriesByMetric: Record<string, MetricEntry[]>;
  periodTargetsByMetric: Record<string, MetricPeriodTarget[]>;
}

export function DashboardView({
  metrics,
  entriesByMetric,
  periodTargetsByMetric,
}: DashboardViewProps) {
  const initialYear = new Date().getFullYear();
  const initialQuarter = getCurrentQuarter();
  const initialBounds = getQuarterBounds(initialYear, initialQuarter);

  const [year, setYear] = useState(initialYear);
  const [quarter, setQuarter] = useState<PeriodView>(initialQuarter);
  const [customStart, setCustomStart] = useState(initialBounds.start);
  const [customEnd, setCustomEnd] = useState(initialBounds.end);
  const [groupBy, setGroupBy] = useState<MetricsGroupBy>("team");
  const [scope, setScope] = useState("all");
  const [cadenceFilter, setCadenceFilter] = useState<MetricsCadenceFilter>("all");
  const [metricOwnerFilter, setMetricOwnerFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");

  const periodFilter = useMemo(
    () => buildPeriodFilter(year, quarter, customStart, customEnd),
    [year, quarter, customStart, customEnd]
  );

  const periodLabel = getPeriodLabel(periodFilter);

  const periodMetrics = useMemo(
    () =>
      applyPeriodFilterToMetrics(
        metrics,
        entriesByMetric,
        periodFilter,
        periodTargetsByMetric
      ),
    [metrics, entriesByMetric, periodFilter, periodTargetsByMetric]
  );

  const baseFilteredMetrics = useMemo(() => {
    let rows = filterMetricsByMetricOwner(periodMetrics, metricOwnerFilter);
    rows = filterMetricsByTier(rows, tierFilter);
    return rows;
  }, [periodMetrics, metricOwnerFilter, tierFilter]);

  const stats = computeStats(baseFilteredMetrics);

  const filteredMetrics = useMemo(() => {
    const scoped = filterMetricsByScope(baseFilteredMetrics, groupBy, scope);
    return filterMetricsByCadence(scoped, cadenceFilter);
  }, [baseFilteredMetrics, groupBy, scope, cadenceFilter]);

  const handleGroupByChange = (value: MetricsGroupBy) => {
    setGroupBy(value);
    setScope("all");
  };

  const chartEntriesByMetric = useMemo(() => {
    const result: Record<string, MetricEntry[]> = {};
    for (const m of metrics) {
      result[m.metric_id] = getChartEntriesForFilter(
        entriesByMetric[m.metric_id] ?? [],
        periodFilter
      );
    }
    return result;
  }, [metrics, entriesByMetric, periodFilter]);

  const handleYearChange = (y: number) => {
    setYear(y);
    if (quarter !== "custom" && quarter !== "full") {
      const bounds = getQuarterBounds(y, quarter);
      setCustomStart(bounds.start);
      setCustomEnd(bounds.end);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl font-normal text-wg-suede">
          Performance Dashboard
        </h2>
        <p className="text-wg-muted mt-2 font-body normal-case tracking-normal">
          Track Know Your Role metrics by period. Monthly metrics show period
          averages; quarterly and yearly metrics show a single value for the
          selected timeframe.
        </p>
      </div>

      <PeriodSelector
        year={year}
        quarter={quarter}
        customStart={customStart}
        customEnd={customEnd}
        onYearChange={handleYearChange}
        onQuarterChange={setQuarter}
        onCustomRangeChange={(start, end) => {
          setCustomStart(start);
          setCustomEnd(end);
        }}
        entriesByMetric={entriesByMetric}
      />

      <div className="rounded-sm border border-black/5 bg-wg-light/40 px-4 py-3 -mt-4 space-y-2">
        <p className="text-sm text-wg-charcoal font-body normal-case">
          Showing results for{" "}
          <strong className="text-wg-suede">{periodLabel}</strong>
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-wg-muted font-body normal-case">
          <p>
            <span className="font-medium text-wg-charcoal">Monthly</span> — month
            average with coverage (e.g. 2/3 months)
          </p>
          <p>
            <span className="font-medium text-wg-charcoal">Quarterly</span> —
            one value for the selected quarter
          </p>
          <p>
            <span className="font-medium text-wg-charcoal">Yearly</span> — one
            value for the calendar year
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          label="Total Metrics"
          value={stats.totalMetrics}
          icon={BarChart3}
          variant="default"
        />
        <StatCard
          label="With Data"
          value={stats.withData}
          icon={Target}
          variant="default"
          subtitle={`${formatNumber((stats.withData / stats.totalMetrics) * 100 || 0)}% For ${periodLabel}`}
        />
        <StatCard
          label="On Track"
          value={stats.met}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          label="At Risk"
          value={stats.atRisk}
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          label="Not Met"
          value={stats.notMet}
          icon={XCircle}
          variant="danger"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={Clock}
          variant="muted"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
            <CardDescription>
              Status breakdown by team · {periodLabel}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TeamOverviewChart rows={baseFilteredMetrics} />
            <ChartLegend />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overall Status</CardTitle>
            <CardDescription>{periodLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusSummary
              met={stats.met}
              atRisk={stats.atRisk}
              notMet={stats.notMet}
              pending={stats.pending}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Member Performance</CardTitle>
          <CardDescription>
            Status breakdown by team member · {periodLabel}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamMemberOverviewChart rows={baseFilteredMetrics} />
          <ChartLegend />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status by Period</CardTitle>
          <CardDescription>
            How monthly, quarterly, and yearly metrics performed across each
            period · {periodLabel}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CadencePeriodStatusCharts
            metrics={baseFilteredMetrics}
            entriesByMetric={entriesByMetric}
            periodFilter={periodFilter}
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <MetricsFilterBar
          groupBy={groupBy}
          scope={scope}
          cadence={cadenceFilter}
          metricOwner={metricOwnerFilter}
          tier={tierFilter}
          metrics={periodMetrics}
          onGroupByChange={handleGroupByChange}
          onScopeChange={setScope}
          onCadenceChange={setCadenceFilter}
          onMetricOwnerChange={setMetricOwnerFilter}
          onTierChange={setTierFilter}
        />

        <MetricsList
          metrics={filteredMetrics}
          groupBy={groupBy}
          scope={scope}
          periodLabel={periodLabel}
          periodFilter={periodFilter}
          entriesByMetric={entriesByMetric}
          chartEntriesByMetric={chartEntriesByMetric}
          periodTargetsByMetric={periodTargetsByMetric}
        />
      </div>
    </div>
  );
}
