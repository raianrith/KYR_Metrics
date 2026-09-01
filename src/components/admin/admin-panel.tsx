"use client";

import { AddEntryTab } from "@/components/admin/add-entry-tab";
import { AllEntriesTab } from "@/components/admin/all-entries-tab";
import { DataStatusTab } from "@/components/admin/data-status-tab";
import { SetMetricTargetsTab } from "@/components/admin/set-metric-targets-tab";
import { Tier3MetricsTab } from "@/components/admin/tier-3-metrics-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { partitionByTier3 } from "@/lib/metrics";
import type { Quarter } from "@/lib/periods";
import type { MetricDashboardRow, MetricEntry, MetricPeriodTarget } from "@/lib/types";
import { ClipboardList, Database, HelpCircle, PlusCircle, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface AdminPanelProps {
  metrics: MetricDashboardRow[];
  entriesByMetric: Record<string, MetricEntry[]>;
  periodTargetsByMetric: Record<string, MetricPeriodTarget[]>;
}

export function AdminPanel({
  metrics,
  entriesByMetric,
  periodTargetsByMetric,
}: AdminPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("targets");
  const [statusYear, setStatusYear] = useState(new Date().getFullYear());
  const [prefill, setPrefill] = useState<{
    metricId: string;
    year: number;
    quarter: Quarter;
  } | null>(null);

  const handleJumpToEntry = (metricId: string, quarter: Quarter) => {
    setPrefill({ metricId, year: statusYear, quarter });
    setActiveTab("add");
  };

  const handleSaved = () => {
    router.refresh();
  };

  const { primary, tier3 } = useMemo(
    () => partitionByTier3(metrics),
    [metrics]
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl font-normal text-wg-suede">
          Admin
        </h2>
        <p className="text-wg-muted mt-2 font-body normal-case tracking-normal">
          Manage KYR metric data by quarter — see what&apos;s tracked, what&apos;s
          missing, and add or update entries.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex-wrap h-auto gap-1 w-full sm:w-auto">
          <TabsTrigger value="targets" className="gap-2">
            <Target className="w-4 h-4" />
            Set Metric Targets
          </TabsTrigger>
          <TabsTrigger value="add" className="gap-2">
            <PlusCircle className="w-4 h-4" />
            Add/Update Metric Data
          </TabsTrigger>
          <TabsTrigger value="status" className="gap-2">
            <ClipboardList className="w-4 h-4" />
            Data Status
          </TabsTrigger>
          <TabsTrigger value="entries" className="gap-2">
            <Database className="w-4 h-4" />
            All Data
          </TabsTrigger>
          <TabsTrigger value="tier3" className="gap-2">
            <HelpCircle className="w-4 h-4" />
            Tier 3{tier3.length > 0 ? ` (${tier3.length})` : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="targets">
          <SetMetricTargetsTab
            metrics={primary}
            entriesByMetric={entriesByMetric}
            periodTargetsByMetric={periodTargetsByMetric}
            onSaved={handleSaved}
          />
        </TabsContent>

        <TabsContent value="add">
          <AddEntryTab
            metrics={primary}
            entriesByMetric={entriesByMetric}
            periodTargetsByMetric={periodTargetsByMetric}
            prefill={prefill}
            onSaved={handleSaved}
          />
        </TabsContent>

        <TabsContent value="status">
          <DataStatusTab
            metrics={primary}
            entriesByMetric={entriesByMetric}
            year={statusYear}
            onYearChange={setStatusYear}
            onJumpToEntry={handleJumpToEntry}
          />
        </TabsContent>

        <TabsContent value="entries">
          <AllEntriesTab metrics={primary} entriesByMetric={entriesByMetric} />
        </TabsContent>

        <TabsContent value="tier3">
          <Tier3MetricsTab metrics={tier3} onSaved={handleSaved} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
