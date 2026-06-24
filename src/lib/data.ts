import { createClient } from "@/lib/supabase/server";
import { groupPeriodTargetsByMetric } from "@/lib/targets";
import type { MetricDashboardRow, MetricEntry, MetricPeriodTarget } from "@/lib/types";
import { DEMO_ENTRIES, DEMO_METRICS_WITH_LATEST } from "@/lib/demo-data";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return "Database connection failed";
}

function isMissingPeriodTargetsTable(err: { code?: string; message?: string }) {
  return (
    err.code === "PGRST205" ||
    (err.message?.includes("metric_period_targets") ?? false)
  );
}

export function groupEntriesByMetric(
  entries: MetricEntry[]
): Record<string, MetricEntry[]> {
  const map: Record<string, MetricEntry[]> = {};
  for (const entry of entries) {
    if (!map[entry.metric_id]) map[entry.metric_id] = [];
    map[entry.metric_id].push(entry);
  }
  for (const id of Object.keys(map)) {
    map[id].sort(
      (a, b) =>
        new Date(a.period_end).getTime() - new Date(b.period_end).getTime()
    );
  }
  return map;
}

export async function getDashboardData(): Promise<{
  metrics: MetricDashboardRow[];
  entriesByMetric: Record<string, MetricEntry[]>;
  periodTargetsByMetric: Record<string, MetricPeriodTarget[]>;
  isDemo: boolean;
  error?: string;
}> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes("your_supabase")) {
    return {
      metrics: DEMO_METRICS_WITH_LATEST,
      entriesByMetric: groupEntriesByMetric(DEMO_ENTRIES),
      periodTargetsByMetric: {},
      isDemo: true,
    };
  }

  try {
    const supabase = await createClient();
    const [metricsRes, entriesRes, targetsRes] = await Promise.all([
      supabase.from("metric_dashboard").select("*").order("sort_order"),
      supabase
        .from("metric_entries")
        .select("*")
        .order("period_end", { ascending: true }),
      supabase
        .from("metric_period_targets")
        .select("*")
        .order("period_start", { ascending: true }),
    ]);

    if (metricsRes.error) throw metricsRes.error;
    if (entriesRes.error) throw entriesRes.error;

    let periodTargets: MetricPeriodTarget[] = [];
    if (targetsRes.error) {
      if (!isMissingPeriodTargetsTable(targetsRes.error)) {
        throw targetsRes.error;
      }
    } else {
      periodTargets = (targetsRes.data as MetricPeriodTarget[]) ?? [];
    }

    return {
      metrics: (metricsRes.data as MetricDashboardRow[]) ?? [],
      entriesByMetric: groupEntriesByMetric(
        (entriesRes.data as MetricEntry[]) ?? []
      ),
      periodTargetsByMetric: groupPeriodTargetsByMetric(periodTargets),
      isDemo: false,
      error: targetsRes.error
        ? "Run migration 007_metric_period_targets.sql in Supabase to enable per-period targets."
        : undefined,
    };
  } catch (err) {
    return {
      metrics: DEMO_METRICS_WITH_LATEST,
      entriesByMetric: groupEntriesByMetric(DEMO_ENTRIES),
      periodTargetsByMetric: {},
      isDemo: true,
      error: getErrorMessage(err),
    };
  }
}
