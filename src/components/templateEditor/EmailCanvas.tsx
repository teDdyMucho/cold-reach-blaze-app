import { useState } from "react";
import { cn } from "@/lib/utils";
import { EmailComponent } from "@/types/email";
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

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    
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

  const handleDeleteComponent = (componentId: string) => {
    const updatedComponents = components.filter(comp => comp.id !== componentId);
    onUpdateComponents(updatedComponents);
    onSelectComponent(null);
  };

  const handleStyleChange = (property: keyof EmailStyles, value: string) => {
    onEmailStylesChange({
      ...emailStyles,
      [property]: value
    });
  };

  return (
    <div 
      className={cn(
        "email-canvas flex-1 overflow-auto",
        "flex flex-col items-center p-8"
      )}
      onClick={handleCanvasClick}
      onDragOver={handleCanvasDragOver}
      onDrop={handleCanvasDrop}
    >
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

      <div 
        className={cn(
          "bg-white shadow-md min-h-[400px] w-full max-w-3xl mx-auto overflow-hidden transition-all duration-300",
          viewMode === 'mobile' ? "max-w-sm" : "max-w-3xl"
        )}
        style={{
          backgroundColor: emailStyles.backgroundColor,
          backgroundImage: emailStyles.backgroundImage || 'none',
          backgroundSize: emailStyles.backgroundSize,
          backgroundRepeat: emailStyles.backgroundRepeat,
          backgroundPosition: emailStyles.backgroundPosition,
        }}
      >
        {components.length === 0 ? (
          <div className="h-full flex items-center justify-center p-10 text-center text-muted-foreground border-2 border-dashed">
            <div>
              <p className="mb-2">Drag and drop components here</p>
              <p className="text-sm">Or click on components in the sidebar</p>
            </div>
          </div>
        ) : (
          components.map((component, index) => (
            <div 
              key={component.id}
              className={cn(
                "relative group",
                selectedComponentId === component.id && "email-component",
                dragOverIndex === index && "component-dragging-over",
              )}
              onClick={(e) => handleComponentClick(e, component.id)}
              draggable
              onDragStart={(e) => handleComponentDragStart(e, component.id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
            >
              <EmailComponentRenderer component={component} />
              {selectedComponentId === component.id && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Component</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this component? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteComponent(component.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmailCanvas;