"use client";

import type { MetricDashboardRow } from "@/lib/types";
import {
  buildStatusBreakdown,
  getTeamColor,
  type StatusBreakdownRow,
} from "@/lib/metrics";
import { statusColor, statusLabel, titleCase } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const TICK_STYLE = {
  fontSize: 10,
  fill: "#a0a9a6",
  fontFamily: "normalidad-text, Jost, sans-serif",
} as const;

function StatusTooltip({
  active,
  payload,
  title,
}: {
  active?: boolean;
  payload?: { payload: StatusBreakdownRow }[];
  title: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-black/10 rounded-sm shadow-lg p-3 text-sm">
      <p className="font-semibold text-wg-suede mb-2 text-sm">{titleCase(d.label)}</p>
      <div className="space-y-1 text-xs font-body normal-case">
        <p className="text-emerald-700">Met/On Track: {d.met}</p>
        <p className="text-amber-700">At Risk: {d.atRisk}</p>
        <p className="text-rose-700">Not Met: {d.notMet}</p>
        <p className="text-wg-muted">Pending: {d.pending}</p>
      </div>
    </div>
  );
}

function StatusBreakdownChart({
  data,
  minBarWidth = 72,
  height = 288,
}: {
  data: StatusBreakdownRow[];
  minBarWidth?: number;
  height?: number;
}) {
  const chartWidth = Math.max(600, data.length * minBarWidth);

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <div style={{ width: chartWidth, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 56 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
            <XAxis
              dataKey="label"
              tick={TICK_STYLE}
              interval={0}
              angle={-35}
              textAnchor="end"
              height={56}
              tickFormatter={(value) => titleCase(String(value))}
            />
            <YAxis tick={TICK_STYLE} allowDecimals={false} />
            <Tooltip content={<StatusTooltip title="" />} />
            <Bar dataKey="met" stackId="a" fill="#112721" />
            <Bar dataKey="atRisk" stackId="a" fill="#ff6700" />
            <Bar dataKey="notMet" stackId="a" fill="#a86a40" />
            <Bar dataKey="pending" stackId="a" fill="#d4d4d4" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ChartLegend() {
  return (
    <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-wg-muted font-body normal-case flex-wrap">
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
  );
}

interface TeamOverviewChartProps {
  rows: MetricDashboardRow[];
}

export function TeamOverviewChart({ rows }: TeamOverviewChartProps) {
  const data = buildStatusBreakdown(rows, (row) => row.team);
  return <StatusBreakdownChart data={data} minBarWidth={88} />;
}

interface EmployeeOverviewChartProps {
  rows: MetricDashboardRow[];
}

export function EmployeeOverviewChart({ rows }: EmployeeOverviewChartProps) {
  const data = buildStatusBreakdown(
    rows.filter((row) => row.owner),
    (row) => row.owner!
  );
  return <StatusBreakdownChart data={data} minBarWidth={64} height={320} />;
}

interface StatusDonutProps {
  met: number;
  atRisk: number;
  notMet: number;
  pending: number;
}

export function StatusSummary({ met, atRisk, notMet, pending }: StatusDonutProps) {
  const items = [
    { label: "Met / On Track", value: met, color: "bg-wg-suede" },
    { label: "At Risk", value: atRisk, color: "bg-wg-orange" },
    { label: "Not Met", value: notMet, color: "bg-wg-gold" },
    { label: "Pending", value: pending, color: "bg-wg-muted/40" },
  ];
  const total = met + atRisk + notMet + pending;

  return (
    <div className="space-y-3">
      <div className="flex h-2.5 rounded-sm overflow-hidden">
        {items.map((item) =>
          item.value > 0 ? (
            <div
              key={item.label}
              className={item.color}
              style={{ width: `${(item.value / total) * 100}%` }}
            />
          ) : null
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm font-body normal-case">
            <div className={`w-2.5 h-2.5 rounded-sm ${item.color}`} />
            <span className="text-wg-muted text-xs">{item.label}</span>
            <span className="font-semibold text-wg-suede ml-auto">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TeamCardProps {
  team: string;
  metrics: MetricDashboardRow[];
}

export function TeamCard({ team, metrics }: TeamCardProps) {
  const color = getTeamColor(team);
  const met = metrics.filter(
    (m) => m.latest_status === "met" || m.latest_status === "on_track"
  ).length;
  const total = metrics.length;

  return (
    <div
      className="wg-card rounded-sm p-5 border-l-4"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-base text-wg-suede">{titleCase(team)}</h3>
        <span className="text-[10px] font-medium text-wg-muted">
          {met}/{total} On Track
        </span>
      </div>
      <div className="space-y-2">
        {metrics.map((m) => (
          <div
            key={m.metric_id}
            className="flex items-center justify-between text-sm py-1.5 border-b border-black/5 last:border-0"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-wg-charcoal truncate font-body normal-case">
                {m.metric_name}
              </p>
              <p className="text-xs text-wg-muted">{titleCase(m.role)}</p>
            </div>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm border ml-2 shrink-0 ${statusColor(m.latest_status)}`}
            >
              {statusLabel(m.latest_status)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
