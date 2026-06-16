"use client";

import type { MetricDashboardRow } from "@/lib/types";
import { titleCase } from "@/lib/utils";
import { getTeamColor } from "@/lib/metrics";
import { statusColor, statusLabel } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TeamOverviewChartProps {
  rows: MetricDashboardRow[];
}

export function TeamOverviewChart({ rows }: TeamOverviewChartProps) {
  const teamStats = rows.reduce<
    Record<string, { met: number; atRisk: number; notMet: number; pending: number }>
  >((acc, row) => {
    if (!acc[row.team]) {
      acc[row.team] = { met: 0, atRisk: 0, notMet: 0, pending: 0 };
    }
    const s = row.latest_status;
    if (s === "met" || s === "on_track") acc[row.team].met++;
    else if (s === "at_risk") acc[row.team].atRisk++;
    else if (s === "not_met" || s === "off_track") acc[row.team].notMet++;
    else acc[row.team].pending++;
    return acc;
  }, {});

  const data = Object.entries(teamStats).map(([team, stats]) => ({
    team: team.replace(" ", "\n"),
    teamFull: team,
    ...stats,
    total: stats.met + stats.atRisk + stats.notMet + stats.pending,
  }));

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
          <XAxis
            dataKey="team"
            tick={{ fontSize: 10, fill: "#a0a9a6", fontFamily: "normalidad-text, Jost, sans-serif" }}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#a0a9a6", fontFamily: "normalidad-text, Jost, sans-serif" }}
            allowDecimals={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-white border border-black/10 rounded-sm shadow-lg p-3 text-sm">
                  <p className="font-semibold text-wg-suede mb-2 text-sm">{titleCase(d.teamFull)}</p>
                  <div className="space-y-1 text-xs font-body normal-case">
                    <p className="text-emerald-700">Met/On Track: {d.met}</p>
                    <p className="text-amber-700">At Risk: {d.atRisk}</p>
                    <p className="text-rose-700">Not Met: {d.notMet}</p>
                    <p className="text-wg-muted">Pending: {d.pending}</p>
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="met" stackId="a" fill="#112721" radius={[0, 0, 0, 0]} />
          <Bar dataKey="atRisk" stackId="a" fill="#ff6700" />
          <Bar dataKey="notMet" stackId="a" fill="#a86a40" />
          <Bar dataKey="pending" stackId="a" fill="#d4d4d4" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
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
