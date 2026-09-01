"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { groupByRole, groupByTeam } from "@/lib/metrics";
import { createClient } from "@/lib/supabase/client";
import type { MetricDashboardRow } from "@/lib/types";
import { cadenceLabel, titleCase } from "@/lib/utils";
import { ArrowUpRight, CheckCircle2, HelpCircle, Loader2 } from "lucide-react";
import { RenameMetricControl } from "@/components/admin/rename-metric-control";
import { useMemo, useState } from "react";

interface Tier3MetricsTabProps {
  metrics: MetricDashboardRow[];
  onSaved?: () => void;
}

export function Tier3MetricsTab({ metrics, onSaved }: Tier3MetricsTabProps) {
  const [movingId, setMovingId] = useState<string | null>(null);
  const [movedIds, setMovedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const remaining = useMemo(
    () => metrics.filter((m) => !movedIds.has(m.metric_id)),
    [metrics, movedIds]
  );
  const teams = useMemo(() => groupByTeam(remaining), [remaining]);

  const moveToTier = async (metric: MetricDashboardRow, tier: "Tier 1" | "Tier 2") => {
    setMovingId(metric.metric_id);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("metrics")
        .update({ tier })
        .eq("id", metric.metric_id);

      if (updateError) throw updateError;

      setMovedIds((prev) => new Set(prev).add(metric.metric_id));
      setSuccess(
        `${titleCase(metric.metric_name)} moved to ${tier}${
          metric.owner ? ` for ${titleCase(metric.owner)}` : ""
        }.`
      );
      onSaved?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update metric tier. Connect Supabase to save this change."
      );
    } finally {
      setMovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-wg-orange" />
            Tier 3 Metrics
          </CardTitle>
          <CardDescription>
            These metrics don&apos;t have a tracking method yet. When you figure
            out how to pull the data, move them to Tier 2 so they can be
            targeted and entered with the rest of KYR.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-wg-muted font-body normal-case">
            {remaining.length} metric{remaining.length === 1 ? "" : "s"} waiting
            on a tracking method
          </p>
          {success && (
            <div className="flex items-center gap-2 text-sm text-green-800 bg-green-50 border border-green-200 rounded-sm px-4 py-3 font-body normal-case">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {success}
            </div>
          )}
          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-4 py-3 font-body normal-case">
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      {remaining.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-wg-muted font-body normal-case">
            No Tier 3 metrics. Everything currently has a tracking method.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {teams.map(([team, teamMetrics]) => (
            <Card key={team}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{titleCase(team)}</CardTitle>
                <CardDescription>
                  {teamMetrics.length} metric{teamMetrics.length === 1 ? "" : "s"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {groupByRole(teamMetrics).map(([role, roleMetrics]) => (
                  <section key={role} className="space-y-2">
                    <h4 className="text-sm font-semibold text-wg-suede font-body tracking-normal">
                      {titleCase(role)}
                    </h4>
                    <div className="divide-y divide-black/5 rounded-sm border border-black/5">
                      {roleMetrics.map((metric) => {
                        const busy = movingId === metric.metric_id;
                        return (
                          <div
                            key={metric.metric_id}
                            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
                          >
                            <div className="min-w-0">
                              <p className="font-medium text-wg-charcoal font-body">
                                {titleCase(metric.metric_name)}
                              </p>
                              <p className="text-xs text-wg-muted mt-1 font-body normal-case">
                                {metric.definition}
                              </p>
                              <p className="text-xs text-wg-muted mt-2 font-body normal-case">
                                {metric.owner
                                  ? titleCase(metric.owner)
                                  : "Unassigned"}
                                {" · "}
                                {cadenceLabel(metric.cadence)}
                                {metric.department_owner
                                  ? ` · Owner ${titleCase(metric.department_owner)}`
                                  : ""}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2 shrink-0">
                              <RenameMetricControl
                                metric={metric}
                                allMetrics={remaining}
                                onRenamed={onSaved}
                                compact
                              />
                              <Button
                                type="button"
                                size="sm"
                                disabled={busy}
                                onClick={() => moveToTier(metric, "Tier 2")}
                              >
                                {busy ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                )}
                                Move to Tier 2
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={busy}
                                onClick={() => moveToTier(metric, "Tier 1")}
                              >
                                Move to Tier 1
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
