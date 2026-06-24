"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMetricOptionLabel } from "@/lib/metrics-catalog";
import { filterMetricsByMetricOwner, filterMetricsByTier, normalizeTier } from "@/lib/metrics";
import {
  getTargetPeriodSlots,
  periodTargetsForYear,
  targetSummaryForMetric,
} from "@/lib/targets";
import { getAvailableYears } from "@/lib/periods";
import { MetricOwnerFilter } from "@/components/shared/metric-owner-filter";
import { TierFilter } from "@/components/shared/tier-filter";
import { createClient } from "@/lib/supabase/client";
import type {
  CadenceType,
  MetricDashboardRow,
  MetricEntry,
  MetricPeriodTarget,
  TargetDirection,
} from "@/lib/types";
import {
  CADENCE_OPTIONS,
  cadenceLabel,
  titleCase,
} from "@/lib/utils";
import { CheckCircle2, Copy, Filter, Loader2, Save, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface SetMetricTargetsTabProps {
  metrics: MetricDashboardRow[];
  entriesByMetric: Record<string, MetricEntry[]>;
  periodTargetsByMetric: Record<string, MetricPeriodTarget[]>;
  onSaved?: () => void;
}

const TARGET_DIRECTIONS: { value: TargetDirection; label: string }[] = [
  { value: "higher_is_better", label: "Higher Is Better" },
  { value: "lower_is_better", label: "Lower Is Better" },
  { value: "equals", label: "Equals Target" },
];

export function SetMetricTargetsTab({
  metrics,
  entriesByMetric,
  periodTargetsByMetric,
  onSaved,
}: SetMetricTargetsTabProps) {
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [metricOwnerFilter, setMetricOwnerFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [selectedMetricId, setSelectedMetricId] = useState("");
  const [targetYear, setTargetYear] = useState(new Date().getFullYear());
  const [cadence, setCadence] = useState<CadenceType>("monthly");
  const [defaultTarget, setDefaultTarget] = useState("");
  const [periodTargets, setPeriodTargets] = useState<Record<string, string>>({});
  const [targetDirection, setTargetDirection] =
    useState<TargetDirection>("higher_is_better");
  const [targetLabel, setTargetLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const teams = useMemo(
    () => [...new Set(metrics.map((m) => m.team))].sort(),
    [metrics]
  );

  const employees = useMemo(
    () =>
      [
        ...new Set(
          metrics.map((m) => m.owner).filter((name): name is string => Boolean(name))
        ),
      ].sort(),
    [metrics]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return metrics.filter((m) => {
      if (teamFilter !== "all" && m.team !== teamFilter) return false;
      if (employeeFilter !== "all") {
        if (employeeFilter === "unassigned") {
          if (m.owner) return false;
        } else if (m.owner !== employeeFilter) {
          return false;
        }
      }
      if (metricOwnerFilter !== "all") {
        if (metricOwnerFilter === "unassigned") {
          if (m.department_owner) return false;
        } else if (m.department_owner !== metricOwnerFilter) {
          return false;
        }
      }
      if (tierFilter !== "all") {
        if (tierFilter === "unassigned") {
          if (normalizeTier(m.tier) !== "Unassigned") return false;
        } else if (normalizeTier(m.tier) !== tierFilter) {
          return false;
        }
      }
      if (!q) return true;
      return (
        m.metric_name.toLowerCase().includes(q) ||
        m.team.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.owner?.toLowerCase().includes(q) ||
        m.department_owner?.toLowerCase().includes(q) ||
        normalizeTier(m.tier).toLowerCase().includes(q)
      );
    });
  }, [metrics, search, teamFilter, employeeFilter, metricOwnerFilter, tierFilter]);

  const selectedMetric = metrics.find((m) => m.metric_id === selectedMetricId);

  const periodSlots = useMemo(() => {
    if (!selectedMetric) return [];
    const effectiveCadence =
      cadence === "ad_hoc" ? "monthly" : cadence;
    return getTargetPeriodSlots(effectiveCadence, targetYear);
  }, [selectedMetric, cadence, targetYear]);

  const loadMetricIntoForm = (metric: MetricDashboardRow) => {
    setSelectedMetricId(metric.metric_id);
    setCadence(metric.cadence === "ad_hoc" ? "monthly" : metric.cadence);
    setDefaultTarget(
      metric.target_value !== null ? String(metric.target_value) : ""
    );
    setTargetDirection(metric.target_direction);
    setTargetLabel(metric.target_label ?? "");
    setPeriodTargets(
      periodTargetsForYear(
        periodTargetsByMetric[metric.metric_id] ?? [],
        targetYear
      )
    );
    setSuccess(false);
    setError(null);
  };

  useEffect(() => {
    if (!selectedMetricId) return;
    const metric = metrics.find((m) => m.metric_id === selectedMetricId);
    if (!metric) return;
    setPeriodTargets(
      periodTargetsForYear(
        periodTargetsByMetric[selectedMetricId] ?? [],
        targetYear
      )
    );
  }, [selectedMetricId, targetYear, periodTargetsByMetric, metrics]);

  const applyDefaultToAllPeriods = () => {
    if (!defaultTarget.trim()) return;
    const next: Record<string, string> = {};
    for (const slot of periodSlots) {
      next[slot.key] = defaultTarget;
    }
    setPeriodTargets(next);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMetricId) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("metrics")
        .update({
          cadence,
          target_value: defaultTarget ? parseFloat(defaultTarget) : null,
          target_direction: targetDirection,
          target_label: targetLabel.trim() || null,
        })
        .eq("id", selectedMetricId);

      if (updateError) throw updateError;

      for (const slot of periodSlots) {
        const raw = periodTargets[slot.key]?.trim();
        if (raw) {
          const { error: upsertError } = await supabase
            .from("metric_period_targets")
            .upsert(
              {
                metric_id: selectedMetricId,
                period_start: slot.period_start,
                period_end: slot.period_end,
                target_value: parseFloat(raw),
              },
              { onConflict: "metric_id,period_start,period_end" }
            );
          if (upsertError) throw upsertError;
        } else {
          const { error: deleteError } = await supabase
            .from("metric_period_targets")
            .delete()
            .eq("metric_id", selectedMetricId)
            .eq("period_start", slot.period_start)
            .eq("period_end", slot.period_end);
          if (deleteError) throw deleteError;
        }
      }

      setSuccess(true);
      onSaved?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save metric targets"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>All Metrics</CardTitle>
          <CardDescription>
            Select a metric to set its reporting frequency and target
          </CardDescription>
          <div className="flex flex-wrap gap-2 pt-2">
            <Input
              placeholder="Search metrics, teams, team members, metric owners..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
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
            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Team Member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Team Members</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {employees.map((e) => (
                  <SelectItem key={e} value={e}>
                    {titleCase(e)}
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
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto max-h-[32rem] overflow-y-auto">
          <table className="w-full text-sm font-body normal-case table-fixed">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-black/10">
                <th className="text-left py-2 pr-3 text-[11px] font-medium text-wg-muted tracking-wide w-[55%]">
                  Metric
                </th>
                <th className="text-left py-2 px-2 text-[11px] font-medium text-wg-muted tracking-wide w-[22%]">
                  Frequency
                </th>
                <th className="text-left py-2 pl-2 text-[11px] font-medium text-wg-muted tracking-wide w-[23%]">
                  Target
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr
                  key={m.metric_id}
                  onClick={() => loadMetricIntoForm(m)}
                  className={`border-b border-black/5 cursor-pointer transition-colors ${
                    selectedMetricId === m.metric_id
                      ? "bg-wg-orange/10"
                      : "hover:bg-wg-light/80"
                  }`}
                >
                  <td className="py-2.5 pr-3">
                    <p className="font-medium text-wg-charcoal">
                      {titleCase(m.metric_name)}
                    </p>
                    <p className="text-xs text-wg-muted">
                      {titleCase(m.team)} · {titleCase(m.role)}
                      {m.department_owner
                        ? ` · ${titleCase(m.department_owner)}`
                        : ""}
                      {m.tier ? ` · ${normalizeTier(m.tier)}` : ""}
                      {m.owner ? ` · ${titleCase(m.owner)}` : ""}
                    </p>
                  </td>
                  <td className="py-2.5 px-2 text-wg-charcoal whitespace-nowrap">
                    {cadenceLabel(m.cadence)}
                  </td>
                  <td className="py-2.5 pl-2 text-wg-gold font-medium whitespace-nowrap">
                    {targetSummaryForMetric(
                      m,
                      periodTargetsByMetric[m.metric_id]
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-wg-orange" />
            Set Targets
          </CardTitle>
          <CardDescription>
            Choose reporting frequency and define the target for each period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target-metric">Metric</Label>
              <Select
                value={selectedMetricId}
                onValueChange={(id) => {
                  const m = metrics.find((x) => x.metric_id === id);
                  if (m) loadMetricIntoForm(m);
                }}
              >
                <SelectTrigger id="target-metric">
                  <SelectValue placeholder="Select a metric..." />
                </SelectTrigger>
                <SelectContent>
                  {metrics.map((m) => (
                    <SelectItem key={m.metric_id} value={m.metric_id}>
                      {formatMetricOptionLabel({
                        team: m.team,
                        role: m.role,
                        owner: m.owner,
                        metric_name: m.metric_name,
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedMetric && (
              <p className="text-xs text-wg-muted font-body normal-case rounded-sm bg-wg-light border border-black/5 p-3">
                {selectedMetric.definition}
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="targetYear">Target Year</Label>
              <Select
                value={String(targetYear)}
                onValueChange={(v) => setTargetYear(parseInt(v, 10))}
              >
                <SelectTrigger id="targetYear">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableYears(entriesByMetric).map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cadence">Reporting Frequency</Label>
              <Select
                value={cadence}
                onValueChange={(v) => setCadence(v as CadenceType)}
              >
                <SelectTrigger id="cadence">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CADENCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-wg-muted">
                {cadence === "monthly" && "One entry per month"}
                {cadence === "quarterly" && "One entry per quarter (Q1–Q4)"}
                {cadence === "annual" && "One entry per calendar year"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultTarget">Default Target (fallback)</Label>
              <div className="flex gap-2">
                <Input
                  id="defaultTarget"
                  type="number"
                  step="any"
                  placeholder={
                    selectedMetric
                      ? `e.g. ${selectedMetric.value_type === "percentage" ? "90" : "1.75"}`
                      : "Enter default"
                  }
                  value={defaultTarget}
                  onChange={(e) => setDefaultTarget(e.target.value)}
                />
                {periodSlots.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={applyDefaultToAllPeriods}
                    disabled={!defaultTarget.trim()}
                    className="shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                    Apply to all
                  </Button>
                )}
              </div>
              {selectedMetric && (
                <p className="text-xs text-wg-muted">
                  Used when a specific period has no target set · Value type:{" "}
                  {titleCase(selectedMetric.value_type)}
                </p>
              )}
            </div>

            {periodSlots.length > 0 && (
              <div className="space-y-2">
                <Label>
                  {cadence === "monthly"
                    ? `Monthly Targets · ${targetYear}`
                    : cadence === "quarterly"
                      ? `Quarterly Targets · ${targetYear}`
                      : `Annual Target · ${targetYear}`}
                </Label>
                <div
                  className={`grid gap-2 ${
                    periodSlots.length > 4 ? "grid-cols-2" : "grid-cols-1"
                  }`}
                >
                  {periodSlots.map((slot) => (
                    <div key={slot.key} className="space-y-1">
                      <Label
                        htmlFor={`target-${slot.key}`}
                        className="text-xs text-wg-muted font-normal"
                      >
                        {slot.label}
                      </Label>
                      <Input
                        id={`target-${slot.key}`}
                        type="number"
                        step="any"
                        placeholder={defaultTarget || "—"}
                        value={periodTargets[slot.key] ?? ""}
                        onChange={(e) =>
                          setPeriodTargets((prev) => ({
                            ...prev,
                            [slot.key]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="targetDirection">Target Direction</Label>
              <Select
                value={targetDirection}
                onValueChange={(v) =>
                  setTargetDirection(v as TargetDirection)
                }
              >
                <SelectTrigger id="targetDirection">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_DIRECTIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetLabel">Target Label (optional)</Label>
              <Input
                id="targetLabel"
                placeholder='e.g. "≥ 90%" or "Meets budget"'
                value={targetLabel}
                onChange={(e) => setTargetLabel(e.target.value)}
              />
              <p className="text-xs text-wg-muted">
                Shown on the dashboard instead of the numeric target when set
              </p>
            </div>

            {error && (
              <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-sm px-4 py-3">
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-sm text-wg-suede bg-wg-suede/10 border border-wg-suede/20 rounded-sm px-4 py-3">
                <CheckCircle2 className="w-4 h-4" />
                Targets saved for this metric.
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !selectedMetricId}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Targets
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
