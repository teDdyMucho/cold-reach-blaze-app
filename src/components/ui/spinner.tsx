import React, { forwardRef, useMemo } from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "secondary" | "destructive" | "success";
  className?: string;
}

interface DotSpinnerProps extends SpinnerProps {}

export const DotSpinner = forwardRef<HTMLDivElement, DotSpinnerProps>(
  ({ size = "md", variant = "default", className }, ref) => {
    const dotSize = useMemo(() => {
      switch (size) {
        case "sm":
          return 4;
        case "md":
          return 6;
        case "lg":
          return 8;
        case "xl":
          return 10;
        default:
          return 6;
      }
    }, [size]);

    const containerClasses = cn(
      "inline-flex items-center justify-center",
      {
        "text-primary": variant === "primary",
        "text-secondary": variant === "secondary",
        "text-destructive": variant === "destructive",
        "text-success": variant === "success",
        "text-muted-foreground": variant === "default",
      },
      className
    );

    const dotClasses = cn(
      "inline-block rounded-full animate-pulse",
      {
        "bg-primary": variant === "primary",
        "bg-secondary": variant === "secondary",
        "bg-destructive": variant === "destructive",
        "bg-success": variant === "success",
        "bg-muted-foreground": variant === "default",
      }
    );

    return (
      <div
        ref={ref}
        className={containerClasses}
        role="status"
        aria-label="Loading"
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={dotClasses}
            style={{
              width: dotSize,
              height: dotSize,
              marginLeft: i > 0 ? dotSize / 2 : 0,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

DotSpinner.displayName = "DotSpinner";

interface WaveSpinnerProps extends SpinnerProps {}

export const WaveSpinner = forwardRef<HTMLDivElement, WaveSpinnerProps>(
  ({ size = "md", variant = "default", className }, ref) => {
    const dots = 5;
    const animationDuration = 1.3;
    const dotSize = useMemo(() => {
      switch (size) {
        case "sm":
          return 4;
        case "md":
          return 6;
        case "lg":
          return 8;
        case "xl":
          return 10;
        default:
          return 6;
      }
    }, [size]);

    const containerWidth = dots * dotSize * 2;
    
    const containerClasses = cn(
      "inline-flex items-center justify-center",
      {
        "text-primary": variant === "primary",
        "text-secondary": variant === "secondary",
        "text-destructive": variant === "destructive",
        "text-success": variant === "success",
        "text-muted-foreground": variant === "default",
      },
      className
    );

    const dotClasses = cn(
      "inline-block rounded-full",
      {
        "bg-primary": variant === "primary",
        "bg-secondary": variant === "secondary",
        "bg-destructive": variant === "destructive",
        "bg-success": variant === "success",
        "bg-muted-foreground": variant === "default",
      }
    );

    return (
      <div
        ref={ref}
        className={containerClasses}
        style={{ width: containerWidth }}
        role="status"
        aria-label="Loading"
      >
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes spinner-wave {
              0%, 100% {
                transform: scaleY(0.5);
                opacity: 0.2;
              }
              50% {
                transform: scaleY(1.0);
                opacity: 1.0;
              }
            }
          `
        }} />
        {Array.from({ length: dots }).map((_, i) => (
          <div
            key={i}
            className={dotClasses}
            style={{
              width: dotSize,
              height: dotSize * 2,
              margin: `0 ${dotSize / 2}px`,
              animation: `spinner-wave ${animationDuration}s ease-in-out ${
                (i / dots) * animationDuration
              }s infinite`,
              borderRadius: dotSize / 2,
            }}
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

WaveSpinner.displayName = "WaveSpinner";

export { SpinnerProps };
