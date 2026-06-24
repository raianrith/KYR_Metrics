"use client";

import { AddEntryTab } from "@/components/admin/add-entry-tab";
import { AllEntriesTab } from "@/components/admin/all-entries-tab";
import { DataStatusTab } from "@/components/admin/data-status-tab";
import { SetMetricTargetsTab } from "@/components/admin/set-metric-targets-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Quarter } from "@/lib/periods";
import type { MetricDashboardRow, MetricEntry, MetricPeriodTarget } from "@/lib/types";
import { ClipboardList, Database, PlusCircle, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
        </TabsList>

        <TabsContent value="targets">
          <SetMetricTargetsTab
            metrics={metrics}
            entriesByMetric={entriesByMetric}
            periodTargetsByMetric={periodTargetsByMetric}
            onSaved={handleSaved}
          />
        </TabsContent>

        <TabsContent value="add">
          <AddEntryTab
            metrics={metrics}
            entriesByMetric={entriesByMetric}
            periodTargetsByMetric={periodTargetsByMetric}
            prefill={prefill}
            onSaved={handleSaved}
          />
        </TabsContent>

        <TabsContent value="status">
          <DataStatusTab
            metrics={metrics}
            entriesByMetric={entriesByMetric}
            year={statusYear}
            onYearChange={setStatusYear}
            onJumpToEntry={handleJumpToEntry}
          />
        </TabsContent>

        <TabsContent value="entries">
          <AllEntriesTab metrics={metrics} entriesByMetric={entriesByMetric} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
