"use client";

import { Input } from "@/components/ui/input";
import type { Quarter } from "@/lib/periods";
import {
  getAvailableYears,
  getQuarterBounds,
  quarterMonthRange,
} from "@/lib/periods";
import type { MetricEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

export type PeriodView = Quarter | "full" | "custom";

interface PeriodSelectorProps {
  year: number;
  quarter: PeriodView;
  customStart: string;
  customEnd: string;
  onYearChange: (year: number) => void;
  onQuarterChange: (quarter: PeriodView) => void;
  onCustomRangeChange: (start: string, end: string) => void;
  entriesByMetric?: Record<string, MetricEntry[]>;
  className?: string;
}

export function PeriodSelector({
  year,
  quarter,
  customStart,
  customEnd,
  onYearChange,
  onQuarterChange,
  onCustomRangeChange,
  entriesByMetric = {},
  className,
}: PeriodSelectorProps) {
  const years = getAvailableYears(entriesByMetric);
  const isCustom = quarter === "custom";

  const handlePresetQuarter = (q: Quarter | "full") => {
    onQuarterChange(q);
  };

  const handleCustomClick = () => {
    if (!isCustom) {
      const q = typeof quarter === "number" ? quarter : getCurrentQuarterFromDate();
      const bounds = getQuarterBounds(year, q);
      onCustomRangeChange(bounds.start, bounds.end);
    }
    onQuarterChange("custom");
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-4 rounded-sm bg-white border border-black/5",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
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
                year === y && !isCustom
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
              onClick={() => handlePresetQuarter(q)}
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
            onClick={() => handlePresetQuarter("full")}
            className={cn(
              "px-3 py-1.5 rounded-sm text-sm font-semibold transition-all",
              quarter === "full"
                ? "bg-wg-gold text-white"
                : "text-wg-muted hover:bg-wg-light"
            )}
          >
            Full Year
          </button>
          <button
            type="button"
            onClick={handleCustomClick}
            className={cn(
              "px-3 py-1.5 rounded-sm text-sm font-semibold transition-all",
              isCustom
                ? "bg-wg-charcoal text-white"
                : "text-wg-muted hover:bg-wg-light"
            )}
          >
            Custom
          </button>
        </div>
      </div>

      {isCustom && (
        <div className="flex flex-wrap items-end gap-3 pt-1 border-t border-black/5">
          <div className="space-y-1">
            <label
              htmlFor="custom-start"
              className="text-[11px] font-medium text-wg-muted block"
            >
              From
            </label>
            <Input
              id="custom-start"
              type="date"
              value={customStart}
              max={customEnd}
              onChange={(e) => onCustomRangeChange(e.target.value, customEnd)}
              className="w-[160px] h-9"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="custom-end"
              className="text-[11px] font-medium text-wg-muted block"
            >
              To
            </label>
            <Input
              id="custom-end"
              type="date"
              value={customEnd}
              min={customStart}
              onChange={(e) => onCustomRangeChange(customStart, e.target.value)}
              className="w-[160px] h-9"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function getCurrentQuarterFromDate(): Quarter {
  return (Math.ceil((new Date().getMonth() + 1) / 3) as Quarter);
}
