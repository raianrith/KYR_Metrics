"use client";

import type { Quarter } from "@/lib/periods";
import {
  formatQuarterButtonLabel,
  getAvailableYears,
  quarterMonthRange,
} from "@/lib/periods";
import type { MetricEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

export type PeriodView = Quarter | "full";

interface PeriodSelectorProps {
  year: number;
  quarter: PeriodView;
  onYearChange: (year: number) => void;
  onQuarterChange: (quarter: PeriodView) => void;
  entriesByMetric?: Record<string, MetricEntry[]>;
  className?: string;
}

export function PeriodSelector({
  year,
  quarter,
  onYearChange,
  onQuarterChange,
  entriesByMetric = {},
  className,
}: PeriodSelectorProps) {
  const years = getAvailableYears(entriesByMetric);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 p-4 rounded-sm bg-white border border-black/5",
        className
      )}
    >
      <span className="text-[11px] font-medium text-wg-muted shrink-0">
        Viewing
      </span>

      <div className="flex items-center gap-1">
        {years.map((y) => (
          <button
            key={y}
            type="button"
            onClick={() => onYearChange(y)}
            className={cn(
              "px-3 py-1.5 rounded-sm text-sm font-semibold transition-all",
              year === y
                ? "bg-wg-suede text-white"
                : "text-wg-muted hover:bg-wg-light"
            )}
          >
            {y}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-black/10 hidden sm:block" />

      <div className="flex flex-wrap items-center gap-1.5">
        {([1, 2, 3, 4] as Quarter[]).map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onQuarterChange(q)}
            className={cn(
              "flex flex-col items-center px-3 py-1.5 rounded-sm text-sm font-semibold transition-all min-w-[5.5rem]",
              quarter === q
                ? "bg-wg-orange text-white"
                : "text-wg-muted hover:bg-wg-light"
            )}
          >
            <span>Q{q}</span>
            <span
              className={cn(
                "text-[10px] font-normal mt-0.5",
                quarter === q ? "text-white/90" : "text-wg-muted"
              )}
            >
              {quarterMonthRange(q)}
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => onQuarterChange("full")}
          className={cn(
            "px-3 py-1.5 rounded-sm text-sm font-semibold transition-all",
            quarter === "full"
              ? "bg-wg-gold text-white"
              : "text-wg-muted hover:bg-wg-light"
          )}
        >
          Full Year
        </button>
      </div>
    </div>
  );
}
