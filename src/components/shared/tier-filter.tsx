"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMetricTiers } from "@/lib/metrics";
import type { MetricDashboardRow } from "@/lib/types";

interface TierFilterProps {
  value: string;
  onChange: (value: string) => void;
  metrics: MetricDashboardRow[];
  className?: string;
  triggerClassName?: string;
  placeholder?: string;
  showUnassigned?: boolean;
}

export function TierFilter({
  value,
  onChange,
  metrics,
  triggerClassName = "w-[160px]",
  placeholder = "Tier",
  showUnassigned = false,
}: TierFilterProps) {
  const tiers = getMetricTiers(metrics);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Tiers</SelectItem>
        {showUnassigned && (
          <SelectItem value="unassigned">Unassigned</SelectItem>
        )}
        {tiers.map((tier) => (
          <SelectItem key={tier} value={tier}>
            {tier}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
