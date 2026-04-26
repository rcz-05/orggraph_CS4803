import * as React from "react";

import { cn } from "@/lib/utils";

export function Eyebrow({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "text-[11px] font-medium tracking-[0.15em] uppercase text-[#999]",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
