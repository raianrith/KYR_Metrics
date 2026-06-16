"use client";

import { MetricTrendChart } from "@/components/dashboard/metric-trend-chart";
import type { MetricDashboardRow, MetricEntry } from "@/lib/types";
import {
  cadenceLabel,
  fieldLabelClass,
  formatValue,
  statusColor,
  statusLabel,
  titleCase,
} from "@/lib/utils";
import { getTeamColor } from "@/lib/metrics";
import { ChevronDown, LineChart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MetricRowProps {
  metric: MetricDashboardRow;
  entries?: MetricEntry[];
  showTeam?: boolean;
  defaultExpanded?: boolean;
  periodLabel?: string;
  periodDetail?: string;
  chartYear?: number;
}

export function MetricRow({
  metric,
  entries = [],
  showTeam = true,
  defaultExpanded = false,
  periodLabel,
  periodDetail,
  chartYear,
}: MetricRowProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const teamColor = getTeamColor(metric.team);
  const hasHistory = entries.length > 0;

  return (
    <div
      className={cn(
        "rounded-sm border bg-white transition-all",
        expanded ? "border-wg-orange/40 shadow-sm" : "border-black/5 hover:border-wg-orange/30"
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left group"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-4 p-4">
          <div
            className="w-1 self-stretch rounded-full shrink-0 min-h-[3rem]"
            style={{ backgroundColor: teamColor }}
          />

          <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center">
            <div className="md:col-span-4">
              <div className="flex items-center gap-2 flex-wrap">
                {showTeam && (
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-sm text-white"
                    style={{ backgroundColor: teamColor }}
                  >
                    {titleCase(metric.team)}
                  </span>
                )}
                <span className="text-xs text-wg-muted">
                  {titleCase(metric.role)}
                </span>
                {hasHistory && (
                  <span className="flex items-center gap-1 text-[10px] text-wg-muted">
                    <LineChart className="w-3 h-3" />
                    {entries.length} Periods
                  </span>
                )}
              </div>
              <h4 className="font-semibold text-wg-suede mt-1 truncate font-body tracking-normal">
                {titleCase(metric.metric_name)}
              </h4>
              <p className="text-xs text-wg-muted line-clamp-1 mt-0.5 font-body normal-case">
                {metric.definition}
              </p>
            </div>

            <div className="md:col-span-2 text-sm font-body">
              <span className={fieldLabelClass}>Owner</span>
              <span className="font-medium text-wg-charcoal">
                {titleCase(metric.owner ?? metric.department_owner)}
              </span>
            </div>

            <div className="md:col-span-2 text-sm font-body">
              <span className={fieldLabelClass}>Cadence</span>
              <span className="font-medium text-wg-charcoal">
                {cadenceLabel(metric.cadence)}
              </span>
            </div>

            <div className="md:col-span-2 text-sm font-body">
              <span className={fieldLabelClass}>Target</span>
              <span className="font-medium text-wg-charcoal">
                {metric.target_label ??
                  (metric.target_value !== null
                    ? formatValue(metric.target_value, metric.value_type)
                    : "—")}
              </span>
            </div>

            <div className="md:col-span-1 text-sm font-body">
              <span className={fieldLabelClass}>
                {periodLabel ? periodLabel : "Latest"}
              </span>
              <span className="font-semibold text-wg-gold">
                {formatValue(metric.latest_actual, metric.value_type)}
              </span>
              {periodDetail && (
                <span className="text-[10px] text-wg-muted block">{periodDetail}</span>
              )}
            </div>

            <div className="md:col-span-1 flex items-center justify-end gap-2">
              <span
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-sm border ${statusColor(metric.latest_status)}`}
              >
                {statusLabel(metric.latest_status)}
              </span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-wg-muted transition-transform shrink-0",
                  expanded && "rotate-180"
                )}
              />
            </div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-black/5">
          <div className="pt-4">
            <p className="text-[11px] font-medium text-wg-muted mb-3">
              Performance Over Time{chartYear ? ` · ${chartYear}` : ""}
            </p>
            <MetricTrendChart
              metric={metric}
              entries={entries}
              color={teamColor === "#112721" ? "#ff6700" : teamColor}
            />
          </div>
        </div>
      )}
    </div>
  );
}
