import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner, PulseSpinner, WaveSpinner, LoadingOverlay } from "@/components/ui/spinner";
import { useLoading } from "@/hooks/use-loading";

export default function LoadingExample() {
  const { startLoading, stopLoading } = useLoading();
  const [localLoading, setLocalLoading] = useState(false);
  
  const simulateGlobalLoading = () => {
    startLoading({
      message: "Processing your request...",
      variant: "primary",
      spinnerType: "wave"
    });
    
    // Simulate an API call
    setTimeout(() => {
      stopLoading();
    }, 3000);
  };
  
  const simulateComponentLoading = () => {
    setLocalLoading(true);
    
    // Simulate an API call
    setTimeout(() => {
      setLocalLoading(false);
    }, 3000);
  };
  
  return (
    <div className="container py-10 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Loading Examples</h1>
        <p className="text-muted-foreground">Examples of how to use the loading components in your application</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Global Loading State</h2>
          <p className="text-muted-foreground">
            Use the global loading state when you want to block the entire UI during a long-running operation.
            This is useful for operations like saving data, submitting forms, or any action that requires
            the user to wait before continuing.
          </p>
          
          <Button 
            onClick={simulateGlobalLoading}
            className="w-full"
          >
            Show Global Loading
          </Button>
        </Card>
        
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Component Loading State</h2>
          <p className="text-muted-foreground">
            Use component loading states when you want to show loading indicators for specific parts of your UI.
            This allows users to continue interacting with other parts of the application.
          </p>
          
          <div className="relative min-h-[200px] border rounded-md flex items-center justify-center">
            {localLoading ? (
              <LoadingOverlay 
                variant="primary" 
                spinnerType="pulse"
                label="Loading component data..."
              />
            ) : (
              <div className="text-center p-4">
                <p>Component Content</p>
                <p className="text-muted-foreground">This content will be hidden during loading</p>
              </div>
            )}
          </div>
          
          <Button 
            onClick={simulateComponentLoading}
            className="w-full"
          >
            Show Component Loading
          </Button>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Button Loading State</h2>
          <p className="text-muted-foreground">
            Use inline loading indicators in buttons to show that an action is in progress.
          </p>
          
          <Button 
            className="w-full flex items-center justify-center gap-2"
            disabled={localLoading}
          >
            {localLoading ? (
              <>
                <Spinner size="sm" variant="primary" />
                <span>Saving...</span>
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </Card>
        
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Inline Loading</h2>
          <p className="text-muted-foreground">
            Use inline loading indicators to show that specific content is loading.
          </p>
          
          <div className="flex items-center gap-2">
            <span>Loading data</span>
            <PulseSpinner size="sm" variant="primary" />
          </div>
        </Card>
        
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Section Loading</h2>
          <p className="text-muted-foreground">
            Use section loading indicators to show that a specific section is loading.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <WaveSpinner size="md" variant="primary" />
            <span className="text-sm text-muted-foreground">Loading chart data...</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
