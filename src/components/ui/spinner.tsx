import React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  label?: string;
  showLabel?: boolean;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

const variantClasses = {
  default: "text-gray-400",
  primary: "text-primary",
  secondary: "text-secondary",
  success: "text-green-500",
  warning: "text-yellow-500",
  danger: "text-red-500",
};

export function Spinner({
  size = "md",
  variant = "primary",
  label = "Loading...",
  showLabel = false,
  className,
  ...props
}: SpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center", className)} {...props}>
      <div className="relative">
        {/* Outer spinning circle */}
        <div
          className={cn(
            "animate-spin rounded-full border-t-transparent border-4",
            sizeClasses[size],
            variantClasses[variant]
          )}
        />
        
        {/* Inner pulsing dot */}
        <div 
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse",
            {
              "w-1 h-1": size === "sm",
              "w-2 h-2": size === "md",
              "w-3 h-3": size === "lg",
              "w-4 h-4": size === "xl",
            },
            variantClasses[variant]
          )}
        />
      </div>
      
      {showLabel && (
        <span className={cn("mt-2 text-sm font-medium", variantClasses[variant])}>
          {label}
        </span>
      )}
    </div>
  );
}

// More advanced loading spinner with a cool effect
export function PulseSpinner({
  size = "md",
  variant = "primary",
  className,
  ...props
}: Omit<SpinnerProps, "label" | "showLabel">) {
  return (
    <div 
      className={cn(
        "flex items-center justify-center gap-2",
        className
      )} 
      {...props}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            "rounded-full animate-pulse",
            variantClasses[variant],
            {
              "w-1 h-1": size === "sm",
              "w-2 h-2": size === "md",
              "w-3 h-3": size === "lg",
              "w-4 h-4": size === "xl",
            }
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}

// Loading overlay for full-screen or container loading states
export function LoadingOverlay({
  variant = "primary",
  label = "Loading...",
  showLabel = true,
  spinnerType = "pulse",
  fullScreen = false,
  className,
  ...props
}: SpinnerProps & {
  spinnerType?: "default" | "pulse";
  fullScreen?: boolean;
}) {
  const SpinnerComponent = spinnerType === "pulse" ? PulseSpinner : Spinner;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50",
        fullScreen ? "fixed inset-0" : "absolute inset-0",
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center gap-3">
        <SpinnerComponent size="lg" variant={variant} />
        {showLabel && (
          <p className={cn("text-sm font-medium", variantClasses[variant])}>
            {label}
          </p>
        )}
      </div>
    </div>
  );
}
