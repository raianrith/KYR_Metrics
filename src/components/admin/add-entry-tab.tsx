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
import { computeEntryStatus } from "@/lib/metrics";
import type { Quarter } from "@/lib/periods";
import {
  formatQuarterLabel,
  getEntriesForQuarter,
  getMonthBounds,
  getQuarterBounds,
  monthName,
  monthsInQuarter,
} from "@/lib/periods";
import { createClient } from "@/lib/supabase/client";
import type { MetricDashboardRow, MetricEntry } from "@/lib/types";
import { cadenceLabel, fieldLabelClass, formatValue } from "@/lib/utils";
import { CheckCircle2, Loader2, Pencil, Plus, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface AddEntryTabProps {
  metrics: MetricDashboardRow[];
  entriesByMetric: Record<string, MetricEntry[]>;
  prefill?: { metricId: string; year: number; quarter: Quarter } | null;
  onSaved?: () => void;
}

export function AddEntryTab({
  metrics,
  entriesByMetric,
  prefill,
  onSaved,
}: AddEntryTabProps) {
  const [selectedMetricId, setSelectedMetricId] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState<Quarter>(1);
  const [month, setMonth] = useState<number>(1);
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [actualValue, setActualValue] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [enteredBy, setEnteredBy] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  const selectedMetric = metrics.find((m) => m.metric_id === selectedMetricId);
  const isMonthly = selectedMetric?.cadence === "monthly";
  const isAnnual = selectedMetric?.cadence === "annual";

  const applyPeriodDates = useCallback(
    (y: number, q: Quarter, m: number, metric?: MetricDashboardRow) => {
      if (!metric) return;
      if (metric.cadence === "monthly") {
        const bounds = getMonthBounds(y, m);
        setPeriodStart(bounds.start);
        setPeriodEnd(bounds.end);
      } else if (metric.cadence === "annual") {
        setPeriodStart(`${y}-01-01`);
        setPeriodEnd(`${y}-12-31`);
      } else {
        const bounds = getQuarterBounds(y, q);
        setPeriodStart(bounds.start);
        setPeriodEnd(bounds.end);
      }
    },
    []
  );

  const loadExistingEntry = useCallback(
    (metricId: string, y: number, q: Quarter, m: number) => {
      const metric = metrics.find((x) => x.metric_id === metricId);
      if (!metric) return;

      const entries = entriesByMetric[metricId] ?? [];
      let existing: MetricEntry | undefined;

      if (metric.cadence === "monthly") {
        const bounds = getMonthBounds(y, m);
        existing = entries.find(
          (e) => e.period_start === bounds.start && e.period_end === bounds.end
        );
      } else if (metric.cadence === "annual") {
        existing = entries.find(
          (e) =>
            e.period_start === `${y}-01-01` && e.period_end === `${y}-12-31`
        );
      } else {
        const inQ = getEntriesForQuarter(entries, y, q);
        existing = inQ[inQ.length - 1];
      }

      if (existing) {
        setEditingEntryId(existing.id);
        setActualValue(
          existing.actual_value != null ? String(existing.actual_value) : ""
        );
        setTargetValue(
          existing.target_value != null
            ? String(existing.target_value)
            : metric.target_value != null
              ? String(metric.target_value)
              : ""
        );
        setStatus(existing.status ?? "");
        setNotes(existing.notes ?? "");
        setEnteredBy(existing.entered_by ?? "");
        setPeriodStart(existing.period_start);
        setPeriodEnd(existing.period_end);
      } else {
        setEditingEntryId(null);
        setActualValue("");
        setTargetValue(
          metric.target_value != null ? String(metric.target_value) : ""
        );
        setStatus("");
        setNotes("");
        applyPeriodDates(y, q, m, metric);
      }
    },
    [metrics, entriesByMetric, applyPeriodDates]
  );

  useEffect(() => {
    if (prefill) {
      setSelectedMetricId(prefill.metricId);
      setYear(prefill.year);
      setQuarter(prefill.quarter);
      const m = monthsInQuarter(prefill.quarter)[0];
      setMonth(m);
      loadExistingEntry(prefill.metricId, prefill.year, prefill.quarter, m);
    }
  }, [prefill, loadExistingEntry]);

  const handleMetricChange = (id: string) => {
    setSelectedMetricId(id);
    const metric = metrics.find((m) => m.metric_id === id);
    if (metric) {
      loadExistingEntry(id, year, quarter, month);
    }
    setSuccess(false);
    setError(null);
  };

  useEffect(() => {
    if (selectedMetric) {
      loadExistingEntry(selectedMetricId, year, quarter, month);
    }
  }, [year, quarter, month, selectedMetricId, selectedMetric, loadExistingEntry]);

  const autoComputeStatus = useCallback(() => {
    if (!selectedMetric || !actualValue) return;
    const actual = parseFloat(actualValue);
    const target = targetValue
      ? parseFloat(targetValue)
      : selectedMetric.target_value;
    if (isNaN(actual)) return;
    setStatus(
      computeEntryStatus(actual, target, selectedMetric.target_direction)
    );
  }, [selectedMetric, actualValue, targetValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMetricId || !periodStart || !periodEnd) {
      setError("Please fill in metric and reporting period.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = createClient();
      const payload = {
        metric_id: selectedMetricId,
        period_start: periodStart,
        period_end: periodEnd,
        actual_value: actualValue ? parseFloat(actualValue) : null,
        target_value: targetValue ? parseFloat(targetValue) : null,
        status: status || "pending",
        notes: notes || null,
        entered_by: enteredBy || "Admin",
      };

      const { error: upsertError } = await supabase
        .from("metric_entries")
        .upsert(payload, { onConflict: "metric_id,period_start,period_end" });

      if (upsertError) throw upsertError;

      setSuccess(true);
      setEditingEntryId(null);
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save entry");
    } finally {
      setLoading(false);
    }
  };

  const quarterMonths = monthsInQuarter(quarter);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {editingEntryId ? (
              <Pencil className="w-5 h-5 text-wg-orange" />
            ) : (
              <Plus className="w-5 h-5 text-wg-orange" />
            )}
            {editingEntryId ? "Update Entry" : "Add Entry"}
          </CardTitle>
          <CardDescription>
            Select year and quarter, then enter the value pulled from your source
            system. Existing entries load automatically for editing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="metric">Metric</Label>
              <Select value={selectedMetricId} onValueChange={handleMetricChange}>
                <SelectTrigger id="metric">
                  <SelectValue placeholder="Select a metric..." />
                </SelectTrigger>
                <SelectContent>
                  {metrics.map((m) => (
                    <SelectItem key={m.metric_id} value={m.metric_id}>
                      {m.team} · {m.role} · {m.metric_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedMetric && (
              <div className="rounded-sm bg-wg-light border border-black/5 p-4 text-sm space-y-1 font-body normal-case">
                <p className="text-wg-muted">
                  <span className="font-medium text-wg-charcoal">Definition:</span>{" "}
                  {selectedMetric.definition}
                </p>
                <p className="text-wg-muted">
                  <span className="font-medium text-wg-charcoal">Cadence:</span>{" "}
                  {cadenceLabel(selectedMetric.cadence)}
                  {selectedMetric.cadence_notes &&
                    ` — ${selectedMetric.cadence_notes}`}
                </p>
                <p className="text-wg-muted">
                  <span className="font-medium text-wg-charcoal">Target:</span>{" "}
                  {selectedMetric.target_label ??
                    (selectedMetric.target_value !== null
                      ? formatValue(
                          selectedMetric.target_value,
                          selectedMetric.value_type
                        )
                      : "—")}
                </p>
              </div>
            )}

            <div className="rounded-sm border border-wg-orange/20 bg-wg-orange/5 p-4 space-y-4">
              <p className={`${fieldLabelClass} text-wg-orange`}>
                Reporting Period
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select
                    value={String(year)}
                    onValueChange={(v) => setYear(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[year - 1, year, year + 1].map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {!isAnnual && (
                  <div className="space-y-2">
                    <Label>Quarter</Label>
                    <Select
                      value={String(quarter)}
                      onValueChange={(v) => {
                        const q = Number(v) as Quarter;
                        setQuarter(q);
                        setMonth(monthsInQuarter(q)[0]);
                      }}
                      disabled={isMonthly && false}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {([1, 2, 3, 4] as Quarter[]).map((q) => (
                          <SelectItem key={q} value={String(q)}>
                            {formatQuarterLabel(year, q)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {isMonthly && (
                  <div className="space-y-2">
                    <Label>Month</Label>
                    <Select
                      value={String(month)}
                      onValueChange={(v) => setMonth(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {quarterMonths.map((m) => (
                          <SelectItem key={m} value={String(m)}>
                            {monthName(m)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <p className="text-xs text-wg-muted font-body normal-case">
                Period: {periodStart || "—"} to {periodEnd || "—"}
                {editingEntryId && (
                  <span className="ml-2 text-wg-orange font-medium">
                    · Editing existing entry
                  </span>
                )}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="actualValue">Actual Value</Label>
                <Input
                  id="actualValue"
                  type="number"
                  step="any"
                  placeholder="Enter actual value"
                  value={actualValue}
                  onChange={(e) => setActualValue(e.target.value)}
                  onBlur={autoComputeStatus}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetValue">Target Value (override)</Label>
                <Input
                  id="targetValue"
                  type="number"
                  step="any"
                  placeholder="Optional override"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  onBlur={autoComputeStatus}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Auto or select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="met">Met</SelectItem>
                    <SelectItem value="on_track">On Track</SelectItem>
                    <SelectItem value="at_risk">At Risk</SelectItem>
                    <SelectItem value="not_met">Not Met</SelectItem>
                    <SelectItem value="off_track">Off Track</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="enteredBy">Entered By</Label>
                <Input
                  id="enteredBy"
                  placeholder="Your name"
                  value={enteredBy}
                  onChange={(e) => setEnteredBy(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Optional notes about this entry"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-sm px-4 py-3 font-body normal-case">
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-sm text-wg-suede bg-wg-suede/10 border border-wg-suede/20 rounded-sm px-4 py-3 font-body normal-case">
                <CheckCircle2 className="w-4 h-4" />
                Entry saved! Check Data Status to confirm coverage.
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {editingEntryId ? "Update Entry" : "Save Entry"}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">How Periods Work</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-wg-muted space-y-3 font-body normal-case">
            <p>
              <strong className="text-wg-charcoal">Quarterly metrics</strong> — one
              entry per quarter (Q1–Q4).
            </p>
            <p>
              <strong className="text-wg-charcoal">Monthly metrics</strong> — enter
              each month within the quarter (e.g. Jan, Feb, Mar for Q1).
            </p>
            <p>
              <strong className="text-wg-charcoal">Annual metrics</strong> — one
              entry per calendar year.
            </p>
            <p>
              The Data Status tab shows what&apos;s filled vs missing for every
              metric and quarter.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
