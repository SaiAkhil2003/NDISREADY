import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-gray-100 bg-white text-card-foreground shadow-sm",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex min-w-0 max-w-full flex-col space-y-1.5 p-4 sm:p-5 lg:p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  React.ElementRef<"h3">,
  React.ComponentPropsWithoutRef<"h3">
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("min-w-0 max-w-full break-words text-xl font-semibold leading-tight text-slate-950", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  React.ElementRef<"p">,
  React.ComponentPropsWithoutRef<"p">
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("min-w-0 max-w-full break-words text-sm leading-5 text-slate-500", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("min-w-0 max-w-full p-4 pt-0 sm:p-5 sm:pt-0 lg:p-6 lg:pt-0", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

export { Card, CardContent, CardDescription, CardHeader, CardTitle };
