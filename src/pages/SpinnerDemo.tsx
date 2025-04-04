import React, { useState } from "react";
import { Spinner, PulseSpinner, WaveSpinner, LoadingOverlay } from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function SpinnerDemo() {
  const [variant, setVariant] = useState<"default" | "primary" | "secondary" | "success" | "warning" | "danger">("primary");
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayType, setOverlayType] = useState<"default" | "pulse" | "wave">("wave");
  const [fullScreen, setFullScreen] = useState(false);

  return (
    <div className="container py-10 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Loading Spinners</h1>
        <p className="text-muted-foreground">A collection of beautiful loading animations for your application</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Controls</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="variant">Spinner Color</Label>
              <Select value={variant} onValueChange={(v: any) => setVariant(v)}>
                <SelectTrigger id="variant">
                  <SelectValue placeholder="Select variant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="danger">Danger</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="overlay-type">Overlay Spinner Type</Label>
              <Select value={overlayType} onValueChange={(v: any) => setOverlayType(v)}>
                <SelectTrigger id="overlay-type">
                  <SelectValue placeholder="Select overlay spinner type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="pulse">Pulse</SelectItem>
                  <SelectItem value="wave">Wave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="fullscreen" 
                checked={fullScreen} 
                onCheckedChange={setFullScreen} 
              />
              <Label htmlFor="fullscreen">Full Screen Overlay</Label>
            </div>

            <Button 
              onClick={() => setShowOverlay(true)} 
              className="w-full"
            >
              Show Loading Overlay
            </Button>
          </div>
        </Card>

        <Card className="p-6 space-y-6">
          <h2 className="text-xl font-semibold">Preview</h2>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col items-center gap-2">
              <Spinner variant={variant} />
              <span className="text-sm text-muted-foreground">Default</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <Spinner variant={variant} showLabel />
              <span className="text-sm text-muted-foreground">With Label</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <PulseSpinner variant={variant} />
              <span className="text-sm text-muted-foreground">Pulse</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <WaveSpinner variant={variant} />
              <span className="text-sm text-muted-foreground">Wave</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <Spinner size="sm" variant={variant} />
              <span className="text-sm text-muted-foreground">Small</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <Spinner size="lg" variant={variant} />
              <span className="text-sm text-muted-foreground">Large</span>
            </div>
          </div>

          <div className="relative h-40 border rounded-md flex items-center justify-center">
            <p className="text-muted-foreground">Content area</p>
            {showOverlay && (
              <LoadingOverlay 
                variant={variant} 
                spinnerType={overlayType}
                fullScreen={fullScreen}
                onMouseDown={() => setShowOverlay(false)}
              />
            )}
          </div>
          <p className="text-xs text-muted-foreground text-center">Click on the overlay to dismiss</p>
        </Card>
      </div>

      {showOverlay && fullScreen && (
        <LoadingOverlay 
          variant={variant} 
          spinnerType={overlayType}
          fullScreen={true}
          onMouseDown={() => setShowOverlay(false)}
        />
      )}
    </div>
  );
}
