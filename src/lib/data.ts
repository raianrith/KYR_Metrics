import { createClient } from "@/lib/supabase/server";
import type { MetricDashboardRow, MetricEntry } from "@/lib/types";
import { DEMO_ENTRIES, DEMO_METRICS_WITH_LATEST } from "@/lib/demo-data";

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
  isDemo: boolean;
  error?: string;
}> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes("your_supabase")) {
    return {
      metrics: DEMO_METRICS_WITH_LATEST,
      entriesByMetric: groupEntriesByMetric(DEMO_ENTRIES),
      isDemo: true,
    };
  }

  try {
    const supabase = await createClient();
    const [metricsRes, entriesRes] = await Promise.all([
      supabase.from("metric_dashboard").select("*").order("sort_order"),
      supabase
        .from("metric_entries")
        .select("*")
        .order("period_end", { ascending: true }),
    ]);

    if (metricsRes.error) throw metricsRes.error;
    if (entriesRes.error) throw entriesRes.error;

    return {
      metrics: (metricsRes.data as MetricDashboardRow[]) ?? [],
      entriesByMetric: groupEntriesByMetric(
        (entriesRes.data as MetricEntry[]) ?? []
      ),
      isDemo: false,
    };
  } catch (err) {
    return {
      metrics: DEMO_METRICS_WITH_LATEST,
      entriesByMetric: groupEntriesByMetric(DEMO_ENTRIES),
      isDemo: true,
      error: err instanceof Error ? err.message : "Database connection failed",
    };
  }
}
