"use client";

import { MetricRow } from "@/components/dashboard/metric-row";
import { PeriodSelector, type PeriodView } from "@/components/dashboard/period-selector";
import { StatusSummary, TeamOverviewChart } from "@/components/dashboard/charts";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  applyPeriodToMetrics,
  formatQuarterWithMonths,
  getCurrentQuarter,
  getEntriesForYear,
  getPeriodSnapshot,
  quarterMonthRange,
} from "@/lib/periods";
import {
  computeStats,
  groupByDepartmentOwner,
  groupByOwner,
  groupByTeam,
  groupByTier,
} from "@/lib/metrics";
import type { MetricDashboardRow, MetricEntry } from "@/lib/types";
import { formatNumber, titleCase } from "@/lib/utils";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Target,
  Users,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

interface DashboardViewProps {
  metrics: MetricDashboardRow[];
  entriesByMetric: Record<string, MetricEntry[]>;
}

export function DashboardView({ metrics, entriesByMetric }: DashboardViewProps) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState<PeriodView>(getCurrentQuarter());

  const periodLabel =
    quarter === "full"
      ? `${year} Full Year (Jan – Dec)`
      : formatQuarterWithMonths(year, quarter);

  const periodMetrics = useMemo(
    () => applyPeriodToMetrics(metrics, entriesByMetric, year, quarter),
    [metrics, entriesByMetric, year, quarter]
  );

  const stats = computeStats(periodMetrics);

  const byTeam = groupByTeam(periodMetrics);
  const byOwner = groupByOwner(periodMetrics);
  const byDeptOwner = groupByDepartmentOwner(periodMetrics);
  const byTier = groupByTier(periodMetrics);

  const yearEntriesByMetric = useMemo(() => {
    const result: Record<string, MetricEntry[]> = {};
    for (const m of metrics) {
      result[m.metric_id] = getEntriesForYear(
        entriesByMetric[m.metric_id] ?? [],
        year
      );
    }
    return result;
  }, [metrics, entriesByMetric, year]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl font-normal text-wg-suede">
          Performance Dashboard
        </h2>
        <p className="text-wg-muted mt-2 font-body normal-case tracking-normal">
          Track Know Your Role metrics by quarter and year. Click any metric to
          view its trend chart.
        </p>
      </div>

      <PeriodSelector
        year={year}
        quarter={quarter}
        onYearChange={setYear}
        onQuarterChange={setQuarter}
        entriesByMetric={entriesByMetric}
      />

      <p className="text-sm text-wg-muted font-body normal-case -mt-4">
        Showing results for <strong className="text-wg-charcoal">{periodLabel}</strong>
        {quarter !== "full" && (
          <span>
            {" "}
            · Monthly metrics average entered months in {quarterMonthRange(quarter as 1 | 2 | 3 | 4)}
          </span>
        )}
      </p>

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
            <TeamOverviewChart rows={periodMetrics} />
            <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-wg-muted font-body normal-case">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-wg-suede" /> Met
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-wg-orange" /> At Risk
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-wg-gold" /> Not Met
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-wg-muted/40" /> Pending
              </span>
            </div>
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

      <Tabs defaultValue="team" className="w-full">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="team">By Team</TabsTrigger>
          <TabsTrigger value="all">All Metrics</TabsTrigger>
          <TabsTrigger value="owner">By Owner</TabsTrigger>
          <TabsTrigger value="supervisor">By Supervisor</TabsTrigger>
          <TabsTrigger value="tier">By Tier</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All KYR Metrics</CardTitle>
              <CardDescription>
                {metrics.length} metrics · {periodLabel}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {periodMetrics.map((m) => {
                const snap = getPeriodSnapshot(
                  entriesByMetric[m.metric_id] ?? [],
                  m.cadence,
                  year,
                  quarter
                );
                return (
                  <MetricRow
                    key={m.metric_id}
                    metric={m}
                    entries={yearEntriesByMetric[m.metric_id] ?? []}
                    periodLabel={periodLabel}
                    periodDetail={snap.label}
                    chartYear={year}
                  />
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <div className="space-y-4">
            {byTeam.map(([team, teamMetrics]) => (
              <Card key={team}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{titleCase(team)}</CardTitle>
                  <CardDescription>
                    {teamMetrics.length} metrics · {periodLabel}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {teamMetrics.map((m) => {
                    const snap = getPeriodSnapshot(
                      entriesByMetric[m.metric_id] ?? [],
                      m.cadence,
                      year,
                      quarter
                    );
                    return (
                      <MetricRow
                        key={m.metric_id}
                        metric={m}
                        entries={yearEntriesByMetric[m.metric_id] ?? []}
                        showTeam={false}
                        periodLabel={periodLabel}
                        periodDetail={snap.label}
                        chartYear={year}
                      />
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="owner">
          {byOwner.map(([owner, ownerMetrics]) => (
            <Card key={owner} className="mb-4">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-wg-orange" />
                  <CardTitle className="text-base">{titleCase(owner)}</CardTitle>
                  <span className="text-xs text-wg-muted ml-auto">
                    {ownerMetrics.length} metrics
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {ownerMetrics.map((m) => {
                  const snap = getPeriodSnapshot(
                    entriesByMetric[m.metric_id] ?? [],
                    m.cadence,
                    year,
                    quarter
                  );
                  return (
                    <MetricRow
                      key={m.metric_id}
                      metric={m}
                      entries={yearEntriesByMetric[m.metric_id] ?? []}
                      showTeam={false}
                      periodLabel={periodLabel}
                      periodDetail={snap.label}
                      chartYear={year}
                    />
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="supervisor">
          {byDeptOwner.map(([supervisor, supMetrics]) => (
            <Card key={supervisor} className="mb-4">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-wg-orange" />
                  <CardTitle className="text-base">
                    {titleCase(supervisor)}
                    <span className="text-xs font-normal text-wg-muted ml-2">
                      Department Owner
                    </span>
                  </CardTitle>
                  <span className="text-xs text-wg-muted ml-auto">
                    {supMetrics.length} metrics
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {supMetrics.map((m) => {
                  const snap = getPeriodSnapshot(
                    entriesByMetric[m.metric_id] ?? [],
                    m.cadence,
                    year,
                    quarter
                  );
                  return (
                    <MetricRow
                      key={m.metric_id}
                      metric={m}
                      entries={yearEntriesByMetric[m.metric_id] ?? []}
                      periodLabel={periodLabel}
                      periodDetail={snap.label}
                      chartYear={year}
                    />
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="tier">
          {byTier.map(([tier, tierMetrics]) => (
            <Card key={tier} className="mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{tier}</CardTitle>
                <CardDescription>
                  {tierMetrics.length} metrics · {periodLabel}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {tierMetrics.map((m) => {
                  const snap = getPeriodSnapshot(
                    entriesByMetric[m.metric_id] ?? [],
                    m.cadence,
                    year,
                    quarter
                  );
                  return (
                    <MetricRow
                      key={m.metric_id}
                      metric={m}
                      entries={yearEntriesByMetric[m.metric_id] ?? []}
                      periodLabel={periodLabel}
                      periodDetail={snap.label}
                      chartYear={year}
                    />
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
