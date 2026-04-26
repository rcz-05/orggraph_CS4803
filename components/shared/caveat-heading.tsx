import * as React from "react";

import { cn } from "@/lib/utils";

type Props = React.HTMLAttributes<HTMLHeadingElement> & {
  as?: "h1" | "h2" | "h3";
};

export function CaveatHeading({
  className,
  as = "h2",
  children,
  style,
  ...props
}: Props) {
  const classes = cn(
    "font-bold leading-[1.15] tracking-[-0.01em] text-[#0a0a0a]",
    as === "h1" && "text-[clamp(2.2rem,6vw,4.5rem)]",
    as === "h2" && "text-[clamp(1.6rem,3.5vw,2.8rem)]",
    as === "h3" && "text-2xl",
    className
  );
  const styles: React.CSSProperties = {
    fontFamily: "var(--font-caveat), cursive",
    ...style,
  };

  if (as === "h1") {
    return (
      <h1 className={classes} style={styles} {...props}>
        {children}
      </h1>
    );
  }
  if (as === "h3") {
    return (
      <h3 className={classes} style={styles} {...props}>
        {children}
      </h3>
    );
  }
  return (
    <h2 className={classes} style={styles} {...props}>
      {children}
    </h2>
  );
}
