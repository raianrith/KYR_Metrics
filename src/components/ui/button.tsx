import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wg-orange/50 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "wg-btn-primary text-wg-charcoal border-2 border-wg-charcoal/20",
        secondary:
          "bg-wg-gold text-white border-2 border-wg-gold hover:bg-wg-gold/90 shadow-sm",
        ghost: "hover:bg-wg-suede/5 text-wg-charcoal normal-case tracking-normal font-medium",
        outline:
          "bg-transparent text-wg-suede border-2 border-wg-suede hover:bg-wg-suede hover:text-white",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
