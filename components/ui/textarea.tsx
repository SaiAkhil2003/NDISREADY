import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  React.ElementRef<"textarea">,
  React.ComponentPropsWithoutRef<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[120px] w-full rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-base leading-6 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
