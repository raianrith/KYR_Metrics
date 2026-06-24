"use client";

import type { MetricDashboardRow, MetricEntry } from "@/lib/types";
import { formatQuarterLabel, getQuarter } from "@/lib/periods";
import { MetricOwnerFilter } from "@/components/shared/metric-owner-filter";
import { TierFilter } from "@/components/shared/tier-filter";
import { filterMetricsByMetricOwner, filterMetricsByTier, normalizeTier } from "@/lib/metrics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatValue, statusColor, statusLabel, titleCase } from "@/lib/utils";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

interface AllEntriesTabProps {
  metrics: MetricDashboardRow[];
  entriesByMetric: Record<string, MetricEntry[]>;
}

export function AllEntriesTab({
  metrics,
  entriesByMetric,
}: AllEntriesTabProps) {
  const [search, setSearch] = useState("");
  const [metricOwnerFilter, setMetricOwnerFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");

  const metricMap = useMemo(
    () => new Map(metrics.map((m) => [m.metric_id, m])),
    [metrics]
  );

  const allEntries = useMemo(() => {
    const rows: (MetricEntry & { metric: MetricDashboardRow })[] = [];
    for (const [metricId, entries] of Object.entries(entriesByMetric)) {
      const metric = metricMap.get(metricId);
      if (!metric) continue;
      for (const entry of entries) {
        rows.push({ ...entry, metric });
      }
    }
    return rows.sort(
      (a, b) =>
        new Date(b.period_end).getTime() - new Date(a.period_end).getTime()
    );
  }, [entriesByMetric, metricMap]);

  const filtered = useMemo(() => {
    let rows = allEntries;
    if (metricOwnerFilter !== "all") {
      rows = rows.filter((e) => {
        const owner = e.metric.department_owner;
        if (metricOwnerFilter === "unassigned") return !owner;
        return owner === metricOwnerFilter;
      });
    }
    if (tierFilter !== "all") {
      rows = rows.filter((e) => {
        const tier = normalizeTier(e.metric.tier);
        if (tierFilter === "unassigned") return tier === "Unassigned";
        return tier === tierFilter;
      });
    }
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (e) =>
        e.metric.metric_name.toLowerCase().includes(q) ||
        e.metric.team.toLowerCase().includes(q) ||
        e.metric.department_owner?.toLowerCase().includes(q) ||
        normalizeTier(e.metric.tier).toLowerCase().includes(q) ||
        e.entered_by?.toLowerCase().includes(q) ||
        e.notes?.toLowerCase().includes(q)
    );
  }, [allEntries, search, metricOwnerFilter, tierFilter]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>All Recorded Data</CardTitle>
            <CardDescription>
              {allEntries.length} entries across {metrics.length} metrics
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <MetricOwnerFilter
              value={metricOwnerFilter}
              onChange={setMetricOwnerFilter}
              metrics={metrics}
              triggerClassName="w-full sm:w-[180px]"
            />
            <TierFilter
              value={tierFilter}
              onChange={setTierFilter}
              metrics={metrics}
              triggerClassName="w-full sm:w-[140px]"
            />
            <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wg-muted" />
            <Input
              placeholder="Search metrics, teams, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-wg-muted text-center py-12 font-body normal-case">
            {allEntries.length === 0
              ? "No data has been entered yet. Use the Add / Update tab to get started."
              : "No entries match your search."}
          </p>
        ) : (
          <table className="w-full text-sm font-body normal-case min-w-[700px]">
            <thead>
              <tr className="border-b border-black/10 bg-wg-light">
                <th className="text-left px-3 py-2 text-[11px] font-medium text-wg-muted tracking-wide">
                  Metric
                </th>
                <th className="text-left px-3 py-2 text-[11px] font-medium text-wg-muted tracking-wide">
                  Period
                </th>
                <th className="text-left px-3 py-2 text-[11px] font-medium text-wg-muted tracking-wide">
                  Actual
                </th>
                <th className="text-left px-3 py-2 text-[11px] font-medium text-wg-muted tracking-wide">
                  Target
                </th>
                <th className="text-left px-3 py-2 text-[11px] font-medium text-wg-muted tracking-wide">
                  Status
                </th>
                <th className="text-left px-3 py-2 text-[11px] font-medium text-wg-muted tracking-wide hidden md:table-cell">
                  Entered By
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => {
                const end = new Date(entry.period_end + "T00:00:00");
                const year = end.getFullYear();
                const quarter = getQuarter(end);
                return (
                  <tr
                    key={entry.id}
                    className="border-b border-black/5 hover:bg-wg-light/50"
                  >
                    <td className="px-3 py-2.5">
                    <p className="font-medium text-wg-charcoal">
                      {titleCase(entry.metric.metric_name)}
                    </p>
                    <p className="text-xs text-wg-muted">
                      {titleCase(entry.metric.team)} · {titleCase(entry.metric.role)}
                      {entry.metric.department_owner
                        ? ` · ${titleCase(entry.metric.department_owner)}`
                        : ""}
                      {entry.metric.tier
                        ? ` · ${normalizeTier(entry.metric.tier)}`
                        : ""}
                      {entry.metric.owner ? ` · ${titleCase(entry.metric.owner)}` : ""}
                    </p>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-wg-charcoal">
                      <span className="text-[10px] font-semibold text-wg-orange mr-2">
                        {formatQuarterLabel(year, quarter)}
                      </span>
                      {new Date(entry.period_start).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                      {" – "}
                      {end.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-wg-gold">
                      {formatValue(entry.actual_value, entry.metric.value_type)}
                    </td>
                    <td className="px-3 py-2.5 text-wg-muted">
                      {formatValue(
                        entry.target_value ?? entry.metric.target_value,
                        entry.metric.value_type
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm border ${statusColor(entry.status)}`}
                      >
                        {statusLabel(entry.status)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-wg-muted hidden md:table-cell">
                      {entry.entered_by ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
