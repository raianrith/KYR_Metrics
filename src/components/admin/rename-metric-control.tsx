"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { MetricDashboardRow } from "@/lib/types";
import { titleCase } from "@/lib/utils";
import { Loader2, Pencil } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function relatedNamedMetrics(
  metric: MetricDashboardRow,
  allMetrics: MetricDashboardRow[]
): MetricDashboardRow[] {
  return allMetrics.filter(
    (m) =>
      m.metric_name === metric.metric_name &&
      m.team === metric.team &&
      m.role === metric.role
  );
}

interface RenameMetricControlProps {
  metric: MetricDashboardRow;
  allMetrics: MetricDashboardRow[];
  onRenamed?: () => void;
  compact?: boolean;
}

export function RenameMetricControl({
  metric,
  allMetrics,
  onRenamed,
  compact = false,
}: RenameMetricControlProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(metric.metric_name);
  const [applyToGroup, setApplyToGroup] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const related = useMemo(
    () => relatedNamedMetrics(metric, allMetrics),
    [metric, allMetrics]
  );
  const extraCount = Math.max(0, related.length - 1);

  useEffect(() => {
    setName(metric.metric_name);
    setOpen(false);
    setError(null);
    setApplyToGroup(true);
  }, [metric.metric_id, metric.metric_name]);

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter a metric name.");
      return;
    }
    if (trimmed === metric.metric_name) {
      setOpen(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ids =
        applyToGroup && extraCount > 0
          ? related.map((m) => m.metric_id)
          : [metric.metric_id];

      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("metrics")
        .update({ name: trimmed })
        .in("id", ids);

      if (updateError) throw updateError;

      setOpen(false);
      onRenamed?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to rename metric. Connect Supabase to save this change."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    if (compact) {
      return (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setOpen(true)}
        >
          <Pencil className="w-3.5 h-3.5" />
          Rename
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-wg-muted font-body normal-case">
          <span className="font-medium text-wg-charcoal">Name:</span>{" "}
          {titleCase(metric.metric_name)}
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setOpen(true)}
        >
          <Pencil className="w-3.5 h-3.5" />
          Rename
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-sm border border-wg-orange/20 bg-white p-3">
      <div className="space-y-2">
        <Label htmlFor={`rename-${metric.metric_id}`}>Metric name</Label>
        <Input
          id={`rename-${metric.metric_id}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void save();
            }
            if (e.key === "Escape") setOpen(false);
          }}
          autoFocus
        />
      </div>
      {extraCount > 0 && (
        <label className="flex items-start gap-2 text-xs text-wg-muted font-body normal-case cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={applyToGroup}
            onChange={(e) => setApplyToGroup(e.target.checked)}
          />
          <span>
            Also rename the other {extraCount} {titleCase(metric.role)} metric
            {extraCount === 1 ? "" : "s"} currently named{" "}
            <strong className="text-wg-charcoal">
              {titleCase(metric.metric_name)}
            </strong>
          </span>
        </label>
      )}
      {error && <p className="text-xs text-red-700">{error}</p>}
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => void save()}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          Save name
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            setOpen(false);
            setName(metric.metric_name);
            setError(null);
          }}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
