"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMetricOwners } from "@/lib/metrics";
import type { MetricDashboardRow } from "@/lib/types";
import { titleCase } from "@/lib/utils";

interface MetricOwnerFilterProps {
  value: string;
  onChange: (value: string) => void;
  metrics: MetricDashboardRow[];
  className?: string;
  triggerClassName?: string;
  placeholder?: string;
  showUnassigned?: boolean;
}

export function MetricOwnerFilter({
  value,
  onChange,
  metrics,
  triggerClassName = "w-[160px]",
  placeholder = "Metric Owner",
  showUnassigned = false,
}: MetricOwnerFilterProps) {
  const owners = getMetricOwners(metrics);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Metric Owners</SelectItem>
        {showUnassigned && (
          <SelectItem value="unassigned">Unassigned</SelectItem>
        )}
        {owners.map((owner) => (
          <SelectItem key={owner} value={owner}>
            {titleCase(owner)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
