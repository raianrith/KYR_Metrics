"use client";

import { MetricTrendChart } from "@/components/dashboard/metric-trend-chart";
import type { MetricDashboardRow, MetricEntry, MetricPeriodTarget } from "@/lib/types";
import { resolveTargetValue } from "@/lib/targets";
import {
  cadenceLabel,
  fieldLabelClass,
  formatValue,
  statusColor,
  statusLabel,
  titleCase,
} from "@/lib/utils";
import { getTeamColor, normalizeTier } from "@/lib/metrics";
import { ChevronDown, LineChart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MetricRowProps {
  metric: MetricDashboardRow;
  entries?: MetricEntry[];
  showTeam?: boolean;
  showEmployee?: boolean;
  showCadence?: boolean;
  defaultExpanded?: boolean;
  valueColumnLabel?: string;
  periodDetail?: string;
  chartYear?: number;
  periodTargets?: MetricPeriodTarget[];
}

export function MetricRow({
  metric,
  entries = [],
  showTeam = true,
  showEmployee = true,
  showCadence = false,
  defaultExpanded = false,
  valueColumnLabel,
  periodDetail,
  chartYear,
  periodTargets = [],
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
                {showEmployee && metric.owner && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-wg-light text-wg-charcoal border border-black/10">
                    {titleCase(metric.owner)}
                  </span>
                )}
                {metric.department_owner && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-wg-suede/10 text-wg-suede border border-wg-suede/20">
                    {titleCase(metric.department_owner)}
                  </span>
                )}
                {metric.tier && normalizeTier(metric.tier) !== "Unassigned" && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-wg-gold/10 text-wg-gold border border-wg-gold/20">
                    {normalizeTier(metric.tier)}
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
              {showCadence && (
                <>
                  <span className={fieldLabelClass}>Cadence</span>
                  <span className="font-medium text-wg-charcoal">
                    {cadenceLabel(metric.cadence)}
                  </span>
                </>
              )}
              {!showCadence && (
                <>
                  <span className={fieldLabelClass}>
                    {showEmployee ? "Team Member" : "Owner"}
                  </span>
                  <span className="font-medium text-wg-charcoal">
                    {titleCase(metric.owner ?? metric.department_owner)}
                  </span>
                </>
              )}
            </div>

            <div className="md:col-span-2 text-sm font-body">
              <span className={fieldLabelClass}>Target</span>
              <span className="font-medium text-wg-charcoal">
                {metric.target_label ??
                  (metric.latest_target != null
                    ? formatValue(metric.latest_target, metric.value_type)
                    : metric.target_value !== null
                      ? formatValue(metric.target_value, metric.value_type)
                      : "—")}
              </span>
            </div>

            <div className="md:col-span-2 text-sm font-body">
              <span className={fieldLabelClass}>
                {valueColumnLabel ?? "Value"}
              </span>
              <span className="font-semibold text-wg-gold">
                {formatValue(metric.latest_actual, metric.value_type)}
              </span>
              {periodDetail && (
                <span className="text-[10px] text-wg-muted block">{periodDetail}</span>
              )}
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-2">
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
              periodTargets={periodTargets}
            />
          </div>
        </div>
      )}
    </div>
  );
}
