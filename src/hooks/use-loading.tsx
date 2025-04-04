import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { LoadingOverlay } from "@/components/ui/spinner";

interface LoadingContextType {
  isLoading: boolean;
  startLoading: (options?: LoadingOptions) => void;
  stopLoading: () => void;
}

interface LoadingOptions {
  message?: string;
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  spinnerType?: "default" | "pulse" | "wave";
  fullScreen?: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<LoadingOptions>({
    message: "Loading...",
    variant: "primary",
    spinnerType: "wave",
    fullScreen: true,
  });

  const startLoading = useCallback((newOptions?: LoadingOptions) => {
    if (newOptions) {
      setOptions((prev) => ({ ...prev, ...newOptions }));
    }
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      {isLoading && (
        <LoadingOverlay
          label={options.message}
          variant={options.variant}
          spinnerType={options.spinnerType}
          fullScreen={options.fullScreen}
        />
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  
  return context;
};
