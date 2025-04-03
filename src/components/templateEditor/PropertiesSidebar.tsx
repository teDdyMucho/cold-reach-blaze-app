import { useState } from "react";
import { 
  PanelRight,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Link,
  Crop,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { EmailComponent } from "@/types/email";
import AIImageDialog from "./AIImageDialog";

interface PropertiesSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  selectedComponent: EmailComponent | null;
  onComponentUpdate: (updatedComponent: EmailComponent) => void;
}

const PropertiesSidebar = ({ 
  collapsed, 
  onToggle, 
  selectedComponent,
  onComponentUpdate 
}: PropertiesSidebarProps) => {
  const [activeTab, setActiveTab] = useState("style");

  const handleStyleChange = (property: string, value: string | number) => {
    if (!selectedComponent) return;
    
    const updatedComponent = { 
      ...selectedComponent,
      styles: {
        ...selectedComponent.styles,
        [property]: value
      }
    };
    
    onComponentUpdate(updatedComponent);
  };

  const handleContentChange = (value: string) => {
    if (!selectedComponent) return;
    
    const updatedComponent = { 
      ...selectedComponent,
      content: value
    };
    
    onComponentUpdate(updatedComponent);
  };

  const handleImageGenerated = (imageUrl: string) => {
    if (!selectedComponent) return;

    if (selectedComponent.type === 'image' || selectedComponent.type === 'text-image') {
      const updatedComponent = {
        ...selectedComponent,
        src: imageUrl
      };
      onComponentUpdate(updatedComponent);
    } else {
      handleStyleChange('backgroundImage', `url('${imageUrl}')`);
    }
  };

  const renderBackgroundControls = () => {
    if (!selectedComponent) return null;

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Background Color</Label>
          <div className="flex space-x-2">
            <Input 
              type="color" 
              value={selectedComponent.styles.backgroundColor || "#FFFFFF"}
              onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
              className="w-10 h-10 p-1"
            />
            <Input 
              value={selectedComponent.styles.backgroundColor || "#FFFFFF"}
              onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Background Image URL</Label>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input 
                type="text"
                placeholder="https://example.com/image.jpg"
                value={selectedComponent.styles.backgroundImage?.replace(/^url\(['"](.+)['"]\)$/, '$1') || ''}
                onChange={(e) => {
                  const url = e.target.value.trim();
                  handleStyleChange('backgroundImage', url ? `url('${url}')` : '');
                }}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleStyleChange('backgroundImage', '')}
              >
                <Crop className="h-4 w-4" />
              </Button>
            </div>
            <AIImageDialog 
              onImageGenerated={handleImageGenerated} 
              componentType="text-image"
            />
          </div>
        </div>

        {selectedComponent.styles.backgroundImage && (
          <>
            <div className="space-y-2">
              <Label>Background Size</Label>
              <div className="flex space-x-1">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleStyleChange('backgroundSize', 'cover')}
                  className={cn(selectedComponent.styles.backgroundSize === 'cover' && "bg-muted")}
                >
                  Cover
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handleStyleChange('backgroundSize', 'contain')}
                  className={cn(selectedComponent.styles.backgroundSize === 'contain' && "bg-muted")}
                >
                  Contain
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handleStyleChange('backgroundSize', 'auto')}
                  className={cn(selectedComponent.styles.backgroundSize === 'auto' && "bg-muted")}
                >
                  Auto
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Background Repeat</Label>
              <div className="flex space-x-1">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handleStyleChange('backgroundRepeat', 'repeat')}
                  className={cn(selectedComponent.styles.backgroundRepeat === 'repeat' && "bg-muted")}
                >
                  Repeat
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handleStyleChange('backgroundRepeat', 'no-repeat')}
                  className={cn(selectedComponent.styles.backgroundRepeat === 'no-repeat' && "bg-muted")}
                >
                  No Repeat
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Background Position</Label>
              <div className="grid grid-cols-3 gap-1">
                {['left top', 'center top', 'right top',
                  'left center', 'center center', 'right center',
                  'left bottom', 'center bottom', 'right bottom'].map((position) => (
                  <Button 
                    key={position}
                    variant="outline"
                    size="sm"
                    onClick={() => handleStyleChange('backgroundPosition', position)}
                    className={cn(selectedComponent.styles.backgroundPosition === position && "bg-muted")}
                  >
                    {position.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Background Opacity: {selectedComponent.styles.backgroundOpacity || 1}</Label>
              <Slider 
                value={[parseFloat(String(selectedComponent.styles.backgroundOpacity || 1)) * 100]}
                min={0}
                max={100}
                step={1}
                onValueChange={([value]) => {
                  handleStyleChange('backgroundOpacity', value / 100);
                  // Update the background color with opacity
                  if (selectedComponent.styles.backgroundColor) {
                    const color = selectedComponent.styles.backgroundColor;
                    const opacity = value / 100;
                    // Convert hex to rgba
                    const r = parseInt(color.slice(1, 3), 16);
                    const g = parseInt(color.slice(3, 5), 16);
                    const b = parseInt(color.slice(5, 7), 16);
                    handleStyleChange('backgroundColor', `rgba(${r}, ${g}, ${b}, ${opacity})`);
                  }
                }}
              />
            </div>
          </>
        )}
      </div>
    );
  };

  const renderStyleOptions = () => {
    if (!selectedComponent) return null;

    switch (selectedComponent.type) {
      case 'text':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Text Formatting</Label>
              <div className="flex space-x-1">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleStyleChange('fontWeight', selectedComponent.styles.fontWeight === 'bold' ? 'normal' : 'bold')}
                  className={cn(selectedComponent.styles.fontWeight === 'bold' && "bg-muted")}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleStyleChange('fontStyle', selectedComponent.styles.fontStyle === 'italic' ? 'normal' : 'italic')}
                  className={cn(selectedComponent.styles.fontStyle === 'italic' && "bg-muted")}
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleStyleChange('textDecoration', selectedComponent.styles.textDecoration === 'underline' ? 'none' : 'underline')}
                  className={cn(selectedComponent.styles.textDecoration === 'underline' && "bg-muted")}
                >
                  <Underline className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Alignment</Label>
              <div className="flex space-x-1">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleStyleChange('textAlign', 'left')}
                  className={cn(selectedComponent.styles.textAlign === 'left' && "bg-muted")}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleStyleChange('textAlign', 'center')}
                  className={cn(selectedComponent.styles.textAlign === 'center' && "bg-muted")}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleStyleChange('textAlign', 'right')}
                  className={cn(selectedComponent.styles.textAlign === 'right' && "bg-muted")}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Font Size: {selectedComponent.styles.fontSize || 16}px</Label>
              <Slider 
                value={[parseInt(String(selectedComponent.styles.fontSize || 16))]}
                min={8}
                max={72}
                step={1}
                onValueChange={([value]) => handleStyleChange('fontSize', `${value}px`)}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex space-x-2">
                <Input 
                  type="color" 
                  value={selectedComponent.styles.color || "#000000"}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="w-10 h-10 p-1"
                />
                <Input 
                  value={selectedComponent.styles.color || "#000000"}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            {renderBackgroundControls()}
          </div>
        );
        
      case 'button':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Button URL</Label>
              <div className="flex space-x-2">
                <Link className="h-4 w-4 mt-3" />
                <Input 
                  value={selectedComponent.url || ""}
                  onChange={(e) => {
                    const updatedComponent = {
                      ...selectedComponent,
                      url: e.target.value
                    };
                    onComponentUpdate(updatedComponent);
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex space-x-2">
                <Input 
                  type="color" 
                  value={selectedComponent.styles.backgroundColor || "#3B82F6"}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="w-10 h-10 p-1"
                />
                <Input 
                  value={selectedComponent.styles.backgroundColor || "#3B82F6"}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Text Color</Label>
              <div className="flex space-x-2">
                <Input 
                  type="color" 
                  value={selectedComponent.styles.color || "#FFFFFF"}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="w-10 h-10 p-1"
                />
                <Input 
                  value={selectedComponent.styles.color || "#FFFFFF"}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Padding</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Vertical: {selectedComponent.styles.paddingY || 10}px</Label>
                  <Slider 
                    value={[parseInt(String(selectedComponent.styles.paddingY || 10))]}
                    min={0}
                    max={40}
                    step={1}
                    onValueChange={([value]) => handleStyleChange('paddingY', value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Horizontal: {selectedComponent.styles.paddingX || 20}px</Label>
                  <Slider 
                    value={[parseInt(String(selectedComponent.styles.paddingX || 20))]}
                    min={0}
                    max={60}
                    step={1}
                    onValueChange={([value]) => handleStyleChange('paddingX', value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Border Radius: {selectedComponent.styles.borderRadius || 4}px</Label>
              <Slider 
                value={[parseInt(String(selectedComponent.styles.borderRadius || 4))]}
                min={0}
                max={30}
                step={1}
                onValueChange={([value]) => handleStyleChange('borderRadius', value)}
              />
            </div>

            {renderBackgroundControls()}
          </div>
        );

      case 'image':
      case 'text-image':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Image URL</Label>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input 
                    value={selectedComponent.src || ""}
                    onChange={(e) => {
                      const updatedComponent = {
                        ...selectedComponent,
                        src: e.target.value
                      };
                      onComponentUpdate(updatedComponent);
                    }}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      const updatedComponent = {
                        ...selectedComponent,
                        src: ""
                      };
                      onComponentUpdate(updatedComponent);
                    }}
                  >
                    <Crop className="h-4 w-4" />
                  </Button>
                </div>
                <AIImageDialog 
                  onImageGenerated={handleImageGenerated} 
                  componentType={selectedComponent.type}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Alt Text</Label>
              <Input 
                value={selectedComponent.alt || ""}
                onChange={(e) => {
                  const updatedComponent = {
                    ...selectedComponent,
                    alt: e.target.value
                  };
                  onComponentUpdate(updatedComponent);
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Width: {selectedComponent.styles.width || "100%"}</Label>
              <Input 
                value={selectedComponent.styles.width || "100%"}
                onChange={(e) => handleStyleChange('width', e.target.value)}
              />
            </div>

            {selectedComponent.type === 'text-image' && (
              <>
                <div className="space-y-2">
                  <Label>Image Position</Label>
                  <div className="flex space-x-1">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const updatedComponent = {
                          ...selectedComponent,
                          imagePosition: 'left'
                        };
                        onComponentUpdate(updatedComponent);
                      }}
                      className={cn(selectedComponent.imagePosition === 'left' && "bg-muted")}
                    >
                      Left
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const updatedComponent = {
                          ...selectedComponent,
                          imagePosition: 'right'
                        };
                        onComponentUpdate(updatedComponent);
                      }}
                      className={cn(selectedComponent.imagePosition === 'right' && "bg-muted")}
                    >
                      Right
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Image Width: {selectedComponent.imageWidth}</Label>
                  <Input 
                    value={selectedComponent.imageWidth || "50%"}
                    onChange={(e) => {
                      const updatedComponent = {
                        ...selectedComponent,
                        imageWidth: e.target.value
                      };
                      onComponentUpdate(updatedComponent);
                    }}
                  />
                </div>
              </>
            )}

            {renderBackgroundControls()}
          </div>
        );

      case 'container':
      case 'columns':
        return (
          <div className="space-y-4">
            {renderBackgroundControls()}
            
            <div className="space-y-2">
              <Label>Padding</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Vertical: {selectedComponent.styles.paddingY || 20}px</Label>
                  <Slider 
                    value={[parseInt(String(selectedComponent.styles.paddingY || 20))]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([value]) => handleStyleChange('paddingY', value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Horizontal: {selectedComponent.styles.paddingX || 20}px</Label>
                  <Slider 
                    value={[parseInt(String(selectedComponent.styles.paddingX || 20))]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([value]) => handleStyleChange('paddingX', value)}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'divider':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex space-x-2">
                <Input 
                  type="color" 
                  value={selectedComponent.styles.borderColor || "#EEEEEE"}
                  onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                  className="w-10 h-10 p-1"
                />
                <Input 
                  value={selectedComponent.styles.borderColor || "#EEEEEE"}
                  onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Thickness: {selectedComponent.styles.borderWidth || 1}px</Label>
              <Slider 
                value={[parseInt(String(selectedComponent.styles.borderWidth || 1))]}
                min={1}
                max={10}
                step={1}
                onValueChange={([value]) => handleStyleChange('borderWidth', value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Style</Label>
              <div className="flex space-x-1">
                <Button 
                  variant="outline" 
                  onClick={() => handleStyleChange('borderStyle', 'solid')}
                  className={cn(selectedComponent.styles.borderStyle === 'solid' && "bg-muted")}
                >
                  Solid
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleStyleChange('borderStyle', 'dashed')}
                  className={cn(selectedComponent.styles.borderStyle === 'dashed' && "bg-muted")}
                >
                  Dashed
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleStyleChange('borderStyle', 'dotted')}
                  className={cn(selectedComponent.styles.borderStyle === 'dotted' && "bg-muted")}
                >
                  Dotted
                </Button>
              </div>
            </div>

            {renderBackgroundControls()}
          </div>
        );
        
      case 'spacer':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Height: {selectedComponent.styles.height || 20}px</Label>
              <Slider 
                value={[parseInt(String(selectedComponent.styles.height || 20))]}
                min={5}
                max={100}
                step={1}
                onValueChange={([value]) => handleStyleChange('height', value)}
              />
            </div>

            {renderBackgroundControls()}
          </div>
        );
        
      default:
        return null;
    }
  };

  const renderContentOptions = () => {
    if (!selectedComponent) return null;

    switch (selectedComponent.type) {
      case 'text':
      case 'button':
      case 'text-image':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Text Content</Label>
              <Input 
                value={selectedComponent.content || ""}
                onChange={(e) => handleContentChange(e.target.value)}
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="p-4">
            <p className="text-sm text-muted-foreground">No content options available for this component.</p>
          </div>
        );
    }
  };

  return (
    <div className={cn(
      "border-l bg-background flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-80"
    )}>
      <div className="p-3 flex justify-between items-center">
        {!collapsed && <h2 className="font-semibold">Properties</h2>}
        <Button variant="ghost" size="icon" onClick={onToggle}>
          <PanelRight className="h-5 w-5" />
        </Button>
      </div>
      <Separator />
      
      {!selectedComponent ? (
        <div className="flex-1 flex items-center justify-center p-4 text-center text-muted-foreground">
          {!collapsed && "Select a component to edit its properties"}
        </div>
      ) : (
        collapsed ? (
          <div className="flex-1 flex flex-col items-center pt-4 space-y-4">
            <Button 
              variant={activeTab === "style" ? "default" : "ghost"} 
              size="icon"
              onClick={() => setActiveTab("style")}
            >
              <Palette className="h-5 w-5" />
            </Button>
            <Button 
              variant={activeTab === "content" ? "default" : "ghost"} 
              size="icon"
              onClick={() => setActiveTab("content")}
            >
              <Bold className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="px-4 pt-4">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="style">Style</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
              </TabsList>
            </div>
            <div className="flex-1 overflow-auto">
              <TabsContent value="style" className="p-4 m-0 h-full">
                {renderStyleOptions()}
              </TabsContent>
              <TabsContent value="content" className="p-4 m-0 h-full">
                {renderContentOptions()}
              </TabsContent>
            </div>
          </Tabs>
        )
      )}
    </div>
  );
};

export default PropertiesSidebar;