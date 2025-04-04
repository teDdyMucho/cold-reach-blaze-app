import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  className?: string;
}

export function PageTransition({ className }: PageTransitionProps) {
  const location = useLocation();
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 1000); // Animation duration
    
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  if (!isAnimating) return null;
  
  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-500",
      isAnimating ? "opacity-100" : "opacity-0 pointer-events-none",
      className
    )}>
      <div className="relative w-24 h-24">
        {/* Animated logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg 
            className="w-16 h-16" 
            viewBox="0 0 100 100" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer rotating circle */}
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="8" 
              strokeDasharray="283" 
              strokeDashoffset="283" 
              className="text-primary animate-dash"
            />
            
            {/* Inner pulsing circle */}
            <circle 
              cx="50" 
              cy="50" 
              r="20" 
              fill="currentColor" 
              className="text-primary animate-pulse"
            />
            
            {/* Animated rays */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <line 
                key={i}
                x1="50" 
                y1="50" 
                x2={50 + 30 * Math.cos(angle * Math.PI / 180)} 
                y2={50 + 30 * Math.sin(angle * Math.PI / 180)} 
                stroke="currentColor" 
                strokeWidth="4" 
                strokeLinecap="round"
                className="text-primary animate-ray"
                style={{ 
                  animationDelay: `${i * 0.1}s`,
                  transformOrigin: 'center',
                }}
              />
            ))}
          </svg>
        </div>
        
        {/* Text that fades in */}
        <div className="absolute bottom-0 left-0 right-0 text-center animate-fadeIn">
          <span className="text-primary font-medium">Loading...</span>
        </div>
      </div>
    </div>
  );
}

// Component to handle initial app loading
export function AppLoader() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate app initialization time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div className="relative">
        {/* App logo animation */}
        <svg 
          className="w-32 h-32" 
          viewBox="0 0 100 100" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Animated background circle */}
          <circle 
            cx="50" 
            cy="50" 
            r="48" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            className="text-primary/20"
          />
          
          {/* Animated progress circle */}
          <circle 
            cx="50" 
            cy="50" 
            r="48" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="4" 
            strokeDasharray="301" 
            strokeDashoffset="301" 
            className="text-primary animate-progress"
            transform="rotate(-90 50 50)"
          />
          
          {/* Center logo */}
          <g className="animate-bounce-slow">
            <circle 
              cx="50" 
              cy="50" 
              r="25" 
              fill="currentColor" 
              className="text-primary/90"
            />
            <path 
              d="M40 45 L50 35 L60 45 M50 35 L50 65" 
              stroke="white" 
              strokeWidth="4" 
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </g>
          
          {/* Orbiting dots */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <circle 
              key={i}
              cx={50 + 35 * Math.cos(angle * Math.PI / 180)} 
              cy={50 + 35 * Math.sin(angle * Math.PI / 180)} 
              r="4" 
              fill="currentColor" 
              className="text-primary animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </svg>
      </div>
      
      <div className="mt-8 text-center space-y-2 animate-fadeIn">
        <h1 className="text-2xl font-bold text-primary">Cold Reach Blaze</h1>
        <p className="text-muted-foreground">Initializing application...</p>
      </div>
    </div>
  );
}
