"use client";

import type { MetricDashboardRow, MetricEntry } from "@/lib/types";
import { buildTrendData } from "@/lib/metrics";
import { formatValue, statusColor, statusLabel, titleCase, fieldLabelClass } from "@/lib/utils";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface MetricTrendChartProps {
  metric: MetricDashboardRow;
  entries: MetricEntry[];
  color?: string;
}

export function MetricTrendChart({
  metric,
  entries,
  color = "#ff6700",
}: MetricTrendChartProps) {
  const defaultTarget = metric.target_value;

  const chartData = buildTrendData(entries, metric.value_type).map((point, i) => {
    const entry = entries.filter((e) => e.actual_value !== null).sort(
      (a, b) => new Date(a.period_end).getTime() - new Date(b.period_end).getTime()
    )[i];
    return {
      ...point,
      target: point.target ?? defaultTarget,
      status: entry?.status,
    };
  });

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 rounded-sm border border-dashed border-black/10 bg-wg-light/50">
        <p className="text-sm text-wg-muted font-body normal-case">
          No data points yet — add entries in Admin to see trends over time.
        </p>
      </div>
    );
  }

  const hasTarget = chartData.some((d) => d.target !== null && d.target !== undefined);

  return (
    <div className="space-y-4">
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 11, fill: "#a0a9a6" }}
              axisLine={{ stroke: "#e5e5e5" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#a0a9a6" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatValue(v, metric.value_type)}
              width={64}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white border border-black/10 rounded-sm shadow-lg p-3 text-sm font-body normal-case">
                    <p className="font-semibold text-wg-suede mb-1">{d.period}</p>
                    <p className="text-wg-orange">
                      Actual: {formatValue(d.actual, metric.value_type)}
                    </p>
                    {d.target != null && (
                      <p className="text-wg-gold">
                        Target: {formatValue(d.target, metric.value_type)}
                      </p>
                    )}
                  </div>
                );
              }}
            />
            {hasTarget && (
              <Legend
                verticalAlign="top"
                height={28}
                formatter={(value) => (
                  <span className="text-xs text-wg-muted">{value}</span>
                )}
              />
            )}
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual"
              stroke={color}
              strokeWidth={2.5}
              dot={{ fill: color, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: color }}
            />
            {hasTarget && (
              <Line
                type="monotone"
                dataKey="target"
                name="Target"
                stroke="#a86a40"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <EntryHistoryTable metric={metric} entries={entries} />
    </div>
  );
}

function EntryHistoryTable({
  metric,
  entries,
}: {
  metric: MetricDashboardRow;
  entries: MetricEntry[];
}) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.period_end).getTime() - new Date(a.period_end).getTime()
  );

  if (sorted.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-sm border border-black/5">
      <table className="w-full text-sm font-body normal-case">
        <thead>
          <tr className="bg-wg-light border-b border-black/5">
            <th className="text-left px-3 py-2 text-[11px] font-medium text-wg-muted">
              Period
            </th>
            <th className="text-left px-3 py-2 text-[11px] font-medium text-wg-muted">
              Actual
            </th>
            <th className="text-left px-3 py-2 text-[11px] font-medium text-wg-muted">
              Target
            </th>
            <th className="text-left px-3 py-2 text-[11px] font-medium text-wg-muted">
              Status
            </th>
            <th className="text-left px-3 py-2 text-[11px] font-medium text-wg-muted hidden sm:table-cell">
              Entered By
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((entry) => (
            <tr key={entry.id} className="border-b border-black/5 last:border-0">
              <td className="px-3 py-2 text-wg-charcoal whitespace-nowrap">
                {new Date(entry.period_start).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
                {" – "}
                {new Date(entry.period_end).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </td>
              <td className="px-3 py-2 font-semibold text-wg-gold">
                {formatValue(entry.actual_value, metric.value_type)}
              </td>
              <td className="px-3 py-2 text-wg-muted">
                {formatValue(
                  entry.target_value ?? metric.target_value,
                  metric.value_type
                )}
              </td>
              <td className="px-3 py-2">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm border ${statusColor(entry.status)}`}
                >
                  {statusLabel(entry.status)}
                </span>
              </td>
              <td className="px-3 py-2 text-wg-muted hidden sm:table-cell">
                {entry.entered_by ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
