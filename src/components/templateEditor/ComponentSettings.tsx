import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmailComponent } from "@/types";
import { ColorPicker } from "@/components/ui/color-picker";

interface ComponentSettingsProps {
  collapsed: boolean;
  onToggle: () => void;
  selectedComponent: EmailComponent | null;
  onUpdate: (component: EmailComponent) => void;
}

const ComponentSettings: React.FC<ComponentSettingsProps> = ({
  collapsed,
  onToggle,
  selectedComponent,
  onUpdate,
}) => {
  if (!selectedComponent) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Select a component to edit its properties
      </div>
    );
  }

  const handleStyleChange = (property: string, value: string | number) => {
    if (!selectedComponent) return;

    const updatedComponent = {
      ...selectedComponent,
      styles: {
        ...selectedComponent.styles,
        [property]: value,
      },
    };

    onUpdate(updatedComponent);
  };

  const handleContentChange = (content: string) => {
    if (!selectedComponent) return;

    const updatedComponent = {
      ...selectedComponent,
      content,
    };

    onUpdate(updatedComponent);
  };

  const handleUrlChange = (url: string) => {
    if (!selectedComponent) return;

    const updatedComponent = {
      ...selectedComponent,
      url,
    };

    onUpdate(updatedComponent);
  };

  const handleSrcChange = (src: string) => {
    if (!selectedComponent) return;

    const updatedComponent = {
      ...selectedComponent,
      src,
    };

    onUpdate(updatedComponent);
  };

  const handleAltChange = (alt: string) => {
    if (!selectedComponent) return;

    const updatedComponent = {
      ...selectedComponent,
      alt,
    };

    onUpdate(updatedComponent);
  };

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {selectedComponent.type.charAt(0).toUpperCase() + selectedComponent.type.slice(1)} Settings
        </h3>
        <Button variant="ghost" size="icon" onClick={onToggle}>
          {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      <Tabs defaultValue="content">
        <TabsList className="w-full">
          <TabsTrigger value="content" className="flex-1">
            Content
          </TabsTrigger>
          <TabsTrigger value="style" className="flex-1">
            Style
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4 mt-4">
          {/* Text Component Content */}
          {selectedComponent.type === "text" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="content">Text Content</Label>
                <Textarea
                  id="content"
                  value={selectedComponent.content || ""}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}

          {/* Button Component Content */}
          {selectedComponent.type === "button" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="button-text">Button Text</Label>
                <Input
                  id="button-text"
                  value={selectedComponent.content || ""}
                  onChange={(e) => handleContentChange(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="button-url">Button URL</Label>
                <Input
                  id="button-url"
                  value={selectedComponent.url || ""}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          )}

          {/* Image Component Content */}
          {selectedComponent.type === "image" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-src">Image URL</Label>
                <Input
                  id="image-src"
                  value={selectedComponent.src || ""}
                  onChange={(e) => handleSrcChange(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <Label htmlFor="image-alt">Alt Text</Label>
                <Input
                  id="image-alt"
                  value={selectedComponent.alt || ""}
                  onChange={(e) => handleAltChange(e.target.value)}
                  placeholder="Image description"
                />
              </div>
            </div>
          )}

          {/* Spacer Component Content */}
          {selectedComponent.type === "spacer" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="spacer-height">Height (px)</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    id="spacer-height"
                    min={1}
                    max={100}
                    step={1}
                    value={[parseInt(selectedComponent.styles?.height as string) || 20]}
                    onValueChange={(value) => handleStyleChange("height", `${value[0]}px`)}
                  />
                  <span className="w-12 text-center">{parseInt(selectedComponent.styles?.height as string) || 20}px</span>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="style" className="space-y-4 mt-4">
          {/* Common Styles */}
          <div className="space-y-4">
            {/* Background Color */}
            <div>
              <Label>Background Color</Label>
              <ColorPicker
                color={selectedComponent.styles?.backgroundColor || "#ffffff"}
                onChange={(color) => handleStyleChange("backgroundColor", color)}
              />
            </div>

            {/* Text Color (for text and button components) */}
            {(selectedComponent.type === "text" || selectedComponent.type === "button") && (
              <div>
                <Label>Text Color</Label>
                <ColorPicker
                  color={selectedComponent.styles?.color || "#000000"}
                  onChange={(color) => handleStyleChange("color", color)}
                />
              </div>
            )}

            {/* Padding */}
            <div>
              <Label>Padding (px)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="padding-x" className="text-xs">Horizontal</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="padding-x"
                      min={0}
                      max={50}
                      step={1}
                      value={[selectedComponent.styles?.paddingX as number || 0]}
                      onValueChange={(value) => handleStyleChange("paddingX", value[0])}
                    />
                    <span className="w-8 text-center">{selectedComponent.styles?.paddingX || 0}</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="padding-y" className="text-xs">Vertical</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="padding-y"
                      min={0}
                      max={50}
                      step={1}
                      value={[selectedComponent.styles?.paddingY as number || 0]}
                      onValueChange={(value) => handleStyleChange("paddingY", value[0])}
                    />
                    <span className="w-8 text-center">{selectedComponent.styles?.paddingY || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Border Radius (for buttons and images) */}
            {(selectedComponent.type === "button" || selectedComponent.type === "image") && (
              <div>
                <Label htmlFor="border-radius">Border Radius (px)</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    id="border-radius"
                    min={0}
                    max={50}
                    step={1}
                    value={[parseInt(selectedComponent.styles?.borderRadius as string) || 0]}
                    onValueChange={(value) => handleStyleChange("borderRadius", `${value[0]}px`)}
                  />
                  <span className="w-12 text-center">{parseInt(selectedComponent.styles?.borderRadius as string) || 0}px</span>
                </div>
              </div>
            )}

            {/* Font Size (for text and button components) */}
            {(selectedComponent.type === "text" || selectedComponent.type === "button") && (
              <div>
                <Label htmlFor="font-size">Font Size (px)</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    id="font-size"
                    min={8}
                    max={72}
                    step={1}
                    value={[parseInt(selectedComponent.styles?.fontSize as string) || 16]}
                    onValueChange={(value) => handleStyleChange("fontSize", `${value[0]}px`)}
                  />
                  <span className="w-12 text-center">{parseInt(selectedComponent.styles?.fontSize as string) || 16}px</span>
                </div>
              </div>
            )}

            {/* Font Weight (for text and button components) */}
            {(selectedComponent.type === "text" || selectedComponent.type === "button") && (
              <div>
                <Label htmlFor="font-weight">Font Weight</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {["normal", "500", "bold"].map((weight) => (
                    <Button
                      key={weight}
                      type="button"
                      variant={selectedComponent.styles?.fontWeight === weight ? "default" : "outline"}
                      className="text-xs h-8"
                      onClick={() => handleStyleChange("fontWeight", weight)}
                    >
                      {weight === "normal" ? "Normal" : weight === "500" ? "Medium" : "Bold"}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComponentSettings;
