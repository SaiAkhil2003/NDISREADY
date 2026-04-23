import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex max-w-full items-center rounded-full border px-3 py-1 text-[0.6875rem] font-semibold uppercase leading-5 tracking-[0.18em] whitespace-normal break-words transition-colors",
  {
    variants: {
      variant: {
        default: "border-blue-100 bg-blue-50 text-blue-700",
        secondary: "border-slate-200 bg-slate-100 text-slate-700",
        outline: "border-slate-200 bg-white text-slate-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
