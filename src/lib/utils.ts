import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ACRONYMS = new Set([
  "VP", "COO", "AGI", "CSAT", "SALs", "ESOP", "KYR", "L10", "ELT", "PNL",
  "AI", "ROI", "CEO", "CFO", "B2B", "CRM", "SEO", "SEM", "HubSpot",
]);

export function titleCase(text: string | null | undefined): string {
  if (!text) return "—";
  return text
    .split(/(\s+|&|\/|-)/)
    .map((part) => {
      if (!part.trim() || part === "&" || part === "/" || part === "-") return part;
      const upper = part.toUpperCase();
      if (ACRONYMS.has(upper) || ACRONYMS.has(part)) return upper;
      if (/^[A-Z]{2,}$/.test(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join("");
}

export function roundTo2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatNumber(value: number): string {
  return roundTo2(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatValue(
  value: number | null | undefined,
  valueType: string
): string {
  if (value === null || value === undefined) return "—";
  const rounded = roundTo2(value);
  switch (valueType) {
    case "percentage":
      return `${formatNumber(rounded)}%`;
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(rounded);
    case "score":
      return formatNumber(rounded);
    case "days":
      return `${formatNumber(rounded)} Days`;
    default:
      return formatNumber(rounded);
  }
}

export function cadenceLabel(cadence: string): string {
  const labels: Record<string, string> = {
    weekly: "Weekly",
    monthly: "Monthly",
    quarterly: "Quarterly",
    annual: "Yearly",
    ad_hoc: "Ad Hoc",
  };
  return labels[cadence] ?? titleCase(cadence.replace(/_/g, " "));
}

export const CADENCE_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Yearly" },
] as const;

export function statusColor(status: string | null): string {
  switch (status) {
    case "met":
    case "on_track":
      return "text-wg-suede bg-wg-suede/10 border-wg-suede/20";
    case "at_risk":
      return "text-wg-orange bg-wg-orange/10 border-wg-orange/20";
    case "not_met":
    case "off_track":
      return "text-wg-gold bg-wg-gold/10 border-wg-gold/20";
    default:
      return "text-wg-muted bg-wg-light border-black/10";
  }
}

export function statusLabel(status: string | null): string {
  switch (status) {
    case "met":
      return "Met";
    case "on_track":
      return "On Track";
    case "at_risk":
      return "At Risk";
    case "not_met":
      return "Not Met";
    case "off_track":
      return "Off Track";
    default:
      return "Pending";
  }
}

/** Consistent label styling for field captions */
export const fieldLabelClass =
  "text-wg-muted text-[11px] font-medium tracking-wide block";
