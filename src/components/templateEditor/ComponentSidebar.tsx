import { 
  PanelLeft, 
  Type, 
  Image as ImageIcon, 
  Columns, 
  Divide, 
  Grid3x3,
  LayoutPanelLeft
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ComponentSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onDragStart: (type: string, content?: string) => void;
}

const ComponentSidebar = ({ 
  collapsed, 
  onToggle, 
  onDragStart 
}: ComponentSidebarProps) => {
  const handleDragStart = (e: React.DragEvent, type: string, content?: string) => {
    e.dataTransfer.setData('componentType', type);
    if (content) {
      e.dataTransfer.setData('componentContent', content);
    }
    onDragStart(type, content);
  };

  return (
    <div className={cn(
      "border-r bg-background flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-72"
    )}>
      <div className="p-3 flex justify-between items-center">
        {!collapsed && <h2 className="font-semibold">Components</h2>}
        <Button variant="ghost" size="icon" onClick={onToggle}>
          <PanelLeft className="h-5 w-5" />
        </Button>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Text Components */}
          <div>
            {!collapsed && <h3 className="text-sm font-medium mb-3">Text</h3>}
            <div className={cn(
              "grid gap-2",
              collapsed ? "grid-cols-1" : "grid-cols-2"
            )}>
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, 'text', 'Heading')}
                className="border rounded-md p-3 flex flex-col items-center justify-center cursor-move hover:bg-muted transition-colors"
              >
                <Type className="h-5 w-5 mb-1" />
                {!collapsed && <span className="text-xs">Heading</span>}
              </div>
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, 'text', 'Paragraph')}
                className="border rounded-md p-3 flex flex-col items-center justify-center cursor-move hover:bg-muted transition-colors"
              >
                <Type className="h-5 w-5 mb-1" />
                {!collapsed && <span className="text-xs">Paragraph</span>}
              </div>
            </div>
          </div>

          {/* Structural Components */}
          <div>
            {!collapsed && <h3 className="text-sm font-medium mb-3">Structure</h3>}
            <div className={cn(
              "grid gap-2",
              collapsed ? "grid-cols-1" : "grid-cols-2"
            )}>
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, 'container')}
                className="border rounded-md p-3 flex flex-col items-center justify-center cursor-move hover:bg-muted transition-colors"
              >
                <Grid3x3 className="h-5 w-5 mb-1" />
                {!collapsed && <span className="text-xs">Container</span>}
              </div>
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, 'columns')}
                className="border rounded-md p-3 flex flex-col items-center justify-center cursor-move hover:bg-muted transition-colors"
              >
                <Columns className="h-5 w-5 mb-1" />
                {!collapsed && <span className="text-xs">Columns</span>}
              </div>
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, 'divider')}
                className="border rounded-md p-3 flex flex-col items-center justify-center cursor-move hover:bg-muted transition-colors"
              >
                <Divide className="h-5 w-5 mb-1" />
                {!collapsed && <span className="text-xs">Divider</span>}
              </div>
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, 'spacer')}
                className="border rounded-md p-3 flex flex-col items-center justify-center cursor-move hover:bg-muted transition-colors"
              >
                <div className="h-5 w-5 mb-1 border-t-2 border-b-2 flex items-center justify-center">
                  <div className="h-1 w-3 bg-foreground"></div>
                </div>
                {!collapsed && <span className="text-xs">Spacer</span>}
              </div>
            </div>
          </div>

          {/* Content Components */}
          <div>
            {!collapsed && <h3 className="text-sm font-medium mb-3">Content</h3>}
            <div className={cn(
              "grid gap-2",
              collapsed ? "grid-cols-1" : "grid-cols-2"
            )}>
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, 'button', 'Click me')}
                className="border rounded-md p-3 flex flex-col items-center justify-center cursor-move hover:bg-muted transition-colors"
              >
                <Type className="h-5 w-5 mb-1" />
                {!collapsed && <span className="text-xs">Button</span>}
              </div>
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, 'image')}
                className="border rounded-md p-3 flex flex-col items-center justify-center cursor-move hover:bg-muted transition-colors"
              >
                <ImageIcon className="h-5 w-5 mb-1" />
                {!collapsed && <span className="text-xs">Image</span>}
              </div>
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, 'text-image', 'Sample text with image')}
                className="border rounded-md p-3 flex flex-col items-center justify-center cursor-move hover:bg-muted transition-colors"
              >
                <LayoutPanelLeft className="h-5 w-5 mb-1" />
                {!collapsed && <span className="text-xs">Text + Image</span>}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ComponentSidebar;