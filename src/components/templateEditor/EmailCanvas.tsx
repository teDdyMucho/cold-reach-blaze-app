import { useState } from "react";
import { cn } from "@/lib/utils";
import { EmailComponent } from "@/types";
import EmailComponentRenderer from "./EmailComponentRenderer";
import { Button } from "@/components/ui/button";
import { Settings2, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EmailStyles {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundRepeat?: string;
  backgroundPosition?: string;
}

interface EmailCanvasProps {
  components: EmailComponent[];
  viewMode: 'desktop' | 'mobile';
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponents: (components: EmailComponent[]) => void;
  emailStyles: EmailStyles;
  onEmailStylesChange: (styles: EmailStyles) => void;
}

const EmailCanvas = ({ 
  components, 
  viewMode, 
  selectedComponentId,
  onSelectComponent,
  onUpdateComponents,
  emailStyles,
  onEmailStylesChange
}: EmailCanvasProps) => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [componentToDelete, setComponentToDelete] = useState<string | null>(null);
  const [containerDragTarget, setContainerDragTarget] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set dragOverIndex if we're dragging a component (not from sidebar)
    const componentId = e.dataTransfer.getData('componentId');
    if (componentId) {
      setDragOverIndex(index);
      
      // Add visual indicator for drop position
      const dropIndicators = document.querySelectorAll('.drop-indicator');
      dropIndicators.forEach(indicator => {
        (indicator as HTMLElement).style.display = 'none';
      });
      
      const currentIndicator = document.querySelector(`[data-drop-index="${index}"]`);
      if (currentIndicator) {
        (currentIndicator as HTMLElement).style.display = 'block';
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);
    
    // Hide all drop indicators
    const dropIndicators = document.querySelectorAll('.drop-indicator');
    dropIndicators.forEach(indicator => {
      (indicator as HTMLElement).style.display = 'none';
    });
    
    const componentType = e.dataTransfer.getData('componentType');
    const componentContent = e.dataTransfer.getData('componentContent') || '';
    
    // If it's a new component being added from the sidebar
    if (componentType && !e.dataTransfer.getData('componentId')) {
      const newComponent = createNewComponent(componentType, componentContent);
      const updatedComponents = [...components];
      updatedComponents.splice(dropIndex, 0, newComponent);
      onUpdateComponents(updatedComponents);
      onSelectComponent(newComponent.id);
      return;
    }
    
    // If it's an existing component being reordered
    const draggedComponentId = e.dataTransfer.getData('componentId');
    if (draggedComponentId) {
      const dragIndex = components.findIndex(comp => comp.id === draggedComponentId);
      if (dragIndex === -1) return;
      
      const updatedComponents = [...components];
      const [removed] = updatedComponents.splice(dragIndex, 1);
      
      // Adjust dropIndex if needed (when moving a component down)
      const adjustedDropIndex = dragIndex < dropIndex ? dropIndex - 1 : dropIndex;
      updatedComponents.splice(adjustedDropIndex, 0, removed);
      
      onUpdateComponents(updatedComponents);
    }
  };

  const handleComponentDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('componentId', id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Add a visual indicator for the dragged item
    const element = e.currentTarget as HTMLElement;
    setTimeout(() => {
      if (element) element.classList.add('opacity-50');
    }, 0);
  };
  
  const handleComponentDragEnd = (e: React.DragEvent) => {
    // Remove the visual indicator
    const element = e.currentTarget as HTMLElement;
    element.classList.remove('opacity-50');
  };

  const createNewComponent = (type: string, content: string = ''): EmailComponent => {
    const baseComponent = {
      id: `component-${Date.now()}`,
      type: type as EmailComponent['type'],
      content: content || getDefaultContent(type),
      styles: getDefaultStyles(type),
    };
    
    switch (type) {
      case 'button':
        return {
          ...baseComponent,
          url: "#",
          styles: {
            ...baseComponent.styles,
            backgroundColor: '#3B82F6',
            color: '#FFFFFF',
            paddingY: 10,
            paddingX: 20,
            borderRadius: 4,
            textAlign: 'center',
            cursor: 'pointer',
            fontWeight: 'bold',
          }
        };
      case 'image':
        return {
          ...baseComponent,
          src: "https://placehold.co/600x200",
          alt: "Placeholder image",
          styles: {
            ...baseComponent.styles,
            width: '100%',
          }
        };
      case 'columns':
        return {
          ...baseComponent,
          columns: [
            {
              id: `column-${Date.now()}-1`,
              components: [],
              styles: { width: '50%', padding: '10px' }
            },
            {
              id: `column-${Date.now()}-2`,
              components: [],
              styles: { width: '50%', padding: '10px' }
            }
          ],
          styles: {
            ...baseComponent.styles,
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
          }
        };
      case 'text-image':
        return {
          ...baseComponent,
          src: "https://placehold.co/600x400",
          alt: "Placeholder image",
          imagePosition: 'right',
          imageWidth: '50%',
          styles: {
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          },
          textStyles: {
            fontSize: '16px',
            color: '#333333',
            textAlign: 'left',
          },
          imageStyles: {
            width: '50%',
          }
        };
      default:
        return baseComponent;
    }
  };

  const getDefaultContent = (type: string): string => {
    switch (type) {
      case 'text':
        return 'Add your text here';
      case 'button':
        return 'Click me';
      case 'text-image':
        return 'Add your text here';
      default:
        return '';
    }
  };

  const getDefaultStyles = (type: string): Record<string, any> => {
    const baseStyles = {
      padding: '10px',
    };
    
    switch (type) {
      case 'text':
        return {
          ...baseStyles,
          fontSize: '16px',
          color: '#333333',
          lineHeight: '1.5',
        };
      case 'container':
        return {
          ...baseStyles,
          backgroundColor: '#FFFFFF',
          width: '100%',
          paddingY: 20,
          paddingX: 20,
        };
      case 'divider':
        return {
          borderTop: '1px solid #EEEEEE',
          margin: '20px 0',
          borderColor: '#EEEEEE',
          borderWidth: 1,
          borderStyle: 'solid',
        };
      case 'spacer':
        return {
          height: 20,
        };
      default:
        return baseStyles;
    }
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    const componentType = e.dataTransfer.getData('componentType');
    const componentContent = e.dataTransfer.getData('componentContent') || '';
    
    if (componentType && !e.dataTransfer.getData('componentId')) {
      const newComponent = createNewComponent(componentType, componentContent);
      onUpdateComponents([...components, newComponent]);
      onSelectComponent(newComponent.id);
    }
  };

  const handleComponentClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onSelectComponent(id);
  };

  const handleCanvasClick = () => {
    onSelectComponent(null);
  };

  const handleDeleteComponent = (id: string) => {
    const updatedComponents = components.filter(component => component.id !== id);
    onUpdateComponents(updatedComponents);
    onSelectComponent(null);
    setComponentToDelete(null);
  };

  const handleStyleChange = (property: keyof EmailStyles, value: string) => {
    onEmailStylesChange({
      ...emailStyles,
      [property]: value
    });
  };

  const handleContainerDragOver = (e: React.DragEvent, containerId: string) => {
    e.preventDefault();
    setContainerDragTarget(containerId);
  };

  const handleContainerDrop = (e: React.DragEvent, containerId: string) => {
    e.preventDefault();
    setContainerDragTarget(null);
    
    const componentType = e.dataTransfer.getData('componentType');
    const componentContent = e.dataTransfer.getData('componentContent') || '';
    const draggedComponentId = e.dataTransfer.getData('componentId');
    
    // Find the container component
    const containerIndex = components.findIndex(comp => comp.id === containerId);
    if (containerIndex === -1) return;
    
    const containerComponent = components[containerIndex];
    
    // Handle drop based on container type
    if (containerComponent.type === 'container') {
      // For container, add the component as content
      const newComponent = draggedComponentId 
        ? components.find(c => c.id === draggedComponentId)
        : createNewComponent(componentType, componentContent);
        
      if (!newComponent) return;
      
      // If it's an existing component, remove it from its current position
      if (draggedComponentId) {
        const updatedComponents = components.filter(c => c.id !== draggedComponentId);
        onUpdateComponents(updatedComponents);
      }
      
      // Update the container's content with the new component
      const updatedContainer = {
        ...containerComponent,
        content: newComponent.content
      };
      
      const updatedComponents = [...components];
      updatedComponents[containerIndex] = updatedContainer;
      onUpdateComponents(updatedComponents);
      
    } else if (containerComponent.type === 'columns') {
      // For columns, add the component to the first column
      const newComponent = draggedComponentId 
        ? components.find(c => c.id === draggedComponentId)
        : createNewComponent(componentType, componentContent);
        
      if (!newComponent || !containerComponent.columns || containerComponent.columns.length === 0) return;
      
      // If it's an existing component, remove it from its current position
      if (draggedComponentId) {
        const updatedComponents = components.filter(c => c.id !== draggedComponentId);
        onUpdateComponents(updatedComponents);
      }
      
      // Add the component to the first column
      const updatedColumns = [...containerComponent.columns];
      updatedColumns[0] = {
        ...updatedColumns[0],
        components: [...(updatedColumns[0].components || []), newComponent]
      };
      
      const updatedContainer = {
        ...containerComponent,
        columns: updatedColumns
      };
      
      const updatedComponents = [...components];
      updatedComponents[containerIndex] = updatedContainer;
      onUpdateComponents(updatedComponents);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <div 
          className={cn(
            "mx-auto p-4 border rounded-lg shadow-sm",
            viewMode === 'desktop' ? 'max-w-[600px]' : 'max-w-[375px]'
          )}
          style={{
            backgroundColor: "#f5f5f5", // Light gray background for the canvas area
          }}
          onDragOver={handleCanvasDragOver}
          onDrop={(e) => handleDrop(e, components.length)}
        >
          <div
            className="w-full min-h-[400px] p-4"
            style={{
              backgroundColor: emailStyles.backgroundColor,
              backgroundImage: emailStyles.backgroundImage ? `url(${emailStyles.backgroundImage})` : 'none',
              backgroundSize: emailStyles.backgroundSize,
              backgroundRepeat: emailStyles.backgroundRepeat,
              backgroundPosition: emailStyles.backgroundPosition,
            }}
          >
            {components.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 p-8 text-center text-gray-500 rounded-lg bg-white">
                Drag and drop components here to build your email
              </div>
            ) : (
              <div className="relative bg-white p-4 rounded-sm">
                {components.map((component, index) => (
                  <div 
                    key={component.id}
                    className="relative"
                  >
                    {/* Drop indicator above component */}
                    <div 
                      data-drop-index={index}
                      className="drop-indicator hidden h-1 w-full bg-blue-500 my-1 rounded-full"
                    />
                    
                    <div 
                      className={cn(
                        "relative cursor-move",
                        selectedComponentId === component.id && "ring-2 ring-blue-500"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectComponent(component.id);
                      }}
                      draggable={true}
                      onDragStart={(e) => handleComponentDragStart(e, component.id)}
                      onDragEnd={handleComponentDragEnd}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <EmailComponentRenderer 
                        component={component} 
                        isSelected={selectedComponentId === component.id}
                        onDragStart={handleComponentDragStart}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (component.type === 'container' || component.type === 'columns') {
                            // Allow dropping inside containers and columns
                            handleContainerDragOver(e, component.id);
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (component.type === 'container' || component.type === 'columns') {
                            // Handle dropping inside containers and columns
                            handleContainerDrop(e, component.id);
                          }
                        }}
                      />
                      
                      {/* Drag handle */}
                      <div className="absolute top-0 left-0 bg-blue-500 text-white p-1 opacity-0 group-hover:opacity-100 cursor-move rounded-br">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </div>
                      
                      {selectedComponentId === component.id && (
                        <div className="absolute top-0 right-0 flex space-x-1 bg-white p-1 rounded shadow-sm">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsSettingsOpen(true);
                            }}
                          >
                            <Settings2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-500 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteComponent(component.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Final drop indicator */}
                <div 
                  data-drop-index={components.length}
                  className="drop-indicator hidden h-1 w-full bg-blue-500 my-1 rounded-full"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end w-full max-w-3xl mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings2 className="h-4 w-4 mr-2" />
              Email Settings
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Email Background Settings</SheetTitle>
              <SheetDescription>
                Customize the background of your email
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="flex space-x-2">
                  <Input 
                    type="color" 
                    value={emailStyles.backgroundColor || "#ffffff"}
                    onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                    className="w-10 h-10 p-1"
                  />
                  <Input 
                    value={emailStyles.backgroundColor || "#ffffff"}
                    onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Background Image URL</Label>
                <Input 
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={emailStyles.backgroundImage?.replace(/^url\(['"](.+)['"]\)$/, '$1') || ''}
                  onChange={(e) => {
                    const url = e.target.value.trim();
                    handleStyleChange('backgroundImage', url ? `url('${url}')` : '');
                  }}
                />
              </div>

              {emailStyles.backgroundImage && (
                <>
                  <div className="space-y-2">
                    <Label>Background Size</Label>
                    <div className="flex space-x-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleStyleChange('backgroundSize', 'cover')}
                        className={cn(emailStyles.backgroundSize === 'cover' && "bg-muted")}
                      >
                        Cover
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleStyleChange('backgroundSize', 'contain')}
                        className={cn(emailStyles.backgroundSize === 'contain' && "bg-muted")}
                      >
                        Contain
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleStyleChange('backgroundSize', 'auto')}
                        className={cn(emailStyles.backgroundSize === 'auto' && "bg-muted")}
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
                        className={cn(emailStyles.backgroundRepeat === 'repeat' && "bg-muted")}
                      >
                        Repeat
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleStyleChange('backgroundRepeat', 'no-repeat')}
                        className={cn(emailStyles.backgroundRepeat === 'no-repeat' && "bg-muted")}
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
                          className={cn(emailStyles.backgroundPosition === position && "bg-muted")}
                        >
                          {position.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default EmailCanvas;