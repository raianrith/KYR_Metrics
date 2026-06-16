import { cn } from "@/lib/utils";
import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-sm border border-black/10 bg-white px-3 py-2 text-sm font-body normal-case tracking-normal ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-wg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wg-orange/40 focus-visible:border-wg-orange/50 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
