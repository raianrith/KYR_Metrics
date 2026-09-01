import { Card, CardContent } from "@/components/ui/card";
import { cn, titleCase } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger" | "muted";
  subtitle?: string;
}

const variantStyles = {
  default: "from-wg-suede/5 to-wg-suede/10 border-wg-suede/10",
  success: "from-green-50 to-green-100/40 border-green-200/50",
  warning: "from-amber-50 to-amber-100/40 border-amber-200/50",
  danger: "from-red-50 to-red-100/40 border-red-200/50",
  muted: "from-white to-wg-light border-black/5",
};

const iconStyles = {
  default: "text-wg-suede bg-wg-suede/10",
  success: "text-green-700 bg-green-100",
  warning: "text-amber-700 bg-amber-100",
  danger: "text-red-700 bg-red-100",
  muted: "text-wg-muted bg-wg-light",
};

const valueStyles = {
  default: "text-wg-suede",
  success: "text-green-700",
  warning: "text-amber-700",
  danger: "text-red-700",
  muted: "text-wg-suede",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  variant = "default",
  subtitle,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border bg-gradient-to-br rounded-sm",
        variantStyles[variant]
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium text-wg-muted">
              {titleCase(label)}
            </p>
            <p className={cn("font-display text-3xl font-normal mt-2", valueStyles[variant])}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-wg-muted mt-1 font-body normal-case tracking-normal">
                {subtitle}
              </p>
            )}
          </div>
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-sm",
              iconStyles[variant]
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
