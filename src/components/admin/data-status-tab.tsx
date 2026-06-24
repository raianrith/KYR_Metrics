"use client";

import type { MetricDashboardRow, MetricEntry } from "@/lib/types";
import type { Quarter } from "@/lib/periods";
import {
  QUARTERS,
  countCoverage,
  formatQuarterWithMonths,
  getCoverageGrid,
  getPeriodSnapshot,
  quarterMonthRange,
  getAvailableYears,
} from "@/lib/periods";
import { MetricOwnerFilter } from "@/components/shared/metric-owner-filter";
import { TierFilter } from "@/components/shared/tier-filter";
import { filterMetricsByMetricOwner, filterMetricsByTier, normalizeTier } from "@/lib/metrics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cadenceLabel, fieldLabelClass, formatValue, statusColor, statusLabel, titleCase } from "@/lib/utils";
import { CheckCircle2, Circle, CircleDashed, Filter } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataStatusTabProps {
  metrics: MetricDashboardRow[];
  entriesByMetric: Record<string, MetricEntry[]>;
  year: number;
  onYearChange: (year: number) => void;
  onJumpToEntry: (metricId: string, quarter: Quarter) => void;
}

export function DataStatusTab({
  metrics,
  entriesByMetric,
  year,
  onYearChange,
  onJumpToEntry,
}: DataStatusTabProps) {
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [metricOwnerFilter, setMetricOwnerFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const years = getAvailableYears(entriesByMetric);
  const teams = [...new Set(metrics.map((m) => m.team))].sort();

  const filteredMetrics = useMemo(() => {
    let rows = metrics;
    if (teamFilter !== "all") {
      rows = rows.filter((m) => m.team === teamFilter);
    }
    rows = filterMetricsByMetricOwner(rows, metricOwnerFilter);
    rows = filterMetricsByTier(rows, tierFilter);

    return rows.filter((m) => {
      if (statusFilter === "all") return true;

      const hasGap = QUARTERS.some((q) => {
        const snap = getPeriodSnapshot(
          entriesByMetric[m.metric_id] ?? [],
          m.cadence,
          year,
          q
        );
        return !snap.isComplete && snap.entryCount === 0;
      });
      const hasPartial = QUARTERS.some((q) => {
        const snap = getPeriodSnapshot(
          entriesByMetric[m.metric_id] ?? [],
          m.cadence,
          year,
          q
        );
        return snap.entryCount > 0 && !snap.isComplete;
      });
      const allComplete = QUARTERS.every((q) => {
        const snap = getPeriodSnapshot(
          entriesByMetric[m.metric_id] ?? [],
          m.cadence,
          year,
          q
        );
        return snap.isComplete;
      });

      if (statusFilter === "missing") return hasGap;
      if (statusFilter === "partial") return hasPartial;
      if (statusFilter === "complete") return allComplete;
      return true;
    });
  }, [metrics, entriesByMetric, year, teamFilter, metricOwnerFilter, tierFilter, statusFilter]);

  const grid = getCoverageGrid(filteredMetrics, entriesByMetric, year);

  const quarterStats = QUARTERS.map((q) => ({
    quarter: q,
    ...countCoverage(filteredMetrics, entriesByMetric, year, q),
  }));

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quarterStats.map(({ quarter, filled, partial, missing, total }) => (
          <Card key={quarter}>
            <CardContent className="p-4">
              <p className="text-[11px] font-medium text-wg-muted">
                {formatQuarterWithMonths(year, quarter)}
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-display text-2xl text-wg-suede">
                  {filled}/{total}
                </span>
                <span className="text-xs text-wg-muted font-body normal-case">
                  complete
                </span>
              </div>
              <div className="flex gap-3 mt-2 text-[10px] font-body normal-case text-wg-muted">
                {partial > 0 && (
                  <span className="text-wg-orange">{partial} partial</span>
                )}
                {missing > 0 && (
                  <span className="text-wg-gold">{missing} missing</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Data Coverage · {year}</CardTitle>
              <CardDescription>
                Green = complete · Orange = partial · Empty = no data yet. Click a cell to add or update.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={String(year)}
                onValueChange={(v) => onYearChange(Number(v))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={teamFilter} onValueChange={setTeamFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="w-3.5 h-3.5 mr-1" />
                  <SelectValue placeholder="Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {teams.map((t) => (
                    <SelectItem key={t} value={t}>
                      {titleCase(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <MetricOwnerFilter
                value={metricOwnerFilter}
                onChange={setMetricOwnerFilter}
                metrics={metrics}
              />
              <TierFilter
                value={tierFilter}
                onChange={setTierFilter}
                metrics={metrics}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="missing">Has Gaps</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="complete">All Quarters</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm font-body normal-case min-w-[800px]">
            <thead>
              <tr className="border-b border-black/10">
                <th className="text-left py-3 pr-4 text-[11px] font-medium text-wg-muted sticky left-0 bg-white">
                  Metric
                </th>
                {QUARTERS.map((q) => (
                  <th
                    key={q}
                    className="text-center py-3 px-2 text-[11px] font-medium text-wg-muted w-[140px]"
                  >
                    <div>Q{q}</div>
                    <div className="text-[10px] font-normal text-wg-muted/80 mt-0.5">
                      {quarterMonthRange(q)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMetrics.map((m) => (
                <tr key={m.metric_id} className="border-b border-black/5">
                  <td className="py-3 pr-4 sticky left-0 bg-white">
                    <p className="font-medium text-wg-charcoal">{titleCase(m.metric_name)}</p>
                    <p className="text-xs text-wg-muted">
                      {titleCase(m.team)} · {titleCase(m.role)}
                      {m.tier ? ` · ${normalizeTier(m.tier)}` : ""}
                      {m.owner ? ` · ${titleCase(m.owner)}` : ""}
                    </p>
                  </td>
                  {QUARTERS.map((q) => {
                    const cell = grid[m.metric_id]?.[q];
                    const snap = cell?.snapshot;
                    if (!snap) return <td key={q} />;

                    const isEmpty = snap.entryCount === 0;
                    const isPartial = snap.entryCount > 0 && !snap.isComplete;
                    const isComplete = snap.isComplete;

                    return (
                      <td key={q} className="py-2 px-1">
                        <button
                          type="button"
                          onClick={() => onJumpToEntry(m.metric_id, q)}
                          className={`w-full rounded-sm border p-2.5 text-center transition-all hover:shadow-sm ${
                            isEmpty
                              ? "border-dashed border-wg-muted/30 bg-wg-light/50 hover:border-wg-orange/50"
                              : isPartial
                                ? "border-wg-orange/30 bg-wg-orange/5 hover:border-wg-orange"
                                : "border-wg-suede/20 bg-wg-suede/5 hover:border-wg-suede"
                          }`}
                        >
                          <div className="flex justify-center mb-1">
                            {isEmpty ? (
                              <Circle className="w-4 h-4 text-wg-muted/50" />
                            ) : isPartial ? (
                              <CircleDashed className="w-4 h-4 text-wg-orange" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-wg-suede" />
                            )}
                          </div>
                          {isEmpty ? (
                            <span className="text-[10px] text-wg-muted">
                              Missing
                            </span>
                          ) : (
                            <>
                              <p className="font-semibold text-wg-gold text-sm">
                                {formatValue(snap.actual, m.value_type)}
                              </p>
                              {snap.label && (
                                <p className="text-[10px] text-wg-muted mt-0.5">
                                  {snap.label}
                                </p>
                              )}
                              {snap.status && (
                                <span
                                  className={`inline-block mt-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-sm border ${statusColor(snap.status)}`}
                                >
                                  {statusLabel(snap.status)}
                                </span>
                              )}
                            </>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
