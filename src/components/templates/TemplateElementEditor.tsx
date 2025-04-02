
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { TemplateElement } from "@/types";
import { Trash2 } from "lucide-react";

interface TemplateElementEditorProps {
  element: TemplateElement;
  onUpdate: (updatedElement: TemplateElement) => void;
  onDelete?: () => void;
}

const TemplateElementEditor: React.FC<TemplateElementEditorProps> = ({ 
  element, 
  onUpdate,
  onDelete
}) => {
  const [isResizing, setIsResizing] = useState(false);

  // Handle resize start/end
  const handleResizeStart = () => setIsResizing(true);
  const handleResizeEnd = () => setIsResizing(false);

  const updateElementContent = (content: string) => {
    onUpdate({
      ...element,
      content
    });
  };

  const updateElementImage = (src: string) => {
    onUpdate({
      ...element,
      src
    });
  };

  const updateElementLink = (link: string) => {
    onUpdate({
      ...element,
      link
    });
  };
  
  const updateElementSize = (width?: number, height?: number) => {
    onUpdate({
      ...element,
      width: width !== undefined ? width : element.width,
      height: height !== undefined ? height : element.height
    });
  };

  // Handle specific element types
  const renderElementEditor = () => {
    switch (element.type) {
      case "text":
        return (
          <div className="w-full">
            <Textarea 
              value={element.content || ""}
              onChange={(e) => updateElementContent(e.target.value)}
              placeholder="Enter text here..."
              className={`min-h-[100px] w-full transition-all ${isResizing ? 'pointer-events-none' : ''}`}
            />
          </div>
        );
        
      case "image":
        return (
          <div className="flex flex-col items-center gap-4 w-full">
            <div 
              className="relative border rounded overflow-hidden"
              style={{ 
                width: element.width || 600,
                maxWidth: '100%'
              }}
            >
              <img 
                src={element.src} 
                alt="Template" 
                className="max-w-full h-auto"
                style={{ 
                  width: '100%',
                  height: element.height ? `${element.height}px` : 'auto'
                }}
              />
              
              <div className="flex gap-2 mt-2">
                <div className="flex gap-1 items-center">
                  <span className="text-xs">W:</span>
                  <Input 
                    type="number" 
                    value={element.width || 600}
                    onChange={(e) => updateElementSize(Number(e.target.value), element.height)}
                    className="w-20 h-8 text-xs"
                  />
                </div>
                <div className="flex gap-1 items-center">
                  <span className="text-xs">H:</span>
                  <Input 
                    type="number" 
                    value={element.height || 'auto'}
                    onChange={(e) => updateElementSize(element.width, Number(e.target.value))}
                    className="w-20 h-8 text-xs"
                  />
                </div>
              </div>
            </div>
            
            <Input 
              value={element.src || ""}
              onChange={(e) => updateElementImage(e.target.value)}
              placeholder="Image URL"
              className="max-w-sm"
            />
          </div>
        );
        
      case "button":
        return (
          <div className="flex flex-col items-center gap-4 w-full">
            <Button className="pointer-events-none">
              {element.content || "Click Here"}
            </Button>
            
            <div className="flex gap-2 w-full max-w-md">
              <Input 
                value={element.content || ""}
                onChange={(e) => updateElementContent(e.target.value)}
                placeholder="Button Text"
              />
              <Input 
                value={element.link || ""}
                onChange={(e) => updateElementLink(e.target.value)}
                placeholder="Link URL"
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <ResizablePanelGroup 
      direction={element.type === "image" ? "vertical" : "horizontal"}
      onLayout={handleResizeEnd}
      className="border border-dashed rounded-lg hover:border-primary transition-all"
    >
      <ResizablePanel defaultSize={100}>
        <div className="p-3 relative">
          {onDelete && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 h-8 w-8 opacity-50 hover:opacity-100"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          {renderElementEditor()}
        </div>
      </ResizablePanel>
      
      {element.type === "image" && (
        <>
          <ResizableHandle withHandle onDrag={handleResizeStart} />
          <ResizablePanel defaultSize={20}>
            <div className="p-3 text-center text-xs text-muted-foreground">
              Resize image height by dragging this handle
            </div>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
};

export default TemplateElementEditor;
